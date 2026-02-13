import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { dispatchDueFanCommsForArtistGigs } from '@/lib/gig-fan-comms'

type GigView = 'calendar' | 'invites' | 'requests' | 'all'
type GigAction = 'accept_invite' | 'decline_invite' | 'cancel_request' | 'mark_completed' | 'publish_now'
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

type GigStatus = 'draft' | 'published' | 'cancelled' | 'completed'
type GigSourceOfTruth = 'artist' | 'venue'
type GigMergeStatus = 'artist_only' | 'venue_only' | 'merged'

type GigUpdatePayload = {
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

interface GigBookingRow {
  id: string
  gig_id: string | null
  artist_id: string
  venue_id: string | null
  booking_status: BookingStatus
  booking_fee: number | null
  currency: string | null
  special_requests: string | null
  booked_by: string | null
  booked_at: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
}

interface GigRow {
  id: string
  title: string
  description: string | null
  event_type: string | null
  start_datetime: string
  end_datetime: string | null
  timezone: string | null
  gig_status: GigStatus | null
  venue_id: string | null
  metadata: Record<string, unknown> | null
}

interface VenueRow {
  id: string
  owner_id: string | null
  name: string
  address: unknown
}

const VALID_EVENT_TYPES = new Set(['concert', 'festival', 'private', 'open_mic', 'livestream'])
const VALID_CURRENCIES = new Set(['GBP', 'USD', 'EUR', 'GHS'])
const VALID_BOOKING_STATUSES = new Set<BookingStatus>(['pending', 'confirmed', 'cancelled', 'completed'])
const VALID_TICKET_AVAILABILITY = new Set(['skip', 'full_venue_capacity', 'less_than_full_venue_capacity', 'full_capacity', 'custom'])
const VALID_AGE_RESTRICTIONS = new Set([
  'All ages',
  'Over 16s', 'Under 16s',
  'Over 17s', 'Under 17s',
  'Over 18s', 'Under 18s',
  'Over 19s', 'Under 19s',
  'Over 20s', 'Under 20s',
  'Over 21s', 'Under 21s',
  'Over 25s', 'Under 25s',
  'Over 30s', 'Under 30s',
])
const DEFAULT_PAGE_LIMIT = 50
const MAX_PAGE_LIMIT = 200
const BOOKING_FETCH_LIMIT = 5000

function getViewParam(value: string | null): GigView {
  if (value === 'calendar' || value === 'invites' || value === 'requests') return value
  return 'all'
}

function parseStatusFilter(value: string | null): BookingStatus[] {
  if (!value) return []

  const parsed = value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  if (parsed.length === 0) return []

  const unique = Array.from(new Set(parsed))
  const invalid = unique.filter((entry) => !VALID_BOOKING_STATUSES.has(entry as BookingStatus))
  if (invalid.length > 0) {
    throw new Error(`Invalid status filter: ${invalid.join(', ')}`)
  }

  return unique as BookingStatus[]
}

function parseQueryDate(value: string | null, field: 'date_from' | 'date_to'): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${field} must be a valid date/time`)
  }
  return parsed
}

function parseLimit(value: string | null) {
  if (!value) return DEFAULT_PAGE_LIMIT
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error('limit must be a positive integer')
  }
  return Math.min(parsed, MAX_PAGE_LIMIT)
}

function parseOffset(value: string | null) {
  if (!value) return 0
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('offset must be 0 or a positive integer')
  }
  return parsed
}

function isMissingTableError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const maybe = error as { code?: string; message?: string; details?: string }
  const message = `${maybe.message ?? ''} ${maybe.details ?? ''}`.toLowerCase()
  return (
    maybe.code === '42P01' ||
    message.includes('relation') && message.includes('does not exist') ||
    message.includes('could not find the table')
  )
}

function readAddressLine(address: unknown): string {
  if (!address || typeof address !== 'object') return 'Address unavailable'
  const value = address as Record<string, unknown>
  const city = typeof value.city === 'string' ? value.city : ''
  const state = typeof value.state === 'string' ? value.state : ''
  const country = typeof value.country === 'string' ? value.country : ''
  const line1 = typeof value.line1 === 'string' ? value.line1 : ''
  const composed = [line1, city, state, country].filter(Boolean).join(', ')
  return composed || 'Address unavailable'
}

function normalizeDisplayAddress(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.toLowerCase() === 'address unavailable') return null
  return trimmed
}

function toTrimmedString(input: unknown): string {
  return typeof input === 'string' ? input.trim() : ''
}

function toOptionalTrimmedString(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  return trimmed.length > 0 ? trimmed : null
}

function validateTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date())
    return true
  } catch {
    return false
  }
}

function parseIsoDateTime(value: string, fieldName: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date/time`)
  }
  return date
}

function validateUrl(value: string, fieldName: string) {
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`${fieldName} must start with http:// or https://`)
    }
  } catch {
    throw new Error(`${fieldName} must be a valid URL`)
  }
}

function safeObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function normalizeCurrency(value: unknown): string {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : 'GBP'
  if (!VALID_CURRENCIES.has(normalized)) {
    throw new Error('Currency must be one of GBP, USD, EUR, or GHS')
  }
  return normalized
}

function normalizeEventType(input: unknown): string {
  const normalized = typeof input === 'string' ? input.trim().toLowerCase() : 'concert'
  if (!VALID_EVENT_TYPES.has(normalized)) {
    throw new Error('Unsupported event type')
  }
  return normalized
}

function normalizeFee(input: unknown): number | null {
  if (input === null || input === undefined || input === '') return null

  const parsed = typeof input === 'number' ? input : Number(input)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('Booking fee must be a valid positive number')
  }
  if (parsed > 1000000) {
    throw new Error('Booking fee is too large')
  }

  return Math.round(parsed * 100) / 100
}

function buildAddress(line1: string | null, city: string | null, country: string | null) {
  return {
    line1,
    city,
    country,
  }
}

function inferGigType(eventType: string, metadata: Record<string, unknown>) {
  const rawType = typeof metadata.gig_type === 'string' ? metadata.gig_type.trim().toLowerCase() : null
  if (rawType === 'streaming' || rawType === 'in_person') return rawType
  if (eventType === 'livestream') return 'streaming'
  return 'in_person'
}

function getScheduledPublishAt(metadata: Record<string, unknown> | null | undefined) {
  const safe = safeObject(metadata)
  const mode = typeof safe.publish_mode === 'string' ? safe.publish_mode : ''
  const publishAt = typeof safe.publish_at === 'string' ? safe.publish_at : ''
  if (mode !== 'scheduled' || !publishAt) return null

  const parsed = new Date(publishAt)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function formatDateInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''
  const day = parts.find((part) => part.type === 'day')?.value ?? ''

  if (!year || !month || !day) {
    throw new Error('Unable to derive local date from timezone')
  }

  return `${year}-${month}-${day}`
}

