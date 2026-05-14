import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

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
        return NextResponse.json({
          success: true,
          data: [],
          warning: 'Artist unavailability is not available until migration 057 has been applied.'
        })
      }

      return NextResponse.json({ error: 'Failed to load unavailability', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data ?? [] })
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
      const message = isMissingTableError(error)
        ? 'Artist unavailability is not available until migration 057 has been applied.'
        : 'Failed to save unavailability'
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
    const { error } = await serviceSupabase
      .from('artist_unavailability')
      .delete()
      .eq('id', id)
      .eq('artist_id', user.id)

    if (error) {
      const message = isMissingTableError(error)
        ? 'Artist unavailability is not available until migration 057 has been applied.'
        : 'Failed to remove unavailability'
      return NextResponse.json({ error: message, details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}
