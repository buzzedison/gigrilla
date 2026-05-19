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
import { ArtistGigConfirmationsManager } from "./components/ArtistGigConfirmationsManager"
import { ArtistGigPlannerManager } from "./components/ArtistGigPlannerManager"
import { ArtistGigReportingManager } from "./components/ArtistGigReportingManager"
import { ArtistGigStatisticsManager } from "./components/ArtistGigStatisticsManager"
import { ArtistBookNewGigManager } from "./components/ArtistBookNewGigManager"
import { ArtistMusicManager, type MusicManagerForcedSubSection } from "./components/ArtistMusicManager"
import { ArtistContractStatusManager } from "./components/ArtistContractStatusManager"
import { ArtistInboxManager } from "./components/ArtistInboxManager"
import { ArtistSettingsManager } from "./components/ArtistSettingsManager"
import { Badge } from "../components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet"
import { Music, Info, Menu, AlertCircle, ArrowRight, CalendarDays, Disc3, FolderKanban, Inbox, LayoutDashboard, BarChart3, Search, Bell, MapPin, Clock3, Radio, ChevronDown, ChevronUp, PlayCircle, CheckCircle2 } from "lucide-react"
import { getArtistTypeConfig, ArtistTypeCapabilities } from "../../data/artist-types"
import { normalizeArtistSubTypeSelections } from "../../lib/artist-subtype-utils"

const DESKTOP_SIDEBAR_COLLAPSED_KEY = 'gigrilla-artist-dashboard-sidebar-collapsed:v1'
const ONBOARDING_DISMISSED_KEY = 'gigrilla-artist-onboarding-dismissed:v1'

interface ArtistProfileResponse {
  data: {
    artist_type_id?: number | null
    artist_sub_types?: Record<string, string[] | undefined> | null
    preferred_genre_ids?: string[] | null
    onboarding_completed?: boolean | null
    stage_name?: string | null
    company_name?: string | null
    location_details?: Record<string, unknown> | null
    contact_details?: Record<string, unknown> | null
    gigs_performed?: number | null
    facebook_url?: string | null
    instagram_url?: string | null
    x_url?: string | null
    youtube_url?: string | null
  } | null
}

const getRecordString = (record: unknown, key: string) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return ''
  const value = (record as Record<string, unknown>)[key]
  return typeof value === 'string' ? value.trim() : ''
}

