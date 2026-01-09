import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// MusicBrainz API base URL
const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2'
const APP_NAME = 'Gigrilla'
const APP_VERSION = '1.0.0'
const APP_CONTACT = 'support@gigrilla.com' // Update with your actual contact

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
            // Ignore - called from Server Component
          }
        },
      },
    }
  )
}

interface MusicBrainzRelease {
  id: string
  title: string
  'artist-credit'?: Array<{
    name: string
    artist: {
      name: string
      id: string
    }
  }>
  date?: string
  country?: string
  barcode?: string
  'release-group'?: {
    'primary-type'?: string
  }
  'track-count'?: number
}

interface GTINLookupResponse {
  success: boolean
  data?: {
    releaseTitle: string
    artistName: string
    releaseDate?: string
    country?: string
    barcode: string
    releaseType?: string
    trackCount?: number
    musicBrainzId?: string
  }
  error?: string
  source?: string
}

// Validate GTIN checksum using GS1 algorithm
function validateGTINChecksum(gtin: string): boolean {
  const digits = gtin.split('').map(Number)
  const checkDigit = digits.pop()!

  let sum = 0
  digits.reverse().forEach((digit, index) => {
    sum += digit * (index % 2 === 0 ? 3 : 1)
  })

  const calculatedCheck = (10 - (sum % 10)) % 10
  return calculatedCheck === checkDigit
}

