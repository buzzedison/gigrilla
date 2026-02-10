'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, MapPin, RefreshCw, AlertCircle, Plus, Edit, Check, Eye, Megaphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { fetchArtistGigView } from './gig-manager/api'
import { ArtistGigRecord } from './gig-manager/types'
import { CreateGigForm } from './gig-manager/CreateGigForm'

interface ArtistGigCalendarManagerProps {
  defaultView?: 'create' | 'upcoming' | 'past'
}

function formatDateTime(value: string | null) {
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

function formatDateOnly(value: string | null) {
  if (!value) return 'Date TBD'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date TBD'
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
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

function statusVariant(status: string) {
  if (status === 'confirmed') return 'default'
  if (status === 'pending') return 'secondary'
  if (status === 'completed') return 'outline'
  return 'destructive'
}

export function ArtistGigCalendarManager({ defaultView = 'create' }: ArtistGigCalendarManagerProps) {
  const [gigs, setGigs] = useState<ArtistGigRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    try {
      setError(null)
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const result = await fetchArtistGigView('calendar')
      setGigs(result.data || [])
      setWarning(result.warning || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gig calendar')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const now = useMemo(() => new Date(), [])
  const sorted = useMemo(() => {
    return [...gigs].sort((a, b) => {
      const left = a.startDatetime ? new Date(a.startDatetime).getTime() : 0
      const right = b.startDatetime ? new Date(b.startDatetime).getTime() : 0
      return left - right
    })
  }, [gigs])

  const upcoming = useMemo(
    () => sorted.filter((gig) => gig.startDatetime && new Date(gig.startDatetime) >= now),
    [sorted, now]
  )
  const past = useMemo(
    () => sorted.filter((gig) => !gig.startDatetime || new Date(gig.startDatetime) < now),
    [sorted, now]
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-gray-500">Loading...</CardContent>
      </Card>
    )
  }

  // ── ADD / CREATE GIG view ──
  if (defaultView === 'create') {
    return (
      <div className="space-y-6">
        {submitSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-2 animate-in fade-in">
            <Check className="w-5 h-5 text-green-600" />
            <span><strong>Gig published successfully!</strong> It will appear in your upcoming gigs and on Gigrilla GigFinder.</span>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-700" />
                Add / Create Gig
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {showForm
                  ? 'Fill in the details below to create and publish your Gig.'
                  : 'Create a new gig booking for your act.'
                }
              </p>
            </div>
            <div className="flex gap-2">
              {!showForm && (
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => { setShowForm(true); setSubmitSuccess(false) }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Gig
                </Button>
              )}
              {!showForm && (
                <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {warning && !showForm && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                {warning}
              </div>
            )}
            {error && !showForm && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Summary & CTA when form is hidden */}
            {!error && !showForm && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Bookings</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">{gigs.length}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Upcoming</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">{upcoming.length}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Past</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">{past.length}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 space-y-3">
                  <p className="text-sm text-gray-700">
                    Add the details of any upcoming Live Streaming Gig or Live In-person Gig, and:
                  </p>
                  <ul className="text-sm text-gray-700 list-disc ml-4 space-y-1">
                    <li>We&apos;ll add it to your Artist Profile Upcoming Gig List</li>
                    <li>We&apos;ll add it to Gigrilla GigFinder</li>
                    <li>We&apos;ll notify any Fans that are following you on Gigrilla</li>
                    <li>We&apos;ll also notify other Fans in the local catchment area of the Venue if they follow your Music Genre</li>
                  </ul>
                  <p className="text-sm text-gray-600">
                    🤫 As part of this process, you choose whether to publish your Gig immediately or schedule it for a later date.
                  </p>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 mt-2"
                    onClick={() => { setShowForm(true); setSubmitSuccess(false) }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Gig
                  </Button>
                </div>
              </div>
            )}

            {/* Create Gig Form */}
            {showForm && (
              <CreateGigForm
                onCancel={() => { setShowForm(false) }}
                onSuccess={() => {
                  setShowForm(false)
                  setSubmitSuccess(true)
                  load(true)
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── AMEND UPCOMING GIGS view ──
  if (defaultView === 'upcoming') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-700" />
                Amend Upcoming Gigs
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Amend your upcoming published and scheduled Gigs here. Changes will take up to 24 hours to take effect across Gigrilla, except for &quot;Publish Gig Now&quot; which is immediate.
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
            {!error && upcoming.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
                <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No upcoming gigs to amend.</p>
                <p className="text-xs text-gray-400 mt-1">Create a new gig from the &quot;Add / Create Gig&quot; section.</p>
              </div>
            ) : (
              <>
                {/* Info boxes */}
                <div className="space-y-3 mb-6">
                  <div className="flex gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                    <Megaphone className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>If a Venue is already on Gigrilla or joins later, this Gig will be added to their Gig List on their Venue Profile as well as yours.</p>
                  </div>
                  <div className="flex gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>Any Gigs added by the Venue that match Gigs added by the Artist will merge, with the Venue&apos;s Gig details superseding the Artist&apos;s. The Venue&apos;s version will show on both profiles and on Gigrilla GigFinder.</p>
                  </div>
                </div>

                {/* Gig cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {upcoming.map((gig) => (
                    <div key={gig.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
                      {/* Gig Artwork placeholder */}
                      <div className="h-40 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                        <CalendarDays className="w-12 h-12 text-white/60" />
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{gig.gigTitle}</h3>
                        <p className="text-sm text-gray-600">@ {gig.venueName}</p>
                        <p className="text-sm text-gray-500 italic">{gig.venueAddress}</p>

                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-purple-700">
                            Gig Date: {formatDateOnly(gig.startDatetime)}
                            {gig.endDatetime && ` - ${formatDateOnly(gig.endDatetime)}`}
                          </p>
                          {formatTime(gig.startDatetime) && (
                            <p className="text-gray-600 italic">
                              Doors Open: <strong>{formatTime(gig.startDatetime)}</strong>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <Badge variant={statusVariant(gig.bookingStatus)}>
                            {gig.bookingStatus.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500 capitalize">
                            {gig.eventType.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {gig.bookedAt && (
                          <p className="text-xs text-gray-400 pt-1">
                            (Published on {formatDateOnly(gig.bookedAt)})
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-3 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit This Gig
                          </Button>
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                            <Eye className="w-3 h-3 mr-1" />
                            Publish Gig Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── PAST & UNSCHEDULED view ──
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-700" />
              Past &amp; Unscheduled Gigs
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              View your completed and unscheduled gig history.
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
          {!error && past.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
              <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No past or unscheduled gigs yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {past.map((gig) => (
                <div key={gig.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                    <CalendarDays className="w-10 h-10 text-white/50" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-gray-900">{gig.gigTitle}</h3>
                    <p className="text-sm text-gray-600">@ {gig.venueName}</p>
                    <p className="text-sm text-gray-500">{formatDateOnly(gig.startDatetime)}</p>
                    <Badge variant={statusVariant(gig.bookingStatus)}>
                      {gig.bookingStatus.replace('_', ' ')}
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
