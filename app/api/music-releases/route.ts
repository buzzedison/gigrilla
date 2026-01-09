import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Helper to create Supabase client
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
            // Ignore - called from Server Component
          }
        },
      },
    }
  )
}

// GET - Fetch user's music releases
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const releaseId = searchParams.get('id')
    const status = searchParams.get('status')

    // Fetch single release by ID
    if (releaseId) {
      const { data, error } = await supabase
        .from('music_releases')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', releaseId)
        .single()

      if (error) {
        console.error('API: Error fetching music release:', error)
        return NextResponse.json({
          error: 'Database error',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({ data, user_id: user.id })
    }

    // Fetch all releases with optional status filter
    let query = supabase
      .from('music_releases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('API: Error fetching music releases:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ data, user_id: user.id })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Create or update a music release
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      upc,
      upc_confirmed,
      ean,
      ean_confirmed,
      release_title,
      release_title_confirmed,
      release_title_source,
      release_type,
      track_count,
      track_count_label,
      release_version,
      apply_version_to_all,
      country_of_origin,
      available_home,
      available_specific,
      available_worldwide,
      specific_territories,
      territory_rights_confirmed,
      go_live_option,
      go_live_date,
      master_rights_type,
      record_labels,
      master_rights_confirmed,
      publishing_rights_type,
      publishers,
      apply_publisher_to_all_tracks,
      publishing_rights_confirmed,
      distributor_name,
      distributor_confirmed,
      distributor_contact_name,
      distributor_contact_email,
      wrote_composition,
      pro_name,
      pro_confirmed,
      pro_contact_name,
      pro_contact_email,
      mcs_name,
      mcs_confirmed,
      mcs_contact_name,
      mcs_contact_email,
      cover_artwork_url,
      cover_caption,
      status,
      current_step,
      upload_guide_confirmed
    } = body

    const releaseData: Record<string, unknown> = {
      user_id: user.id,
      updated_at: new Date().toISOString()
    }

    // Map all fields
    const assignIfDefined = (key: string, value: unknown) => {
      if (value !== undefined) {
        releaseData[key] = value
      }
    }

    assignIfDefined('upc', upc)
    assignIfDefined('upc_confirmed', upc_confirmed)
    assignIfDefined('ean', ean)
    assignIfDefined('ean_confirmed', ean_confirmed)
    assignIfDefined('release_title', release_title)
    assignIfDefined('release_title_confirmed', release_title_confirmed)
    assignIfDefined('release_title_source', release_title_source)
    assignIfDefined('release_type', release_type)
    assignIfDefined('track_count', track_count)
    assignIfDefined('track_count_label', track_count_label)
    assignIfDefined('release_version', release_version)
    assignIfDefined('apply_version_to_all', apply_version_to_all)
    assignIfDefined('country_of_origin', country_of_origin)
    assignIfDefined('available_home', available_home)
    assignIfDefined('available_specific', available_specific)
    assignIfDefined('available_worldwide', available_worldwide)
    assignIfDefined('specific_territories', specific_territories)
    assignIfDefined('territory_rights_confirmed', territory_rights_confirmed)
    assignIfDefined('go_live_option', go_live_option)
    assignIfDefined('go_live_date', go_live_date)
    assignIfDefined('master_rights_type', master_rights_type)
    assignIfDefined('record_labels', record_labels)
    assignIfDefined('master_rights_confirmed', master_rights_confirmed)
    assignIfDefined('publishing_rights_type', publishing_rights_type)
    assignIfDefined('publishers', publishers)
    assignIfDefined('apply_publisher_to_all_tracks', apply_publisher_to_all_tracks)
    assignIfDefined('publishing_rights_confirmed', publishing_rights_confirmed)
    assignIfDefined('distributor_name', distributor_name)
    assignIfDefined('distributor_confirmed', distributor_confirmed)
    assignIfDefined('distributor_contact_name', distributor_contact_name)
    assignIfDefined('distributor_contact_email', distributor_contact_email)
    assignIfDefined('wrote_composition', wrote_composition)
    assignIfDefined('pro_name', pro_name)
    assignIfDefined('pro_confirmed', pro_confirmed)
    assignIfDefined('pro_contact_name', pro_contact_name)
    assignIfDefined('pro_contact_email', pro_contact_email)
    assignIfDefined('mcs_name', mcs_name)
    assignIfDefined('mcs_confirmed', mcs_confirmed)
    assignIfDefined('mcs_contact_name', mcs_contact_name)
    assignIfDefined('mcs_contact_email', mcs_contact_email)
    assignIfDefined('cover_artwork_url', cover_artwork_url)
    assignIfDefined('cover_caption', cover_caption)
    assignIfDefined('status', status)
    assignIfDefined('current_step', current_step)
    assignIfDefined('upload_guide_confirmed', upload_guide_confirmed)

    // Handle status transitions
    if (status === 'pending_review' && !releaseData.submitted_at) {
      releaseData.submitted_at = new Date().toISOString()
    }
    if (status === 'published' && !releaseData.published_at) {
      releaseData.published_at = new Date().toISOString()
    }

    let result
    if (id) {
      // Update existing release
      const { data, error } = await supabase
        .from('music_releases')
        .update(releaseData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('API: Error updating music release:', error)
        return NextResponse.json({
          error: 'Database error',
          details: error.message
        }, { status: 500 })
      }
      result = data
    } else {
      // Create new release
      releaseData.created_at = new Date().toISOString()
      if (!releaseData.release_title) {
        releaseData.release_title = 'Untitled Release'
      }

      const { data, error } = await supabase
        .from('music_releases')
        .insert(releaseData)
        .select()
        .single()

      if (error) {
        console.error('API: Error creating music release:', error)
        return NextResponse.json({
          error: 'Database error',
          details: error.message
        }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: id ? 'Release updated successfully' : 'Release created successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Delete a music release
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const releaseId = searchParams.get('id')

    if (!releaseId) {
      return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('music_releases')
      .delete()
      .eq('id', releaseId)
      .eq('user_id', user.id)

    if (error) {
      console.error('API: Error deleting music release:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Release deleted successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
