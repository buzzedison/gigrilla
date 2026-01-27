// Utility functions for Professional ID validation (ISNI, IPI/CAE)

/**
 * ISNI (International Standard Name Identifier) Validation
 * Format: 16 digits, optionally formatted as 0000 0000 0000 000X
 * The last character can be 0-9 or X (check digit)
 * 
 * ISNI follows ISO 27729 standard and uses a MOD 11-2 checksum
 */

/**
 * Validates ISNI format
 * @param isni - The ISNI to validate
 * @returns boolean - Whether the format is valid
 */
export function validateISNIFormat(isni: string): boolean {
    // Remove spaces and hyphens
    const cleanISNI = isni.replace(/[\s-]/g, '').toUpperCase()

    // Must be exactly 16 characters
    if (cleanISNI.length !== 16) {
        return false
    }

    // First 15 characters must be digits, last can be digit or X
    const regex = /^[0-9]{15}[0-9X]$/
    return regex.test(cleanISNI)
}

/**
 * Calculates the ISNI check digit using MOD 11-2 algorithm
 * @param digits - First 15 digits of ISNI
 * @returns string - The check digit (0-9 or X)
 */
function calculateISNICheckDigit(digits: string): string {
    let sum = 0
    for (let i = 0; i < 15; i++) {
        sum = (sum + parseInt(digits[i], 10)) * 2
    }
    const remainder = sum % 11
    const checkDigit = (12 - remainder) % 11
    return checkDigit === 10 ? 'X' : checkDigit.toString()
}

/**
 * Validates ISNI with checksum verification
 * @param isni - The ISNI to validate
 * @returns object - Validation result with error message
 */
export function validateISNI(isni: string): { valid: boolean; error?: string; formatted?: string } {
    const cleanISNI = isni.replace(/[\s-]/g, '').toUpperCase()

    if (!cleanISNI) {
        return { valid: false, error: 'ISNI cannot be empty' }
    }

    if (cleanISNI.length !== 16) {
        return {
            valid: false,
            error: `Must be exactly 16 characters (currently ${cleanISNI.length})`
        }
    }

    if (!validateISNIFormat(cleanISNI)) {
        return {
            valid: false,
            error: 'Invalid format. Must be 16 digits (last can be X).'
        }
    }

    // Verify checksum
    const expectedCheckDigit = calculateISNICheckDigit(cleanISNI.substring(0, 15))
    const actualCheckDigit = cleanISNI.charAt(15)

    if (expectedCheckDigit !== actualCheckDigit) {
        return {
            valid: false,
            error: 'Invalid check digit. Please verify your ISNI is correct.'
        }
    }

    return {
        valid: true,
        formatted: formatISNI(cleanISNI)
    }
}

/**
 * Formats ISNI for display (adds spaces)
 * @param isni - The ISNI to format
 * @returns string - Formatted ISNI (0000 0000 0000 000X)
 */
export function formatISNI(isni: string): string {
    const cleanISNI = isni.replace(/[\s-]/g, '').toUpperCase()

    if (cleanISNI.length === 16) {
        return `${cleanISNI.substring(0, 4)} ${cleanISNI.substring(4, 8)} ${cleanISNI.substring(8, 12)} ${cleanISNI.substring(12, 16)}`
    }

    return cleanISNI
}

/**
 * Parse ISNI into components
 */
export function parseISNI(isni: string): {
    prefix: string
    digits: string
    checkDigit: string
    formatted: string
    isniUrl: string
} | null {
    const cleanISNI = isni.replace(/[\s-]/g, '').toUpperCase()

    if (!validateISNIFormat(cleanISNI)) {
        return null
    }

    return {
        prefix: cleanISNI.substring(0, 4),
        digits: cleanISNI.substring(4, 15),
        checkDigit: cleanISNI.charAt(15),
        formatted: formatISNI(cleanISNI),
        isniUrl: `https://isni.org/isni/${cleanISNI}`
    }
}


/**
 * IPI/CAE (Interested Parties Information) Validation
 * IPI is a 9-11 digit number assigned by CISAC
 * Old CAE numbers are 9 digits, newer IPI base numbers are 11 digits
 */

/**
 * Validates IPI/CAE format
 * @param ipi - The IPI/CAE number to validate
 * @returns boolean - Whether the format is valid
 */
export function validateIPIFormat(ipi: string): boolean {
    // Remove spaces, hyphens, and leading zeros for normalization
    const cleanIPI = ipi.replace(/[\s-]/g, '')

    // Must be 9-11 digits only
    if (!/^[0-9]+$/.test(cleanIPI)) {
        return false
    }

    // CAE is 9 digits, IPI base number is 11 digits
    const length = cleanIPI.length
    return length >= 9 && length <= 11
}

/**
 * Calculates IPI check digits using MOD 101-2 algorithm
 * IPI base numbers have 2 check digits at the end
 */
