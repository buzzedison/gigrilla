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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()

    // Get user (optional - for admin views)
    await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'gtin' or 'isrc' or 'summary'
    const period = searchParams.get('period') || '30' // days

    if (!type) {
      return NextResponse.json(
        { error: 'Type parameter is required (gtin, isrc, or summary)' },
        { status: 400 }
      )
    }

    const periodDays = parseInt(period, 10)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    switch (type) {
      case 'gtin':
        return await getGTINAnalytics(supabase, startDate)

      case 'isrc':
        return await getISRCAnalytics(supabase, startDate)

      case 'summary':
        return await getSummaryAnalytics(supabase, startDate)

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be gtin, isrc, or summary' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get GTIN analytics
async function getGTINAnalytics(supabase: ReturnType<typeof createServerClient>, startDate: Date) {
  try {
    // Most looked up GTINs
    const { data: topGTINs, error: topError } = await supabase
      .from('gtin_cache')
      .select('gtin, gtin_type, release_title, artist_name, lookup_count')
      .gte('last_lookup_at', startDate.toISOString())
      .order('lookup_count', { ascending: false })
      .limit(20)

    if (topError) throw topError

    // Recent lookups
    const { data: recentLookups, error: recentError } = await supabase
      .from('gtin_lookup_analytics')
      .select('*')
      .gte('looked_up_at', startDate.toISOString())
      .order('looked_up_at', { ascending: false })
      .limit(50)

    if (recentError) throw recentError

    // Success rate
    const { data: successStats, error: statsError } = await supabase
      .from('gtin_lookup_analytics')
      .select('lookup_successful, cache_hit')
      .gte('looked_up_at', startDate.toISOString())

    if (statsError) throw statsError

    const totalLookups = successStats.length
    const successfulLookups = successStats.filter((s: { lookup_successful: boolean }) => s.lookup_successful).length
    const cacheHits = successStats.filter((s: { cache_hit: boolean }) => s.cache_hit).length
    const successRate = totalLookups > 0 ? (successfulLookups / totalLookups) * 100 : 0
    const cacheHitRate = totalLookups > 0 ? (cacheHits / totalLookups) * 100 : 0

    // Average response time
    const { data: responseTimes, error: timeError } = await supabase
      .from('gtin_lookup_analytics')
      .select('response_time_ms')
      .gte('looked_up_at', startDate.toISOString())
      .not('response_time_ms', 'is', null)

    if (timeError) throw timeError

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum: number, r: { response_time_ms: number }) => sum + r.response_time_ms, 0) / responseTimes.length
      : 0

    // Daily lookup trend
    const { data: dailyTrend } = await supabase.rpc(
      'get_daily_gtin_lookups',
      { days: 30 }
    ).catch(() => ({ data: [], error: null })) // Fallback if RPC doesn't exist

    return NextResponse.json({
      success: true,
      data: {
        topGTINs: topGTINs || [],
        recentLookups: recentLookups || [],
        stats: {
          totalLookups,
          successfulLookups,
          cacheHits,
          successRate: Math.round(successRate * 100) / 100,
          cacheHitRate: Math.round(cacheHitRate * 100) / 100,
          avgResponseTimeMs: Math.round(avgResponseTime)
        },
        dailyTrend: dailyTrend || []
      }
    })
  } catch (error) {
    console.error('GTIN analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GTIN analytics' },
      { status: 500 }
    )
  }
}

