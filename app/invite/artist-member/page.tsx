import { AlertTriangle, CheckCircle2, Clock, Mail } from 'lucide-react'
import Link from 'next/link'

import { createServiceClient } from '../../../lib/supabase/service-client'
import { Button } from '../../components/ui/button'

interface ArtistMemberInvitationRecord {
  id: string
  artist_profile_id: string | null
  name: string | null
  email: string
  role: string | null
  roles: string[] | null
  status: string
  invitation_token_expires_at: string | null
  invited_at: string
}

async function fetchInvite(token: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('artist_member_invitations')
    .select(
      'id, artist_profile_id, name, email, role, roles, status, invitation_token_expires_at, invited_at'
    )
    .eq('invitation_token', token)
    .maybeSingle<ArtistMemberInvitationRecord>()

  if (error) {
    throw error
  }

  if (!data) {
    return { invite: null, artistName: null }
  }

  let artistName: string | null = null

  if (data.artist_profile_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stage_name')
      .eq('id', data.artist_profile_id)
      .maybeSingle()

    artistName = profile?.stage_name ?? null
  }

  return { invite: data, artistName }
}

function formatRole(invite: ArtistMemberInvitationRecord) {
  if (Array.isArray(invite.roles) && invite.roles.length > 0) {
    return invite.roles.join(', ')
  }

  return invite.role ?? 'Collaborator'
}

function formatDate(value: string | null) {
  if (!value) return null
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export const revalidate = 0

export default async function ArtistMemberInvitePage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const tokenParam = searchParams?.token
  const token = typeof tokenParam === 'string' ? tokenParam : null

  const missingServiceKey = !process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="max-w-lg w-full space-y-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
          <div>
            <h1 className="text-2xl font-semibold">Invite token missing</h1>
            <p className="mt-2 text-slate-400">
              The invitation link you followed does not include a token. Please check the email you
              received and try the link again.
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              Return home
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  if (missingServiceKey) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="max-w-lg w-full space-y-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
          <div>
            <h1 className="text-2xl font-semibold">Invite lookup unavailable</h1>
            <p className="mt-2 text-slate-400">
              We could not verify this invitation because the server is missing the Supabase service
              role credentials.
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              Return home
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  let inviteResult: Awaited<ReturnType<typeof fetchInvite>> | null = null
  let fetchError: Error | null = null

  try {
    inviteResult = await fetchInvite(token)
  } catch (error) {
    fetchError = error as Error
  }

  if (fetchError) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="max-w-lg w-full space-y-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <div>
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-slate-400">
              We were unable to verify your invitation. Please try again in a moment or contact the
              person who invited you.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {fetchError.message}
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              Return home
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  const invite = inviteResult?.invite ?? null
  const artistName = inviteResult?.artistName ?? null

  if (!invite) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="max-w-lg w-full space-y-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
          <div>
            <h1 className="text-2xl font-semibold">Invitation not found</h1>
            <p className="mt-2 text-slate-400">
              We couldn&apos;t find an invitation matching this link. It may have been withdrawn or the
              token might be incorrect.
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              Return home
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  const expiresAt = invite.invitation_token_expires_at
  const expired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false
  const inviteStatus = invite.status ?? 'pending'

  const statusLabel = expired
    ? 'Expired'
    : inviteStatus === 'accepted'
      ? 'Accepted'
      : inviteStatus === 'declined'
        ? 'Declined'
        : inviteStatus === 'revoked'
          ? 'Revoked'
          : 'Pending'

  const statusColor = expired
    ? 'text-amber-400'
    : inviteStatus === 'accepted'
      ? 'text-emerald-400'
      : inviteStatus === 'declined' || inviteStatus === 'revoked'
        ? 'text-rose-400'
        : 'text-sky-400'

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full space-y-10">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-800 px-4 py-1.5 text-sm text-slate-300">
            <Mail className="mr-2 h-4 w-4" />
            Artist team invitation
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {artistName ? `${artistName} invited you to join their team` : 'You&apos;re invited to join a Gigrilla artist'}
          </h1>
          <p className="text-slate-400">
            Use the details below to review the invitation. To continue, sign in or create a free
            Gigrilla account with the same email address that received this invite.
          </p>
        </header>

        <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 text-sm font-medium ${statusColor}`}>
              <CheckCircle2 className="h-4 w-4" />
              {statusLabel}
            </span>
            <div className="text-sm text-slate-400">
              Invited on {formatDate(invite.invited_at) ?? 'unknown'}
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Invited email</dt>
              <dd className="text-base font-medium text-white">{invite.email}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Role</dt>
              <dd className="text-base font-medium text-white">{formatRole(invite)}</dd>
            </div>
            {invite.name ? (
              <div className="space-y-1">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Invited by</dt>
                <dd className="text-base font-medium text-white">{invite.name}</dd>
              </div>
            ) : null}
            {artistName ? (
              <div className="space-y-1">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Artist</dt>
                <dd className="text-base font-medium text-white">{artistName}</dd>
              </div>
            ) : null}
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Invitation expires</dt>
              <dd className="flex items-center gap-2 text-base font-medium text-white">
                <Clock className="h-4 w-4 text-slate-400" />
                {formatDate(expiresAt) ?? 'Not specified'}
              </dd>
            </div>
          </dl>

          {expired ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              This invitation has expired. Ask the artist to send a new invite if you still need
              access.
            </div>
          ) : inviteStatus !== 'pending' ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              This invitation is marked as {statusLabel.toLowerCase()}. If this is unexpected, please
              contact the person who invited you.
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200">
              Great! This invite is ready to be accepted once you sign in or create your account
              below.
            </div>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Button asChild variant="secondary" className="w-full">
            <Link href={`/signup?invite=${encodeURIComponent(token)}`}>
              Create a free account
            </Link>
          </Button>
          <Button asChild className="w-full">
            <Link href={`/login?invite=${encodeURIComponent(token)}`}>
              Sign in to continue
            </Link>
          </Button>
        </section>

        <footer className="text-center text-xs text-slate-500">
          Need help? Forward this email to <a className="text-slate-300 underline" href="mailto:support@gigrilla.com">support@gigrilla.com</a> and we&apos;ll take a look.
        </footer>
      </div>
    </main>
  )
}


