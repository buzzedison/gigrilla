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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rawLimit = Number.parseInt(searchParams.get('limit') || '100', 10)
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 300)) : 100

    const serviceSupabase = createServiceClient()
    const { data: releases, error: releasesError } = await serviceSupabase
      .from('music_releases')
      .select('id, user_id, release_title, cover_artwork_url, published_at, created_at')
      .in('status', ['published', 'approved'])
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (releasesError) {
      console.error('API: Error fetching releases for published tracks:', releasesError)
      return NextResponse.json({ error: 'Failed to fetch published tracks' }, { status: 500 })
    }

    if (!releases || releases.length === 0) {
      return NextResponse.json({ success: true, data: [], count: 0 })
    }

    const releaseById = new Map(
      releases.map((release) => [release.id, release])
    )
    const releaseIds = releases.map((release) => release.id)
    const userIds = Array.from(new Set(releases.map((release) => release.user_id)))

    const { data: tracks, error: tracksError } = await serviceSupabase
      .from('music_tracks')
      .select('id, release_id, track_number, track_title, audio_file_url, duration_seconds')
      .in('release_id', releaseIds)
      .not('audio_file_url', 'is', null)
      .order('release_id', { ascending: true })
      .order('track_number', { ascending: true })

    if (tracksError) {
      console.error('API: Error fetching published track rows:', tracksError)
      return NextResponse.json({ error: 'Failed to fetch published tracks' }, { status: 500 })
    }

    let stageNameByUserId = new Map<string, string>()
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await serviceSupabase
        .from('user_profiles')
        .select('user_id, stage_name')
        .eq('profile_type', 'artist')
        .in('user_id', userIds)

      if (profilesError) {
        console.warn('API: Could not fetch stage names for published tracks:', profilesError)
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

    const data = (tracks || [])
      .map((track) => {
        const release = releaseById.get(track.release_id)
        if (!release || !track.audio_file_url) {
          return null
        }

        return {
          id: track.id,
          release_id: release.id,
          release_title: release.release_title,
          cover_artwork_url: release.cover_artwork_url,
          artist_name: stageNameByUserId.get(release.user_id) || 'Unknown Artist',
          track_number: track.track_number || 1,
          track_title: track.track_title || `Track ${track.track_number || 1}`,
          audio_file_url: track.audio_file_url,
          duration_seconds: track.duration_seconds || 0,
          published_at: release.published_at || release.created_at
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = new Date(a!.published_at).getTime()
        const bTime = new Date(b!.published_at).getTime()
        if (aTime !== bTime) return bTime - aTime
        return (a!.track_number || 0) - (b!.track_number || 0)
      })

    return NextResponse.json({
      success: true,
      data,
      count: data.length
    })
  } catch (error) {
    console.error('API: Unexpected error fetching published tracks:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
