import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { getAuthenticatedUser, getArtistProfile } from '../utils'

export async function POST(request: NextRequest) {
  const { supabase, user, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const invitationId = typeof body?.invitationId === 'string'
    ? body.invitationId
    : typeof body?.id === 'string'
      ? body.id
      : ''

  if (!invitationId) {
    return NextResponse.json({ error: 'Invitation id is required' }, { status: 400 })
  }

  const { profile, error: profileError } = await getArtistProfile(supabase, user.id)

  if (profileError) {
    console.error('Artist members resend: failed to load artist profile', profileError)
    return NextResponse.json({ error: 'Failed to load artist profile' }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 400 })
  }

  const { data: invitation, error: invitationError } = await supabase
    .from('artist_member_invitations')
    .select('*')
    .eq('id', invitationId)
    .eq('user_id', user.id)
    .eq('artist_profile_id', profile.id)
    .maybeSingle()

  if (invitationError) {
    console.error('Artist members resend: failed to fetch invitation', invitationError)
    return NextResponse.json({ error: 'Failed to load invitation' }, { status: 500 })
  }

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }

  if (!['pending', 'sent', 'declined'].includes(invitation.status)) {
    return NextResponse.json({ error: `Cannot resend invitation with status ${invitation.status}` }, { status: 400 })
  }

  const invitationToken = randomUUID()
  const invitationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  const nowIso = new Date().toISOString()

  const { data: updatedInvite, error: updateError } = await supabase
    .from('artist_member_invitations')
    .update({
      invitation_token: invitationToken,
      invitation_token_expires_at: invitationExpiresAt.toISOString(),
      invited_at: nowIso,
      status: 'sent'
    })
    .eq('id', invitationId)
    .eq('user_id', user.id)
    .select('id, name, email, role, roles, status, invited_at, responded_at, metadata')
    .single()

  if (updateError) {
    console.error('Artist members resend: failed to update invitation', updateError)
    return NextResponse.json({ error: 'Failed to prepare invitation for resend' }, { status: 500 })
  }

  const ownerRoles = Array.isArray(profile.artist_primary_roles)
    ? profile.artist_primary_roles.filter((val: unknown): val is string => typeof val === 'string' && val.trim().length > 0)
    : []

  const rolesPayload = Array.isArray(updatedInvite.roles)
    ? updatedInvite.roles.filter((val: unknown): val is string => typeof val === 'string' && val.trim().length > 0)
    : undefined

  const { error: functionError } = await supabase.functions.invoke('send-member-invite', {
    body: {
      email: updatedInvite.email,
      token: invitationToken,
      role: updatedInvite.role ?? null,
      roles: rolesPayload,
      name: updatedInvite.name ?? null,
      artistName: profile.stage_name ?? null,
      invitedBy: user.email ?? undefined,
      ownerRoles,
      expiresAt: invitationExpiresAt.toISOString()
    }
  })

  if (functionError) {
    console.error('Artist members resend: send-member-invite failed', functionError)
    return NextResponse.json({ error: 'Failed to send invitation email' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: updatedInvite })
}


