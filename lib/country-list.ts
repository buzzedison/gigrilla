export interface CountryOption {
  code: string
  name: string
}

const FALLBACK_COUNTRIES: CountryOption[] = [
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'GH', name: 'Ghana' },
  { code: 'IE', name: 'Ireland' },
  { code: 'JP', name: 'Japan' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'US', name: 'United States' },
  { code: 'ZA', name: 'South Africa' },
]

let cachedCountries: CountryOption[] | null = null

function getRegionCodes(): string[] {
  const intlWithSupportedValues = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[]
  }

  if (typeof intlWithSupportedValues.supportedValuesOf === 'function') {
    return intlWithSupportedValues.supportedValuesOf('region')
  }

  return []
}

export function getCountryOptions(): CountryOption[] {
  if (cachedCountries) return cachedCountries

  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })
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
}
