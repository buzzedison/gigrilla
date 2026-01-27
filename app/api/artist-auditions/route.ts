import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
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

    return NextResponse.json({
      data: adverts || []
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

    const body = await request.json()
    const isEdit = !!body.id

    const advertData = {
      artist_profile_id: profile.id,
      advert_type: body.advert_type,
      instrument: body.instrument || null,
      vocalist_type: body.vocalist_type || null,
      producer_type: body.producer_type || null,
      lyricist_type: body.lyricist_type || null,
      composer_type: body.composer_type || null,
      collaboration_direction: body.collaboration_direction || null,
      genre_selection: body.genre_selection,
      genres: body.genres || [],
      headline: body.headline,
      description: body.description,
      includes_fixed_fee: body.includes_fixed_fee,
      includes_royalty_share: body.includes_royalty_share,
      deadline_type: body.deadline_type,
      deadline_date: body.deadline_date || null,
      expiry_date: body.expiry_date,
      expiry_time: body.expiry_time,
      updated_at: new Date().toISOString()
    }

    let result
    if (isEdit) {
      // Update existing advert
      const { data, error } = await supabase
        .from('artist_audition_adverts')
        .update({
          ...advertData,
          edited_at: new Date().toISOString()
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
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString()
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

    const { error: dbError } = await supabase
      .from('artist_audition_adverts')
      .delete()
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
      message: 'Advert deleted successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
