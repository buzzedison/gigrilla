import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

type ReportingAction = 'confirm' | 'report'
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

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

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[]
  return Array.from(new Set(value.map((item) => readString(item)).filter(Boolean)))
}

function readRating(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new Error('rating must be a whole number between 1 and 5')
  }
  return parsed
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

async function getOwnedBooking(
  serviceSupabase: ReturnType<typeof createServiceClient>,
  artistId: string,
  bookingId: string
) {
  const { data: booking, error } = await serviceSupabase
    .from('gig_bookings')
    .select('id, gig_id, artist_id, venue_id, booking_status')
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    if (isMissingTableError(error)) {
      throw new Error('Gig bookings are not available yet in this environment.')
    }
    throw new Error('Booking not found')
  }

  if (booking.artist_id !== artistId) {
    throw new Error('Forbidden')
  }

  return booking as {
    id: string
    gig_id: string | null
    artist_id: string
    venue_id: string | null
    booking_status: BookingStatus
  }
}

async function getGigStart(
  serviceSupabase: ReturnType<typeof createServiceClient>,
  gigId: string | null
) {
  if (!gigId) return null
  const { data, error } = await serviceSupabase
    .from('gigs')
    .select('id, start_datetime')
    .eq('id', gigId)
    .maybeSingle()

  if (error) {
    if (isMissingTableError(error)) return null
    throw new Error('Failed to verify gig date')
  }

  const value = typeof data?.start_datetime === 'string' ? data.start_datetime : ''
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const actionType = readString(searchParams.get('actionType')) as ReportingAction | ''
    const bookingId = readString(searchParams.get('bookingId'))
    const serviceSupabase = createServiceClient()

    let query = serviceSupabase
      .from('artist_gig_reporting')
      .select('id, booking_id, gig_id, artist_id, venue_id, action_type, target_member_type, target_member_id, rating, review_text, issue_types, environment_details, attitude_details, metadata, status, created_at, updated_at')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })

    if (actionType === 'confirm' || actionType === 'report') {
      query = query.eq('action_type', actionType)
    }
    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }

    const { data, error } = await query

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({
          success: true,
          data: [],
          warning: 'Gig reporting is not available until migration 058 has been applied.'
        })
      }
      return NextResponse.json({ error: 'Failed to load gig reporting', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
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
    const bookingId = readString(body?.bookingId)
    const actionType = readString(body?.actionType) as ReportingAction
    const targetMemberType = readString(body?.targetMemberType) || 'venue'
    const targetMemberId = readString(body?.targetMemberId) || null
    const rating = readRating(body?.rating)
    const reviewText = readString(body?.reviewText) || null
    const issueTypes = readStringArray(body?.issueTypes)
    const environmentDetails = readString(body?.environmentDetails) || null
    const attitudeDetails = readString(body?.attitudeDetails) || null

    if (!bookingId || (actionType !== 'confirm' && actionType !== 'report')) {
      return NextResponse.json({ error: 'bookingId and actionType are required' }, { status: 400 })
    }
    if (!['venue', 'artist', 'fan', 'service', 'professional', 'other'].includes(targetMemberType)) {
      return NextResponse.json({ error: 'targetMemberType is invalid' }, { status: 400 })
    }
    if (reviewText && reviewText.length > 2000) {
      return NextResponse.json({ error: 'Review text cannot exceed 2000 characters' }, { status: 400 })
    }
    if (environmentDetails && environmentDetails.length > 2000) {
      return NextResponse.json({ error: 'Environment details cannot exceed 2000 characters' }, { status: 400 })
    }
    if (attitudeDetails && attitudeDetails.length > 2000) {
      return NextResponse.json({ error: 'Attitude details cannot exceed 2000 characters' }, { status: 400 })
    }
    if (actionType === 'report' && issueTypes.length === 0 && !environmentDetails && !attitudeDetails && !reviewText) {
      return NextResponse.json({ error: 'Report a Gig requires issue details.' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const booking = await getOwnedBooking(serviceSupabase, user.id, bookingId)
    const gigStart = await getGigStart(serviceSupabase, booking.gig_id)

    if (gigStart && gigStart.getTime() > Date.now()) {
      return NextResponse.json({ error: 'Gig reporting is only available after the gig has started.' }, { status: 400 })
    }

    const nowIso = new Date().toISOString()

    if (actionType === 'confirm') {
      if (booking.booking_status === 'cancelled') {
        return NextResponse.json({ error: 'Cancelled gigs cannot be confirmed as completed.' }, { status: 400 })
      }
      if (booking.booking_status === 'pending') {
        return NextResponse.json({ error: 'Only confirmed gigs can be affirmed as completed.' }, { status: 400 })
      }
      if (booking.booking_status === 'confirmed') {
        const { error: updateError } = await serviceSupabase
          .from('gig_bookings')
          .update({ booking_status: 'completed' })
          .eq('id', booking.id)
          .eq('artist_id', user.id)

        if (updateError) {
          return NextResponse.json({ error: 'Failed to mark gig completed', details: updateError.message }, { status: 500 })
        }
      }
    }

    const { data, error } = await serviceSupabase
      .from('artist_gig_reporting')
      .upsert({
        booking_id: booking.id,
        gig_id: booking.gig_id,
        artist_id: user.id,
        venue_id: booking.venue_id,
        action_type: actionType,
        target_member_type: targetMemberType,
        target_member_id: targetMemberId,
        rating,
        review_text: reviewText,
        issue_types: issueTypes,
        environment_details: environmentDetails,
        attitude_details: attitudeDetails,
        metadata: {
          submitted_from: 'artist_dashboard',
          booking_status_before_submit: booking.booking_status,
        },
        status: 'submitted',
        updated_at: nowIso,
      }, {
        onConflict: 'booking_id,artist_id,action_type',
      })
      .select('id, booking_id, gig_id, artist_id, venue_id, action_type, target_member_type, target_member_id, rating, review_text, issue_types, environment_details, attitude_details, metadata, status, created_at, updated_at')
      .single()

    if (error) {
      const message = isMissingTableError(error)
        ? 'Gig reporting is not available until migration 058 has been applied.'
        : 'Failed to save gig reporting'
      return NextResponse.json({ error: message, details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    if (message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (message === 'Booking not found') {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    if (message.includes('rating must')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}
