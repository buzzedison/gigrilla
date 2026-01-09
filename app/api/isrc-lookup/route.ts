import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// MusicBrainz API base URL
const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2'
const APP_NAME = 'Gigrilla'
const APP_VERSION = '1.0.0'
const APP_CONTACT = 'support@gigrilla.com'

// Cache expiration time (in days)
const CACHE_EXPIRATION_DAYS = 30

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

interface MusicBrainzRecording {
  id: string
  title: string
  'artist-credit'?: Array<{
    name: string
    artist: {
      name: string
      id: string
    }
  }>
  length?: number // duration in milliseconds
  isrcs?: string[]
  'first-release-date'?: string
}

interface ISRCLookupResponse {
  success: boolean
  data?: {
    trackTitle: string
    artistName: string
    durationSeconds?: number
    recordingDate?: string
    isrc: string
    musicBrainzId?: string
    countryCode?: string
    registrantCode?: string
    yearCode?: string
    designationCode?: string
  }
  error?: string
  source?: string
}

// Validate ISRC format: CC-XXX-YY-NNNNN (12 characters without hyphens)
function validateISRCFormat(isrc: string): boolean {
  const cleanISRC = isrc.replace(/-/g, '').toUpperCase()
  if (cleanISRC.length !== 12) return false

  // Format: 2 letters, 3 alphanumeric, 2 digits, 5 digits
  const regex = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/
  return regex.test(cleanISRC)
}

// Parse ISRC components
function parseISRC(isrc: string) {
  const cleanISRC = isrc.replace(/-/g, '').toUpperCase()
  return {
    countryCode: cleanISRC.substring(0, 2),
    registrantCode: cleanISRC.substring(2, 5),
    yearCode: cleanISRC.substring(5, 7),
    designationCode: cleanISRC.substring(7, 12)
  }
}

