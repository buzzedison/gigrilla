import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

type GigView = 'calendar' | 'invites' | 'requests' | 'all'

interface GigBookingRow {
  id: string
  gig_id: string | null
  artist_id: string
  venue_id: string | null
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
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
  event_type: string | null
  start_datetime: string
  end_datetime: string | null
  timezone: string | null
  gig_status: string | null
}

interface VenueRow {
  id: string
  name: string
  address: unknown
}

function getViewParam(value: string | null): GigView {
  if (value === 'calendar' || value === 'invites' || value === 'requests') return value
  return 'all'
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

    const { data: bookingRows, error: bookingError } = await serviceSupabase
      .from('gig_bookings')
      .select('id, gig_id, artist_id, venue_id, booking_status, booking_fee, currency, special_requests, booked_by, booked_at, confirmed_at, cancelled_at, cancellation_reason')
      .eq('artist_id', user.id)
      .order('booked_at', { ascending: false, nullsFirst: false })
      .limit(200)

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
        .select('id, title, event_type, start_datetime, end_datetime, timezone, gig_status')
        .in('id', gigIds)

      if (gigError) {
        if (!isMissingTableError(gigError)) {
          console.error('Artist gigs GET: gigs query failed', gigError)
          return NextResponse.json({ error: 'Failed to load gig details', details: gigError.message }, { status: 500 })
        }
      } else {
        gigsById = new Map((gigRows ?? []).map((row) => [row.id, row as GigRow]))
      }
    }

    let venuesById = new Map<string, VenueRow>()
    if (venueIds.length > 0) {
      const { data: venueRows, error: venueError } = await serviceSupabase
        .from('venues')
        .select('id, name, address')
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

    const enriched = bookings.map((booking) => {
      const gig = booking.gig_id ? gigsById.get(booking.gig_id) : undefined
      const venue = booking.venue_id ? venuesById.get(booking.venue_id) : undefined
      const isInvite = booking.booked_by !== null && booking.booked_by !== user.id
      const isRequest = booking.booked_by === user.id

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
        gigTitle: gig?.title || 'Untitled Gig',
        eventType: gig?.event_type || 'concert',
        startDatetime: gig?.start_datetime || null,
        endDatetime: gig?.end_datetime || null,
        timezone: gig?.timezone || 'UTC',
        gigStatus: gig?.gig_status || null,
        venueName: venue?.name || 'Venue TBD',
        venueAddress: readAddressLine(venue?.address)
      }
    })

    const filtered = (() => {
      if (view === 'invites') return enriched.filter((row) => row.isInvite)
      if (view === 'requests') return enriched.filter((row) => row.isRequest)
      return enriched
    })()

    return NextResponse.json({
      success: true,
      view,
      data: filtered,
      summary: {
        total: filtered.length,
        pending: filtered.filter((item) => item.bookingStatus === 'pending').length,
        confirmed: filtered.filter((item) => item.bookingStatus === 'confirmed').length,
        completed: filtered.filter((item) => item.bookingStatus === 'completed').length
      }
    })
  } catch (error) {
    console.error('Artist gigs GET: unexpected error', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
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

    const body = await request.json()
    const bookingId = typeof body?.bookingId === 'string' ? body.bookingId : ''
    const action = typeof body?.action === 'string' ? body.action : ''

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'bookingId and action are required' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const { data: booking, error: bookingError } = await serviceSupabase
      .from('gig_bookings')
      .select('id, artist_id, booked_by, booking_status')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      if (isMissingTableError(bookingError)) {
        return NextResponse.json({ error: 'Gig bookings are not available yet in this environment.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.artist_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const nowIso = new Date().toISOString()
    let patch: Record<string, unknown> = {}

    if (action === 'accept_invite') {
      if (booking.booked_by === user.id) {
        return NextResponse.json({ error: 'This booking is not an invite.' }, { status: 400 })
      }
      patch = { booking_status: 'confirmed', confirmed_at: nowIso }
    } else if (action === 'decline_invite') {
      if (booking.booked_by === user.id) {
        return NextResponse.json({ error: 'This booking is not an invite.' }, { status: 400 })
      }
      patch = { booking_status: 'cancelled', cancelled_at: nowIso, cancellation_reason: 'Declined by artist' }
    } else if (action === 'cancel_request') {
      if (booking.booked_by !== user.id) {
        return NextResponse.json({ error: 'Only outbound requests can be cancelled.' }, { status: 400 })
      }
      patch = { booking_status: 'cancelled', cancelled_at: nowIso, cancellation_reason: 'Cancelled by artist' }
    } else if (action === 'mark_completed') {
      patch = { booking_status: 'completed' }
    } else {
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const title = typeof body?.title === 'string' ? body.title.trim() : ''
    const eventType = typeof body?.event_type === 'string' ? body.event_type : 'concert'
    const startDatetime = typeof body?.start_datetime === 'string' ? body.start_datetime : null
    const endDatetime = typeof body?.end_datetime === 'string' ? body.end_datetime : null
    const timezone = typeof body?.timezone === 'string' ? body.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone
    const description = typeof body?.description === 'string' ? body.description.trim() : null
    const venueName = typeof body?.venue_name === 'string' ? body.venue_name.trim() : ''
    const venueCity = typeof body?.venue_city === 'string' ? body.venue_city.trim() : ''
    const venueCountry = typeof body?.venue_country === 'string' ? body.venue_country.trim() : ''
    const bookingFee = typeof body?.booking_fee === 'number' ? body.booking_fee : null
    const currency = typeof body?.currency === 'string' ? body.currency : 'GBP'
    const specialRequests = typeof body?.special_requests === 'string' ? body.special_requests.trim() : null
    const metadata = (body?.metadata && typeof body.metadata === 'object') ? body.metadata : {}

    if (!title) {
      return NextResponse.json({ error: 'Gig title is required' }, { status: 400 })
    }
    if (!startDatetime) {
      return NextResponse.json({ error: 'Start date & time is required' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()

    // 1. Create or find venue (simplified — create inline venue)
    let venueId: string | null = null
    if (venueName) {
      const { data: venue, error: venueError } = await serviceSupabase
        .from('venues')
        .insert({
          owner_id: user.id,
          name: venueName,
          address: {
            line1: metadata.venue_address || null,
            city: venueCity || null,
            country: venueCountry || null,
          },
          contact_details: metadata.venue_contact || null,
        })
        .select('id')
        .single()

      if (venueError) {
        if (isMissingTableError(venueError)) {
          return NextResponse.json({ error: 'Venue tables are not available yet in this environment.' }, { status: 400 })
        }
        console.error('Artist gigs POST: venue insert failed', venueError)
        // Non-fatal: continue without venue
      } else {
        venueId = venue.id
      }
    }

    // Determine gig status from publish mode
    const gigStatus = metadata.publish_mode === 'scheduled' ? 'scheduled' : 'published'

    // 2. Create the gig
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
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        timezone,
        metadata,
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

    // 3. Create corresponding booking record
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
      },
      message: 'Gig created successfully'
    })
  } catch (error) {
    console.error('Artist gigs POST: unexpected error', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
