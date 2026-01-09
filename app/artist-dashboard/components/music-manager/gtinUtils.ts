// Utility functions for GTIN (UPC/EAN) validation and processing

/**
 * Validates GTIN checksum using GS1 algorithm
 * Works for both UPC (12 digits) and EAN (13 digits)
 */
export function validateGTINChecksum(gtin: string): boolean {
  const cleanGTIN = gtin.replace(/\D/g, '')

  if (cleanGTIN.length !== 12 && cleanGTIN.length !== 13) {
    return false
  }

  const digits = cleanGTIN.split('').map(Number)
  const checkDigit = digits.pop()!

  let sum = 0
  digits.reverse().forEach((digit, index) => {
    sum += digit * (index % 2 === 0 ? 3 : 1)
  })

  const calculatedCheck = (10 - (sum % 10)) % 10
  return calculatedCheck === checkDigit
}

/**
 * Validates GTIN format and returns detailed error messages
 */
export function validateGTIN(gtin: string): { valid: boolean; error?: string } {
  const cleanGTIN = gtin.replace(/\D/g, '')

  if (!cleanGTIN) {
    return { valid: false, error: 'GTIN cannot be empty' }
  }

  if (cleanGTIN.length !== 12 && cleanGTIN.length !== 13) {
    return {
      valid: false,
      error: `Must be exactly ${cleanGTIN.length < 12 ? 12 : 13} digits (${cleanGTIN.length < 12 ? 'UPC' : 'EAN'})`
    }
  }

  if (!validateGTINChecksum(cleanGTIN)) {
    return {
      valid: false,
      error: 'Invalid checksum. Please verify the GTIN is correct.'
    }
  }

  return { valid: true }
}

/**
 * Formats GTIN for display (adds hyphens)
 */
export function formatGTIN(gtin: string): string {
  const cleanGTIN = gtin.replace(/\D/g, '')

  if (cleanGTIN.length === 12) {
    // UPC: 0-12345-67890-1
    return `${cleanGTIN.slice(0, 1)}-${cleanGTIN.slice(1, 6)}-${cleanGTIN.slice(6, 11)}-${cleanGTIN.slice(11)}`
  } else if (cleanGTIN.length === 13) {
    // EAN: 1-234567-890123
    return `${cleanGTIN.slice(0, 1)}-${cleanGTIN.slice(1, 7)}-${cleanGTIN.slice(7)}`
  }

  return cleanGTIN
}

/**
 * Lookup GTIN from MusicBrainz via our API
 */
export async function lookupGTIN(gtin: string): Promise<{
  success: boolean
  data?: {
    releaseTitle: string
    artistName: string
    releaseDate?: string
    country?: string
    barcode: string
    releaseType?: 'single' | 'ep' | 'album'
    trackCount?: number
    musicBrainzId?: string
  }
  error?: string
  source?: string
}> {
  try {
    const cleanGTIN = gtin.replace(/\D/g, '')
    const response = await fetch(`/api/gtin-lookup?gtin=${cleanGTIN}`)

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || 'Failed to lookup GTIN'
      }
    }

    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error during lookup'
    }
  }
}

/**
 * Debounce function for input handlers
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}
