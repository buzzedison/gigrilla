/**
 * POST /api/upload/sign
 *
 * Returns a short-lived pre-signed R2 PUT URL so the browser can upload
 * files directly to R2 without routing any bytes through our Next.js /
 * Vercel Serverless Function.  This bypasses Vercel's 4.5 MB request-body
 * limit entirely.
 *
 * Request body (JSON):
 *   { type, entityId?, filename, contentType, fileSize }
 *
 * Response (JSON):
 *   { uploadUrl, publicUrl, key }
 *
 * The caller PUTs the raw file bytes to `uploadUrl` (Content-Type header
 * must match what was sent here — the signature covers it).
 * `publicUrl` is the permanent CDN URL to store in the database.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2Client, isR2Configured, R2_CONFIG } from '@/lib/cloudflare/r2'

export const runtime = 'nodejs'

// Mirror of UPLOAD_CONFIGS in /api/upload/route.ts — keep in sync.
// Dimension / DPI validation is enforced client-side for pre-signed uploads.
const SIGN_CONFIGS = {
  avatar: {
    folder: 'avatars',
    subfolder: undefined as string | undefined,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: [] as string[],
  },
  'fan-gallery': {
    folder: 'fan-gallery',
    subfolder: undefined as string | undefined,
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: [] as string[],
  },
  'cover-artwork': {
    folder: 'cover-artwork',
    subfolder: undefined as string | undefined,
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: [] as string[],
  },
  'gig-artwork': {
    folder: 'gig-artwork',
    subfolder: undefined as string | undefined,
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: [] as string[],
  },
  'artist-logo': {
    folder: 'artist-photos',
    subfolder: 'logo',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: [] as string[],
  },
  'artist-header': {
    folder: 'artist-photos',
    subfolder: 'header',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: [] as string[],
  },
  'artist-photo': {
    folder: 'artist-photos',
    subfolder: 'photo',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: [] as string[],
  },
  'venue-photo': {
    folder: 'venue-photos',
    subfolder: undefined as string | undefined,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: [] as string[],
  },
  'release-artwork': {
    folder: 'release-artwork',
    subfolder: undefined as string | undefined,
    maxSize: 15 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: [] as string[],
  },
  'track-audio': {
    folder: 'music-tracks',
    subfolder: undefined as string | undefined,
    maxSize: 2 * 1024 * 1024 * 1024,
    allowedTypes: [
      'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/vnd.wave',
      'audio/aiff', 'audio/x-aiff', 'audio/aif',
      'application/octet-stream', '',
    ],
    allowedExtensions: ['wav', 'aiff', 'aif'],
  },
  'track-lyrics': {
    folder: 'music-tracks',
    subfolder: 'lyrics',
    maxSize: 1 * 1024 * 1024,
    allowedTypes: ['text/plain', 'text/markdown', 'application/json'],
    allowedExtensions: [] as string[],
  },
  'cover-license': {
    folder: 'music-tracks',
    subfolder: 'licenses',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions: [] as string[],
  },
  'remix-authorization': {
    folder: 'music-tracks',
    subfolder: 'authorizations',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions: [] as string[],
  },
  'samples-clearance': {
    folder: 'music-tracks',
    subfolder: 'clearances',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions: [] as string[],
  },
}

type SignType = keyof typeof SIGN_CONFIGS

// Pre-signed PUT URLs expire after 15 minutes.
const PRESIGN_EXPIRY_SECONDS = 15 * 60

export async function POST(request: NextRequest) {
  try {
    // --- Auth ---
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }

    // --- Parse request body ---
    let body: {
      type?: string
      entityId?: string
      filename?: string
      contentType?: string
      fileSize?: number
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { type, entityId, filename = 'upload', contentType = '', fileSize } = body

    if (!type || !(type in SIGN_CONFIGS)) {
      return NextResponse.json({
        error: 'Invalid upload type',
        validTypes: Object.keys(SIGN_CONFIGS),
      }, { status: 400 })
    }

    const config = SIGN_CONFIGS[type as SignType]

    // Validate MIME type / extension
    const mimeOk = config.allowedTypes.includes(contentType)
    const ext = filename.split('.').pop()?.toLowerCase() ?? ''
    const extOk = config.allowedExtensions.length > 0 && config.allowedExtensions.includes(ext)
    if (!mimeOk && !extOk) {
      return NextResponse.json({
        error: 'Invalid file type',
        allowed: config.allowedTypes,
      }, { status: 400 })
    }

    // Soft size check (bytes never touch our server, but catch obvious mistakes)
    if (typeof fileSize === 'number' && fileSize > config.maxSize) {
      const mb = (config.maxSize / (1024 * 1024)).toFixed(0)
      return NextResponse.json({ error: `File size must be less than ${mb}MB` }, { status: 400 })
    }

    // --- Build R2 object key ---
    const timestamp = Date.now()
    const fileExt = ext || 'bin'
    let r2Key: string

    if (config.subfolder) {
      r2Key = `${config.folder}/${user.id}/${config.subfolder}/${timestamp}.${fileExt}`
    } else if (entityId) {
      r2Key = `${config.folder}/${user.id}/${entityId}/${timestamp}.${fileExt}`
    } else {
      r2Key = `${config.folder}/${user.id}/${timestamp}.${fileExt}`
    }

    // --- Generate pre-signed PUT URL ---
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: r2Key,
      ContentType: contentType || 'application/octet-stream',
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadUrl = await getSignedUrl(r2Client as any, command, {
      expiresIn: PRESIGN_EXPIRY_SECONDS,
    })

    const publicUrl = `${R2_CONFIG.publicUrl}/${r2Key}`

    return NextResponse.json({ uploadUrl, publicUrl, key: r2Key })
  } catch (error) {
    console.error('Upload sign API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
