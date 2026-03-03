import { NextRequest, NextResponse } from 'next/server'

// Full set of address-component fields Geoapify may return.
// UK-specific notes:
//   city         – major city (London, Birmingham…); often blank for towns/villages
//   town         – market/postal town (Fakenham, Swaffham…)
//   village      – village name when applicable
//   municipality – administrative municipality (sometimes used instead of city/town)
//   county       – LOCAL government district / unitary authority (North Norfolk District Council)
//   state_district – CEREMONIAL / traditional county (Norfolk, Suffolk, Yorkshire…)
//   state        – constituent country (England, Scotland, Wales, Northern Ireland)
//   country      – sovereign state name (United Kingdom)
//   country_code – ISO 3166-1 alpha-2 (gb)
type GeoapifyFeatureProperties = {
  formatted?: string
  name?: string
  housenumber?: string
  street?: string
  postcode?: string
  city?: string
  town?: string
  village?: string
  hamlet?: string
  municipality?: string
  county?: string
  state_district?: string
  state?: string
  region?: string
  country?: string
  country_code?: string
  lat?: number
  lon?: number
  result_type?: string
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

function isLikelyUkQuery(query: string) {
  const normalized = query.trim()
  if (!normalized) return false

  const lower = normalized.toLowerCase()
  if (/\b(uk|united kingdom|england|scotland|wales|northern ireland)\b/.test(lower)) {
    return true
  }

  // UK postcode patterns (e.g. NR21 7QH, SW1A 1AA, W1A 0AX)
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(normalized)
}

async function fetchGeoapifyEntries(query: string, forceUkFilter: boolean, signal: AbortSignal) {
  const apiUrl = new URL('https://api.geoapify.com/v1/geocode/autocomplete')
  apiUrl.searchParams.set('text', query)
  apiUrl.searchParams.set('limit', '8')
  // GeoJSON format gives us richer properties (including town, village, state_district)
  apiUrl.searchParams.set('format', 'geojson')
  apiUrl.searchParams.set('lang', 'en')
  apiUrl.searchParams.set('apiKey', GEOAPIFY_API_KEY as string)

  if (forceUkFilter) {
    apiUrl.searchParams.set('filter', 'countrycode:gb')
    apiUrl.searchParams.set('bias', 'countrycode:gb')
  }

  const response = await fetch(apiUrl.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'gigrilla-app/location-search'
    },
    cache: 'no-store',
    signal
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('Geoapify autocomplete error', response.status, body)
    return {
      error: NextResponse.json(
        { error: 'Unable to fetch location suggestions.' },
        { status: 502 }
      )
    }
  }

  const data = (await response.json()) as GeoapifyResponse
  const entries = (data.features ?? data.results ?? []).filter(Boolean)
  return { entries }
}

/**
 * Resolve the best "city / town" label from a Geoapify properties object.
 *
 * Priority (most → least specific):
 *   city > town > village > hamlet > municipality > (empty string)
 *
 * We deliberately skip `county` because Geoapify populates that field with
 * local-government district names (e.g. "North Norfolk District Council"),
 * NOT the traditional county name.
 */
function resolveCity(p: GeoapifyFeatureProperties): string {
  return (
    p.city?.trim() ||
    p.town?.trim() ||
    p.village?.trim() ||
    p.hamlet?.trim() ||
    p.municipality?.trim() ||
    ''
  )
}

/**
 * Resolve the best "county / state" label.
 *
 * For UK addresses:
 *   state_district = ceremonial / traditional county  (Norfolk, Suffolk, Kent…)
 *   county         = local-government district         (North Norfolk, Broadland…) ← we avoid this
 *   state          = constituent country               (England, Scotland, Wales…)
 *
 * We prefer state_district over county because it maps to the traditional county
 * that users actually recognise.  We fall back to state only when neither exists.
 */
function resolveCounty(p: GeoapifyFeatureProperties): string {
  return (
    p.state_district?.trim() ||
    p.county?.trim() ||       // last-resort only – this is often the district council name
    p.state?.trim() ||
    p.region?.trim() ||
    ''
  )
}

/**
 * Resolve the country display string.
 *
 * For UK addresses we want to show both the constituent country AND the
 * sovereign state, e.g. "England, UK".  Geoapify gives us:
 *   state        = "England"
 *   country      = "United Kingdom"
 *   country_code = "gb"
 *
 * For all other countries we just return the country name.
 */
function resolveCountry(p: GeoapifyFeatureProperties): string {
  const cc = p.country_code?.toLowerCase()
  const nation = p.country?.trim() || ''

  if (cc === 'gb' && p.state?.trim()) {
    // e.g.  "England, UK"  /  "Scotland, UK"  /  "Wales, UK"
    return `${p.state.trim()}, UK`
  }

  return nation
}

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
  const likelyUkQuery = isLikelyUkQuery(query)

  try {
    const primaryResult = await fetchGeoapifyEntries(query, likelyUkQuery, controller.signal)
    if (primaryResult.error) {
      return primaryResult.error
    }

    let entries = primaryResult.entries

    // If a UK-targeted query yields no entries, fall back to global search.
    if (likelyUkQuery && entries.length === 0) {
      const fallbackResult = await fetchGeoapifyEntries(query, false, controller.signal)
      if (fallbackResult.error) {
        return fallbackResult.error
      }
      entries = fallbackResult.entries
    }

    const suggestions = entries
      .map(feature => {
        const props: GeoapifyFeatureProperties = feature.properties ?? feature

        const city    = resolveCity(props)
        const county  = resolveCounty(props)
        const country = resolveCountry(props)
        const lat = typeof props.lat === 'number' ? props.lat : undefined
        const lon = typeof props.lon === 'number' ? props.lon : undefined

        // Build a clean human-readable display string:
        //   "Fakenham, Norfolk, England, UK"
        // We include county only when it differs from city (avoids "London, London, England, UK")
        const displayParts = [city]
        if (county && county.toLowerCase() !== city.toLowerCase()) {
          displayParts.push(county)
        }
        if (country) {
          displayParts.push(country)
        }
        const displayString = displayParts.filter(Boolean).join(', ')

        const formatted =
          props.formatted?.trim() ||
          displayString ||
          [city, county, country].filter(Boolean).join(', ')

        if (!formatted && !city && !county && !country) {
          return null
        }

        return {
          id:
            `${formatted}-${lat ?? ''}-${lon ?? ''}`
              .replace(/\s+/g, '-')
              .toLowerCase() || crypto.randomUUID(),
          // `formatted`  = the full address string shown in the dropdown (Geoapify's own string)
          // `city`       = town / city for display
          // `state`      = traditional county  (Norfolk, Yorkshire…) – reusing the `state` field
          //                on the LocationSuggestion type for the county slot
          // `country`    = "England, UK" / "Scotland, UK" etc.
          formatted,
          city,
          state: county,   // named `state` to match the existing LocationSuggestion interface
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
