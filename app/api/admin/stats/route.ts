import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Helper to create Supabase client
async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
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
            // Ignore
          }
        },
      },
    }
  )
}

// Check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return profile?.role === 'admin' || profile?.role === 'super_admin'
}

// GET - Fetch admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminCheck = await isAdmin(supabase, user.id)
    if (!adminCheck) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get stats using the database function
    const { data: stats, error: statsError } = await supabase
      .rpc('get_admin_dashboard_stats')
      .single()

    if (statsError) {
      console.error('Error fetching admin stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    // Get recent review activity
    const { data: recentReviews, error: reviewsError } = await supabase
      .from('music_release_reviews')
      .select(`
        *,
        music_releases (release_title),
        reviewer:auth.users!music_release_reviews_reviewer_id_fkey (email)
      `)
      .order('reviewed_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      stats: stats || {
        pending_count: 0,
        approved_this_week: 0,
        rejected_this_week: 0,
        published_count: 0
      },
      recentReviews: recentReviews || []
    })

  } catch (error) {
    console.error('Admin stats API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
