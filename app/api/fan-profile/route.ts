import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface FanProfileRequestBody {
  accountType?: string
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  dateOfBirth?: string
  address?: string
  addressVisibility?: string
  phone?: string
  phoneVisibility?: string
  genreFamilies?: string[]
  mainGenres?: string[]
  subGenres?: string[]
  preferredGenreIds?: string[]
  preferredGenres?: string[]
  autoTopUp?: boolean
  avatarUrl?: string
  photoGallery?: string[]
  videoLinks?: Array<{ title: string; url: string }>
  onboardingCompleted?: boolean
}

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
              // Server Component invocation can safely ignore cookie writes.
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('fan_profiles')
      .select('bio, username, display_name, contact_details, location_details, privacy_settings, account_type, preferred_genre_ids, music_preferences, avatar_url, photo_gallery, video_links, onboarding_completed, onboarding_completed_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null, message: 'No profile found' })
      }
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, user_id: user.id })
  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FanProfileRequestBody
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
              // Server Component invocation can safely ignore cookie writes.
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      accountType,
      username,
      firstName,
      lastName,
      email,
      dateOfBirth,
      address,
      addressVisibility,
      phone,
      phoneVisibility,
      genreFamilies = [],
      mainGenres = [],
      subGenres = [],
      preferredGenreIds = [],
      preferredGenres = [],
      autoTopUp = false,
      avatarUrl,
      photoGallery,
      videoLinks,
      onboardingCompleted,
    } = body

    const { data: existingProfile, error: existingError } = await supabase
      .from('fan_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingError && existingError.code !== 'PGRST116') {
      return NextResponse.json({
        error: 'Database error',
        details: existingError.message,
      }, { status: 500 })
    }

    const payload: Record<string, unknown> = {
      user_id: user.id,
      account_type: (accountType ?? existingProfile?.account_type ?? 'guest') as string,
      updated_at: new Date().toISOString(),
    }

    if (!existingProfile) {
      payload.created_at = new Date().toISOString()
    }

    const trimmedUsername = typeof username === 'string' ? username.trim() : ''
    if (trimmedUsername) {
      payload.username = trimmedUsername
      payload.display_name = trimmedUsername
    }

    if (avatarUrl) {
      payload.avatar_url = avatarUrl
    }

    const contactDetails = (existingProfile?.contact_details as Record<string, unknown> | null) ?? {}
    if (email) contactDetails.email = email
    if (phone) contactDetails.phone = phone
    if (phoneVisibility) contactDetails.phone_visibility = phoneVisibility
    contactDetails.auto_top_up = Boolean(autoTopUp)
    if (Object.keys(contactDetails).length > 0) {
      payload.contact_details = contactDetails
    }

    if (address || addressVisibility) {
      const locationDetails = (existingProfile?.location_details as Record<string, unknown> | null) ?? {}
      if (address) locationDetails.address = address
      if (addressVisibility) locationDetails.visibility = addressVisibility
      payload.location_details = locationDetails
    }

    const musicPreferences = (existingProfile?.music_preferences as Record<string, unknown> | null) ?? {}
    musicPreferences.genre_families = genreFamilies
    musicPreferences.main_genres = mainGenres
    musicPreferences.sub_genres = subGenres
    payload.music_preferences = musicPreferences

    payload.preferred_genre_ids = preferredGenreIds
    payload.preferred_genres = preferredGenres

    if (Array.isArray(photoGallery)) {
      payload.photo_gallery = photoGallery
    }

    if (Array.isArray(videoLinks)) {
      payload.video_links = videoLinks
    }

    // Set onboarding_completed flag if explicitly provided
    if (onboardingCompleted === true) {
      payload.onboarding_completed = true
      payload.onboarding_completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('fan_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('fan-profile POST: Database upsert error:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        user_id: user.id,
        payload_keys: Object.keys(payload)
      })
      return NextResponse.json({
        error: 'Database error',
        details: error.message,
        code: error.code,
      }, { status: 500 })
    }

    const metadataUpdates: Record<string, unknown> = {}
    if (firstName) metadataUpdates.first_name = firstName
    if (lastName) metadataUpdates.last_name = lastName
    if (trimmedUsername) metadataUpdates.username = trimmedUsername
    if (dateOfBirth) metadataUpdates.date_of_birth = dateOfBirth
    if (address) metadataUpdates.address = address
    if (phone) metadataUpdates.phone = phone
    
    // Update onboarding_completed in user metadata when it's set to true
    // Also clear the onboarding_member_type flag so user doesn't get redirected to onboarding on next login
    if (onboardingCompleted === true) {
      metadataUpdates.onboarding_completed = true
      metadataUpdates.onboarding_member_type = null
    }

    if (Object.keys(metadataUpdates).length > 0) {
      const { error: metadataError } = await supabase.auth.updateUser({ data: metadataUpdates })
      if (metadataError) {
        console.warn('fan-profile POST: unable to update auth metadata', metadataError)
      }
    }

    return NextResponse.json({
      success: true,
      data,
      user_id: user.id,
      message: 'Fan profile saved',
    })
  } catch (error) {
    console.error('fan-profile POST: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
