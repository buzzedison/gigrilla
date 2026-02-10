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
      .select('id, user_id, release_title, status, track_count, submitted_at, published_at, created_at')
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

    const releaseIds = (releases || [])
      .map((release) => release.id)
      .filter((releaseId): releaseId is string => typeof releaseId === 'string')

    let trackSummaryByReleaseId = new Map<
      string,
      {
        total_tracks: number
        tracks_with_isrc: number
        tracks_with_iswc: number
        confirmed_isrc: number
        confirmed_iswc: number
      }
    >()

    if (releaseIds.length > 0) {
      const { data: tracks, error: tracksError } = await serviceSupabase
        .from('music_tracks')
        .select('release_id, isrc, iswc, isrc_confirmed, iswc_confirmed')
        .in('release_id', releaseIds)

      if (tracksError) {
        console.warn('Could not hydrate track identifiers for recent published releases:', tracksError)
      } else {
        trackSummaryByReleaseId = (tracks || []).reduce((acc, track) => {
          if (!track.release_id) return acc

          const current = acc.get(track.release_id) || {
            total_tracks: 0,
            tracks_with_isrc: 0,
            tracks_with_iswc: 0,
            confirmed_isrc: 0,
            confirmed_iswc: 0
          }

          current.total_tracks += 1
          if (typeof track.isrc === 'string' && track.isrc.trim().length > 0) {
            current.tracks_with_isrc += 1
            if (track.isrc_confirmed) current.confirmed_isrc += 1
          }
          if (typeof track.iswc === 'string' && track.iswc.trim().length > 0) {
            current.tracks_with_iswc += 1
            if (track.iswc_confirmed) current.confirmed_iswc += 1
          }

          acc.set(track.release_id, current)
          return acc
        }, new Map<string, {
          total_tracks: number
          tracks_with_isrc: number
          tracks_with_iswc: number
          confirmed_isrc: number
          confirmed_iswc: number
        }>())
      }
    }

    const hydratedReleases = (releases || []).map((release) => {
      const summary = trackSummaryByReleaseId.get(release.id) || {
        total_tracks: 0,
        tracks_with_isrc: 0,
        tracks_with_iswc: 0,
        confirmed_isrc: 0,
        confirmed_iswc: 0
      }
      const expectedTracks = Number.isFinite(release.track_count)
        ? release.track_count
        : summary.total_tracks

      return {
        ...release,
        artist_profiles: {
          stage_name: stageNameByUserId.get(release.user_id) || 'Unknown Artist',
          user_id: release.user_id
        },
        identifier_summary: {
          total_tracks: expectedTracks,
          tracks_with_isrc: summary.tracks_with_isrc,
          tracks_with_iswc: summary.tracks_with_iswc,
          confirmed_isrc: summary.confirmed_isrc,
          confirmed_iswc: summary.confirmed_iswc
        }
      }
    })

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
