"use client";

import { useState } from "react";
import { NowPlayingModal } from "./NowPlayingModal";

export function FanMusicContent() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Favorite Music</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Sort By:</span>
          <select className="rounded-lg border border-gray-600 bg-[#1a1a2e] px-3 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none">
            <option>Artist Name: A - Z</option>
            <option>Artist Name: Z - A</option>
            <option>Recently Added</option>
            <option>Most Played</option>
          </select>
        </div>
      </div>

      {/* Playlists Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Placeholder Playlist Cards */}
        {[
          { name: "Happy Playlist", artist: "1,500 followers", genre: "Pop, Hip Hop, Industrial Goth" },
          { name: "Love Playlist", artist: "Switch", genre: "Indie, Jazz" },
          { name: "Loss Playlist", artist: "SEU Worship ft. KB", genre: "Rap, Hip Hop" },
          { name: "Motivational Playlist", artist: "SEU Worship ft. KB", genre: "Rap, Hip Hop" },
        ].map((playlist, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border border-white/10 bg-[#2a1b3d] transition-all hover:border-purple-500 hover:shadow-lg"
          >
            {/* Playlist Image */}
            <div className="aspect-square w-full bg-gradient-to-br from-purple-900/50 to-pink-900/50">
              <div className="flex h-full items-center justify-center text-6xl">
                {index === 0 ? "😊" : index === 1 ? "❤️" : index === 2 ? "😢" : "💪"}
              </div>
            </div>

            {/* Playlist Info */}
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-white">{playlist.name}</h3>
                  <p className="text-sm text-gray-400">{playlist.artist}</p>
                  <p className="text-xs text-gray-500">{playlist.genre}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white transition hover:bg-purple-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                  </svg>
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:text-red-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Now Playing Section - Click to expand */}
      <button
        onClick={() => setIsPlayerOpen(true)}
        className="mt-8 w-full rounded-lg border border-white/10 bg-[#2a1b3d] p-6 text-left transition-all hover:border-purple-500 hover:shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
            <span className="text-sm font-medium text-gray-300">Now Playing</span>
          </div>
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 flex-shrink-0 rounded bg-gradient-to-br from-purple-900/50 to-pink-900/50"></div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">All Along</h3>
            <p className="text-sm text-gray-400">Manual Labrador</p>
            <p className="text-xs text-gray-500">Mr. Youth 1995</p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
            <span>2:14</span>
            <span>3:14</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-700">
            <div className="h-full w-2/3 bg-purple-600"></div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <button className="text-gray-400 transition hover:text-white">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white transition hover:bg-purple-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </button>
            <button className="text-gray-400 transition hover:text-white">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
              </svg>
            </button>
          </div>
        </div>
      </button>

      {/* Coming Soon Message */}
      <div className="mt-8 rounded-lg border border-purple-500/30 bg-purple-900/20 p-6 text-center">
        <h3 className="mb-2 text-lg font-semibold text-purple-300">Music Streaming Coming Soon</h3>
        <p className="text-sm text-gray-300">
          We&apos;re building an amazing music experience for you. Your favorite tracks, playlists, and artists will be available here soon!
        </p>
      </div>
    </div>

      {/* Now Playing Modal */}
      <NowPlayingModal isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} />
    </>
  );
}

export default FanMusicContent;
