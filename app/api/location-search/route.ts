import { NextRequest, NextResponse } from 'next/server'

// Full set of address-component fields Geoapify may return.
// UK-specific notes:
//   city         – major city (London, Birmingham…); often blank for towns/villages
//   town         – market/postal town (Fakenham, Swaffham…)
//   village      – village name when applicable
//   municipality – administrative municipality (sometimes used instead of city/town)
//   county/state_district – provider-dependent administrative levels.
//                            In UK records these can be swapped depending on source quality.
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

const UK_NATION_NAMES = new Set([
  'england',
  'scotland',
  'wales',
  'northern ireland'
])

const COUNTRY_TAIL_NAMES = new Set([
  'uk',
  'united kingdom',
  'great britain',
  'usa',
  'u.s.a.',
  'united states',
  'united states of america'
])

const UK_POSTCODE_FULL_REGEX = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i
const UK_POSTCODE_OUTWARD_REGEX = /\b[A-Z]{1,2}\d[A-Z\d]?\b/i
const POSTCODE_ONLY_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

const STREETISH_REGEX = /\b(street|st|road|rd|avenue|ave|close|lane|ln|drive|dr|court|crescent|cres|way|place|pl|flat|unit|apartment|apt)\b/i
const ADMIN_DISTRICT_REGEX = /\b(district|borough|council|unitary|metropolitan|parish)\b/i
const POSTCODE_LOOKS_LIKE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

function isLikelyUkQuery(query: string) {
  const normalized = query.trim()
  if (!normalized) return false

  const lower = normalized.toLowerCase()
  if (/\b(uk|united kingdom|england|scotland|wales|northern ireland)\b/.test(lower)) {
    return true
  }

  // Match UK postcode fragments anywhere in the string so full-address queries like
  // "30 Stevenson Close NR21 7QH" are correctly biased to GB.
  if (UK_POSTCODE_FULL_REGEX.test(normalized)) {
    return true
  }

  // Also support outward-code typing (e.g. "NR21") during incremental input.
  return UK_POSTCODE_OUTWARD_REGEX.test(normalized)
}

type GeoapifyMode = 'autocomplete' | 'search'

