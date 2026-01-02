import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// YouTube utility functions
export function addYouTubeRelParam(url: string): string {
  try {
    const urlObj = new URL(url.trim())

    // Only process YouTube URLs
    if (!urlObj.hostname.includes('youtube.com') && !urlObj.hostname.includes('youtu.be')) {
      return url
    }

    // Add or update the rel parameter
    urlObj.searchParams.set('rel', '0')

    return urlObj.toString()
  } catch {
    // If URL parsing fails, return original
    return url
  }
}

export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url.trim())
    let videoId: string | null = null

    // Handle youtu.be short URLs
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1)
    }
    // Handle youtube.com URLs
    else if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname.includes('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1]?.split('/')[0]
      } else {
        videoId = urlObj.searchParams.get('v')
      }
    }

    if (!videoId) return null

    // Return embed URL with rel=0
    return `https://www.youtube.com/embed/${videoId}?rel=0`
  } catch {
    return null
  }
}
