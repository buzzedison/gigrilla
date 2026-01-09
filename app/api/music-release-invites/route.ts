import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { sendReleaseInviteEmail } from '@/lib/send-release-invite'

// Helper to create Supabase client
async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
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
            // Ignore
          }
        },
      },
    }
  )
}

// POST - Send a new invitation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      releaseId,
      invitationType,
      organizationName,
      contactEmail,
      contactName,
      customMessage
    } = body

    // Validate required fields
    if (!releaseId || !invitationType || !organizationName || !contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: releaseId, invitationType, organizationName, contactEmail' },
        { status: 400 }
      )
    }

    // Validate invitation type
    const validTypes = ['distributor', 'pro', 'mcs', 'label', 'publisher']
    if (!validTypes.includes(invitationType)) {
      return NextResponse.json(
        { error: `Invalid invitation type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify the release belongs to the user
    const { data: release, error: releaseError } = await supabase
      .from('music_releases')
      .select('id, release_title, user_id')
      .eq('id', releaseId)
      .eq('user_id', user.id)
      .single()

    if (releaseError || !release) {
      return NextResponse.json(
        { error: 'Release not found or you do not have permission to invite collaborators' },
        { status: 404 }
      )
    }

    // Check if invitation already exists
    const { data: existingInvite } = await supabase
      .from('music_release_invitations')
      .select('id, status')
      .eq('release_id', releaseId)
      .eq('invitation_type', invitationType)
      .eq('contact_email', contactEmail)
      .maybeSingle()

    if (existingInvite && existingInvite.status === 'accepted') {
      return NextResponse.json(
        { error: 'An invitation to this organization has already been accepted' },
        { status: 400 }
      )
    }

    if (existingInvite && existingInvite.status === 'sent') {
      return NextResponse.json(
        { error: 'An invitation to this organization is already pending. Please wait for a response.' },
        { status: 400 }
      )
    }

    // Generate invitation token and expiry (7 days)
    const invitationToken = randomUUID()
    const invitationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    const nowIso = new Date().toISOString()

    // Get artist profile for email
    const { data: profile } = await supabase
      .from('artist_profiles')
      .select('stage_name')
      .eq('user_id', user.id)
      .maybeSingle()

    const artistName = profile?.stage_name || user.email?.split('@')[0] || 'Gigrilla Artist'

    // Create or update invitation
    const invitationData = {
      release_id: releaseId,
      user_id: user.id,
      invitation_type: invitationType,
      organization_name: organizationName,
      contact_email: contactEmail,
      contact_name: contactName || null,
      custom_message: customMessage || null,
      invitation_token: invitationToken,
      invitation_token_expires_at: invitationExpiresAt.toISOString(),
      invited_at: nowIso,
      status: 'sent'
    }

    let savedInvitation

    if (existingInvite) {
      // Update existing invitation
      const { data, error } = await supabase
        .from('music_release_invitations')
        .update(invitationData)
        .eq('id', existingInvite.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating invitation:', error)
        return NextResponse.json(
          { error: 'Failed to update invitation' },
          { status: 500 }
        )
      }
      savedInvitation = data
    } else {
      // Create new invitation
      const { data, error } = await supabase
        .from('music_release_invitations')
        .insert(invitationData)
        .select()
        .single()

      if (error) {
        console.error('Error creating invitation:', error)
        return NextResponse.json(
          { error: 'Failed to create invitation' },
          { status: 500 }
        )
      }
      savedInvitation = data
    }

    // Send email via Resend
    try {
      await sendReleaseInviteEmail({
        email: contactEmail,
        token: invitationToken,
        invitationType,
        organizationName,
        contactName,
        customMessage,
        releaseTitle: release.release_title,
        artistName,
        invitedBy: user.email || undefined,
        expiresAt: invitationExpiresAt.toISOString()
      })
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)

      // Update invitation status to indicate email failed
      await supabase
        .from('music_release_invitations')
        .update({ status: 'pending' })
        .eq('id', savedInvitation.id)

      return NextResponse.json(
        { error: 'Invitation created but email failed to send. Please try resending.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: savedInvitation.id,
        invitation_type: savedInvitation.invitation_type,
        organization_name: savedInvitation.organization_name,
        contact_email: savedInvitation.contact_email,
        status: savedInvitation.status,
        invited_at: savedInvitation.invited_at
      },
      message: `Invitation sent successfully to ${organizationName}`
    })

  } catch (error) {
    console.error('Music release invite API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Fetch invitations for a release
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const releaseId = searchParams.get('releaseId')

    if (!releaseId) {
      return NextResponse.json(
        { error: 'releaseId parameter is required' },
        { status: 400 }
      )
    }

    // Verify the release belongs to the user
    const { data: release, error: releaseError } = await supabase
      .from('music_releases')
      .select('id')
      .eq('id', releaseId)
      .eq('user_id', user.id)
      .single()

    if (releaseError || !release) {
      return NextResponse.json(
        { error: 'Release not found or unauthorized' },
        { status: 404 }
      )
    }

    // Fetch invitations
    const { data: invitations, error } = await supabase
      .from('music_release_invitations')
      .select('*')
      .eq('release_id', releaseId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invitations
    })

  } catch (error) {
    console.error('Music release invite GET error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
