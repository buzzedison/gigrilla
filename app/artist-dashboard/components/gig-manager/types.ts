export type GigBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type GigSourceOfTruth = 'artist' | 'venue'
export type GigMergeStatus = 'artist_only' | 'venue_only' | 'merged'

export interface ArtistGigPublicDisplay {
  sourceOfTruth: GigSourceOfTruth
  mergeStatus: GigMergeStatus
  title: string
  description: string | null
  artworkUrl: string | null
  ticketEntryDetails: string | null
  entryRequirements: string | null
  doorsOpen: string | null
  setStartTime: string | null
  setEndTime: string | null
  startDatetime: string | null
  endDatetime: string | null
  venueName: string
  venueAddress: string
  venueDataSupersedesArtistData: boolean
  dataPolicy: string
}

export interface ArtistGigTileDisplay {
  headerArtistName: string
  performanceStartDatetime: string | null
  performanceEndDatetime: string | null
  otherArtists: string[]
  hasOtherArtists: boolean
  sourceOfTruth: GigSourceOfTruth
  venueDataSupersedes: boolean
}

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
  description?: string | null
  metadata?: Record<string, unknown> | null
  eventType: string
  startDatetime: string | null
  endDatetime: string | null
  timezone: string
  gigStatus: string | null
  venueName: string
  venueAddress: string
  sourceOfTruth?: GigSourceOfTruth
  mergeStatus?: GigMergeStatus
  publicDisplay?: ArtistGigPublicDisplay
  artistTile?: ArtistGigTileDisplay
}

export interface ArtistGigListResponse {
  success: boolean
  view: 'calendar' | 'invites' | 'requests' | 'all'
  data: ArtistGigRecord[]
  warning?: string
  filters?: {
    status: GigBookingStatus[]
    date_from: string | null
    date_to: string | null
  }
  pagination?: {
    total: number
    limit: number
    offset: number
    returned: number
    has_more: boolean
  }
  summary?: {
    total: number
    pending: number
    confirmed: number
    completed: number
  }
}

export interface ArtistGigSummaryResponse {
  success: boolean
  view: 'all'
  warning?: string
  data: {
    counts: Record<string, number>
    folders?: Array<{
      id: string
      label: string
      total: number
    }>
    total: number
    statuses?: {
      pending: number
      confirmed: number
      completed: number
      cancelled: number
    }
  }
}

export interface ArtistUnavailabilityRecord {
  id: string
  artist_id: string
  starts_at: string
  ends_at: string
  reason: string
  note: string | null
  created_at: string
  updated_at: string
}

export interface ArtistGigReportingRecord {
  id: string
  booking_id: string
  gig_id: string | null
  artist_id: string
  venue_id: string | null
  action_type: 'confirm' | 'report'
  target_member_type: 'venue' | 'artist' | 'fan' | 'service' | 'professional' | 'other'
  target_member_id: string | null
  rating: number | null
  review_text: string | null
  issue_types: string[]
  environment_details: string | null
  attitude_details: string | null
  metadata: Record<string, unknown>
  status: 'submitted' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
  updated_at: string
}
