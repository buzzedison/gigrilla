import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

type GigStatus = 'draft' | 'published' | 'cancelled' | 'completed'

interface VenueRow {
  id: string
  owner_id: string | null
  name: string
  address: unknown
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
  created_at: string | null
  updated_at: string | null
}

const VALID_GIG_STATUSES = new Set<GigStatus>(['draft', 'published', 'cancelled', 'completed'])
const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

function safeObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
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

function toTrimmedString(input: unknown): string {
  return typeof input === 'string' ? input.trim() : ''
}

function toOptionalTrimmedString(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  return trimmed.length > 0 ? trimmed : null
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

function parseIsoDateTime(value: string, fieldName: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date/time`)
  }
  return date
}

function parseLimit(value: string | null) {
  if (!value) return DEFAULT_LIMIT
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error('limit must be a positive integer')
  }
  return Math.min(parsed, MAX_LIMIT)
}

function parseOffset(value: string | null) {
  if (!value) return 0
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('offset must be 0 or a positive integer')
  }
  return parsed
}

function parseStatusFilter(value: string | null): GigStatus[] {
  if (!value) return []
  const parsed = value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  if (parsed.length === 0) return []
  const unique = Array.from(new Set(parsed))
  const invalid = unique.filter((entry) => !VALID_GIG_STATUSES.has(entry as GigStatus))
  if (invalid.length > 0) {
    throw new Error(`Invalid status filter: ${invalid.join(', ')}`)
  }
  return unique as GigStatus[]
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function readStringFromObject(object: Record<string, unknown> | null, key: string): string | null {
  if (!object) return null
  return readString(object[key])
}

function parseRequestBody<T>(body: unknown): T {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Invalid JSON payload')
  }
  return body as T
}

function hasKey(object: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key)
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

async function fetchOwnedVenues(serviceSupabase: ReturnType<typeof createServiceClient>, userId: string) {
  const { data, error } = await serviceSupabase
    .from('venues')
    .select('id, owner_id, name, address')
    .eq('owner_id', userId)

  if (error) {
    throw new Error(`Failed to load venues: ${error.message}`)
  }

  return (data ?? []) as VenueRow[]
}

async function requireOwnedVenue(serviceSupabase: ReturnType<typeof createServiceClient>, userId: string, venueId: string) {
  const { data, error } = await serviceSupabase
    .from('venues')
    .select('id, owner_id, name, address')
    .eq('id', venueId)
    .eq('owner_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to verify venue: ${error.message}`)
  }
  if (!data) {
    throw new Error('Venue not found or not owned by you')
  }

  return data as VenueRow
}

