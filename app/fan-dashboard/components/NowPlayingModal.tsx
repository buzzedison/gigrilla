"use client"

import { X, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { usePathname } from "next/navigation"
import { usePlayer } from "../../../lib/player-context"

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function NowPlayingModal() {
  const pathname = usePathname()
  const {
    tracks,
    currentTrack,
    currentTrackId,
    isPlaying,
    isModalOpen,
    currentTime,
    duration,
    progress,
    togglePlay,
    goNext,
    goPrevious,
    seekTo,
    setCurrentTrackId,
    closeModal,
  } = usePlayer()

  if (!isModalOpen || pathname?.startsWith("/artist-dashboard")) return null

  const upNext = tracks
    .filter((t) => t.id !== currentTrack?.id)
    .slice(0, 4)

  const seekClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min((event.clientX - rect.left) / rect.width, 1))
    seekTo(ratio * duration)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />

      <div className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md transform transition-transform duration-300 ease-in-out lg:right-4 lg:bottom-4 lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-96">
        <div className="flex h-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-gradient-to-b from-[#3a2b4d] to-[#2a1b3d] shadow-2xl lg:rounded-2xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-semibold text-white">
                {isPlaying ? "Now Playing" : "Player Ready"}
              </span>
            </div>
            <button
              onClick={closeModal}
              className="rounded-full p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {currentTrack ? (
            <>
              {/* Artwork */}
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

              {/* Controls */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Track info */}
                <div className="mb-6">
                  <h2 className="mb-1 text-2xl font-bold text-white">{currentTrack.title}</h2>
                  <p className="text-sm text-gray-300">{currentTrack.artist}</p>
                  <p className="text-xs text-gray-500">{currentTrack.releaseTitle}</p>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || currentTrack.durationSeconds)}</span>
                  </div>
                  <div
                    className="group relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20"
                    onClick={seekClick}
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

                {/* Play controls */}
                <div className="mb-6 flex items-center justify-center gap-4">
                  <button className="text-gray-400 transition hover:text-white" onClick={goPrevious}>
                    <SkipBack className="h-6 w-6" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" fill="currentColor" />
                    ) : (
                      <Play className="ml-1 h-6 w-6" fill="currentColor" />
                    )}
                  </button>
                  <button className="text-gray-400 transition hover:text-white" onClick={goNext}>
                    <SkipForward className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Up next */}
              {upNext.length > 0 && (
                <div className="border-t border-white/10 bg-black/20 px-4 py-3">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Up Next
                  </h3>
                  <div className="space-y-2">
                    {upNext.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => setCurrentTrackId(track.id)}
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
