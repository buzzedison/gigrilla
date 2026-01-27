import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

// Cloudflare R2 configuration
// R2 uses S3-compatible API but with Cloudflare's endpoint
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'gigrilla-media'

// Public URL for accessing files (set up in R2 bucket settings or use custom domain)
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://pub-${R2_ACCOUNT_ID}.r2.dev`

// Create S3 client configured for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export const R2_CONFIG = {
  bucketName: R2_BUCKET_NAME,
  publicUrl: R2_PUBLIC_URL,
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })

    await r2Client.send(command)

    // Return the public URL for the uploaded file
    const url = `${R2_PUBLIC_URL}/${key}`

    return { success: true, url }
  } catch (error) {
    console.error('R2 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    }
  }
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)

    return { success: true }
  } catch (error) {
    console.error('R2 delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error',
    }
  }
}

/**
 * Get a file from Cloudflare R2 (for server-side use)
 */
export async function getFromR2(key: string): Promise<{ success: boolean; data?: Uint8Array; error?: string }> {
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })

    const response = await r2Client.send(command)
    const data = await response.Body?.transformToByteArray()

    return { success: true, data }
  } catch (error) {
    console.error('R2 get error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown get error',
    }
  }
}

/**
 * Generate a file key for artist photos
 */
export function generateArtistPhotoKey(
  userId: string,
  type: 'logo' | 'header' | 'photo',
  fileExtension: string
): string {
  const timestamp = Date.now()
  return `artist-photos/${userId}/${type}/${timestamp}.${fileExtension}`
}

/**
 * Generate a file key for music tracks
 */
export function generateMusicTrackKey(
  userId: string,
  releaseId: string,
  trackNumber: number,
  type: 'audio' | 'lyrics',
  fileExtension: string
): string {
  const timestamp = Date.now()
  return `music-tracks/${userId}/${releaseId}/track-${trackNumber}/${type}/${timestamp}.${fileExtension}`
}

/**
 * Extract the R2 key from a public URL
 */
export function extractR2KeyFromUrl(url: string): string | null {
  try {
    const publicUrl = R2_PUBLIC_URL.replace(/\/$/, '')
    if (url.startsWith(publicUrl)) {
      return url.replace(`${publicUrl}/`, '')
    }
    // Handle other URL formats if needed
    const urlParts = url.split('/')
    // Find common folder names in the path and take everything after
    const folderNames = ['artist-photos', 'music-tracks', 'cover-artwork', 'release-artwork']
    for (const folderName of folderNames) {
      const folderIndex = urlParts.findIndex(part => part === folderName)
      if (folderIndex !== -1) {
        return urlParts.slice(folderIndex).join('/')
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Check if R2 is properly configured
 */
export function isR2Configured(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  )
}