function parsePublishMetadata(metadata: Record<string, unknown>, nowIso: string) {
  const publishMode = metadata.publish_mode === 'scheduled' ? 'scheduled' : 'immediate'
  const rawPublishDate = typeof metadata.publish_date === 'string' ? metadata.publish_date.trim() : ''
  const rawPublishTime = typeof metadata.publish_time === 'string' ? metadata.publish_time.trim() : ''

  let publishDate: string | null = null
  let publishTime: string | null = null
  let publishAt: string | null = null

  if (publishMode === 'scheduled') {
    if (!rawPublishDate) {
      throw new Error('Scheduled publishing requires publish date.')
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawPublishDate)) {
      throw new Error('publish_date must use YYYY-MM-DD format.')
    }
    if (rawPublishTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(rawPublishTime)) {
      throw new Error('publish_time must use HH:MM 24-hour format.')
    }

    publishDate = rawPublishDate
    publishTime = rawPublishTime || '00:00'

    const parsedPublishAt = new Date(`${publishDate}T${publishTime}:00`)
    if (Number.isNaN(parsedPublishAt.getTime())) {
      throw new Error('Scheduled publish date/time is invalid.')
    }
    if (parsedPublishAt.getTime() <= Date.now()) {
      throw new Error('Scheduled publish date/time must be in the future.')
    }

    publishAt = parsedPublishAt.toISOString()
  }

  return {
    publishMode,
    publishDate,
    publishTime,
    publishAt,
    publishedAt: publishMode === 'immediate' ? nowIso : null,
  }
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function readObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function readStringFromObject(object: Record<string, unknown> | null, key: string): string | null {
  if (!object) return null
  return readString(object[key])
}

function readBooleanFromObject(object: Record<string, unknown> | null, key: string): boolean | null {
  if (!object) return null
  const value = object[key]
  return typeof value === 'boolean' ? value : null
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => readString(item))
    .filter((item): item is string => Boolean(item))
}

function normalizeAgeRestrictionMetadata(metadata: Record<string, unknown>) {
  const ageRestrictionMode = metadata.age_restriction_mode === 'has_restrictions'
    ? 'has_restrictions'
    : 'unknown'

  const normalizedAgeRestrictions = Array.from(
    new Set(readStringArray(metadata.age_restrictions))
  )

  if (ageRestrictionMode !== 'has_restrictions') {
    return {
      ageRestrictionMode,
      ageRestrictions: [],
      ageDisplay: null as string | null,
    }
  }

  if (normalizedAgeRestrictions.length === 0) {
    throw new Error('At least one age restriction option is required when restrictions are enabled.')
  }

  const invalidSelections = normalizedAgeRestrictions.filter((option) => !VALID_AGE_RESTRICTIONS.has(option))
  if (invalidSelections.length > 0) {
    throw new Error('One or more selected age restriction options are invalid.')
  }

  const hasAllAges = normalizedAgeRestrictions.includes('All ages')
  if (hasAllAges && normalizedAgeRestrictions.length > 1) {
    throw new Error('Choose either "All ages" or one "Over" and/or one "Under" age restriction.')
  }

  const overSelections = normalizedAgeRestrictions.filter((option) => option.startsWith('Over'))
  const underSelections = normalizedAgeRestrictions.filter((option) => option.startsWith('Under'))
  if (overSelections.length > 1 || underSelections.length > 1) {
    throw new Error('Age restrictions allow only one "Over" and one "Under" selection.')
  }

  const ageDisplay = hasAllAges
    ? 'Family Friendly'
    : [...overSelections, ...underSelections].join('. ') + '.'

  return {
    ageRestrictionMode,
    ageRestrictions: normalizedAgeRestrictions,
    ageDisplay,
  }
}

function isValidIsoDateTime(value: string | null) {
  if (!value) return false
  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime())
}

function toIsoOnDate(dateIso: string, timeValue: string) {
  const datePart = readString(dateIso)
  const timePart = readString(timeValue)
  if (!datePart || !timePart) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(timePart)) return null

  const composed = new Date(`${datePart}T${timePart}:00`)
  if (Number.isNaN(composed.getTime())) return null
  return composed.toISOString()
}

