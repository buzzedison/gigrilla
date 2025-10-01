import { NextRequest, NextResponse } from 'next/server'

type GeoapifyFeatureProperties = {
  formatted?: string
  city?: string
  county?: string
  state?: string
  region?: string
  country?: string
  country_code?: string
  lat?: number
  lon?: number
}

type GeoapifyFeature = {
  properties?: GeoapifyFeatureProperties
} & GeoapifyFeatureProperties

interface GeoapifyResponse {
  features?: GeoapifyFeature[]
  results?: GeoapifyFeature[]
  error?: string
}

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim()

  if (!query) {
    return NextResponse.json({ suggestions: [] })
  }

  if (!GEOAPIFY_API_KEY) {
    return NextResponse.json(
      { error: 'Location search is not configured.' },
      { status: 500 }
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const apiUrl = new URL('https://api.geoapify.com/v1/geocode/autocomplete')
    apiUrl.searchParams.set('text', query)
    apiUrl.searchParams.set('limit', '8')
    apiUrl.searchParams.set('format', 'json')
    apiUrl.searchParams.set('apiKey', GEOAPIFY_API_KEY)

    const response = await fetch(apiUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'gigrilla-app/location-search'
      },
      cache: 'no-store',
      signal: controller.signal
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('Geoapify autocomplete error', response.status, body)
      return NextResponse.json(
        { error: 'Unable to fetch location suggestions.' },
        { status: 502 }
      )
    }

    const data = (await response.json()) as GeoapifyResponse

    const entries = (data.features ?? data.results ?? []).filter(Boolean)

    const suggestions = entries
      .map(feature => {
        const props = feature.properties ?? feature
        const formatted = props.formatted?.trim()
        const city = props.city ?? props.county ?? ''
        const state = props.state ?? props.region ?? ''
        const country = props.country ?? ''
        const lat = typeof props.lat === 'number' ? props.lat : undefined
        const lon = typeof props.lon === 'number' ? props.lon : undefined

        if (!formatted && !city && !state && !country) {
          return null
        }

        return {
          id: `${formatted ?? ''}-${lat ?? ''}-${lon ?? ''}`.replace(/\s+/g, '-').toLowerCase() || crypto.randomUUID(),
          formatted: formatted || [city, state, country].filter(Boolean).join(', '),
          city,
          state,
          country,
          lat,
          lon
        }
      })
      .filter(Boolean)

    return NextResponse.json({ suggestions })
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return NextResponse.json(
        { error: 'Location suggestion request timed out.' },
        { status: 504 }
      )
    }

    console.error('Location search error', error)
    return NextResponse.json(
      { error: 'Unexpected error fetching location suggestions.' },
      { status: 500 }
    )
  } finally {
    clearTimeout(timeout)
  }
}

