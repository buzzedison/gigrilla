"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useAuth } from "./auth-context"

export type PlayerTrack = {
  id: string
  releaseId: string
  title: string
  artist: string
  releaseTitle: string
  coverArtworkUrl: string | null
  audioUrl: string
  durationSeconds: number
}

type PlayerContextValue = {
  tracks: PlayerTrack[]
  currentTrackId: string | null
  currentTrack: PlayerTrack | null
  currentIndex: number
  isPlaying: boolean
  isModalOpen: boolean
  currentTime: number
  duration: number
  progress: number
  isLoadingTracks: boolean
  tracksError: string | null
  setCurrentTrackId: (id: string | null) => void
  togglePlay: () => void
  goNext: () => void
  goPrevious: () => void
  seekTo: (seconds: number) => void
  openModal: (trackId?: string | null) => void
  closeModal: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider")
  return ctx
}

// Returns a localStorage key scoped to a specific user so no cross-user bleed
function trackKey(userId: string) {
  return `gigrilla-player-track:${userId}`
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [tracks, setTracks] = useState<PlayerTrack[]>([])
  const [currentTrackId, setCurrentTrackIdRaw] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoadingTracks, setIsLoadingTracks] = useState(false)
  const [tracksError, setTracksError] = useState<string | null>(null)

  // Stable refs so effects / callbacks always see fresh values
  const currentTrackIdRef = useRef<string | null>(null)
  const isPlayingRef = useRef(false)
  const tracksRef = useRef<PlayerTrack[]>([])
  const pendingPlayRef = useRef(false) // set to true when openModal triggers a new track

  useEffect(() => { currentTrackIdRef.current = currentTrackId }, [currentTrackId])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { tracksRef.current = tracks }, [tracks])

  // ── Reset everything when user signs out ─────────────────────────────────────
  useEffect(() => {
    if (authLoading) return // still resolving — don't act yet

    if (!user) {
      // Signed out: wipe all player state so the next user starts clean
      audioRef.current?.pause()
      setTracks([])
      setCurrentTrackIdRaw(null)
      currentTrackIdRef.current = null
      setIsPlaying(false)
      setIsModalOpen(false)
      setCurrentTime(0)
      setDuration(0)
      setTracksError(null)
      pendingPlayRef.current = false
    }
  }, [authLoading, user])

  // ── Load tracks + restore persisted track when a specific user logs in ───────
  // currentTrackId intentionally NOT in deps — we never want a track-change to re-fetch
  useEffect(() => {
    if (authLoading || !user) return

    let isMounted = true
    const load = async () => {
      try {
        setIsLoadingTracks(true)
        setTracksError(null)

        const res = await fetch("/api/music-releases/published-tracks?limit=160", { cache: "no-store" })
        const result = await res.json()
        if (!res.ok || !result.success) throw new Error(result.error || "Failed to load tracks")
        if (!isMounted) return

        const rawTracks = (result.data || []) as Array<{
          id: string
          release_id: string
          release_title: string
          cover_artwork_url: string | null
          artist_name: string
          track_title: string
          audio_file_url: string
          duration_seconds: number
        }>

        const playerTracks: PlayerTrack[] = rawTracks.map((t) => ({
          id: t.id,
          releaseId: t.release_id,
          title: t.track_title,
          artist: t.artist_name,
          releaseTitle: t.release_title,
          coverArtworkUrl: t.cover_artwork_url,
          audioUrl: t.audio_file_url,
          durationSeconds: t.duration_seconds || 0,
        }))

        setTracks(playerTracks)

        // Restore the track this specific user had selected, keyed by their user ID
        let storedId: string | null = null
        try {
          storedId = window.localStorage.getItem(trackKey(user.id))
        } catch { /* ignore */ }

        const storedExists = playerTracks.some((t) => t.id === storedId)
        // If no stored track or it no longer exists, don't auto-select anything —
        // the dock shows "Open Player" and nothing is pre-loaded.
        const nextId = storedExists ? storedId : null
        setCurrentTrackIdRaw(nextId)
        currentTrackIdRef.current = nextId
      } catch (err) {
        if (!isMounted) return
        setTracksError(err instanceof Error ? err.message : "Failed to load tracks")
      } finally {
        if (isMounted) setIsLoadingTracks(false)
      }
    }

    void load()
    return () => { isMounted = false }
  }, [authLoading, user])

  // ── Persist current track for THIS user only ─────────────────────────────────
  useEffect(() => {
    if (!user) return // never write to localStorage when signed out
    try {
      if (currentTrackId) {
        window.localStorage.setItem(trackKey(user.id), currentTrackId)
      } else {
        window.localStorage.removeItem(trackKey(user.id))
      }
    } catch { /* ignore */ }
  }, [user, currentTrackId])

  // ── Derived values ───────────────────────────────────────────────────────────
  const currentTrack = useMemo(
    () => tracks.find((t) => t.id === currentTrackId) ?? null,
    [tracks, currentTrackId],
  )

  const currentIndex = useMemo(
    () => tracks.findIndex((t) => t.id === currentTrackId),
    [tracks, currentTrackId],
  )

  // ── Audio: reload + optional auto-play when track changes ───────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    audio.load()
    setCurrentTime(0)
    setDuration(currentTrack.durationSeconds || 0)

    const shouldPlay = isPlayingRef.current || pendingPlayRef.current
    pendingPlayRef.current = false

    if (shouldPlay) {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [currentTrack?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Audio event listeners ────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0)
    const onLoadedMetadata = () => setDuration(audio.duration || 0)
    const onPause = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    const onEnded = () => {
      const t = tracksRef.current
      const idx = t.findIndex((tr) => tr.id === currentTrackIdRef.current)
      if (t.length <= 1 || idx < 0) {
        setIsPlaying(false)
        return
      }
      const nextId = t[(idx + 1) % t.length].id
      setCurrentTrackIdRaw(nextId)
      currentTrackIdRef.current = nextId
    }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("ended", onEnded)
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("ended", onEnded)
    }
  }, []) // intentionally empty — listeners are stable, refs stay current

  // ── Playback controls ────────────────────────────────────────────────────────
  const setCurrentTrackId = useCallback((id: string | null) => {
    setCurrentTrackIdRaw(id)
    currentTrackIdRef.current = id
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrackIdRef.current) return
    if (isPlayingRef.current) {
      audio.pause()
    } else {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [])

  const goNext = useCallback(() => {
    const t = tracksRef.current
    if (t.length === 0) return
    const idx = t.findIndex((tr) => tr.id === currentTrackIdRef.current)
    const nextId = t[idx >= 0 ? (idx + 1) % t.length : 0].id
    setCurrentTrackId(nextId)
  }, [setCurrentTrackId])

  const goPrevious = useCallback(() => {
    const t = tracksRef.current
    if (t.length === 0) return
    const idx = t.findIndex((tr) => tr.id === currentTrackIdRef.current)
    const prevId = t[idx > 0 ? idx - 1 : t.length - 1].id
    setCurrentTrackId(prevId)
  }, [setCurrentTrackId])

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = seconds
    setCurrentTime(seconds)
  }, [])

  const openModal = useCallback(
    (trackId?: string | null) => {
      if (trackId != null && trackId !== currentTrackIdRef.current) {
        // Different track: update + queue auto-play
        setCurrentTrackId(trackId)
        pendingPlayRef.current = true
      } else {
        // Same track (or no specific track): just play if paused
        const audio = audioRef.current
        if (audio && !isPlayingRef.current) {
          audio.play().catch(() => setIsPlaying(false))
        }
      }
      setIsModalOpen(true)
    },
    [setCurrentTrackId],
  )

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0

  const value = useMemo<PlayerContextValue>(
    () => ({
      tracks,
      currentTrackId,
      currentTrack,
      currentIndex,
      isPlaying,
      isModalOpen,
      currentTime,
      duration,
      progress,
      isLoadingTracks,
      tracksError,
      setCurrentTrackId,
      togglePlay,
      goNext,
      goPrevious,
      seekTo,
      openModal,
      closeModal,
    }),
    [
      tracks,
      currentTrackId,
      currentTrack,
      currentIndex,
      isPlaying,
      isModalOpen,
      currentTime,
      duration,
      progress,
      isLoadingTracks,
      tracksError,
      setCurrentTrackId,
      togglePlay,
      goNext,
      goPrevious,
      seekTo,
      openModal,
      closeModal,
    ],
  )

  return (
    <PlayerContext.Provider value={value}>
      {/* Single global audio element — the only audio source */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl ?? undefined}
        preload="metadata"
        style={{ display: "none" }}
      />
      {children}
    </PlayerContext.Provider>
  )
}
