'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRightLeft,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  User,
  Wallet,
  Waves,
} from 'lucide-react'
import { useAuth } from '../../../lib/auth-context'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

type ArtistProfileSettingsData = {
  stage_name?: string | null
  artist_type_id?: number | null
  onboarding_completed?: boolean | null
}

type ArtistProfileResponse = {
  data: ArtistProfileSettingsData | null
}

type FanStatusResponse = {
  data?: {
    account_type?: string
    is_complete?: boolean
    completion_percent?: number
  }
}

const formatMemberSince = (value?: string) => {
  if (!value) return 'Unknown'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Unknown'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function ArtistSettingsManager() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [artistProfile, setArtistProfile] = useState<ArtistProfileSettingsData | null>(null)
  const [fanAccountType, setFanAccountType] = useState<string>('guest')
  const [fanCompletionPercent, setFanCompletionPercent] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return

    const loadSettings = async () => {
      setLoading(true)
      try {
        const [artistResponse, fanStatusResponse] = await Promise.all([
          fetch('/api/artist-profile', { cache: 'no-store' }),
          fetch('/api/fan-status', { cache: 'no-store' }),
        ])

        const artistJson: ArtistProfileResponse = await artistResponse.json()
        const fanStatusJson: FanStatusResponse = await fanStatusResponse.json()

        setArtistProfile(artistJson?.data ?? null)
        setFanAccountType(fanStatusJson?.data?.account_type || 'guest')
        setFanCompletionPercent(
          typeof fanStatusJson?.data?.completion_percent === 'number'
            ? fanStatusJson.data.completion_percent
            : null
        )
      } catch (error) {
        console.error('ArtistSettingsManager: Failed to load settings data', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user])

  const stageName = artistProfile?.stage_name?.trim() || 'Artist profile not named yet'
  const onboardingState = artistProfile?.onboarding_completed ? 'Completed' : 'Still in progress'
  const accountEmail = user?.email || 'No email available'
  const memberSince = formatMemberSince(user?.created_at)

  const accountBadges = useMemo(() => {
    return [
      { label: 'Artist Workspace', value: 'Active' },
      { label: 'Fan Membership', value: fanAccountType === 'full' ? 'Full Fan' : 'Guest Fan' },
      { label: 'Artist Setup', value: onboardingState },
    ]
  }, [fanAccountType, onboardingState])

  const handleSignOut = async () => {
    setSignOutError(null)
    setIsSigningOut(true)
    try {
      const result = await signOut()
      if (result.error) {
        setSignOutError(result.error)
        return
      }
      router.push('/login')
    } finally {
      setIsSigningOut(false)
    }
  }

  const actionCards = [
    {
      title: 'Switch Profile',
      description: 'Move between your fan membership and the other profile types you manage.',
      icon: ArrowRightLeft,
      href: '/profile-setup',
      cta: 'Open Profile Switcher',
    },
    {
      title: 'Billing & Payments',
      description: 'Open the artist payment routes you already use for money in and money out.',
      icon: CreditCard,
      href: '/artist-dashboard?section=payments&subSection=out',
      cta: 'Open Payments',
    },
    {
      title: 'Artist Profile View',
      description: 'Open the real artist profile page using the same dashboard shell and live profile data.',
      icon: User,
      href: '/artist-profile',
      cta: 'View Artist Profile',
    },
    {
      title: 'Edit Artist Basics',
      description: 'Go straight to the artist basics editor for name, formed date, hometown, links, and identifiers.',
      icon: Waves,
      href: '/artist-dashboard?section=profile&subSection=details',
      cta: 'Edit Basics',
    },
  ]

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#f6eef8] p-8 text-[#1b1532] shadow-[0_24px_80px_rgba(20,8,34,0.22)]">
        <div className="flex items-center gap-3 text-sm font-medium text-[#5b4e79]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading account settings...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#f6eef8] p-6 shadow-[0_24px_80px_rgba(20,8,34,0.22)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {accountBadges.map((badge) => (
                <Badge key={badge.label} className="border border-[#d9cce8] bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5a4b78]">
                  {badge.label}: {badge.value}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-[#1d1534]">Account Settings</h2>
              <p className="max-w-3xl text-base leading-7 text-[#5b4e79]">
                This page is for account-level administration. It keeps the real controls together: profile switching,
                artist workspace access, payments, support, and sign-out.
              </p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-[#ddd1ea] bg-white/70 px-5 py-4 text-sm text-[#43375c] shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e6f9f]">Current Artist Workspace</p>
            <p className="mt-2 text-xl font-bold text-[#1d1534]">{stageName}</p>
            <p className="mt-1">{accountEmail}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card className="rounded-[2rem] border-white/10 bg-[#f9f3fb] text-[#1d1534] shadow-[0_20px_60px_rgba(20,8,34,0.16)]">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">Account Summary</CardTitle>
            <CardDescription className="text-[#5d5278]">
              Live account and workspace information pulled from your signed-in session and artist profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-[#e2d7ee] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e6f9f]">Login Email</p>
              <p className="mt-2 text-lg font-semibold text-[#1d1534]">{accountEmail}</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#e2d7ee] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e6f9f]">Member Since</p>
              <p className="mt-2 text-lg font-semibold text-[#1d1534]">{memberSince}</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#e2d7ee] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e6f9f]">Artist Profile</p>
              <p className="mt-2 text-lg font-semibold text-[#1d1534]">{stageName}</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#e2d7ee] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e6f9f]">Fan Membership</p>
              <p className="mt-2 text-lg font-semibold text-[#1d1534]">
                {fanAccountType === 'full' ? 'Full Fan Account' : 'Guest Fan Account'}
              </p>
              {typeof fanCompletionPercent === 'number' && (
                <p className="mt-1 text-sm text-[#5d5278]">Fan profile completion: {fanCompletionPercent}%</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/10 bg-[#f4edf8] text-[#1d1534] shadow-[0_20px_60px_rgba(20,8,34,0.16)]">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">Session & Support</CardTitle>
            <CardDescription className="text-[#5d5278]">
              Use the real support route and the real logout action from the authenticated app shell.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.4rem] border border-[#e2d7ee] bg-white/75 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-[#6b5b8f]" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#1d1534]">Account security</p>
                  <p className="text-sm leading-6 text-[#5d5278]">
                    You are signed in with your Gigrilla account. Use the button below to end the current session cleanly.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-[#e2d7ee] bg-white/75 p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="mt-0.5 h-5 w-5 text-[#6b5b8f]" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#1d1534]">Need help?</p>
                  <p className="text-sm leading-6 text-[#5d5278]">
                    Open the member support page for contact details and the current support route.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="outline" className="border-[#ddd1ea] bg-white text-[#3d2b58] hover:bg-[#f7eefc]">
                  <Link href="/contact-details">
                    <ExternalLink className="h-4 w-4" />
                    Open Support
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-[#ddd1ea] bg-white text-[#3d2b58] hover:bg-[#f7eefc]">
                  <a href="mailto:support@gigrilla.app">
                    <Mail className="h-4 w-4" />
                    Email Support
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="rounded-full bg-[#3a214b] px-5 text-white hover:bg-[#48285d]"
              >
                {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                {isSigningOut ? 'Signing out...' : 'Log Out'}
              </Button>
            </div>

            {signOutError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {signOutError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {actionCards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} className="rounded-[1.8rem] border-white/10 bg-[#f7f1fa] text-[#1d1534] shadow-[0_16px_40px_rgba(20,8,34,0.14)]">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efe4f7] text-[#5b3a7a]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl font-black tracking-tight">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-[#5d5278]">{item.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full rounded-full bg-[#4a2b63] text-white hover:bg-[#5b3478]">
                  <Link href={item.href}>
                    {item.title === 'Billing & Payments' ? <Wallet className="h-4 w-4" /> : null}
                    {item.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