// Rate limiting helper
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitStore.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 60000 })
    return true
  }

  if (limit.count >= 10) {
    return false
  }

  limit.count++
  return true
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  let userId: string | null = null

  try {
    const supabase = await createSupabaseClient()

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id || null

    // Get client info
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again in a minute.' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isrc = searchParams.get('isrc')?.trim()

    if (!isrc) {
      return NextResponse.json(
        { success: false, error: 'ISRC parameter is required' },
        { status: 400 }
      )
    }

    // Validate ISRC format
    const cleanISRC = isrc.replace(/-/g, '').toUpperCase()

    if (!validateISRCFormat(cleanISRC)) {
      await logAnalytics(supabase, {
        isrc: cleanISRC,
        success: false,
        cacheHit: false,
        errorMessage: 'Invalid ISRC format',
        userId,
        ipAddress: ip,
        responseTimeMs: Date.now() - startTime
      })

      return NextResponse.json(
        { success: false, error: 'Invalid ISRC format. Expected: CC-XXX-YY-NNNNN (12 characters)' },
        { status: 400 }
      )
    }

    // Check cache first
    const cachedResult = await checkCache(supabase, cleanISRC)

    if (cachedResult) {
      await updateCacheStats(supabase, cleanISRC)
      await logAnalytics(supabase, {
        isrc: cleanISRC,
        success: true,
        cacheHit: true,
        userId,
        ipAddress: ip,
        responseTimeMs: Date.now() - startTime
      })

      return NextResponse.json({
        success: true,
        data: cachedResult,
        source: 'cache'
      })
    }

    // Query MusicBrainz for the ISRC
    const musicBrainzUrl = `${MUSICBRAINZ_API}/recording?query=isrc:${cleanISRC}&fmt=json`

    const response = await fetch(musicBrainzUrl, {
      headers: {
        'User-Agent': `${APP_NAME}/${APP_VERSION} ( ${APP_CONTACT} )`
      }
    })

    if (!response.ok) {
      console.error('MusicBrainz API error:', response.status, response.statusText)
      return NextResponse.json(
        { success: false, error: 'Failed to query MusicBrainz database' },
        { status: 500 }
      )
    }

    const data = await response.json()

    if (!data.recordings || data.recordings.length === 0) {
      await logAnalytics(supabase, {
        isrc: cleanISRC,
        success: false,
        cacheHit: false,
        errorMessage: 'ISRC not found',
        userId,
        ipAddress: ip,
        responseTimeMs: Date.now() - startTime
      })

      return NextResponse.json({
        success: false,
        error: 'No recording found for this ISRC. The recording may not be registered yet, or you can enter details manually.',
        source: 'musicbrainz'
      })
    }

    const recording: MusicBrainzRecording = data.recordings[0]
    const artistName = recording['artist-credit']?.[0]?.name ||
                       recording['artist-credit']?.[0]?.artist?.name ||
                       'Unknown Artist'

    const isrcComponents = parseISRC(cleanISRC)

    const recordingData = {
      trackTitle: recording.title,
      artistName,
      durationSeconds: recording.length ? Math.round(recording.length / 1000) : undefined,
      recordingDate: recording['first-release-date'],
      isrc: cleanISRC,
      musicBrainzId: recording.id,
      ...isrcComponents
    }

    // Store in cache
    await storeInCache(supabase, cleanISRC, recordingData)

    // Log analytics
    await logAnalytics(supabase, {
      isrc: cleanISRC,
      success: true,
      cacheHit: false,
      userId,
      ipAddress: ip,
      responseTimeMs: Date.now() - startTime
    })

    const lookupResponse: ISRCLookupResponse = {
      success: true,
      data: recordingData,
      source: 'musicbrainz'
    }

    return NextResponse.json(lookupResponse)

  } catch (error) {
    console.error('ISRC lookup error:', error)

    try {
      const supabase = await createSupabaseClient()
      const { searchParams } = new URL(request.url)
      const isrc = searchParams.get('isrc')?.trim()
      const cleanISRC = isrc?.replace(/-/g, '').toUpperCase() || ''
      const ip = request.headers.get('x-forwarded-for') || 'unknown'

      await logAnalytics(supabase, {
        isrc: cleanISRC,
        success: false,
        cacheHit: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ipAddress: ip,
        responseTimeMs: Date.now() - startTime
      })
    } catch (analyticsError) {
      console.error('Error logging analytics:', analyticsError)
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during ISRC lookup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Cache helper functions

async function checkCache(supabase: ReturnType<typeof createServerClient>, isrc: string) {
  try {
    const { data, error } = await supabase
      .from('isrc_cache')
      .select('*')
      .eq('isrc', isrc)
      .eq('is_valid', true)
      .single()

    if (error || !data) {
      return null
    }

    const lastVerified = new Date(data.last_verified_at)
    const daysSinceVerification = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceVerification > CACHE_EXPIRATION_DAYS) {
      return null
    }

    return {
      trackTitle: data.track_title,
      artistName: data.artist_name,
      durationSeconds: data.duration_seconds,
      recordingDate: data.recording_date,
      isrc: data.isrc,
      countryCode: data.country_code,
      registrantCode: data.registrant_code,
      yearCode: data.year_code,
      designationCode: data.designation_code
    }
  } catch (error) {
    console.error('Cache check error:', error)
    return null
  }
}

async function updateCacheStats(supabase: ReturnType<typeof createServerClient>, isrc: string) {
  try {
    await supabase
      .from('isrc_cache')
      .update({
        lookup_count: supabase.raw('lookup_count + 1'),
        last_lookup_at: new Date().toISOString()
      })
      .eq('isrc', isrc)
  } catch (error) {
    console.error('Error updating cache stats:', error)
  }
}

async function storeInCache(supabase: ReturnType<typeof createServerClient>, isrc: string, data: NonNullable<ISRCLookupResponse['data']>) {
  try {
    await supabase
      .from('isrc_cache')
      .upsert({
        isrc,
        track_title: data.trackTitle,
        artist_name: data.artistName,
        duration_seconds: data.durationSeconds,
        recording_date: data.recordingDate,
        country_code: data.countryCode,
        registrant_code: data.registrantCode,
        year_code: data.yearCode,
        designation_code: data.designationCode,
        source: 'musicbrainz',
        is_valid: true,
        last_verified_at: new Date().toISOString(),
        lookup_count: 1,
        last_lookup_at: new Date().toISOString()
      }, {
        onConflict: 'isrc'
      })
  } catch (error) {
    console.error('Error storing in cache:', error)
  }
}

async function logAnalytics(supabase: ReturnType<typeof createServerClient>, data: {
  isrc: string
  success: boolean
  cacheHit: boolean
  errorMessage?: string
  userId: string | null
  ipAddress: string
  responseTimeMs: number
  trackId?: string
}) {
  try {
    await supabase
      .from('isrc_lookup_analytics')
      .insert({
        isrc: data.isrc,
        lookup_successful: data.success,
        cache_hit: data.cacheHit,
        error_message: data.errorMessage || null,
        user_id: data.userId,
        track_id: data.trackId || null,
        ip_address: data.ipAddress,
        response_time_ms: data.responseTimeMs,
        looked_up_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging analytics:', error)
  }
}
