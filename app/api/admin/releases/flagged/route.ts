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

        const serviceSupabase = createServiceClient()

        // Fetch flagged releases
        const { data: flaggedReleases, error } = await serviceSupabase
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
        flagged_at
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

        const userIds = Array.from(
            new Set((flaggedReleases || []).map((release) => release.user_id).filter(Boolean))
        ) as string[]

        let stageNameByUserId = new Map<string, string>()

        if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await serviceSupabase
                .from('user_profiles')
                .select('user_id, stage_name')
                .eq('profile_type', 'artist')
                .in('user_id', userIds)

            if (profilesError) {
                console.warn('Could not hydrate artist stage names for flagged releases:', profilesError)
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

        const hydratedReleases = (flaggedReleases || []).map((release) => ({
            ...release,
            artist_profiles: {
                stage_name: stageNameByUserId.get(release.user_id) || 'Unknown Artist'
            }
        }))

        return NextResponse.json({
            success: true,
            data: hydratedReleases
        })

    } catch (error) {
        console.error('Flagged releases API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
