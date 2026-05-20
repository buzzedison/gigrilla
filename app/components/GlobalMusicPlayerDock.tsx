"use client"

import { ChevronDown, ChevronUp, Music2, Pause, Play, SkipBack, SkipForward, Volume2, X } from "lucide-react"
import { useAuth } from "../../lib/auth-context"
import { usePlayer } from "../../lib/player-context"
import { Button } from "./ui/button"
import { usePathname } from "next/navigation"

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

import { useState } from "react"

export function GlobalMusicPlayerDock() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    tracks,
    currentTrackId,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    progress,
    isLoadingTracks,
    tracksError,
    togglePlay,
    goNext,
    goPrevious,
    setCurrentTrackId,
    openModal,
  } = usePlayer()

  const shouldHideDock =
    pathname === "/" || pathname === "/login" || pathname === "/signup"

  if (shouldHideDock) return null

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {isExpanded && (
        <div className="w-[23rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f14]/95 shadow-[0_28px_90px_rgba(6,6,12,0.52)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0))] px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <Music2 className="h-4 w-4 text-[#ff8fa3]" />
              <span className="text-sm font-semibold tracking-[0.08em] text-white/90">Gigrilla Music Player</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="rounded-full p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Hide player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-4">
            {!user && !loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
                Sign in to open the Gigrilla player from any screen.
              </div>
            ) : isLoadingTracks ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
                Loading published tracks...
              </div>
            ) : tracksError ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-200">
                {tracksError}
              </div>
            ) : currentTrack ? (
              <>
                <div className="flex gap-3">
                  <div className="h-24 w-24 overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-[#65122e] via-[#2d1432] to-black shadow-lg">
                    {currentTrack.coverArtworkUrl ? (
                      <img
                        src={currentTrack.coverArtworkUrl}
                        alt={`${currentTrack.title} artwork`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">🎵</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white">{currentTrack.title}</p>
                    <p className="truncate text-sm text-white/72">{currentTrack.artist}</p>
                    <p className="line-clamp-2 text-xs text-white/45">{currentTrack.releaseTitle}</p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-[11px] text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || currentTrack.durationSeconds)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-emerald-400 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
                  <button type="button" onClick={goPrevious} className="rounded-full p-2 text-gray-300 hover:bg-white/10 hover:text-white">
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={togglePlay} className="rounded-full bg-gradient-to-r from-[#ff8fa3] to-[#d946ef] px-4 py-2 text-white hover:opacity-95">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={goNext} className="rounded-full p-2 text-gray-300 hover:bg-white/10 hover:text-white">
                    <SkipForward className="h-4 w-4" />
                  </button>
                </div>

                {/* Open full player button */}
                <button
                  type="button"
                  onClick={() => { setIsExpanded(false); openModal() }}
                  className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 border border-white/10 py-2 text-sm font-medium text-white/80 hover:text-white hover:border-white/20 transition"
                >
                  Open Full Player
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-400">
                    <Volume2 className="h-3.5 w-3.5" />
                    Recent Tracks
                  </div>
                  <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                    {tracks.slice(0, 8).map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => setCurrentTrackId(track.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                          currentTrackId === track.id
                            ? "bg-fuchsia-600/30 text-white"
                            : "bg-white/5 text-gray-200 hover:bg-white/10"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{track.title}</p>
                          <p className="truncate text-xs text-gray-400">{track.artist}</p>
                        </div>
                        <span className="ml-3 shrink-0 text-[11px] text-gray-400">{formatTime(track.durationSeconds)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
                No published tracks available yet.
              </div>
            )}
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="group h-auto rounded-full border border-white/10 bg-[#121018]/96 px-4 py-3 text-left text-white shadow-[0_16px_36px_rgba(4,4,10,0.45)] hover:bg-[#18131f]"
      >
        <span className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#ff8fa3] to-[#d946ef] text-white shadow-lg">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              {isExpanded ? "Hide Player" : isPlaying ? "Now Playing" : currentTrack ? "Paused" : "Open Player"}
            </span>
            <span className="block max-w-[11rem] truncate text-sm font-semibold text-white/90">
              {currentTrack?.title || "Gigrilla Music"}
            </span>
          </span>
          {isExpanded ? <ChevronDown className="h-4 w-4 text-white/70" /> : <ChevronUp className="h-4 w-4 text-white/70" />}
        </span>
      </Button>
    </div>
  )
}