const resolveArtistDashboardName = (
  profile: NonNullable<ArtistProfileResponse['data']>,
  userMetadata?: Record<string, unknown>
) => {
  return (
    profile.stage_name?.trim() ||
    getRecordString(profile.location_details, 'artistStageName') ||
    getRecordString(profile.location_details, 'artist_stage_name') ||
    getRecordString(profile.location_details, 'stageName') ||
    profile.company_name?.trim() ||
    getRecordString(userMetadata, 'artistStageName') ||
    getRecordString(userMetadata, 'stage_name') ||
    'Artist'
  )
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

type HomeDashboardStats = {
  upcomingGigs: number | null
  confirmedGigs: number | null
  completedGigs: number | null
  publishedReleases: number | null
  publishedTracks: number | null
  manualGigsPerformed: number | null
  socialLinks: {
    facebook: boolean
    instagram: boolean
    x: boolean
    youtube: boolean
  }
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
  const [messageFolderCounts, setMessageFolderCounts] = useState<Record<string, number>>({})
  const [gigNegotiationCounts, setGigNegotiationCounts] = useState<Record<string, number>>({})
  const [gigBookingCounts, setGigBookingCounts] = useState<Record<string, number>>({})
  const [auditionAdvertCounts, setAuditionAdvertCounts] = useState<Record<string, number>>({})
  const [missingArtistSubtype, setMissingArtistSubtype] = useState(false)
  const [isHomeOnboardingOpen, setIsHomeOnboardingOpen] = useState(true)
  const [isOnboardingPermanentlyDismissed, setIsOnboardingPermanentlyDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true'
  })
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(DESKTOP_SIDEBAR_COLLAPSED_KEY) === 'true'
  })
  const [nextGigSnapshot, setNextGigSnapshot] = useState<HomeGigSnapshot | null>(null)
  const [featuredTrack, setFeaturedTrack] = useState<HomeTrackSnapshot | null>(null)
  const [artistHomeName, setArtistHomeName] = useState<string>('Artist')
  const [homeStats, setHomeStats] = useState<HomeDashboardStats>({
    upcomingGigs: null,
    confirmedGigs: null,
    completedGigs: null,
    publishedReleases: null,
    publishedTracks: null,
    manualGigsPerformed: null,
    socialLinks: {
      facebook: false,
      instagram: false,
      x: false,
      youtube: false,
    },
  })
  const deepLinkedMessageFolder = searchParams?.get('folder') || null
  const supportedInboxFolders: Record<string, string> = {
    gig_invites: 'gig_invites',
    gig_requests: 'gig_requests',
    confirmations: 'confirmations',
    colleagues: 'colleagues',
    auditions: 'auditions',
    fans: 'fans',
    artists: 'artists',
    venues: 'venues',
    venue_updates: 'venues',
    services: 'services',
    pros: 'pros',
    system: 'system',
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(DESKTOP_SIDEBAR_COLLAPSED_KEY, String(isDesktopSidebarCollapsed))
  }, [isDesktopSidebarCollapsed])

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
        setArtistHomeName(resolveArtistDashboardName(result.data, user.user_metadata))
        setHomeStats((prev) => ({
          ...prev,
          manualGigsPerformed: typeof result.data?.gigs_performed === 'number' ? result.data.gigs_performed : null,
          socialLinks: {
            facebook: Boolean(result.data?.facebook_url?.trim()),
            instagram: Boolean(result.data?.instagram_url?.trim()),
            x: Boolean(result.data?.x_url?.trim()),
            youtube: Boolean(result.data?.youtube_url?.trim()),
          },
        }))

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
      const [messageResponse, gigResponse, auditionResponse] = await Promise.all([
        fetch('/api/messages?audience=artist&summary=true', { cache: 'no-store' }),
        fetch('/api/artist-gigs?summary=true', { cache: 'no-store' }),
        fetch('/api/artist-auditions?summary=true', { cache: 'no-store' }),
      ])

      const messagePayload = await messageResponse.json()
      if (messageResponse.ok && messagePayload?.success) {
        const unread = typeof messagePayload?.data?.unreadTotal === 'number' ? messagePayload.data.unreadTotal : 0
        const counts = Array.isArray(messagePayload?.data?.folders)
          ? Object.fromEntries(
              messagePayload.data.folders
                .map((folder: { id?: unknown; total?: unknown }) => [
                  typeof folder.id === 'string' ? folder.id : '',
                  typeof folder.total === 'number' ? folder.total : 0
                ])
                .filter(([id]: [string, number]) => id)
            )
          : {}
        setUnreadMessages(unread)
        setMessageFolderCounts(counts)
      }

      const gigPayload = await gigResponse.json()
      if (gigResponse.ok && gigPayload?.success) {
        const counts = gigPayload?.data?.counts && typeof gigPayload.data.counts === 'object'
          ? Object.fromEntries(
              Object.entries(gigPayload.data.counts)
                .map(([id, total]) => [id, typeof total === 'number' ? total : 0])
            )
          : Array.isArray(gigPayload?.data?.folders)
        ? Object.fromEntries(
            gigPayload.data.folders
              .map((folder: { id?: unknown; total?: unknown }) => [
                typeof folder.id === 'string' ? folder.id : '',
                typeof folder.total === 'number' ? folder.total : 0
              ])
              .filter(([id]: [string, number]) => id)
          )
        : {}
        setGigNegotiationCounts(counts)
        setGigBookingCounts(counts)
      }

      const auditionPayload = await auditionResponse.json()
      if (auditionResponse.ok && auditionPayload?.success) {
        const counts = auditionPayload?.data?.counts && typeof auditionPayload.data.counts === 'object'
          ? Object.fromEntries(
              Object.entries(auditionPayload.data.counts)
                .map(([id, total]) => [`${id}_ads`.replace('total_ads_ads', 'total_ads'), typeof total === 'number' ? total : 0])
            )
          : Array.isArray(auditionPayload?.data?.folders)
            ? Object.fromEntries(
                auditionPayload.data.folders
                  .map((folder: { id?: unknown; total?: unknown }) => [
                    typeof folder.id === 'string' ? folder.id : '',
                    typeof folder.total === 'number' ? folder.total : 0
                  ])
                  .filter(([id]: [string, number]) => id)
              )
            : {}
        setAuditionAdvertCounts(counts)
      }
    } catch {
      // keep the current unread count when refresh fails
    }
  }, [])

  useEffect(() => {
    void loadUnreadSummary()
    const interval = window.setInterval(() => {
      void loadUnreadSummary()
    }, 45000)
    const handleAuditionUpdate = () => {
      void loadUnreadSummary()
    }
    window.addEventListener('artist-auditions-updated', handleAuditionUpdate)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('artist-auditions-updated', handleAuditionUpdate)
    }
  }, [loadUnreadSummary])

  useEffect(() => {
    if (!user) return

    const loadHomeSnapshots = async () => {
      try {
        const now = new Date().toISOString()
        const [gigsResponse, allGigsResponse, completedGigsResponse, releasesResponse, tracksResponse] = await Promise.all([
          fetch(`/api/artist-gigs?view=calendar&status=pending,confirmed&date_from=${encodeURIComponent(new Date().toISOString())}&limit=1`, { cache: 'no-store' }),
          fetch(`/api/artist-gigs?view=calendar&date_from=${encodeURIComponent(now)}&limit=1`, { cache: 'no-store' }),
          fetch(`/api/artist-gigs?view=calendar&status=completed&date_to=${encodeURIComponent(now)}&limit=1`, { cache: 'no-store' }),
          fetch('/api/music-releases/published?limit=100', { cache: 'no-store' }),
          fetch('/api/music-releases/published-tracks?limit=300', { cache: 'no-store' })
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

        const allGigsPayload = await allGigsResponse.json().catch(() => null)
        const completedGigsPayload = await completedGigsResponse.json().catch(() => null)
        const releasesPayload = await releasesResponse.json().catch(() => null)
        const tracksPayload = await tracksResponse.json().catch(() => null)
        const topTrack = Array.isArray(tracksPayload?.data) && tracksPayload.data.length > 0 ? tracksPayload.data[0] : null
        setFeaturedTrack(topTrack || null)
        setHomeStats((prev) => ({
          ...prev,
          upcomingGigs: typeof allGigsPayload?.summary?.total === 'number' ? allGigsPayload.summary.total : null,
          confirmedGigs: typeof allGigsPayload?.summary?.confirmed === 'number' ? allGigsPayload.summary.confirmed : null,
          completedGigs: typeof completedGigsPayload?.summary?.completed === 'number' ? completedGigsPayload.summary.completed : null,
          publishedReleases: typeof releasesPayload?.count === 'number' ? releasesPayload.count : null,
          publishedTracks: typeof tracksPayload?.count === 'number' ? tracksPayload.count : null,
        }))
      } catch {
        setNextGigSnapshot(null)
        setFeaturedTrack(null)
        setHomeStats((prev) => ({
          ...prev,
          upcomingGigs: null,
          confirmedGigs: null,
          completedGigs: null,
          publishedReleases: null,
          publishedTracks: null,
        }))
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
    // Scroll to matching element if it exists (used by profile field sub-links)
    setTimeout(() => {
      const el = document.getElementById(subSection)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
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
        const dashboardMenuColumns: Array<{
          key: string
          eyebrow: string
          title: string
          section: DashboardSection
          subSection?: string
          items: Array<{ label: string; section: DashboardSection; subSection?: string }>
        }> = [
          {
            key: 'A',
            eyebrow: 'PROFILE',
            title: 'Fundamentals',
            section: 'profile',
            subSection: 'details',
            items: [
              { label: 'Basics', section: 'profile', subSection: 'details' },
              { label: 'Crew', section: 'crew', subSection: 'owner' },
              { label: 'Banking', section: 'payments', subSection: 'out' },
              { label: 'Media', section: 'logo', subSection: 'logo' },
            ],
          },
          {
            key: 'B',
            eyebrow: 'GIGS',
            title: 'Performing',
            section: 'gigability',
            subSection: 'base',
            items: [
              { label: 'Gig-Ability', section: 'gigability', subSection: 'base' },
              { label: 'Bookings', section: 'gig-bookings', subSection: 'upcoming' },
              { label: 'Negotiations', section: 'gig-negotiations', subSection: 'gig_invites' },
              { label: 'Planner', section: 'gig-planner', subSection: 'calendar' },
            ],
          },
          {
            key: 'C',
            eyebrow: 'MUSIC',
            title: 'Catalogue',
            section: 'music-catalogue',
            subSection: 'published',
            items: [
              { label: 'New Upload', section: 'music-upload', subSection: 'workflow' },
              { label: 'Draft Uploads', section: 'music-uploads', subSection: 'drafts' },
              { label: 'Published', section: 'music-catalogue', subSection: 'published' },
              { label: 'Scheduled', section: 'music-catalogue', subSection: 'scheduled' },
            ],
          },
          {
            key: 'D',
            eyebrow: 'MESSAGES',
            title: 'Connections',
            section: 'messages',
            subSection: 'gig_invites',
            items: [
              { label: 'Gig Messages', section: 'messages', subSection: 'gig_invites' },
              { label: 'Colleagues', section: 'messages', subSection: 'colleagues' },
              { label: 'Fan Messages', section: 'messages', subSection: 'fans' },
              { label: 'Other Members', section: 'messages', subSection: 'artists' },
            ],
          },
        ]
        const openDashboardDestination = (section: DashboardSection, subSection?: string) => {
          if (subSection) {
            handleSubSectionChange(section, subSection)
            return
          }
          handleSectionChange(section)
        }

        const daysUntilNextGig = (() => {
          if (!nextGigSnapshot?.startDatetime) return null
          const parsed = new Date(nextGigSnapshot.startDatetime)
          if (Number.isNaN(parsed.getTime())) return null
          const diff = parsed.getTime() - Date.now()
          return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
        })()
        const nextGigHeading = daysUntilNextGig !== null ? `Next Gig in ${daysUntilNextGig} days` : 'Next Gig'
        const formatDashboardNumber = (value: number | null | undefined) => (
          typeof value === 'number' ? new Intl.NumberFormat('en-GB').format(value) : 'Not connected'
        )
        const linkedSocialCount = Object.values(homeStats.socialLinks).filter(Boolean).length
        const headlineIncomeStats = [
          {
            label: 'Gigs',
            value: 'Not connected',
            detail: homeStats.completedGigs !== null
              ? `${formatDashboardNumber(homeStats.completedGigs)} completed gigs counted`
              : 'Connect gig earnings',
          },
          { label: 'Streams', value: 'Not connected', detail: 'Connect streaming analytics' },
          { label: 'Downloads', value: 'Not connected', detail: 'Connect download analytics' },
          { label: 'Merchandise', value: 'Not connected', detail: 'Connect merch sales' },
        ]
        const fanbaseStats: Array<{
          channel: string
          mark: string
          value: string
          delta: string
          trend: 'up' | 'down' | 'neutral'
          markClass: string
        }> = [
          {
            channel: 'Gigrilla',
            mark: 'G',
            value: `${formatDashboardNumber(homeStats.upcomingGigs)} upcoming gigs`,
            delta: homeStats.confirmedGigs !== null ? `${formatDashboardNumber(homeStats.confirmedGigs)} confirmed` : 'Awaiting gig data',
            trend: 'neutral',
            markClass: 'bg-[#120a17] text-[#f472b6]',
          },
          {
            channel: 'YouTube',
            mark: 'YT',
            value: homeStats.socialLinks.youtube ? 'YouTube linked' : 'YouTube not linked',
            delta: homeStats.socialLinks.youtube ? 'Stats pending' : 'Add link',
            trend: 'neutral',
            markClass: 'bg-[#ff0000] text-white',
          },
          {
            channel: 'Instagram',
            mark: 'IG',
            value: homeStats.socialLinks.instagram ? 'Instagram linked' : 'Instagram not linked',
            delta: homeStats.socialLinks.instagram ? 'Stats pending' : 'Add link',
            trend: 'neutral',
            markClass: 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white',
          },
          {
            channel: 'Facebook',
            mark: 'f',
            value: homeStats.socialLinks.facebook ? 'Facebook linked' : 'Facebook not linked',
            delta: homeStats.socialLinks.facebook ? 'Stats pending' : 'Add link',
            trend: 'neutral',
            markClass: 'bg-[#1877f2] text-white',
          },
          {
            channel: 'X',
            mark: 'X',
            value: homeStats.socialLinks.x ? 'X linked' : 'X not linked',
            delta: homeStats.socialLinks.x ? 'Stats pending' : 'Add link',
            trend: 'neutral',
            markClass: 'bg-[#111827] text-white',
          },
        ]
        const chartRows = [
          { label: 'Published Tracks', value: formatDashboardNumber(homeStats.publishedTracks) },
          { label: 'Published Releases', value: formatDashboardNumber(homeStats.publishedReleases) },
        ]
        const chartPositions = [
          { label: 'Upcoming Gigs', value: formatDashboardNumber(homeStats.upcomingGigs) },
          { label: 'Confirmed Gigs', value: formatDashboardNumber(homeStats.confirmedGigs) },
          { label: 'Completed Gigs', value: formatDashboardNumber(homeStats.completedGigs ?? homeStats.manualGigsPerformed) },
        ]
        const nextGigTypeLabel = nextGigSnapshot?.eventType
          ? nextGigSnapshot.eventType.replace(/[-_]/g, ' ')
          : 'Gig type TBC'

        const handleOnboardingCollapse = () => {
          if (completionPercent === 100) {
            // Permanently dismiss when fully complete
            localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true')
            setIsOnboardingPermanentlyDismissed(true)
          } else {
            setIsHomeOnboardingOpen((prev) => !prev)
          }
        }

        return (
          <div className="space-y-7">
            {/* Hidden data loader */}
            <div className="hidden">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>

            {/* Progress tracker — top of page, gone permanently once 100% + dismissed */}
            {!isOnboardingPermanentlyDismissed && (
              <div className="rounded-[1.75rem] border border-[#f0cade]/35 bg-[linear-gradient(180deg,_rgba(246,232,250,0.96),_rgba(242,223,247,0.93))] p-5 shadow-[0_18px_44px_rgba(28,10,46,0.18)]">
                <button
                  type="button"
                  onClick={handleOnboardingCollapse}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7690]">Onboarding &amp; Setup</div>
                    <div className="mt-1 text-2xl font-black tracking-tight text-[#171d34]">Profile progress and next actions</div>
                    {completionPercent < 100 && (
                      <p className="mt-2 text-sm leading-6 text-[#4c5971]">
                        Keep this open while you are still completing setup, then collapse it when you want a cleaner dashboard.
                      </p>
                    )}
                  </div>
                  <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/45 bg-white/40 px-4 py-2 text-sm font-semibold text-[#3d4f6a] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                    {completionPercent === 100
                      ? <>All done <CheckCircle2 className="h-4 w-4 text-green-500" /> Dismiss</>
                      : isHomeOnboardingOpen
                        ? <>Collapse <ChevronUp className="h-4 w-4" /></>
                        : <>Expand <ChevronDown className="h-4 w-4" /></>
                    }
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
                        onClick={() => router.push('/signup?onboarding=artist')}
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
            )}

            <div className="grid gap-7 2xl:grid-cols-[minmax(0,1fr)_29rem]">
              <div className="space-y-7">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2 text-white">
                    <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                      Welcome, {artistHomeName}
                    </h1>
                    <p className="text-lg text-purple-100/72">Here&apos;s what&apos;s happening in your account today.</p>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-[34rem]">
                    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-[#09070d] px-5 py-3.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_rgba(0,0,0,0.25)]">
                      <Search className="h-6 w-6 text-white/65" />
                      <span className="truncate text-lg font-semibold text-white/60">Search</span>
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-[3.4rem] w-[3.4rem] items-center justify-center rounded-2xl bg-[#09070d] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_rgba(0,0,0,0.2)] transition hover:text-[#f472b6]"
                      aria-label="Open notifications"
                    >
                      <Bell className="h-6 w-6" />
                    </button>
                    <div className="inline-flex h-[3.4rem] w-[3.4rem] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] text-lg font-black text-white shadow-lg">
                      {(user?.email?.[0] || artistHomeName?.[0] || 'A').toUpperCase()}
                    </div>
                  </div>
                </div>

	                <div className="grid gap-7 xl:grid-cols-[minmax(22rem,0.95fr)_minmax(24rem,1fr)]">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-black tracking-tight text-white">{nextGigHeading}</h2>
	                    <div className="min-h-[24rem] rounded-[1.35rem] border border-white/15 bg-[#6f376d]/82 p-5 text-white shadow-[0_22px_50px_rgba(24,8,36,0.24)]">
	                      <div className="grid grid-cols-3 gap-4">
	                        <div className="flex flex-col items-center rounded-2xl bg-white/5 p-4 text-center">
	                          <CalendarDays className="h-12 w-12 text-white" />
	                          <span className="mt-3 whitespace-nowrap text-sm font-bold text-white/85">{formatHomeDate(nextGigSnapshot?.startDatetime)}</span>
	                        </div>
                        <div className="flex flex-col items-center rounded-2xl bg-white/5 p-4 text-center">
                          <Clock3 className="h-12 w-12 text-white" />
	                          <span className="mt-3 whitespace-nowrap text-sm font-bold text-white/85">{formatHomeTime(nextGigSnapshot?.startDatetime)}</span>
                        </div>
                        <div className="flex flex-col items-center rounded-2xl bg-white/5 p-4 text-center">
                          <Radio className="h-12 w-12 text-white" />
	                          <span className="mt-3 whitespace-nowrap text-sm font-bold capitalize text-white/85">{nextGigTypeLabel}</span>
                        </div>
                      </div>
                      <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white/5 p-4">
                        <MapPin className="h-12 w-12 shrink-0 text-white" />
                        <div className="min-w-0">
                          <div className="truncate text-base font-black text-white">{nextGigSnapshot?.venueName || 'Venue TBC'}</div>
                          <div className="truncate text-sm font-semibold text-white/70">{nextGigSnapshot?.displayAddress || 'Location details will appear here.'}</div>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <button type="button" className="rounded-lg bg-[#341d3d] px-3 py-2 text-sm font-black text-white shadow-md transition hover:bg-[#2a1732]">
                          Send Email Invites
                        </button>
                        <button type="button" className="rounded-lg bg-[#341d3d] px-3 py-2 text-sm font-black text-white shadow-md transition hover:bg-[#2a1732]">
                          Invite Gigrilla Fans
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSectionChange('messages')}
                        className="mt-5 flex w-full items-center justify-between rounded-lg border-2 border-white/75 px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-white/10"
                      >
                        Post a message to your feed
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-2xl font-black tracking-tight text-white">Chart Highlights</h2>
                      <button type="button" className="rounded-lg bg-[#8b4b84] px-3 py-2 text-xs font-black text-white shadow-md transition hover:bg-[#9a5593]">
                        Last 7 Days
                      </button>
                    </div>
	                    <div className="min-h-[24rem] rounded-[1.35rem] border border-white/15 bg-[#6f376d]/82 p-6 text-white shadow-[0_22px_50px_rgba(24,8,36,0.24)]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] text-xl font-black">
                          {(featuredTrack?.artist_name?.[0] || artistHomeName?.[0] || 'A').toUpperCase()}
                        </div>
                          <div className="min-w-0">
                            <div className="truncate text-xl font-black">{featuredTrack?.artist_name || artistHomeName}</div>
                          <div className="truncate text-sm italic text-white/72">{featuredTrack?.release_title || 'Latest published track'}</div>
                        </div>
                      </div>
                      <div className="mt-7 space-y-4">
                        {chartRows.map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-4">
                            <span className="max-w-[8rem] text-sm font-black leading-4 text-white/86">{row.label}</span>
                            <span className="rounded-lg bg-[#3d2044] px-4 py-2 text-sm font-black text-white shadow-md">{row.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 space-y-2">
                        {chartPositions.map((position) => (
                          <div key={position.label} className="flex items-center gap-3 text-sm font-black text-white/90">
                            <span>{position.value}</span>
                            <span>{position.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>

                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-black tracking-tight text-white">Headline Income</h2>
                    <button type="button" className="rounded-lg bg-[#8b4b84] px-3 py-2 text-xs font-black text-white shadow-md transition hover:bg-[#9a5593]">
                      Last 7 Days
                    </button>
                  </div>
                  <div className="grid overflow-hidden rounded-2xl border border-white/15 bg-[#6f376d]/82 text-white shadow-[0_22px_50px_rgba(24,8,36,0.2)] sm:grid-cols-2 xl:grid-cols-4">
                    {headlineIncomeStats.map((stat) => (
                      <div key={stat.label} className="border-white/15 p-5 sm:border-r last:border-r-0">
                        <div className="text-center text-base font-semibold text-white/76">{stat.label}</div>
                        <div className="mt-2 text-center text-2xl font-black tracking-wide text-white xl:text-3xl">{stat.value}</div>
                        <div className="mt-2 text-center text-[0.68rem] font-black uppercase tracking-[0.12em] text-white/45">{stat.detail}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-right text-3xl font-black text-white/42">Total Income: Not connected</div>
                </section>

                <div className="grid gap-7 xl:grid-cols-[minmax(20rem,0.9fr)_minmax(26rem,1fr)]">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-2xl font-black tracking-tight text-white">Your Fanbase</h2>
                      <button type="button" className="rounded-lg bg-[#8b4b84] px-3 py-2 text-xs font-black text-white shadow-md transition hover:bg-[#9a5593]">
                        Last 7 Days
                      </button>
                    </div>
                    <div className="space-y-3 p-1 text-white">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                        {linkedSocialCount} social link{linkedSocialCount === 1 ? '' : 's'} connected
                      </div>
                      {fanbaseStats.map((stat) => (
                        <div key={`${stat.channel}-${stat.value}`} className="grid grid-cols-[2.25rem_1fr_auto_auto] items-center gap-3 text-sm">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-black ${stat.markClass}`}>{stat.mark}</span>
                          <span className="font-semibold text-white/85">{stat.value}</span>
                          <span className={stat.trend === 'up' ? 'text-emerald-400' : stat.trend === 'down' ? 'text-rose-400' : 'text-white/48'}>{stat.delta}</span>
                          <span className={stat.trend === 'up' ? 'flex h-6 w-6 items-center justify-center rounded-full bg-emerald-950 text-emerald-300' : stat.trend === 'down' ? 'flex h-6 w-6 items-center justify-center rounded-full bg-rose-950 text-rose-300' : 'flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/50'}>
                            {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '–'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-black tracking-tight text-white">Latest Review</h2>
                    <div className="rounded-[1.35rem] border border-white/10 bg-[#0b0b0d] p-5 text-white shadow-[0_22px_50px_rgba(0,0,0,0.25)]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-white/8">
                          <BarChart3 className="h-8 w-8 text-white/45" />
                        </div>
                        <div>
                          <div className="font-black">No reviews connected yet</div>
                          <div className="mt-1 text-sm leading-6 text-white/62">
                            Venue and fan reviews will appear here once the review data source is live.
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <aside className="rounded-[1.5rem] bg-[#08080b] p-7 text-white shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-black tracking-tight">Top Track</h2>
                  <button type="button" className="rounded-lg bg-[#8b4b84] px-3 py-2 text-xs font-black text-white shadow-md transition hover:bg-[#9a5593]">
                    Last 7 Days
                  </button>
                </div>
                <div className="mt-6 overflow-hidden rounded-2xl bg-[#121217]">
                  {featuredTrack?.cover_artwork_url ? (
                    <img
                      src={featuredTrack.cover_artwork_url}
                      alt={`${featuredTrack.track_title} artwork`}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#5b0b16] via-[#241221] to-black">
                      <Disc3 className="h-16 w-16 text-white/70" />
                    </div>
                  )}
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-3xl font-black">{featuredTrack?.track_title || 'No published track yet'}</div>
                    <div className="mt-1 truncate text-sm italic text-white/60">{featuredTrack ? featuredTrack.artist_name : 'Publish music to populate this panel'}</div>
                  </div>
                  <button type="button" className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-[#111116] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-[#1b1b22]" aria-label="Play top track">
                    <PlayCircle className="h-6 w-6" />
                    <span className="mt-1 text-[0.6rem] font-black">{formatTrackDuration(featuredTrack?.duration_seconds)}</span>
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap gap-3 text-sm font-black">
                  <span className="rounded-lg bg-[#8b4b84] px-3 py-2">Not connected</span>
                  <span>Streams</span>
                  <span className="rounded-lg bg-[#8b4b84] px-3 py-2">Not connected</span>
                  <span>Downloads</span>
                </div>
                <div className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-white/70">Chart Positions</div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[#6f376d] p-4">
                    <div className="text-sm text-white/70">Published Tracks</div>
                    <div className="mt-2 text-4xl font-black">{formatDashboardNumber(homeStats.publishedTracks)}</div>
                  </div>
                  <div className="rounded-xl bg-[#6f376d] p-4">
                    <div className="text-sm text-white/70">Published Releases</div>
                    <div className="mt-2 text-4xl font-black">{formatDashboardNumber(homeStats.publishedReleases)}</div>
                  </div>
                </div>
                <div className="mt-7 flex items-center justify-between gap-4 rounded-xl bg-[#8b4b84] px-5 py-4 text-xl font-black">
                  <span>Track Income:</span>
                  <span className="text-right">Not connected</span>
                </div>
              </aside>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboardMenuColumns.map((column) => (
                <div
                  key={column.key}
                  className="rounded-[1.5rem] border border-[#f2d7ea]/35 bg-[linear-gradient(180deg,_rgba(251,245,252,0.96),_rgba(247,237,250,0.92))] p-5 text-left shadow-[0_16px_40px_rgba(28,10,46,0.16)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7690]">{column.eyebrow}</div>
                      <button
                        type="button"
                        onClick={() => openDashboardDestination(column.section, column.subSection)}
                        className="mt-2 text-left text-2xl font-black tracking-tight text-[#171d34] transition hover:text-[#7c2d88]"
                      >
                        {column.title}
                      </button>
                    </div>
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ebd4e8] bg-white/70 text-xs font-black text-[#7c2d88]">
                      {column.key}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {column.items.map((item) => (
                      <button
                        key={`${column.key}-${item.label}`}
                        type="button"
                        onClick={() => openDashboardDestination(item.section, item.subSection)}
                        className="flex w-full items-center justify-between rounded-xl border border-transparent bg-white/45 px-3 py-2 text-left text-sm font-semibold text-[#495773] transition hover:border-[#e7c6e7] hover:bg-white/75 hover:text-[#171d34]"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#9f7faa]" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
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
        return renderWithCompletion(
          <ArtistAuditionsManager
            initialView={
              currentSubSection === 'drafts' || currentSubSection === 'published' || currentSubSection === 'unpublished' || currentSubSection === 'historic'
                ? currentSubSection
                : currentSubSection === 'add'
                  ? 'add'
                  : 'published'
            }
          />
        )
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
              ? renderWithCompletion(
                  <ArtistGigCalendarManager
                    defaultView="upcoming"
                    onNavigateToGigSubSection={(subSection) => handleSubSectionChange('gig-bookings', subSection)}
                  />
                )
              : currentSubSection === 'drafts'
                ? renderWithCompletion(<ArtistGigCalendarManager defaultView="drafts" />)
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
          renderWithCompletion(<ArtistGigReportingManager mode={currentSubSection === 'report-gig' || currentSubSection === 'report-venue' ? 'report' : 'confirm'} />)
        ))
      case 'gig-negotiations':
        return renderGuardedSection('gig-negotiations', (
          currentSubSection === 'gig_invites'
            ? renderWithCompletion(<ArtistGigInvitesManager />)
            : currentSubSection === 'gig_requests'
              ? renderWithCompletion(<ArtistGigRequestsManager />)
              : renderWithCompletion(<ArtistGigConfirmationsManager />)
        ))
      case 'gig-planner':
        return renderGuardedSection('gig-planner', (
          renderWithCompletion(<ArtistGigPlannerManager defaultView={currentSubSection === 'unavailability' ? 'unavailability' : 'calendar'} />)
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
            ? renderWithCompletion(
                <ArtistMusicManager
                  defaultView="manage"
                  forcedSubSection="drafts"
                  onSubSectionNavigate={(subSection) => {
                    if (subSection === 'workflow' || subSection === 'guide' || subSection === 'intro') {
                      handleSubSectionChange('music-upload', subSection)
                      return
                    }
                    handleSubSectionChange('music-uploads', 'drafts')
                  }}
                />
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
              forcedSubSection={(currentSubSection || 'published') as MusicManagerForcedSubSection}
              onSubSectionNavigate={(subSection) => {
                if (subSection === 'workflow' || subSection === 'guide' || subSection === 'intro') {
                  handleSubSectionChange('music-upload', subSection)
                  return
                }
                handleSubSectionChange('music-catalogue', subSection)
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
          <div className="space-y-6">
            <ArtistProfileForm onProfileSaved={() => setCompletionRefreshKey(prev => prev + 1)} />
            <ArtistGenresManager />
            <ArtistContractStatusManager />
            <ArtistBiographyManager />
          </div>
        )
    }
  }

  const headerTitleMap: Record<DashboardSection, string> = {
    home: 'Artist Home',
    profile: 'Artist Basics',
    contract: 'Contract Status',
    payments: 'Artist Payments',
    crew: 'Artist Crew',
    auditions: 'Auditions & Collaborations',
    logo: 'Logo/Profile Artwork',
    photos: 'Artist Photos',
    videos: 'Artist Videos',
    type: 'Artist Type & Configuration',
    royalty: 'Money Splits',
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
    'gig-invites': 'Gig Invites (from Others)',
    'gig-requests': 'Gig Requests (to Others)',
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
    royalty: 'Set default money splits for gigs and merch',
    gigability: 'Set your base location and stage timing preferences',
    'gig-bookings': 'Book/add new Gigs, edit/view upcoming/previous Gigs',
    'gig-reporting': 'Confirm completed gigs, review members, and report gig issues',
    'gig-negotiations': 'Track invites, requests, and contract-stage negotiations',
    'gig-planner': 'Use a dedicated calendar and availability planner',
    'gig-statistics': 'Review your location, venue, performance, and earnings statistics',
    'gig-calendar': 'Create a new gig booking',
    'gig-create': 'Create a new gig booking',
    'gig-upcoming': 'Edit or amend your upcoming gig bookings',
    'gig-past': 'View past and unscheduled gigs',
    'gig-invites': 'Review and respond to gig invitations from venues and artists',
    'gig-requests': 'Track direct gig booking requests you send to venues and artists',
    bio: 'Write and manage your artist biography',
    genres: 'Select your music genres and sub-genres',
    'music-uploads': 'Start new uploads, consult the guide, and resume draft release work',
    'music-catalogue': 'Filter through published and scheduled releases and track inventory',
    'music-statistics': 'Review stream counts, download totals, and music earnings',
    'music-upload': 'Upload new releases and complete submission details',
    'music-manage': 'Manage drafts, pending releases, and published catalog',
    messages: 'Read and manage real direct-message threads',
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
            messageFolderCounts={messageFolderCounts}
            gigNegotiationCounts={gigNegotiationCounts}
            gigBookingCounts={gigBookingCounts}
            auditionAdvertCounts={auditionAdvertCounts}
            completedSections={completedSectionsForSidebar}
            hideTypeSection={false}
          />
        </SheetContent>

        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,143,163,0.14),_transparent_18%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.10),_transparent_20%),linear-gradient(180deg,_#3d214d_0%,_#331c42_100%)] lg:flex">
          <div className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:block ${isDesktopSidebarCollapsed ? 'lg:w-20' : 'lg:w-80'}`}>
            <ArtistSidebar
              activeSection={activeSection}
              activeSubSectionKey={activeSubSectionKey}
              onSectionChange={handleSectionChange}
              onSubSectionChange={handleSubSectionChange}
              isCollapsed={isDesktopSidebarCollapsed}
              onCollapsedChange={setIsDesktopSidebarCollapsed}
              capabilities={capabilities}
              unreadMessages={unreadMessages}
              messageFolderCounts={messageFolderCounts}
              gigNegotiationCounts={gigNegotiationCounts}
              gigBookingCounts={gigBookingCounts}
              auditionAdvertCounts={auditionAdvertCounts}
              completedSections={completedSectionsForSidebar}
              hideTypeSection={false}
            />
          </div>

          <div className={`flex-1 overflow-y-auto ${isDesktopSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-80'}`}>
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
