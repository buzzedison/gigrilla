'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Mail, RefreshCw, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { fetchArtistGigView, updateArtistGig } from './gig-manager/api'
import { ArtistGigRecord } from './gig-manager/types'

function formatDate(value: string | null) {
  if (!value) return 'Date TBD'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date TBD'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function ArtistGigInvitesManager() {
  const [invites, setInvites] = useState<ArtistGigRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    try {
      setError(null)
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await fetchArtistGigView('invites', { limit: 200 })
      setInvites(response.data || [])
      setWarning(response.warning || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invites')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const pendingInvites = useMemo(
    () => invites.filter((invite) => invite.bookingStatus === 'pending'),
    [invites]
  )
  const historyInvites = useMemo(
    () => invites.filter((invite) => invite.bookingStatus !== 'pending'),
    [invites]
  )

  const handleAction = async (bookingId: string, action: 'accept_invite' | 'decline_invite') => {
    try {
      setActioningId(bookingId)
      await updateArtistGig(bookingId, action)
      await load(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invite')
    } finally {
      setActioningId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-gray-500">Loading gig invites...</CardContent>
      </Card>
    )
  }

  return (
    <div id="artist-gig-invites-overview" className="space-y-6 scroll-mt-28">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-700" />
              Gig Invites
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Accept or decline invites from venues and organizers.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {warning && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {warning}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {!error && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">All Invites</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{invites.length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Pending</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{pendingInvites.length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Responded</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{historyInvites.length}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="artist-gig-invites-pending" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="text-base">Pending Invites</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvites.length === 0 ? (
            <p className="text-sm text-gray-500">No pending invites right now.</p>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{invite.gigTitle}</p>
                      <p className="text-sm text-gray-600">{invite.venueName}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(invite.startDatetime)}</p>
                      {invite.sourceOfTruth === 'venue' && (
                        <p className="text-xs text-blue-700 mt-1">Venue official data supersedes artist data for this gig.</p>
                      )}
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAction(invite.id, 'accept_invite')}
                      disabled={actioningId === invite.id}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(invite.id, 'decline_invite')}
                      disabled={actioningId === invite.id}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="artist-gig-invites-history" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="text-base">Invite History</CardTitle>
        </CardHeader>
        <CardContent>
          {historyInvites.length === 0 ? (
            <p className="text-sm text-gray-500">No invite history yet.</p>
          ) : (
            <div className="space-y-3">
              {historyInvites.map((invite) => (
                <div key={invite.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{invite.gigTitle}</p>
                      <p className="text-sm text-gray-600">{invite.venueName}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(invite.startDatetime)}</p>
                      {invite.sourceOfTruth === 'venue' && (
                        <p className="text-xs text-blue-700 mt-1">Venue official data supersedes artist data for this gig.</p>
                      )}
                    </div>
                    <Badge variant={invite.bookingStatus === 'confirmed' ? 'default' : 'outline'}>
                      {invite.bookingStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
