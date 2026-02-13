'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, RefreshCw, AlertCircle, Plus, Edit, Check, Eye, Megaphone, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { fetchArtistGigView, sendGigFanComms, updateArtistGig } from './gig-manager/api'
import { ArtistGigRecord } from './gig-manager/types'
import { CreateGigForm, type CreateGigFormInitialData } from './gig-manager/CreateGigForm'

interface ArtistGigCalendarManagerProps {
  defaultView?: 'create' | 'upcoming' | 'past'
}

interface FanCommsFormState {
  sendMode: 'now' | 'scheduled'
  scheduledDate: string
  scheduledTime: string
  audienceMode: 'all_followers' | 'specific_regions'
  regionsInput: string
  artworkChoice: 'artist' | 'venue'
  title: string
  message: string
}

interface FanCommsAssetState {
  artistArtworkUrl: string | null
  venueArtworkUrl: string | null
}

interface FanCommsSummary {
  sent: number
  scheduled: number
  failed: number
  total: number
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

function getTomorrowDateInput() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

function toDateInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function toTimeInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(11, 16)
}

function readMetadataString(metadata: Record<string, unknown> | null | undefined, key: string) {
  if (!metadata || typeof metadata !== 'object') return ''
  const raw = metadata[key]
  return typeof raw === 'string' ? raw : ''
}

function readMetadataObject(metadata: Record<string, unknown> | null | undefined, key: string) {
  if (!metadata || typeof metadata !== 'object') return null
  const raw = metadata[key]
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as Record<string, unknown>
}

function readMetadataStringArray(metadata: Record<string, unknown> | null | undefined, key: string) {
  if (!metadata || typeof metadata !== 'object') return [] as string[]
  const raw = metadata[key]
  if (!Array.isArray(raw)) return [] as string[]
  return raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

function readMetadataNumberLike(metadata: Record<string, unknown> | null | undefined, key: string) {
  if (!metadata || typeof metadata !== 'object') return ''
  const raw = metadata[key]
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw)
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return ''
}

function toGigFormInitialData(gig: ArtistGigRecord): CreateGigFormInitialData {
  const metadata = gig.metadata && typeof gig.metadata === 'object' ? gig.metadata : null
  const venueContact = readMetadataObject(metadata, 'venue_contact')
  const eventType = (gig.eventType || '').toLowerCase()
  const isStreaming = eventType === 'livestream'

  const derivedSetStart = readMetadataString(metadata, 'set_start_time') || toTimeInput(gig.startDatetime)
  const derivedSetEnd = readMetadataString(metadata, 'set_end_time') || toTimeInput(gig.endDatetime)
  const ticketAvailabilityRaw = readMetadataString(metadata, 'ticket_availability')
  const ticketAvailability = ticketAvailabilityRaw === 'full_venue_capacity' || ticketAvailabilityRaw === 'less_than_full_venue_capacity'
    ? ticketAvailabilityRaw
    : 'skip'
  const ageRestrictionModeRaw = readMetadataString(metadata, 'age_restriction_mode')
  const ageRestrictionMode = ageRestrictionModeRaw === 'has_restrictions' ? 'has_restrictions' : 'unknown'
  const publishModeRaw = readMetadataString(metadata, 'publish_mode')
  const publishMode = publishModeRaw === 'scheduled' ? 'scheduled' : 'immediate'

  return {
    gigEventName: gig.gigTitle || '',
    gigType: isStreaming ? 'streaming' : 'in_person',
    gigDate: toDateInput(gig.startDatetime),
    doorsOpen: readMetadataString(metadata, 'doors_open'),
    streamOpens: readMetadataString(metadata, 'stream_opens'),
    setStartTime: derivedSetStart,
    setEndTime: derivedSetEnd,
    venueName: gig.venueName && gig.venueName !== 'Venue TBD' ? gig.venueName : readMetadataString(metadata, 'venue_name'),
    venueAddress: gig.venueAddress && gig.venueAddress !== 'Address unavailable'
      ? gig.venueAddress
      : readMetadataString(metadata, 'venue_address'),
    venueContactName: readMetadataString(venueContact, 'name'),
    venueContactEmail: readMetadataString(venueContact, 'email'),
    venueContactPhoneCode: readMetadataString(venueContact, 'phone_code') || '+',
    venueContactPhone: readMetadataString(venueContact, 'phone'),
    liveStreamUrl: readMetadataString(metadata, 'live_stream_url'),
    ageRestrictionMode,
    ageRestrictions: readMetadataStringArray(metadata, 'age_restrictions'),
    ticketMode: readMetadataString(metadata, 'ticket_mode') === 'known' ? 'known' : 'unknown',
    freeTicketOptions: readMetadataStringArray(metadata, 'free_ticket_options'),
    paidTicketOptions: readMetadataStringArray(metadata, 'paid_ticket_options'),
    thirdPartyTicketLink: readMetadataString(metadata, 'third_party_ticket_link'),
    ticketPriceVenue: readMetadataNumberLike(metadata, 'ticket_price_venue'),
    ticketPriceOnline: readMetadataNumberLike(metadata, 'ticket_price_online'),
    ticketCurrency: readMetadataString(metadata, 'ticket_currency') || gig.currency || 'GBP',
    customTickets: Array.isArray(metadata?.custom_tickets) ? (metadata.custom_tickets as CreateGigFormInitialData['customTickets']) || [] : [],
    ticketAvailability,
    customTicketCount: readMetadataNumberLike(metadata, 'custom_ticket_count'),
    artworkCaption: readMetadataString(metadata, 'artwork_caption'),
    artworkPreview: readMetadataString(metadata, 'artwork_url'),
    publishMode,
    publishDate: publishMode === 'scheduled' ? readMetadataString(metadata, 'publish_date') : '',
    publishTime: publishMode === 'scheduled' ? readMetadataString(metadata, 'publish_time') : '',
    description: gig.description || '',
  }
}