function calculateIPICheckDigits(baseNum: string): string {
    // Use modular arithmetic with regular numbers (safe for 9 digits)
    const num = parseInt(baseNum, 10)
    const checkDigits = 101 - (num % 101)
    return (checkDigits % 101).toString().padStart(2, '0')
}

/**
 * Validates IPI/CAE with format checking
 * @param ipi - The IPI/CAE to validate
 * @returns object - Validation result with error message
 */
export function validateIPI(ipi: string): { valid: boolean; error?: string; formatted?: string; type?: 'CAE' | 'IPI' } {
    const cleanIPI = ipi.replace(/[\s-]/g, '')

    if (!cleanIPI) {
        return { valid: false, error: 'IPI/CAE cannot be empty' }
    }

    if (!/^[0-9]+$/.test(cleanIPI)) {
        return {
            valid: false,
            error: 'Must contain only digits'
        }
    }

    const length = cleanIPI.length

    if (length < 9) {
        return {
            valid: false,
            error: `Too short. Must be 9-11 digits (currently ${length})`
        }
    }

    if (length > 11) {
        return {
            valid: false,
            error: `Too long. Must be 9-11 digits (currently ${length})`
        }
    }

    // Determine type based on length
    const type: 'CAE' | 'IPI' = length === 9 ? 'CAE' : 'IPI'

    // For 11-digit IPI, verify check digits
    if (length === 11) {
        const baseNum = cleanIPI.substring(0, 9)
        const checkDigits = cleanIPI.substring(9, 11)
        const expectedCheck = calculateIPICheckDigits(baseNum)

        if (checkDigits !== expectedCheck) {
            // Note: We don't strictly fail here as some older IPIs may not follow the standard
            // Just return as valid but the user should verify
            return {
                valid: true,
                formatted: cleanIPI,
                type,
                error: 'Check digits may be incorrect. Please verify with your PRO.'
            }
        }
    }

    return {
        valid: true,
        formatted: cleanIPI,
        type
    }
}

/**
 * Formats IPI/CAE for display
 */
export function formatIPI(ipi: string): string {
    const cleanIPI = ipi.replace(/[\s-]/g, '')

    // Return as-is for display, or could add formatting
    if (cleanIPI.length === 11) {
        // Format as XXX XXX XXX XX for readability
        return `${cleanIPI.substring(0, 3)} ${cleanIPI.substring(3, 6)} ${cleanIPI.substring(6, 9)} ${cleanIPI.substring(9, 11)}`
    }

    if (cleanIPI.length === 9) {
        // Format as XXX XXX XXX
        return `${cleanIPI.substring(0, 3)} ${cleanIPI.substring(3, 6)} ${cleanIPI.substring(6, 9)}`
    }

    return cleanIPI
}

/**
 * URLs for finding/registering professional IDs
 */
export const PROFESSIONAL_ID_URLS = {
    isni: {
        search: 'https://isni.org/page/search-database/',
        register: 'https://isni.org/page/requests/',
        info: 'https://isni.org/'
    },
    ipi: {
        search: 'https://repertoire.bmi.com/StartPage.aspx',
        ascap: 'https://www.ascap.com/',
        bmi: 'https://www.bmi.com/',
        prs: 'https://www.prsformusic.com/',
        info: 'https://www.cisac.org/services/information-services/ipi'
    }
}

/**
 * Validation status type for UI display
 */
export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid' | 'warning'

/**
 * Get validation status color classes
 */
export function getValidationStatusClasses(status: ValidationStatus): {
    border: string
    bg: string
    text: string
    icon: string
} {
    switch (status) {
        case 'valid':
            return {
                border: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
                bg: 'bg-green-50',
                text: 'text-green-700',
                icon: 'text-green-500'
            }
        case 'invalid':
            return {
                border: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                bg: 'bg-red-50',
                text: 'text-red-700',
                icon: 'text-red-500'
            }
        case 'warning':
            return {
                border: 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/20',
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                icon: 'text-amber-500'
            }
        case 'validating':
            return {
                border: 'border-blue-300 focus:border-blue-500',
                bg: 'bg-blue-50',
                text: 'text-blue-600',
                icon: 'text-blue-500'
            }
        default:
            return {
                border: 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20',
                bg: '',
                text: 'text-gray-600',
                icon: 'text-gray-400'
            }
    }
}

/**
 * ISNI Lookup Result interface
 */
export interface ISNILookupResult {
    isni: string
    name: string
    creationRole?: string
    uri?: string
    titles?: string[]
}

/**
 * Look up ISNI owner information
 */
export async function lookupISNI(isni: string): Promise<{
    success: boolean
    data?: ISNILookupResult
    warning?: string
    message?: string
    error?: string
}> {
    try {
        const cleanISNI = isni.replace(/[\s-]/g, '').toUpperCase()
        const response = await fetch(`/api/isni-lookup?isni=${cleanISNI}`)

        if (!response.ok) {
            const errorData = await response.json()
            return {
                success: false,
                error: errorData.error || 'Failed to lookup ISNI'
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

