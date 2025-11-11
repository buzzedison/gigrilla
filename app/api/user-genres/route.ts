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
              // ignored - handled by middleware
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData, error: genresError } = await supabase
      .from('fan_profiles')
      .select('preferred_genre_ids')
      .eq('user_id', user.id)
      .maybeSingle()

    if (genresError) {
      return NextResponse.json({ error: 'Database error', details: genresError.message }, { status: 500 })
    }

    const genres = profileData?.preferred_genre_ids ?? []

    return NextResponse.json({ data: genres, user_id: user.id })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
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
              // ignored - handled by middleware
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const genres = Array.isArray(body.genres) ? body.genres : []
    const genreIds = Array.isArray(body.genreIds) ? body.genreIds : []
    const genreFamilies = Array.isArray(body.genreFamilies) ? body.genreFamilies : []
    const mainGenres = Array.isArray(body.mainGenres) ? body.mainGenres : []
    const subGenres = Array.isArray(body.subGenres) ? body.subGenres : []

    // Use genreIds if provided, otherwise fall back to genres (for backward compatibility)
    const preferredGenreIds = genreIds.length > 0 ? genreIds : genres

    // Get existing profile to preserve music_preferences structure
    const { data: existingProfile } = await supabase
      .from('fan_profiles')
      .select('music_preferences')
      .eq('user_id', user.id)
      .maybeSingle()

    const musicPreferences = (existingProfile?.music_preferences as Record<string, unknown> | null) ?? {}
    
    // Update music_preferences with hierarchical genre data
    if (genreFamilies.length > 0 || mainGenres.length > 0 || subGenres.length > 0) {
      musicPreferences.genre_families = genreFamilies
      musicPreferences.main_genres = mainGenres
      musicPreferences.sub_genres = subGenres
    }

    const { error: updateError } = await supabase
      .from('fan_profiles')
      .upsert({
        user_id: user.id,
        preferred_genre_ids: preferredGenreIds,
        music_preferences: musicPreferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (updateError) {
      return NextResponse.json({ error: 'Database error updating genres', details: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        genreIds: preferredGenreIds,
        genreFamilies,
        mainGenres,
        subGenres
      },
      user_id: user.id 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
