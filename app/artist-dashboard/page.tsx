'use client'

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../lib/auth-context"
import { ProtectedRoute } from "../../lib/protected-route"
import { useRouter } from "next/navigation"
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
import { ArtistMusicManager } from "./components/ArtistMusicManager"
import { ArtistContractStatusManager } from "./components/ArtistContractStatusManager"
import { Badge } from "../components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet"
import { Music, Info, Menu } from "lucide-react"
import { getArtistTypeConfig, ArtistTypeCapabilities } from "../../data/artist-types"

interface ArtistProfileResponse {
  data: {
    artist_type_id?: number | null
    artist_sub_types?: Record<string, string[] | undefined> | null
    preferred_genre_ids?: string[] | null
    onboarding_completed?: boolean | null
  } | null
}

type DashboardSection =
  | 'profile'
  | 'payments'
  | 'crew'
  | 'auditions'
  | 'royalty'
  | 'gigability'
  | 'gig-calendar'
  | 'gig-create'
  | 'gig-upcoming'
  | 'gig-past'
  | 'gig-invites'
  | 'gig-requests'
  | 'bio'
  | 'genres'
  | 'logo'
  | 'photos'
  | 'videos'
  | 'music-upload'
  | 'music-manage'
  | 'type'
  | 'contract'

export default function ArtistDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<DashboardSection>('profile')
  const [artistTypeSelection, setArtistTypeSelection] = useState<ArtistTypeSelection | null>(null)
  const [capabilities, setCapabilities] = useState<ArtistTypeCapabilities | null>(null)
  const [isSavingArtistType, setIsSavingArtistType] = useState(false)
  const [completionState, setCompletionState] = useState<CompletionItemState[]>([])
  const [completionRefreshKey, setCompletionRefreshKey] = useState(0)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [activeSubSectionKey, setActiveSubSectionKey] = useState<string | null>(null)

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

        if (result.data.artist_type_id) {
          const subTypes = Array.isArray(result.data.artist_sub_types)
            ? result.data.artist_sub_types.reduce<Record<string, string[]>>((acc, value) => {
              const [groupId, optionValue] = value.split(':')
              if (!groupId || !optionValue) return acc
              acc[groupId] = acc[groupId] ? [...acc[groupId], optionValue] : [optionValue]
              return acc
            }, {})
            : (result.data.artist_sub_types as Record<string, string[]>) ?? {}

          const selection: ArtistTypeSelection = {
            artistTypeId: result.data.artist_type_id,
            selections: subTypes
          }
          setArtistTypeSelection(selection)
          const config = getArtistTypeConfig(selection.artistTypeId)
          setCapabilities(config?.capabilities ?? null)
        }
        // Don't force redirect to type section - let users navigate freely
      } catch (error) {
        console.error('Error loading artist profile:', error)
      }
    }

    loadArtistProfile()
  }, [user, router])

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

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section)
    setActiveSubSectionKey(null)
  }

  const handleSubSectionChange = (section: DashboardSection, subSection: string) => {
    setActiveSection(section)
    setActiveSubSectionKey(`${section}:${subSection}`)
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
      case 'gig-calendar':
      case 'gig-create':
      case 'gig-upcoming':
      case 'gig-past':
      case 'gig-invites':
      case 'gig-requests':
        return capabilities.showGigAbility
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

    const message = ['gigability', 'gig-calendar', 'gig-create', 'gig-upcoming', 'gig-past', 'gig-invites', 'gig-requests'].includes(section)
      ? 'Gig Manager is hidden for your current artist type. Change your artist type to enable gig operations.'
      : 'This section is not available for your current artist type.'

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-sm text-gray-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-600 mt-0.5" />
        <p>{message}</p>
      </div>
    )
  }

  const renderContent = (section: DashboardSection) => {
    switch (section) {
      case 'logo':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistPhotosManager mode="branding" />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'photos':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistPhotosManager mode="photos" />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'videos':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistVideosManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'type':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-4">
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
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'contract':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistContractStatusManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'payments':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistPaymentsManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'crew':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistCrewManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'auditions':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistAuditionsManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'royalty':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistRoyaltySplitsManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'gigability':
        return renderGuardedSection('gigability', (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistGigAbilityManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        ))
      case 'gig-calendar':
      case 'gig-create':
        return renderGuardedSection('gig-create', (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistGigCalendarManager defaultView="create" />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        ))
      case 'gig-upcoming':
        return renderGuardedSection('gig-upcoming', (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistGigCalendarManager defaultView="upcoming" />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        ))
      case 'gig-past':
        return renderGuardedSection('gig-past', (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistGigCalendarManager defaultView="past" />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        ))
      case 'gig-invites':
        return renderGuardedSection('gig-invites', (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistGigInvitesManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        ))
      case 'gig-requests':
        return renderGuardedSection('gig-requests', (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistGigRequestsManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        ))
      case 'bio':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistBiographyManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'genres':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistGenresManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'music-upload':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistMusicManager defaultView="upload" />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      case 'music-manage':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistMusicManager defaultView="manage" />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
      default:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistProfileForm onProfileSaved={() => setCompletionRefreshKey(prev => prev + 1)} />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard onCompletionStateChange={setCompletionState} refreshKey={completionRefreshKey} />
            </div>
          </div>
        )
    }
  }

  const headerTitleMap: Record<DashboardSection, string> = {
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
    'gig-calendar': 'Add / Create Gig',
    'gig-create': 'Add / Create Gig',
    'gig-upcoming': 'Amend Upcoming Gigs',
    'gig-past': 'Past & Unscheduled Gigs',
    'gig-invites': 'Gig Invites',
    'gig-requests': 'Gig Requests',
    bio: 'Artist Biography',
    genres: 'Artist Genres',
    'music-upload': 'Music Manager • Upload Music',
    'music-manage': 'Music Manager • Manage Music'
  }

  const headerSubtitleMap: Record<DashboardSection, string> = {
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
    'gig-calendar': 'Create a new gig booking',
    'gig-create': 'Create a new gig booking',
    'gig-upcoming': 'Edit or amend your upcoming gig bookings',
    'gig-past': 'View past and unscheduled gigs',
    'gig-invites': 'Review and respond to gig invitations',
    'gig-requests': 'Track direct gig booking requests from venues',
    bio: 'Write and manage your artist biography',
    genres: 'Select your music genres and sub-genres',
    'music-upload': 'Upload new releases and complete submission details',
    'music-manage': 'Manage drafts, pending releases, and published catalog'
  }

  return (
    <ProtectedRoute>
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-[#2a1b3d]">
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
            completedSections={completedSectionsForSidebar}
            hideTypeSection={false}
          />
        </SheetContent>

        <div className="min-h-screen bg-[#4a2c5a] lg:flex">
          <div className="hidden lg:block">
            <div className="fixed left-0 top-0 z-10 h-full w-64">
              <ArtistSidebar
                activeSection={activeSection}
                activeSubSectionKey={activeSubSectionKey}
                onSectionChange={handleSectionChange}
                onSubSectionChange={handleSubSectionChange}
                capabilities={capabilities}
                completedSections={completedSectionsForSidebar}
                hideTypeSection={false}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto lg:ml-64">
            <div className="p-4 sm:p-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex w-full items-center gap-3 lg:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsMobileNavOpen(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2a1b3d] text-white transition hover:bg-[#3a2550] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#4a2c5a] lg:hidden"
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
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-200 border-purple-500/30">
                      <Music className="mr-2 h-4 w-4" />
                      {headerTitleMap[activeSection]}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-6 lg:space-y-8">
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
