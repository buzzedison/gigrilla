'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, CalendarRange, Globe2, Loader2, MapPinned, Mic2, PoundSterling, RadioTower, Building2, Wallet, Clock3 } from 'lucide-react'
import { formatDateTimeDDMMMyyyy } from '@/lib/date-format'
import { fetchArtistGigView } from './gig-manager/api'
import type { ArtistGigRecord } from './gig-manager/types'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parseVenueCountry(address: string | null | undefined): string | null {
  if (!address) return null
  const segments = address
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)
  return segments.length > 0 ? segments[segments.length - 1] : null
}

function parseVenueLocality(address: string | null | undefined): string | null {
  if (!address) return null
  const segments = address
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)
  if (segments.length >= 2) return segments[segments.length - 2]
  return segments[0] || null
}

function formatCurrencyAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function formatDateTimeLabel(value: string | null | undefined, timezone?: string | null) {
  if (!value) return 'Time unavailable'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Time unavailable'

  if (!timezone) {
    return formatDateTimeDDMMMyyyy(value, 'Time unavailable')
  }

  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).formatToParts(parsed)

    const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || ''
    const monthIndex = Number(getPart('month')) - 1
    const month = MONTH_LABELS[monthIndex] || getPart('month')

    return `${getPart('day')} ${month} ${getPart('year')} ${getPart('hour')}:${getPart('minute')}`
  } catch {
    return formatDateTimeDDMMMyyyy(value, 'Time unavailable')
  }
}

function readMetadataString(metadata: Record<string, unknown> | null | undefined, key: string) {
  if (!metadata || typeof metadata !== 'object') return ''
  const raw = metadata[key]
  return typeof raw === 'string' ? raw.trim() : ''
}

function isLivestreamGig(gig: ArtistGigRecord) {
  const eventType = (gig.eventType || '').toLowerCase()
  const gigType = readMetadataString(gig.metadata, 'gig_type').toLowerCase()
  return eventType === 'livestream' || gigType === 'streaming'
}

