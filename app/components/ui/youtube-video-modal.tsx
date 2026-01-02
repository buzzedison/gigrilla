'use client'

import { Dialog, DialogContent, DialogTitle } from './dialog'
import { getYouTubeEmbedUrl } from '../../../lib/utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface YouTubeVideoModalProps {
  videoUrl: string | null
  isOpen: boolean
  onClose: () => void
}

export function YouTubeVideoModal({ videoUrl, isOpen, onClose }: YouTubeVideoModalProps) {
  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Video Player</DialogTitle>
        </VisuallyHidden>
        {embedUrl ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="aspect-video w-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Unable to load video</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
