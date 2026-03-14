import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface PlaceDetailsResult {
  formatted_address?: string
  geometry?: {
    location?: {
      lat: number
      lng: number
    }
  }
  address_components?: AddressComponent[]
}

interface PlaceDetailsResponse {
  status: string
  result?: PlaceDetailsResult
  error_message?: string
}

function extractComponent(components: AddressComponent[], type: string): string {
  return components.find(c => c.types.includes(type))?.long_name ?? ''
}

function extractShortComponent(components: AddressComponent[], type: string): string {
  return components.find(c => c.types.includes(type))?.short_name ?? ''
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('placeId')?.trim()

  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required' }, { status: 400 })
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: 'Location service is not configured.' }, { status: 500 })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'formatted_address,geometry,address_components')
  url.searchParams.set('key', GOOGLE_MAPS_API_KEY)
  url.searchParams.set('language', 'en')

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Google Place Details HTTP error', response.status)
      return NextResponse.json({ error: 'Unable to fetch location details.' }, { status: 502 })
    }

    const data = (await response.json()) as PlaceDetailsResponse

    if (data.status !== 'OK') {
      console.error('Google Place Details API error:', data.status, data.error_message)
      return NextResponse.json({ error: 'Location details unavailable.' }, { status: 502 })
    }

    const result = data.result!
    const components = result.address_components ?? []

    // City: prefer locality (town/city), fall back to postal_town (common for UK), then sublocality
    const city =
      extractComponent(components, 'locality') ||
      extractComponent(components, 'postal_town') ||
      extractComponent(components, 'sublocality_level_1') ||
      extractComponent(components, 'sublocality')

    // County: administrative_area_level_2 is county in UK/US
    const adminArea2 = extractComponent(components, 'administrative_area_level_2')
    // administrative_area_level_1 is the constituent country in UK (England/Scotland/Wales)
    const adminArea1 = extractComponent(components, 'administrative_area_level_1')

    const countryName = extractComponent(components, 'country')
    const countryCode = extractShortComponent(components, 'country').toLowerCase()

    const state = adminArea2 || adminArea1

    // For UK, format country as "England, UK" / "Scotland, UK" etc.
    let country = countryName
    if (countryCode === 'gb' && adminArea1) {
      country = `${adminArea1}, UK`
    }

    const lat = result.geometry?.location?.lat
    const lon = result.geometry?.location?.lng

    return NextResponse.json({
      formatted: result.formatted_address ?? '',
      city,
      state,
      country,
      lat,
      lon
    })
  } catch (error) {
    console.error('Location geocode error', error)
    return NextResponse.json({ error: 'Unexpected error fetching location details.' }, { status: 500 })
  }
}
