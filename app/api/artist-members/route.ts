import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

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
          } catch (error) {
            // setAll called from a Server Component; middleware will refresh session cookies.
          }
        }
      }
    }
  )
}

async function getAuthenticatedUser() {
  const supabase = await createSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return { supabase, user: null, error }
  }

  return { supabase, user, error: null }
}

async function getArtistProfileId(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('profile_type', 'artist')
    .maybeSingle()

  if (error) {
    return { profileId: null, error }
  }

  return { profileId: data?.id ?? null, error: null }
}

export async function GET() {
  const { supabase, user, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { profileId, error: profileError } = await getArtistProfileId(supabase, user.id)

  if (profileError) {
    console.error('Artist members GET: failed to load artist profile', profileError)
    return NextResponse.json({ error: 'Failed to load artist profile' }, { status: 500 })
  }

  if (!profileId) {
    return NextResponse.json({ data: [], artistProfileId: null })
  }

  const { data, error } = await supabase
    .from('artist_member_invitations')
    .select('id, name, email, role, status, invited_at, responded_at, metadata')
    .eq('user_id', user.id)
    .eq('artist_profile_id', profileId)
    .order('invited_at', { ascending: false })

  if (error) {
    console.error('Artist members GET: failed to fetch invitations', error)
    return NextResponse.json({ error: 'Failed to fetch member invitations' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], artistProfileId: profileId })
}

export async function POST(request: NextRequest) {
  const { supabase, user, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { profileId, error: profileError } = await getArtistProfileId(supabase, user.id)

  if (profileError) {
    console.error('Artist members POST: failed to load artist profile', profileError)
    return NextResponse.json({ error: 'Failed to load artist profile' }, { status: 500 })
  }

  if (!profileId) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 400 })
  }

  const body = await request.json()
  const {
    firstName,
    lastName,
    nickname,
    email,
    role,
    dateOfBirth,
    incomeShare,
    displayAge
  } = body ?? {}

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const trimmedFirst = typeof firstName === 'string' ? firstName.trim() : ''
  const trimmedLast = typeof lastName === 'string' ? lastName.trim() : ''
  const trimmedNickname = typeof nickname === 'string' ? nickname.trim() : ''
  const fullName = [trimmedFirst, trimmedNickname ? `"${trimmedNickname}"` : '', trimmedLast]
    .filter(Boolean)
    .join(' ')
    .trim()

  const metadata: Record<string, unknown> = {}
  if (trimmedFirst) metadata.firstName = trimmedFirst
  if (trimmedLast) metadata.lastName = trimmedLast
  if (trimmedNickname) metadata.nickname = trimmedNickname
  if (dateOfBirth) metadata.dateOfBirth = dateOfBirth
  if (incomeShare !== undefined && incomeShare !== null && incomeShare !== '') {
    const numericShare = typeof incomeShare === 'number'
      ? incomeShare
      : parseFloat(String(incomeShare))
    if (!Number.isNaN(numericShare)) {
      metadata.incomeShare = numericShare
    }
  }
  if (displayAge !== undefined) {
    metadata.displayAge = !!displayAge
  }

  const invitationToken = randomUUID()
  const invitationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

  const { data, error } = await supabase
    .from('artist_member_invitations')
    .insert({
      user_id: user.id,
      artist_profile_id: profileId,
      name: fullName || null,
      email: email.trim().toLowerCase(),
      role: role ?? null,
      status: 'pending',
      invitation_token: invitationToken,
      invitation_token_expires_at: invitationExpiresAt.toISOString(),
      metadata
    })
    .select('id, name, email, role, status, invited_at, responded_at, metadata')
    .single()

  if (error) {
    console.error('Artist members POST: failed to create invitation', error)
    return NextResponse.json({ error: 'Failed to create member invitation' }, { status: 500 })
  }

  const edgeUrlBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  if (!edgeUrlBase) {
    console.warn('Artist members POST: NEXT_PUBLIC_SITE_URL not set, skipping email send')
  } else {
    const edgeResponse = await fetch(`${edgeUrlBase}/functions/v1/send-member-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      token: invitationToken,
      role: role ?? null,
      name: fullName || null,
      artistName: data?.name ?? null,
      invitedBy: user.email ?? undefined,
      expiresAt: invitationExpiresAt.toISOString()
    })
  })

    if (!edgeResponse.ok) {
      console.warn('Artist members POST: send-member-invite edge function returned non-200', edgeResponse.status)
    }
  }

  return NextResponse.json({ success: true, data })
}

export async function DELETE(request: NextRequest) {
  const { supabase, user, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id } = body ?? {}

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invitation id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('artist_member_invitations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Artist members DELETE: failed to delete invitation', error)
    return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

