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

// Verify ISRC
async function verifyISRC(isrc: string, trackTitle: string, artistName: string) {
  try {
    const cleanISRC = isrc.replace(/-/g, '').toUpperCase()

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/isrc-lookup?isrc=${cleanISRC}`)

    if (!response.ok) {
      return {
        verified: false,
        confidenceScore: 0,
        verificationData: null,
        errorMessage: 'ISRC lookup failed'
      }
    }

    const data = await response.json()

    if (!data.success) {
      return {
        verified: false,
        confidenceScore: 0,
        verificationData: null,
        errorMessage: data.error || 'ISRC not found in database'
      }
    }

    // Calculate confidence score based on metadata match
    let confidenceScore = 0.5 // Base score for finding the ISRC

    // Check track title match (case-insensitive, fuzzy)
    const normalizeString = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim()
    const normalizedLookupTitle = normalizeString(data.data.trackTitle)
    const normalizedTrackTitle = normalizeString(trackTitle)

    if (normalizedLookupTitle === normalizedTrackTitle) {
      confidenceScore += 0.3
    } else if (normalizedLookupTitle.includes(normalizedTrackTitle) || normalizedTrackTitle.includes(normalizedLookupTitle)) {
      confidenceScore += 0.15
    }

    // Check artist name match
    const normalizedLookupArtist = normalizeString(data.data.artistName)
    const normalizedArtist = normalizeString(artistName)

    if (normalizedLookupArtist === normalizedArtist) {
      confidenceScore += 0.2
    } else if (normalizedLookupArtist.includes(normalizedArtist) || normalizedArtist.includes(normalizedLookupArtist)) {
      confidenceScore += 0.1
    }

    return {
      verified: confidenceScore >= 0.7, // Require 70% confidence
      confidenceScore: Math.min(confidenceScore, 1.0),
      verificationData: data.data,
      errorMessage: null,
      warningMessage: confidenceScore < 0.7 ? 'Metadata mismatch detected' : null
    }

  } catch (error) {
    return {
      verified: false,
      confidenceScore: 0,
      verificationData: null,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Verify GTIN (UPC/EAN)
async function verifyGTIN(gtin: string, releaseTitle: string, artistName: string) {
  try {
    const cleanGTIN = gtin.replace(/\D/g, '')

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/gtin-lookup?gtin=${cleanGTIN}`)

    if (!response.ok) {
      return {
        verified: false,
        confidenceScore: 0,
        verificationData: null,
        errorMessage: 'GTIN lookup failed'
      }
    }

    const data = await response.json()

    if (!data.success) {
      return {
        verified: false,
        confidenceScore: 0,
        verificationData: null,
        errorMessage: data.error || 'GTIN not found in database'
      }
    }

    // Calculate confidence score
    let confidenceScore = 0.5

    const normalizeString = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim()
    const normalizedLookupTitle = normalizeString(data.data.releaseTitle)
    const normalizedReleaseTitle = normalizeString(releaseTitle)

    if (normalizedLookupTitle === normalizedReleaseTitle) {
      confidenceScore += 0.3
    } else if (normalizedLookupTitle.includes(normalizedReleaseTitle) || normalizedReleaseTitle.includes(normalizedLookupTitle)) {
      confidenceScore += 0.15
    }

    const normalizedLookupArtist = normalizeString(data.data.artistName)
    const normalizedArtist = normalizeString(artistName)

    if (normalizedLookupArtist === normalizedArtist) {
      confidenceScore += 0.2
    } else if (normalizedLookupArtist.includes(normalizedArtist) || normalizedArtist.includes(normalizedLookupArtist)) {
      confidenceScore += 0.1
    }

    return {
      verified: confidenceScore >= 0.7,
      confidenceScore: Math.min(confidenceScore, 1.0),
      verificationData: data.data,
      errorMessage: null,
      warningMessage: confidenceScore < 0.7 ? 'Metadata mismatch detected' : null
    }

  } catch (error) {
    return {
      verified: false,
      confidenceScore: 0,
      verificationData: null,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// POST - Run automated verification on a release
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { releaseId } = body

    if (!releaseId) {
      return NextResponse.json({
        error: 'Release ID is required'
      }, { status: 400 })
    }

    // Fetch release details
    const { data: release, error: releaseError } = await supabase
      .from('music_releases')
      .select(`
        *,
        artist_profiles!music_releases_user_id_fkey (
          stage_name
        )
      `)
      .eq('id', releaseId)
      .single()

    if (releaseError || !release) {
      return NextResponse.json({
        error: 'Release not found',
        details: releaseError?.message
      }, { status: 404 })
    }

    // Fetch tracks for this release
    const { data: tracks, error: tracksError } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('release_id', releaseId)

    if (tracksError) {
      return NextResponse.json({
        error: 'Failed to fetch tracks',
        details: tracksError.message
      }, { status: 500 })
    }

    const verificationResults = []
    const artistName = release.artist_profiles?.stage_name || 'Unknown Artist'

    // Verify GTIN (UPC/EAN) if present
    if (release.upc || release.ean) {
      const gtin = release.upc || release.ean
      const gtinResult = await verifyGTIN(gtin, release.release_title, artistName)

      const { data: verificationRecord } = await supabase
        .from('verification_results')
        .insert({
          release_id: releaseId,
          verification_type: 'gtin',
          verified: gtinResult.verified,
          confidence_score: gtinResult.confidenceScore,
          verification_data: gtinResult.verificationData,
          error_message: gtinResult.errorMessage,
          warning_message: gtinResult.warningMessage,
          api_provider: 'musicbrainz',
          api_response_time_ms: Date.now() - startTime
        })
        .select()
        .single()

      verificationResults.push({
        type: 'gtin',
        ...gtinResult,
        recordId: verificationRecord?.id
      })
    }

    // Verify each track's ISRC
    if (tracks && tracks.length > 0) {
      for (const track of tracks) {
        if (track.isrc) {
          const isrcStartTime = Date.now()
          const isrcResult = await verifyISRC(
            track.isrc,
            track.track_title,
            artistName
          )

          const { data: verificationRecord } = await supabase
            .from('verification_results')
            .insert({
              release_id: releaseId,
              track_id: track.id,
              verification_type: 'isrc',
              verified: isrcResult.verified,
              confidence_score: isrcResult.confidenceScore,
              verification_data: isrcResult.verificationData,
              error_message: isrcResult.errorMessage,
              warning_message: isrcResult.warningMessage,
              api_provider: 'musicbrainz',
              api_response_time_ms: Date.now() - isrcStartTime
            })
            .select()
            .single()

          verificationResults.push({
            type: 'isrc',
            trackId: track.id,
            trackTitle: track.track_title,
            ...isrcResult,
            recordId: verificationRecord?.id
          })
        }
      }
    }

    // Calculate overall verification status
    const allVerified = verificationResults.every(r => r.verified)
    const avgConfidence = verificationResults.length > 0
      ? verificationResults.reduce((sum, r) => sum + r.confidenceScore, 0) / verificationResults.length
      : 0

    // Determine if release should be auto-approved
    const shouldAutoApprove = allVerified && avgConfidence >= 0.8

    return NextResponse.json({
      success: true,
      releaseId,
      verificationResults,
      summary: {
        totalChecks: verificationResults.length,
        passedChecks: verificationResults.filter(r => r.verified).length,
        averageConfidence: avgConfidence,
        shouldAutoApprove,
        processingTimeMs: Date.now() - startTime
      }
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Fetch verification results for a release
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const releaseId = searchParams.get('releaseId')

    if (!releaseId) {
      return NextResponse.json({
        error: 'Release ID is required'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('verification_results')
      .select('*')
      .eq('release_id', releaseId)
      .order('verified_at', { ascending: false })

    if (error) {
      console.error('Error fetching verification results:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
