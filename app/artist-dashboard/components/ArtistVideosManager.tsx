'use client'

import { useState, useEffect, useCallback } from 'react'
import { Video, Trash2, Play, Youtube, Settings, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'

interface VideoItem {
  id: string
  title: string
  video_url: string
  thumbnail_url: string | null
  video_type: string
  is_featured: boolean
  sort_order: number
  created_at: string
}

export function ArtistVideosManager() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newYoutubeUrl, setNewYoutubeUrl] = useState('')
  const [newVideoTitle, setNewVideoTitle] = useState('')
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Manage dialog state
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/artist-videos')
      const result = await response.json()

      if (result.error) {
        setError(result.error)
        return
      }

      setVideos(result.data || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch videos:', err)
      setError('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  // Update preview when URL changes
  useEffect(() => {
    const videoId = extractVideoId(newYoutubeUrl)
    if (videoId) {
      setPreviewThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
    } else {
      setPreviewThumbnail(null)
    }
  }, [newYoutubeUrl])

  const handleUploadVideo = async () => {
    if (!newYoutubeUrl.trim() || !newVideoTitle.trim()) return

    const videoId = extractVideoId(newYoutubeUrl)
    if (!videoId) {
      setError('Invalid YouTube URL. Please use a valid YouTube link.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/artist-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newVideoTitle.trim(),
          video_url: newYoutubeUrl.trim(),
          thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        })
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error)
        return
      }

      // Add to local state
      setVideos(prev => [...prev, result.data])
      setNewYoutubeUrl('')
      setNewVideoTitle('')
      setPreviewThumbnail(null)
    } catch (err) {
      console.error('Failed to upload video:', err)
      setError('Failed to upload video')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const response = await fetch(`/api/artist-videos?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error)
        return
      }

      setVideos(prev => prev.filter(v => v.id !== id))
      setManageDialogOpen(false)
      setSelectedVideo(null)
    } catch (err) {
      console.error('Failed to delete video:', err)
      setError('Failed to delete video')
    }
  }

  const handleUpdateVideo = async () => {
    if (!selectedVideo || !editTitle.trim()) return

    setSaving(true)

    try {
      const response = await fetch('/api/artist-videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedVideo.id,
          title: editTitle.trim()
        })
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error)
        return
      }

      setVideos(prev => prev.map(v => 
        v.id === selectedVideo.id ? { ...v, title: editTitle.trim() } : v
      ))
      setManageDialogOpen(false)
      setSelectedVideo(null)
    } catch (err) {
      console.error('Failed to update video:', err)
      setError('Failed to update video')
    } finally {
      setSaving(false)
    }
  }

  const openManageDialog = (video: VideoItem) => {
    setSelectedVideo(video)
    setEditTitle(video.title)
    setManageDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Artist Profile Videos</h1>
        <p className="text-gray-600 text-sm">
          Add your Artist Profile Videos to showcase your performances. Links must be YouTube Embed Links.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-xs text-red-500 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Youtube className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Add Your Artist Profile Videos</h2>
          </div>
          <p className="text-gray-500 text-sm">
            These are Artist Profile videos to showcase your performances. Links must be YouTube Embed Links.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paste YouTube Embed Link
              </label>
              <Input
                value={newYoutubeUrl}
                onChange={(e) => setNewYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name Your Video
              </label>
              <Input
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                placeholder="Enter a title for your video"
                className="text-sm"
              />
            </div>

            <Button
              onClick={handleUploadVideo}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!newYoutubeUrl.trim() || !newVideoTitle.trim() || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                '+ Upload Video'
              )}
            </Button>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Youtube className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">YouTube Integration</p>
                  <p className="text-xs text-gray-600">Supports youtube.com and youtu.be links</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex flex-col justify-center">
            {previewThumbnail ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Preview</p>
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                  <Image
                    src={previewThumbnail}
                    alt="Video preview"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    onError={() => setPreviewThumbnail(null)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-7 h-7 text-gray-900 ml-1" />
                    </div>
                  </div>
                </div>
                {newVideoTitle && (
                  <p className="mt-2 text-sm font-medium text-gray-900 truncate">{newVideoTitle}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm">Enter a YouTube URL to preview your video</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">Your Artist Videos</h2>
            <Badge variant="outline" className="text-xs">
              {videos.length} video{videos.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No videos uploaded yet</p>
            <p className="text-gray-400 text-xs mt-1">Videos will appear here once uploaded</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((video) => {
              const videoId = extractVideoId(video.video_url)
              const thumbnail = video.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null)

              return (
                <div key={video.id} className="group">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={video.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-gray-900 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Video info */}
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-xs"
                      onClick={() => openManageDialog(video)}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Manage Video Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Video</DialogTitle>
            <DialogDescription>
              Edit or delete this video from your profile.
            </DialogDescription>
          </DialogHeader>

          {selectedVideo && (
            <div className="space-y-4 py-4">
              {/* Thumbnail Preview */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                {selectedVideo.thumbnail_url ? (
                  <Image
                    src={selectedVideo.thumbnail_url}
                    alt={selectedVideo.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Edit Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Title
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter video title"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedVideo && handleDeleteVideo(selectedVideo.id)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Video
            </Button>
            <Button
              onClick={handleUpdateVideo}
              disabled={saving || !editTitle.trim()}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
