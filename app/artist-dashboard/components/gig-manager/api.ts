import { ArtistGigListResponse, GigBookingStatus } from './types'

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

type GigAction = 'accept_invite' | 'decline_invite' | 'cancel_request' | 'mark_completed' | 'publish_now'

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

export type { GigAction, GigView }
