import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { getAuthenticatedUser, getArtistProfile } from './utils'
import { sendArtistMemberInviteEmail } from '../../../lib/send-member-invite'

type SupabaseClient = Awaited<ReturnType<typeof getAuthenticatedUser>>['supabase']

const asRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
)

const toTrimmedString = (value: unknown) => typeof value === 'string' ? value.trim() : ''

const buildMemberDisplayName = (
  firstName: unknown,
  nickname: unknown,
  lastName: unknown,
  fallback = ''
) => {
  const trimmedFirst = toTrimmedString(firstName)
  const trimmedNickname = toTrimmedString(nickname)
  const trimmedLast = toTrimmedString(lastName)

  return [trimmedFirst, trimmedNickname ? `"${trimmedNickname}"` : '', trimmedLast]
    .filter(Boolean)
    .join(' ')
    .trim() || fallback
}

async function clearOtherMainContacts(
  supabase: SupabaseClient,
  userId: string,
  artistProfileId: string,
  targetMemberId: string
) {
  const clearRequests: PromiseLike<unknown>[] = []

  const { data: profileRow, error: profileFetchError } = await supabase
    .from('user_profiles')
    .select('location_details')
    .eq('id', artistProfileId)
    .eq('user_id', userId)
    .eq('profile_type', 'artist')
    .maybeSingle()

  if (profileFetchError) {
    throw profileFetchError
  }

  const locationDetails = asRecord(profileRow?.location_details)
  if (locationDetails.artist_owner_is_main_contact === true && targetMemberId !== `owner:${userId}`) {
    clearRequests.push(
      supabase
        .from('user_profiles')
        .update({
          location_details: {
            ...locationDetails,
            artist_owner_is_main_contact: false
          }
        })
        .eq('id', artistProfileId)
        .eq('user_id', userId)
    )
  }

  const { data: invitations, error: invitationsError } = await supabase
    .from('artist_member_invitations')
    .select('id, metadata')
    .eq('user_id', userId)
    .eq('artist_profile_id', artistProfileId)

  if (invitationsError) {
    throw invitationsError
  }

  for (const invitation of invitations ?? []) {
    const metadata = asRecord(invitation.metadata)
    if (invitation.id !== targetMemberId && metadata.isMainContact === true) {
      clearRequests.push(
        supabase
          .from('artist_member_invitations')
          .update({ metadata: { ...metadata, isMainContact: false } })
          .eq('id', invitation.id)
          .eq('user_id', userId)
          .eq('artist_profile_id', artistProfileId)
      )
    }
  }

  const { data: activeMembers, error: activeMembersError } = await supabase
    .from('artist_members_active')
    .select('id, metadata')
    .eq('artist_profile_id', artistProfileId)

  if (activeMembersError) {
    throw activeMembersError
  }

  for (const activeMember of activeMembers ?? []) {
    const metadata = asRecord(activeMember.metadata)
    if (activeMember.id !== targetMemberId && metadata.isMainContact === true) {
      clearRequests.push(
        supabase
          .from('artist_members_active')
          .update({
            metadata: { ...metadata, isMainContact: false },
            updated_at: new Date().toISOString()
          })
          .eq('id', activeMember.id)
          .eq('artist_profile_id', artistProfileId)
      )
    }
  }

  const results = await Promise.all(clearRequests)
  const failed = results.find((result) => {
    return Boolean(
      result &&
      typeof result === 'object' &&
      'error' in result &&
      (result as { error?: unknown }).error
    )
  })

  if (failed && typeof failed === 'object' && 'error' in failed) {
    throw (failed as { error: unknown }).error
  }
}

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
    phone,
    phoneCountryCode,
    role,
    roles,
    dateOfBirth,
    incomeShare,
    displayAge,
    gigRoyaltyShare,
    merchRoyaltyShare,
    musicRoyaltyShare,
    isAdmin,
    memberType,
    performerIsni,
    performerIpn,
    creatorIpiCae,
    isPerformer,
    isShareholder,
    isMainContact,
    memberSince,
    isCurrentMember,
    dateLeft
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
  if (typeof phone === 'string' && phone.trim().length > 0) metadata.phone = phone.trim()
  if (typeof phoneCountryCode === 'string' && phoneCountryCode.trim().length > 0) metadata.phoneCountryCode = phoneCountryCode.trim()
  if (dateOfBirth) metadata.dateOfBirth = dateOfBirth
  if (memberType === 'performer' || memberType === 'support') metadata.memberType = memberType
  if (isPerformer !== undefined) {
    metadata.isPerformer = !!isPerformer
  } else if (memberType === 'performer') {
    metadata.isPerformer = true
  }
  if (typeof performerIsni === 'string' && performerIsni.trim().length > 0) metadata.performerIsni = performerIsni.trim()
  if (typeof performerIpn === 'string' && performerIpn.trim().length > 0) metadata.performerIpn = performerIpn.trim()
  if (typeof creatorIpiCae === 'string' && creatorIpiCae.trim().length > 0) metadata.creatorIpiCae = creatorIpiCae.trim()
  if (isShareholder !== undefined) metadata.isShareholder = !!isShareholder
  if (isMainContact !== undefined) metadata.isMainContact = !!isMainContact
  if (typeof memberSince === 'string' && memberSince.trim().length > 0) metadata.memberSince = memberSince.trim()
  if (isCurrentMember !== undefined) metadata.isCurrentMember = !!isCurrentMember
  if (typeof dateLeft === 'string' && dateLeft.trim().length > 0) metadata.dateLeft = dateLeft.trim()
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
  if (merchRoyaltyShare !== undefined && merchRoyaltyShare !== null && merchRoyaltyShare !== '') {
    const numericMerchShare = typeof merchRoyaltyShare === 'number'
      ? merchRoyaltyShare
      : parseFloat(String(merchRoyaltyShare))
    if (!Number.isNaN(numericMerchShare)) {
      metadata.merchRoyaltyShare = numericMerchShare
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

  if (metadata.isMainContact === true) {
    try {
      await clearOtherMainContacts(supabase, user.id, profile.id, data.id)
    } catch (mainContactError) {
      console.error('Artist members POST: failed to enforce single main contact', mainContactError)
      return NextResponse.json({ error: 'Failed to switch main contact' }, { status: 500 })
    }
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

    // Mark as sent when email dispatch succeeds
    await supabase
      .from('artist_member_invitations')
      .update({
        status: 'sent',
        metadata: {
          ...(data.metadata && typeof data.metadata === 'object' ? data.metadata as Record<string, unknown> : {}),
          inviteEmailStatus: 'sent',
          inviteEmailLastAttemptAt: new Date().toISOString()
        }
      })
      .eq('id', data.id)
      .eq('user_id', user.id)
      .eq('artist_profile_id', profile.id)
  } catch (functionError) {
    console.error('❌ Artist members POST: failed to send invite email via Resend', functionError)

    const updatedMetadata = {
      ...(data.metadata && typeof data.metadata === 'object' ? data.metadata as Record<string, unknown> : {}),
      inviteEmailStatus: 'failed',
      inviteEmailLastAttemptAt: new Date().toISOString()
    }

    await supabase
      .from('artist_member_invitations')
      .update({
        status: 'pending',
        metadata: updatedMetadata
      })
      .eq('id', data.id)
      .eq('user_id', user.id)
      .eq('artist_profile_id', profile.id)

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        metadata: updatedMetadata
      },
      warning: 'Invitation saved, but we could not send the email right now. You can resend it from Manage Team.'
    })
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
  const {
    memberId,
    email,
    gigRoyaltyShare,
    merchRoyaltyShare,
    musicRoyaltyShare,
    isAdmin,
    roles,
    firstName,
    lastName,
    nickname,
    phone,
    phoneCountryCode,
    performerIsni,
    performerIpn,
    creatorIpiCae,
    memberType,
    isPerformer,
    isShareholder,
    isMainContact,
    memberSince,
    isCurrentMember,
    dateLeft
  } = body ?? {}

  if (!memberId || typeof memberId !== 'string') {
    return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
  }

  try {
    if (memberId === `${profile.id}-profile-owner`) {
      const locationDetails = asRecord(profile.location_details)
      const updatedLocationDetails = { ...locationDetails }

      if (typeof firstName === 'string') updatedLocationDetails.artist_owner_first_name = firstName.trim()
      if (typeof lastName === 'string') updatedLocationDetails.artist_owner_last_name = lastName.trim()
      if (typeof nickname === 'string') updatedLocationDetails.artist_owner_nickname = nickname.trim()
      if (typeof email === 'string') updatedLocationDetails.artist_owner_email = email.trim().toLowerCase()
      if (typeof phone === 'string') updatedLocationDetails.artist_owner_phone = phone.trim()
      if (typeof phoneCountryCode === 'string') updatedLocationDetails.artist_owner_phone_country_code = phoneCountryCode.trim()
      if (typeof performerIpn === 'string') updatedLocationDetails.artist_owner_performer_ipn = performerIpn.trim()
      if (isPerformer !== undefined) updatedLocationDetails.artist_owner_is_performer = !!isPerformer
      if (isShareholder !== undefined) updatedLocationDetails.artist_owner_is_shareholder = !!isShareholder
      if (isMainContact !== undefined) updatedLocationDetails.artist_owner_is_main_contact = !!isMainContact
      if (typeof memberSince === 'string') updatedLocationDetails.artist_owner_member_since = memberSince.trim()
      if (isCurrentMember !== undefined) updatedLocationDetails.artist_owner_status = isCurrentMember === false ? 'previous' : 'current'
      if (typeof dateLeft === 'string') updatedLocationDetails.artist_owner_date_left = dateLeft.trim()
      updatedLocationDetails.artist_owner_is_admin = true

      const ownerUpdate: Record<string, unknown> = {
        location_details: updatedLocationDetails,
        updated_at: new Date().toISOString()
      }

      if (Array.isArray(roles)) {
        ownerUpdate.artist_primary_roles = roles.filter((v: unknown): v is string => typeof v === 'string' && v.trim().length > 0)
      }
      if (typeof performerIsni === 'string') ownerUpdate.performer_isni = performerIsni.trim()
      if (typeof creatorIpiCae === 'string') ownerUpdate.creator_ipi_cae = creatorIpiCae.trim()

      const { data, error } = await supabase
        .from('user_profiles')
        .update(ownerUpdate)
        .eq('id', profile.id)
        .eq('user_id', user.id)
        .eq('profile_type', 'artist')
        .select('id, artist_primary_roles, location_details, performer_isni, creator_ipi_cae, created_at')
        .single()

      if (error) {
        console.error('Artist members PUT: failed to update profile owner', error)
        return NextResponse.json({ error: 'Failed to update profile owner details' }, { status: 500 })
      }

      if (updatedLocationDetails.artist_owner_is_main_contact === true) {
        try {
          await clearOtherMainContacts(supabase, user.id, profile.id, `owner:${user.id}`)
        } catch (mainContactError) {
          console.error('Artist members PUT: failed to enforce single main contact for profile owner', mainContactError)
          return NextResponse.json({ error: 'Failed to switch main contact' }, { status: 500 })
        }
      }

      const responseLocationDetails = asRecord(data.location_details)
      const ownerFirstName = toTrimmedString(responseLocationDetails.artist_owner_first_name)
      const ownerLastName = toTrimmedString(responseLocationDetails.artist_owner_last_name)
      const ownerNickname = toTrimmedString(responseLocationDetails.artist_owner_nickname)
      const ownerEmail = toTrimmedString(responseLocationDetails.artist_owner_email) || user.email || ''

      return NextResponse.json({
        success: true,
        data: {
          id: `${profile.id}-profile-owner`,
          invitation_id: null,
          name: buildMemberDisplayName(ownerFirstName, ownerNickname, ownerLastName, ownerEmail || 'Profile Owner'),
          email: ownerEmail,
          roles: Array.isArray(data.artist_primary_roles) ? data.artist_primary_roles : [],
          metadata: {
            firstName: ownerFirstName,
            lastName: ownerLastName,
            nickname: ownerNickname,
            memberType: 'performer',
            isPerformer: responseLocationDetails.artist_owner_is_performer !== false,
            performerIsni: data.performer_isni || '',
            performerIpn: toTrimmedString(responseLocationDetails.artist_owner_performer_ipn),
            creatorIpiCae: data.creator_ipi_cae || '',
            isShareholder: responseLocationDetails.artist_owner_is_shareholder === true,
            isMainContact: responseLocationDetails.artist_owner_is_main_contact === true,
            memberSince: toTrimmedString(responseLocationDetails.artist_owner_member_since),
            isCurrentMember: responseLocationDetails.artist_owner_status !== 'previous',
            dateLeft: toTrimmedString(responseLocationDetails.artist_owner_date_left),
            isAdmin: true
          },
          joined_at: data.created_at ?? null
        }
      })
    }

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

      if (merchRoyaltyShare !== undefined) {
        const numericMerchShare = typeof merchRoyaltyShare === 'number'
          ? merchRoyaltyShare
          : parseFloat(String(merchRoyaltyShare))
        if (!Number.isNaN(numericMerchShare)) {
          updatedMetadata.merchRoyaltyShare = numericMerchShare
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
      if (typeof firstName === 'string') updatedMetadata.firstName = firstName.trim()
      if (typeof lastName === 'string') updatedMetadata.lastName = lastName.trim()
      if (typeof nickname === 'string') updatedMetadata.nickname = nickname.trim()
      if (typeof phone === 'string') updatedMetadata.phone = phone.trim()
      if (typeof phoneCountryCode === 'string') updatedMetadata.phoneCountryCode = phoneCountryCode.trim()
      if (typeof performerIsni === 'string') updatedMetadata.performerIsni = performerIsni.trim()
      if (typeof performerIpn === 'string') updatedMetadata.performerIpn = performerIpn.trim()
      if (typeof creatorIpiCae === 'string') updatedMetadata.creatorIpiCae = creatorIpiCae.trim()
      if (memberType === 'performer' || memberType === 'support') updatedMetadata.memberType = memberType
      if (isPerformer !== undefined) updatedMetadata.isPerformer = !!isPerformer
      if (isShareholder !== undefined) updatedMetadata.isShareholder = !!isShareholder
      if (isMainContact !== undefined) updatedMetadata.isMainContact = !!isMainContact
      if (typeof memberSince === 'string') updatedMetadata.memberSince = memberSince.trim()
      if (isCurrentMember !== undefined) updatedMetadata.isCurrentMember = !!isCurrentMember
      if (typeof dateLeft === 'string') updatedMetadata.dateLeft = dateLeft.trim()

      const invitationUpdate: Record<string, unknown> = { metadata: updatedMetadata }
      const updatedName = buildMemberDisplayName(updatedMetadata.firstName, updatedMetadata.nickname, updatedMetadata.lastName)
      const updatedEmail = toTrimmedString(email).toLowerCase()
      if (updatedName) invitationUpdate.name = updatedName
      if (updatedEmail) invitationUpdate.email = updatedEmail
      if (Array.isArray(roles)) {
        invitationUpdate.roles = roles.filter((v: unknown): v is string => typeof v === 'string' && v.trim().length > 0)
      }

      const { data, error } = await supabase
        .from('artist_member_invitations')
        .update(invitationUpdate)
        .eq('id', memberId)
        .eq('user_id', user.id)
        .eq('artist_profile_id', profile.id)
        .select('id, name, email, role, roles, status, invited_at, responded_at, metadata')
        .single()

      if (error) {
        console.error('Artist members PUT: failed to update invitation', error)
        return NextResponse.json({ error: 'Failed to update member royalty splits' }, { status: 500 })
      }

      if (updatedMetadata.isMainContact === true) {
        try {
          await clearOtherMainContacts(supabase, user.id, profile.id, memberId)
        } catch (mainContactError) {
          console.error('Artist members PUT: failed to enforce single main contact for invitation', mainContactError)
          return NextResponse.json({ error: 'Failed to switch main contact' }, { status: 500 })
        }
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

      if (merchRoyaltyShare !== undefined) {
        const numericMerchShare = typeof merchRoyaltyShare === 'number'
          ? merchRoyaltyShare
          : parseFloat(String(merchRoyaltyShare))
        if (!Number.isNaN(numericMerchShare)) {
          updatedMetadata.merchRoyaltyShare = numericMerchShare
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
      if (typeof firstName === 'string') updatedMetadata.firstName = firstName.trim()
      if (typeof lastName === 'string') updatedMetadata.lastName = lastName.trim()
      if (typeof nickname === 'string') updatedMetadata.nickname = nickname.trim()
      if (typeof phone === 'string') updatedMetadata.phone = phone.trim()
      if (typeof phoneCountryCode === 'string') updatedMetadata.phoneCountryCode = phoneCountryCode.trim()
      if (typeof performerIsni === 'string') updatedMetadata.performerIsni = performerIsni.trim()
      if (typeof performerIpn === 'string') updatedMetadata.performerIpn = performerIpn.trim()
      if (typeof creatorIpiCae === 'string') updatedMetadata.creatorIpiCae = creatorIpiCae.trim()
      if (memberType === 'performer' || memberType === 'support') updatedMetadata.memberType = memberType
      if (isPerformer !== undefined) updatedMetadata.isPerformer = !!isPerformer
      if (isShareholder !== undefined) updatedMetadata.isShareholder = !!isShareholder
      if (isMainContact !== undefined) updatedMetadata.isMainContact = !!isMainContact
      if (typeof memberSince === 'string') updatedMetadata.memberSince = memberSince.trim()
      if (isCurrentMember !== undefined) updatedMetadata.isCurrentMember = !!isCurrentMember
      if (typeof dateLeft === 'string') updatedMetadata.dateLeft = dateLeft.trim()

      const activeUpdate: Record<string, unknown> = { metadata: updatedMetadata, updated_at: new Date().toISOString() }
      const updatedName = buildMemberDisplayName(updatedMetadata.firstName, updatedMetadata.nickname, updatedMetadata.lastName)
      const updatedEmail = toTrimmedString(email).toLowerCase()
      if (updatedName) activeUpdate.name = updatedName
      if (updatedEmail) activeUpdate.email = updatedEmail
      if (Array.isArray(roles)) {
        activeUpdate.roles = roles.filter((v: unknown): v is string => typeof v === 'string' && v.trim().length > 0)
      }

      const { data, error } = await supabase
        .from('artist_members_active')
        .update(activeUpdate)
        .eq('id', memberId)
        .eq('artist_profile_id', profile.id)
        .select('id, invitation_id, name, email, roles, metadata, joined_at')
        .single()

      if (error) {
        console.error('Artist members PUT: failed to update active member', error)
        return NextResponse.json({ error: 'Failed to update member royalty splits' }, { status: 500 })
      }

      if (updatedMetadata.isMainContact === true) {
        try {
          await clearOtherMainContacts(supabase, user.id, profile.id, memberId)
        } catch (mainContactError) {
          console.error('Artist members PUT: failed to enforce single main contact for active member', mainContactError)
          return NextResponse.json({ error: 'Failed to switch main contact' }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  } catch (error) {
    console.error('Artist members PUT: unexpected error', error)
    return NextResponse.json({ error: 'Failed to update member royalty splits' }, { status: 500 })
  }
}
