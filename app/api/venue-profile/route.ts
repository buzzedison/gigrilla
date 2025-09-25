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

    console.log('API: Fetching venue profile for user:', user.id)

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, user_id, profile_type, venue_type_id, venue_sub_types, company_name, description, years_experience, hourly_rate, daily_rate, monthly_retainer, availability_status, preferred_genre_ids, location_details, contact_details, social_links, verification_documents, venue_name, established_date, address, capacity, website, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('profile_type', 'venue')
      .maybeSingle()

    if (profileError) {
      console.error('API: Database error:', profileError)
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({
          data: null,
          message: 'No venue profile found for user'
        })
      }
      return NextResponse.json({
        error: 'Database error',
        details: profileError.message,
        code: profileError.code
      }, { status: 500 })
    }

    console.log('API: Successfully fetched venue profile data:', !!profileData)

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
      venue_name,
      description,
      established_date,
      address,
      capacity,
      website,
      social_links,
      venue_type_id
    } = body

    console.log('API: Creating/updating venue profile for user:', user.id)

    const profileData = {
      user_id: user.id,
      profile_type: 'venue',
      company_name: venue_name || null, // Using company_name field for venue_name
      description: description || null,
      established_date: established_date || null,
      address: address || null,
      capacity: capacity ? parseInt(capacity) : null,
      website: website || null,
      social_links: social_links || {},
      venue_type_id: venue_type_id || null,
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
      console.error('API: Error creating/updating venue profile:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log('API: Successfully created/updated venue profile:', data)

    return NextResponse.json({
      success: true,
      data: data,
      user_id: user.id,
      message: 'Venue profile saved successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
