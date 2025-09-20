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
      console.error('Fan Status API: Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError.message }, { status: 401 })
    }

    if (!user) {
      console.error('Fan Status API: No authenticated user')
      return NextResponse.json({ error: 'No user authenticated' }, { status: 401 })
    }

    console.log('Fan Status API: Checking status for user:', user.id)

    // Get fan status from fan_profiles table (same table that upgrade updates)
    const { data: profileData, error: statusError } = await supabase
      .from('fan_profiles')
      .select('account_type, username, bio, contact_details, location_details')
      .eq('user_id', user.id)
      .maybeSingle()

    if (statusError) {
      console.error('Fan Status API: Database error:', statusError)
      return NextResponse.json({
        error: 'Database error',
        details: statusError.message,
        code: statusError.code
      }, { status: 500 })
    }

    console.log('Fan Status API: Successfully fetched profile data:', profileData)

    // Create status data based on fan_profiles
    const accountType = profileData?.account_type || 'guest'
    const statusData = {
      account_type: accountType,
      is_complete: accountType === 'full',
      completion_percent: accountType === 'full' ? 100 : 50
    }

    return NextResponse.json({
      data: statusData,
      user_id: user.id
    })

  } catch (error) {
    console.error('Fan Status API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
