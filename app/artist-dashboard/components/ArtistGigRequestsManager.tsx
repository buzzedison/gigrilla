'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { fetchArtistGigView, updateArtistGig } from './gig-manager/api'
import { ArtistGigRecord } from './gig-manager/types'

type RequestFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

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

export function ArtistGigRequestsManager() {
  const [requests, setRequests] = useState<ArtistGigRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<RequestFilter>('all')
  const [actioningId, setActioningId] = useState<string | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    try {
      setError(null)
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const result = await fetchArtistGigView('requests', { limit: 200 })
      setRequests(result.data || [])
      setWarning(result.warning || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gig requests')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const pending = useMemo(
    () => requests.filter((request) => request.bookingStatus === 'pending'),
    [requests]
  )
  const history = useMemo(
    () => requests.filter((request) => request.bookingStatus !== 'pending'),
    [requests]
  )
  const filtered = useMemo(() => {
    if (filter === 'all') return requests
    return requests.filter((request) => request.bookingStatus === filter)
  }, [filter, requests])

  const handleCancelRequest = async (bookingId: string) => {
    try {
      setActioningId(bookingId)
      await updateArtistGig(bookingId, 'cancel_request')
      await load(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel request')
    } finally {
      setActioningId(null)
    }
  }

  const handleMarkCompleted = async (bookingId: string) => {
    try {
      setActioningId(bookingId)
      await updateArtistGig(bookingId, 'mark_completed')
      await load(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark request as completed')
    } finally {
      setActioningId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-gray-500">Loading gig requests...</CardContent>
      </Card>
    )
  }

  return (
    <div id="artist-gig-requests-overview" className="space-y-6 scroll-mt-28">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-purple-700" />
              Gig Requests
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Track requests you have sent and manage their status.
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
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{requests.length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Pending</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{pending.length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Confirmed</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{requests.filter((item) => item.bookingStatus === 'confirmed').length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Closed</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{requests.filter((item) => ['completed', 'cancelled'].includes(item.bookingStatus)).length}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="artist-gig-requests-pending" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="text-base">Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-gray-500">No pending requests right now.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((request) => (
                <div key={request.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{request.gigTitle}</p>
                      <p className="text-sm text-gray-600">{request.venueName}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(request.startDatetime)}</p>
                      {request.sourceOfTruth === 'venue' && (
                        <p className="text-xs text-blue-700 mt-1">Venue official data supersedes artist data for this gig.</p>
                      )}
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelRequest(request.id)}
                      disabled={actioningId === request.id}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Cancel Request
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="artist-gig-requests-history" className="scroll-mt-28">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Request History</CardTitle>
            <div className="flex flex-wrap gap-2">
              {(['all', 'confirmed', 'completed', 'cancelled'] as RequestFilter[]).map((item) => (
                <Button
                  key={item}
                  size="sm"
                  variant={filter === item ? 'default' : 'outline'}
                  onClick={() => setFilter(item)}
                  className="capitalize"
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No request history yet.</p>
          ) : (
            <div className="space-y-3">
              {filtered.filter((request) => request.bookingStatus !== 'pending').map((request) => (
                <div key={request.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{request.gigTitle}</p>
                      <p className="text-sm text-gray-600">{request.venueName}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(request.startDatetime)}</p>
                      {request.sourceOfTruth === 'venue' && (
                        <p className="text-xs text-blue-700 mt-1">Venue official data supersedes artist data for this gig.</p>
                      )}
                    </div>
                    <Badge variant={request.bookingStatus === 'confirmed' ? 'default' : 'outline'}>
                      {request.bookingStatus}
                    </Badge>
                  </div>

                  {request.bookingStatus === 'confirmed' && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkCompleted(request.id)}
                        disabled={actioningId === request.id}
                      >
                        Mark Completed
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
