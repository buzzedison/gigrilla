'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CalendarDays, Inbox, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { fetchArtistGigView, updateArtistGig } from './gig-manager/api'
import { ArtistGigRecord } from './gig-manager/types'
import { formatDateTimeDDMMMyyyy } from '@/lib/date-format'

type RequestFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

function formatDate(value: string | null) {
  if (!value) return 'Date TBD'
  return formatDateTimeDDMMMyyyy(value, 'Date TBD')
}

function formatTime(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function readMetadataString(metadata: Record<string, unknown> | null | undefined, key: string) {
  if (!metadata || typeof metadata !== 'object') return ''
  const raw = metadata[key]
  return typeof raw === 'string' ? raw : ''
}

function getLivestreamPlatformLabel(url: string | null) {
  if (!url) return 'Live Stream'

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host.includes('youtube')) return 'YouTube'
    if (host.includes('youtu.be')) return 'YouTube'
    if (host.includes('twitch')) return 'Twitch'
    if (host.includes('vimeo')) return 'Vimeo'
    if (host.includes('facebook')) return 'Facebook Live'
    if (host.includes('instagram')) return 'Instagram Live'
    if (host.includes('tiktok')) return 'TikTok Live'
    if (host.includes('restream')) return 'Restream'
    if (host.includes('zoom')) return 'Zoom'

    const root = host.split('.').at(0) || host
    return root.charAt(0).toUpperCase() + root.slice(1)
  } catch {
    return 'Live Stream'
  }
}

