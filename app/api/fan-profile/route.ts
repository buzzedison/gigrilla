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

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('API: Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError.message }, { status: 401 })
    }

    if (!user) {
      console.error('API: No authenticated user')
      return NextResponse.json({ error: 'No user authenticated' }, { status: 401 })
    }

    console.log('API: Fetching fan profile for user:', user.id)

    // Query the fan_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('fan_profiles')
      .select('bio, username, display_name, contact_details, location_details, privacy_settings, account_type, preferred_genre_ids')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('API: Database error:', profileError)

      // If no profile found, return empty data instead of error
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({
          data: null,
          message: 'No profile found for user'
        })
      }

      return NextResponse.json({
        error: 'Database error',
        details: profileError.message,
        code: profileError.code
      }, { status: 500 })
    }

    console.log('API: Successfully fetched profile data:', !!profileData)

    return NextResponse.json({
      data: profileData,
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
