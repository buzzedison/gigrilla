export type GigBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface ArtistGigRecord {
  id: string
  gigId: string | null
  bookingStatus: GigBookingStatus
  bookingFee: number | null
  currency: string
  specialRequests: string | null
  bookedAt: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  bookedBy: string | null
  isInvite: boolean
  isRequest: boolean
  gigTitle: string
  eventType: string
  startDatetime: string | null
  endDatetime: string | null
  timezone: string
  gigStatus: string | null
  venueName: string
  venueAddress: string
}

export interface ArtistGigListResponse {
  success: boolean
  view: 'calendar' | 'invites' | 'requests' | 'all'
  data: ArtistGigRecord[]
  warning?: string
  summary?: {
    total: number
    pending: number
    confirmed: number
    completed: number
  }
}

