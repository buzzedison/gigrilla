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
              // ignored - handled by middleware
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData, error: genresError } = await supabase
      .from('fan_profiles')
      .select('preferred_genre_ids')
      .eq('user_id', user.id)
      .maybeSingle()

    if (genresError) {
      return NextResponse.json({ error: 'Database error', details: genresError.message }, { status: 500 })
    }

    const genres = profileData?.preferred_genre_ids ?? []

    return NextResponse.json({ data: genres, user_id: user.id })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
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
              // ignored - handled by middleware
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const genres = Array.isArray(body.genres) ? body.genres : []

    const { error: updateError } = await supabase
      .from('fan_profiles')
      .upsert({
        user_id: user.id,
        preferred_genre_ids: genres,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (updateError) {
      return NextResponse.json({ error: 'Database error updating genres', details: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: genres, user_id: user.id })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