// Rate limiting helper (simple in-memory store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitStore.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 60000 }) // Reset after 1 minute
    return true
  }

  if (limit.count >= 10) { // Max 10 requests per minute
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

    // Get user if authenticated (optional for analytics)
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id || null

    // Get client IP for rate limiting and analytics
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again in a minute.' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const gtin = searchParams.get('gtin')?.trim()

    if (!gtin) {
      return NextResponse.json(
        { success: false, error: 'GTIN parameter is required' },
        { status: 400 }
      )
    }

    // Validate GTIN format
    const cleanGTIN = gtin.replace(/\D/g, '')
    if (cleanGTIN.length !== 12 && cleanGTIN.length !== 13) {
      await logAnalytics(supabase, {
        gtin: cleanGTIN,
        gtinType: cleanGTIN.length === 12 ? 'upc' : 'ean',
        success: false,
        cacheHit: false,
        errorMessage: 'Invalid GTIN length',
        userId,
        ipAddress: ip,
        userAgent,
        responseTimeMs: Date.now() - startTime
      })

      return NextResponse.json(
        { success: false, error: 'GTIN must be 12 digits (UPC) or 13 digits (EAN)' },
        { status: 400 }
      )
    }

    // Validate checksum
    if (!validateGTINChecksum(cleanGTIN)) {
      await logAnalytics(supabase, {
        gtin: cleanGTIN,
        gtinType: cleanGTIN.length === 12 ? 'upc' : 'ean',
        success: false,
        cacheHit: false,
        errorMessage: 'Invalid checksum',
        userId,
        ipAddress: ip,
        userAgent,
        responseTimeMs: Date.now() - startTime
      })

      return NextResponse.json(
        { success: false, error: 'Invalid GTIN checksum. Please verify the code.' },
        { status: 400 }
      )
    }

    const gtinType = cleanGTIN.length === 12 ? 'upc' : 'ean'

    // Check cache first
    const cachedResult = await checkCache(supabase, cleanGTIN)

    if (cachedResult) {
      // Update cache stats
      await updateCacheStats(supabase, cleanGTIN)

      // Log analytics
      await logAnalytics(supabase, {
        gtin: cleanGTIN,
        gtinType,
        success: true,
        cacheHit: true,
        userId,
        ipAddress: ip,
        userAgent,
        responseTimeMs: Date.now() - startTime
      })

      return NextResponse.json({
        success: true,
        data: cachedResult,
        source: 'cache'
      })
    }

    // Query MusicBrainz for the barcode
    const musicBrainzUrl = `${MUSICBRAINZ_API}/release?query=barcode:${cleanGTIN}&fmt=json`

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

    // Check if any releases were found
    if (!data.releases || data.releases.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No release found for this GTIN. The release may not be registered yet, or you can enter details manually.',
        source: 'musicbrainz'
      })
    }

    // Get the first (most relevant) release
    const release: MusicBrainzRelease = data.releases[0]

    // Extract artist name
    const artistName = release['artist-credit']?.[0]?.name ||
                       release['artist-credit']?.[0]?.artist?.name ||
                       'Unknown Artist'

    // Map release type
    let releaseType: string | undefined
    const primaryType = release['release-group']?.['primary-type']?.toLowerCase()
    if (primaryType === 'single') releaseType = 'single'
    else if (primaryType === 'ep') releaseType = 'ep'
    else if (primaryType === 'album') releaseType = 'album'

    const releaseData = {
      releaseTitle: release.title,
      artistName,
      releaseDate: release.date,
      country: release.country,
      barcode: cleanGTIN,
      releaseType,
      trackCount: release['track-count'],
      musicBrainzId: release.id
    }

    // Store in cache
    await storeInCache(supabase, cleanGTIN, gtinType, releaseData)

    // Log analytics
    await logAnalytics(supabase, {
      gtin: cleanGTIN,
      gtinType,
      success: true,
      cacheHit: false,
      userId,
      ipAddress: ip,
      userAgent,
      responseTimeMs: Date.now() - startTime
    })

    const lookupResponse: GTINLookupResponse = {
      success: true,
      data: releaseData,
      source: 'musicbrainz'
    }

    return NextResponse.json(lookupResponse)

  } catch (error) {
    console.error('GTIN lookup error:', error)

    // Log error in analytics
    try {
      const supabase = await createSupabaseClient()
      const { searchParams } = new URL(request.url)
      const gtin = searchParams.get('gtin')?.trim()
      const cleanGTIN = gtin?.replace(/\D/g, '') || ''
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'

      await logAnalytics(supabase, {
        gtin: cleanGTIN,
        gtinType: cleanGTIN.length === 12 ? 'upc' : 'ean',
        success: false,
        cacheHit: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ipAddress: ip,
        userAgent,
        responseTimeMs: Date.now() - startTime
      })
    } catch (analyticsError) {
      console.error('Error logging analytics:', analyticsError)
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during GTIN lookup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions for cache and analytics

async function checkCache(supabase: ReturnType<typeof createServerClient>, gtin: string) {
  try {
    const { data, error } = await supabase
      .from('gtin_cache')
      .select('*')
      .eq('gtin', gtin)
      .eq('is_valid', true)
      .single()

    if (error || !data) {
      return null
    }

    // Check if cache is still fresh (within CACHE_EXPIRATION_DAYS)
    const lastVerified = new Date(data.last_verified_at)
    const daysSinceVerification = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceVerification > CACHE_EXPIRATION_DAYS) {
      return null // Cache expired
    }

    return {
      releaseTitle: data.release_title,
      artistName: data.artist_name,
      releaseDate: data.release_date,
      country: data.country,
      barcode: data.gtin,
      releaseType: data.release_type,
      trackCount: data.track_count,
      musicBrainzId: data.musicbrainz_id
    }
  } catch (error) {
    console.error('Cache check error:', error)
    return null
  }
}

async function updateCacheStats(supabase: ReturnType<typeof createServerClient>, gtin: string) {
  try {
    await supabase
      .from('gtin_cache')
      .update({
        lookup_count: supabase.raw('lookup_count + 1'),
        last_lookup_at: new Date().toISOString()
      })
      .eq('gtin', gtin)
  } catch (error) {
    console.error('Error updating cache stats:', error)
  }
}

async function storeInCache(supabase: ReturnType<typeof createServerClient>, gtin: string, gtinType: string, data: NonNullable<GTINLookupResponse['data']>) {
  try {
    await supabase
      .from('gtin_cache')
      .upsert({
        gtin,
        gtin_type: gtinType,
        release_title: data.releaseTitle,
        artist_name: data.artistName,
        release_date: data.releaseDate,
        country: data.country,
        release_type: data.releaseType,
        track_count: data.trackCount,
        musicbrainz_id: data.musicBrainzId,
        source: 'musicbrainz',
        is_valid: true,
        last_verified_at: new Date().toISOString(),
        lookup_count: 1,
        last_lookup_at: new Date().toISOString()
      }, {
        onConflict: 'gtin'
      })
  } catch (error) {
    console.error('Error storing in cache:', error)
  }
}

async function logAnalytics(supabase: ReturnType<typeof createServerClient>, data: {
  gtin: string
  gtinType: string
  success: boolean
  cacheHit: boolean
  errorMessage?: string
  userId: string | null
  ipAddress: string
  userAgent: string
  responseTimeMs: number
}) {
  try {
    await supabase
      .from('gtin_lookup_analytics')
      .insert({
        gtin: data.gtin,
        gtin_type: data.gtinType,
        lookup_successful: data.success,
        cache_hit: data.cacheHit,
        error_message: data.errorMessage || null,
        user_id: data.userId,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        response_time_ms: data.responseTimeMs,
        looked_up_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging analytics:', error)
  }
}
