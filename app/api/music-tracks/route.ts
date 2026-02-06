import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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
              // Server Component invocation can safely ignore cookie writes.
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const releaseId = searchParams.get('releaseId')

    if (!releaseId) {
      return NextResponse.json({ error: 'releaseId is required' }, { status: 400 })
    }

    // Fetch tracks for this release
    const { data: tracks, error } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('release_id', releaseId)
      .eq('user_id', user.id)
      .order('track_number', { ascending: true })

    if (error) {
      console.error('Error fetching tracks:', error)
      return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: tracks || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
              // Server Component invocation can safely ignore cookie writes.
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
    const {
      releaseId,
      trackNumber,
      trackTitle,
      trackTitleConfirmed,
      trackVersion,
      masterRecordingDate,
      isrc,
      isrcConfirmed,
      iswc,
      iswcConfirmed,
      musicalWorkTitle,
      musicalWorkTitleConfirmed,
      primaryArtists,
      featuredArtists,
      sessionArtists,
      creators,
      producers,
      coverRights,
      coverLicenseUrl,
      remixRights,
      remixAuthorizationUrl,
      samplesRights,
      samplesClearanceUrl,
      primaryGenre,
      secondaryGenre,
      primaryMood,
      secondaryMoods,
      primaryLanguage,
      secondaryLanguage,
      explicitContent,
      childSafeContent,
      audioFileUrl,
      audioFileSize,
      audioFormat,
      dolbyAtmosFileUrl,
      previewStartTime,
      lyrics,
      lyricsConfirmed,
      lyricsFileUrl,
      videoUrl,
      videoUrlConfirmed,
      durationSeconds
    } = body

    if (!releaseId || !trackNumber) {
      return NextResponse.json({
        error: 'Missing required fields: releaseId, trackNumber'
      }, { status: 400 })
    }

    // Verify release belongs to user
    const { data: release, error: releaseError } = await supabase
      .from('music_releases')
      .select('id')
      .eq('id', releaseId)
      .eq('user_id', user.id)
      .single()

    if (releaseError || !release) {
      return NextResponse.json({ error: 'Release not found or access denied' }, { status: 404 })
    }

    // Check if track already exists
    const { data: existingTrack } = await supabase
      .from('music_tracks')
      .select('id')
      .eq('release_id', releaseId)
      .eq('track_number', trackNumber)
      .single()

    const normalizedTrackTitle = typeof trackTitle === 'string'
      ? trackTitle.trim()
      : ''
    const normalizedIsrc = typeof isrc === 'string' && isrc.trim().length > 0
      ? isrc.replace(/-/g, '').toUpperCase()
      : null

    const trackData: Record<string, unknown> = {
      release_id: releaseId,
      user_id: user.id,
      track_number: trackNumber,
      track_title: normalizedTrackTitle,
      track_title_confirmed: trackTitleConfirmed || false,
      track_version: trackVersion || null,
      master_recording_date: masterRecordingDate || null,
      isrc: normalizedIsrc,
      isrc_confirmed: isrcConfirmed || false,
      iswc: iswc || null,
      iswc_confirmed: iswcConfirmed || false,
      musical_work_title: musicalWorkTitle || null,
      musical_work_title_confirmed: musicalWorkTitleConfirmed || false,
      primary_artists: primaryArtists || [],
      featured_artists: featuredArtists || [],
      session_artists: sessionArtists || [],
      creators: creators || [],
      producers: producers || [],
      cover_rights: coverRights || null,
      cover_license_url: coverLicenseUrl || null,
      remix_rights: remixRights || null,
      remix_authorization_url: remixAuthorizationUrl || null,
      samples_rights: samplesRights || null,
      samples_clearance_url: samplesClearanceUrl || null,
      primary_genre: primaryGenre || null,
      secondary_genre: secondaryGenre || null,
      primary_mood: primaryMood || null,
      secondary_moods: secondaryMoods || [],
      primary_language: primaryLanguage || null,
      secondary_language: secondaryLanguage || null,
      explicit_content: explicitContent || null, // Now TEXT: 'no-clean-original', 'no-clean-radio-edit', 'yes-explicit'
      child_safe_content: childSafeContent || null,
      audio_file_url: audioFileUrl || null,
      audio_file_size: audioFileSize || null,
      audio_format: audioFormat || null,
      dolby_atmos_file_url: dolbyAtmosFileUrl || null,
      preview_start_time: previewStartTime || 0,
      lyrics: lyrics || null,
      lyrics_confirmed: lyricsConfirmed || false,
      lyrics_file_url: lyricsFileUrl || null,
      video_url: videoUrl || null,
      video_url_confirmed: videoUrlConfirmed || false,
      duration_seconds: durationSeconds || null
    }

    let result
    if (existingTrack) {
      // Update existing track
      const { data, error } = await supabase
        .from('music_tracks')
        .update(trackData)
        .eq('id', existingTrack.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating track:', error)
        return NextResponse.json({ error: 'Failed to update track' }, { status: 500 })
      }

      result = data
    } else {
      // Create new track
      const { data, error } = await supabase
        .from('music_tracks')
        .insert(trackData)
        .select()
        .single()

      if (error) {
        console.error('Error creating track:', error)
        return NextResponse.json({ error: 'Failed to create track' }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