function resolveGigDisplayForArtistView(args: {
  booking: GigBookingRow
  gig: GigRow | undefined
  venue: VenueRow | undefined
  currentArtistDisplayName: string | null
}) {
  const { booking, gig, venue, currentArtistDisplayName } = args
  const metadata = safeObject(gig?.metadata)
  const venueOverride = safeObject(metadata.venue_override)

  const artistTitle = readString(gig?.title) || 'Untitled Gig'
  const artistDescription = readString(gig?.description) || null
  const artistArtwork = readString(metadata.artwork_url)
  const artistEntryRequirements = readString(metadata.age_display)
  const artistTicketSummary = readString(metadata.ticket_summary) || readString(metadata.ticket_mode)
  const artistDoorsOpen = readString(metadata.doors_open)
  const artistSetStart = readString(metadata.set_start_time)
  const artistSetEnd = readString(metadata.set_end_time)

  const venueTitle = readStringFromObject(venueOverride, 'title')
    || readStringFromObject(venueOverride, 'gig_event_name')
  const venueDescription = readStringFromObject(venueOverride, 'description')
  const venueArtwork = readStringFromObject(venueOverride, 'artwork_url')
    || readStringFromObject(venueOverride, 'image_url')
  const venueTicketSummary = readStringFromObject(venueOverride, 'ticket_summary')
    || readStringFromObject(venueOverride, 'ticket_details')
  const venueEntryRequirements = readStringFromObject(venueOverride, 'entry_requirements')
  const venueDoorsOpen = readStringFromObject(venueOverride, 'doors_open')
  const venueSetStart = readStringFromObject(venueOverride, 'set_start_time')
  const venueSetEnd = readStringFromObject(venueOverride, 'set_end_time')
  const venueStartDatetime = readStringFromObject(venueOverride, 'start_datetime')
  const venueEndDatetime = readStringFromObject(venueOverride, 'end_datetime')
  const venueNameFromOverride = readStringFromObject(venueOverride, 'venue_name')
  const venueAddressFromOverrideRaw =
    readStringFromObject(venueOverride, 'venue_address') ||
    readStringFromObject(venueOverride, 'address') ||
    readAddressLine(readObject(venueOverride.address))
  const venueAddressFromOverride = normalizeDisplayAddress(venueAddressFromOverrideRaw)
  const venueNameFromArtist = readString(metadata.venue_name)
  const venueAddressFromArtist = normalizeDisplayAddress(readString(metadata.venue_address))
  const venueAddressFromVenueRecord = normalizeDisplayAddress(readAddressLine(venue?.address))
  const resolvedVenueName = venue?.name || venueNameFromOverride || venueNameFromArtist || 'Venue TBD'
  const resolvedVenueAddress =
    venueAddressFromVenueRecord ||
    venueAddressFromOverride ||
    venueAddressFromArtist ||
    'Address unavailable'

  const hasVenueSubmission =
    Boolean(venueTitle) ||
    Boolean(venueDescription) ||
    Boolean(venueArtwork) ||
    Boolean(venueTicketSummary) ||
    Boolean(venueEntryRequirements) ||
    Boolean(venueDoorsOpen) ||
    Boolean(venueSetStart) ||
    Boolean(venueSetEnd) ||
    Boolean(venueStartDatetime) ||
    Boolean(venueEndDatetime) ||
    readBooleanFromObject(venueOverride, 'is_official') === true

  const venueInitiatedBooking = booking.booked_by !== null && booking.booked_by !== booking.artist_id
  const sourceOfTruth: GigSourceOfTruth = (hasVenueSubmission || venueInitiatedBooking) ? 'venue' : 'artist'
  const mergeStatus: GigMergeStatus =
    hasVenueSubmission
      ? 'merged'
      : sourceOfTruth === 'venue'
        ? 'venue_only'
        : 'artist_only'

  const resolvedTitle = sourceOfTruth === 'venue'
    ? (venueTitle || artistTitle)
    : artistTitle
  const resolvedDescription = sourceOfTruth === 'venue'
    ? (venueDescription || artistDescription)
    : artistDescription
  const resolvedArtwork = sourceOfTruth === 'venue'
    ? (venueArtwork || artistArtwork)
    : artistArtwork
  const resolvedTicketSummary = sourceOfTruth === 'venue'
    ? (venueTicketSummary || artistTicketSummary)
    : artistTicketSummary
  const resolvedEntryRequirements = sourceOfTruth === 'venue'
    ? (venueEntryRequirements || artistEntryRequirements)
    : artistEntryRequirements
  const resolvedDoorsOpen = sourceOfTruth === 'venue'
    ? (venueDoorsOpen || artistDoorsOpen)
    : artistDoorsOpen
  const resolvedSetStart = sourceOfTruth === 'venue'
    ? (venueSetStart || artistSetStart)
    : artistSetStart
  const resolvedSetEnd = sourceOfTruth === 'venue'
    ? (venueSetEnd || artistSetEnd)
    : artistSetEnd

  const fallbackStartDatetime = readString(gig?.start_datetime)
  const fallbackEndDatetime = readString(gig?.end_datetime)
  const resolvedStartDatetime = sourceOfTruth === 'venue' && isValidIsoDateTime(venueStartDatetime)
    ? venueStartDatetime
    : fallbackStartDatetime
  const resolvedEndDatetime = sourceOfTruth === 'venue' && isValidIsoDateTime(venueEndDatetime)
    ? venueEndDatetime
    : fallbackEndDatetime

  const agreedDate = readString(metadata.agreed_gig_date)
    || (resolvedStartDatetime ? formatDateInTimezone(new Date(resolvedStartDatetime), readString(gig?.timezone) || 'UTC') : null)

  const artistSpecificStart = toIsoOnDate(agreedDate || '', artistSetStart || '') || resolvedStartDatetime
  const artistSpecificEnd = toIsoOnDate(agreedDate || '', artistSetEnd || '') || resolvedEndDatetime
  const otherArtists = readStringArray(metadata.other_artists)

  return {
    sourceOfTruth,
    mergeStatus,
    resolvedTitle,
    resolvedDescription,
    resolvedArtwork,
    resolvedTicketSummary,
    resolvedEntryRequirements,
    resolvedDoorsOpen,
    resolvedSetStart,
    resolvedSetEnd,
    resolvedStartDatetime,
    resolvedEndDatetime,
    artistTile: {
      headerArtistName: currentArtistDisplayName || readString(metadata.artist_display_name) || 'Artist',
      performanceStartDatetime: artistSpecificStart,
      performanceEndDatetime: artistSpecificEnd,
      otherArtists,
      hasOtherArtists: otherArtists.length > 0,
      sourceOfTruth,
      venueDataSupersedes: sourceOfTruth === 'venue',
    },
    publicDisplay: {
      sourceOfTruth,
      mergeStatus,
      title: resolvedTitle,
      description: resolvedDescription,
      artworkUrl: resolvedArtwork,
      ticketEntryDetails: resolvedTicketSummary,
      entryRequirements: resolvedEntryRequirements,
      doorsOpen: resolvedDoorsOpen,
      setStartTime: resolvedSetStart,
      setEndTime: resolvedSetEnd,
      startDatetime: resolvedStartDatetime,
      endDatetime: resolvedEndDatetime,
      venueName: resolvedVenueName,
      venueAddress: resolvedVenueAddress,
      venueDataSupersedesArtistData: sourceOfTruth === 'venue',
      dataPolicy: sourceOfTruth === 'venue'
        ? 'Venue data currently supersedes artist data for public display.'
        : 'Artist data is displayed until venue official data is provided.',
    }
  }
}

function parseRequestBody<T>(body: unknown): T {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Invalid JSON payload')
  }
  return body as T
}

async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignore from Server Components
          }
        },
      },
    }
  )
}

