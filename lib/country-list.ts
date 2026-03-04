import { COUNTRY_DIAL_CODE_OPTIONS } from './country-dial-codes'

export interface CountryOption {
  code: string
  name: string
}

const slugifyCountryName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const FALLBACK_COUNTRIES: CountryOption[] = Array.from(
  new Set(
    COUNTRY_DIAL_CODE_OPTIONS
      .flatMap((entry) => entry.countries)
      .map((country) => country.trim())
      .filter(Boolean)
  )
)
  .map((name) => ({
    code: `country:${slugifyCountryName(name)}`,
    name
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))

let cachedCountries: CountryOption[] | null = null

function getRegionCodes(): string[] {
  const intlWithSupportedValues = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[]
  }

  if (typeof intlWithSupportedValues.supportedValuesOf === 'function') {
    try {
      return intlWithSupportedValues.supportedValuesOf('region')
    } catch {
      return []
    }
  }

  return []
}

export function getCountryOptions(): CountryOption[] {
  if (cachedCountries) return cachedCountries

  try {
    const intlWithDisplayNames = Intl as typeof Intl & {
      DisplayNames?: new (
        locales?: string | string[],
        options?: { type: 'region' }
      ) => { of: (code: string) => string | undefined }
    }

    if (typeof intlWithDisplayNames.DisplayNames !== 'function') {
      cachedCountries = FALLBACK_COUNTRIES
      return cachedCountries
    }

    const displayNames = new intlWithDisplayNames.DisplayNames(['en'], { type: 'region' })
    const regionCodes = getRegionCodes()

    const countries = regionCodes
      .filter((code) => typeof code === 'string' && code.length === 2 && /^[A-Z]{2}$/.test(code))
      .map((code) => {
        const name = displayNames.of(code)
        return {
          code,
          name: typeof name === 'string' ? name.trim() : ''
        }
      })
      .filter((item) => item.name && item.name !== item.code)
      .sort((a, b) => a.name.localeCompare(b.name))

    cachedCountries = countries.length > 0 ? countries : FALLBACK_COUNTRIES
    return cachedCountries
  } catch {
    cachedCountries = FALLBACK_COUNTRIES
    return cachedCountries
  }
}
