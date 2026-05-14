import { ArtistGigListResponse, ArtistGigReportingRecord, ArtistGigSummaryResponse, ArtistUnavailabilityRecord, GigBookingStatus } from './types'

type GigView = 'calendar' | 'invites' | 'requests'

export interface GigQueryOptions {
  status?: readonly GigBookingStatus[]
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export async function fetchArtistGigView(view: GigView, options?: GigQueryOptions): Promise<ArtistGigListResponse> {
  const query = new URLSearchParams({ view })

  if (options?.status && options.status.length > 0) {
    query.set('status', options.status.join(','))
  }
  if (options?.dateFrom) {
    query.set('date_from', options.dateFrom)
  }
  if (options?.dateTo) {
    query.set('date_to', options.dateTo)
  }
  if (typeof options?.limit === 'number') {
    query.set('limit', String(options.limit))
  }
  if (typeof options?.offset === 'number') {
    query.set('offset', String(options.offset))
  }

  const response = await fetch(`/api/artist-gigs?${query.toString()}`, { cache: 'no-store' })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to load gig data')
  }

  return payload as ArtistGigListResponse
}

export async function fetchArtistGigSummary(): Promise<ArtistGigSummaryResponse> {
  const response = await fetch('/api/artist-gigs?summary=true', { cache: 'no-store' })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to load gig summary')
  }

  return payload as ArtistGigSummaryResponse
}

type GigAction = 'accept_invite' | 'decline_invite' | 'cancel_request' | 'mark_completed' | 'publish_now' | 'mark_sold_out'

export async function updateArtistGig(bookingId: string, action: GigAction) {
  const response = await fetch('/api/artist-gigs', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bookingId, action })
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to update booking')
  }

  return payload
}

export interface CreateGigPayload {
  title: string
  event_type: string
  start_datetime: string
  end_datetime?: string
  timezone?: string
  description?: string
  venue_name?: string
  venue_city?: string
  venue_country?: string
  booking_fee?: number | null
  currency?: string
  special_requests?: string
}

export async function createGig(data: CreateGigPayload) {
  const response = await fetch('/api/artist-gigs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to create gig')
  }

  return payload
}

export interface UpdateGigPayload {
  bookingId: string
  title?: string
  description?: string | null
  event_type?: string
  start_datetime?: string
  end_datetime?: string | null
  timezone?: string
  venue_name?: string | null
  venue_address?: string | null
  venue_city?: string | null
  venue_country?: string | null
  metadata?: Record<string, unknown>
}

export async function updateGig(data: UpdateGigPayload) {
  const response = await fetch('/api/artist-gigs', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to update gig')
  }

  return payload
}

export interface SendGigFanCommsPayload {
  bookingId: string
  sendMode: 'now' | 'scheduled'
  scheduledDate?: string
  scheduledTime?: string
  audienceMode: 'all_followers' | 'specific_regions'
  regions?: string[]
  artworkChoice: 'artist' | 'venue'
  title?: string
  message: string
}

export interface GigFanCommsQueueEntry {
  id: string
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled'
  created_at: string
  send_mode: 'now' | 'scheduled'
  scheduled_for: string | null
  sent_at: string | null
  audience_mode: 'all_followers' | 'specific_regions'
  regions: string[]
  artwork_choice: 'artist' | 'venue'
  artwork_url: string | null
  title: string
  message: string
  recipient_count: number | null
  failure_reason?: string | null
}

export interface GigFanCommsStateResponse {
  success: boolean
  data: {
    bookingId: string
    gigId: string
    gigStatus: string | null
    artwork: {
      artistArtworkUrl: string | null
      venueArtworkUrl: string | null
    }
    queue: GigFanCommsQueueEntry[]
    summary: {
      total: number
      sent: number
      scheduled: number
      failed: number
      cancelled?: number
    }
  }
}

export async function sendGigFanComms(data: SendGigFanCommsPayload) {
  const response = await fetch('/api/artist-gigs/fan-comms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to send fan communication')
  }

  return payload
}

export async function fetchGigFanCommsState(bookingId: string) {
  const query = new URLSearchParams({ bookingId })
  const response = await fetch(`/api/artist-gigs/fan-comms?${query.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to load fan promotion status')
  }

  return payload as GigFanCommsStateResponse
}

export async function cancelScheduledGigFanComms(bookingId: string, entryId: string) {
  const response = await fetch('/api/artist-gigs/fan-comms', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bookingId,
      entryId,
      action: 'cancel_scheduled',
    }),
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to cancel scheduled fan update')
  }

  return payload
}

export interface ArtistAvailabilityResponse {
  success: boolean
  data: ArtistUnavailabilityRecord[]
  warning?: string
}

export interface CreateArtistUnavailabilityPayload {
  startsAt: string
  endsAt: string
  reason?: string
  note?: string
}

export async function fetchArtistUnavailability(options?: { dateFrom?: string; dateTo?: string }) {
  const query = new URLSearchParams()
  if (options?.dateFrom) query.set('date_from', options.dateFrom)
  if (options?.dateTo) query.set('date_to', options.dateTo)

  const response = await fetch(`/api/artist-availability${query.toString() ? `?${query.toString()}` : ''}`, {
    cache: 'no-store',
  })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to load unavailability')
  }

  return payload as ArtistAvailabilityResponse
}

export async function createArtistUnavailability(data: CreateArtistUnavailabilityPayload) {
  const response = await fetch('/api/artist-availability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to save unavailability')
  }

  return payload as { success: boolean; data: ArtistUnavailabilityRecord }
}

export async function deleteArtistUnavailability(id: string) {
  const query = new URLSearchParams({ id })
  const response = await fetch(`/api/artist-availability?${query.toString()}`, {
    method: 'DELETE',
  })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to remove unavailability')
  }

  return payload as { success: boolean }
}

export interface ArtistGigReportingResponse {
  success: boolean
  data: ArtistGigReportingRecord[]
  warning?: string
}

export interface SubmitArtistGigReportingPayload {
  bookingId: string
  actionType: 'confirm' | 'report'
  targetMemberType?: 'venue' | 'artist' | 'fan' | 'service' | 'professional' | 'other'
  targetMemberId?: string | null
  rating?: number | null
  reviewText?: string
  issueTypes?: string[]
  environmentDetails?: string
  attitudeDetails?: string
}

export async function fetchArtistGigReporting(actionType?: 'confirm' | 'report') {
  const query = new URLSearchParams()
  if (actionType) query.set('actionType', actionType)

  const response = await fetch(`/api/artist-gig-reporting${query.toString() ? `?${query.toString()}` : ''}`, {
    cache: 'no-store',
  })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to load gig reporting')
  }

  return payload as ArtistGigReportingResponse
}

export async function submitArtistGigReporting(data: SubmitArtistGigReportingPayload) {
  const response = await fetch('/api/artist-gig-reporting', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to save gig reporting')
  }

  return payload as { success: boolean; data: ArtistGigReportingRecord }
}

export interface UpdateScheduledGigFanCommsPayload {
  scheduledDate: string
  scheduledTime?: string
  audienceMode: 'all_followers' | 'specific_regions'
  regions?: string[]
  artworkChoice: 'artist' | 'venue'
  title?: string
  message: string
}

export async function updateScheduledGigFanComms(
  bookingId: string,
  entryId: string,
  data: UpdateScheduledGigFanCommsPayload
) {
  const response = await fetch('/api/artist-gigs/fan-comms', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bookingId,
      entryId,
      action: 'update_scheduled',
      ...data,
    }),
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to update scheduled fan update')
  }

  return payload
}

export type { GigAction, GigView }
