'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "../../lib/auth-context"
import { ProtectedRoute } from "../../lib/protected-route"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArtistSidebar } from "./components/ArtistSidebar"
import { ArtistProfileForm } from "./components/ArtistProfileForm"
import { ArtistCompletionCard, CompletionItemState, CompletionSection } from "./components/ArtistCompletionCard"
import { ArtistBiographyManager } from "./components/ArtistBiographyManager"
import { ArtistGenresManager } from "./components/ArtistGenresManager"
import { ArtistPhotosManager } from "./components/ArtistPhotosManager"
import { ArtistVideosManager } from "./components/ArtistVideosManager"
import { ArtistTypeSelectorV2, ArtistTypeSelection } from "./components/ArtistTypeSelectorV2"
import { ArtistCrewManager } from "./components/ArtistCrewManager"
import { ArtistPaymentsManager } from "./components/ArtistPaymentsManager"
import { ArtistAuditionsManager } from "./components/ArtistAuditionsManager"
import { ArtistRoyaltySplitsManager } from "./components/ArtistRoyaltySplitsManager"
import { ArtistGigAbilityManager } from "./components/ArtistGigAbilityManager"
import { ArtistGigCalendarManager } from "./components/ArtistGigCalendarManager"
import { ArtistGigInvitesManager } from "./components/ArtistGigInvitesManager"
import { ArtistGigRequestsManager } from "./components/ArtistGigRequestsManager"
import { ArtistGigStatisticsManager } from "./components/ArtistGigStatisticsManager"
import { ArtistBookNewGigManager } from "./components/ArtistBookNewGigManager"
import { ArtistMusicManager } from "./components/ArtistMusicManager"
import { ArtistContractStatusManager } from "./components/ArtistContractStatusManager"
import { ArtistInboxManager } from "./components/ArtistInboxManager"
import { ArtistSettingsManager } from "./components/ArtistSettingsManager"
import { Badge } from "../components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet"
import { Music, Info, Menu, AlertCircle, ArrowRight, CalendarDays, Disc3, FolderKanban, Inbox, LayoutDashboard, BarChart3, Search, Bell, MapPin, Clock3, Radio, ChevronDown, ChevronUp, PlayCircle } from "lucide-react"
import { getArtistTypeConfig, ArtistTypeCapabilities } from "../../data/artist-types"
import { normalizeArtistSubTypeSelections } from "../../lib/artist-subtype-utils"

interface ArtistProfileResponse {
  data: {
    artist_type_id?: number | null
    artist_sub_types?: Record<string, string[] | undefined> | null
    preferred_genre_ids?: string[] | null
    onboarding_completed?: boolean | null
    stage_name?: string | null
  } | null
}

type HomeGigSnapshot = {
  title?: string | null
  startDatetime?: string | null
  venueName?: string | null
  displayAddress?: string | null
  eventType?: string | null
}

type HomeTrackSnapshot = {
  track_title: string
  artist_name: string
  release_title: string
  cover_artwork_url: string | null
  duration_seconds: number
  track_number?: number
  published_at?: string
}

type DashboardSection =
  | 'home'
  | 'profile'
  | 'payments'
  | 'crew'
  | 'auditions'
  | 'royalty'
  | 'gigability'
  | 'gig-bookings'
  | 'gig-reporting'
  | 'gig-negotiations'
  | 'gig-planner'
  | 'gig-statistics'
  | 'gig-calendar'
  | 'gig-create'
  | 'gig-upcoming'
  | 'gig-past'
  | 'gig-invites'
  | 'gig-requests'
  | 'bio'
  | 'genres'
  | 'music-uploads'
  | 'music-catalogue'
  | 'music-statistics'
  | 'logo'
  | 'photos'
  | 'videos'
  | 'music-upload'
  | 'music-manage'
  | 'messages'
  | 'type'
  | 'contract'
  | 'settings'

const DASHBOARD_SECTIONS: DashboardSection[] = [
  'home',
  'profile',
  'payments',
  'crew',
  'auditions',
  'royalty',
  'gigability',
  'gig-bookings',
  'gig-reporting',
  'gig-negotiations',
  'gig-planner',
  'gig-statistics',
  'gig-calendar',
  'gig-create',
  'gig-upcoming',
  'gig-past',
  'gig-invites',
  'gig-requests',
  'bio',
  'genres',
  'music-uploads',
  'music-catalogue',
  'music-statistics',
  'logo',
  'photos',
  'videos',
  'music-upload',
  'music-manage',
  'messages',
  'type',
  'contract',
  'settings',
]

function isDashboardSection(value: string | null): value is DashboardSection {
  return Boolean(value && (DASHBOARD_SECTIONS as string[]).includes(value))
}

function normalizeDashboardLocation(
  section: string | null,
  subSection: string | null
): { section: DashboardSection | null; subSection: string | null } {
  switch (section) {
    case 'view':
      return { section: 'profile', subSection: 'details' }
    case 'edit':
      return { section: 'profile', subSection: 'details' }
    case 'admins':
      return { section: 'crew', subSection: 'manage-team' }
    case 'billing':
      return { section: 'payments', subSection: 'out' }
    default:
      return { section: isDashboardSection(section) ? section : null, subSection }
  }
}

