import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Readable, PassThrough } from 'node:stream'
// Busboy is bundled inside Next.js — no separate install needed.
// We use require() to avoid the missing type declaration file error.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const Busboy = require('next/dist/compiled/busboy') as (opts: Record<string, any>) => import('node:stream').Writable & { on(event: 'field', cb: (name: string, val: string) => void): void; on(event: 'file', cb: (fieldname: string, stream: import('node:stream').Readable, info: { filename: string; mimeType: string }) => void): void; on(event: 'finish' | 'error', cb: (err?: Error) => void): void }
import { uploadToR2, isR2Configured, R2_CONFIG } from '@/lib/cloudflare/r2'
import { readImageMetadata } from '@/lib/image-metadata'

export const runtime = 'nodejs'
export const maxDuration = 300

interface UploadConfig {
  folder: string
  subfolder?: string
  maxSize: number
  allowedTypes: readonly string[]
  allowedExtensions?: readonly string[]
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  requireSquare?: boolean
  minDpi?: number
  maxDpi?: number
  requireDpiMetadata?: boolean
}

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
  'gig-artwork': {
    folder: 'gig-artwork',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png'],
    minWidth: 3000,
    minHeight: 3000,
    maxWidth: 6000,
    maxHeight: 6000,
    requireSquare: true,
    minDpi: 72,
    maxDpi: 300,
    requireDpiMetadata: false,
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
    allowedTypes: [
      'audio/wav',
      'audio/x-wav',
      'audio/wave',
      'audio/vnd.wave',
      'audio/aiff',
      'audio/x-aiff',
      'audio/aif',
      'application/octet-stream',
      ''
    ],
    allowedExtensions: ['wav', 'aiff', 'aif'],
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
} satisfies Record<string, UploadConfig>

type UploadType = keyof typeof UPLOAD_CONFIGS

function getFileExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function isAllowedFile(config: UploadConfig, file: File) {
  const contentTypeAllowed = (config.allowedTypes as readonly string[]).includes(file.type)
  const extension = getFileExtension(file.name)
  const extensionAllowed = config.allowedExtensions?.includes(extension) || false
  return contentTypeAllowed || extensionAllowed
}

function shouldValidateImage(config: UploadConfig) {
  return (
    'minWidth' in config ||
    'maxWidth' in config ||
    'requireSquare' in config ||
    'minDpi' in config ||
    'maxDpi' in config
  )
}

