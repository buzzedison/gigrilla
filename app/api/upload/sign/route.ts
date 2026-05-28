/**
 * POST /api/upload/sign
 *
 * Returns a short-lived pre-signed R2 PUT URL so the browser can upload
 * large files (e.g. WAV tracks) directly to R2 without routing the bytes
 * through our Next.js server.  This eliminates every server-side body-size
 * limit from the upload path.
 *
 * Request body (JSON):
 *   { type: UploadType, entityId?: string, filename: string, contentType: string, fileSize: number }
 *
 * Response (JSON):
 *   { uploadUrl: string, publicUrl: string, key: string }
 *
 * The caller should:
 *   1. PUT the file bytes to `uploadUrl` (with header Content-Type matching the
 *      value sent here, no auth header — the signature is already in the URL).
 *   2. Use `publicUrl` as the stored file reference.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2Client, isR2Configured, R2_CONFIG } from '@/lib/cloudflare/r2'

export const runtime = 'nodejs'

// Re-use the same type/config restrictions as the main upload route so
// validation is always consistent between the two code paths.
const SIGN_CONFIGS = {
  'track-audio': {
    maxSize: 2 * 1024 * 1024 * 1024, // 2 GB
    allowedTypes: [
      'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/vnd.wave',
      'audio/aiff', 'audio/x-aiff', 'audio/aif',
      'application/octet-stream',
    ],
    allowedExtensions: ['wav', 'aiff', 'aif'],
    folder: 'music-tracks',
  },
} as const

type SignType = keyof typeof SIGN_CONFIGS

// Pre-signed PUT URLs are valid for 15 minutes.
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

    // --- Parse and validate request ---
    let body: { type?: string; entityId?: string; filename?: string; contentType?: string; fileSize?: number }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { type, entityId, filename, contentType, fileSize } = body

    if (!type || !(type in SIGN_CONFIGS)) {
      return NextResponse.json({
        error: 'Invalid upload type',
        validTypes: Object.keys(SIGN_CONFIGS),
      }, { status: 400 })
    }

    const config = SIGN_CONFIGS[type as SignType]

    // Validate content type
    const mimeOk = (config.allowedTypes as readonly string[]).includes(contentType ?? '')
    const ext = (filename ?? '').split('.').pop()?.toLowerCase() ?? ''
    const extOk = config.allowedExtensions.includes(ext as never)
    if (!mimeOk && !extOk) {
      return NextResponse.json({
        error: 'Invalid file type',
        allowed: config.allowedTypes,
      }, { status: 400 })
    }

    // Validate file size (soft check — the actual bytes never touch our server)
    if (typeof fileSize === 'number' && fileSize > config.maxSize) {
      const maxSizeMB = config.maxSize / (1024 * 1024)
      return NextResponse.json({
        error: `File size must be less than ${maxSizeMB}MB`,
      }, { status: 400 })
    }

    // --- Build R2 key ---
    const timestamp = Date.now()
    const fileExt = ext || 'bin'
    let r2Key: string
    if (entityId) {
      r2Key = `${config.folder}/${user.id}/${entityId}/${timestamp}.${fileExt}`
    } else {
      r2Key = `${config.folder}/${user.id}/${timestamp}.${fileExt}`
    }

    // --- Generate pre-signed URL ---
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

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key: r2Key,
    })
  } catch (error) {
    console.error('Upload sign API: unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
