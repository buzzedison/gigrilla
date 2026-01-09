"use client";

import { useState } from "react";
import { X, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart } from "lucide-react";

interface NowPlayingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NowPlayingModal({ isOpen, onClose }: NowPlayingModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [progress] = useState(67); // 2:14 out of 3:14

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Now Playing Modal */}
      <div className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md transform transition-transform duration-300 ease-in-out lg:right-4 lg:top-4 lg:bottom-4 lg:w-96 lg:max-h-[calc(100vh-2rem)]">
        <div className="flex h-full flex-col rounded-t-2xl lg:rounded-2xl border border-white/10 bg-gradient-to-b from-[#3a2b4d] to-[#2a1b3d] shadow-2xl overflow-hidden">
          {/* Header */}
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

          {/* Album Art */}
          <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-8xl">🎵</div>
            </div>
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a1b3d] via-transparent to-transparent" />
          </div>

          {/* Song Info */}
          <div className="flex-1 px-6 py-4">
            <div className="mb-6">
              <h2 className="mb-1 text-2xl font-bold text-white">All Along</h2>
              <p className="text-sm text-gray-300">Manual Labrador</p>
              <p className="text-xs text-gray-500">Mr. Youth 1995</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                <span>2:14</span>
                <span>3:14</span>
              </div>
              <div className="group relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>
            </div>

            {/* Player Controls */}
            <div className="mb-6 flex items-center justify-center gap-4">
              <button className="text-gray-400 transition hover:text-white">
                <Shuffle className="h-5 w-5" />
              </button>
              <button className="text-gray-400 transition hover:text-white">
                <SkipBack className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" fill="currentColor" />
                ) : (
                  <Play className="h-6 w-6 ml-1" fill="currentColor" />
                )}
              </button>
              <button className="text-gray-400 transition hover:text-white">
                <SkipForward className="h-6 w-6" />
              </button>
              <button className="text-gray-400 transition hover:text-white">
                <Repeat className="h-5 w-5" />
              </button>
            </div>

            {/* Action Buttons */}
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
              <button className="rounded-full bg-white/10 p-2 text-gray-400 transition hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
              </button>
              <button className="rounded-full bg-white/10 p-2 text-gray-400 transition hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
              <button className="rounded-full bg-white/10 p-2 text-gray-400 transition hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Up Next Section */}
          <div className="border-t border-white/10 bg-black/20 px-4 py-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Up Next
            </h3>
            <div className="space-y-2">
              {[
                { title: "Frost Bites", artist: "Switch", time: "3:22" },
                { title: "Highway", artist: "SEU Worship ft. KB", time: "4:15" },
              ].map((track, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/5"
                >
                  <div className="h-10 w-10 flex-shrink-0 rounded bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{track.title}</p>
                    <p className="truncate text-xs text-gray-400">{track.artist}</p>
                  </div>
                  <span className="text-xs text-gray-500">{track.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