// Parse a multipart/form-data request as a stream using busboy so the file
// is never fully buffered in memory. Returns the parsed fields and a promise
// that resolves with the upload body (Buffer for images that need dimension
// validation, Readable stream for everything else) along with file metadata.
async function parseMultipartStream(request: NextRequest): Promise<{
  fields: Record<string, string>
  fileName: string
  fileMimeType: string
  fileSize: number
  fileStream: PassThrough
}> {
  const contentType = request.headers.get('content-type') ?? ''
  // The Content-Length header gives us the declared file size (may not always be present).
  const contentLength = parseInt(request.headers.get('content-length') ?? '0', 10) || 0

  return new Promise((resolve, reject) => {
    let bb: ReturnType<typeof Busboy>
    try {
      bb = Busboy({
        headers: { 'content-type': contentType },
        limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB hard cap
      })
    } catch (err) {
      return reject(new Error(`Could not parse upload: ${err instanceof Error ? err.message : String(err)}`))
    }

    const fields: Record<string, string> = {}
    let resolved = false

    bb.on('field', (name: string, val: string) => {
      fields[name] = val
    })

    bb.on('file', (_fieldname: string, fileStream: Readable, info: { filename: string; mimeType: string }) => {
      const { filename, mimeType } = info
      const passThrough = new PassThrough()
      // Track how many bytes actually flow through so we can surface the real file size.
      let bytesStreamed = 0
      fileStream.on('data', (chunk: Buffer) => { bytesStreamed += chunk.length })

      fileStream.pipe(passThrough)

      // Resolve as soon as we have the stream reference — the caller drives it.
      resolved = true
      resolve({
        fields,
        fileName: filename || 'upload',
        fileMimeType: mimeType || 'application/octet-stream',
        fileSize: contentLength,  // best estimate; real size tracked via bytesStreamed above
        fileStream: passThrough,
      })

      // Surface busboy truncation as a stream error so callers can detect it.
      fileStream.on('limit', () => {
        passThrough.destroy(new Error('FILE_TOO_LARGE'))
      })
    })

    bb.on('error', (err: Error) => {
      if (!resolved) reject(err)
    })

    bb.on('finish', () => {
      if (!resolved) reject(new Error('No file found in upload'))
    })

    // Pipe the Web ReadableStream into busboy.
    if (!request.body) {
      return reject(new Error('Request body is empty'))
    }
    const nodeStream = Readable.fromWeb(request.body as Parameters<typeof Readable.fromWeb>[0])
    nodeStream.on('error', (err) => { if (!resolved) reject(err) })
    nodeStream.pipe(bb)
  })
}

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

    // ------------------------------------------------------------------
    // Parse the multipart body as a stream.  We intentionally avoid
    // request.formData() here because it buffers the entire file in the
    // Next.js process memory before we can inspect it, which means a 26 MB
    // WAV file causes a spike that can hit the dev-server body-clone limit.
    // Busboy streams the file bytes directly into the pipeline below.
    // ------------------------------------------------------------------
    let parsed: Awaited<ReturnType<typeof parseMultipartStream>>
    try {
      parsed = await parseMultipartStream(request)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Upload API: multipart parse error:', msg)
      return NextResponse.json({ error: 'Could not read upload', details: msg }, { status: 400 })
    }

    const { fields, fileName, fileMimeType, fileStream } = parsed
    const type     = fields['type']     ?? ''
    const entityId = fields['entityId'] ?? null

    if (!type || !(type in UPLOAD_CONFIGS)) {
      fileStream.destroy()
      return NextResponse.json({
        error: 'Invalid upload type',
        validTypes: Object.keys(UPLOAD_CONFIGS)
      }, { status: 400 })
    }

    const config = UPLOAD_CONFIGS[type as UploadType] as UploadConfig

    // Validate MIME type / extension.
    const mockFile = { type: fileMimeType, name: fileName, size: parsed.fileSize } as File
    if (!isAllowedFile(config, mockFile)) {
      fileStream.destroy()
      return NextResponse.json({
        error: 'Invalid file type',
        allowed: config.allowedTypes,
        allowedExtensions: config.allowedExtensions || []
      }, { status: 400 })
    }

    // Generate R2 key.
    const fileExt  = getFileExtension(fileName) || 'bin'
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

    let uploadBody: Buffer | Readable
    let uploadedSize = parsed.fileSize

    if (shouldValidateImage(config)) {
      // For images that need dimension / DPI checks we still need a Buffer.
      // These are small files (< 15 MB) so buffering is acceptable.
      const chunks: Buffer[] = []
      await new Promise<void>((resolve, reject) => {
        fileStream.on('data', (c: Buffer) => chunks.push(c))
        fileStream.on('end', resolve)
        fileStream.on('error', reject)
      })
      const buffer = Buffer.concat(chunks)
      uploadedSize = buffer.length

      // File-size guard (applied after buffering so we have the real size).
      if (buffer.length > config.maxSize) {
        const maxSizeMB = config.maxSize / (1024 * 1024)
        return NextResponse.json({ error: `File size must be less than ${maxSizeMB}MB` }, { status: 400 })
      }

      const metadata = readImageMetadata(new Uint8Array(buffer), fileMimeType)
      if (!metadata) {
        return NextResponse.json({ error: 'Unable to read image dimensions from upload' }, { status: 400 })
      }

      if (config.requireSquare && metadata.width !== metadata.height) {
        return NextResponse.json({ error: 'Image must be square (1:1 ratio)' }, { status: 400 })
      }
      if (typeof config.minWidth === 'number' && metadata.width < config.minWidth) {
        return NextResponse.json({ error: `Image width must be at least ${config.minWidth}px` }, { status: 400 })
      }
      if (typeof config.minHeight === 'number' && metadata.height < config.minHeight) {
        return NextResponse.json({ error: `Image height must be at least ${config.minHeight}px` }, { status: 400 })
      }
      if (typeof config.maxWidth === 'number' && metadata.width > config.maxWidth) {
        return NextResponse.json({ error: `Image width must be no more than ${config.maxWidth}px` }, { status: 400 })
      }
      if (typeof config.maxHeight === 'number' && metadata.height > config.maxHeight) {
        return NextResponse.json({ error: `Image height must be no more than ${config.maxHeight}px` }, { status: 400 })
      }

      const dpiValues = [metadata.dpiX, metadata.dpiY].filter((value): value is number => typeof value === 'number')
      if (config.requireDpiMetadata && dpiValues.length !== 2) {
        return NextResponse.json({ error: 'Image must include DPI metadata (72-300 DPI)' }, { status: 400 })
      }
      const minDpi = typeof config.minDpi === 'number' ? config.minDpi : null
      if (minDpi !== null && dpiValues.some(value => value < minDpi)) {
        return NextResponse.json({ error: `Image DPI must be at least ${minDpi}` }, { status: 400 })
      }
      const maxDpi = typeof config.maxDpi === 'number' ? config.maxDpi : null
      if (maxDpi !== null && dpiValues.some(value => value > maxDpi)) {
        return NextResponse.json({ error: `Image DPI must be no more than ${maxDpi}` }, { status: 400 })
      }

      uploadBody = buffer
    } else {
      // For audio and other non-image types, stream directly to R2.
      // The busboy fileStream is already piped through a PassThrough,
      // so we hand it to the AWS SDK and it streams straight to R2.
      uploadBody = fileStream
    }

    // Upload to Cloudflare R2
    const uploadResult = await uploadToR2(
      uploadBody,
      r2Key,
      fileMimeType || 'application/octet-stream',
      uploadedSize || undefined
    )

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
      filename: fileName,
      size: uploadedSize,
      contentType: fileMimeType
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
      Object.entries(UPLOAD_CONFIGS).map(([key, config]) => {
        const uploadConfig = config as UploadConfig
        return [
          key,
          {
            maxSize: uploadConfig.maxSize,
            maxSizeMB: uploadConfig.maxSize / (1024 * 1024),
            allowedTypes: uploadConfig.allowedTypes,
            allowedExtensions: uploadConfig.allowedExtensions || [],
          }
        ]
      })
    )
  })
}