function parseRegionInput(input: string) {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
  )
}

function getFanCommsSummary(metadata: Record<string, unknown> | null | undefined): FanCommsSummary {
  if (!metadata || typeof metadata !== 'object') {
    return { sent: 0, scheduled: 0, failed: 0, total: 0 }
  }

  const fanComms = readMetadataObject(metadata, 'fan_comms')
  const summary = fanComms ? readMetadataObject(fanComms, 'summary') : null
  if (!summary) {
    return { sent: 0, scheduled: 0, failed: 0, total: 0 }
  }

  const toCount = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
  return {
    sent: toCount(summary.sent),
    scheduled: toCount(summary.scheduled),
    failed: toCount(summary.failed),
    total: toCount(summary.total),
  }
}

export function ArtistGigCalendarManager({ defaultView = 'create' }: ArtistGigCalendarManagerProps) {
  const [gigs, setGigs] = useState<ArtistGigRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [actioningGigId, setActioningGigId] = useState<string | null>(null)

  const [editGig, setEditGig] = useState<ArtistGigRecord | null>(null)
  const [fanCommsGig, setFanCommsGig] = useState<ArtistGigRecord | null>(null)
  const [fanCommsOpen, setFanCommsOpen] = useState(false)
  const [fanCommsSaving, setFanCommsSaving] = useState(false)
  const [fanCommsError, setFanCommsError] = useState<string | null>(null)
  const [fanCommsSuccess, setFanCommsSuccess] = useState<string | null>(null)
  const [fanCommsAssets, setFanCommsAssets] = useState<FanCommsAssetState>({
    artistArtworkUrl: null,
    venueArtworkUrl: null,
  })
  const [fanCommsForm, setFanCommsForm] = useState<FanCommsFormState>({
    sendMode: 'now',
    scheduledDate: getTomorrowDateInput(),
    scheduledTime: '10:00',
    audienceMode: 'all_followers',
    regionsInput: '',
    artworkChoice: 'artist',
    title: '',
    message: '',
  })

  const load = useCallback(async (isRefresh = false) => {
    try {
      setError(null)
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const nowIso = new Date().toISOString()
      const queryOptions = defaultView === 'upcoming'
        ? { dateFrom: nowIso, status: ['pending', 'confirmed'] as const, limit: 200 }
        : defaultView === 'past'
          ? { dateTo: nowIso, limit: 200 }
          : { limit: 200 }

      const result = await fetchArtistGigView('calendar', queryOptions)
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

  const openEditDialog = (gig: ArtistGigRecord) => {
    setEditGig(gig)
  }

  const handleFanCommsField = <K extends keyof FanCommsFormState>(key: K, value: FanCommsFormState[K]) => {
    setFanCommsForm((prev) => ({ ...prev, [key]: value }))
  }

  const openFanCommsDialog = (gig: ArtistGigRecord) => {
    const metadata = gig.metadata && typeof gig.metadata === 'object' ? gig.metadata : null
    const venueOverride = readMetadataObject(metadata, 'venue_override')
    const artistArtworkUrl = readMetadataString(metadata, 'artwork_url') || null
    const venueArtworkUrl = (venueOverride && (
      readMetadataString(venueOverride, 'artwork_url') ||
      readMetadataString(venueOverride, 'image_url')
    )) || null

    const hasArtistArtwork = Boolean(artistArtworkUrl)
    const hasVenueArtwork = Boolean(venueArtworkUrl)
    const artworkChoice: 'artist' | 'venue' =
      hasArtistArtwork ? 'artist' : hasVenueArtwork ? 'venue' : 'artist'

    const defaultMessage = `${gig.gigTitle} is now live on Gigrilla GigFinder.`
    const defaultTitle = `${gig.gigTitle} - Fan Update`

    setFanCommsGig(gig)
    setFanCommsAssets({
      artistArtworkUrl,
      venueArtworkUrl,
    })
    setFanCommsForm({
      sendMode: 'now',
      scheduledDate: getTomorrowDateInput(),
      scheduledTime: '10:00',
      audienceMode: 'all_followers',
      regionsInput: '',
      artworkChoice,
      title: defaultTitle.slice(0, 120),
      message: defaultMessage,
    })
    setFanCommsError(null)
    setFanCommsSuccess(null)
    setFanCommsOpen(true)
  }


  const handleSendFanComms = async () => {
    if (!fanCommsGig) return

    try {
      setFanCommsSaving(true)
      setFanCommsError(null)

      const message = fanCommsForm.message.trim()
      if (!message) {
        throw new Error('Please enter a fan communication message')
      }

      const regions = parseRegionInput(fanCommsForm.regionsInput)
      if (fanCommsForm.audienceMode === 'specific_regions' && regions.length === 0) {
        throw new Error('Please enter at least one target region')
      }

      if (fanCommsForm.sendMode === 'scheduled' && !fanCommsForm.scheduledDate) {
        throw new Error('Please choose a date for scheduled fan communication')
      }

      const artworkAvailable = fanCommsForm.artworkChoice === 'artist'
        ? Boolean(fanCommsAssets.artistArtworkUrl || fanCommsAssets.venueArtworkUrl)
        : Boolean(fanCommsAssets.venueArtworkUrl || fanCommsAssets.artistArtworkUrl)
      if (!artworkAvailable) {
        throw new Error('No artwork is available yet. Upload gig artwork or wait for venue artwork.')
      }

      const result = await sendGigFanComms({
        bookingId: fanCommsGig.id,
        sendMode: fanCommsForm.sendMode,
        scheduledDate: fanCommsForm.sendMode === 'scheduled' ? fanCommsForm.scheduledDate : undefined,
        scheduledTime: fanCommsForm.sendMode === 'scheduled' ? fanCommsForm.scheduledTime : undefined,
        audienceMode: fanCommsForm.audienceMode,
        regions: fanCommsForm.audienceMode === 'specific_regions' ? regions : undefined,
        artworkChoice: fanCommsForm.artworkChoice,
        title: fanCommsForm.title.trim() || undefined,
        message,
      })

      const sentNow = fanCommsForm.sendMode === 'now'
      const count = typeof result?.data?.sentCount === 'number'
        ? result.data.sentCount
        : typeof result?.data?.targetedCount === 'number'
          ? result.data.targetedCount
          : 0

      setFanCommsSuccess(
        sentNow
          ? `Fan update sent to ${count} fan${count === 1 ? '' : 's'}.`
          : 'Fan update scheduled successfully.'
      )
      setFanCommsOpen(false)
      setFanCommsGig(null)
      await load(true)
    } catch (err) {
      setFanCommsError(err instanceof Error ? err.message : 'Failed to send fan communication')
    } finally {
      setFanCommsSaving(false)
    }
  }

  const handlePublishNow = async (gig: ArtistGigRecord) => {
    try {
      setActioningGigId(gig.id)
      setError(null)
      await updateArtistGig(gig.id, 'publish_now')
      await load(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish gig now')
    } finally {
      setActioningGigId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-gray-500">Loading...</CardContent>
      </Card>
    )
  }

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
                    <li>Public listing follows your publish timing and venue source-of-truth rules</li>
                    <li>Fan communications are controlled by you in &quot;Promote to Fans&quot; after public launch</li>
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
            {editGig && (
              <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50/40 p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-purple-900">Editing: {editGig.gigTitle}</h3>
                    <p className="text-sm text-purple-800">Inline edit mode in your dashboard. Sidebar stays visible.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditGig(null)}
                  >
                    Back to List
                  </Button>
                </div>
                <CreateGigForm
                  mode="edit"
                  bookingId={editGig.id}
                  initialData={toGigFormInitialData(editGig)}
                  onCancel={() => setEditGig(null)}
                  onSuccess={() => {
                    setEditGig(null)
                    load(true)
                  }}
                />
              </div>
            )}
            {warning && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                {warning}
              </div>
            )}
            {fanCommsSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {fanCommsSuccess}
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
            ) : !error ? (
              <>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  {upcoming.map((gig) => {
                    const isPublishing = actioningGigId === gig.id
                    const canPublishNow = gig.gigStatus !== 'published'
                    const performanceStart = gig.artistTile?.performanceStartDatetime || gig.startDatetime
                    const performanceEnd = gig.artistTile?.performanceEndDatetime || gig.endDatetime
                    const sourceOfTruth = gig.sourceOfTruth || gig.publicDisplay?.sourceOfTruth || 'artist'
                    const fanCommsSummary = getFanCommsSummary(gig.metadata || null)
                    const fanCommsLabel = fanCommsSummary.total > 0
                      ? `Fan updates: ${fanCommsSummary.sent} sent, ${fanCommsSummary.scheduled} scheduled${fanCommsSummary.failed > 0 ? `, ${fanCommsSummary.failed} failed` : ''}`
                      : 'Fan updates: none sent yet'
                    const canPromote = gig.gigStatus === 'published'

                    return (
                      <div key={gig.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                          <CalendarDays className="w-12 h-12 text-white/60" />
                        </div>

                        <div className="p-4 space-y-2">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{gig.gigTitle}</h3>
                          <p className="text-sm text-gray-600">@ {gig.venueName}</p>
                          <p className="text-sm text-gray-500 italic">{gig.venueAddress}</p>

                          <div className="space-y-1 text-sm">
                            <p className="font-semibold text-purple-700">
                              Gig Date: {formatDateOnly(performanceStart)}
                              {performanceEnd && ` - ${formatDateOnly(performanceEnd)}`}
                            </p>
                            {formatTime(performanceStart) && (
                              <p className="text-gray-600 italic">
                                Artist Set Time: <strong>{formatTime(performanceStart)}</strong>
                                {formatTime(performanceEnd) ? ` - ${formatTime(performanceEnd)}` : ''}
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
                            <span className={`text-xs font-medium ${sourceOfTruth === 'venue' ? 'text-blue-700' : 'text-gray-500'}`}>
                              • {sourceOfTruth === 'venue' ? 'Venue Official Data' : 'Artist Submitted Data'}
                            </span>
                            {gig.gigStatus && (
                              <span className="text-xs text-gray-500 capitalize">
                                • {gig.gigStatus}
                              </span>
                            )}
                          </div>

                          {sourceOfTruth === 'venue' && (
                            <p className="text-xs text-blue-700">
                              Venue info currently supersedes artist-submitted public gig details.
                            </p>
                          )}

                          {gig.bookedAt && (
                            <p className="text-xs text-gray-400 pt-1">
                              (Published on {formatDateOnly(gig.bookedAt)})
                            </p>
                          )}

                          <p className="text-xs text-gray-500">{fanCommsLabel}</p>

                          <div className="grid gap-2 pt-3 border-t sm:grid-cols-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => openEditDialog(gig)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit This Gig
                            </Button>
                            <Button
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handlePublishNow(gig)}
                              disabled={!canPublishNow || isPublishing}
                            >
                              {isPublishing ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3 mr-1" />
                              )}
                              {canPublishNow ? 'Publish Gig Now' : 'Already Published'}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="sm:col-span-2"
                              onClick={() => openFanCommsDialog(gig)}
                              disabled={!canPromote}
                            >
                              <Megaphone className="w-3 h-3 mr-1" />
                              {canPromote ? 'Promote to Fans' : 'Publish Gig First'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Dialog open={fanCommsOpen} onOpenChange={(open) => {
          setFanCommsOpen(open)
          if (!open) {
            setFanCommsGig(null)
            setFanCommsError(null)
          }
        }}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Promote This Gig to Fans</DialogTitle>
              <DialogDescription>
                Public listing is separate from fan promotion. Choose when to send updates, who should receive them, and which artwork to use.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {fanCommsError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {fanCommsError}
                </div>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 space-y-1">
                <p><strong>Public Display:</strong> venue-official event data stays public across GigFinder, artist pages, and venue pages.</p>
                <p><strong>Fan Promotion:</strong> your fan updates are controlled here and sent only when you choose.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Send Timing</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="fan-comms-send-mode"
                        checked={fanCommsForm.sendMode === 'now'}
                        onChange={() => handleFanCommsField('sendMode', 'now')}
                        className="accent-purple-600"
                      />
                      Send now
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="fan-comms-send-mode"
                        checked={fanCommsForm.sendMode === 'scheduled'}
                        onChange={() => handleFanCommsField('sendMode', 'scheduled')}
                        className="accent-purple-600"
                      />
                      Schedule for later
                    </label>
                  </div>
                </div>

                {fanCommsForm.sendMode === 'scheduled' && (
                  <>
                    <div>
                      <Label htmlFor="fan-comms-date">Scheduled Date</Label>
                      <Input
                        id="fan-comms-date"
                        type="date"
                        value={fanCommsForm.scheduledDate}
                        onChange={(event) => handleFanCommsField('scheduledDate', event.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fan-comms-time">Scheduled Time</Label>
                      <Input
                        id="fan-comms-time"
                        type="time"
                        value={fanCommsForm.scheduledTime}
                        onChange={(event) => handleFanCommsField('scheduledTime', event.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <Label>Audience</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="fan-comms-audience-mode"
                        checked={fanCommsForm.audienceMode === 'all_followers'}
                        onChange={() => handleFanCommsField('audienceMode', 'all_followers')}
                        className="accent-purple-600"
                      />
                      All fans who follow this artist
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="fan-comms-audience-mode"
                        checked={fanCommsForm.audienceMode === 'specific_regions'}
                        onChange={() => handleFanCommsField('audienceMode', 'specific_regions')}
                        className="accent-purple-600"
                      />
                      Specific regions only
                    </label>
                  </div>
                  {fanCommsForm.audienceMode === 'specific_regions' && (
                    <div className="mt-2">
                      <Input
                        placeholder="Enter regions separated by commas (e.g. London, UK, Berlin)"
                        value={fanCommsForm.regionsInput}
                        onChange={(event) => handleFanCommsField('regionsInput', event.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label>Artwork for Fan Communication</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fan-comms-artwork"
                        checked={fanCommsForm.artworkChoice === 'artist'}
                        onChange={() => handleFanCommsField('artworkChoice', 'artist')}
                        className="accent-purple-600"
                        disabled={!fanCommsAssets.artistArtworkUrl && !fanCommsAssets.venueArtworkUrl}
                      />
                      Use artist artwork
                      {fanCommsAssets.artistArtworkUrl ? (
                        <span className="text-green-700 text-xs">(available)</span>
                      ) : (
                        <span className="text-amber-700 text-xs">(fallback to venue artwork)</span>
                      )}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fan-comms-artwork"
                        checked={fanCommsForm.artworkChoice === 'venue'}
                        onChange={() => handleFanCommsField('artworkChoice', 'venue')}
                        className="accent-purple-600"
                        disabled={!fanCommsAssets.venueArtworkUrl && !fanCommsAssets.artistArtworkUrl}
                      />
                      Use venue artwork
                      {fanCommsAssets.venueArtworkUrl ? (
                        <span className="text-green-700 text-xs">(available)</span>
                      ) : (
                        <span className="text-amber-700 text-xs">(fallback to artist artwork)</span>
                      )}
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="fan-comms-title">Headline (optional)</Label>
                  <Input
                    id="fan-comms-title"
                    value={fanCommsForm.title}
                    onChange={(event) => handleFanCommsField('title', event.target.value)}
                    maxLength={120}
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="fan-comms-message">Fan Update Message *</Label>
                  <Textarea
                    id="fan-comms-message"
                    value={fanCommsForm.message}
                    onChange={(event) => handleFanCommsField('message', event.target.value)}
                    rows={4}
                    maxLength={500}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">{fanCommsForm.message.length} / 500</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setFanCommsOpen(false)}
                disabled={fanCommsSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendFanComms}
                disabled={fanCommsSaving || !fanCommsGig}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {fanCommsSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : fanCommsForm.sendMode === 'scheduled' ? (
                  'Schedule Fan Update'
                ) : (
                  'Send Fan Update Now'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

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
