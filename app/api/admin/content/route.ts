import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

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

// Check if user is moderator
async function isModerator(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return ['community_moderator', 'admin', 'super_admin'].includes(profile?.role)
}

// GET - Fetch content with advanced filtering for moderation
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is moderator
    const moderatorCheck = await isModerator(supabase, user.id)
    if (!moderatorCheck) {
      return NextResponse.json({
        error: 'Insufficient permissions. Moderator role required.'
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const flagged = searchParams.get('flagged')
    const offensive = searchParams.get('offensive')
    const doNotRecommend = searchParams.get('doNotRecommend')
    const removed = searchParams.get('removed')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const serviceSupabase = createServiceClient()

    // Build query
    let query = serviceSupabase
      .from('music_releases')
      .select(`
        *,
        artist:user_id (
          id,
          email
        )
      `, { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (flagged === 'true') {
      query = query.eq('flagged_for_review', true)
    } else if (flagged === 'false') {
      query = query.eq('flagged_for_review', false)
    }

    if (offensive === 'true') {
      query = query.eq('is_offensive', true)
    } else if (offensive === 'false') {
      query = query.eq('is_offensive', false)
    }

    if (doNotRecommend === 'true') {
      query = query.eq('do_not_recommend', true)
    } else if (doNotRecommend === 'false') {
      query = query.eq('do_not_recommend', false)
    }

    if (removed === 'true') {
      query = query.not('removed_at', 'is', null)
    } else if (removed === 'false') {
      query = query.is('removed_at', null)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('API: Error fetching content:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    // Fetch moderation action counts for each release
    const releaseIds = data?.map(r => r.id) || []
    let moderationCounts: Record<string, number> = {}

    if (releaseIds.length > 0) {
      const { data: actions } = await supabase
        .from('moderation_actions')
        .select('release_id')
        .in('release_id', releaseIds)

      if (actions) {
        moderationCounts = actions.reduce((acc, action) => {
          acc[action.release_id] = (acc[action.release_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    const userIds = Array.from(
      new Set((data || []).map((release) => release.user_id).filter(Boolean))
    ) as string[]
    let stageNameByUserId = new Map<string, string>()

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await serviceSupabase
        .from('user_profiles')
        .select('user_id, stage_name')
        .eq('profile_type', 'artist')
        .in('user_id', userIds)

      if (profilesError) {
        console.warn('Could not hydrate artist stage names for admin content list:', profilesError)
      } else {
        stageNameByUserId = new Map(
          (profiles || [])
            .filter((profile) => typeof profile.user_id === 'string')
            .map((profile) => [
              profile.user_id as string,
              (profile.stage_name as string | null) || 'Unknown Artist'
            ])
        )
      }
    }

    // Enhance data with moderation counts
    const enhancedData = data?.map(release => ({
      ...release,
      artist_profiles: {
        stage_name: stageNameByUserId.get(release.user_id) || 'Unknown Artist',
        user_id: release.user_id
      },
      moderation_action_count: moderationCounts[release.id] || 0
    }))

    return NextResponse.json({
      data: enhancedData,
      count: enhancedData?.length || 0,
      totalCount: count,
      offset,
      limit
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
