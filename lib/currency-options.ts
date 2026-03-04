export interface CurrencyOption {
  code: string
  symbol: string
  label: string
}

const CURRENCY_CODE_FALLBACK = [
  'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
  'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
  'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY',
  'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP',
  'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD',
  'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS',
  'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR',
  'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD',
  'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU',
  'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK',
  'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG',
  'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK',
  'SGD', 'SHP', 'SLE', 'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL',
  'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH',
  'UGX', 'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD',
  'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL'
]

const optionsCache = new Map<string, CurrencyOption[]>()

function readRuntimeCurrencyCodes(): string[] {
  const intlWithSupportedValues = Intl as unknown as {
    supportedValuesOf?: (key: string) => string[]
  }

  if (typeof intlWithSupportedValues.supportedValuesOf === 'function') {
    try {
      const values = intlWithSupportedValues.supportedValuesOf('currency')
      if (Array.isArray(values) && values.length > 0) {
        return values.map((value) => value.toUpperCase())
      }
    } catch (error) {
      // Some runtimes can throw even for valid keys. Fallback below.
      console.warn('Currency options: Intl.supportedValuesOf("currency") failed, using fallback list.', error)
    }
  }

  return CURRENCY_CODE_FALLBACK
}

export function getCurrencySymbol(currencyCode: string): string {
  if (!currencyCode) return ''
  const code = currencyCode.toUpperCase()

  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol'
    }).formatToParts(1)
    const symbol = parts.find((part) => part.type === 'currency')?.value?.trim()
    return symbol || code
  } catch {
    return code
  }
}

export function getCurrencyOptions(): CurrencyOption[] {
  const cacheKey = 'default'
  const cached = optionsCache.get(cacheKey)
  if (cached) return cached

  const uniqueCodes = Array.from(new Set(readRuntimeCurrencyCodes())).sort((a, b) => a.localeCompare(b))
  const options = uniqueCodes.map((code) => {
    const symbol = getCurrencySymbol(code)
    return {
      code,
      symbol,
      label: `${code} (${symbol})`
    }
  })

  optionsCache.set(cacheKey, options)
  return options
}
