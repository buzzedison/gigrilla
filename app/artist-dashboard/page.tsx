'use client'

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../lib/auth-context"
import { ProtectedRoute } from "../../lib/protected-route"
import { useRouter } from "next/navigation"
import { ArtistSidebar, ArtistDashboardSection } from "./components/ArtistSidebar"
import { ArtistProfileForm } from "./components/ArtistProfileForm"
import { ArtistCompletionCard, CompletionItemState, CompletionSection } from "./components/ArtistCompletionCard"
import { ArtistBiographyManager } from "./components/ArtistBiographyManager"
import { ArtistGenresManager } from "./components/ArtistGenresManager"
import { GigAbilityMapsManager } from "./components/GigAbilityMapsManager"
import { LogoProfileArtwork } from "./components/LogoProfileArtwork"
import { ArtistPhotosManager } from "./components/ArtistPhotosManager"
import { ArtistVideosManager } from "./components/ArtistVideosManager"
import { ArtistTypeSelectorV2, ArtistTypeSelection } from "./components/ArtistTypeSelectorV2"
import { ArtistCrewManager } from "./components/ArtistCrewManager"
import { ArtistRoyaltySplitsManager } from "./components/ArtistRoyaltySplitsManager"
import { ArtistGigAbilityManager } from "./components/ArtistGigAbilityManager"
import { ArtistMusicManager } from "./components/ArtistMusicManager"
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
  | 'crew'
  | 'royalty'
  | 'gigability'
  | 'bio'
  | 'genres'
  | 'maps'
  | 'logo'
  | 'photos'
  | 'videos'
  | 'music'
  | 'type'

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

  const selectedTypeConfig = useMemo(() => {
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

  useEffect(() => {
    if (onboardingCompleted && activeSection === 'type') {
      setActiveSection('profile')
    }
  }, [onboardingCompleted, activeSection])

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
      setActiveSection('profile')
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
      case 'maps':
        return capabilities.showGigAbility
      default:
        return true
    }
  }

  const sectionHasCompletion = (section: DashboardSection) => {
    const mappedSection: CompletionSection = section as CompletionSection
    return completionState.some(item => item.section === mappedSection && item.completed)
  }

  const renderGuardedSection = (section: DashboardSection, content: React.ReactNode) => {
    if (sectionIsEnabled(section)) {
      return content
    }

    const message = section === 'maps'
      ? 'GigAbility is hidden for your current artist type. Change your artist type to enable gig locations and pricing.'
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
              <LogoProfileArtwork />
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
              <ArtistPhotosManager />
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
        // Hide type selector if onboarding is completed
        if (onboardingCompleted) {
          return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600">Your artist type has been configured. Contact support if you need to change it.</p>
            </div>
          )
        }
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-4">
              <ArtistTypeSelectorV2
                value={artistTypeSelection}
                onChange={handleArtistTypeChange}
              />
              {isSavingArtistType && (
                <div className="text-sm text-gray-500">Saving artist type...</div>
              )}
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
              <ArtistCompletionCard />
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
              <ArtistCompletionCard />
            </div>
          </div>
        )
      case 'gigability':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistGigAbilityManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        )
      case 'bio':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistBiographyManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
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
              <ArtistCompletionCard />
            </div>
          </div>
        )
      case 'maps':
        return renderGuardedSection('maps', (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <GigAbilityMapsManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        ))
      case 'music':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistMusicManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
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
              <ArtistCompletionCard />
            </div>
          </div>
        )
    }
  }

  const headerTitleMap: Record<DashboardSection, string> = {
    profile: 'Artist Dashboard',
    logo: 'Logo/Profile Artwork',
    photos: 'Artist Photos',
    videos: 'Artist Videos',
    type: 'Artist Type & Configuration',
    crew: 'Artist Crew',
    royalty: 'Default Royalty Splits',
    gigability: 'Artist Gig-Ability',
    bio: 'Artist Biography',
    genres: 'Artist Genres',
    maps: 'GigAbility Maps',
    music: 'Music Manager'
  }

  const headerSubtitleMap: Record<DashboardSection, string> = {
    profile: 'Manage your artist profile and content',
    logo: 'Upload your logo and profile artwork',
    photos: 'Upload and manage your artist photos',
    videos: 'Embed and manage your artist videos',
    type: 'Select your official artist type and sub-types',
    crew: 'Manage your crew roles, instruments, and band members',
    royalty: 'Set default royalty splits for gigs and music releases',
    gigability: 'Set your base location and stage timing preferences',
    bio: 'Write and manage your artist biography',
    genres: 'Select your music genres and sub-genres',
    maps: 'Set your gig location preferences and availability',
    music: 'Upload and manage your music releases'
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
            onSectionChange={(section) => {
              setActiveSection(section)
              setIsMobileNavOpen(false)
            }}
            capabilities={capabilities}
            completedSections={completionState.filter(item => item.completed).map(item => item.section)}
            hideTypeSection={onboardingCompleted}
          />
        </SheetContent>

        <div className="min-h-screen bg-[#4a2c5a] lg:flex">
          <div className="hidden lg:block">
            <div className="fixed left-0 top-0 z-10 h-full w-64">
              <ArtistSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                capabilities={capabilities}
                completedSections={completionState.filter(item => item.completed).map(item => item.section)}
                hideTypeSection={onboardingCompleted}
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
