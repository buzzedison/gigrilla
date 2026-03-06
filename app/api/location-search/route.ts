import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

// UK detection heuristics
const UK_POSTCODE_FULL_REGEX = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i
const UK_POSTCODE_OUTWARD_REGEX = /\b[A-Z]{1,2}\d[A-Z\d]?\b/i

function isLikelyUkQuery(query: string): boolean {
  const lower = query.toLowerCase()
  if (/\b(uk|united kingdom|england|scotland|wales|northern ireland)\b/.test(lower)) return true
  if (UK_POSTCODE_FULL_REGEX.test(query)) return true
  return UK_POSTCODE_OUTWARD_REGEX.test(query)
}

interface GooglePrediction {
  description: string
  place_id: string
  structured_formatting?: {
    main_text?: string
    secondary_text?: string
  }
}

interface GoogleAutocompleteResponse {
  status: string
  predictions?: GooglePrediction[]
  error_message?: string
}

/**
 * Parse Google's secondary_text into city / county / country display parts.
 * Examples:
 *   "Fakenham, Norfolk, England, UK"          → city=Fakenham, state=Norfolk, country=England, UK
 *   "London, UK"                              → city=London,    state='',      country=UK
 *   "Glasgow, Scotland, UK"                   → city=Glasgow,   state='',      country=Scotland, UK
 *   "New York, NY, USA"                       → city=New York,  state=NY,      country=USA
 */
function parseSecondaryText(secondary: string): { city: string; state: string; country: string } {
  const parts = secondary.split(',').map(p => p.trim()).filter(Boolean)

  if (parts.length === 0) return { city: '', state: '', country: '' }
  if (parts.length === 1) return { city: parts[0], state: '', country: '' }

  const lastPart = parts[parts.length - 1]
  const isUk = /^(uk|united kingdom|great britain)$/i.test(lastPart)

  let countryDisplay = lastPart
  let countyIdx = parts.length - 2

  // For UK, absorb constituent country (England/Scotland/Wales/Northern Ireland) into the country label
  if (isUk && parts.length >= 3) {
    const secondToLast = parts[parts.length - 2]
    if (/^(england|scotland|wales|northern ireland)$/i.test(secondToLast)) {
      countryDisplay = `${secondToLast}, UK`
      countyIdx = parts.length - 3
    }
  }

  const city = parts[0]
  const state = countyIdx > 0 ? parts[countyIdx] : ''

  return { city, state, country: countryDisplay }
}

async function fetchAutocomplete(
  query: string,
  components: string | null,
  signal: AbortSignal
): Promise<{ predictions: GooglePrediction[] } | { error: NextResponse }> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  url.searchParams.set('input', query)
  url.searchParams.set('key', GOOGLE_MAPS_API_KEY!)
  url.searchParams.set('language', 'en')
  if (components) {
    url.searchParams.set('components', components)
  }

  const response = await fetch(url.toString(), {
    signal,
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  })

  if (!response.ok) {
    console.error('Google Places Autocomplete HTTP error', response.status)
    return { error: NextResponse.json({ error: 'Unable to fetch location suggestions.' }, { status: 502 }) }
  }

  const data = (await response.json()) as GoogleAutocompleteResponse

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error('Google Places Autocomplete API error:', data.status, data.error_message)
    return { error: NextResponse.json({ error: 'Location service error.' }, { status: 502 }) }
  }

  return { predictions: data.predictions ?? [] }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim()

  if (!query) {
    return NextResponse.json({ suggestions: [] })
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('GOOGLE_MAPS_API_KEY is not set')
    return NextResponse.json({ error: 'Location search is not configured.' }, { status: 500 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  const likelyUk = isLikelyUkQuery(query)

  try {
    // Bias to GB for UK queries; fall back to global if no results
    const result = await fetchAutocomplete(
      query,
      likelyUk ? 'country:gb' : null,
      controller.signal
    )

    if ('error' in result) return result.error

    let predictions = result.predictions

    if (likelyUk && predictions.length === 0) {
      const fallback = await fetchAutocomplete(query, null, controller.signal)
      if (!('error' in fallback)) {
        predictions = fallback.predictions
      }
    }

    const suggestions = predictions.map(prediction => {
      const secondaryText = prediction.structured_formatting?.secondary_text ?? ''
      const { city, state, country } = parseSecondaryText(secondaryText)

      return {
        id: prediction.place_id,
        formatted: prediction.description,
        placeId: prediction.place_id,
        city,
        state,
        country,
        // lat/lon fetched separately when user selects via /api/location-geocode
        lat: undefined as number | undefined,
        lon: undefined as number | undefined
      }
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return NextResponse.json({ error: 'Location suggestion request timed out.' }, { status: 504 })
    }
    console.error('Location search error', error)
    return NextResponse.json({ error: 'Unexpected error fetching location suggestions.' }, { status: 500 })
  } finally {
    clearTimeout(timeout)
  }
}
