import { NextRequest, NextResponse } from 'next/server'

/**
 * ISNI Lookup API
 * Looks up ISNI information from the ISNI database
 * 
 * The ISNI database provides a public API for looking up identities
 */

interface ISNIRecord {
    isni: string
    name: string
    creationRole?: string
    uri?: string
    titles?: string[]
    relatedNames?: string[]
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const isni = searchParams.get('isni')

    if (!isni) {
        return NextResponse.json(
            { success: false, error: 'ISNI parameter is required' },
            { status: 400 }
        )
    }

    // Clean the ISNI (remove spaces and hyphens)
    const cleanISNI = isni.replace(/[\s-]/g, '').toUpperCase()

    // Validate format
    if (!/^[0-9]{15}[0-9X]$/.test(cleanISNI)) {
        return NextResponse.json(
            { success: false, error: 'Invalid ISNI format' },
            { status: 400 }
        )
    }

    try {
        // The ISNI public API endpoint
        // Format: https://isni.org/isni/{ISNI}
        // Returns an HTML page, but we can also use their SRU/CQL API

        // Using the ISNI SRU API for structured data
        // Documentation: https://isni.org/page/search-database/
        const apiUrl = `https://isni.oclc.org/sru/?operation=searchRetrieve&query=pica.isn+%3D+%22${cleanISNI}%22&version=1.1&recordSchema=isni-b&maximumRecords=1`

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/xml',
                'User-Agent': 'Gigrilla/1.0 (Music Platform)'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            // If ISNI API is unavailable, return a warning but don't fail
            return NextResponse.json({
                success: true,
                data: null,
                warning: 'Unable to verify ISNI at this time. Please ensure you are using your own ISNI.'
            })
        }

        const xmlText = await response.text()

        // Parse the XML response
        const record = parseISNIResponse(xmlText, cleanISNI)

        if (!record) {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'No record found for this ISNI. It may be newly registered or not yet indexed.'
            })
        }

        return NextResponse.json({
            success: true,
            data: record
        })

    } catch (error) {
        console.error('ISNI lookup error:', error)

        // Return success with warning rather than failing
        return NextResponse.json({
            success: true,
            data: null,
            warning: 'Unable to verify ISNI at this time. Please ensure you are using your own ISNI.'
        })
    }
}

/**
 * Parse the ISNI SRU XML response
 */
function parseISNIResponse(xml: string, isni: string): ISNIRecord | null {
    try {
        // Check if we have any records
        if (xml.includes('<numberOfRecords>0</numberOfRecords>')) {
            return null
        }

        // Extract the name (simplified parsing - look for personalName or organisationName)
        let name = ''

        // Try to find forename and surname
        const forenameMatch = xml.match(/<forename>([^<]+)<\/forename>/i)
        const surnameMatch = xml.match(/<surname>([^<]+)<\/surname>/i)

        if (forenameMatch && surnameMatch) {
            name = `${forenameMatch[1]} ${surnameMatch[1]}`
        } else if (surnameMatch) {
            name = surnameMatch[1]
        }

        // If no personal name, try organisation name
        if (!name) {
            const orgNameMatch = xml.match(/<organisationName>[\s\S]*?<mainName>([^<]+)<\/mainName>/i)
            if (orgNameMatch) {
                name = orgNameMatch[1]
            }
        }

        // Try to find a generic name field
        if (!name) {
            const nameMatch = xml.match(/<mainName>([^<]+)<\/mainName>/i)
            if (nameMatch) {
                name = nameMatch[1]
            }
        }

        // Extract creation role if available
        let creationRole = ''
        const roleMatch = xml.match(/<creationRole>([^<]+)<\/creationRole>/i)
        if (roleMatch) {
            creationRole = roleMatch[1]
        }

        // Extract titles if available
        const titles: string[] = []
        const titleMatches = xml.matchAll(/<title>([^<]+)<\/title>/gi)
        for (const match of titleMatches) {
            titles.push(match[1])
        }

        if (!name) {
            return null
        }

        return {
            isni: formatISNI(isni),
            name: name.trim(),
            creationRole: creationRole || undefined,
            uri: `https://isni.org/isni/${isni}`,
            titles: titles.length > 0 ? titles.slice(0, 5) : undefined // Limit to 5 titles
        }
    } catch (error) {
        console.error('Error parsing ISNI XML:', error)
        return null
    }
}

/**
 * Format ISNI with spaces
 */
function formatISNI(isni: string): string {
    const clean = isni.replace(/[\s-]/g, '').toUpperCase()
    if (clean.length === 16) {
        return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12, 16)}`
    }
    return clean
}
