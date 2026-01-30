import { NextRequest, NextResponse } from 'next/server'

// ISRC verification endpoint
// In production, this would connect to MusicBrainz, ISRC Registry, or similar service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isrc = searchParams.get('isrc')

    if (!isrc) {
      return NextResponse.json(
        { error: 'ISRC code is required' },
        { status: 400 }
      )
    }

    // Clean and validate ISRC format
    const cleanedISRC = isrc.replace(/-/g, '').toUpperCase()

    // ISRC format: CC-XXX-YY-NNNNN (12 characters total)
    // CC = Country code (2 letters)
    // XXX = Registrant code (3 alphanumeric)
    // YY = Year (2 digits)
    // NNNNN = Designation code (5 digits)
    const isrcPattern = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/

    if (cleanedISRC.length !== 12) {
      return NextResponse.json(
        {
          valid: false,
          error: 'ISRC must be 12 characters (format: CC-XXX-YY-NNNNN)'
        },
        { status: 200 }
      )
    }

    if (!isrcPattern.test(cleanedISRC)) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid ISRC format. Use: CC-XXX-YY-NNNNN (e.g., USRC11234567)'
        },
        { status: 200 }
      )
    }

    // Format ISRC with dashes for display
    const formattedISRC = `${cleanedISRC.slice(0, 2)}-${cleanedISRC.slice(2, 5)}-${cleanedISRC.slice(5, 7)}-${cleanedISRC.slice(7, 12)}`

    // Try to fetch from MusicBrainz API
    try {
      const mbResponse = await fetch(
        `https://musicbrainz.org/ws/2/isrc/${cleanedISRC}?fmt=json&inc=recordings+artist-credits`,
        {
          headers: {
            'User-Agent': 'Gigrilla/1.0 (https://gigrilla.com)'
          }
        }
      )

      if (mbResponse.ok) {
        const mbData = await mbResponse.json()

        // MusicBrainz found the ISRC
        if (mbData.recordings && mbData.recordings.length > 0) {
          const recording = mbData.recordings[0]
          const artistName = recording['artist-credit']?.[0]?.name || ''

          return NextResponse.json({
            valid: true,
            found: true,
            isrc: formattedISRC,
            data: {
              trackTitle: recording.title || '',
              artistName: artistName,
              duration: recording.length ? Math.floor(recording.length / 1000) : 0,
              source: 'MusicBrainz'
            },
            message: 'ISRC verified and track details found'
          })
        }
      }
    } catch (mbError) {
      console.log('MusicBrainz lookup failed, continuing with basic validation')
    }

    // ISRC is valid format but not found in database
    return NextResponse.json({
      valid: true,
      found: false,
      isrc: formattedISRC,
      message: 'ISRC format is valid. Please enter track details manually.',
      note: 'This ISRC may be newly registered or not yet in our database.'
    })

  } catch (error) {
    console.error('ISRC verification error:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify ISRC',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