function getLivestreamDisplayLink(gig: ArtistGigRecord) {
  const url = readMetadataString(gig.metadata, 'live_stream_url')
  if (!url) return 'Stream link to be confirmed'

  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function getScheduledPublishAt(gig: ArtistGigRecord) {
  if (gig.gigStatus !== 'draft') return null
  if (readMetadataString(gig.metadata, 'publish_mode') !== 'scheduled') return null
  const publishAt = readMetadataString(gig.metadata, 'publish_at')
  if (!publishAt) return null

  const parsed = new Date(publishAt)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isDraftOrScheduledHiddenGig(gig: ArtistGigRecord, nowMs: number) {
  if (gig.gigStatus !== 'draft') return false
  const publishAt = getScheduledPublishAt(gig)
  return !publishAt || publishAt.getTime() > nowMs
}

function isUpcomingGig(gig: ArtistGigRecord, nowMs: number) {
  if (gig.bookingStatus !== 'confirmed' && gig.bookingStatus !== 'pending') return false
  if (!gig.startDatetime) return false
  const start = new Date(gig.startDatetime)
  return !Number.isNaN(start.getTime()) && start.getTime() >= nowMs
}

function needsCompletionConfirmation(gig: ArtistGigRecord, nowMs: number) {
  if (gig.bookingStatus !== 'confirmed') return false
  if (!gig.startDatetime) return false
  const start = new Date(gig.startDatetime)
  return !Number.isNaN(start.getTime()) && start.getTime() < nowMs
}

function isArtistSubmittedGig(gig: ArtistGigRecord) {
  return gig.isRequest && (gig.sourceOfTruth || gig.publicDisplay?.sourceOfTruth || 'artist') === 'artist'
}

function topEntries(map: Map<string, number>, limit = 5) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}

function StatCard({ icon: Icon, label, value, helper }: { icon: typeof Activity; label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-[1.75rem] border border-[#f2d7ea]/35 bg-[linear-gradient(180deg,_rgba(251,245,252,0.96),_rgba(247,237,250,0.92))] p-5 shadow-[0_14px_36px_rgba(28,10,46,0.14)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6e5f86]">{label}</p>
          <p className="mt-3 text-3xl font-semibold leading-none text-[#1f1730]">{value}</p>
          {helper && <p className="mt-3 text-sm text-[#65587d]">{helper}</p>}
        </div>
        <div className="rounded-2xl bg-white/70 p-3 text-[#6b33b7] shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function ArtistGigStatisticsManager() {
  const [gigs, setGigs] = useState<ArtistGigRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchArtistGigView('calendar', { limit: 5000 })
        if (!cancelled) {
          setGigs(response.data || [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load gig statistics')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const now = Date.now()
    const visibleGigs = gigs.filter((gig) => {
      if (gig.bookingStatus === 'cancelled') return false
      return !isDraftOrScheduledHiddenGig(gig, now)
    })
    const completed = visibleGigs.filter((gig) => gig.bookingStatus === 'completed')
    const confirmed = visibleGigs.filter((gig) => gig.bookingStatus === 'confirmed')
    const upcoming = visibleGigs.filter((gig) => isUpcomingGig(gig, now))
    const needsCompletion = visibleGigs.filter((gig) => needsCompletionConfirmation(gig, now))
    const inPerson = visibleGigs.filter((gig) => !isLivestreamGig(gig))
    const livestream = visibleGigs.filter((gig) => isLivestreamGig(gig))
    const excludedDrafts = gigs.length - visibleGigs.length

    const venueCounts = new Map<string, number>()
    const countryCounts = new Map<string, number>()
    const localityCounts = new Map<string, number>()
    const earningsByCurrency = new Map<string, number>()

    visibleGigs.forEach((gig) => {
      if (isLivestreamGig(gig)) return

      const venueName = (gig.venueName || 'Venue TBD').trim()
      venueCounts.set(venueName, (venueCounts.get(venueName) || 0) + 1)

      const country = parseVenueCountry(gig.venueAddress)
      if (country) countryCounts.set(country, (countryCounts.get(country) || 0) + 1)

      const locality = parseVenueLocality(gig.venueAddress)
      if (locality) localityCounts.set(locality, (localityCounts.get(locality) || 0) + 1)

    })

    visibleGigs.forEach((gig) => {
      if (!gig.bookingFee || gig.bookingFee <= 0) return
      if (gig.bookingStatus !== 'confirmed' && gig.bookingStatus !== 'completed') return
      if (isArtistSubmittedGig(gig)) return

      earningsByCurrency.set(gig.currency, (earningsByCurrency.get(gig.currency) || 0) + gig.bookingFee)
    })

    const mostRecent = visibleGigs
      .filter((gig) => gig.startDatetime)
      .sort((a, b) => new Date(b.startDatetime || 0).getTime() - new Date(a.startDatetime || 0).getTime())
      .slice(0, 5)

    return {
      total: visibleGigs.length,
      completed: completed.length,
      confirmed: confirmed.length,
      upcoming: upcoming.length,
      needsCompletion: needsCompletion.length,
      excludedDrafts,
      inPerson: inPerson.length,
      livestream: livestream.length,
      uniqueVenues: venueCounts.size,
      uniqueCountries: countryCounts.size,
      topVenues: topEntries(venueCounts),
      topCountries: topEntries(countryCounts),
      topLocalities: topEntries(localityCounts),
      earningsByCurrency: Array.from(earningsByCurrency.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      recent: mostRecent,
    }
  }, [gigs])

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,242,250,0.94))] p-8 shadow-[0_18px_52px_rgba(28,10,46,0.16)]">
        <div className="flex items-center gap-3 text-[#5f5473]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading gig statistics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 shadow-[0_18px_52px_rgba(28,10,46,0.12)]">
        <p className="text-base font-semibold text-rose-900">Gig statistics could not be loaded.</p>
        <p className="mt-2 text-sm text-rose-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(248,242,250,0.94))] p-6 shadow-[0_18px_52px_rgba(28,10,46,0.16)] sm:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#6d5d84]">Gig Statistics</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1730]">Performance, locations, venues, and earnings</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f5473]">
              This screen is built from your real gig bookings. It shows how many gigs you have played, where they happened,
              which venues recur most often, and what your booked earnings look like by currency.
            </p>
          </div>
          <div className="rounded-2xl border border-[#edd7f4] bg-white/75 px-4 py-3 text-sm text-[#5f5473] shadow-sm">
            <p className="font-semibold text-[#241a35]">Live dataset</p>
            <p className="mt-1">{stats.total} public bookings analysed</p>
            {stats.excludedDrafts > 0 ? (
              <p className="mt-1 text-xs text-[#746783]">{stats.excludedDrafts} draft/hidden excluded</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} label="Total Gigs" value={String(stats.total)} helper={`${stats.completed} completed • ${stats.upcoming} upcoming • ${stats.needsCompletion} need completion`} />
        <StatCard icon={Building2} label="Venues Played" value={String(stats.uniqueVenues)} helper="Unique venues across your current booking history" />
        <StatCard icon={Globe2} label="Countries Reached" value={String(stats.uniqueCountries)} helper="Based on venue addresses already saved to your gigs" />
        <StatCard icon={CalendarRange} label="Confirmed Bookings" value={String(stats.confirmed)} helper="Confirmed gigs currently on the books" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(247,239,250,0.93))] p-6 shadow-[0_18px_52px_rgba(28,10,46,0.14)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#f4eafb] p-3 text-[#7139bf]">
              <Mic2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#20182f]">Performance mix</h3>
              <p className="text-sm text-[#66597f]">How your current gigs break down by format and completion.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[#edd7f4] bg-white/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#73668a]">In-person gigs</p>
              <p className="mt-3 text-3xl font-semibold text-[#1f1730]">{stats.inPerson}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#edd7f4] bg-white/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#73668a]">Livestream gigs</p>
              <p className="mt-3 text-3xl font-semibold text-[#1f1730]">{stats.livestream}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#edd7f4] bg-white/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#73668a]">Completed gigs</p>
              <p className="mt-3 text-3xl font-semibold text-[#1f1730]">{stats.completed}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#edd7f4] bg-white/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#73668a]">Upcoming gigs</p>
              <p className="mt-3 text-3xl font-semibold text-[#1f1730]">{stats.upcoming}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#edd7f4] bg-white/80 p-5 sm:col-span-2 xl:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#73668a]">Need completion</p>
              <p className="mt-3 text-3xl font-semibold text-[#1f1730]">{stats.needsCompletion}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(247,239,250,0.93))] p-6 shadow-[0_18px_52px_rgba(28,10,46,0.14)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#e8f8ee] p-3 text-[#1f9b53]">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#20182f]">Booked earnings</h3>
              <p className="text-sm text-[#66597f]">Confirmed and completed booking fees, grouped by currency.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {stats.earningsByCurrency.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[#e1cdef] bg-white/70 p-5 text-sm text-[#66597f]">
                No booking-fee data is available yet for confirmed or completed gigs.
              </div>
            ) : (
              stats.earningsByCurrency.map(([currency, amount]) => (
                <div key={currency} className="flex items-center justify-between rounded-[1.5rem] border border-[#edd7f4] bg-white/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#f4eafb] p-2 text-[#7139bf]">
                      <PoundSterling className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#20182f]">{currency}</p>
                      <p className="text-xs text-[#6a5d82]">Booked income</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-[#20182f]">{formatCurrencyAmount(amount, currency)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(247,239,250,0.93))] p-6 shadow-[0_18px_52px_rgba(28,10,46,0.14)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#eef4ff] p-3 text-[#3967c7]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#20182f]">Top venues</h3>
              <p className="text-sm text-[#66597f]">The venues that recur most often in your bookings.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {stats.topVenues.length === 0 ? (
              <p className="rounded-[1.5rem] border border-dashed border-[#e1cdef] bg-white/70 p-4 text-sm text-[#66597f]">No venue data available yet.</p>
            ) : (
              stats.topVenues.map(([venue, count], index) => (
                <div key={venue} className="flex items-center justify-between rounded-[1.5rem] border border-[#edd7f4] bg-white/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#20182f]">{index + 1}. {venue}</p>
                    <p className="text-xs text-[#6a5d82]">Recurring venue</p>
                  </div>
                  <span className="rounded-full bg-[#f4eafb] px-3 py-1 text-xs font-semibold text-[#7139bf]">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(247,239,250,0.93))] p-6 shadow-[0_18px_52px_rgba(28,10,46,0.14)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#eef4ff] p-3 text-[#3967c7]">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#20182f]">Top countries</h3>
              <p className="text-sm text-[#66597f]">Country reach based on the venue addresses already saved.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {stats.topCountries.length === 0 ? (
              <p className="rounded-[1.5rem] border border-dashed border-[#e1cdef] bg-white/70 p-4 text-sm text-[#66597f]">No country data available yet.</p>
            ) : (
              stats.topCountries.map(([country, count], index) => (
                <div key={country} className="flex items-center justify-between rounded-[1.5rem] border border-[#edd7f4] bg-white/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#20182f]">{index + 1}. {country}</p>
                    <p className="text-xs text-[#6a5d82]">Saved venue geography</p>
                  </div>
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#3967c7]">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(247,239,250,0.93))] p-6 shadow-[0_18px_52px_rgba(28,10,46,0.14)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#eef4ff] p-3 text-[#3967c7]">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#20182f]">Top localities</h3>
              <p className="text-sm text-[#66597f]">A simple view of the cities or local areas you play most often.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {stats.topLocalities.length === 0 ? (
              <p className="rounded-[1.5rem] border border-dashed border-[#e1cdef] bg-white/70 p-4 text-sm text-[#66597f]">No locality data available yet.</p>
            ) : (
              stats.topLocalities.map(([locality, count], index) => (
                <div key={locality} className="flex items-center justify-between rounded-[1.5rem] border border-[#edd7f4] bg-white/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#20182f]">{index + 1}. {locality}</p>
                    <p className="text-xs text-[#6a5d82]">Venue locality</p>
                  </div>
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#3967c7]">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(247,239,250,0.93))] p-6 shadow-[0_18px_52px_rgba(28,10,46,0.14)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#f4eafb] p-3 text-[#7139bf]">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#20182f]">Recent gig activity</h3>
            <p className="text-sm text-[#66597f]">The latest gigs in your booking history, using the real artist-side gig records.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {stats.recent.length === 0 ? (
            <p className="rounded-[1.5rem] border border-dashed border-[#e1cdef] bg-white/70 p-4 text-sm text-[#66597f]">No gigs available yet.</p>
          ) : (
            stats.recent.map((gig) => (
              <div key={gig.id} className="rounded-[1.5rem] border border-[#edd7f4] bg-white/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-[#20182f] line-clamp-2">{gig.gigTitle}</p>
                    <p className="mt-1 text-sm text-[#5f5473]">@ {isLivestreamGig(gig) ? 'Live Stream Gig' : gig.venueName}</p>
                    <p className="mt-1 text-sm italic text-[#6a5d82]">
                      {isLivestreamGig(gig) ? getLivestreamDisplayLink(gig) : gig.venueAddress}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f4eafb] px-3 py-1 text-xs font-semibold capitalize text-[#7139bf]">
                    {gig.bookingStatus}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#5f5473]">
                  <span className="rounded-full bg-[#f8f1fb] px-3 py-1">{formatDateTimeLabel(gig.startDatetime, gig.timezone)}</span>
                  <span className="rounded-full bg-[#f8f1fb] px-3 py-1 capitalize">{isLivestreamGig(gig) ? 'livestream' : gig.eventType.replace(/_/g, ' ')}</span>
                  {gig.bookingFee && !isArtistSubmittedGig(gig) ? (
                    <span className="rounded-full bg-[#e8f8ee] px-3 py-1 font-medium text-[#27784b]">
                      {formatCurrencyAmount(gig.bookingFee, gig.currency)}
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
