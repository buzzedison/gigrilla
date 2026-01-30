import { NextRequest, NextResponse } from 'next/server'

// ISWC verification endpoint
// In production, this would connect to ISWC database or MusicBrainz
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const iswc = searchParams.get('iswc')

    if (!iswc) {
      return NextResponse.json(
        { error: 'ISWC code is required' },
        { status: 400 }
      )
    }

    // Clean ISWC (remove dashes and spaces)
    const cleanedISWC = iswc.replace(/[-\s]/g, '').toUpperCase()

    // ISWC format: T-123456789-C (11 characters: T + 9 digits + check digit)
    // Or modern format: T-123.456.789-C
    const iswcPattern = /^T[0-9]{9}[0-9]$/

    if (cleanedISWC.length !== 11) {
      return NextResponse.json(
        {
          valid: false,
          error: 'ISWC must be 11 characters (format: T-123456789-0)'
        },
        { status: 200 }
      )
    }

    if (!cleanedISWC.startsWith('T')) {
      return NextResponse.json(
        {
          valid: false,
          error: 'ISWC must start with T'
        },
        { status: 200 }
      )
    }

    if (!iswcPattern.test(cleanedISWC)) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid ISWC format. Use: T-123456789-0'
        },
        { status: 200 }
      )
    }

    // Format ISWC for display: T-123.456.789-0
    const formattedISWC = `${cleanedISWC.slice(0, 1)}-${cleanedISWC.slice(1, 4)}.${cleanedISWC.slice(4, 7)}.${cleanedISWC.slice(7, 10)}-${cleanedISWC.slice(10)}`

    // Try to fetch from MusicBrainz API
    try {
      const mbResponse = await fetch(
        `https://musicbrainz.org/ws/2/iswc/${cleanedISWC}?fmt=json&inc=works+artist-credits`,
        {
          headers: {
            'User-Agent': 'Gigrilla/1.0 (https://gigrilla.com)'
          }
        }
      )

      if (mbResponse.ok) {
        const mbData = await mbResponse.json()

        // MusicBrainz found the ISWC
        if (mbData.works && mbData.works.length > 0) {
          const work = mbData.works[0]

          return NextResponse.json({
            valid: true,
            found: true,
            iswc: formattedISWC,
            data: {
              workTitle: work.title || '',
              composers: work['artist-credit']?.map((ac: any) => ac.name) || [],
              source: 'MusicBrainz'
            },
            message: 'ISWC verified and musical work found'
          })
        }
      }
    } catch (mbError) {
      console.log('MusicBrainz lookup failed, continuing with basic validation')
    }

    // ISWC is valid format but not found in database
    return NextResponse.json({
      valid: true,
      found: false,
      iswc: formattedISWC,
      message: 'ISWC format is valid. Please enter musical work details manually.',
      note: 'This ISWC may be newly registered or not yet in our database.'
    })

  } catch (error) {
    console.error('ISWC verification error:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify ISWC',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
