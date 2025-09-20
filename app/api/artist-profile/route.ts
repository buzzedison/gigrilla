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

    console.log('API: Fetching artist profile for user:', user.id)

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, user_id, profile_type, artist_type_id, artist_sub_types, company_name, job_title, years_experience, hourly_rate, daily_rate, monthly_retainer, availability_status, preferred_genres, location_details, contact_details, social_links, verification_documents, bio, stage_name, established_date, base_location, members, website, created_at, updated_at')
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

    const body = await request.json()
    const {
      stage_name,
      bio,
      established_date,
      base_location,
      members,
      website,
      social_links,
      artist_type_id,
      artist_sub_types
    } = body

    console.log('API: Creating/updating artist profile for user:', user.id)

    const profileData = {
      user_id: user.id,
      profile_type: 'artist',
      stage_name: stage_name || null,
      bio: bio || null,
      established_date: established_date || null,
      base_location: base_location || null,
      members: members ? members.split(',').map((m: string) => m.trim()) : null,
      website: website || null,
      social_links: social_links || {},
      artist_type_id: artist_type_id || null,
      artist_sub_types: artist_sub_types || null,
      is_published: true,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id,profile_type'
      })
      .select()
      .single()

    if (error) {
      console.error('API: Error creating/updating artist profile:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message,
        code: error.code
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
