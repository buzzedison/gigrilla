import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // ignore when called from a server component
            }
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const publishIds = Array.isArray(body?.invitationIds)
      ? body.invitationIds.filter((val: unknown): val is string => typeof val === 'string')
      : []

    if (publishIds.length === 0) {
      return NextResponse.json({ error: 'No invitation IDs provided' }, { status: 400 })
    }

    const { data: profileRow, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('profile_type', 'artist')
      .maybeSingle()

    if (profileError) {
      console.error('Publish members: failed to load artist profile', profileError)
      return NextResponse.json({ error: 'Failed to load artist profile' }, { status: 500 })
    }

    const profileId = profileRow?.id

    if (!profileId) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 400 })
    }

    const { data: invitations, error: fetchError } = await supabase
      .from('artist_member_invitations')
      .select('*')
      .in('id', publishIds)
      .eq('user_id', user.id)
      .eq('artist_profile_id', profileId)

    if (fetchError) {
      console.error('Publish members: failed to load invitations', fetchError)
      return NextResponse.json({ error: 'Failed to load invitations' }, { status: 500 })
    }

    const acceptedInvites = (invitations ?? []).filter(invite => invite.status === 'accepted')

    if (acceptedInvites.length === 0) {
      return NextResponse.json({ error: 'No accepted invitations to publish' }, { status: 400 })
    }

    const activeRecords = acceptedInvites.map(invite => ({
      artist_profile_id: profileId,
      invitation_id: invite.id,
      name: invite.name ?? null,
      email: invite.email,
      roles: Array.isArray(invite.roles)
        ? invite.roles.filter((val: unknown): val is string => typeof val === 'string')
        : invite.role
          ? [invite.role]
          : [],
      metadata: invite.metadata ?? {}
    }))

    const { data: inserted, error: insertError } = await supabase
      .from('artist_members_active')
      .insert(activeRecords)
      .select('*')

    if (insertError) {
      console.error('Publish members: failed to insert active members', insertError)
      return NextResponse.json({ error: 'Failed to publish members' }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from('artist_member_invitations')
      .update({ status: 'active' })
      .in('id', acceptedInvites.map(invite => invite.id))

    if (updateError) {
      console.error('Publish members: failed to update invitations', updateError)
      return NextResponse.json({ error: 'Failed to finalize published members' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: inserted })
  } catch (error) {
    console.error('Publish members: unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

