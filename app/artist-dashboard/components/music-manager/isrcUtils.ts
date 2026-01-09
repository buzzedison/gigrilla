// Utility functions for ISRC (International Standard Recording Code) validation and processing

/**
 * Validates ISRC format according to ISO 3901 standard
 * Format: CC-XXX-YY-NNNNN
 * CC: 2-letter country code
 * XXX: 3-character registrant code (alphanumeric)
 * YY: 2-digit year
 * NNNNN: 5-digit designation code
 */
export function validateISRCFormat(isrc: string): boolean {
  const cleanISRC = isrc.replace(/-/g, '').toUpperCase()

  if (cleanISRC.length !== 12) {
    return false
  }

  // Format: 2 letters, 3 alphanumeric, 2 digits, 5 digits
  const regex = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/
  return regex.test(cleanISRC)
}

/**
 * Validates ISRC and returns detailed error messages
 */
export function validateISRC(isrc: string): { valid: boolean; error?: string } {
  const cleanISRC = isrc.replace(/-/g, '').toUpperCase()

  if (!cleanISRC) {
    return { valid: false, error: 'ISRC cannot be empty' }
  }

  if (cleanISRC.length !== 12) {
    return {
      valid: false,
      error: `Must be exactly 12 characters (currently ${cleanISRC.length})`
    }
  }

  if (!validateISRCFormat(cleanISRC)) {
    return {
      valid: false,
      error: 'Invalid format. Expected: CC-XXX-YY-NNNNN (e.g., US-ABC-20-12345)'
    }
  }

  return { valid: true }
}

/**
 * Parse ISRC components
 */
export function parseISRC(isrc: string): {
  countryCode: string
  registrantCode: string
  yearCode: string
  designationCode: string
  formatted: string
} | null {
  const cleanISRC = isrc.replace(/-/g, '').toUpperCase()

  if (!validateISRCFormat(cleanISRC)) {
    return null
  }

  return {
    countryCode: cleanISRC.substring(0, 2),
    registrantCode: cleanISRC.substring(2, 5),
    yearCode: cleanISRC.substring(5, 7),
    designationCode: cleanISRC.substring(7, 12),
    formatted: `${cleanISRC.substring(0, 2)}-${cleanISRC.substring(2, 5)}-${cleanISRC.substring(5, 7)}-${cleanISRC.substring(7, 12)}`
  }
}

/**
 * Formats ISRC for display (adds hyphens)
 */
export function formatISRC(isrc: string): string {
  const cleanISRC = isrc.replace(/-/g, '').toUpperCase()

  if (cleanISRC.length === 12 && validateISRCFormat(cleanISRC)) {
    return `${cleanISRC.substring(0, 2)}-${cleanISRC.substring(2, 5)}-${cleanISRC.substring(5, 7)}-${cleanISRC.substring(7, 12)}`
  }

  return cleanISRC
}

/**
 * Get country name from ISRC country code
 */
export function getISRCCountryName(countryCode: string): string {
  const countries: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'UK': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'IE': 'Ireland',
    'NZ': 'New Zealand',
    'ZA': 'South Africa',
    'KR': 'South Korea',
    'CN': 'China',
    'IN': 'India',
    'SG': 'Singapore'
  }

  return countries[countryCode.toUpperCase()] || countryCode
}

/**
 * Lookup ISRC from MusicBrainz via our API
 */
export async function lookupISRC(isrc: string): Promise<{
  success: boolean
  data?: {
    trackTitle: string
    artistName: string
    durationSeconds?: number
    recordingDate?: string
    isrc: string
    musicBrainzId?: string
    countryCode?: string
    registrantCode?: string
    yearCode?: string
    designationCode?: string
  }
  error?: string
  source?: string
}> {
  try {
    const cleanISRC = isrc.replace(/-/g, '').toUpperCase()
    const response = await fetch(`/api/isrc-lookup?isrc=${cleanISRC}`)

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || 'Failed to lookup ISRC'
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
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Parse duration from MM:SS format to seconds
 */
export function parseDuration(duration: string): number {
  const parts = duration.split(':')
  if (parts.length !== 2) return 0

  const minutes = parseInt(parts[0], 10)
  const seconds = parseInt(parts[1], 10)

  if (isNaN(minutes) || isNaN(seconds)) return 0

  return minutes * 60 + seconds
}

/**
 * Debounce function for input handlers
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
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

/**
 * Generate a sample ISRC code for demonstration
 */
export function generateSampleISRC(countryCode: string = 'US'): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const registrant = 'ABC'
  const designation = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `${countryCode}-${registrant}-${year}-${designation}`
}