async function findOwnedBooking(serviceSupabase: ReturnType<typeof createServiceClient>, userId: string, bookingId: string) {
  const { data: booking, error: bookingError } = await serviceSupabase
    .from('gig_bookings')
    .select('id, gig_id, artist_id, venue_id, booking_status, booked_by, booked_at, confirmed_at, cancelled_at')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    if (isMissingTableError(bookingError)) {
      throw new Error('Gig bookings are not available yet in this environment.')
    }
    throw new Error('Booking not found')
  }

  if (booking.artist_id !== userId) {
    throw new Error('Forbidden')
  }

  return booking
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const view = getViewParam(searchParams.get('view'))
    const statusFilter = parseStatusFilter(searchParams.get('status'))
    const dateFrom = parseQueryDate(searchParams.get('date_from'), 'date_from')
    const dateTo = parseQueryDate(searchParams.get('date_to'), 'date_to')
    const limit = parseLimit(searchParams.get('limit'))
    const offset = parseOffset(searchParams.get('offset'))

    if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
      return NextResponse.json({ error: 'date_from cannot be after date_to' }, { status: 400 })
    }

    let bookingQuery = serviceSupabase
      .from('gig_bookings')
      .select('id, gig_id, artist_id, venue_id, booking_status, booking_fee, currency, special_requests, booked_by, booked_at, confirmed_at, cancelled_at, cancellation_reason')
      .eq('artist_id', user.id)
      .order('booked_at', { ascending: false, nullsFirst: false })
      .limit(BOOKING_FETCH_LIMIT)

    if (statusFilter.length > 0) {
      bookingQuery = bookingQuery.in('booking_status', statusFilter)
    }

    const { data: bookingRows, error: bookingError } = await bookingQuery

    if (bookingError) {
      if (isMissingTableError(bookingError)) {
        return NextResponse.json({
          success: true,
          data: [],
          view,
          warning: 'Gig tables are not available yet in this environment.'
        })
      }
      console.error('Artist gigs GET: booking query failed', bookingError)
      return NextResponse.json({ error: 'Failed to load gigs', details: bookingError.message }, { status: 500 })
    }

    const bookings = (bookingRows ?? []) as GigBookingRow[]
    const gigIds = Array.from(new Set(bookings.map((row) => row.gig_id).filter(Boolean))) as string[]
    const venueIds = Array.from(new Set(bookings.map((row) => row.venue_id).filter(Boolean))) as string[]

    let gigsById = new Map<string, GigRow>()
    if (gigIds.length > 0) {
      const { data: gigRows, error: gigError } = await serviceSupabase
        .from('gigs')
        .select('id, title, description, event_type, start_datetime, end_datetime, timezone, gig_status, venue_id, metadata')
        .in('id', gigIds)

      if (gigError) {
        if (!isMissingTableError(gigError)) {
          console.error('Artist gigs GET: gigs query failed', gigError)
          return NextResponse.json({ error: 'Failed to load gig details', details: gigError.message }, { status: 500 })
        }
      } else {
        const fetchedRows = (gigRows ?? []) as GigRow[]
        const now = Date.now()
        const dueToAutoPublish = fetchedRows.filter((row) => {
          if (row.gig_status !== 'draft') return false
          const publishAt = getScheduledPublishAt(row.metadata)
          if (!publishAt) return false
          return publishAt.getTime() <= now
        })

        if (dueToAutoPublish.length > 0) {
          const nowIso = new Date().toISOString()
          await Promise.all(
            dueToAutoPublish.map(async (gig) => {
              const metadata = safeObject(gig.metadata)
              const updatedMetadata = {
                ...metadata,
                publish_mode: 'immediate',
                publish_at: null,
                published_at: nowIso,
              }
              const { error: autoPublishError } = await serviceSupabase
                .from('gigs')
                .update({
                  gig_status: 'published',
                  metadata: updatedMetadata,
                  updated_at: nowIso,
                })
                .eq('id', gig.id)

              if (autoPublishError) {
                console.warn('Artist gigs GET: auto publish failed', { gigId: gig.id, autoPublishError })
              }
            })
          )

          const dueGigIds = new Set(dueToAutoPublish.map((gig) => gig.id))
          gigsById = new Map(
            fetchedRows.map((row) => {
              if (!dueGigIds.has(row.id)) return [row.id, row]
              const metadata = safeObject(row.metadata)
              return [row.id, {
                ...row,
                gig_status: 'published' as GigStatus,
                metadata: {
                  ...metadata,
                  publish_mode: 'immediate',
                  publish_at: null,
                  published_at: nowIso,
                }
              }]
            })
          )
        } else {
          gigsById = new Map(fetchedRows.map((row) => [row.id, row]))
        }
      }
    }

    let venuesById = new Map<string, VenueRow>()
    if (venueIds.length > 0) {
      const { data: venueRows, error: venueError } = await serviceSupabase
        .from('venues')
        .select('id, owner_id, name, address')
        .in('id', venueIds)

      if (venueError) {
        if (!isMissingTableError(venueError)) {
          console.error('Artist gigs GET: venues query failed', venueError)
          return NextResponse.json({ error: 'Failed to load venue details', details: venueError.message }, { status: 500 })
        }
      } else {
        venuesById = new Map((venueRows ?? []).map((row) => [row.id, row as VenueRow]))
      }
    }

    let currentArtistDisplayName: string | null = null
    const { data: artistProfileRow, error: artistProfileError } = await serviceSupabase
      .from('artist_profiles')
      .select('stage_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (artistProfileError && !isMissingTableError(artistProfileError)) {
      console.warn('Artist gigs GET: artist profile lookup failed', artistProfileError)
    } else {
      const stageName = readString((artistProfileRow as { stage_name?: unknown } | null)?.stage_name)
      currentArtistDisplayName = stageName
    }

    const gigsForFanCommsDispatch = Array.from(gigsById.values()).map((gig) => ({
      id: gig.id,
      title: gig.title,
      venue_id: gig.venue_id,
      metadata: gig.metadata || null,
      gig_status: gig.gig_status || null,
    }))

    if (gigsForFanCommsDispatch.length > 0) {
      const dispatchResult = await dispatchDueFanCommsForArtistGigs({
        serviceSupabase,
        artistUserId: user.id,
        artistDisplayName: currentArtistDisplayName || 'Artist',
        gigs: gigsForFanCommsDispatch,
      })

      if (dispatchResult.updatedGigMetadataById.size > 0) {
        gigsById = new Map(
          Array.from(gigsById.entries()).map(([gigId, gigRow]) => {
            const updatedMetadata = dispatchResult.updatedGigMetadataById.get(gigId)
            if (!updatedMetadata) {
              return [gigId, gigRow] as const
            }
            return [gigId, {
              ...gigRow,
              metadata: updatedMetadata,
            }] as const
          })
        )
      }
    }

    const enriched = bookings.map((booking) => {
      const gig = booking.gig_id ? gigsById.get(booking.gig_id) : undefined
      const venue = booking.venue_id ? venuesById.get(booking.venue_id) : undefined
      const isInvite = booking.booked_by !== null && booking.booked_by !== user.id
      const isRequest = booking.booked_by === user.id
      const resolved = resolveGigDisplayForArtistView({
        booking,
        gig,
        venue,
        currentArtistDisplayName
      })

      return {
        id: booking.id,
        gigId: booking.gig_id,
        bookingStatus: booking.booking_status,
        bookingFee: booking.booking_fee,
        currency: booking.currency || 'GBP',
        specialRequests: booking.special_requests,
        bookedAt: booking.booked_at,
        confirmedAt: booking.confirmed_at,
        cancelledAt: booking.cancelled_at,
        cancellationReason: booking.cancellation_reason,
        bookedBy: booking.booked_by,
        isInvite,
        isRequest,
        gigTitle: resolved.resolvedTitle,
        description: resolved.resolvedDescription,
        metadata: gig?.metadata || null,
        eventType: gig?.event_type || 'concert',
        startDatetime: resolved.resolvedStartDatetime,
        endDatetime: resolved.resolvedEndDatetime,
        timezone: gig?.timezone || 'UTC',
        gigStatus: gig?.gig_status || null,
        venueName: resolved.publicDisplay.venueName,
        venueAddress: resolved.publicDisplay.venueAddress,
        sourceOfTruth: resolved.sourceOfTruth,
        mergeStatus: resolved.mergeStatus,
        publicDisplay: resolved.publicDisplay,
        artistTile: resolved.artistTile,
      }
    })

    const viewFiltered = (() => {
      if (view === 'invites') return enriched.filter((row) => row.isInvite)
      if (view === 'requests') return enriched.filter((row) => row.isRequest)
      return enriched
    })()

    const dateFiltered = viewFiltered.filter((row) => {
      if (!dateFrom && !dateTo) return true
      if (!row.startDatetime) return false

      const startDate = new Date(row.startDatetime)
      if (Number.isNaN(startDate.getTime())) return false
      if (dateFrom && startDate.getTime() < dateFrom.getTime()) return false
      if (dateTo && startDate.getTime() > dateTo.getTime()) return false
      return true
    })

    const total = dateFiltered.length
    const paginated = dateFiltered.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      view,
      data: paginated,
      summary: {
        total,
        pending: dateFiltered.filter((item) => item.bookingStatus === 'pending').length,
        confirmed: dateFiltered.filter((item) => item.bookingStatus === 'confirmed').length,
        completed: dateFiltered.filter((item) => item.bookingStatus === 'completed').length
      },
      filters: {
        status: statusFilter,
        date_from: dateFrom ? dateFrom.toISOString() : null,
        date_to: dateTo ? dateTo.toISOString() : null
      },
      pagination: {
        total,
        limit,
        offset,
        returned: paginated.length,
        has_more: offset + paginated.length < total
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (
      message.includes('Invalid status filter') ||
      message.includes('date_from must be') ||
      message.includes('date_to must be') ||
      message.includes('limit must be') ||
      message.includes('offset must be')
    ) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    console.error('Artist gigs GET: unexpected error', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: message
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = parseRequestBody<{ bookingId?: string; action?: GigAction }>(await request.json())
    const bookingId = toTrimmedString(body.bookingId)
    const action = body.action

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'bookingId and action are required' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    let booking

    try {
      booking = await findOwnedBooking(serviceSupabase, user.id, bookingId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Booking not found'
      if (message.includes('not available yet')) {
        return NextResponse.json({ error: message }, { status: 400 })
      }
      if (message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.json({ error: message }, { status: 404 })
    }

    const nowIso = new Date().toISOString()
    let patch: Record<string, unknown> | null = null

    if (action === 'accept_invite') {
      if (booking.booked_by === user.id) {
        return NextResponse.json({ error: 'This booking is not an invite.' }, { status: 400 })
      }
      if (booking.booking_status !== 'pending') {
        return NextResponse.json({ error: 'Only pending invites can be accepted.' }, { status: 400 })
      }
      patch = { booking_status: 'confirmed', confirmed_at: nowIso, cancelled_at: null, cancellation_reason: null }
    }

    if (action === 'decline_invite') {
      if (booking.booked_by === user.id) {
        return NextResponse.json({ error: 'This booking is not an invite.' }, { status: 400 })
      }
      if (booking.booking_status !== 'pending') {
        return NextResponse.json({ error: 'Only pending invites can be declined.' }, { status: 400 })
      }
      patch = { booking_status: 'cancelled', cancelled_at: nowIso, cancellation_reason: 'Declined by artist' }
    }

    if (action === 'cancel_request') {
      if (booking.booked_by !== user.id) {
        return NextResponse.json({ error: 'Only outbound requests can be cancelled.' }, { status: 400 })
      }
      if (booking.booking_status !== 'pending') {
        return NextResponse.json({ error: 'Only pending requests can be cancelled.' }, { status: 400 })
      }
      patch = { booking_status: 'cancelled', cancelled_at: nowIso, cancellation_reason: 'Cancelled by artist' }
    }

    if (action === 'mark_completed') {
      if (booking.booking_status !== 'confirmed') {
        return NextResponse.json({ error: 'Only confirmed gigs can be marked completed.' }, { status: 400 })
      }
      if (!booking.gig_id) {
        return NextResponse.json({ error: 'Booking has no linked gig.' }, { status: 400 })
      }

      const { data: gig, error: gigError } = await serviceSupabase
        .from('gigs')
        .select('start_datetime')
        .eq('id', booking.gig_id)
        .single()

      if (gigError || !gig) {
        return NextResponse.json({ error: 'Linked gig not found.' }, { status: 404 })
      }

      const startDate = new Date(gig.start_datetime)
      if (!Number.isNaN(startDate.getTime()) && startDate.getTime() > Date.now()) {
        return NextResponse.json({ error: 'You can only mark a gig completed after it starts.' }, { status: 400 })
      }

      patch = { booking_status: 'completed' }
    }

    if (action === 'publish_now') {
      if (!booking.gig_id) {
        return NextResponse.json({ error: 'Booking has no linked gig.' }, { status: 400 })
      }
      if (booking.booked_by !== user.id) {
        return NextResponse.json({ error: 'Only gigs you created can be published.' }, { status: 403 })
      }

      const { data: gig, error: gigError } = await serviceSupabase
        .from('gigs')
        .select('id, metadata, gig_status')
        .eq('id', booking.gig_id)
        .single()

      if (gigError || !gig) {
        return NextResponse.json({ error: 'Linked gig not found.' }, { status: 404 })
      }

      const currentMetadata = safeObject(gig.metadata)
      const updatedMetadata = {
        ...currentMetadata,
        publish_mode: 'immediate',
        publish_at: null,
        published_at: nowIso,
      }

      const { error: publishError } = await serviceSupabase
        .from('gigs')
        .update({
          gig_status: 'published',
          metadata: updatedMetadata,
          updated_at: nowIso,
        })
        .eq('id', gig.id)

      if (publishError) {
        return NextResponse.json({ error: 'Failed to publish gig now', details: publishError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: {
          bookingId: booking.id,
          gigId: gig.id,
          gigStatus: 'published'
        }
      })
    }

    if (!patch) {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await serviceSupabase
      .from('gig_bookings')
      .update(patch)
      .eq('id', bookingId)
      .select('id, booking_status, confirmed_at, cancelled_at, cancellation_reason')
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update booking', details: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Artist gigs PATCH: unexpected error', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = parseRequestBody<GigUpdatePayload>(await request.json())
    const bookingId = toTrimmedString(body.bookingId)

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    let booking

    try {
      booking = await findOwnedBooking(serviceSupabase, user.id, bookingId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Booking not found'
      if (message.includes('not available yet')) {
        return NextResponse.json({ error: message }, { status: 400 })
      }
      if (message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.json({ error: message }, { status: 404 })
    }

    if (!booking.gig_id) {
      return NextResponse.json({ error: 'Booking has no linked gig.' }, { status: 400 })
    }

    if (booking.booked_by !== user.id) {
      return NextResponse.json({ error: 'Only gigs you created can be edited.' }, { status: 403 })
    }

    if (booking.booking_status === 'cancelled' || booking.booking_status === 'completed') {
      return NextResponse.json({ error: 'Cancelled/completed gigs cannot be edited.' }, { status: 400 })
    }

    const { data: existingGig, error: existingGigError } = await serviceSupabase
      .from('gigs')
      .select('id, title, description, event_type, start_datetime, end_datetime, timezone, gig_status, venue_id, metadata')
      .eq('id', booking.gig_id)
      .single()

    if (existingGigError || !existingGig) {
      return NextResponse.json({ error: 'Linked gig not found.' }, { status: 404 })
    }

    const existingMetadata = safeObject(existingGig.metadata)
    const titleInput = body.title === undefined ? existingGig.title : toTrimmedString(body.title)

    if (!titleInput) {
      return NextResponse.json({ error: 'Gig title is required.' }, { status: 400 })
    }
    if (titleInput.length > 140) {
      return NextResponse.json({ error: 'Gig title cannot exceed 140 characters.' }, { status: 400 })
    }

    const eventType = body.event_type === undefined
      ? normalizeEventType(existingGig.event_type || 'concert')
      : normalizeEventType(body.event_type)

    const timezone = body.timezone === undefined
      ? (existingGig.timezone || 'UTC')
      : toTrimmedString(body.timezone)

    if (!timezone || !validateTimezone(timezone)) {
      return NextResponse.json({ error: 'A valid timezone is required.' }, { status: 400 })
    }

    const startRaw = body.start_datetime === undefined ? existingGig.start_datetime : body.start_datetime
    const startDate = parseIsoDateTime(startRaw, 'start_datetime')

    const endRaw = body.end_datetime === undefined ? existingGig.end_datetime : body.end_datetime
    const endDate = endRaw ? parseIsoDateTime(endRaw, 'end_datetime') : null

    if (endDate && endDate.getTime() <= startDate.getTime()) {
      return NextResponse.json({ error: 'end_datetime must be after start_datetime.' }, { status: 400 })
    }

    const startDateKey = formatDateInTimezone(startDate, timezone)
    if (endDate) {
      const endDateKey = formatDateInTimezone(endDate, timezone)
      if (endDateKey !== startDateKey) {
        return NextResponse.json({ error: 'start_datetime and end_datetime must be on the same agreed date.' }, { status: 400 })
      }
    }

    const description = body.description === undefined
      ? existingGig.description
      : toOptionalTrimmedString(body.description)

    const incomingMetadata = body.metadata ? safeObject(body.metadata) : {}
    const mergedMetadata = {
      ...existingMetadata,
      ...incomingMetadata,
    }

    let normalizedAgeMetadata
    try {
      normalizedAgeMetadata = normalizeAgeRestrictionMetadata(mergedMetadata)
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid age restriction metadata.' }, { status: 400 })
    }

    const incomingAgreedDate = typeof mergedMetadata.agreed_gig_date === 'string'
      ? mergedMetadata.agreed_gig_date.trim()
      : ''
    if (incomingAgreedDate && incomingAgreedDate !== startDateKey) {
      return NextResponse.json({ error: 'agreed_gig_date must match the start date.' }, { status: 400 })
    }

    const ticketAvailability = typeof mergedMetadata.ticket_availability === 'string'
      ? mergedMetadata.ticket_availability
      : null
    if (ticketAvailability && !VALID_TICKET_AVAILABILITY.has(ticketAvailability)) {
      return NextResponse.json({ error: 'Invalid ticket availability value.' }, { status: 400 })
    }

    const normalizedTicketAvailability = ticketAvailability === 'custom'
      ? 'less_than_full_venue_capacity'
      : ticketAvailability === 'full_capacity'
        ? 'full_venue_capacity'
        : ticketAvailability
    const customTicketCount = normalizedTicketAvailability === 'less_than_full_venue_capacity'
      ? Number(mergedMetadata.custom_ticket_count)
      : null
    const hasValidCustomTicketCount =
      typeof customTicketCount === 'number' &&
      Number.isFinite(customTicketCount) &&
      customTicketCount > 0
    if (normalizedTicketAvailability === 'less_than_full_venue_capacity' && !hasValidCustomTicketCount) {
      return NextResponse.json({ error: 'custom_ticket_count must be a positive number when ticket availability is less than full venue capacity.' }, { status: 400 })
    }

    const liveStreamUrl = typeof mergedMetadata.live_stream_url === 'string' ? mergedMetadata.live_stream_url.trim() : ''
    const gigType = inferGigType(eventType, mergedMetadata)

    if (gigType === 'streaming' && !liveStreamUrl) {
      return NextResponse.json({ error: 'Live streaming gigs require a stream URL.' }, { status: 400 })
    }

    if (liveStreamUrl) {
      try {
        validateUrl(liveStreamUrl, 'live_stream_url')
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid stream URL.' }, { status: 400 })
      }
    }

    let venueIdToUse: string | null = existingGig.venue_id

    const hasVenueNameInput = body.venue_name !== undefined
    const hasVenueAddressInput = body.venue_address !== undefined
    const hasVenueCityInput = body.venue_city !== undefined
    const hasVenueCountryInput = body.venue_country !== undefined
    const venueNameInput = hasVenueNameInput ? toOptionalTrimmedString(body.venue_name) : null
    const venueAddressInput = hasVenueAddressInput ? toOptionalTrimmedString(body.venue_address) : null
    const venueCityInput = hasVenueCityInput ? toOptionalTrimmedString(body.venue_city) : null
    const venueCountryInput = hasVenueCountryInput ? toOptionalTrimmedString(body.venue_country) : null

    if (gigType === 'in_person') {
      const effectiveVenueName = venueNameInput || (existingGig.venue_id ? null : null)

      if (!existingGig.venue_id && !effectiveVenueName) {
        return NextResponse.json({ error: 'In-person gigs require a venue name.' }, { status: 400 })
      }

      if (venueNameInput) {
        if (existingGig.venue_id) {
          const venueUpdatePayload: Record<string, unknown> = {
            name: venueNameInput,
            updated_at: new Date().toISOString(),
          }
          if (hasVenueAddressInput || hasVenueCityInput || hasVenueCountryInput) {
            venueUpdatePayload.address = buildAddress(venueAddressInput, venueCityInput, venueCountryInput)
          }

          await serviceSupabase
            .from('venues')
            .update(venueUpdatePayload)
            .eq('id', existingGig.venue_id)

          venueIdToUse = existingGig.venue_id
        } else {
          const { data: createdVenue, error: venueInsertError } = await serviceSupabase
            .from('venues')
            .insert({
              owner_id: user.id,
              name: venueNameInput,
              address: buildAddress(venueAddressInput, venueCityInput, venueCountryInput),
            })
            .select('id')
            .single()

          if (venueInsertError || !createdVenue) {
            return NextResponse.json({ error: 'Failed to create venue for gig.', details: venueInsertError?.message }, { status: 500 })
          }
          venueIdToUse = createdVenue.id
        }
      }
    } else {
      venueIdToUse = null
    }

    const nowIso = new Date().toISOString()
    let publishMeta
    try {
      publishMeta = parsePublishMetadata(mergedMetadata, nowIso)
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid publish metadata.' }, { status: 400 })
    }

    const nextGigStatus: GigStatus =
      publishMeta.publishMode === 'scheduled'
        ? 'draft'
        : (existingGig.gig_status === 'cancelled' || existingGig.gig_status === 'completed'
            ? existingGig.gig_status
            : 'published')

    const { data: updatedGig, error: gigUpdateError } = await serviceSupabase
      .from('gigs')
      .update({
        title: titleInput,
        description,
        event_type: eventType,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate ? endDate.toISOString() : null,
        timezone,
        metadata: {
          ...mergedMetadata,
          agreed_gig_date: startDateKey,
          gig_type: gigType,
          live_stream_url: liveStreamUrl || null,
          age_restriction_mode: normalizedAgeMetadata.ageRestrictionMode,
          age_restrictions: normalizedAgeMetadata.ageRestrictions,
          age_display: normalizedAgeMetadata.ageDisplay,
          ticket_availability: normalizedTicketAvailability,
          custom_ticket_count: normalizedTicketAvailability === 'less_than_full_venue_capacity'
            ? Math.floor(customTicketCount as number)
            : null,
          publish_mode: publishMeta.publishMode,
          publish_date: publishMeta.publishDate,
          publish_time: publishMeta.publishTime,
          publish_at: publishMeta.publishAt,
          published_at: publishMeta.publishedAt,
        },
        gig_status: nextGigStatus,
        venue_id: venueIdToUse,
        updated_at: nowIso,
      })
      .eq('id', existingGig.id)
      .select('id, title, event_type, start_datetime, end_datetime, timezone, venue_id, metadata')
      .single()

    if (gigUpdateError || !updatedGig) {
      return NextResponse.json({ error: 'Failed to update gig details.', details: gigUpdateError?.message }, { status: 500 })
    }

    if (booking.venue_id !== venueIdToUse) {
      const { error: bookingVenueError } = await serviceSupabase
        .from('gig_bookings')
        .update({ venue_id: venueIdToUse })
        .eq('id', booking.id)

      if (bookingVenueError) {
        console.warn('Gig updated but booking venue sync failed', bookingVenueError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        gig: updatedGig,
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('valid date/time') || message.includes('Unable to derive local date')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    console.error('Artist gigs PUT: unexpected error', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = parseRequestBody<Record<string, unknown>>(await request.json())

    const title = toTrimmedString(body.title)
    if (!title) {
      return NextResponse.json({ error: 'Gig title is required.' }, { status: 400 })
    }
    if (title.length > 140) {
      return NextResponse.json({ error: 'Gig title cannot exceed 140 characters.' }, { status: 400 })
    }

    const eventType = normalizeEventType(body.event_type)
    const startDatetimeValue = toTrimmedString(body.start_datetime)
    if (!startDatetimeValue) {
      return NextResponse.json({ error: 'Start date & time is required.' }, { status: 400 })
    }

    const startDatetime = parseIsoDateTime(startDatetimeValue, 'start_datetime')
    const endDatetimeValue = toOptionalTrimmedString(body.end_datetime)
    const endDatetime = endDatetimeValue ? parseIsoDateTime(endDatetimeValue, 'end_datetime') : null

    if (endDatetime && endDatetime.getTime() <= startDatetime.getTime()) {
      return NextResponse.json({ error: 'End date/time must be after start date/time.' }, { status: 400 })
    }

    const timezone = toTrimmedString(body.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    if (!validateTimezone(timezone)) {
      return NextResponse.json({ error: 'Timezone is invalid.' }, { status: 400 })
    }

    const startDateKey = formatDateInTimezone(startDatetime, timezone)
    if (endDatetime) {
      const endDateKey = formatDateInTimezone(endDatetime, timezone)
      if (endDateKey !== startDateKey) {
        return NextResponse.json({ error: 'Start and end date/time must be on a single agreed date.' }, { status: 400 })
      }
    }

    const description = toOptionalTrimmedString(body.description)
    const venueName = toOptionalTrimmedString(body.venue_name)
    const venueAddress = toOptionalTrimmedString(body.venue_address)
    const venueCity = toOptionalTrimmedString(body.venue_city)
    const venueCountry = toOptionalTrimmedString(body.venue_country)
    const bookingFee = normalizeFee(body.booking_fee)
    const currency = normalizeCurrency(body.currency)
    const specialRequests = toOptionalTrimmedString(body.special_requests)
    const metadata = safeObject(body.metadata)

    let normalizedAgeMetadata
    try {
      normalizedAgeMetadata = normalizeAgeRestrictionMetadata(metadata)
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid age restriction metadata.' }, { status: 400 })
    }

    const agreedDateInput = typeof metadata.agreed_gig_date === 'string' ? metadata.agreed_gig_date.trim() : ''
    if (agreedDateInput && agreedDateInput !== startDateKey) {
      return NextResponse.json({ error: 'agreed_gig_date must match the start date.' }, { status: 400 })
    }

    const gigType = inferGigType(eventType, metadata)
    if (gigType === 'in_person' && !venueName) {
      return NextResponse.json({ error: 'Venue name is required for in-person gigs.' }, { status: 400 })
    }

    const liveStreamUrl = typeof metadata.live_stream_url === 'string' ? metadata.live_stream_url.trim() : ''
    if (gigType === 'streaming' && !liveStreamUrl) {
      return NextResponse.json({ error: 'Live stream URL is required for streaming gigs.' }, { status: 400 })
    }
    if (liveStreamUrl) {
      try {
        validateUrl(liveStreamUrl, 'Live stream URL')
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid live stream URL.' }, { status: 400 })
      }
    }

    const nowIso = new Date().toISOString()
    let publishMeta
    try {
      publishMeta = parsePublishMetadata(metadata, nowIso)
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid publish metadata.' }, { status: 400 })
    }

    const ticketAvailability = typeof metadata.ticket_availability === 'string'
      ? metadata.ticket_availability
      : null
    if (ticketAvailability && !VALID_TICKET_AVAILABILITY.has(ticketAvailability)) {
      return NextResponse.json({ error: 'Invalid ticket availability value.' }, { status: 400 })
    }
    const normalizedTicketAvailability = ticketAvailability === 'custom'
      ? 'less_than_full_venue_capacity'
      : ticketAvailability === 'full_capacity'
        ? 'full_venue_capacity'
        : ticketAvailability
    const customTicketCount = normalizedTicketAvailability === 'less_than_full_venue_capacity'
      ? Number(metadata.custom_ticket_count)
      : null
    const hasValidCustomTicketCount =
      typeof customTicketCount === 'number' &&
      Number.isFinite(customTicketCount) &&
      customTicketCount > 0
    if (normalizedTicketAvailability === 'less_than_full_venue_capacity' && !hasValidCustomTicketCount) {
      return NextResponse.json({ error: 'custom_ticket_count must be a positive number when ticket availability is less than full venue capacity.' }, { status: 400 })
    }

    if (typeof metadata.third_party_ticket_link === 'string' && metadata.third_party_ticket_link.trim()) {
      try {
        validateUrl(metadata.third_party_ticket_link.trim(), 'Third-party ticket link')
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid ticket link.' }, { status: 400 })
      }
    }

    const ticketPriceOnline = normalizeFee(metadata.ticket_price_online)
    const ticketPriceVenue = normalizeFee(metadata.ticket_price_venue)
    const ticketPrice = (ticketPriceOnline !== null || ticketPriceVenue !== null)
      ? {
          online: ticketPriceOnline,
          venue: ticketPriceVenue,
          currency,
        }
      : null

    const serviceSupabase = createServiceClient()

    let venueId: string | null = null
    if (gigType === 'in_person' && venueName) {
      const addressPayload = buildAddress(venueAddress, venueCity, venueCountry)

      const { data: existingVenue, error: existingVenueError } = await serviceSupabase
        .from('venues')
        .select('id')
        .eq('owner_id', user.id)
        .ilike('name', venueName)
        .limit(1)
        .maybeSingle()

      if (existingVenueError && !isMissingTableError(existingVenueError)) {
        console.warn('Artist gigs POST: venue lookup failed, creating new venue', existingVenueError)
      }

      if (existingVenue?.id) {
        venueId = existingVenue.id
      } else {
        const venueContact = metadata.venue_contact && typeof metadata.venue_contact === 'object'
          ? metadata.venue_contact
          : null

        const { data: venue, error: venueError } = await serviceSupabase
          .from('venues')
          .insert({
            owner_id: user.id,
            name: venueName,
            address: addressPayload,
            contact_details: venueContact,
          })
          .select('id')
          .single()

        if (venueError) {
          if (isMissingTableError(venueError)) {
            return NextResponse.json({ error: 'Venue tables are not available yet in this environment.' }, { status: 400 })
          }
          console.error('Artist gigs POST: venue insert failed', venueError)
          return NextResponse.json({ error: 'Failed to prepare venue details', details: venueError.message }, { status: 500 })
        }

        venueId = venue.id
      }
    }

    const gigStatus: GigStatus = publishMeta.publishMode === 'scheduled' ? 'draft' : 'published'
    const mergedMetadata = {
      ...metadata,
      agreed_gig_date: startDateKey,
      gig_type: gigType,
      live_stream_url: liveStreamUrl || null,
      age_restriction_mode: normalizedAgeMetadata.ageRestrictionMode,
      age_restrictions: normalizedAgeMetadata.ageRestrictions,
      age_display: normalizedAgeMetadata.ageDisplay,
      ticket_availability: normalizedTicketAvailability,
      custom_ticket_count: normalizedTicketAvailability === 'less_than_full_venue_capacity'
        ? Math.floor(customTicketCount as number)
        : null,
      publish_mode: publishMeta.publishMode,
      publish_date: publishMeta.publishDate,
      publish_time: publishMeta.publishTime,
      publish_at: publishMeta.publishAt,
      published_at: publishMeta.publishedAt,
    }

    const { data: gig, error: gigError } = await serviceSupabase
      .from('gigs')
      .insert({
        title,
        description,
        organizer_id: user.id,
        venue_id: venueId,
        artist_ids: [user.id],
        gig_status: gigStatus,
        event_type: eventType,
        start_datetime: startDatetime.toISOString(),
        end_datetime: endDatetime ? endDatetime.toISOString() : null,
        timezone,
        ticket_price: ticketPrice,
        metadata: mergedMetadata,
      })
      .select('id')
      .single()

    if (gigError) {
      if (isMissingTableError(gigError)) {
        return NextResponse.json({ error: 'Gig tables are not available yet in this environment.' }, { status: 400 })
      }
      console.error('Artist gigs POST: gig insert failed', gigError)
      return NextResponse.json({ error: 'Failed to create gig', details: gigError.message }, { status: 500 })
    }

    const { data: booking, error: bookingError } = await serviceSupabase
      .from('gig_bookings')
      .insert({
        gig_id: gig.id,
        artist_id: user.id,
        venue_id: venueId,
        booking_status: 'confirmed',
        booking_fee: bookingFee,
        currency,
        special_requests: specialRequests,
        booked_by: user.id,
        booked_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (bookingError) {
      if (isMissingTableError(bookingError)) {
        return NextResponse.json({ error: 'Booking tables are not available yet in this environment.' }, { status: 400 })
      }
      console.error('Artist gigs POST: booking insert failed', bookingError)
      return NextResponse.json({ error: 'Gig created but booking failed', details: bookingError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        gigId: gig.id,
        bookingId: booking.id,
        gigStatus,
      },
      message: publishMeta.publishMode === 'scheduled'
        ? 'Gig saved as draft and scheduled for publishing'
        : 'Gig created and published successfully'
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (
      message.includes('Unsupported event type') ||
      message.includes('must be a valid') ||
      message.includes('must be one of') ||
      message.includes('must be a valid positive number') ||
      message.includes('Unable to derive local date')
    ) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    console.error('Artist gigs POST: unexpected error', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: message
    }, { status: 500 })
  }
}
