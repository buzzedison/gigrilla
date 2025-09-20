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
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('API: Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError.message }, { status: 401 })
    }

    if (!user) {
      console.error('API: No authenticated user')
      return NextResponse.json({ error: 'No user authenticated' }, { status: 401 })
    }

    console.log('API: Fetching user genres for user:', user.id)

    const { data: profileData, error: genresError } = await supabase
      .from('fan_profiles')
      .select('preferred_genres')
      .eq('user_id', user.id)
      .maybeSingle()

    if (genresError) {
      console.error('API: Database error:', genresError)
      return NextResponse.json({
        error: 'Database error',
        details: genresError.message,
        code: genresError.code
      }, { status: 500 })
    }

    console.log('API: Successfully fetched genres data:', profileData)

    // Extract genres array from profile
    const genres = profileData?.preferred_genres || []

    return NextResponse.json({
      data: genres,
      user_id: user.id
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
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('API: Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError.message }, { status: 401 })
    }

    if (!user) {
      console.error('API: No authenticated user')
      return NextResponse.json({ error: 'No user authenticated' }, { status: 401 })
    }

    const { genres } = await request.json()

    if (!Array.isArray(genres)) {
      return NextResponse.json({ error: 'Invalid genres data - must be an array' }, { status: 400 })
    }

    console.log('API: Saving user genres for user:', user.id, 'genres:', genres)

    // Update the preferred_genres column in fan_profiles
    const { error: updateError } = await supabase
      .from('fan_profiles')
      .upsert({
        user_id: user.id,
        preferred_genres: genres,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (updateError) {
      console.error('API: Error updating genres:', updateError)
      return NextResponse.json({
        error: 'Database error updating genres',
        details: updateError.message
      }, { status: 500 })
    }

    console.log('API: Successfully saved user genres')

    return NextResponse.json({
      success: true,
      data: genres,
      user_id: user.id
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
