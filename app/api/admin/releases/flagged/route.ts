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

// Check if user is admin or community moderator
async function hasModeratorAccess(supabase: any, userId: string): Promise<boolean> {
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

    return ['admin', 'super_admin', 'community_moderator'].includes(profile?.role)
}

// GET - Fetch flagged releases
export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user has moderator access
        const hasAccess = await hasModeratorAccess(supabase, user.id)
        if (!hasAccess) {
            return NextResponse.json({ error: 'Forbidden - Moderator access required' }, { status: 403 })
        }

        // Fetch flagged releases
        const { data: flaggedReleases, error } = await supabase
            .from('music_releases')
            .select(`
        id,
        release_title,
        user_id,
        status,
        created_at,
        submitted_at,
        flagged_for_review,
        is_offensive,
        do_not_recommend,
        moderation_notes,
        flagged_at,
        artist_profiles!music_releases_user_id_fkey (
          stage_name
        )
      `)
            .or('flagged_for_review.eq.true,is_offensive.eq.true')
            .order('flagged_at', { ascending: false, nullsFirst: false })
            .limit(50)

        if (error) {
            console.error('Error fetching flagged releases:', error)
            return NextResponse.json({
                error: 'Failed to fetch flagged releases',
                details: error.message
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            data: flaggedReleases || []
        })

    } catch (error) {
        console.error('Flagged releases API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
