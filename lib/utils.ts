import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// YouTube utility functions

/**
 * Strips playlist/radio/autoplay junk from a YouTube URL, keeping only the video ID.
 * e.g. https://www.youtube.com/watch?v=abc123&list=RD...&start_radio=1 → https://www.youtube.com/watch?v=abc123
 */
export function cleanYouTubeUrl(url: string): string {
  try {
    const urlObj = new URL(url.trim())
    let videoId: string | null = null

    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1).split('/')[0] || null
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v')
    }

    if (!videoId) return url

    // Return a clean URL with only the video ID
    return `https://www.youtube.com/watch?v=${videoId}`
  } catch {
    return url
  }
}

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

    // youtube-nocookie.com reduces tracking & minimises pre/post-roll ad distractions.
    // rel=0 hides related videos; modestbranding=1 removes YouTube logo overlay.
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
  } catch {
    return null
  }
}
