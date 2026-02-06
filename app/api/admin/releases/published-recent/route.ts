import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

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

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return profile?.role === 'admin' || profile?.role === 'super_admin'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminCheck = await isAdmin(supabase, user.id)
    if (!adminCheck) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const rawLimit = Number.parseInt(searchParams.get('limit') || '50', 10)
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 200)) : 50

    const serviceSupabase = createServiceClient()

    const { data: releases, error } = await serviceSupabase
      .from('music_releases')
      .select('id, user_id, release_title, status, submitted_at, published_at, created_at')
      .in('status', ['published', 'approved'])
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent published releases:', error)
      return NextResponse.json({ error: 'Failed to fetch recently published releases' }, { status: 500 })
    }

    const userIds = Array.from(
      new Set((releases || []).map((release) => release.user_id).filter(Boolean))
    ) as string[]

    let stageNameByUserId = new Map<string, string>()

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await serviceSupabase
        .from('user_profiles')
        .select('user_id, stage_name')
        .eq('profile_type', 'artist')
        .in('user_id', userIds)

      if (profilesError) {
        console.warn('Could not hydrate artist stage names for recent published releases:', profilesError)
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

    const hydratedReleases = (releases || []).map((release) => ({
      ...release,
      artist_profiles: {
        stage_name: stageNameByUserId.get(release.user_id) || 'Unknown Artist',
        user_id: release.user_id
      }
    }))

    return NextResponse.json({
      success: true,
      data: hydratedReleases,
      count: hydratedReleases.length
    })
  } catch (error) {
    console.error('Admin recent published releases API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
