import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { createServiceClient } from '@/lib/supabase/service-client'

type UnavailabilityRecord = {
  id: string
  artist_id: string
  starts_at: string
  ends_at: string
  reason: string
  note: string | null
  created_at: string
  updated_at: string
}

type ArtistProfileFallbackRow = {
  id: string
  location_details: Record<string, unknown> | null
}

const FALLBACK_UNAVAILABILITY_KEY = 'artist_unavailability_blocks'
const FALLBACK_ID_PREFIX = 'profile-fallback:'

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

function parseIsoDate(value: string | null, fieldName: string) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid date/time`)
  }
  return parsed
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function normalizeFallbackBlocks(value: unknown, artistId: string): UnavailabilityRecord[] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry): UnavailabilityRecord | null => {
      const record = asRecord(entry)
      const startsAt = readString(record.starts_at)
      const endsAt = readString(record.ends_at)
      const startsDate = parseIsoDate(startsAt, 'starts_at')
      const endsDate = parseIsoDate(endsAt, 'ends_at')
      if (!startsDate || !endsDate || endsDate.getTime() <= startsDate.getTime()) return null

      const id = readString(record.id) || `${FALLBACK_ID_PREFIX}${randomUUID()}`
      const createdAt = readString(record.created_at) || startsDate.toISOString()
      const updatedAt = readString(record.updated_at) || createdAt

      return {
        id: id.startsWith(FALLBACK_ID_PREFIX) ? id : `${FALLBACK_ID_PREFIX}${id}`,
        artist_id: artistId,
        starts_at: startsDate.toISOString(),
        ends_at: endsDate.toISOString(),
        reason: readString(record.reason) || 'Unavailable',
        note: readString(record.note) || null,
        created_at: createdAt,
        updated_at: updatedAt,
      }
    })
    .filter((entry): entry is UnavailabilityRecord => Boolean(entry))
}

function filterAvailabilityByRange(records: UnavailabilityRecord[], dateFrom: Date | null, dateTo: Date | null) {
  return records
    .filter((record) => {
      const startsAt = new Date(record.starts_at)
      const endsAt = new Date(record.ends_at)
      if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return false
      if (dateFrom && endsAt.getTime() < dateFrom.getTime()) return false
      if (dateTo && startsAt.getTime() > dateTo.getTime()) return false
      return true
    })
    .sort((left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime())
}

async function loadArtistProfileFallback(serviceSupabase: ReturnType<typeof createServiceClient>, userId: string) {
  const { data, error } = await serviceSupabase
    .from('user_profiles')
    .select('id, location_details')
    .eq('user_id', userId)
    .eq('profile_type', 'artist')
    .maybeSingle()

  if (error) throw error
  return data as ArtistProfileFallbackRow | null
}

async function loadFallbackAvailability(
  serviceSupabase: ReturnType<typeof createServiceClient>,
  userId: string,
  dateFrom: Date | null,
  dateTo: Date | null
) {
  const profile = await loadArtistProfileFallback(serviceSupabase, userId)
  if (!profile) return []

  const locationDetails = asRecord(profile.location_details)
  const records = normalizeFallbackBlocks(locationDetails[FALLBACK_UNAVAILABILITY_KEY], userId)
  return filterAvailabilityByRange(records, dateFrom, dateTo)
}

async function saveFallbackAvailability(
  serviceSupabase: ReturnType<typeof createServiceClient>,
  userId: string,
  record: UnavailabilityRecord
) {
  const profile = await loadArtistProfileFallback(serviceSupabase, userId)
  if (!profile) {
    throw new Error('Artist profile not found')
  }

  const locationDetails = asRecord(profile.location_details)
  const existing = normalizeFallbackBlocks(locationDetails[FALLBACK_UNAVAILABILITY_KEY], userId)
  const updatedLocationDetails = {
    ...locationDetails,
    [FALLBACK_UNAVAILABILITY_KEY]: [...existing, record],
  }

  const { error } = await serviceSupabase
    .from('user_profiles')
    .update({
      location_details: updatedLocationDetails,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)
    .eq('user_id', userId)
    .eq('profile_type', 'artist')

  if (error) throw error
  return record
}

async function deleteFallbackAvailability(
  serviceSupabase: ReturnType<typeof createServiceClient>,
  userId: string,
  id: string
) {
  const profile = await loadArtistProfileFallback(serviceSupabase, userId)
  if (!profile) return

  const locationDetails = asRecord(profile.location_details)
  const existing = normalizeFallbackBlocks(locationDetails[FALLBACK_UNAVAILABILITY_KEY], userId)
  const updatedLocationDetails = {
    ...locationDetails,
    [FALLBACK_UNAVAILABILITY_KEY]: existing.filter((record) => record.id !== id),
  }

  const { error } = await serviceSupabase
    .from('user_profiles')
    .update({
      location_details: updatedLocationDetails,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)
    .eq('user_id', userId)
    .eq('profile_type', 'artist')

  if (error) throw error
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

    const { searchParams } = new URL(request.url)
    const dateFrom = parseIsoDate(searchParams.get('date_from'), 'date_from')
    const dateTo = parseIsoDate(searchParams.get('date_to'), 'date_to')

    if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
      return NextResponse.json({ error: 'date_from cannot be after date_to' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    let query = serviceSupabase
      .from('artist_unavailability')
      .select('id, artist_id, starts_at, ends_at, reason, note, created_at, updated_at')
      .eq('artist_id', user.id)
      .order('starts_at', { ascending: true })

    if (dateFrom) {
      query = query.gte('ends_at', dateFrom.toISOString())
    }
    if (dateTo) {
      query = query.lte('starts_at', dateTo.toISOString())
    }

    const { data, error } = await query

    if (error) {
      if (isMissingTableError(error)) {
        const fallbackData = await loadFallbackAvailability(serviceSupabase, user.id, dateFrom, dateTo)
        return NextResponse.json({
          success: true,
          data: fallbackData,
          storage: 'profile_fallback'
        })
      }

      return NextResponse.json({ error: 'Failed to load unavailability', details: error.message }, { status: 500 })
    }

    const fallbackData = await loadFallbackAvailability(serviceSupabase, user.id, dateFrom, dateTo)
    return NextResponse.json({
      success: true,
      data: [...(data ?? []) as UnavailabilityRecord[], ...fallbackData],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    if (message.includes('date_from') || message.includes('date_to')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
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
    const startsAt = parseIsoDate(readString(body?.startsAt), 'startsAt')
    const endsAt = parseIsoDate(readString(body?.endsAt), 'endsAt')
    const reason = readString(body?.reason) || 'Unavailable'
    const note = readString(body?.note) || null

    if (!startsAt || !endsAt) {
      return NextResponse.json({ error: 'startsAt and endsAt are required' }, { status: 400 })
    }
    if (endsAt.getTime() <= startsAt.getTime()) {
      return NextResponse.json({ error: 'endsAt must be after startsAt' }, { status: 400 })
    }
    if (reason.length > 80) {
      return NextResponse.json({ error: 'Reason cannot exceed 80 characters' }, { status: 400 })
    }
    if (note && note.length > 500) {
      return NextResponse.json({ error: 'Note cannot exceed 500 characters' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const nowIso = new Date().toISOString()
    const { data, error } = await serviceSupabase
      .from('artist_unavailability')
      .insert({
        artist_id: user.id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        reason,
        note,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select('id, artist_id, starts_at, ends_at, reason, note, created_at, updated_at')
      .single()

    if (error) {
      if (isMissingTableError(error)) {
        const fallbackRecord: UnavailabilityRecord = {
          id: `${FALLBACK_ID_PREFIX}${randomUUID()}`,
          artist_id: user.id,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          reason,
          note,
          created_at: nowIso,
          updated_at: nowIso,
        }
        const fallbackData = await saveFallbackAvailability(serviceSupabase, user.id, fallbackRecord)
        return NextResponse.json({ success: true, data: fallbackData, storage: 'profile_fallback' })
      }

      const message = 'Failed to save unavailability'
      return NextResponse.json({ error: message, details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    if (message.includes('startsAt') || message.includes('endsAt')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = readString(searchParams.get('id'))
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()

    if (id.startsWith(FALLBACK_ID_PREFIX)) {
      await deleteFallbackAvailability(serviceSupabase, user.id, id)
      return NextResponse.json({ success: true })
    }

    const { error } = await serviceSupabase
      .from('artist_unavailability')
      .delete()
      .eq('id', id)
      .eq('artist_id', user.id)

    if (error) {
      if (isMissingTableError(error)) {
        await deleteFallbackAvailability(serviceSupabase, user.id, id)
        return NextResponse.json({ success: true })
      }

      const message = 'Failed to remove unavailability'
      return NextResponse.json({ error: message, details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}
