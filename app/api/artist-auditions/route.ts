import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADVERT_STATUSES = ['draft', 'published', 'unpublished', 'historic'] as const
type AdvertStatus = typeof ADVERT_STATUSES[number]

type AuditionAdvertRow = {
  status?: string | null
  expiry_date?: string | null
  expiry_time?: string | null
  archived_at?: string | null
}

function isAdvertStatus(value: unknown): value is AdvertStatus {
  return typeof value === 'string' && (ADVERT_STATUSES as readonly string[]).includes(value)
}

function resolveAdvertStatus(row: AuditionAdvertRow): AdvertStatus {
  if (row.status === 'historic' || row.archived_at) return 'historic'
  if (row.status === 'draft' || row.status === 'unpublished') return row.status
  if (row.expiry_date) {
    const expiry = new Date(`${row.expiry_date}T${row.expiry_time || '23:59'}:00`)
    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) return 'historic'
  }
  return 'published'
}

function buildAdvertCounts(rows: AuditionAdvertRow[]) {
  const counts: Record<AdvertStatus | 'total_ads', number> = {
    draft: 0,
    published: 0,
    unpublished: 0,
    historic: 0,
    total_ads: rows.length,
  }

  rows.forEach((row) => {
    counts[resolveAdvertStatus(row)] += 1
  })

  return counts
}

function validateAdvertPayload(body: Record<string, unknown>, targetStatus: AdvertStatus) {
  if (targetStatus !== 'published') return null

  const requiredFields = [
    ['advert_type', 'Advert type'],
    ['headline', 'Advert headline'],
    ['description', 'Advert description'],
    ['genre_selection', 'Genre selection'],
    ['deadline_type', 'Deadline'],
    ['expiry_date', 'Advert expiry date'],
    ['expiry_time', 'Advert expiry time'],
  ] as const

  for (const [field, label] of requiredFields) {
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      return `${label} is required before an advert can be published.`
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
              // Ignore - called from Server Component
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get artist profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('profile_type', 'artist')
      .single()

    if (profileError || !profile) {
      return NextResponse.json({
        data: [],
        message: 'No artist profile found'
      })
    }

    const { searchParams } = new URL(request.url)
    const wantsSummary = searchParams.get('summary') === 'true'
    const statusFilter = searchParams.get('status')

    const { data: adverts, error: advertsError } = await supabase
      .from('artist_audition_adverts')
      .select('*')
      .eq('artist_profile_id', profile.id)
      .order('created_at', { ascending: false })

    if (advertsError) {
      console.error('API: Database error:', advertsError)
      return NextResponse.json({
        error: 'Database error',
        details: advertsError.message
      }, { status: 500 })
    }

    const rows = (adverts || []).map((advert) => ({
      ...advert,
      status: resolveAdvertStatus(advert),
    }))

    const counts = buildAdvertCounts(rows)

    if (wantsSummary) {
      return NextResponse.json({
        success: true,
        data: {
          counts,
          folders: [
            { id: 'draft_ads', label: 'Draft Ads', total: counts.draft },
            { id: 'published_ads', label: 'Published Ads', total: counts.published },
            { id: 'unpublished_ads', label: 'Unpublished Ads', total: counts.unpublished },
            { id: 'historic_ads', label: 'Historic Ads', total: counts.historic },
            { id: 'total_ads', label: 'Auditions & Collabs', total: counts.total_ads },
          ],
        },
      })
    }

    const filteredRows = isAdvertStatus(statusFilter)
      ? rows.filter((advert) => advert.status === statusFilter)
      : rows

    return NextResponse.json({
      data: filteredRows,
      counts,
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
              // Ignore - called from Server Component
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get artist profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('profile_type', 'artist')
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const body = await request.json() as Record<string, unknown>
    const isEdit = !!body.id
    const targetStatus = isAdvertStatus(body.status) ? body.status : 'published'
    const validationError = validateAdvertPayload(body, targetStatus)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const now = new Date().toISOString()

    const advertData = {
      artist_profile_id: profile.id,
      advert_type: typeof body.advert_type === 'string' && body.advert_type.trim() ? body.advert_type : null,
      instruments: Array.isArray(body.instruments) ? body.instruments : [],
      vocalist_types: Array.isArray(body.vocalist_types) ? body.vocalist_types : [],
      vocalist_sound_descriptors: Array.isArray(body.vocalist_sound_descriptors) ? body.vocalist_sound_descriptors : [],
      vocalist_genre_descriptors: Array.isArray(body.vocalist_genre_descriptors) ? body.vocalist_genre_descriptors : [],
      producer_type: typeof body.producer_type === 'string' && body.producer_type.trim() ? body.producer_type : null,
      lyricist_type: typeof body.lyricist_type === 'string' && body.lyricist_type.trim() ? body.lyricist_type : null,
      composer_type: typeof body.composer_type === 'string' && body.composer_type.trim() ? body.composer_type : null,
      collaboration_direction: typeof body.collaboration_direction === 'string' && body.collaboration_direction.trim() ? body.collaboration_direction : null,
      genre_selection: typeof body.genre_selection === 'string' && body.genre_selection.trim() ? body.genre_selection : null,
      genres: Array.isArray(body.genres) ? body.genres : [],
      headline: typeof body.headline === 'string' && body.headline.trim() ? body.headline : null,
      description: typeof body.description === 'string' && body.description.trim() ? body.description : null,
      includes_fixed_fee: body.includes_fixed_fee === true,
      includes_royalty_share: body.includes_royalty_share === true,
      deadline_type: typeof body.deadline_type === 'string' && body.deadline_type.trim() ? body.deadline_type : null,
      deadline_date: typeof body.deadline_date === 'string' && body.deadline_date ? body.deadline_date : null,
      expiry_date: typeof body.expiry_date === 'string' && body.expiry_date ? body.expiry_date : null,
      expiry_time: typeof body.expiry_time === 'string' && body.expiry_time ? body.expiry_time : null,
      status: targetStatus,
      published_at: targetStatus === 'published' ? now : null,
      unpublished_at: targetStatus === 'unpublished' ? now : null,
      archived_at: targetStatus === 'historic' ? now : null,
      updated_at: now
    }

    let result
    if (isEdit) {
      // Update existing advert
      const { data, error } = await supabase
        .from('artist_audition_adverts')
        .update({
          ...advertData,
          edited_at: now
        })
        .eq('id', body.id)
        .eq('artist_profile_id', profile.id)
        .select()
        .single()

      if (error) {
        console.error('API: Database error:', error)
        return NextResponse.json({
          error: 'Failed to update advert',
          details: error.message
        }, { status: 500 })
      }
      result = data
    } else {
      // Insert new advert
      const { data, error } = await supabase
        .from('artist_audition_adverts')
        .insert({
          ...advertData,
          created_at: now
        })
        .select()
        .single()

      if (error) {
        console.error('API: Database error:', error)
        return NextResponse.json({
          error: 'Failed to create advert',
          details: error.message
        }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({
      data: result,
      message: isEdit ? 'Advert updated successfully' : 'Advert created successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
              // Ignore - called from Server Component
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get artist profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('profile_type', 'artist')
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Advert ID is required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const { error: dbError } = await supabase
      .from('artist_audition_adverts')
      .update({
        status: 'historic',
        archived_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .eq('artist_profile_id', profile.id)

    if (dbError) {
      console.error('API: Database error:', dbError)
      return NextResponse.json({
        error: 'Failed to delete advert',
        details: dbError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Advert moved to historic adverts'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
