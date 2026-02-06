"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Heart } from "lucide-react"

export interface PlayerTrack {
  id: string
  releaseId: string
  title: string
  artist: string
  releaseTitle: string
  coverArtworkUrl: string | null
  audioUrl: string
  durationSeconds: number
}

interface NowPlayingModalProps {
  isOpen: boolean
  onClose: () => void
  tracks: PlayerTrack[]
  initialTrackId?: string | null
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function NowPlayingModal({ isOpen, onClose, tracks, initialTrackId }: NowPlayingModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const hasTracks = tracks.length > 0
  const currentTrack = hasTracks ? tracks[currentIndex] : null

  const upNext = useMemo(
    () => tracks.filter((track) => track.id !== currentTrack?.id).slice(0, 4),
    [tracks, currentTrack?.id]
  )

  useEffect(() => {
    if (!isOpen) return
    if (!hasTracks) return

    const requestedIndex = initialTrackId
      ? tracks.findIndex((track) => track.id === initialTrackId)
      : 0

    setCurrentIndex(requestedIndex >= 0 ? requestedIndex : 0)
    setCurrentTime(0)
  }, [isOpen, hasTracks, tracks, initialTrackId])

  useEffect(() => {
    if (!isOpen) return
    if (!currentTrack) return
    if (!audioRef.current) return

    audioRef.current.load()
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false))
  }, [isOpen, currentTrack?.id, currentTrack])

  useEffect(() => {
    if (!isOpen) return
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0)
    const onLoadedMetadata = () => setDuration(audio.duration || currentTrack?.durationSeconds || 0)
    const onEnded = () => {
      if (tracks.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % tracks.length)
      } else {
        setIsPlaying(false)
      }
    }
    const onPause = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("play", onPlay)

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("play", onPlay)
    }
  }, [isOpen, tracks.length, currentTrack?.durationSeconds])

  if (!isOpen) return null

  const togglePlayPause = async () => {
    if (!audioRef.current || !currentTrack) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  const playPrevious = () => {
    if (!hasTracks) return
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
  }

  const playNext = () => {
    if (!hasTracks) return
    setCurrentIndex((prev) => (prev + 1) % tracks.length)
  }

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0

  const seekTo = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const ratio = Math.max(0, Math.min(clickX / rect.width, 1))
    const nextTime = ratio * duration
    audioRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md transform transition-transform duration-300 ease-in-out lg:right-4 lg:bottom-4 lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-96">
        <div className="flex h-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-gradient-to-b from-[#3a2b4d] to-[#2a1b3d] shadow-2xl lg:rounded-2xl">
          <audio
            ref={audioRef}
            src={currentTrack?.audioUrl}
            preload="metadata"
          />

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-semibold text-white">Now Playing</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {currentTrack ? (
            <>
              <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                {currentTrack.coverArtworkUrl ? (
                  <img
                    src={currentTrack.coverArtworkUrl}
                    alt={`${currentTrack.title} artwork`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl">🎵</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a1b3d] via-transparent to-transparent" />
              </div>

              <div className="flex-1 px-6 py-4">
                <div className="mb-6">
                  <h2 className="mb-1 text-2xl font-bold text-white">{currentTrack.title}</h2>
                  <p className="text-sm text-gray-300">{currentTrack.artist}</p>
                  <p className="text-xs text-gray-500">{currentTrack.releaseTitle}</p>
                </div>

                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || currentTrack.durationSeconds)}</span>
                  </div>
                  <div
                    className="group relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20"
                    onClick={seekTo}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
                    />
                  </div>
                </div>

                <div className="mb-6 flex items-center justify-center gap-4">
                  <button className="text-gray-400 transition hover:text-white" onClick={playPrevious}>
                    <SkipBack className="h-6 w-6" />
                  </button>
                  <button
                    onClick={togglePlayPause}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" fill="currentColor" />
                    ) : (
                      <Play className="ml-1 h-6 w-6" fill="currentColor" />
                    )}
                  </button>
                  <button className="text-gray-400 transition hover:text-white" onClick={playNext}>
                    <SkipForward className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`rounded-full p-2 transition ${
                      isLiked
                        ? "bg-red-500/20 text-red-500"
                        : "bg-white/10 text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              {upNext.length > 0 && (
                <div className="border-t border-white/10 bg-black/20 px-4 py-3">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Up Next
                  </h3>
                  <div className="space-y-2">
                    {upNext.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => {
                          const nextIndex = tracks.findIndex((item) => item.id === track.id)
                          if (nextIndex >= 0) {
                            setCurrentIndex(nextIndex)
                          }
                        }}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-white/5"
                      >
                        {track.coverArtworkUrl ? (
                          <img src={track.coverArtworkUrl} alt={track.title} className="h-10 w-10 flex-shrink-0 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-10 flex-shrink-0 rounded bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{track.title}</p>
                          <p className="truncate text-xs text-gray-400">{track.artist}</p>
                        </div>
                        <span className="text-xs text-gray-500">{formatTime(track.durationSeconds)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-gray-300">
              No playable published tracks available yet.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
