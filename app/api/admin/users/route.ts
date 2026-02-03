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

// GET - Fetch users with filtering and stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminCheck = await isAdmin(supabase, user.id)
    if (!adminCheck) {
      return NextResponse.json({
        error: 'Insufficient permissions. Admin role required.'
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    const banned = searchParams.get('banned')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch specific user details with stats
    if (userId) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user:user_id (
            id,
            email,
            created_at
          )
        `)
        .eq('user_id', userId)
        .single()

      if (profileError) {
        return NextResponse.json({
          error: 'User not found',
          details: profileError.message
        }, { status: 404 })
      }

      // Get release stats
      const { data: releaseStats } = await supabase.rpc('get_user_release_stats', {
        p_user_id: userId
      })

      // Check if user is banned
      const { data: banData } = await supabase
        .from('user_bans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('banned_at', { ascending: false })
        .limit(1)
        .single()

      // Get moderation actions related to this user
      const { data: moderationHistory } = await supabase
        .from('moderation_actions')
        .select('*')
        .eq('user_id', userId)
        .order('action_taken_at', { ascending: false })
        .limit(10)

      return NextResponse.json({
        data: {
          profile,
          stats: releaseStats || {
            total_releases: 0,
            published_releases: 0,
            flagged_releases: 0,
            removed_releases: 0
          },
          ban: banData || null,
          moderationHistory: moderationHistory || []
        }
      })
    }

    // Fetch all users with filters
    let query = supabase
      .from('user_profiles')
      .select(`
        *,
        user:user_id (
          id,
          email,
          created_at
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (role) {
      query = query.eq('role', role)
    }

    const { data: profiles, error, count } = await query

    if (error) {
      console.error('API: Error fetching users:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    // If filtering by banned status, fetch ban data
    let usersWithBans = profiles

    if (banned === 'true') {
      const userIds = profiles?.map(p => p.user_id) || []

      const { data: bans } = await supabase
        .from('user_bans')
        .select('user_id')
        .in('user_id', userIds)
        .eq('is_active', true)

      const bannedUserIds = new Set(bans?.map(b => b.user_id) || [])
      usersWithBans = profiles?.filter(p => bannedUserIds.has(p.user_id))
    } else if (banned === 'false') {
      const userIds = profiles?.map(p => p.user_id) || []

      const { data: bans } = await supabase
        .from('user_bans')
        .select('user_id')
        .in('user_id', userIds)
        .eq('is_active', true)

      const bannedUserIds = new Set(bans?.map(b => b.user_id) || [])
      usersWithBans = profiles?.filter(p => !bannedUserIds.has(p.user_id))
    }

    return NextResponse.json({
      data: usersWithBans,
      count: usersWithBans?.length || 0,
      totalCount: count
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Update user role
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminCheck = await isAdmin(supabase, user.id)
    if (!adminCheck) {
      return NextResponse.json({
        error: 'Insufficient permissions. Admin role required.'
      }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({
        error: 'User ID and role are required'
      }, { status: 400 })
    }

    const validRoles = ['user', 'community_moderator', 'admin', 'super_admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({
        error: 'Invalid role'
      }, { status: 400 })
    }

    // Update user role
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('API: Error updating user role:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      data
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
