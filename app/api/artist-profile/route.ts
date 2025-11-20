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

    console.log('API: Fetching artist profile for user:', user.id)

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, user_id, profile_type, artist_type_id, artist_sub_types, artist_primary_roles, company_name, job_title, years_experience, hourly_rate, daily_rate, monthly_retainer, availability_status, preferred_genre_ids, location_details, contact_details, social_links, verification_documents, bio, stage_name, established_date, performing_members, base_location, base_location_lat, base_location_lon, hometown_city, hometown_state, hometown_country, gigs_performed, record_label_status, record_label_name, record_label_contact_name, record_label_email, record_label_phone, music_publisher_status, music_publisher_name, music_publisher_contact_name, music_publisher_email, music_publisher_phone, artist_manager_status, artist_manager_name, artist_manager_contact_name, artist_manager_email, artist_manager_phone, booking_agent_status, booking_agent_name, booking_agent_contact_name, booking_agent_email, booking_agent_phone, facebook_url, instagram_url, threads_url, x_url, tiktok_url, youtube_url, snapchat_url, website, onboarding_completed, onboarding_completed_at, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('profile_type', 'artist')
      .maybeSingle()

    if (profileError) {
      console.error('API: Database error:', profileError)
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({
          data: null,
          message: 'No artist profile found for user'
        })
      }
      return NextResponse.json({
        error: 'Database error',
        details: profileError.message,
        code: profileError.code
      }, { status: 500 })
    }

    // Handle case where no profile found (maybeSingle returns null without error)
    if (!profileData) {
      console.log('API: No artist profile found for user (null data)')
      return NextResponse.json({
        data: null,
        message: 'No artist profile found for user'
      })
    }

    console.log('API: Successfully fetched artist profile data:', !!profileData)

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
      stage_name,
      bio,
      established_date,
      base_location,
      hometown_city,
      hometown_state,
      hometown_country,
      gigs_performed,
      members,
      website,
      social_links,
      artist_type_id,
      artist_sub_types,
      preferred_genre_ids,
      record_label_status,
      record_label_name,
      record_label_contact_name,
      record_label_email,
      record_label_phone,
      music_publisher_status,
      music_publisher_name,
      music_publisher_contact_name,
      music_publisher_email,
      music_publisher_phone,
      artist_manager_status,
      artist_manager_name,
      artist_manager_contact_name,
      artist_manager_email,
      artist_manager_phone,
      booking_agent_status,
      booking_agent_name,
      booking_agent_contact_name,
      booking_agent_email,
      booking_agent_phone,
      performing_members,
      base_location_lat,
      base_location_lon,
      facebook_url,
      instagram_url,
      threads_url,
      x_url,
      tiktok_url,
      youtube_url,
      snapchat_url,
      artist_primary_roles,
      is_published,
      onboarding_completed
    } = body

    console.log('API: Creating/updating artist profile for user:', user.id)

    const profileData: Record<string, unknown> = {
      user_id: user.id,
      profile_type: 'artist',
      updated_at: new Date().toISOString()
    }

    if (stage_name !== undefined) {
      profileData.stage_name = stage_name || null
    }

    if (bio !== undefined) {
      profileData.bio = bio || null
    }

    if (established_date !== undefined) {
      profileData.established_date = established_date || null
    }

    if (base_location !== undefined) {
      profileData.base_location = base_location || null
    }

    if (base_location_lat !== undefined) {
      const latNumber = typeof base_location_lat === 'number' ? base_location_lat : parseFloat(base_location_lat)
      profileData.base_location_lat = Number.isFinite(latNumber) ? latNumber : null
    }

    if (base_location_lon !== undefined) {
      const lonNumber = typeof base_location_lon === 'number' ? base_location_lon : parseFloat(base_location_lon)
      profileData.base_location_lon = Number.isFinite(lonNumber) ? lonNumber : null
    }

    if (performing_members !== undefined) {
      if (typeof performing_members === 'number') {
        profileData.performing_members = performing_members
      } else if (typeof performing_members === 'string' && performing_members.trim()) {
        const parsedMembers = parseInt(performing_members, 10)
        profileData.performing_members = Number.isNaN(parsedMembers) ? null : parsedMembers
      } else {
        profileData.performing_members = null
      }
    }

    if (hometown_city !== undefined) {
      profileData.hometown_city = hometown_city || null
    }

    if (hometown_state !== undefined) {
      profileData.hometown_state = hometown_state || null
    }

    if (hometown_country !== undefined) {
      profileData.hometown_country = hometown_country || null
    }

    if (gigs_performed !== undefined) {
      if (typeof gigs_performed === 'number') {
        profileData.gigs_performed = gigs_performed
      } else if (typeof gigs_performed === 'string' && gigs_performed.trim()) {
        const parsed = parseInt(gigs_performed, 10)
        profileData.gigs_performed = Number.isNaN(parsed) ? null : parsed
      } else {
        profileData.gigs_performed = null
      }
    }

    if (members !== undefined) {
      if (Array.isArray(members)) {
        profileData.members = members
      } else if (typeof members === 'string') {
        profileData.members = members
          .split(',')
          .map((m: string) => m.trim())
          .filter(Boolean)
      } else {
        profileData.members = null
      }
    }

    if (website !== undefined) {
      profileData.website = website || null
    }

    if (social_links !== undefined) {
      profileData.social_links = social_links || {}
    }

    const normalizeContactStatus = (val: unknown) => {
      if (typeof val !== 'string') return val
      const normalized = val.trim().toLowerCase()
      if (!normalized) return null
      if (['signed', 'signed to label', 'signed to publisher'].includes(normalized)) return 'signed'
      if ([
        'unsigned',
        'seeking',
        'unsigned - seeking label',
        'unsigned - seeking publisher',
        'unsigned_seeking'
      ].includes(normalized)) return 'unsigned_seeking'
      if ([
        'independent',
        'self signed - independent',
        'self publishing - independent',
        'self-signed',
        'self_signed'
      ].includes(normalized)) return 'independent'
      return normalized
    }

    const normalizeManagerStatus = (val: unknown) => {
      if (typeof val !== 'string') return val
      const normalized = val.trim().toLowerCase()
      if (!normalized) return null
      if (['signed', 'managed', 'signed to manager'].includes(normalized)) return 'signed'
      if (['seeking', 'unsigned', 'unsigned - seeking manager'].includes(normalized)) return 'seeking'
      if ([
        'self_managed',
        'self-managed',
        'self managed',
        'self managed - independent',
        'self booking',
        'self-booking'
      ].includes(normalized)) return 'self_managed'
      return normalized
    }

    const normalizeBookingStatus = (val: unknown) => {
      if (typeof val !== 'string') return val
      const normalized = val.trim().toLowerCase()
      if (!normalized) return null
      if (['signed', 'managed', 'signed to booking agent'].includes(normalized)) return 'signed'
      if (['seeking', 'unsigned', 'unsigned - seeking booking agent'].includes(normalized)) return 'seeking'
      if ([
        'self_managed',
        'self-managed',
        'self managed',
        'self booking',
        'self-booking',
        'self booking - independent'
      ].includes(normalized)) return 'self_managed'
      return normalized
    }

    const assignIfDefined = (key: string, value: unknown, transform?: (val: unknown) => unknown) => {
      if (value === undefined) return
      if (transform) {
        profileData[key] = transform(value)
        return
      }
      profileData[key] = value || null
    }

    assignIfDefined('record_label_status', record_label_status, normalizeContactStatus)
    assignIfDefined('record_label_name', record_label_name)
    assignIfDefined('record_label_contact_name', record_label_contact_name)
    assignIfDefined('record_label_email', record_label_email)
    assignIfDefined('record_label_phone', record_label_phone)
    assignIfDefined('music_publisher_status', music_publisher_status, normalizeContactStatus)
    assignIfDefined('music_publisher_name', music_publisher_name)
    assignIfDefined('music_publisher_contact_name', music_publisher_contact_name)
    assignIfDefined('music_publisher_email', music_publisher_email)
    assignIfDefined('music_publisher_phone', music_publisher_phone)
    assignIfDefined('artist_manager_status', artist_manager_status, normalizeManagerStatus)
    assignIfDefined('artist_manager_name', artist_manager_name)
    assignIfDefined('artist_manager_contact_name', artist_manager_contact_name)
    assignIfDefined('artist_manager_email', artist_manager_email)
    assignIfDefined('artist_manager_phone', artist_manager_phone)
    assignIfDefined('booking_agent_status', booking_agent_status, normalizeBookingStatus)
    assignIfDefined('booking_agent_name', booking_agent_name)
    assignIfDefined('booking_agent_contact_name', booking_agent_contact_name)
    assignIfDefined('booking_agent_email', booking_agent_email)
    assignIfDefined('booking_agent_phone', booking_agent_phone)
    assignIfDefined('facebook_url', facebook_url)
    assignIfDefined('instagram_url', instagram_url)
    assignIfDefined('threads_url', threads_url)
    assignIfDefined('x_url', x_url)
    assignIfDefined('tiktok_url', tiktok_url)
    assignIfDefined('youtube_url', youtube_url)
    assignIfDefined('snapchat_url', snapchat_url)

    if (artist_primary_roles !== undefined) {
      profileData.artist_primary_roles = Array.isArray(artist_primary_roles)
        ? artist_primary_roles.filter((val: unknown): val is string => typeof val === 'string' && val.trim().length > 0)
        : artist_primary_roles
    }

    if (artist_type_id !== undefined) {
      profileData.artist_type_id = artist_type_id || null
    }

    if (artist_sub_types !== undefined) {
      profileData.artist_sub_types = artist_sub_types || null
    }

    if (preferred_genre_ids !== undefined) {
      profileData.preferred_genre_ids = preferred_genre_ids
    }

    if (is_published !== undefined) {
      profileData.is_published = !!is_published
    }

    if (artist_sub_types !== undefined && artist_sub_types && typeof artist_sub_types === 'object' && !Array.isArray(artist_sub_types)) {
      profileData.artist_sub_types = Object.entries(artist_sub_types).flatMap(([groupId, values]) => {
        if (!Array.isArray(values)) return []
        return values.map((val) => `${groupId}:${val}`)
      })
    }

    if (onboarding_completed === true) {
      profileData.onboarding_completed = true
      profileData.onboarding_completed_at = new Date().toISOString()
    }


    console.log('API: Attempting to upsert artist profile with data:', {
      user_id: profileData.user_id,
      profile_type: profileData.profile_type,
      stage_name: profileData.stage_name,
      artist_type_id: profileData.artist_type_id,
      onboarding_completed: profileData.onboarding_completed,
      fieldCount: Object.keys(profileData).length
    })

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id,profile_type'
      })
      .select()
      .single()

    if (error) {
      console.error('API: Error creating/updating artist profile:', error)
      console.error('API: Full error details:', JSON.stringify(error, null, 2))
      console.error('API: Profile data that failed:', JSON.stringify(profileData, null, 2))
      return NextResponse.json({
        error: 'Database error',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 })
    }

    console.log('API: Successfully created/updated artist profile:', data)

    return NextResponse.json({
      success: true,
      data: data,
      user_id: user.id,
      message: 'Artist profile saved successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
