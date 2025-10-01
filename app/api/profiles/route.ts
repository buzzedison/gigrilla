import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    const body = await request.json()
    const {
      profile_type,
      artist_type,
      artist_type_id,
      venue_type_id,
      company_name,
      description,
      years_experience,
      hourly_rate,
      daily_rate,
      monthly_retainer,
      availability_status,
      preferred_genre_ids,
      location_details,
      contact_details,
      social_links,
      verification_documents,
      stage_name,
      bio,
      established_date,
      base_location,
      members,
      website
    } = body

    console.log('API: Creating/updating profile for user:', user.id, 'type:', profile_type)

    // Prepare profile data based on type
    const profileData: Record<string, unknown> = {
      user_id: user.id,
      profile_type: profile_type,
      is_public: true,
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add role-specific data
    if (profile_type === 'artist') {
      profileData.stage_name = stage_name || null
      profileData.bio = bio || null
      profileData.established_date = established_date || null
      profileData.base_location = base_location || null
      profileData.members = members ? members.split(',').map((m: string) => m.trim()) : null
      profileData.website = website || null
      profileData.social_links = social_links || {}
      profileData.artist_type_id = artist_type_id || null
      profileData.artist_type = artist_type || null
    } else if (profile_type === 'venue') {
      profileData.company_name = company_name || null
      profileData.description = description || null
      profileData.established_date = established_date || null
      profileData.address = base_location || null // Using base_location as address for venues
      profileData.capacity = null // TODO: Add capacity field
      profileData.website = website || null
      profileData.social_links = social_links || {}
      profileData.venue_type_id = venue_type_id || null
    } else if (profile_type === 'music-service') {
      profileData.company_name = company_name || null
      profileData.description = description || null
      profileData.years_experience = years_experience || null
      profileData.hourly_rate = hourly_rate || null
      profileData.daily_rate = daily_rate || null
      profileData.monthly_retainer = monthly_retainer || null
      profileData.availability_status = availability_status || 'available'
      profileData.website = website || null
      profileData.social_links = social_links || {}
    }

    // Add common fields
    if (location_details) profileData.location_details = location_details
    if (contact_details) profileData.contact_details = contact_details
    if (preferred_genre_ids) profileData.preferred_genre_ids = preferred_genre_ids
    if (verification_documents) profileData.verification_documents = verification_documents

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id,profile_type'
      })
      .select()
      .single()

    if (error) {
      console.error('API: Error creating/updating profile:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log('API: Successfully created/updated profile:', data)

    return NextResponse.json({
      success: true,
      data: data,
      user_id: user.id,
      message: 'Profile created/updated successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
