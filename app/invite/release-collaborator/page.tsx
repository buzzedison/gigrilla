import { AlertTriangle, CheckCircle2, Clock, Music, Building2, Truck, Shield, Users } from 'lucide-react'
import Link from 'next/link'

import { createServiceClient } from '../../../lib/supabase/service-client'
import { Button } from '../../components/ui/button'

interface ReleaseInvitationRecord {
  id: string
  release_id: string
  user_id: string
  invitation_type: 'distributor' | 'pro' | 'mcs' | 'label' | 'publisher'
  organization_name: string
  contact_email: string
  contact_name: string | null
  custom_message: string | null
  status: string
  invitation_token_expires_at: string | null
  invited_at: string
}

const invitationTypeConfig = {
  distributor: {
    title: 'Music Distribution',
    role: 'Distributor',
    description: 'Handle digital distribution and master royalty collection',
    icon: Truck,
    color: 'text-green-400'
  },
  pro: {
    title: 'Performing Rights Organization',
    role: 'PRO',
    description: 'Collect performance royalties',
    icon: Shield,
    color: 'text-indigo-400'
  },
  mcs: {
    title: 'Mechanical Collection Society',
    role: 'MCS',
    description: 'Collect mechanical royalties',
    icon: Music,
    color: 'text-amber-400'
  },
  label: {
    title: 'Record Label',
    role: 'Label',
    description: 'Manage master rights and distribution',
    icon: Building2,
    color: 'text-purple-400'
  },
  publisher: {
    title: 'Music Publisher',
    role: 'Publisher',
    description: 'Manage publishing rights and royalty collection',
    icon: Users,
    color: 'text-blue-400'
  }
}

async function fetchInvite(token: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('music_release_invitations')
    .select(
      'id, release_id, user_id, invitation_type, organization_name, contact_email, contact_name, custom_message, status, invitation_token_expires_at, invited_at'
    )
    .eq('invitation_token', token)
    .maybeSingle<ReleaseInvitationRecord>()

  if (error) {
    throw error
  }

  if (!data) {
    return { invite: null, releaseTitle: null, artistName: null }
  }

  let releaseTitle: string | null = null
  let artistName: string | null = null

  if (data.release_id) {
    const { data: release } = await supabase
      .from('music_releases')
      .select('release_title, user_id')
      .eq('id', data.release_id)
      .maybeSingle()

    releaseTitle = release?.release_title ?? null

    if (release?.user_id) {
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('stage_name')
        .eq('user_id', release.user_id)
        .maybeSingle()

      artistName = profile?.stage_name ?? null
    }
  }

  return { invite: data, releaseTitle, artistName }
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
export default async function ReleaseCollaboratorInvitePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedParams = searchParams ? await searchParams : undefined
  const tokenParam = resolvedParams?.token
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
  const releaseTitle = inviteResult?.releaseTitle ?? null
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
        : 'Pending'

  const statusColor = expired
    ? 'text-amber-400'
    : inviteStatus === 'accepted'
      ? 'text-emerald-400'
      : inviteStatus === 'declined'
        ? 'text-rose-400'
        : 'text-sky-400'

  const config = invitationTypeConfig[invite.invitation_type]
  const Icon = config.icon

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full space-y-10">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-800 px-4 py-1.5 text-sm text-slate-300">
            <Icon className={`mr-2 h-4 w-4 ${config.color}`} />
            {config.title} Collaboration
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {artistName
              ? `${artistName} invited ${invite.organization_name} to collaborate`
              : `You're invited to collaborate on a music release`}
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
              <dt className="text-xs uppercase tracking-wide text-slate-500">Organization</dt>
              <dd className="text-base font-medium text-white">{invite.organization_name}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Role</dt>
              <dd className={`text-base font-medium ${config.color}`}>{config.role}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Contact email</dt>
              <dd className="text-base font-medium text-white">{invite.contact_email}</dd>
            </div>
            {releaseTitle ? (
              <div className="space-y-1">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Release</dt>
                <dd className="text-base font-medium text-white">{releaseTitle}</dd>
              </div>
            ) : null}
            {artistName ? (
              <div className="space-y-1">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Artist</dt>
                <dd className="text-base font-medium text-white">{artistName}</dd>
              </div>
            ) : null}
            {invite.contact_name ? (
              <div className="space-y-1">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Contact name</dt>
                <dd className="text-base font-medium text-white">{invite.contact_name}</dd>
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

          {invite.custom_message && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500 mb-2">Personal message</dt>
              <dd className="text-sm text-slate-300 italic">&ldquo;{invite.custom_message}&rdquo;</dd>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-slate-500 mb-2">Your responsibilities</dt>
            <dd className="text-sm text-slate-300">{config.description}</dd>
          </div>

          {expired ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              This invitation has expired. Ask the artist to send a new invite if you still need
              access.
            </div>
          ) : inviteStatus !== 'pending' && inviteStatus !== 'sent' ? (
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
            <Link href={`/signup?invite=${encodeURIComponent(token)}&type=release-collaborator`}>
              Create a free account
            </Link>
          </Button>
          <Button asChild className="w-full">
            <Link href={`/login?invite=${encodeURIComponent(token)}&type=release-collaborator`}>
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
