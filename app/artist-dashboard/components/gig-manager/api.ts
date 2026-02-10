import { ArtistGigListResponse } from './types'

type GigView = 'calendar' | 'invites' | 'requests'

export async function fetchArtistGigView(view: GigView): Promise<ArtistGigListResponse> {
  const response = await fetch(`/api/artist-gigs?view=${view}`, { cache: 'no-store' })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to load gig data')
  }

  return payload as ArtistGigListResponse
}

type GigAction = 'accept_invite' | 'decline_invite' | 'cancel_request' | 'mark_completed'

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

export type { GigAction, GigView }