function getLivestreamDisplayLink(url: string | null) {
  if (!url) return 'Stream link to be confirmed'

  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function renderRequestTileMeta(request: ArtistGigRecord) {
  const metadata = request.metadata && typeof request.metadata === 'object' ? request.metadata : null
  const isLivestream = (request.eventType || '').toLowerCase() === 'livestream'
  const livestreamUrl = readMetadataString(metadata, 'live_stream_url') || null
  const displayVenueName = isLivestream
    ? getLivestreamPlatformLabel(livestreamUrl)
    : request.venueName || 'Venue TBD'
  const displayVenueAddress = isLivestream
    ? getLivestreamDisplayLink(livestreamUrl)
    : request.venueAddress || 'Address unavailable'
  const performanceStart = request.artistTile?.performanceStartDatetime || request.startDatetime
  const performanceEnd = request.artistTile?.performanceEndDatetime || request.endDatetime
  const sourceOfTruth = request.sourceOfTruth || request.publicDisplay?.sourceOfTruth || 'artist'

  return {
    displayVenueName,
    displayVenueAddress,
    performanceStart,
    performanceEnd,
    sourceOfTruth,
  }
}

export function ArtistGigRequestsManager() {
  const [requests, setRequests] = useState<ArtistGigRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<RequestFilter>('all')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [brokenGigArtwork, setBrokenGigArtwork] = useState<Record<string, boolean>>({})

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
                <div key={request.id} className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                  {(() => {
                    const metadata = request.metadata && typeof request.metadata === 'object' ? request.metadata : null
                    const gigArtworkUrl = request.publicDisplay?.artworkUrl || readMetadataString(metadata, 'artwork_url') || ''
                    const showGigArtwork = Boolean(gigArtworkUrl) && !brokenGigArtwork[request.id]

                    return showGigArtwork ? (
                      <div className="relative h-52 w-full overflow-hidden bg-[linear-gradient(135deg,_#faf6ff_0%,_#eef5ff_100%)] sm:h-56">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={gigArtworkUrl}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 block h-full w-full scale-110 object-cover object-center opacity-25 blur-xl"
                          onError={() => {
                            setBrokenGigArtwork((prev) => ({ ...prev, [request.id]: true }))
                          }}
                        />
                        <div className="absolute inset-0 bg-white/20" />
                        <div className="relative z-10 flex h-full items-center justify-center p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={gigArtworkUrl}
                            alt={`${request.gigTitle} artwork`}
                            className="block h-full w-auto max-w-[78%] rounded-md object-contain shadow-[0_12px_28px_rgba(15,10,30,0.22)]"
                            onError={() => {
                              setBrokenGigArtwork((prev) => ({ ...prev, [request.id]: true }))
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500 sm:h-56">
                        <CalendarDays className="w-10 h-10 text-white/50" />
                      </div>
                    )
                  })()}
                  {(() => {
                    const {
                      displayVenueName,
                      displayVenueAddress,
                      performanceStart,
                      performanceEnd,
                      sourceOfTruth,
                    } = renderRequestTileMeta(request)

                    return (
                  <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{request.gigTitle}</p>
                            <p className="text-sm text-gray-700 mt-1">@ {displayVenueName}</p>
                            <p className="text-sm italic text-gray-600">{displayVenueAddress}</p>
                            <p className="text-xs text-purple-700 mt-2">
                              Gig Date: <strong>{formatDate(request.startDatetime)}</strong>
                            </p>
                            {formatTime(performanceStart) && (
                              <p className="text-xs text-gray-600">
                                Artist Set Time: <strong>{formatTime(performanceStart)}</strong>
                                {formatTime(performanceEnd) ? ` - ${formatTime(performanceEnd)}` : ''}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <Badge variant="secondary">Pending</Badge>
                              <span>• {(request.eventType || 'gig').replace(/_/g, ' ')}</span>
                              <span className={`font-medium ${sourceOfTruth === 'venue' ? 'text-blue-700' : 'text-gray-500'}`}>
                                • {sourceOfTruth === 'venue' ? 'Venue Official Data' : 'Artist Submitted Data'}
                              </span>
                              {request.gigStatus && <span>• {request.gigStatus}</span>}
                            </div>
                            {sourceOfTruth === 'venue' && (
                              <p className="text-xs text-blue-700 mt-2">
                                Venue official data supersedes artist data for this gig.
                              </p>
                            )}
                          </div>
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
                    )
                  })()}
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
                <div key={request.id} className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                  {(() => {
                    const metadata = request.metadata && typeof request.metadata === 'object' ? request.metadata : null
                    const gigArtworkUrl = request.publicDisplay?.artworkUrl || readMetadataString(metadata, 'artwork_url') || ''
                    const showGigArtwork = Boolean(gigArtworkUrl) && !brokenGigArtwork[request.id]

                    return showGigArtwork ? (
                      <div className="relative h-52 w-full overflow-hidden bg-[linear-gradient(135deg,_#faf6ff_0%,_#eef5ff_100%)] sm:h-56">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={gigArtworkUrl}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 block h-full w-full scale-110 object-cover object-center opacity-25 blur-xl"
                          onError={() => {
                            setBrokenGigArtwork((prev) => ({ ...prev, [request.id]: true }))
                          }}
                        />
                        <div className="absolute inset-0 bg-white/20" />
                        <div className="relative z-10 flex h-full items-center justify-center p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={gigArtworkUrl}
                            alt={`${request.gigTitle} artwork`}
                            className="block h-full w-auto max-w-[78%] rounded-md object-contain shadow-[0_12px_28px_rgba(15,10,30,0.22)]"
                            onError={() => {
                              setBrokenGigArtwork((prev) => ({ ...prev, [request.id]: true }))
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500 sm:h-56">
                        <CalendarDays className="w-10 h-10 text-white/50" />
                      </div>
                    )
                  })()}
                  {(() => {
                    const {
                      displayVenueName,
                      displayVenueAddress,
                      performanceStart,
                      performanceEnd,
                      sourceOfTruth,
                    } = renderRequestTileMeta(request)

                    return (
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{request.gigTitle}</p>
                            <p className="text-sm text-gray-700 mt-1">@ {displayVenueName}</p>
                            <p className="text-sm italic text-gray-600">{displayVenueAddress}</p>
                            <p className="text-xs text-purple-700 mt-2">
                              Gig Date: <strong>{formatDate(request.startDatetime)}</strong>
                            </p>
                            {formatTime(performanceStart) && (
                              <p className="text-xs text-gray-600">
                                Artist Set Time: <strong>{formatTime(performanceStart)}</strong>
                                {formatTime(performanceEnd) ? ` - ${formatTime(performanceEnd)}` : ''}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <Badge variant={request.bookingStatus === 'confirmed' ? 'default' : 'outline'}>
                                {request.bookingStatus}
                              </Badge>
                              <span>• {(request.eventType || 'gig').replace(/_/g, ' ')}</span>
                              <span className={`font-medium ${sourceOfTruth === 'venue' ? 'text-blue-700' : 'text-gray-500'}`}>
                                • {sourceOfTruth === 'venue' ? 'Venue Official Data' : 'Artist Submitted Data'}
                              </span>
                              {request.gigStatus && <span>• {request.gigStatus}</span>}
                            </div>
                            {sourceOfTruth === 'venue' && (
                              <p className="text-xs text-blue-700 mt-2">
                                Venue official data supersedes artist data for this gig.
                              </p>
                            )}
                          </div>
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
                    )
                  })()}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