async function fetchGeoapifyEntries(
  query: string,
  forceUkFilter: boolean,
  mode: GeoapifyMode,
  signal: AbortSignal
) {
  const apiUrl = new URL(
    mode === 'search'
      ? 'https://api.geoapify.com/v1/geocode/search'
      : 'https://api.geoapify.com/v1/geocode/autocomplete'
  )
  apiUrl.searchParams.set('text', query)
  apiUrl.searchParams.set('limit', '8')
  // GeoJSON format gives us richer properties (including town, village, state_district)
  apiUrl.searchParams.set('format', 'geojson')
  apiUrl.searchParams.set('lang', 'en')
  apiUrl.searchParams.set('apiKey', GEOAPIFY_API_KEY as string)

  if (forceUkFilter) {
    apiUrl.searchParams.set('filter', 'countrycode:gb')
    if (mode === 'autocomplete') {
      apiUrl.searchParams.set('bias', 'countrycode:gb')
    }
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
    console.error(`Geoapify ${mode} error`, response.status, body)
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

function normalizeLocationToken(value?: string | null) {
  return value?.trim().replace(/\s+/g, ' ') || ''
}

function isLikelyAdministrativeDistrict(value: string) {
  return ADMIN_DISTRICT_REGEX.test(value.toLowerCase())
}

function isLikelyStreetToken(value: string) {
  const normalized = value.toLowerCase()
  return /\d/.test(normalized) || STREETISH_REGEX.test(normalized)
}

function isCountryTailToken(value: string) {
  const normalized = value.toLowerCase()
  return COUNTRY_TAIL_NAMES.has(normalized) || UK_NATION_NAMES.has(normalized)
}

function parseCityFromFormatted(formatted: string, countryCode?: string) {
  const parts = formatted
    .split(',')
    .map((part) => normalizeLocationToken(part))
    .filter(Boolean)

  if (parts.length === 0) return ''

  if (countryCode?.toLowerCase() === 'gb') {
    while (parts.length > 0 && isCountryTailToken(parts[parts.length - 1])) {
      parts.pop()
    }
  }

  while (parts.length > 1 && isLikelyStreetToken(parts[0])) {
    parts.shift()
  }

  const candidate = parts[0] || ''
  if (!candidate || POSTCODE_LOOKS_LIKE_REGEX.test(candidate)) return ''
  return candidate
}

function pickPrimaryCityToken(p: GeoapifyFeatureProperties) {
  const candidates = [
    normalizeLocationToken(p.city),
    normalizeLocationToken(p.town),
    normalizeLocationToken(p.village),
    normalizeLocationToken(p.hamlet),
    normalizeLocationToken(p.municipality),
    normalizeLocationToken(p.name)
  ].filter(Boolean)

  const token = candidates.find((candidate) => !POSTCODE_LOOKS_LIKE_REGEX.test(candidate))
  if (token) return token

  if (p.formatted) {
    return parseCityFromFormatted(p.formatted, p.country_code)
  }

  return ''
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
  return pickPrimaryCityToken(p)
}

/**
 * Resolve the best "county / state" label.
 *
 * For UK addresses, Geoapify `county` and `state_district` are not consistently
 * mapped across all data sources. We therefore prefer whichever field appears to
 * be county-like (and not a district/council label), then fall back safely.
 */
function resolveCounty(p: GeoapifyFeatureProperties): string {
  const county = normalizeLocationToken(p.county)
  const stateDistrict = normalizeLocationToken(p.state_district)
  const state = normalizeLocationToken(p.state)
  const region = normalizeLocationToken(p.region)
  const countryCode = p.country_code?.toLowerCase()

  if (countryCode === 'gb') {
    const countyLooksDistrict = county ? isLikelyAdministrativeDistrict(county) : false
    const stateDistrictLooksDistrict = stateDistrict ? isLikelyAdministrativeDistrict(stateDistrict) : false

    if (county && !countyLooksDistrict) return county
    if (stateDistrict && !stateDistrictLooksDistrict) return stateDistrict
    if (county) return county
    if (stateDistrict) return stateDistrict
    if (state) return state
    return region
  }

  return stateDistrict || county || state || region || ''
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
    const primaryResult = await fetchGeoapifyEntries(query, likelyUkQuery, 'autocomplete', controller.signal)
    if (primaryResult.error) {
      return primaryResult.error
    }

    let entries = primaryResult.entries

    // If a UK-targeted query yields no entries, fall back to global search.
    if (likelyUkQuery && entries.length === 0) {
      const fallbackResult = await fetchGeoapifyEntries(query, false, 'autocomplete', controller.signal)
      if (fallbackResult.error) {
        return fallbackResult.error
      }
      entries = fallbackResult.entries
    }

    // If autocomplete still has no options (or poor postcode matching), try geocode search.
    if (entries.length === 0 || (likelyUkQuery && POSTCODE_ONLY_REGEX.test(query) && entries.length < 3)) {
      const searchResult = await fetchGeoapifyEntries(query, likelyUkQuery, 'search', controller.signal)
      if (!searchResult.error && searchResult.entries.length > 0) {
        entries = [...entries, ...searchResult.entries]
      }

      if (likelyUkQuery && (!searchResult.error && searchResult.entries.length === 0)) {
        const searchFallback = await fetchGeoapifyEntries(query, false, 'search', controller.signal)
        if (!searchFallback.error && searchFallback.entries.length > 0) {
          entries = [...entries, ...searchFallback.entries]
        }
      }
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
      .filter((suggestion, index, all) => {
        if (!suggestion) return false
        return all.findIndex((candidate) => candidate?.id === suggestion.id) === index
      })

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
