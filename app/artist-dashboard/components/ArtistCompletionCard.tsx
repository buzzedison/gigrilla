"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../../lib/auth-context"
import { HelpCircle, CheckCircle2, Circle, PartyPopper } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"

export type CompletionSection =
  | 'profile'
  | 'payments'
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
  | 'contract'

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
  local_gig_fee?: number | null
  wider_gig_fee?: number | null
}

interface PhotoData {
  id: string
  type: 'logo' | 'header' | 'photo'
  url: string
}

interface VideoData {
  id: string
  title: string
  video_url: string
}

interface CrewMemberData {
  id: string
  name: string
  metadata?: {
    gigRoyaltyShare?: number
  }
}

interface PaymentDetailsData {
  use_fan_banking?: boolean
  payment_out_method?: string
  payment_out_bank_name?: string
  payment_out_account_number?: string
  payment_in_same_as_out?: boolean
  payment_in_method?: string
  payment_in_bank_name?: string
  payment_in_account_number?: string
}

interface ArtistCompletionCardProps {
  onCompletionStateChange?: (items: CompletionItemState[]) => void
  refreshKey?: number
}

export function ArtistCompletionCard({ onCompletionStateChange, refreshKey = 0 }: ArtistCompletionCardProps) {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [profile, setProfile] = useState<ArtistProfileData | null>(null)
  const [photos, setPhotos] = useState<PhotoData[]>([])
  const [videos, setVideos] = useState<VideoData[]>([])
  const [crewMembers, setCrewMembers] = useState<CrewMemberData[]>([])
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)

  const completionDefinitions = useMemo<CompletionItemDefinition[]>(() => ([
    { id: 'stage_name', label: 'Artist Name', required: true, section: 'profile' },
    { id: 'artist_type', label: 'Artist Type', required: true, section: 'type' },
    { id: 'artist_sub_types', label: 'Artist Sub-Type', required: true, dependsOn: ['artist_type'], section: 'type' },
    { id: 'established_date', label: 'Artist Formed', required: true, section: 'profile' },
    { id: 'genres', label: 'Artist Genre(s)', required: true, section: 'genres' },
    { id: 'payments', label: 'Artist Payments', section: 'payments' },
    { id: 'crew', label: 'Artist Crew', section: 'crew' },
    { id: 'royalty_splits', label: 'Default Gig Royalty Splits', section: 'royalty' },
    { id: 'gig_ability', label: 'Artist Gig-Ability', section: 'gigability' },
    { id: 'bio', label: 'Artist Biography', section: 'bio' },
    { id: 'record_label', label: 'Record Label', section: 'contract' },
    { id: 'music_publisher', label: 'Music Publisher', section: 'contract' },
    { id: 'artist_manager', label: 'Artist Manager', section: 'contract' },
    { id: 'booking_agent', label: 'Booking Agent', section: 'contract' },
    { id: 'gig_fee', label: 'Basic Gig Fee', required: true, section: 'gigability' },
    { id: 'logo_artwork', label: 'Logo/Profile Artwork', required: true, section: 'logo' },
    { id: 'photos', label: 'Photos', required: true, section: 'photos' },
    { id: 'videos', label: 'Videos', required: true, section: 'videos' }
  ]), [])

  const evaluatedItems = useMemo<CompletionItemState[]>(() => {
    const hasLogo = photos.some(p => p.type === 'logo')
    const hasPhotos = photos.some(p => p.type === 'photo')
    const hasVideos = videos.length > 0
    const hasCrewMembers = crewMembers.length > 0
    const totalRoyaltyShare = crewMembers.reduce((sum, member) => {
      const share = typeof member.metadata?.gigRoyaltyShare === 'number'
        ? member.metadata.gigRoyaltyShare
        : 0
      return sum + share
    }, 0)
    const hasAnyRoyaltyShare = crewMembers.some(member => {
      const share = member.metadata?.gigRoyaltyShare
      return typeof share === 'number' && share > 0
    })
    const hasCompleteRoyaltySplits = hasCrewMembers && hasAnyRoyaltyShare && Math.abs(totalRoyaltyShare - 100) < 0.01

    // Check if payments are configured
    const hasPayments = !!paymentDetails && (
      paymentDetails.use_fan_banking === true ||
      (
        !!paymentDetails.payment_out_method &&
        (
          (paymentDetails.payment_out_method === 'direct_debit' && !!paymentDetails.payment_out_bank_name && !!paymentDetails.payment_out_account_number) ||
          (paymentDetails.payment_out_method === 'card' && !!paymentDetails.payment_out_bank_name)
        )
      )
    )

    const isSignedStatus = (value?: string | null) => value === 'signed'
    const isContractStatusSet = (value?: string | null) => {
      return ['signed', 'unsigned_seeking', 'independent', 'seeking', 'self_managed'].includes(value ?? '')
    }
    const isContractItemComplete = (status?: string | null, name?: string | null) => {
      if (!isContractStatusSet(status)) return false
      if (isSignedStatus(status)) {
        return Boolean(name && name.trim().length > 0)
      }
      return true
    }

    const profileMetrics: Record<string, boolean> = {
      stage_name: !!profile?.stage_name,
      artist_type: !!profile?.artist_type_id,
      artist_sub_types: Array.isArray(profile?.artist_sub_types) && profile!.artist_sub_types!.length > 0,
      established_date: !!profile?.established_date,
      genres: Array.isArray(profile?.preferred_genre_ids) && profile!.preferred_genre_ids!.length > 0,
      payments: hasPayments,
      crew: hasCrewMembers,
      royalty_splits: hasCompleteRoyaltySplits,
      gig_ability: !!(profile?.minimum_set_length && profile?.maximum_set_length),
      bio: Boolean(profile?.bio && profile.bio.trim().length > 0),
      record_label: isContractItemComplete(profile?.record_label_status, profile?.record_label_name),
      music_publisher: isContractItemComplete(profile?.music_publisher_status, profile?.music_publisher_name),
      artist_manager: isContractItemComplete(profile?.artist_manager_status, profile?.artist_manager_name),
      booking_agent: isContractItemComplete(profile?.booking_agent_status, profile?.booking_agent_name),
      gig_fee: !!(profile?.local_gig_fee || profile?.wider_gig_fee),
      logo_artwork: hasLogo,
      photos: hasPhotos,
      videos: hasVideos
    }

    return completionDefinitions.map(def => {
      const depsMet = (def.dependsOn ?? []).every(id => profileMetrics[id])
      return {
        ...def,
        completed: depsMet && profileMetrics[def.id]
      }
    })
  }, [completionDefinitions, profile, photos, videos, crewMembers, paymentDetails])

  useEffect(() => {
    onCompletionStateChange?.(evaluatedItems)
  }, [evaluatedItems, onCompletionStateChange])

  const completedCount = useMemo(() => evaluatedItems.filter(item => item.completed).length, [evaluatedItems])
  const totalCount = evaluatedItems.length
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)
  const requiredItems = useMemo(() => evaluatedItems.filter(item => item.required), [evaluatedItems])
  const requiredCompletedCount = useMemo(() => requiredItems.filter(item => item.completed).length, [requiredItems])
  const allRequiredComplete = requiredCompletedCount === requiredItems.length && requiredItems.length > 0

  useEffect(() => {
    const recent = searchParams.get('completed')
    if (recent) setRecentlyCompleted(recent)
  }, [searchParams])

  useEffect(() => {
    if (!user) return

    const loadCompletionStatus = async () => {
      setLoading(true)
      try {
        // Fetch all data in parallel
        const [profileResponse, photosResponse, videosResponse, crewResponse, paymentsResponse] = await Promise.all([
          fetch('/api/artist-profile'),
          fetch('/api/artist-photos'),
          fetch('/api/artist-videos'),
          fetch('/api/artist-members'),
          fetch('/api/artist-payments')
        ])

        // Handle profile data
        const profileResult = await profileResponse.json()
        if (profileResult.data) {
          const rawProfile = profileResult.data as ArtistProfileData & { onboarding_completed?: boolean }
          setProfile(rawProfile)
          setOnboardingCompleted(rawProfile.onboarding_completed ?? false)
        } else {
          setProfile(null)
          setOnboardingCompleted(false)
        }

        // Handle photos data
        const photosResult = await photosResponse.json()
        if (photosResult.data) {
          setPhotos(photosResult.data)
        }

        // Handle videos data
        const videosResult = await videosResponse.json()
        if (videosResult.data) {
          setVideos(videosResult.data)
        }

        // Handle crew data
        const crewResult = await crewResponse.json()
        const invitationMembers = Array.isArray(crewResult.invitations) ? crewResult.invitations : []
        const activeMembers = Array.isArray(crewResult.activeMembers) ? crewResult.activeMembers : []
        const combinedCrewMembers = [...invitationMembers, ...activeMembers]
        setCrewMembers(combinedCrewMembers)

        // Handle payments data
        const paymentsResult = await paymentsResponse.json()
        if (paymentsResult.data) {
          setPaymentDetails(paymentsResult.data)
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

  const handleCompleteOnboarding = async () => {
    if (!user || onboardingCompleted || !allRequiredComplete) return

    setIsMarkingComplete(true)
    try {
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_completed: true
        })
      })

      if (response.ok) {
        setOnboardingCompleted(true)
        router.refresh()
      } else {
        console.error('Failed to mark onboarding as complete')
      }
    } catch (error) {
      console.error('Error marking onboarding as complete:', error)
    } finally {
      setIsMarkingComplete(false)
    }
  }

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
                {onboardingCompleted ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                    <PartyPopper className="w-4 h-4" />
                    <span>Onboarding Complete!</span>
                  </div>
                ) : allRequiredComplete ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-medium">
                      All required fields complete!
                    </p>
                    <Button
                      onClick={handleCompleteOnboarding}
                      disabled={isMarkingComplete}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {isMarkingComplete ? 'Completing...' : 'Complete Onboarding'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Complete all required fields to finish onboarding
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
