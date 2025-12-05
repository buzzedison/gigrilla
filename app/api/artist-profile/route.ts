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
      .select('id, user_id, profile_type, artist_type_id, artist_sub_types, artist_primary_roles, company_name, job_title, years_experience, hourly_rate, daily_rate, monthly_retainer, availability_status, preferred_genre_ids, location_details, contact_details, social_links, verification_documents, bio, stage_name, established_date, performing_members, base_location, base_location_lat, base_location_lon, hometown_city, hometown_state, hometown_country, gigs_performed, record_label_status, record_label_name, record_label_contact_name, record_label_email, record_label_phone, music_publisher_status, music_publisher_name, music_publisher_contact_name, music_publisher_email, music_publisher_phone, artist_manager_status, artist_manager_name, artist_manager_contact_name, artist_manager_email, artist_manager_phone, booking_agent_status, booking_agent_name, booking_agent_contact_name, booking_agent_email, booking_agent_phone, facebook_url, instagram_url, threads_url, x_url, tiktok_url, youtube_url, snapchat_url, website, onboarding_completed, onboarding_completed_at, created_at, updated_at, minimum_set_length, maximum_set_length, local_gig_fee, local_gig_timescale, wider_gig_fee, wider_gig_timescale, wider_fixed_logistics_fee, wider_negotiated_logistics, local_gig_area, wider_gig_area, vocal_sound_types, vocal_genre_styles, availability, instrument_category, instrument, songwriter_option, songwriter_genres, lyricist_option, lyricist_genres, composer_option, composer_genres')
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
      onboarding_completed,
      // Type 4 Vocalist fields
      vocal_sound_types,
      vocal_genre_styles,
      availability,
      // Type 5 Instrumentalist fields
      instrument_category,
      instrument,
      // Type 6-8 fields
      songwriter_option,
      songwriter_genres,
      lyricist_option,
      lyricist_genres,
      composer_option,
      composer_genres,
      minimum_set_length,
      maximum_set_length,
      local_gig_fee,
      local_gig_timescale,
      wider_gig_fee,
      wider_gig_timescale,
      wider_fixed_logistics_fee,
      wider_negotiated_logistics,
      local_gig_area,
      wider_gig_area
    } = body

    console.log('API: Creating/updating artist profile for user:', user.id)

    // Ensure user record exists in users table
    const { error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (userCheckError && userCheckError.code === 'PGRST116') {
      // User doesn't exist in users table, create it
      console.log('API: Creating user record for:', user.id)
      const { error: userCreateError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (userCreateError) {
        console.error('API: Failed to create user record:', userCreateError)
        return NextResponse.json({
          error: 'Failed to create user record',
          details: userCreateError.message,
          code: userCreateError.code
        }, { status: 500 })
      }
      
      console.log('API: User record created successfully')
    } else if (userCheckError) {
      console.error('API: Error checking user record:', userCheckError)
      return NextResponse.json({
        error: 'Database error checking user',
        details: userCheckError.message,
        code: userCheckError.code
      }, { status: 500 })
    }

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

    // Gig ability fields (migrations 033 and 034 have been run)
    if (minimum_set_length !== undefined) {
      const minLength = typeof minimum_set_length === 'number' ? minimum_set_length : parseInt(minimum_set_length)
      profileData.minimum_set_length = Number.isFinite(minLength) && minLength >= 15 && minLength <= 180 && minLength % 15 === 0 ? minLength : 30
    }

    if (maximum_set_length !== undefined) {
      const maxLength = typeof maximum_set_length === 'number' ? maximum_set_length : parseInt(maximum_set_length)
      profileData.maximum_set_length = Number.isFinite(maxLength) && maxLength >= 15 && maxLength <= 180 && maxLength % 15 === 0 ? maxLength : 120
    }

    if (local_gig_fee !== undefined) {
      const fee = typeof local_gig_fee === 'number' ? local_gig_fee : parseFloat(local_gig_fee)
      profileData.local_gig_fee = Number.isFinite(fee) ? fee : 0
    }

    if (local_gig_timescale !== undefined) {
      const timescale = typeof local_gig_timescale === 'number' ? local_gig_timescale : parseInt(local_gig_timescale)
      profileData.local_gig_timescale = Number.isFinite(timescale) ? timescale : 30
    }

    if (wider_gig_fee !== undefined) {
      const fee = typeof wider_gig_fee === 'number' ? wider_gig_fee : parseFloat(wider_gig_fee)
      profileData.wider_gig_fee = Number.isFinite(fee) ? fee : 0
    }

    if (wider_gig_timescale !== undefined) {
      const timescale = typeof wider_gig_timescale === 'number' ? wider_gig_timescale : parseInt(wider_gig_timescale)
      profileData.wider_gig_timescale = Number.isFinite(timescale) ? timescale : 30
    }

    if (wider_fixed_logistics_fee !== undefined) {
      const fee = typeof wider_fixed_logistics_fee === 'number' ? wider_fixed_logistics_fee : parseFloat(wider_fixed_logistics_fee)
      profileData.wider_fixed_logistics_fee = Number.isFinite(fee) ? fee : 0
    }

    if (wider_negotiated_logistics !== undefined) {
      profileData.wider_negotiated_logistics = Boolean(wider_negotiated_logistics)
    }

    if (local_gig_area !== undefined) {
      profileData.local_gig_area = local_gig_area || null
    }

    if (wider_gig_area !== undefined) {
      profileData.wider_gig_area = wider_gig_area || null
    }

    // Type 4 Vocalist fields
    if (vocal_sound_types !== undefined) {
      profileData.vocal_sound_types = vocal_sound_types || null
    }

    if (vocal_genre_styles !== undefined) {
      profileData.vocal_genre_styles = vocal_genre_styles || null
    }

    if (availability !== undefined) {
      profileData.availability = availability || null
    }

    // Type 5 Instrumentalist fields
    if (instrument_category !== undefined) {
      profileData.instrument_category = instrument_category || null
    }

    if (instrument !== undefined) {
      profileData.instrument = instrument || null
    }

    // Type 6 Songwriter fields
    if (songwriter_option !== undefined) {
      profileData.songwriter_option = songwriter_option || null
    }

    if (songwriter_genres !== undefined) {
      profileData.songwriter_genres = songwriter_genres || null
    }

    // Type 7 Lyricist fields
    if (lyricist_option !== undefined) {
      profileData.lyricist_option = lyricist_option || null
    }

    if (lyricist_genres !== undefined) {
      profileData.lyricist_genres = lyricist_genres || null
    }

    // Type 8 Composer fields
    if (composer_option !== undefined) {
      profileData.composer_option = composer_option || null
    }

    if (composer_genres !== undefined) {
      profileData.composer_genres = composer_genres || null
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

    // Clear onboarding_member_type flag when onboarding is completed
    if (onboarding_completed === true) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          onboarding_member_type: null,
          onboarding_completed: true
        }
      })
      if (metadataError) {
        console.warn('API: Unable to clear onboarding_member_type flag', metadataError)
      }
    }

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
