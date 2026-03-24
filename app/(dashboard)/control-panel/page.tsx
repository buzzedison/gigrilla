"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LayoutDashboard, Loader2, Music, UserRound } from "lucide-react"

import { useAuth } from "../../../lib/auth-context"
import { ProtectedRoute } from "../../../lib/protected-route"

type ArtistProfileResponse = {
  data?: {
    stage_name?: string | null
    onboarding_completed?: boolean | null
  } | null
}

export default function ControlPanelPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'checking' | 'artist' | 'fan'>('checking')

  useEffect(() => {
    if (!user) return

    const routeToWorkspace = async () => {
      try {
        const response = await fetch('/api/artist-profile', { cache: 'no-store' })
        const payload: ArtistProfileResponse = await response.json().catch(() => ({}))
        const hasArtistProfile = Boolean(response.ok && payload?.data)

        if (hasArtistProfile) {
          setStatus('artist')
          router.replace('/artist-dashboard?section=home')
          return
        }

        setStatus('fan')
        router.replace('/fan-dashboard')
      } catch {
        setStatus('fan')
        router.replace('/fan-dashboard')
      }
    }

    void routeToWorkspace()
  }, [router, user])

  const requestedMode = searchParams?.get('mode')

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-[#4a2c5a] px-6">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,_#1f122b,_#3d1d58_55%,_#211234)] p-8 text-white shadow-[0_30px_80px_rgba(40,10,60,0.28)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-purple-100">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Control Panel
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight">Opening your main dashboard.</h1>
          <p className="mt-3 text-sm leading-7 text-purple-100/85">
            Control Panel is now your entry point into the active workspace. Artists are routed into the artist dashboard shell. Fan-only users are routed into the fan dashboard.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className={`rounded-2xl border px-4 py-4 ${status === 'artist' ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-white/10 bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-emerald-300" />
                <div>
                  <div className="text-sm font-semibold text-white">Artist workspace</div>
                  <div className="text-xs text-purple-100/70">Artist Home, gigs, music, crew, and messages</div>
                </div>
              </div>
            </div>
            <div className={`rounded-2xl border px-4 py-4 ${status === 'fan' ? 'border-cyan-300/40 bg-cyan-400/10' : 'border-white/10 bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-cyan-300" />
                <div>
                  <div className="text-sm font-semibold text-white">Fan workspace</div>
                  <div className="text-xs text-purple-100/70">Fan profile, preferences, and listening views</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-purple-100/85">
            <Loader2 className="h-4 w-4 animate-spin" />
            {requestedMode === 'guest'
              ? 'Resolving guest workspace…'
              : status === 'artist'
                ? 'Opening Artist Home…'
                : status === 'fan'
                  ? 'Opening Fan Dashboard…'
                  : 'Checking available profile workspaces…'}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