function resolveVenueDisplay(gig: GigRow, venue: VenueRow | undefined) {
  const metadata = safeObject(gig.metadata)
  const override = safeObject(metadata.venue_override)

  const hasOfficialVenueData =
    Boolean(readStringFromObject(override, 'title')) ||
    Boolean(readStringFromObject(override, 'gig_event_name')) ||
    Boolean(readStringFromObject(override, 'description')) ||
    Boolean(readStringFromObject(override, 'artwork_url')) ||
    Boolean(readStringFromObject(override, 'ticket_summary')) ||
    Boolean(readStringFromObject(override, 'entry_requirements')) ||
    Boolean(readStringFromObject(override, 'doors_open')) ||
    Boolean(readStringFromObject(override, 'set_start_time')) ||
    Boolean(readStringFromObject(override, 'set_end_time')) ||
    override.is_official === true

  const sourceOfTruth = hasOfficialVenueData ? 'venue' : 'artist'
  const mergeStatus = hasOfficialVenueData ? 'merged' : 'artist_only'

  const title = sourceOfTruth === 'venue'
    ? (readStringFromObject(override, 'title') || readStringFromObject(override, 'gig_event_name') || gig.title)
    : gig.title
  const description = sourceOfTruth === 'venue'
    ? (readStringFromObject(override, 'description') || gig.description)
    : gig.description
  const startDatetime = sourceOfTruth === 'venue'
    ? (readStringFromObject(override, 'start_datetime') || gig.start_datetime)
    : gig.start_datetime
  const endDatetime = sourceOfTruth === 'venue'
    ? (readStringFromObject(override, 'end_datetime') || gig.end_datetime)
    : gig.end_datetime

  return {
    sourceOfTruth,
    mergeStatus,
    title,
    description,
    artworkUrl: sourceOfTruth === 'venue'
      ? (readStringFromObject(override, 'artwork_url') || readString(metadata.artwork_url))
      : readString(metadata.artwork_url),
    ticketEntryDetails: sourceOfTruth === 'venue'
      ? (readStringFromObject(override, 'ticket_summary') || readString(metadata.ticket_mode))
      : readString(metadata.ticket_mode),
    entryRequirements: sourceOfTruth === 'venue'
      ? (readStringFromObject(override, 'entry_requirements') || readString(metadata.age_display))
      : readString(metadata.age_display),
    doorsOpen: sourceOfTruth === 'venue'
      ? (readStringFromObject(override, 'doors_open') || readString(metadata.doors_open))
      : readString(metadata.doors_open),
    setStartTime: sourceOfTruth === 'venue'
      ? (readStringFromObject(override, 'set_start_time') || readString(metadata.set_start_time))
      : readString(metadata.set_start_time),
    setEndTime: sourceOfTruth === 'venue'
      ? (readStringFromObject(override, 'set_end_time') || readString(metadata.set_end_time))
      : readString(metadata.set_end_time),
    startDatetime,
    endDatetime,
    venueName: venue?.name || 'Venue TBD',
    venueAddress: readAddressLine(venue?.address),
    venueDataSupersedesArtistData: sourceOfTruth === 'venue',
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()
    const ownedVenues = await fetchOwnedVenues(serviceSupabase, user.id)
    if (ownedVenues.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { total: 0, limit: DEFAULT_LIMIT, offset: 0, returned: 0, has_more: false }
      })
    }

    const venueIds = ownedVenues.map((venue) => venue.id)
    const venuesById = new Map(ownedVenues.map((venue) => [venue.id, venue]))

    const { searchParams } = new URL(request.url)
    const statusFilter = parseStatusFilter(searchParams.get('status'))
    const limit = parseLimit(searchParams.get('limit'))
    const offset = parseOffset(searchParams.get('offset'))

    let query = serviceSupabase
      .from('gigs')
      .select('id, title, description, event_type, start_datetime, end_datetime, timezone, gig_status, venue_id, metadata, created_at, updated_at', { count: 'exact' })
      .in('venue_id', venueIds)
      .order('start_datetime', { ascending: false })
      .range(offset, offset + limit - 1)

    if (statusFilter.length > 0) {
      query = query.in('gig_status', statusFilter)
    }

    const { data, error, count } = await query
    if (error) {
      return NextResponse.json({ error: 'Failed to load venue gigs', details: error.message }, { status: 500 })
    }

    const rows = (data ?? []) as GigRow[]
    const mapped = rows.map((gig) => {
      const display = resolveVenueDisplay(gig, gig.venue_id ? venuesById.get(gig.venue_id) : undefined)
      return {
        id: gig.id,
        gigStatus: gig.gig_status,
        eventType: gig.event_type,
        createdAt: gig.created_at,
        updatedAt: gig.updated_at,
        venueId: gig.venue_id,
        sourceOfTruth: display.sourceOfTruth,
        mergeStatus: display.mergeStatus,
        publicDisplay: display,
        metadata: gig.metadata || null,
      }
    })

    const total = count ?? mapped.length

    return NextResponse.json({
      success: true,
      data: mapped,
      filters: {
        status: statusFilter
      },
      pagination: {
        total,
        limit,
        offset,
        returned: mapped.length,
        has_more: offset + mapped.length < total
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('Invalid status filter') || message.includes('limit must be') || message.includes('offset must be')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: message
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

    const body = parseRequestBody<Record<string, unknown>>(await request.json())
    const gigId = toTrimmedString(body.gigId)
    if (!gigId) {
      return NextResponse.json({ error: 'gigId is required' }, { status: 400 })
    }

    const requestedVenueId = toOptionalTrimmedString(body.venueId)
    const applyToCoreFields = body.applyToCoreFields === false ? false : true

    const serviceSupabase = createServiceClient()

    const { data: gig, error: gigError } = await serviceSupabase
      .from('gigs')
      .select('id, title, description, start_datetime, end_datetime, timezone, venue_id, metadata')
      .eq('id', gigId)
      .maybeSingle()

    if (gigError) {
      return NextResponse.json({ error: 'Failed to load gig', details: gigError.message }, { status: 500 })
    }
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }

    let effectiveVenue: VenueRow
    if (requestedVenueId) {
      try {
        effectiveVenue = await requireOwnedVenue(serviceSupabase, user.id, requestedVenueId)
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Forbidden' }, { status: 403 })
      }
    } else if (gig.venue_id) {
      try {
        effectiveVenue = await requireOwnedVenue(serviceSupabase, user.id, gig.venue_id)
      } catch (error) {
        return NextResponse.json({
          error: 'Gig is not linked to a venue you own. Provide a venueId you own to set official venue data.',
          details: error instanceof Error ? error.message : null
        }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'venueId is required when gig has no venue.' }, { status: 400 })
    }

    const nowIso = new Date().toISOString()
    const existingMetadata = safeObject(gig.metadata)
    const existingOverride = safeObject(existingMetadata.venue_override)
    const override: Record<string, unknown> = {
      ...existingOverride,
      is_official: true,
      supersedes_artist_data: true,
      venue_id: effectiveVenue.id,
      venue_name: effectiveVenue.name,
      venue_address: readAddressLine(effectiveVenue.address),
      updated_by: user.id,
      updated_at: nowIso,
    }

    const assignNullableText = (bodyKey: string, overrideKey = bodyKey) => {
      if (hasKey(body, bodyKey)) {
        override[overrideKey] = toOptionalTrimmedString(body[bodyKey])
      }
    }

    assignNullableText('venueEventName', 'title')
    if (hasKey(body, 'venueEventName')) {
      override.gig_event_name = toOptionalTrimmedString(body.venueEventName)
    }
    assignNullableText('description')
    assignNullableText('artworkUrl', 'artwork_url')
    assignNullableText('ticketEntryDetails', 'ticket_summary')
    assignNullableText('entryRequirements', 'entry_requirements')
    assignNullableText('doorsOpen', 'doors_open')
    assignNullableText('setStartTime', 'set_start_time')
    assignNullableText('setEndTime', 'set_end_time')
    assignNullableText('timezone')

    if (hasKey(body, 'artworkUrl')) {
      const artworkUrl = toOptionalTrimmedString(body.artworkUrl)
      if (artworkUrl) {
        try {
          validateUrl(artworkUrl, 'artworkUrl')
        } catch (error) {
          return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid artwork URL' }, { status: 400 })
        }
      }
      override.artwork_url = artworkUrl
    }

    let overrideStartDatetime = readString(existingOverride.start_datetime)
    if (hasKey(body, 'startDatetime')) {
      const value = toOptionalTrimmedString(body.startDatetime)
      if (value) {
        try {
          overrideStartDatetime = parseIsoDateTime(value, 'startDatetime').toISOString()
        } catch (error) {
          return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid startDatetime' }, { status: 400 })
        }
      } else {
        overrideStartDatetime = null
      }
    }
    override.start_datetime = overrideStartDatetime

    let overrideEndDatetime = readString(existingOverride.end_datetime)
    if (hasKey(body, 'endDatetime')) {
      const value = toOptionalTrimmedString(body.endDatetime)
      if (value) {
        try {
          overrideEndDatetime = parseIsoDateTime(value, 'endDatetime').toISOString()
        } catch (error) {
          return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid endDatetime' }, { status: 400 })
        }
      } else {
        overrideEndDatetime = null
      }
    }
    override.end_datetime = overrideEndDatetime

    const startForValidation = overrideStartDatetime || gig.start_datetime
    const endForValidation = overrideEndDatetime || gig.end_datetime
    if (startForValidation && endForValidation) {
      const startDate = parseIsoDateTime(startForValidation, 'startDatetime')
      const endDate = parseIsoDateTime(endForValidation, 'endDatetime')
      if (endDate.getTime() <= startDate.getTime()) {
        return NextResponse.json({ error: 'endDatetime must be after startDatetime' }, { status: 400 })
      }
    }

    const nextMetadata = {
      ...existingMetadata,
      venue_override: override,
      venue_override_last_updated_at: nowIso,
    }

    const updatePayload: Record<string, unknown> = {
      metadata: nextMetadata,
      venue_id: effectiveVenue.id,
      updated_at: nowIso,
    }

    if (applyToCoreFields) {
      const officialTitle = readString(override.title)
      const officialDescription = readString(override.description)
      const officialTimezone = readString(override.timezone)
      const officialStart = readString(override.start_datetime)
      const officialEnd = readString(override.end_datetime)

      if (officialTitle) updatePayload.title = officialTitle
      if (officialDescription !== null) updatePayload.description = officialDescription
      if (officialTimezone) updatePayload.timezone = officialTimezone
      if (officialStart) updatePayload.start_datetime = officialStart
      updatePayload.end_datetime = officialEnd || null
    }

    const { data: updatedGig, error: updateError } = await serviceSupabase
      .from('gigs')
      .update(updatePayload)
      .eq('id', gig.id)
      .select('id, title, description, event_type, start_datetime, end_datetime, timezone, gig_status, venue_id, metadata, created_at, updated_at')
      .single()

    if (updateError || !updatedGig) {
      return NextResponse.json({
        error: 'Failed to update gig with venue official data',
        details: updateError?.message
      }, { status: 500 })
    }

    if (gig.venue_id !== effectiveVenue.id) {
      const { error: bookingSyncError } = await serviceSupabase
        .from('gig_bookings')
        .update({ venue_id: effectiveVenue.id })
        .eq('gig_id', gig.id)

      if (bookingSyncError) {
        console.warn('Venue gigs PUT: booking venue sync failed', bookingSyncError)
      }
    }

    const display = resolveVenueDisplay(updatedGig as GigRow, effectiveVenue)

    return NextResponse.json({
      success: true,
      data: {
        id: updatedGig.id,
        gigStatus: updatedGig.gig_status,
        sourceOfTruth: display.sourceOfTruth,
        mergeStatus: display.mergeStatus,
        publicDisplay: display,
        metadata: updatedGig.metadata || null,
      },
      message: 'Venue official gig data saved. Public gig tiles now prioritize venue data.'
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (
      message.includes('valid date/time') ||
      message.includes('must start with http:// or https://') ||
      message.includes('must be a valid URL')
    ) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: message
    }, { status: 500 })
  }
}
