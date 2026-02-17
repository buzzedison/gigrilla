import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import {
  appendFanCommsEntryToMetadata,
  createGigFanCommsEntry,
  dispatchDueFanCommsForArtistGigs,
  getFanCommsQueue,
  getGigArtworkOptions,
  normalizeFanCommsInput,
  replaceFanCommsQueueInMetadata,
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

interface FanCommsPatchBody {
  bookingId?: string
  entryId?: string
  action?: 'cancel_scheduled' | 'update_scheduled'
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
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (artistProfileError && !isMissingTableError(artistProfileError)) {
    console.warn('fan-comms: failed to load artist profile stage name', artistProfileError)
  }

  const artistProfileRecord = artistProfile && typeof artistProfile === 'object'
    ? artistProfile as Record<string, unknown>
    : null
  const artistProfileName = toTrimmedString(
    artistProfileRecord?.stage_name ??
    artistProfileRecord?.artist_stage_name ??
    artistProfileRecord?.artist_name ??
    artistProfileRecord?.name ??
    artistProfileRecord?.display_name
  )
  if (artistProfileName) return artistProfileName

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
    const artistDisplayName = await getArtistDisplayName(serviceSupabase, user.id)

    let gigMetadata = gig.metadata
    if (gig.gig_status === 'published') {
      const dispatchResult = await dispatchDueFanCommsForArtistGigs({
        serviceSupabase,
        artistUserId: user.id,
        artistDisplayName,
        gigs: [{
          id: gig.id,
          title: gig.title,
          venue_id: gig.venue_id || null,
          metadata: gig.metadata || null,
          gig_status: gig.gig_status || null,
        }],
      })

      const updatedMetadata = dispatchResult.updatedGigMetadataById.get(gig.id)
      if (updatedMetadata) {
        gigMetadata = updatedMetadata
      }
    }

    const queue = getFanCommsQueue(gigMetadata)
    const artworkOptions = getGigArtworkOptions(gigMetadata)
    const summary = {
      total: queue.length,
      sent: queue.filter((entry) => entry.status === 'sent').length,
      scheduled: queue.filter((entry) => entry.status === 'scheduled').length,
      failed: queue.filter((entry) => entry.status === 'failed').length,
      cancelled: queue.filter((entry) => entry.status === 'cancelled').length,
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
      message.includes('require a date') ||
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as FanCommsPatchBody
    const bookingId = toTrimmedString(body.bookingId)
    const entryId = toTrimmedString(body.entryId)
    const action = body.action

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }
    if (!entryId) {
      return NextResponse.json({ error: 'entryId is required' }, { status: 400 })
    }
    if (action !== 'cancel_scheduled' && action !== 'update_scheduled') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const { gig } = await getOwnedBookingAndGig(serviceSupabase, user.id, bookingId)
    const queue = getFanCommsQueue(gig.metadata)
    const existingEntry = queue.find((entry) => entry.id === entryId)
    if (!existingEntry) {
      return NextResponse.json({ error: 'Fan update entry not found' }, { status: 404 })
    }
    if (existingEntry.status !== 'scheduled') {
      return NextResponse.json({ error: 'Only scheduled fan updates can be edited or cancelled' }, { status: 400 })
    }
    const artworkOptions = getGigArtworkOptions(gig.metadata)

    const nextQueue = queue.map((entry) => {
      if (entry.id !== entryId) return entry

      if (action === 'cancel_scheduled') {
        return {
          ...entry,
          status: 'cancelled' as const,
          scheduled_for: null,
          failure_reason: 'Cancelled by artist',
        }
      }

      const normalized = normalizeFanCommsInput({
        sendMode: 'scheduled',
        scheduledDate: body.scheduledDate,
        scheduledTime: body.scheduledTime,
        audienceMode: body.audienceMode ?? entry.audience_mode,
        regions: body.regions ?? entry.regions,
        artworkChoice: body.artworkChoice ?? entry.artwork_choice,
        title: body.title ?? entry.title,
        message: toTrimmedString(body.message) || entry.message,
      })
      const selectedArtworkUrl = normalized.artworkChoice === 'venue'
        ? (artworkOptions.venueArtworkUrl || artworkOptions.artistArtworkUrl)
        : (artworkOptions.artistArtworkUrl || artworkOptions.venueArtworkUrl)

      return {
        ...entry,
        status: 'scheduled' as const,
        send_mode: 'scheduled' as const,
        scheduled_for: normalized.scheduledFor,
        sent_at: null,
        audience_mode: normalized.audienceMode,
        regions: normalized.regions,
        artwork_choice: normalized.artworkChoice,
        artwork_url: selectedArtworkUrl,
        title: normalized.title,
        message: normalized.message,
        recipient_count: null,
        failure_reason: null,
      }
    })

    const updatedMetadata = replaceFanCommsQueueInMetadata(gig.metadata, nextQueue)
    const { error: updateError } = await serviceSupabase
      .from('gigs')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gig.id)

    if (updateError) {
      return NextResponse.json({
        error: action === 'cancel_scheduled'
          ? 'Failed to cancel scheduled fan update'
          : 'Failed to update scheduled fan update',
        details: updateError.message,
      }, { status: 500 })
    }

    const updatedQueue = getFanCommsQueue(updatedMetadata)
    const updatedEntry = updatedQueue.find((entry) => entry.id === entryId) || null
    const summary = {
      total: updatedQueue.length,
      sent: updatedQueue.filter((entry) => entry.status === 'sent').length,
      scheduled: updatedQueue.filter((entry) => entry.status === 'scheduled').length,
      failed: updatedQueue.filter((entry) => entry.status === 'failed').length,
      cancelled: updatedQueue.filter((entry) => entry.status === 'cancelled').length,
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        gigId: gig.id,
        entry: updatedEntry,
        queue: updatedQueue,
        summary,
      },
      message: action === 'cancel_scheduled'
        ? 'Scheduled fan update cancelled successfully'
        : 'Scheduled fan update updated successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (
      message.includes('required') ||
      message.includes('require a date') ||
      message.includes('not found') ||
      message.includes('Unsupported action') ||
      message.includes('Only scheduled') ||
      message.includes('Select at least one region') ||
      message.includes('must be') ||
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

    console.error('fan-comms PATCH: unexpected error', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: message
    }, { status: 500 })
  }
}
