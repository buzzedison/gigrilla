import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { uploadToR2, isR2Configured, R2_CONFIG } from '@/lib/cloudflare/r2'

// Supported upload types with their configurations
const UPLOAD_CONFIGS = {
  avatar: {
    folder: 'avatars',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  'fan-gallery': {
    folder: 'fan-gallery',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  'cover-artwork': {
    folder: 'cover-artwork',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png'],
  },
  'artist-logo': {
    folder: 'artist-photos',
    subfolder: 'logo',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  'artist-header': {
    folder: 'artist-photos',
    subfolder: 'header',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  'artist-photo': {
    folder: 'artist-photos',
    subfolder: 'photo',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  'venue-photo': {
    folder: 'venue-photos',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  'release-artwork': {
    folder: 'release-artwork',
    maxSize: 15 * 1024 * 1024, // 15MB for high-res artwork
    allowedTypes: ['image/jpeg', 'image/png'],
  },
  'track-audio': {
    folder: 'music-tracks',
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB max for audio files
    allowedTypes: ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/aiff', 'audio/x-aiff', 'audio/aif'],
  },
  'track-lyrics': {
    folder: 'music-tracks',
    subfolder: 'lyrics',
    maxSize: 1 * 1024 * 1024, // 1MB for lyrics files
    allowedTypes: ['text/plain', 'text/markdown', 'application/json'],
  },
  'cover-license': {
    folder: 'music-tracks',
    subfolder: 'licenses',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  'remix-authorization': {
    folder: 'music-tracks',
    subfolder: 'authorizations',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  'samples-clearance': {
    folder: 'music-tracks',
    subfolder: 'clearances',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
} as const

type UploadType = keyof typeof UPLOAD_CONFIGS

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Server Component invocation can safely ignore cookie writes.
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Upload API: Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError.message }, { status: 401 })
    }

    if (!user) {
      console.error('Upload API: No authenticated user')
      return NextResponse.json({ error: 'No user authenticated' }, { status: 401 })
    }

    // Check if R2 is configured
    if (!isR2Configured()) {
      console.error('Upload API: Cloudflare R2 is not configured')
      return NextResponse.json({
        error: 'Storage not configured',
        details: 'Cloudflare R2 credentials are missing'
      }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const entityId = formData.get('entityId') as string | null // For release/venue specific uploads

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!type || !(type in UPLOAD_CONFIGS)) {
      return NextResponse.json({
        error: 'Invalid upload type',
        validTypes: Object.keys(UPLOAD_CONFIGS)
      }, { status: 400 })
    }

    const config = UPLOAD_CONFIGS[type as UploadType]

    // Validate file type
    if (!(config.allowedTypes as readonly string[]).includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type',
        allowed: config.allowedTypes
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > config.maxSize) {
      const maxSizeMB = config.maxSize / (1024 * 1024)
      return NextResponse.json({
        error: `File size must be less than ${maxSizeMB}MB`
      }, { status: 400 })
    }

    // Generate R2 key based on type
    const fileExt = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()

    let r2Key: string
    if ('subfolder' in config && config.subfolder) {
      r2Key = `${config.folder}/${user.id}/${config.subfolder}/${timestamp}.${fileExt}`
    } else if (entityId) {
      r2Key = `${config.folder}/${user.id}/${entityId}/${timestamp}.${fileExt}`
    } else {
      r2Key = `${config.folder}/${user.id}/${timestamp}.${fileExt}`
    }

    console.log('Upload API: Uploading file for user:', user.id, 'type:', type, 'key:', r2Key)

    // Convert file to buffer for R2 upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudflare R2
    const uploadResult = await uploadToR2(buffer, r2Key, file.type)

    if (!uploadResult.success || !uploadResult.url) {
      console.error('Upload API: R2 upload error:', uploadResult.error)
      return NextResponse.json({
        error: 'Failed to upload file',
        details: uploadResult.error || 'Unknown upload error'
      }, { status: 500 })
    }

    console.log('Upload API: Successfully uploaded file:', r2Key)

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      key: r2Key,
      type: type,
      filename: file.name,
      size: file.size,
      contentType: file.type
    })

  } catch (error) {
    console.error('Upload API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check storage status
export async function GET() {
  return NextResponse.json({
    configured: isR2Configured(),
    publicUrl: isR2Configured() ? R2_CONFIG.publicUrl : null,
    supportedTypes: Object.keys(UPLOAD_CONFIGS),
    limits: Object.fromEntries(
      Object.entries(UPLOAD_CONFIGS).map(([key, config]) => [
        key,
        {
          maxSize: config.maxSize,
          maxSizeMB: config.maxSize / (1024 * 1024),
          allowedTypes: config.allowedTypes,
        }
      ])
    )
  })
}
