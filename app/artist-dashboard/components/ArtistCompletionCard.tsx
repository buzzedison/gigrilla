"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../../lib/auth-context"
import { HelpCircle, CheckCircle2, Circle } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { useSearchParams } from "next/navigation"

export type CompletionSection =
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
  | 'type'

export interface CompletionItemDefinition {
  id: string
  label: string
  required?: boolean
  dependsOn?: string[]
  section: CompletionSection
}

export interface CompletionItemState extends CompletionItemDefinition {
  completed: boolean
}

interface ArtistProfileData {
  stage_name?: string | null
  artist_type_id?: number | null
  artist_sub_types?: string[] | null
  established_date?: string | null
  preferred_genre_ids?: string[] | null
  bio?: string | null
  social_links?: Record<string, string | null> | null
  base_location?: string | null
  record_label_status?: string | null
  record_label_name?: string | null
  music_publisher_status?: string | null
  music_publisher_name?: string | null
  artist_manager_status?: string | null
  artist_manager_name?: string | null
  booking_agent_status?: string | null
  booking_agent_name?: string | null
  members?: string[] | null
  members_count?: number | null
  minimum_set_length?: number | null
  maximum_set_length?: number | null
}

interface ArtistCompletionCardProps {
  onCompletionStateChange?: (items: CompletionItemState[]) => void
  refreshKey?: number
}

export function ArtistCompletionCard({ onCompletionStateChange, refreshKey = 0 }: ArtistCompletionCardProps) {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<ArtistProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null)

  const completionDefinitions = useMemo<CompletionItemDefinition[]>(() => ([
    { id: 'stage_name', label: 'Artist Name', required: true, section: 'profile' },
    { id: 'artist_type', label: 'Artist Type', required: true, section: 'type' },
    { id: 'artist_sub_types', label: 'Artist Sub-Type', required: true, dependsOn: ['artist_type'], section: 'type' },
    { id: 'established_date', label: 'Artist Formed', required: true, section: 'profile' },
    { id: 'genres', label: 'Artist Genre(s)', required: true, section: 'genres' },
    { id: 'crew', label: 'Artist Crew', section: 'crew' },
    { id: 'royalty_splits', label: 'Default Royalty Splits', section: 'royalty' },
    { id: 'gig_ability', label: 'Artist Gig-Ability', section: 'gigability' },
    { id: 'bio', label: 'Artist Biography', section: 'bio' },
    { id: 'record_label', label: 'Record Label', section: 'profile' },
    { id: 'music_publisher', label: 'Music Publisher', section: 'profile' },
    { id: 'artist_manager', label: 'Artist Manager', section: 'profile' },
    { id: 'booking_agent', label: 'Booking Agent', section: 'profile' },
    { id: 'gig_fee', label: 'Basic Gig Fee', required: true, section: 'maps', dependsOn: ['artist_type'] },
    { id: 'logo_artwork', label: 'Logo/Artwork', required: true, section: 'logo' },
    { id: 'photos', label: 'Photos', required: true, section: 'photos' },
    { id: 'videos', label: 'Videos', required: true, section: 'videos' }
  ]), [])

  const evaluatedItems = useMemo<CompletionItemState[]>(() => {
    const membersCount = profile?.members?.length ?? profile?.members_count ?? 0
    const profileMetrics: Record<string, boolean> = {
      stage_name: !!profile?.stage_name,
      artist_type: !!profile?.artist_type_id,
      artist_sub_types: Array.isArray(profile?.artist_sub_types) && profile!.artist_sub_types!.length > 0,
      established_date: !!profile?.established_date,
      genres: Array.isArray(profile?.preferred_genre_ids) && profile!.preferred_genre_ids!.length > 0,
      crew: membersCount > 0,
      royalty_splits: false, // TODO: Implement royalty splits completion check
      gig_ability: !!(profile?.minimum_set_length && profile?.maximum_set_length), // TODO: Update after migration
      bio: !!profile?.bio && profile?.bio.length > 50,
      record_label: !!profile?.record_label_status && !!profile?.record_label_name,
      music_publisher: !!profile?.music_publisher_status && !!profile?.music_publisher_name,
      artist_manager: !!profile?.artist_manager_status && !!profile?.artist_manager_name,
      booking_agent: !!profile?.booking_agent_status && !!profile?.booking_agent_name,
      gig_fee: !!profile?.base_location,
      logo_artwork: !!profile?.social_links?.instagram,
      photos: !!profile?.social_links?.tiktok,
      videos: !!profile?.social_links?.youtube
    }

    return completionDefinitions.map(def => {
      const depsMet = (def.dependsOn ?? []).every(id => profileMetrics[id])
      return {
        ...def,
        completed: depsMet && profileMetrics[def.id]
      }
    })
  }, [completionDefinitions, profile])

  useEffect(() => {
    onCompletionStateChange?.(evaluatedItems)
  }, [evaluatedItems, onCompletionStateChange])

  const completedCount = useMemo(() => evaluatedItems.filter(item => item.completed).length, [evaluatedItems])
  const totalCount = evaluatedItems.length
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  useEffect(() => {
    const recent = searchParams.get('completed')
    if (recent) setRecentlyCompleted(recent)
  }, [searchParams])

  useEffect(() => {
    if (!user) return

    const loadCompletionStatus = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/artist-profile')
        const result = await response.json()

        if (result.data) {
          const rawProfile = result.data as ArtistProfileData & { members?: string[] | null }
          const membersArray = Array.isArray(rawProfile.members) ? rawProfile.members : null
          const membersCount = membersArray?.length ?? rawProfile.members_count ?? null

          setProfile({
            ...rawProfile,
            members: membersArray,
            members_count: membersCount
          })
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('Error loading completion status:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCompletionStatus()
  }, [user, refreshKey])

  const lastCompletedLabel = useMemo(() => {
    if (!recentlyCompleted) return null
    const item = evaluatedItems.find(i => i.id === recentlyCompleted)
    return item?.label ?? null
  }, [recentlyCompleted, evaluatedItems])

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-sm">
      <h2 className="sr-only">Artist profile completion</h2>
      <div className="flex flex-col">
        <div className="p-6 flex-shrink-0">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <HelpCircle className="w-10 h-10 text-white" />
              <span className="absolute -bottom-1 right-0 text-xs font-semibold bg-white text-purple-600 px-2 py-0.5 rounded-full">
                {percentage}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Profile is {percentage}% complete
            </h3>
            <p className="text-sm text-gray-600">
              {completedCount} of {totalCount} items completed
            </p>
            {lastCompletedLabel && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                Nice! You just completed {lastCompletedLabel}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-1">
          <div className="space-y-1.5">
            {evaluatedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-0.5">
                <div className="flex items-center space-x-2.5">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${item.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                    {item.required && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0 border-transparent bg-orange-50 text-orange-600">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 px-6 pt-4 pb-4 border-t border-purple-200 mt-2">
          <div className="text-center">
            {loading ? (
              <p className="text-sm text-gray-500">Checking your profile status…</p>
            ) : (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Complete all required fields to publish your profile
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
