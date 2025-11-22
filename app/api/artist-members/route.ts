import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { getAuthenticatedUser, getArtistProfile } from './utils'
import { sendArtistMemberInviteEmail } from '../../../lib/send-member-invite'

export async function GET() {
  const { supabase, user, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { profile, error: profileError } = await getArtistProfile(supabase, user.id)

  if (profileError) {
    console.error('Artist members GET: failed to load artist profile', profileError)
    return NextResponse.json({ error: 'Failed to load artist profile' }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json({ invitations: [], activeMembers: [], artistProfileId: null, primaryRoles: [] })
  }

  const { id: profileId, artist_primary_roles: primaryRoles, stage_name } = profile

  const { data, error } = await supabase
    .from('artist_member_invitations')
    .select('id, name, email, role, roles, status, invited_at, responded_at, metadata')
    .eq('user_id', user.id)
    .eq('artist_profile_id', profileId)
    .order('invited_at', { ascending: false })

  if (error) {
    console.error('Artist members GET: failed to fetch invitations', error)
    return NextResponse.json({ error: 'Failed to fetch member invitations' }, { status: 500 })
  }

  const { data: activeMembers, error: activeError } = await supabase
    .from('artist_members_active')
    .select('id, invitation_id, name, email, roles, metadata, joined_at')
    .eq('artist_profile_id', profileId)
    .order('joined_at', { ascending: true })

  if (activeError) {
    console.error('Artist members GET: failed to fetch active members', activeError)
  }

  return NextResponse.json({
    invitations: data ?? [],
    data: data ?? [],
    activeMembers: activeMembers ?? [],
    artistProfileId: profileId,
    primaryRoles: primaryRoles ?? [],
    artistName: stage_name ?? null
  })
}

export async function POST(request: NextRequest) {
  const { supabase, user, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { profile, error: profileError } = await getArtistProfile(supabase, user.id)

  if (profileError) {
    console.error('Artist members POST: failed to load artist profile', profileError)
    return NextResponse.json({ error: 'Failed to load artist profile' }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 400 })
  }

  const body = await request.json()
  const {
    firstName,
    lastName,
    nickname,
    email,
    role,
    roles,
    dateOfBirth,
    incomeShare,
    displayAge,
    gigRoyaltyShare,
    musicRoyaltyShare,
    isAdmin
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
  if (gigRoyaltyShare !== undefined && gigRoyaltyShare !== null && gigRoyaltyShare !== '') {
    const numericGigShare = typeof gigRoyaltyShare === 'number'
      ? gigRoyaltyShare
      : parseFloat(String(gigRoyaltyShare))
    if (!Number.isNaN(numericGigShare)) {
      metadata.gigRoyaltyShare = numericGigShare
    }
  }
  if (musicRoyaltyShare !== undefined && musicRoyaltyShare !== null && musicRoyaltyShare !== '') {
    const numericMusicShare = typeof musicRoyaltyShare === 'number'
      ? musicRoyaltyShare
      : parseFloat(String(musicRoyaltyShare))
    if (!Number.isNaN(numericMusicShare)) {
      metadata.musicRoyaltyShare = numericMusicShare
    }
  }
  if (isAdmin !== undefined) {
    metadata.isAdmin = !!isAdmin
  }

  const invitationToken = randomUUID()
  const invitationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

  const { data, error } = await supabase
    .from('artist_member_invitations')
    .insert({
      user_id: user.id,
      artist_profile_id: profile.id,
      name: fullName || null,
      email: email.trim().toLowerCase(),
      role: role ?? null,
      roles: Array.isArray(roles)
        ? roles.filter((val: unknown): val is string => typeof val === 'string' && val.trim().length > 0)
        : [],
      status: 'pending',
    invitation_token: invitationToken,
    invitation_token_expires_at: invitationExpiresAt.toISOString(),
      metadata
    })
    .select('id, name, email, role, roles, status, invited_at, responded_at, metadata')
    .single()

  if (error) {
    console.error('Artist members POST: failed to create invitation', error)
    return NextResponse.json({ error: 'Failed to create member invitation' }, { status: 500 })
  }

  const ownerRoles = Array.isArray(profile.artist_primary_roles)
    ? profile.artist_primary_roles.filter((val: unknown): val is string => typeof val === 'string' && val.trim().length > 0)
    : []

  const rolesPayload = Array.isArray(roles)
    ? roles.filter((val: unknown): val is string => typeof val === 'string' && val.trim().length > 0)
    : undefined

  try {
    const emailResult = await sendArtistMemberInviteEmail({
      email: email.trim().toLowerCase(),
      token: invitationToken,
      role: role ?? null,
      roles: rolesPayload ?? null,
      name: fullName || null,
      artistName: profile.stage_name ?? null,
      invitedBy: user.email ?? undefined,
      ownerRoles,
      expiresAt: invitationExpiresAt.toISOString()
    })
    console.log('📬 Email send result:', emailResult)
  } catch (functionError) {
    console.error('❌ Artist members POST: failed to send invite email via Resend', functionError)

    await supabase
      .from('artist_member_invitations')
      .delete()
      .eq('id', data.id)
      .eq('user_id', user.id)
      .eq('artist_profile_id', profile.id)

    return NextResponse.json({ error: 'Failed to send invitation email. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data, message: 'Invitation sent' })
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

export async function PATCH(request: NextRequest) {
  const { supabase, user, error: authError } = await getAuthenticatedUser()

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

  const { profile, error: profileError } = await getArtistProfile(supabase, user.id)

  if (profileError) {
    console.error('Artist members PATCH: failed to load artist profile', profileError)
    return NextResponse.json({ error: 'Failed to load artist profile' }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 400 })
  }

  const { data: invitations, error: fetchError } = await supabase
    .from('artist_member_invitations')
    .select('*')
    .in('id', publishIds)
    .eq('user_id', user.id)
    .eq('artist_profile_id', profile.id)

  if (fetchError) {
    console.error('Artist members PATCH: failed to fetch invitations', fetchError)
    return NextResponse.json({ error: 'Failed to load invitations' }, { status: 500 })
  }

  const acceptedInvites = (invitations ?? []).filter(invite => invite.status === 'accepted')

  if (acceptedInvites.length === 0) {
    return NextResponse.json({ error: 'No accepted invitations to publish' }, { status: 400 })
  }

  const activeRecords = acceptedInvites.map(invite => ({
    artist_profile_id: profile.id,
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
    console.error('Artist members PATCH: failed to insert active members', insertError)
    return NextResponse.json({ error: 'Failed to publish members' }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from('artist_member_invitations')
    .update({ status: 'active' })
    .in('id', acceptedInvites.map(invite => invite.id))

  if (updateError) {
    console.error('Artist members PATCH: failed to update invitation status', updateError)
    return NextResponse.json({ error: 'Failed to finalize published members' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: inserted })
}

export async function PUT(request: NextRequest) {
  const { supabase, user, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { profile, error: profileError } = await getArtistProfile(supabase, user.id)

  if (profileError) {
    console.error('Artist members PUT: failed to load artist profile', profileError)
    return NextResponse.json({ error: 'Failed to load artist profile' }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 400 })
  }

  const body = await request.json()
  const { memberId, gigRoyaltyShare, musicRoyaltyShare, isAdmin } = body ?? {}

  if (!memberId || typeof memberId !== 'string') {
    return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
  }

  try {
    // First try to update in invitations table
    const { data: invitationData, error: invitationError } = await supabase
      .from('artist_member_invitations')
      .select('metadata')
      .eq('id', memberId)
      .eq('user_id', user.id)
      .eq('artist_profile_id', profile.id)
      .single()

    if (!invitationError && invitationData) {
      // Update invitation metadata
      const updatedMetadata = { ...invitationData.metadata }
      
      if (gigRoyaltyShare !== undefined) {
        const numericGigShare = typeof gigRoyaltyShare === 'number'
          ? gigRoyaltyShare
          : parseFloat(String(gigRoyaltyShare))
        if (!Number.isNaN(numericGigShare)) {
          updatedMetadata.gigRoyaltyShare = numericGigShare
        }
      }
      
      if (musicRoyaltyShare !== undefined) {
        const numericMusicShare = typeof musicRoyaltyShare === 'number'
          ? musicRoyaltyShare
          : parseFloat(String(musicRoyaltyShare))
        if (!Number.isNaN(numericMusicShare)) {
          updatedMetadata.musicRoyaltyShare = numericMusicShare
        }
      }
      
      if (isAdmin !== undefined) {
        updatedMetadata.isAdmin = !!isAdmin
      }

      const { data, error } = await supabase
        .from('artist_member_invitations')
        .update({ metadata: updatedMetadata })
        .eq('id', memberId)
        .eq('user_id', user.id)
        .eq('artist_profile_id', profile.id)
        .select('id, name, email, role, roles, status, invited_at, responded_at, metadata')
        .single()

      if (error) {
        console.error('Artist members PUT: failed to update invitation', error)
        return NextResponse.json({ error: 'Failed to update member royalty splits' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    // If not found in invitations, try active members table
    const { data: activeData, error: activeError } = await supabase
      .from('artist_members_active')
      .select('metadata')
      .eq('id', memberId)
      .eq('artist_profile_id', profile.id)
      .single()

    if (!activeError && activeData) {
      // Update active member metadata
      const updatedMetadata = { ...activeData.metadata }
      
      if (gigRoyaltyShare !== undefined) {
        const numericGigShare = typeof gigRoyaltyShare === 'number'
          ? gigRoyaltyShare
          : parseFloat(String(gigRoyaltyShare))
        if (!Number.isNaN(numericGigShare)) {
          updatedMetadata.gigRoyaltyShare = numericGigShare
        }
      }
      
      if (musicRoyaltyShare !== undefined) {
        const numericMusicShare = typeof musicRoyaltyShare === 'number'
          ? musicRoyaltyShare
          : parseFloat(String(musicRoyaltyShare))
        if (!Number.isNaN(numericMusicShare)) {
          updatedMetadata.musicRoyaltyShare = numericMusicShare
        }
      }
      
      if (isAdmin !== undefined) {
        updatedMetadata.isAdmin = !!isAdmin
      }

      const { data, error } = await supabase
        .from('artist_members_active')
        .update({ metadata: updatedMetadata, updated_at: new Date().toISOString() })
        .eq('id', memberId)
        .eq('artist_profile_id', profile.id)
        .select('id, invitation_id, name, email, roles, metadata, joined_at')
        .single()

      if (error) {
        console.error('Artist members PUT: failed to update active member', error)
        return NextResponse.json({ error: 'Failed to update member royalty splits' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  } catch (error) {
    console.error('Artist members PUT: unexpected error', error)
    return NextResponse.json({ error: 'Failed to update member royalty splits' }, { status: 500 })
  }
}

