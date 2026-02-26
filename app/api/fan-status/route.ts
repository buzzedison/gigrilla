import { NextResponse } from 'next/server'
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
      .select('account_type, username, bio, contact_details, location_details, music_preferences, avatar_url, onboarding_completed')
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

    const accountType = profileData?.account_type || 'guest'
    const contactDetails = (profileData?.contact_details ?? {}) as Record<string, unknown>
    const locationDetails = (profileData?.location_details ?? {}) as Record<string, unknown>
    const musicPreferences = (profileData?.music_preferences ?? {}) as Record<string, unknown>

    const hasUsername = typeof profileData?.username === 'string' && profileData.username.trim().length > 0
    const hasPhone = typeof contactDetails.phone === 'string' && contactDetails.phone.trim().length > 0
    const hasAddress = typeof locationDetails.address === 'string' && locationDetails.address.trim().length > 0
    const hasMainGenres = Array.isArray(musicPreferences.main_genres) && musicPreferences.main_genres.length > 0
    const hasAvatar = typeof profileData?.avatar_url === 'string' && profileData.avatar_url.trim().length > 0
    const onboardingCompleted = profileData?.onboarding_completed === true

    const requiredChecks = [hasUsername, hasPhone, hasAddress, hasMainGenres, hasAvatar, onboardingCompleted]
    const completedChecks = requiredChecks.filter(Boolean).length
    const completionPercent = Math.round((completedChecks / requiredChecks.length) * 100)
    const isComplete = accountType === 'full' && requiredChecks.every(Boolean)

    // Create status data based on fan_profiles
    const statusData = {
      account_type: accountType,
      is_complete: isComplete,
      completion_percent: completionPercent
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
