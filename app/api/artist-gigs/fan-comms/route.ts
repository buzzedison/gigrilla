import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import {
  appendFanCommsEntryToMetadata,
  createGigFanCommsEntry,
  getFanCommsQueue,
  getGigArtworkOptions,
} from '@/lib/gig-fan-comms'

interface FanCommsRequestBody {
  bookingId?: string
  sendMode?: 'now' | 'scheduled'
  scheduledDate?: string
  scheduledTime?: string
  audienceMode?: 'all_followers' | 'specific_regions'
  regions?: string[] | string
  artworkChoice?: 'artist' | 'venue'
  title?: string
  message?: string
}

function toTrimmedString(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function isMissingTableError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const maybe = error as { code?: string; message?: string; details?: string }
  const message = `${maybe.message ?? ''} ${maybe.details ?? ''}`.toLowerCase()
  return (
    maybe.code === '42P01' ||
    (message.includes('relation') && message.includes('does not exist')) ||
    message.includes('could not find the table')
  )
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

async function getOwnedBookingAndGig(serviceSupabase: ReturnType<typeof createServiceClient>, userId: string, bookingId: string) {
  const { data: booking, error: bookingError } = await serviceSupabase
    .from('gig_bookings')
    .select('id, gig_id, artist_id')
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

  if (!booking.gig_id) {
    throw new Error('Booking has no linked gig')
  }

  const { data: gig, error: gigError } = await serviceSupabase
    .from('gigs')
    .select('id, title, venue_id, start_datetime, gig_status, metadata')
    .eq('id', booking.gig_id)
    .single()

  if (gigError || !gig) {
    if (isMissingTableError(gigError)) {
      throw new Error('Gigs are not available yet in this environment.')
    }
    throw new Error('Gig not found')
  }

  return { booking, gig }
}

async function getArtistDisplayName(serviceSupabase: ReturnType<typeof createServiceClient>, userId: string) {
  const { data: artistProfile, error: artistProfileError } = await serviceSupabase
    .from('artist_profiles')
    .select('stage_name')
    .eq('user_id', userId)
    .maybeSingle()

  if (artistProfileError && !isMissingTableError(artistProfileError)) {
    console.warn('fan-comms: failed to load artist profile stage name', artistProfileError)
  }

  const stageName = toTrimmedString((artistProfile as { stage_name?: unknown } | null)?.stage_name)
  if (stageName) return stageName

  const { data: userRow, error: userError } = await serviceSupabase
    .from('users')
    .select('display_name, username, first_name, last_name')
    .eq('id', userId)
    .maybeSingle()

  if (userError && !isMissingTableError(userError)) {
    console.warn('fan-comms: failed to load user fallback display name', userError)
  }

  const displayName = toTrimmedString((userRow as { display_name?: unknown } | null)?.display_name)
  if (displayName) return displayName

  const username = toTrimmedString((userRow as { username?: unknown } | null)?.username)
  if (username) return username

  const firstName = toTrimmedString((userRow as { first_name?: unknown } | null)?.first_name)
  const lastName = toTrimmedString((userRow as { last_name?: unknown } | null)?.last_name)
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (fullName) return fullName

  return 'Artist'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = toTrimmedString(new URL(request.url).searchParams.get('bookingId'))
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const { gig } = await getOwnedBookingAndGig(serviceSupabase, user.id, bookingId)

    const queue = getFanCommsQueue(gig.metadata)
    const artworkOptions = getGigArtworkOptions(gig.metadata)
    const summary = {
      total: queue.length,
      sent: queue.filter((entry) => entry.status === 'sent').length,
      scheduled: queue.filter((entry) => entry.status === 'scheduled').length,
      failed: queue.filter((entry) => entry.status === 'failed').length,
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        gigId: gig.id,
        gigStatus: gig.gig_status,
        artwork: artworkOptions,
        queue,
        summary,
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (
      message.includes('required') ||
      message.includes('not found') ||
      message.includes('Forbidden') ||
      message.includes('not available yet')
    ) {
      const status = message === 'Forbidden' ? 403 : message.includes('required') ? 400 : 404
      return NextResponse.json({ error: message }, { status })
    }

    console.error('fan-comms GET: unexpected error', error)
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

    const body = await request.json() as FanCommsRequestBody
    const bookingId = toTrimmedString(body.bookingId)
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const { gig } = await getOwnedBookingAndGig(serviceSupabase, user.id, bookingId)
    if (gig.gig_status !== 'published') {
      return NextResponse.json({
        error: 'Fan promotion can only be sent after public launch (gig must be published).'
      }, { status: 400 })
    }

    const artistDisplayName = await getArtistDisplayName(serviceSupabase, user.id)
    const now = new Date()
    const startDate = gig.start_datetime ? new Date(gig.start_datetime) : null
    const fallbackMessage = startDate && !Number.isNaN(startDate.getTime())
      ? `${gig.title} is live on GigFinder. See details and tickets now.`
      : `${gig.title} is now live on GigFinder.`

    const createResult = await createGigFanCommsEntry({
      serviceSupabase,
      artistUserId: user.id,
      artistDisplayName,
      gig: {
        id: gig.id,
        title: gig.title,
        venue_id: gig.venue_id || null,
        metadata: gig.metadata || null,
        gig_status: gig.gig_status || null,
      },
      input: {
        sendMode: body.sendMode,
        scheduledDate: body.scheduledDate,
        scheduledTime: body.scheduledTime,
        audienceMode: body.audienceMode,
        regions: body.regions,
        artworkChoice: body.artworkChoice,
        title: body.title,
        message: toTrimmedString(body.message) || fallbackMessage,
      },
    })

    const updatedMetadata = appendFanCommsEntryToMetadata(gig.metadata, createResult.entry)
    const { error: updateError } = await serviceSupabase
      .from('gigs')
      .update({
        metadata: updatedMetadata,
        updated_at: now.toISOString(),
      })
      .eq('id', gig.id)

    if (updateError) {
      return NextResponse.json({
        error: 'Failed to save fan communication entry',
        details: updateError.message,
      }, { status: 500 })
    }

    if (createResult.entry.status === 'failed') {
      return NextResponse.json({
        error: createResult.entry.failure_reason || 'Failed to send fan update',
        data: {
          bookingId,
          gigId: gig.id,
          entry: createResult.entry,
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        gigId: gig.id,
        entry: createResult.entry,
        targetedCount: createResult.targetedCount,
        sentCount: createResult.sentCount,
      },
      message: createResult.entry.status === 'scheduled'
        ? 'Fan update scheduled successfully'
        : 'Fan update sent successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (
      message.includes('required') ||
      message.includes('must be') ||
      message.includes('Select at least one region') ||
      message.includes('can only be sent after public launch') ||
      message.includes('not found') ||
      message.includes('Forbidden') ||
      message.includes('not available yet')
    ) {
      const status = message === 'Forbidden'
        ? 403
        : message.includes('not found')
          ? 404
          : 400
      return NextResponse.json({ error: message }, { status })
    }

    console.error('fan-comms POST: unexpected error', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: message
    }, { status: 500 })
  }
}
