'use client'

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../lib/auth-context"
import { ProtectedRoute } from "../../lib/protected-route"
import { useRouter } from "next/navigation"
import { ArtistSidebar, ArtistDashboardSection } from "./components/ArtistSidebar"
import { ArtistProfileForm } from "./components/ArtistProfileForm"
import { ArtistCompletionCard, CompletionItemState, CompletionSection } from "./components/ArtistCompletionCard"
import { ArtistMembersManager } from "./components/ArtistMembersManager"
import { ArtistBiographyManager } from "./components/ArtistBiographyManager"
import { ArtistGenresManager } from "./components/ArtistGenresManager"
import { GigAbilityMapsManager } from "./components/GigAbilityMapsManager"
import { LogoProfileArtwork } from "./components/LogoProfileArtwork"
import { ArtistPhotosManager } from "./components/ArtistPhotosManager"
import { ArtistVideosManager } from "./components/ArtistVideosManager"
import { ArtistTypeSelectorV2, ArtistTypeSelection } from "./components/ArtistTypeSelectorV2"
import { Badge } from "../components/ui/badge"
import { Music, Info } from "lucide-react"
import { ARTIST_TYPES, getArtistTypeConfig, ArtistTypeCapabilities } from "../../data/artist-types"

interface ArtistProfileResponse {
  data: {
    artist_type_id?: number | null
    artist_sub_types?: Record<string, string[] | undefined> | null
    preferred_genre_ids?: string[] | null
  } | null
}

type DashboardSection =
  | 'profile'
  | 'members'
  | 'bio'
  | 'genres'
  | 'maps'
  | 'logo'
  | 'photos'
  | 'videos'
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
          setActiveSection('type')
          return
        }

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
        } else {
          setActiveSection('type')
        }
      } catch (error) {
        console.error('Error loading artist profile:', error)
      }
    }

    loadArtistProfile()
  }, [user, router])

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
      // Allow artist type selection even with no capabilities configured yet
      return section === 'type'
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
      case 'members':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistMembersManager />
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
    members: 'Artist Members',
    bio: 'Artist Biography',
    genres: 'Artist Genres',
    maps: 'GigAbility Maps'
  }

  const headerSubtitleMap: Record<DashboardSection, string> = {
    profile: 'Manage your artist profile and content',
    logo: 'Upload your logo and profile artwork',
    photos: 'Upload and manage your artist photos',
    videos: 'Embed and manage your artist videos',
    type: 'Select your official artist type and sub-types',
    members: 'Manage your artist members and their details',
    bio: 'Tell your artist story and key milestones',
    genres: 'Define your music genres and sub-genres',
    maps: 'Set your gig locations and pricing areas'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#4a2c5a] flex">
        <div className="fixed left-0 top-0 h-full z-10">
          <ArtistSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            capabilities={capabilities}
            completedSections={completionState.filter(item => item.completed).map(item => item.section)}
          />
        </div>

        <div className="flex-1 ml-64 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {headerTitleMap[activeSection]}
                    </h1>
                    <p className="text-gray-300">
                      {headerSubtitleMap[activeSection]}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-200 border-purple-500/30">
                    <Music className="w-4 h-4 mr-2" />
                    {headerTitleMap[activeSection]}
                  </Badge>
                </div>
              </div>

              {renderContent(activeSection)}

              <div className="h-20" />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
