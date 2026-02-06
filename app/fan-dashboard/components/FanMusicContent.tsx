"use client"

import { useEffect, useMemo, useState } from "react"
import { NowPlayingModal } from "./NowPlayingModal"

interface PublishedRelease {
  id: string
  release_title: string
  release_type: "single" | "ep" | "album" | null
  track_count: number | null
  cover_artwork_url: string | null
  published_at: string | null
  created_at: string
  artist_profiles?: { stage_name?: string } | { stage_name?: string }[] | null
}

interface PublishedTrack {
  id: string
  release_id: string
  release_title: string
  cover_artwork_url: string | null
  artist_name: string
  track_number: number
  track_title: string
  audio_file_url: string
  duration_seconds: number
  published_at: string
}

type SortOption = "newest" | "oldest" | "artist-az" | "title-az"

export function FanMusicContent() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [releases, setReleases] = useState<PublishedRelease[]>([])
  const [tracks, setTracks] = useState<PublishedTrack[]>([])
  const [playerTrackId, setPlayerTrackId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  useEffect(() => {
    let isMounted = true

    const loadPublishedReleases = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [releasesResponse, tracksResponse] = await Promise.all([
          fetch("/api/music-releases/published?limit=48"),
          fetch("/api/music-releases/published-tracks?limit=160")
        ])
        const [releasesResult, tracksResult] = await Promise.all([
          releasesResponse.json(),
          tracksResponse.json()
        ])

        if (!releasesResponse.ok || !releasesResult.success) {
          throw new Error(releasesResult.error || "Failed to load published releases")
        }
        if (!tracksResponse.ok || !tracksResult.success) {
          throw new Error(tracksResult.error || "Failed to load published tracks")
        }

        if (!isMounted) return
        setReleases(releasesResult.data || [])
        setTracks(tracksResult.data || [])
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load published releases")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPublishedReleases()

    return () => {
      isMounted = false
    }
  }, [])

  const getArtistName = (release: PublishedRelease) => {
    if (Array.isArray(release.artist_profiles)) {
      return release.artist_profiles[0]?.stage_name || "Unknown Artist"
    }
    return release.artist_profiles?.stage_name || "Unknown Artist"
  }

  const formatType = (releaseType: PublishedRelease["release_type"]) => {
    if (!releaseType) return "Release"
    return releaseType.toUpperCase()
  }

  const formatDate = (dateValue: string | null, fallback: string) => {
    const dateString = dateValue || fallback
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const sortedReleases = useMemo(() => {
    const clone = [...releases]

    if (sortBy === "artist-az") {
      clone.sort((a, b) => getArtistName(a).localeCompare(getArtistName(b)))
    } else if (sortBy === "title-az") {
      clone.sort((a, b) => a.release_title.localeCompare(b.release_title))
    } else if (sortBy === "oldest") {
      clone.sort((a, b) => {
        const aTime = new Date(a.published_at || a.created_at).getTime()
        const bTime = new Date(b.published_at || b.created_at).getTime()
        return aTime - bTime
      })
    } else {
      clone.sort((a, b) => {
        const aTime = new Date(a.published_at || a.created_at).getTime()
        const bTime = new Date(b.published_at || b.created_at).getTime()
        return bTime - aTime
      })
    }

    return clone
  }, [releases, sortBy])

  const featuredRelease = sortedReleases[0]
  const featuredTrack = tracks[0]

  const openPlayer = (trackId?: string | null) => {
    setPlayerTrackId(trackId || tracks[0]?.id || null)
    setIsPlayerOpen(true)
  }

  const findReleaseTrack = (releaseId: string) => {
    return tracks.find((track) => track.release_id === releaseId) || null
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Published Music</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Sort By:</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="rounded-lg border border-gray-600 bg-[#1a1a2e] px-3 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="newest">Newest Published</option>
              <option value="oldest">Oldest Published</option>
              <option value="artist-az">Artist Name: A - Z</option>
              <option value="title-az">Release Title: A - Z</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-white/10 bg-[#2a1b3d] p-6 text-center text-gray-300">
            Loading published music...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-400/30 bg-red-900/20 p-6 text-center text-red-200">
            {error}
          </div>
        ) : sortedReleases.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-[#2a1b3d] p-6 text-center text-gray-300">
            <p>No published releases yet.</p>
            <p className="mt-2 text-sm text-gray-400">
              If an artist just submitted, it may still be pending admin review.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedReleases.map((release) => (
              <article
                key={release.id}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-[#2a1b3d] transition-all hover:border-purple-500 hover:shadow-lg"
              >
                {release.cover_artwork_url ? (
                  <img
                    src={release.cover_artwork_url}
                    alt={`${release.release_title} artwork`}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                    <div className="flex h-full items-center justify-center text-5xl">🎵</div>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="mb-1 line-clamp-2 font-semibold text-white">{release.release_title}</h3>
                  <p className="text-sm text-gray-300">{getArtistName(release)}</p>
                  <p className="text-xs text-gray-400">
                    {formatType(release.release_type)} • {release.track_count || 0} track{release.track_count === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Published {formatDate(release.published_at, release.created_at)}
                  </p>
                  <button
                    className="mt-3 inline-flex h-8 items-center justify-center rounded-full bg-purple-600 px-3 text-sm text-white transition hover:bg-purple-700"
                    onClick={() => openPlayer(findReleaseTrack(release.id)?.id)}
                  >
                    Open Player
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 w-full rounded-lg border border-white/10 bg-[#2a1b3d] p-6 transition-all hover:border-purple-500 hover:shadow-lg">
          <button
            onClick={() => openPlayer(featuredTrack?.id)}
            className="mb-4 flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
              <span className="text-sm font-medium text-gray-300">Now Playing</span>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            {featuredRelease?.cover_artwork_url ? (
              <img
                src={featuredRelease.cover_artwork_url}
                alt={`${featuredRelease.release_title} artwork`}
                className="h-16 w-16 flex-shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-16 w-16 flex-shrink-0 rounded bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-white">{featuredTrack?.track_title || featuredRelease?.release_title || "No track selected"}</h3>
              <p className="text-sm text-gray-400">{featuredTrack?.artist_name || (featuredRelease ? getArtistName(featuredRelease) : "Published releases appear here")}</p>
              <p className="text-xs text-gray-500">
                {featuredTrack
                  ? `${featuredTrack.release_title} • Track ${featuredTrack.track_number}`
                  : featuredRelease
                    ? `${formatType(featuredRelease.release_type)} • ${featuredRelease.track_count || 0} track${featuredRelease.track_count === 1 ? "" : "s"}`
                    : "Upload and publish from Artist Dashboard"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <NowPlayingModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        tracks={tracks.map((track) => ({
          id: track.id,
          releaseId: track.release_id,
          title: track.track_title,
          artist: track.artist_name,
          releaseTitle: track.release_title,
          coverArtworkUrl: track.cover_artwork_url,
          audioUrl: track.audio_file_url,
          durationSeconds: track.duration_seconds || 0
        }))}
        initialTrackId={playerTrackId}
      />
    </>
  )
}

export default FanMusicContent