// Get ISRC analytics
async function getISRCAnalytics(supabase: ReturnType<typeof createServerClient>, startDate: Date) {
  try {
    // Most looked up ISRCs
    const { data: topISRCs, error: topError } = await supabase
      .from('isrc_cache')
      .select('isrc, track_title, artist_name, lookup_count, country_code')
      .gte('last_lookup_at', startDate.toISOString())
      .order('lookup_count', { ascending: false })
      .limit(20)

    if (topError) throw topError

    // Recent lookups
    const { data: recentLookups, error: recentError } = await supabase
      .from('isrc_lookup_analytics')
      .select('*')
      .gte('looked_up_at', startDate.toISOString())
      .order('looked_up_at', { ascending: false })
      .limit(50)

    if (recentError) throw recentError

    // Success rate
    const { data: successStats, error: statsError } = await supabase
      .from('isrc_lookup_analytics')
      .select('lookup_successful, cache_hit')
      .gte('looked_up_at', startDate.toISOString())

    if (statsError) throw statsError

    const totalLookups = successStats.length
    const successfulLookups = successStats.filter((s: { lookup_successful: boolean }) => s.lookup_successful).length
    const cacheHits = successStats.filter((s: { cache_hit: boolean }) => s.cache_hit).length
    const successRate = totalLookups > 0 ? (successfulLookups / totalLookups) * 100 : 0
    const cacheHitRate = totalLookups > 0 ? (cacheHits / totalLookups) * 100 : 0

    // Country distribution
    const { data: countryDist, error: countryError } = await supabase
      .from('isrc_cache')
      .select('country_code')
      .gte('last_lookup_at', startDate.toISOString())

    const countryDistribution: Record<string, number> = {}
    if (!countryError && countryDist) {
      countryDist.forEach((item: { country_code: string | null }) => {
        if (item.country_code) {
          countryDistribution[item.country_code] = (countryDistribution[item.country_code] || 0) + 1
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        topISRCs: topISRCs || [],
        recentLookups: recentLookups || [],
        stats: {
          totalLookups,
          successfulLookups,
          cacheHits,
          successRate: Math.round(successRate * 100) / 100,
          cacheHitRate: Math.round(cacheHitRate * 100) / 100
        },
        countryDistribution
      }
    })
  } catch (error) {
    console.error('ISRC analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ISRC analytics' },
      { status: 500 }
    )
  }
}

// Get summary analytics
async function getSummaryAnalytics(supabase: ReturnType<typeof createServerClient>, startDate: Date) {
  try {
    // GTIN stats
    const { data: gtinStats } = await supabase
      .from('gtin_lookup_analytics')
      .select('lookup_successful, cache_hit, response_time_ms')
      .gte('looked_up_at', startDate.toISOString())

    const gtinTotal = gtinStats?.length || 0
    const gtinSuccessful = gtinStats?.filter((s: { lookup_successful: boolean }) => s.lookup_successful).length || 0
    const gtinCacheHits = gtinStats?.filter((s: { cache_hit: boolean }) => s.cache_hit).length || 0

    // ISRC stats
    const { data: isrcStats } = await supabase
      .from('isrc_lookup_analytics')
      .select('lookup_successful, cache_hit, response_time_ms')
      .gte('looked_up_at', startDate.toISOString())

    const isrcTotal = isrcStats?.length || 0
    const isrcSuccessful = isrcStats?.filter((s: { lookup_successful: boolean }) => s.lookup_successful).length || 0
    const isrcCacheHits = isrcStats?.filter((s: { cache_hit: boolean }) => s.cache_hit).length || 0

    // Cache sizes
    const { count: gtinCacheSize } = await supabase
      .from('gtin_cache')
      .select('*', { count: 'exact', head: true })

    const { count: isrcCacheSize } = await supabase
      .from('isrc_cache')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      data: {
        gtin: {
          totalLookups: gtinTotal,
          successfulLookups: gtinSuccessful,
          cacheHits: gtinCacheHits,
          successRate: gtinTotal > 0 ? Math.round((gtinSuccessful / gtinTotal) * 10000) / 100 : 0,
          cacheHitRate: gtinTotal > 0 ? Math.round((gtinCacheHits / gtinTotal) * 10000) / 100 : 0,
          cacheSize: gtinCacheSize || 0
        },
        isrc: {
          totalLookups: isrcTotal,
          successfulLookups: isrcSuccessful,
          cacheHits: isrcCacheHits,
          successRate: isrcTotal > 0 ? Math.round((isrcSuccessful / isrcTotal) * 10000) / 100 : 0,
          cacheHitRate: isrcTotal > 0 ? Math.round((isrcCacheHits / isrcTotal) * 10000) / 100 : 0,
          cacheSize: isrcCacheSize || 0
        },
        totals: {
          totalLookups: gtinTotal + isrcTotal,
          cacheSize: (gtinCacheSize || 0) + (isrcCacheSize || 0)
        }
      }
    })
  } catch (error) {
    console.error('Summary analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary analytics' },
      { status: 500 }
    )
  }
}