export default function ArtistDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<DashboardSection>('home')
  const [artistTypeSelection, setArtistTypeSelection] = useState<ArtistTypeSelection | null>(null)
  const [capabilities, setCapabilities] = useState<ArtistTypeCapabilities | null>(null)
  const [isSavingArtistType, setIsSavingArtistType] = useState(false)
  const [completionState, setCompletionState] = useState<CompletionItemState[]>([])
  const [completionRefreshKey, setCompletionRefreshKey] = useState(0)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [activeSubSectionKey, setActiveSubSectionKey] = useState<string | null>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [missingArtistSubtype, setMissingArtistSubtype] = useState(false)
  const [isHomeOnboardingOpen, setIsHomeOnboardingOpen] = useState(true)
  const [nextGigSnapshot, setNextGigSnapshot] = useState<HomeGigSnapshot | null>(null)
  const [featuredTrack, setFeaturedTrack] = useState<HomeTrackSnapshot | null>(null)
  const [artistHomeName, setArtistHomeName] = useState<string>('Artist')
  const deepLinkedMessageFolder = searchParams?.get('folder') || null
  const supportedInboxFolders: Record<string, string> = {
    gig_invites: 'gig_invites',
    gig_requests: 'gig_requests',
    venues: 'venue_updates',
    system: 'system',
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _selectedTypeConfig = useMemo(() => {
    if (!artistTypeSelection) return undefined
    return getArtistTypeConfig(artistTypeSelection.artistTypeId)
  }, [artistTypeSelection])

  useEffect(() => {
    if (!user) return

    const loadArtistProfile = async () => {
      try {
        const response = await fetch('/api/artist-profile')
        const result: ArtistProfileResponse = await response.json()

        if (response.status === 401) {
          router.push('/upgrade?type=industry&role=artist')
          return
        }

        if (!result?.data) {
          // Don't force redirect to type section - let users navigate freely
          return
        }

        // Set onboarding completed status
        setOnboardingCompleted(result.data.onboarding_completed ?? false)
        setArtistHomeName(result.data.stage_name?.trim() || 'Artist')

        if (result.data.artist_type_id) {
          const subTypes = normalizeArtistSubTypeSelections(
            result.data.artist_sub_types,
            result.data.artist_type_id
          )
          const hasSubtype = Object.values(subTypes).some((values) => Array.isArray(values) && values.length > 0)

          const selection: ArtistTypeSelection = {
            artistTypeId: result.data.artist_type_id,
            selections: subTypes
          }
          setArtistTypeSelection(selection)
          const config = getArtistTypeConfig(selection.artistTypeId)
          setCapabilities(config?.capabilities ?? null)
          setMissingArtistSubtype(!hasSubtype)

          if (!hasSubtype) {
            setActiveSection('type')
            setActiveSubSectionKey(null)
            router.replace(`${pathname}?section=type`, { scroll: false })
          }
        } else {
          setMissingArtistSubtype(false)
        }
        // Don't force redirect to type section - let users navigate freely
      } catch (error) {
        console.error('Error loading artist profile:', error)
        setArtistHomeName('Artist')
      }
    }

    loadArtistProfile()
  }, [user, router, pathname])

  // Allow users to change their artist type even after onboarding is completed
  // useEffect(() => {
  //   if (onboardingCompleted && activeSection === 'type') {
  //     setActiveSection('profile')
  //   }
  // }, [onboardingCompleted, activeSection])

  useEffect(() => {
    if (!activeSubSectionKey) return

    const [section, subSection] = activeSubSectionKey.split(':')
    if (!section || !subSection || section !== activeSection) return

    const targetId = `artist-${section}-${subSection}`
    let cancelled = false
    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | null = null

    const tryScroll = () => {
      if (cancelled) return
      const target = document.getElementById(targetId)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      if (attempts < 8) {
        attempts += 1
        timer = setTimeout(tryScroll, 120)
      }
    }

    timer = setTimeout(tryScroll, 0)

    return () => {
      cancelled = true
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [activeSection, activeSubSectionKey])

  const replaceDashboardQuery = useCallback((
    section: DashboardSection,
    options?: { folderId?: string | null; subSection?: string | null }
  ) => {
    const params = new URLSearchParams(searchParams?.toString() || '')

    if (section === 'profile') {
      params.delete('section')
      params.delete('folder')
      params.delete('subSection')
    } else {
      params.set('section', section)
      if (section === 'messages') {
        const folderId = options?.folderId
        if (folderId && folderId !== 'all') {
          params.set('folder', folderId)
        } else {
          params.delete('folder')
        }
        params.delete('subSection')
      } else {
        params.delete('folder')
        if (options?.subSection) {
          params.set('subSection', options.subSection)
        } else {
          params.delete('subSection')
        }
      }
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  useEffect(() => {
    const requestedSection = searchParams?.get('section')
    const requestedSubSection = searchParams?.get('subSection')
    const normalized = normalizeDashboardLocation(requestedSection, requestedSubSection)
    if (!normalized.section) return

    if (requestedSection !== normalized.section || requestedSubSection !== normalized.subSection) {
      replaceDashboardQuery(normalized.section, { subSection: normalized.subSection })
      return
    }

    setActiveSection(normalized.section)
    if (normalized.section === 'messages') {
      const folder = searchParams?.get('folder')
      setActiveSubSectionKey(folder ? `messages:${folder}` : null)
      return
    }

    setActiveSubSectionKey(normalized.subSection ? `${normalized.section}:${normalized.subSection}` : null)
  }, [replaceDashboardQuery, searchParams])

  const loadUnreadSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/inbox?audience=artist&summary=true', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload?.success) return
      const unread = typeof payload?.data?.unreadTotal === 'number' ? payload.data.unreadTotal : 0
      setUnreadMessages(unread)
    } catch {
      // keep the current unread count when refresh fails
    }
  }, [])

  useEffect(() => {
    void loadUnreadSummary()
    const interval = window.setInterval(() => {
      void loadUnreadSummary()
    }, 45000)
    return () => window.clearInterval(interval)
  }, [loadUnreadSummary])

  useEffect(() => {
    if (!user) return

    const loadHomeSnapshots = async () => {
      try {
        const [gigsResponse, tracksResponse] = await Promise.all([
          fetch(`/api/artist-gigs?view=calendar&status=pending,confirmed&date_from=${encodeURIComponent(new Date().toISOString())}&limit=1`, { cache: 'no-store' }),
          fetch('/api/music-releases/published-tracks?limit=1', { cache: 'no-store' })
        ])

        const gigsPayload = await gigsResponse.json().catch(() => null)
        const nextGig = Array.isArray(gigsPayload?.data) && gigsPayload.data.length > 0 ? gigsPayload.data[0] : null
        setNextGigSnapshot(nextGig ? {
          title: nextGig.title || null,
          startDatetime: nextGig.startDatetime || null,
          venueName: nextGig.venueName || null,
          displayAddress: nextGig.displayAddress || null,
          eventType: nextGig.eventType || null,
        } : null)

        const tracksPayload = await tracksResponse.json().catch(() => null)
        const topTrack = Array.isArray(tracksPayload?.data) && tracksPayload.data.length > 0 ? tracksPayload.data[0] : null
        setFeaturedTrack(topTrack || null)
      } catch {
        setNextGigSnapshot(null)
        setFeaturedTrack(null)
      }
    }

    void loadHomeSnapshots()
  }, [user])

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section)
    setActiveSubSectionKey(null)
    const defaultSubSection =
      section === 'gig-bookings'
        ? 'upcoming'
        : section === 'gig-reporting'
          ? 'confirm-gig'
          : section === 'gig-negotiations'
            ? 'gig_invites'
            : section === 'gig-planner'
              ? 'calendar'
              : section === 'gig-statistics'
                ? 'performed'
                : section === 'music-uploads'
                  ? 'guide'
                  : section === 'music-catalogue'
                    ? 'published'
                    : section === 'music-statistics'
                      ? 'streams'
      : section === 'music-upload'
        ? 'intro'
        : section === 'music-manage'
          ? 'library'
          : null
    replaceDashboardQuery(section, {
      folderId: section === 'messages' ? deepLinkedMessageFolder : null,
      subSection: defaultSubSection
    })
  }

  const handleSubSectionChange = (section: DashboardSection, subSection: string) => {
    setActiveSection(section)
    setActiveSubSectionKey(`${section}:${subSection}`)
    if (section === 'messages') {
      replaceDashboardQuery(section, { folderId: subSection })
      return
    }
    replaceDashboardQuery(section, { subSection })
  }

  const handleArtistTypeChange = async (selection: ArtistTypeSelection) => {
    setIsSavingArtistType(true)
    try {
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artist_type_id: selection.artistTypeId,
          artist_sub_types: selection.selections
        })
      })

      if (!response.ok) {
        const details = await response.json()
        console.error('Failed to save artist type', details)
        return
      }

      setArtistTypeSelection(selection)
      const config = getArtistTypeConfig(selection.artistTypeId)
      setCapabilities(config?.capabilities ?? null)
      setMissingArtistSubtype(false)
      setCompletionRefreshKey(prev => prev + 1)
      handleSectionChange('profile')
    } catch (error) {
      console.error('Error saving artist type', error)
    } finally {
      setIsSavingArtistType(false)
    }
  }

  const sectionIsEnabled = (section: DashboardSection) => {
    if (!capabilities) {
      // Allow all sections when no capabilities configured yet
      return true
    }

    switch (section) {
      case 'gigability':
      case 'gig-bookings':
      case 'gig-reporting':
      case 'gig-negotiations':
      case 'gig-planner':
      case 'gig-statistics':
      case 'gig-calendar':
      case 'gig-create':
      case 'gig-upcoming':
      case 'gig-past':
      case 'gig-invites':
      case 'gig-requests':
        return capabilities.showGigAbility
      case 'music-upload':
      case 'music-uploads':
      case 'music-catalogue':
      case 'music-statistics':
      case 'music-manage':
        return capabilities.canUploadMusic
      default:
        return true
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sectionHasCompletion = (section: DashboardSection) => {
    const mappedSection: CompletionSection = section as CompletionSection
    return completionState.some(item => item.section === mappedSection && item.completed)
  }

  const completedSectionsForSidebar = useMemo(() => {
    const grouped = completionState.reduce<Record<string, CompletionItemState[]>>((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = []
      }
      acc[item.section].push(item)
      return acc
    }, {})

    return Object.entries(grouped)
      .filter(([, items]) => items.length > 0 && items.every((item) => item.completed))
      .map(([section]) => section)
  }, [completionState])

  const renderGuardedSection = (section: DashboardSection, content: React.ReactNode) => {
    if (sectionIsEnabled(section)) {
      return content
    }

    let message = 'This section is not available for your current artist type.'

    if (['gigability', 'gig-bookings', 'gig-reporting', 'gig-negotiations', 'gig-planner', 'gig-statistics', 'gig-calendar', 'gig-create', 'gig-upcoming', 'gig-past', 'gig-invites', 'gig-requests'].includes(section)) {
      message = 'Gig Manager is hidden for your current artist type. Change your artist type to enable gig operations.'
    } else if (['music-uploads', 'music-catalogue', 'music-statistics', 'music-upload', 'music-manage'].includes(section)) {
      message = 'Music Manager is hidden for your current artist type. Change your artist type to enable music upload and management.'
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-sm text-gray-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-600 mt-0.5" />
        <p>{message}</p>
      </div>
    )
  }

  const renderWithCompletion = (content: React.ReactNode) => (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3">
        {content}
      </div>
      <div className="xl:col-span-1">
        <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
      </div>
    </div>
  )

  const renderScaffoldSection = (
    title: string,
    description: string,
    options?: {
      status?: string
      nextAction?: { label: string; section: DashboardSection; subSection?: string }
    }
  ) => {
    return renderWithCompletion(
      <div className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="max-w-2xl text-sm text-slate-600">{description}</p>
          </div>
          <Badge variant="secondary" className="border-slate-200 bg-slate-100 text-slate-700">
            {options?.status || 'Screen scaffolded'}
          </Badge>
        </div>

        {options?.nextAction && (
          <button
            type="button"
            onClick={() => {
              handleSectionChange(options.nextAction!.section)
              if (options.nextAction?.subSection) {
                handleSubSectionChange(options.nextAction.section, options.nextAction.subSection)
              }
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#6d28d9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5b21b6]"
          >
            {options.nextAction.label}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  const formatHomeDate = (value: string | null | undefined) => {
    if (!value) return 'TBC'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'TBC'
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsed)
  }

  const formatHomeTime = (value: string | null | undefined) => {
    if (!value) return 'Time TBC'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'Time TBC'
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(parsed)
  }

  const formatTrackDuration = (seconds: number | undefined) => {
    if (!seconds || seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderContent = (section: DashboardSection) => {
    const currentSubSection = activeSubSectionKey?.startsWith(`${section}:`)
      ? activeSubSectionKey.split(':')[1]
      : null

    switch (section) {
      case 'home': {
        const completedItems = completionState.filter((item) => item.completed).length
        const totalItems = completionState.length || 18
        const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

        return (
          <div className="space-y-6">
            <div className="hidden">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
            <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.16),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_24%),linear-gradient(180deg,_rgba(64,30,78,0.98),_rgba(55,27,68,0.98))] p-6 text-white shadow-[0_30px_80px_rgba(28,10,46,0.35)]">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                      <div className="text-4xl font-black tracking-tight text-white">
                        Welcome, {artistHomeName}
                      </div>
                      <p className="text-base text-purple-100/80">
                        Here&apos;s what&apos;s happening in your account today.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row xl:w-[30rem] xl:flex-col 2xl:w-[32rem] 2xl:flex-row">
                      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-black/60 px-5 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <Search className="h-5 w-5 text-white/60" />
                        <span className="truncate text-sm text-white/65">Search gigs, releases, messages, or settings</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black/60 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:text-white">
                          <Bell className="h-5 w-5" />
                        </button>
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] text-sm font-bold text-white shadow-lg">
                          {(user?.email?.[0] || 'A').toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-100/60">Next Gig</div>
                      <div className="mt-3 text-3xl font-black text-white">
                        {nextGigSnapshot?.startDatetime ? formatHomeDate(nextGigSnapshot.startDatetime) : 'No confirmed date yet'}
                      </div>
                      <div className="mt-1 text-sm text-purple-100/80">
                        {nextGigSnapshot?.title || 'Your next confirmed performance will appear here.'}
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <CalendarDays className="mb-2 h-5 w-5 text-white/70" />
                          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Date</div>
                          <div className="mt-1 text-lg font-bold text-white">{formatHomeDate(nextGigSnapshot?.startDatetime)}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <Clock3 className="mb-2 h-5 w-5 text-white/70" />
                          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Time</div>
                          <div className="mt-1 text-lg font-bold text-white">{formatHomeTime(nextGigSnapshot?.startDatetime)}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <MapPin className="mb-2 h-5 w-5 text-white/70" />
                          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Venue</div>
                          <div className="mt-1 line-clamp-2 text-sm font-semibold text-white">{nextGigSnapshot?.venueName || 'Venue TBC'}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleSubSectionChange('gig-bookings', 'upcoming')}
                          className="rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/65"
                        >
                          Open Upcoming Gigs
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSectionChange('messages')}
                          className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                        >
                          Open Messages
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-2xl font-black text-white">Chart Highlights</div>
                        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-purple-100/80">
                          Last 7 Days
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Profile Completion</div>
                          <div className="mt-3 text-4xl font-black text-white">{completionPercent}%</div>
                          <div className="mt-2 h-2 rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#ff8fab] via-[#60a5fa] to-[#34d399]" style={{ width: `${completionPercent}%` }} />
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Unread Messages</div>
                          <div className="mt-3 text-4xl font-black text-white">{unreadMessages}</div>
                          <div className="mt-2 text-sm text-purple-100/80">Inbox activity across negotiations and system notices</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Published Releases</div>
                          <div className="mt-3 text-4xl font-black text-white">{featuredTrack ? '1+' : '0'}</div>
                          <div className="mt-2 text-sm text-purple-100/80">Latest published track is ready in the player panel</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-white/45">Workspace</div>
                          <div className="mt-3 text-xl font-black text-white">
                            {artistTypeSelection ? `Artist Type ${artistTypeSelection.artistTypeId}` : 'Setup in progress'}
                          </div>
                          <div className="mt-2 text-sm text-purple-100/80">Profile, gig, music, banking, and message tools grouped in one shell</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <button type="button" onClick={() => handleSectionChange('profile')} className="rounded-[1.5rem] border border-[#f2d7ea]/35 bg-[linear-gradient(180deg,_rgba(251,245,252,0.96),_rgba(247,237,250,0.92))] p-5 text-left shadow-[0_16px_40px_rgba(28,10,46,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(28,10,46,0.22)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7690]">Artist Profile</div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-[#171d34]">Fundamentals</div>
                    <p className="mt-2 text-sm leading-6 text-[#495773]">Artist basics, web links, contract status, and your long-form bio.</p>
                  </button>
                  <button type="button" onClick={() => handleSectionChange('gig-bookings')} className="rounded-[1.5rem] border border-[#f2d7ea]/35 bg-[linear-gradient(180deg,_rgba(251,245,252,0.96),_rgba(247,237,250,0.92))] p-5 text-left shadow-[0_16px_40px_rgba(28,10,46,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(28,10,46,0.22)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7690]">Gig Menu</div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-[#171d34]">Bookings</div>
                    <p className="mt-2 text-sm leading-6 text-[#495773]">Move between upcoming gigs, manual additions, historic gigs, and planner routes.</p>
                  </button>
                  <button type="button" onClick={() => handleSectionChange('music-uploads')} className="rounded-[1.5rem] border border-[#f2d7ea]/35 bg-[linear-gradient(180deg,_rgba(251,245,252,0.96),_rgba(247,237,250,0.92))] p-5 text-left shadow-[0_16px_40px_rgba(28,10,46,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(28,10,46,0.22)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7690]">Music Menu</div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-[#171d34]">Uploads</div>
                    <p className="mt-2 text-sm leading-6 text-[#495773]">Go from intro to guide to workflow, and then into your catalogue and statistics branches.</p>
                  </button>
                  <button type="button" onClick={() => handleSectionChange('messages')} className="rounded-[1.5rem] border border-[#f2d7ea]/35 bg-[linear-gradient(180deg,_rgba(251,245,252,0.96),_rgba(247,237,250,0.92))] p-5 text-left shadow-[0_16px_40px_rgba(28,10,46,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(28,10,46,0.22)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7690]">Message Menu</div>
                    <div className="mt-2 text-2xl font-black tracking-tight text-[#171d34]">Inbox</div>
                    <p className="mt-2 text-sm leading-6 text-[#495773]">Gig negotiations, colleague responses, system notices, and future folder-specific screens.</p>
                  </button>
                </div>

                <div className="rounded-[1.75rem] border border-[#f0cade]/35 bg-[linear-gradient(180deg,_rgba(246,232,250,0.96),_rgba(242,223,247,0.93))] p-5 shadow-[0_18px_44px_rgba(28,10,46,0.18)]">
                  <button
                    type="button"
                    onClick={() => setIsHomeOnboardingOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7690]">Onboarding & Setup</div>
                      <div className="mt-1 text-2xl font-black tracking-tight text-[#171d34]">Profile progress and next actions</div>
                      <p className="mt-2 text-sm leading-6 text-[#4c5971]">
                        Keep this open while you are still completing setup, then collapse it when you want a cleaner dashboard landing screen.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/40 px-4 py-2 text-sm font-semibold text-[#3d4f6a] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                      {isHomeOnboardingOpen ? 'Collapse' : 'Expand'}
                      {isHomeOnboardingOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {isHomeOnboardingOpen && (
                    <div className="mt-5 rounded-[1.5rem] border border-white/45 bg-[linear-gradient(180deg,_rgba(253,249,254,0.82),_rgba(248,241,251,0.78))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-[#171d34]">Your profile is {completionPercent}% complete</div>
                          <div className="mt-1 text-sm text-[#55627a]">{completedItems} of {totalItems} setup items completed</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSectionChange('profile')}
                          className="rounded-full bg-[#3b1b4d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#30163f]"
                        >
                          Continue setup
                        </button>
                      </div>
                      <div className="mt-4 h-3 rounded-full bg-[#d6dceb]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#34d399]" style={{ width: `${completionPercent}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-[#101014] p-5 text-white shadow-[0_30px_80px_rgba(4,4,8,0.45)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Top Track</div>
                    <div className="mt-1 text-sm text-white/65">Latest published music in your always-available player context</div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                    Last 7 Days
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.75rem] bg-[#0f0f14]">
                  {featuredTrack?.cover_artwork_url ? (
                    <img
                      src={featuredTrack.cover_artwork_url}
                      alt={`${featuredTrack.track_title} artwork`}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-br from-[#5b0b16] via-[#23131f] to-black">
                      <Disc3 className="h-14 w-14 text-white/70" />
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <div className="text-3xl font-black leading-tight text-white">
                    {featuredTrack?.track_title || 'No published track yet'}
                  </div>
                  <div className="mt-2 text-sm text-white/65">
                    {featuredTrack ? `${featuredTrack.artist_name} • ${featuredTrack.release_title}` : 'Publish music to surface a featured track here.'}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/40">Duration</div>
                    <div className="mt-2 text-2xl font-black text-white">{formatTrackDuration(featuredTrack?.duration_seconds)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/40">Published</div>
                    <div className="mt-2 text-xl font-black text-white">{formatHomeDate(featuredTrack?.published_at)}</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-[#251232] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Music Uploads</div>
                    <div className="mt-2 text-3xl font-black text-white">{featuredTrack ? 'Ready' : 'Build'}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#251232] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Player</div>
                    <div className="mt-2 inline-flex items-center gap-2 text-lg font-black text-white">
                      <PlayCircle className="h-5 w-5 text-[#f472b6]" />
                      Expand anytime
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSectionChange('music-catalogue')}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#33204a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#41265d]"
                >
                  Open Music Catalogue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )
      }
      case 'logo':
        return renderWithCompletion(<ArtistPhotosManager mode="branding" />)
      case 'photos':
        return renderWithCompletion(<ArtistPhotosManager mode="photos" />)
      case 'videos':
        return renderWithCompletion(<ArtistVideosManager />)
      case 'type':
        return renderWithCompletion(
          <div className="space-y-4">
            <div id="artist-type-selector" className="scroll-mt-28">
              <ArtistTypeSelectorV2
                value={artistTypeSelection}
                onChange={handleArtistTypeChange}
              />
            </div>
            {isSavingArtistType && (
              <div className="text-sm text-gray-500">Saving artist type...</div>
            )}
          </div>
        )
      case 'contract':
        return renderWithCompletion(<ArtistContractStatusManager />)
      case 'settings':
        return <ArtistSettingsManager />
      case 'payments':
        return renderWithCompletion(<ArtistPaymentsManager />)
      case 'crew':
        return renderWithCompletion(<ArtistCrewManager />)
      case 'auditions':
        return renderWithCompletion(<ArtistAuditionsManager />)
      case 'royalty':
        return renderWithCompletion(<ArtistRoyaltySplitsManager />)
      case 'gigability':
        return renderGuardedSection('gigability', (
          renderWithCompletion(<ArtistGigAbilityManager />)
        ))
      case 'gig-bookings':
        return renderGuardedSection('gig-bookings', (
          currentSubSection === 'book-new'
            ? (
                <ArtistBookNewGigManager
                  onBookVenue={() => handleSectionChange('gig-create')}
                  onAddManualGig={() => handleSubSectionChange('gig-bookings', 'add-manually')}
                />
              )
            : currentSubSection === 'add-manually'
            ? renderWithCompletion(
                <ArtistGigCalendarManager
                  defaultView="create"
                  onNavigateToView={(view) => {
                    if (view === 'upcoming') {
                      handleSubSectionChange('gig-bookings', 'upcoming')
                      return
                    }
                    if (view === 'past') {
                      handleSubSectionChange('gig-bookings', 'historic')
                    }
                  }}
                />
              )
            : currentSubSection === 'upcoming'
              ? renderWithCompletion(<ArtistGigCalendarManager defaultView="upcoming" />)
              : currentSubSection === 'historic'
                ? renderWithCompletion(<ArtistGigCalendarManager defaultView="past" />)
                : renderScaffoldSection(
                    'Gig Bookings',
                    'This menu branch is scaffolded so you can create dedicated screens for booking-system gigs, draft gigs, and scheduled-hidden gigs without dead menu links.',
                    {
                      status: currentSubSection ? `Sub-section: ${currentSubSection}` : 'Scaffold ready',
                      nextAction: { label: 'Open Upcoming Gigs', section: 'gig-bookings', subSection: 'upcoming' }
                    }
                  )
        ))
      case 'gig-reporting':
        return renderGuardedSection('gig-reporting', (
          renderScaffoldSection(
            'Gig Reporting',
            'This screen is reserved for post-gig confirmations, venue reviews, and negative reporting workflows. The menu and routing are in place so the dedicated reporting screens can now be built cleanly.'
          )
        ))
      case 'gig-negotiations':
        return renderGuardedSection('gig-negotiations', (
          currentSubSection === 'gig_invites'
            ? renderWithCompletion(<ArtistGigInvitesManager />)
            : currentSubSection === 'gig_requests'
              ? renderWithCompletion(<ArtistGigRequestsManager />)
              : renderScaffoldSection(
                  'Gig Negotiations',
                  'Gig negotiation folders are now grouped under one menu. Invites and requests are live. Confirmation/contract views are scaffolded for the next screen build.',
                  {
                    status: currentSubSection ? `Sub-section: ${currentSubSection}` : 'Mixed live + scaffolded',
                    nextAction: { label: 'Open Gig Invites', section: 'gig-negotiations', subSection: 'gig_invites' }
                  }
                )
        ))
      case 'gig-planner':
        return renderGuardedSection('gig-planner', (
          renderScaffoldSection(
            'Gig Planner',
            'Use this space for the upcoming calendar view, clickable gig dates, and artist unavailability management. The route now exists and is ready for the dedicated planner UI.'
          )
        ))
      case 'gig-statistics':
        return renderGuardedSection('gig-statistics', (
          renderWithCompletion(<ArtistGigStatisticsManager />)
        ))
      case 'gig-calendar':
      case 'gig-create':
        return renderGuardedSection('gig-create', (
          renderWithCompletion(
            <ArtistGigCalendarManager
              defaultView="create"
              onNavigateToView={(view) => {
                if (view === 'upcoming') {
                  handleSubSectionChange('gig-bookings', 'upcoming')
                  return
                }
                if (view === 'past') {
                  handleSubSectionChange('gig-bookings', 'historic')
                }
              }}
            />
          )
        ))
      case 'gig-upcoming':
        return renderGuardedSection('gig-upcoming', (
          renderWithCompletion(<ArtistGigCalendarManager defaultView="upcoming" />)
        ))
      case 'gig-past':
        return renderGuardedSection('gig-past', (
          renderWithCompletion(<ArtistGigCalendarManager defaultView="past" />)
        ))
      case 'gig-invites':
        return renderGuardedSection('gig-invites', (
          renderWithCompletion(<ArtistGigInvitesManager />)
        ))
      case 'gig-requests':
        return renderGuardedSection('gig-requests', (
          renderWithCompletion(<ArtistGigRequestsManager />)
        ))
      case 'bio':
        return renderWithCompletion(<ArtistBiographyManager />)
      case 'genres':
        return renderWithCompletion(<ArtistGenresManager />)
      case 'music-uploads':
        return renderGuardedSection('music-uploads', (
          currentSubSection === 'drafts'
            ? renderScaffoldSection(
                'Draft Uploads',
                'This branch is reserved for a dedicated draft uploads list. The release workflow itself is live under Upload Music, and this route is now ready for a focused draft-management screen.'
              )
            : renderWithCompletion(
                <ArtistMusicManager
                  defaultView={currentSubSection === 'guide' ? 'guide' : 'upload'}
                  forcedSubSection={(currentSubSection as 'guide' | 'workflow') || 'guide'}
                  onSubSectionNavigate={(subSection) => handleSubSectionChange('music-uploads', subSection)}
                />
              )
        ))
      case 'music-catalogue':
        return renderGuardedSection('music-catalogue', (
          renderWithCompletion(
            <ArtistMusicManager
              defaultView="manage"
              forcedSubSection="library"
              onSubSectionNavigate={(subSection) => {
                if (subSection === 'workflow' || subSection === 'guide' || subSection === 'intro') {
                  handleSubSectionChange('music-upload', subSection)
                  return
                }
                handleSubSectionChange('music-catalogue', 'library')
              }}
            />
          )
        ))
      case 'music-statistics':
        return renderGuardedSection('music-statistics', (
          renderScaffoldSection(
            'Music Statistics',
            'This area is ready for dedicated stream, download, and earnings dashboards. The navigation tree is in place so those analytic screens can now be built under stable URLs.'
          )
        ))
      case 'music-upload':
        return renderGuardedSection('music-upload', (
          renderWithCompletion(
            <ArtistMusicManager
              defaultView={activeSubSectionKey === 'music-upload:guide' ? 'guide' : 'upload'}
              forcedSubSection={
                activeSubSectionKey?.startsWith('music-upload:')
                  ? (activeSubSectionKey.split(':')[1] as 'intro' | 'guide' | 'workflow')
                  : 'intro'
              }
              onSubSectionNavigate={(subSection) => handleSubSectionChange('music-upload', subSection)}
            />
          )
        ))
      case 'music-manage':
        return renderGuardedSection('music-manage', (
          renderWithCompletion(
            <ArtistMusicManager
              defaultView="manage"
              forcedSubSection="library"
              onSubSectionNavigate={(subSection) => {
                if (subSection === 'workflow' || subSection === 'guide' || subSection === 'intro') {
                  handleSubSectionChange('music-upload', subSection)
                  return
                }
                handleSubSectionChange('music-manage', 'library')
              }}
            />
          )
        ))
      case 'messages': {
        const selectedMessageFolder = currentSubSection || deepLinkedMessageFolder || null
        const inboxFolderId = selectedMessageFolder ? supportedInboxFolders[selectedMessageFolder] : null

        if (selectedMessageFolder && !inboxFolderId) {
          return renderScaffoldSection(
            'Message Folder',
            'This message folder is scaffolded so a dedicated screen can be created for that conversation type. The core inbox folders already live under Gig Invites, Gig Requests, Venue Messages, and System Messages.',
            {
              status: `Folder: ${selectedMessageFolder}`
            }
          )
        }

        return renderWithCompletion(
          <ArtistInboxManager
            initialFolderId={inboxFolderId || deepLinkedMessageFolder}
            onFolderChange={(folderId) => {
              const sidebarFolder = Object.entries(supportedInboxFolders).find(([, value]) => value === folderId)?.[0] || folderId
              setActiveSubSectionKey(folderId === 'all' ? null : `messages:${sidebarFolder}`)
              replaceDashboardQuery('messages', { folderId: sidebarFolder })
            }}
            onUnreadCountChange={setUnreadMessages}
          />
        )
      }
      default:
        return renderWithCompletion(
          <ArtistProfileForm onProfileSaved={() => setCompletionRefreshKey(prev => prev + 1)} />
        )
    }
  }

  const headerTitleMap: Record<DashboardSection, string> = {
    home: 'Artist Home',
    profile: 'Artist Dashboard',
    contract: 'Contract Status',
    payments: 'Artist Payments',
    crew: 'Artist Crew',
    auditions: 'Auditions & Collaborations',
    logo: 'Logo/Profile Artwork',
    photos: 'Artist Photos',
    videos: 'Artist Videos',
    type: 'Artist Type & Configuration',
    royalty: 'Default Gig Royalty Splits',
    gigability: 'Artist Gig-Ability',
    'gig-bookings': 'Gig Bookings',
    'gig-reporting': 'Gig Reporting',
    'gig-negotiations': 'Gig Negotiations',
    'gig-planner': 'Gig Planner',
    'gig-statistics': 'Gig Statistics',
    'gig-calendar': 'Add / Create Gig',
    'gig-create': 'Add / Create Gig',
    'gig-upcoming': 'Amend Upcoming Gigs',
    'gig-past': 'Past & Unscheduled Gigs',
    'gig-invites': 'Gig Invites',
    'gig-requests': 'Gig Requests',
    bio: 'Artist Biography',
    genres: 'Artist Genres',
    'music-uploads': 'Music Uploads',
    'music-catalogue': 'Music Catalogue',
    'music-statistics': 'Music Statistics',
    'music-upload': 'Music Manager • Upload Music',
    'music-manage': 'Music Manager • Manage Music',
    messages: 'Artist Messages',
    settings: 'Artist Settings'
  }

  const headerSubtitleMap: Record<DashboardSection, string> = {
    home: 'A landing screen for profile progress, gig workload, music activity, and messages',
    profile: 'Manage your artist profile and content',
    contract: 'Manage your record label, publisher, manager, and booking agent relationships',
    payments: 'Configure banking details for payments in and out',
    crew: 'Manage your crew roles, instruments, and band members',
    auditions: 'Advertise auditions and collaboration opportunities',
    logo: 'Upload your logo and profile artwork',
    photos: 'Upload and manage your artist photos',
    videos: 'Embed and manage your artist videos',
    type: 'Select your official artist type and sub-types',
    royalty: 'Set default royalty splits for gigs',
    gigability: 'Set your base location and stage timing preferences',
    'gig-bookings': 'Book new gigs, add manual gigs, and manage upcoming and historic work',
    'gig-reporting': 'Confirm completed gigs and report venue issues',
    'gig-negotiations': 'Track invites, requests, and contract-stage negotiations',
    'gig-planner': 'Use a dedicated calendar and availability planner',
    'gig-statistics': 'Review your location, venue, performance, and earnings statistics',
    'gig-calendar': 'Create a new gig booking',
    'gig-create': 'Create a new gig booking',
    'gig-upcoming': 'Edit or amend your upcoming gig bookings',
    'gig-past': 'View past and unscheduled gigs',
    'gig-invites': 'Review and respond to gig invitations',
    'gig-requests': 'Track direct gig booking requests from venues',
    bio: 'Write and manage your artist biography',
    genres: 'Select your music genres and sub-genres',
    'music-uploads': 'Start new uploads, consult the guide, and resume draft release work',
    'music-catalogue': 'Filter through published and scheduled releases and track inventory',
    'music-statistics': 'Review stream counts, download totals, and music earnings',
    'music-upload': 'Upload new releases and complete submission details',
    'music-manage': 'Manage drafts, pending releases, and published catalog',
    messages: 'Read and manage in-app notifications and updates',
    settings: 'Open artist-level settings and account administration shortcuts'
  }

  return (
    <ProtectedRoute>
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-full max-w-[20rem] border-r border-white/8 bg-[linear-gradient(180deg,_#26122f_0%,_#211028_100%)] p-0 sm:max-w-sm">
          <SheetHeader className="sr-only">
            <SheetTitle>Artist dashboard navigation</SheetTitle>
          </SheetHeader>
          <ArtistSidebar
            activeSection={activeSection}
            activeSubSectionKey={activeSubSectionKey}
            onSectionChange={(section) => {
              handleSectionChange(section)
              setIsMobileNavOpen(false)
            }}
            onSubSectionChange={(section, subSection) => {
              handleSubSectionChange(section, subSection)
              setIsMobileNavOpen(false)
            }}
            capabilities={capabilities}
            unreadMessages={unreadMessages}
            completedSections={completedSectionsForSidebar}
            hideTypeSection={false}
          />
        </SheetContent>

        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,143,163,0.14),_transparent_18%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.10),_transparent_20%),linear-gradient(180deg,_#3d214d_0%,_#331c42_100%)] lg:flex">
          <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:block lg:w-64">
            <ArtistSidebar
              activeSection={activeSection}
              activeSubSectionKey={activeSubSectionKey}
              onSectionChange={handleSectionChange}
              onSubSectionChange={handleSubSectionChange}
              capabilities={capabilities}
              unreadMessages={unreadMessages}
              completedSections={completedSectionsForSidebar}
              hideTypeSection={false}
            />
          </div>

          <div className="flex-1 overflow-y-auto lg:pl-64">
            <div className="p-4 sm:p-6">
              <div className="mx-auto max-w-7xl">
                {activeSection !== 'home' && (
                <div className="mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex w-full items-center gap-3 lg:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsMobileNavOpen(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#24102d] text-white transition hover:bg-[#30163c] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#4a2c5a] lg:hidden"
                        aria-label="Open navigation"
                      >
                        <Menu className="h-5 w-5" />
                      </button>
                      <div>
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">
                          {headerTitleMap[activeSection]}
                        </h1>
                        <p className="text-sm text-gray-300 sm:text-base">
                          {headerSubtitleMap[activeSection]}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="border-[#ff8fa333] bg-[#ff8fa31a] text-[#ffd4dd]">
                      <Music className="mr-2 h-4 w-4" />
                      {headerTitleMap[activeSection]}
                    </Badge>
                  </div>
                </div>
                )}

                <div className="space-y-6 lg:space-y-8">
                  {missingArtistSubtype && (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                      <div>
                        <p className="font-semibold">Artist subtype is still missing.</p>
                        <p>
                          Your artist type is saved, but no subtype is stored yet. Choose your subtype in
                          <span className="font-semibold"> Artist Type &amp; Configuration</span>
                          and save it to complete this required step.
                        </p>
                      </div>
                    </div>
                  )}
                  {renderContent(activeSection)}
                </div>

                <div className="h-20" />
              </div>
            </div>
          </div>
        </div>
      </Sheet>
    </ProtectedRoute>
  )
}
