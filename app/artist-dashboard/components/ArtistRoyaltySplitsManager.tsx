"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../../lib/auth-context'
import { cn } from '../../../lib/utils'

interface TeamMember {
  id: string
  name: string
  nickname: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
  status: 'joined' | 'invited' | 'invite'
  gigRoyaltyShare?: number
  merchRoyaltyShare?: number
  isProfileOwner?: boolean
  memberType?: 'performer' | 'support'
  isPerformer?: boolean
  isShareholder?: boolean
  isMainContact?: boolean
  isCurrentMember?: boolean
  dateLeft?: string
}

interface InvitationResponse {
  id: string
  name?: string
  email?: string
  status?: 'pending' | 'accepted' | 'rejected'
  metadata?: {
    nickname?: string
    firstName?: string
    lastName?: string
    email?: string
    gigRoyaltyShare?: number
    merchRoyaltyShare?: number
    memberType?: 'performer' | 'support'
    isPerformer?: boolean
    isShareholder?: boolean
    isMainContact?: boolean
    isCurrentMember?: boolean
    dateLeft?: string
  }
  roles?: string[]
}

interface MemberResponse {
  id: string
  name?: string
  email?: string
  metadata?: {
    nickname?: string
    firstName?: string
    lastName?: string
    email?: string
    gigRoyaltyShare?: number
    merchRoyaltyShare?: number
    memberType?: 'performer' | 'support'
    isPerformer?: boolean
    isShareholder?: boolean
    isMainContact?: boolean
    isCurrentMember?: boolean
    dateLeft?: string
  }
  roles?: string[]
}

type SplitType = 'gig' | 'merch'

export function ArtistRoyaltySplitsManager() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeamMembers()
  }, [user])

  const loadTeamMembers = async () => {
    try {
      setLoading(true)
      const [membersResponse, profileResponse] = await Promise.all([
        fetch('/api/artist-members', { cache: 'no-store' }),
        fetch('/api/artist-profile', { cache: 'no-store' })
      ])

      let ownerMember: TeamMember | null = null
      if (profileResponse.ok) {
        const profileResult = await profileResponse.json()
        const profile = profileResult?.data
        const profileId = typeof profile?.user_id === 'string' ? profile.user_id : user?.id
        const locationDetails = profile?.location_details && typeof profile.location_details === 'object' && !Array.isArray(profile.location_details)
          ? profile.location_details as Record<string, unknown>
          : {}
        const pricing = locationDetails.gig_pricing && typeof locationDetails.gig_pricing === 'object' && !Array.isArray(locationDetails.gig_pricing)
          ? locationDetails.gig_pricing as Record<string, unknown>
          : {}
        const merchPricing = locationDetails.merch_pricing && typeof locationDetails.merch_pricing === 'object' && !Array.isArray(locationDetails.merch_pricing)
          ? locationDetails.merch_pricing as Record<string, unknown>
          : {}
        const ownerShareRaw = pricing.owner_gig_royalty_share
        const ownerShare = typeof ownerShareRaw === 'number'
          ? ownerShareRaw
          : Number.parseFloat(String(ownerShareRaw ?? '0'))
        const ownerMerchShareRaw = merchPricing.owner_merch_royalty_share
        const ownerMerchShare = typeof ownerMerchShareRaw === 'number'
          ? ownerMerchShareRaw
          : Number.parseFloat(String(ownerMerchShareRaw ?? '0'))
        const getOwnerString = (key: string) => {
          const value = locationDetails[key]
          return typeof value === 'string' ? value : ''
        }
        const getUserMetadataString = (key: string) => {
          const value = user?.user_metadata?.[key]
          return typeof value === 'string' ? value.trim() : ''
        }
        const getOwnerBoolean = (key: string, fallback = false) => {
          const value = locationDetails[key]
          return typeof value === 'boolean' ? value : fallback
        }
        const ownerFirstName = getOwnerString('artist_owner_first_name') || getUserMetadataString('first_name')
        const ownerLastName = getOwnerString('artist_owner_last_name') || getUserMetadataString('last_name')
        const ownerNickname = getOwnerString('artist_owner_nickname')
        const ownerEmail = getOwnerString('artist_owner_email') || user?.email || ''
        const ownerDisplayName = [ownerFirstName, ownerNickname ? `"${ownerNickname}"` : '', ownerLastName]
          .filter(Boolean)
          .join(' ')
          .trim()

        ownerMember = {
          id: `owner:${profileId || user?.id || 'self'}`,
          name: ownerDisplayName || ownerEmail || 'Profile Owner',
          nickname: ownerNickname,
          firstName: ownerFirstName,
          lastName: ownerLastName,
          email: ownerEmail,
          roles: ['Artist Profile Owner'],
          status: 'joined',
          gigRoyaltyShare: Number.isFinite(ownerShare) ? ownerShare : 0,
          merchRoyaltyShare: Number.isFinite(ownerMerchShare) ? ownerMerchShare : 0,
          isProfileOwner: true,
          memberType: 'performer',
          isPerformer: getOwnerBoolean('artist_owner_is_performer', true),
          isShareholder: getOwnerBoolean('artist_owner_is_shareholder', false),
          isMainContact: getOwnerBoolean('artist_owner_is_main_contact', false),
          isCurrentMember: true
        }
      }

      if (membersResponse.ok) {
        const result = await membersResponse.json()
        
        // Convert invitations and active members to team members
        const allMembers: TeamMember[] = []
        
        // Add invitations
        if (result.invitations) {
          result.invitations.forEach((inv: InvitationResponse) => {
            allMembers.push({
              id: inv.id,
              name: inv.name || 'Unknown',
              nickname: inv.metadata?.nickname || '',
              firstName: inv.metadata?.firstName || '',
              lastName: inv.metadata?.lastName || '',
              email: inv.email || inv.metadata?.email || '',
              roles: inv.roles || [],
              status: inv.status === 'pending' ? 'invited' : inv.status === 'accepted' ? 'joined' : 'invited',
              gigRoyaltyShare: inv.metadata?.gigRoyaltyShare || 0,
              merchRoyaltyShare: inv.metadata?.merchRoyaltyShare || 0,
              memberType: inv.metadata?.memberType || 'performer',
              isPerformer: inv.metadata?.isPerformer ?? inv.metadata?.memberType !== 'support',
              isShareholder: Boolean(inv.metadata?.isShareholder),
              isMainContact: Boolean(inv.metadata?.isMainContact),
              isCurrentMember: inv.metadata?.isCurrentMember !== false,
              dateLeft: inv.metadata?.dateLeft || ''
            })
          })
        }

        // Add active members
        if (result.activeMembers) {
          result.activeMembers.forEach((member: MemberResponse) => {
            allMembers.push({
              id: member.id,
              name: member.name || 'Unknown',
              nickname: member.metadata?.nickname || '',
              firstName: member.metadata?.firstName || '',
              lastName: member.metadata?.lastName || '',
              email: member.email || member.metadata?.email || '',
              roles: member.roles || [],
              status: 'joined',
              gigRoyaltyShare: member.metadata?.gigRoyaltyShare || 0,
              merchRoyaltyShare: member.metadata?.merchRoyaltyShare || 0,
              memberType: member.metadata?.memberType || 'performer',
              isPerformer: member.metadata?.isPerformer ?? member.metadata?.memberType !== 'support',
              isShareholder: Boolean(member.metadata?.isShareholder),
              isMainContact: Boolean(member.metadata?.isMainContact),
              isCurrentMember: member.metadata?.isCurrentMember !== false,
              dateLeft: member.metadata?.dateLeft || ''
            })
          })
        }
        
        const currentMembers = allMembers.filter(member => member.isCurrentMember !== false)
        setTeamMembers(ownerMember ? [ownerMember, ...currentMembers] : currentMembers)
      } else {
        setTeamMembers(ownerMember ? [ownerMember] : [])
      }
    } catch (error) {
      console.error('Error loading team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalGigRoyalties = () => {
    return teamMembers.reduce((total, member) => total + (member.gigRoyaltyShare || 0), 0)
  }

  const calculateTotalMerchRoyalties = () => {
    return teamMembers.reduce((total, member) => total + (member.merchRoyaltyShare || 0), 0)
  }

  const updateMemberGigRoyalty = (id: string, share: number) => {
    setTeamMembers(prev => prev.map(member =>
      member.id === id ? { ...member, gigRoyaltyShare: share } : member
    ))
  }

  const updateMemberMerchRoyalty = (id: string, share: number) => {
    setTeamMembers(prev => prev.map(member =>
      member.id === id ? { ...member, merchRoyaltyShare: share } : member
    ))
  }

  const getDisplayName = (member: TeamMember) => {
    if (member.nickname && member.firstName && member.lastName) {
      return `${member.firstName} "${member.nickname}" ${member.lastName}`
    } else if (member.nickname && member.firstName) {
      return `${member.firstName} "${member.nickname}"`
    } else if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`
    } else {
      return member.name || 'Unknown'
    }
  }

  const isPerformerMember = (member: TeamMember) => {
    return member.isPerformer ?? member.memberType !== 'support'
  }

  const renderMemberBadges = (member: TeamMember) => (
    <div className="flex flex-wrap items-center gap-2 mt-1">
      <span className={cn(
        "text-xs px-2 py-1 rounded",
        member.status === 'joined' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
      )}>
        {member.status === 'joined' ? 'Joined' : 'Invited'}
      </span>
      {member.isProfileOwner ? (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">Owner</Badge>
      ) : null}
      {isPerformerMember(member) ? (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">Performer</Badge>
      ) : null}
      {member.memberType === 'support' ? (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Support Crew</Badge>
      ) : null}
      {member.isShareholder ? (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Shareholder</Badge>
      ) : null}
      {member.isMainContact ? (
        <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 border-cyan-200">Main Contact</Badge>
      ) : null}
    </div>
  )

  const goToShareholders = () => {
    if (typeof window === 'undefined') return
    window.location.href = '/artist-dashboard?section=crew&subSection=view-shareholders'
  }

  const saveMoneySplits = async (splitType: SplitType) => {
    const isGig = splitType === 'gig'
    const label = isGig ? 'Gig' : 'Merch'
    const total = isGig ? calculateTotalGigRoyalties() : calculateTotalMerchRoyalties()

    try {
      if (Math.abs(total - 100) > 0.01) {
        alert(`${label} money splits must add up to 100%. Current total is ${total.toFixed(2)}%.`)
        return
      }

      const savePromises = teamMembers.map(async (member) => {
        if (member.id.startsWith('owner:') || member.isProfileOwner) {
          const profileResponse = await fetch('/api/artist-profile', { cache: 'no-store' })
          const profilePayload = await profileResponse.json().catch(() => ({}))
          const profile = profilePayload?.data
          const locationDetails = profile?.location_details && typeof profile.location_details === 'object' && !Array.isArray(profile.location_details)
            ? profile.location_details as Record<string, unknown>
            : {}
          const pricing = locationDetails.gig_pricing && typeof locationDetails.gig_pricing === 'object' && !Array.isArray(locationDetails.gig_pricing)
            ? locationDetails.gig_pricing as Record<string, unknown>
            : {}
          const merchPricing = locationDetails.merch_pricing && typeof locationDetails.merch_pricing === 'object' && !Array.isArray(locationDetails.merch_pricing)
            ? locationDetails.merch_pricing as Record<string, unknown>
            : {}

          const ownerUpdate = await fetch('/api/artist-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              location_details: {
                ...locationDetails,
                ...(isGig
                  ? {
                      gig_pricing: {
                        ...pricing,
                        owner_gig_royalty_share: member.gigRoyaltyShare || 0
                      }
                    }
                  : {
                      merch_pricing: {
                        ...merchPricing,
                        owner_merch_royalty_share: member.merchRoyaltyShare || 0
                      }
                    })
              }
            })
          })

          if (!ownerUpdate.ok) {
            const ownerError = await ownerUpdate.json().catch(() => ({}))
            throw new Error(ownerError.error || `Failed to save profile owner ${label.toLowerCase()} money share`)
          }

          return { success: true }
        }

        const response = await fetch('/api/artist-members', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            memberId: member.id,
            ...(isGig
              ? { gigRoyaltyShare: member.gigRoyaltyShare || 0 }
              : { merchRoyaltyShare: member.merchRoyaltyShare || 0 })
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || `Failed to save ${label.toLowerCase()} money splits`)
        }

        return response.json()
      })

      await Promise.all(savePromises)
      window.dispatchEvent(new CustomEvent('artist-profile-updated', { detail: { source: `royalty-${splitType}` } }))
      alert(`${label} money splits saved successfully!`)
    } catch (error) {
      console.error(`Error saving ${splitType} money splits:`, error)
      alert(`Failed to save ${label.toLowerCase()} money splits. Please try again.`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card id="artist-royalty-overview" className="scroll-mt-28">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-purple-900">Money Splits</CardTitle>
            <Button
              type="button"
              variant="outline"
              className="w-fit border-amber-300 text-amber-800 hover:bg-amber-50"
              onClick={goToShareholders}
            >
              Confirm / Update Shareholder Details
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Set the default split of Artist income for gigs, collabs, and MyStore. These defaults can use different people and percentages.
          </p>
          <p className="text-sm text-gray-600">
            Ignore other Rights Holders here - this is purely for the Artist-share of income, and how that is divided among Artist Members (and your Artist Support Team, if they get a share).
          </p>
          <p className="text-sm font-medium text-gray-700">
            Only individual people are listed below. The Artist Entity itself is not a default split line item.
          </p>
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Think of Money Splits like this:</strong><br/>
              When Gigrilla pays Artist income out, which members of your Artist team get paid, and what share?
            </p>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>ℹ️ Gig & Collab Money Splits can be adjusted on an individual booking basis from your Control Panel later.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>ℹ️ MyStore Money Splits can use a different set of people and percentages from Gig & Collab Money Splits.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>ℹ️ Each split section must add up to 100% before it can be saved.</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Gig & Collab Money Splits */}
      <Card id="artist-royalty-splits" className="scroll-mt-28">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-purple-900">Gig & Collab Money Splits</h4>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-700 font-medium">
                [[{calculateTotalGigRoyalties().toFixed(2)}%]] = Total % Share of Default Artist Gig & Collab Money Splits Assigned
              </span>
              <span className="text-orange-700 font-medium">
                [{(100 - calculateTotalGigRoyalties()).toFixed(2)}%] = Total % Share of Default Artist Gig & Collab Money Splits Remaining
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map((member) => (
                <div key={`gig-${member.id}`} className="p-4 border border-purple-200 rounded-lg bg-white">
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-purple-900">{getDisplayName(member)}</h5>
                      <p className="text-sm text-purple-700">
                        {member.roles.length > 0 ? member.roles.join('; ') : 'No roles assigned'}
                      </p>
                      {renderMemberBadges(member)}
                    </div>
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-purple-700">
                        Default % Share of Gig & Collab Money =
                      </Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={member.gigRoyaltyShare || 0}
                          onChange={(e) => updateMemberGigRoyalty(member.id, parseFloat(e.target.value) || 0)}
                          className="w-20 border-purple-200 focus:border-purple-400"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <span className="text-purple-700">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No team members added yet.</p>
              <p className="text-sm">Add team members in the Artist Crew section first.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Gig Button */}
      {teamMembers.length > 0 && (
        <Card id="artist-royalty-save" className="scroll-mt-28">
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <button
                onClick={() => saveMoneySplits('gig')}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Gig & Collab Money Splits
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MyStore Money Splits */}
      <Card id="artist-royalty-merch-splits" className="scroll-mt-28">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-purple-900">MyStore Money Splits</h4>
              <p className="mt-1 text-sm text-gray-600">
                Use this when MyStore income should be distributed to a different set of people than gig and collab income.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-700 font-medium">
                [[{calculateTotalMerchRoyalties().toFixed(2)}%]] = Total % Share of Default Artist MyStore Money Splits Assigned
              </span>
              <span className="text-orange-700 font-medium">
                [{(100 - calculateTotalMerchRoyalties()).toFixed(2)}%] = Total % Share of Default Artist MyStore Money Splits Remaining
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map((member) => (
                <div key={`merch-${member.id}`} className="p-4 border border-purple-200 rounded-lg bg-white">
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-purple-900">{getDisplayName(member)}</h5>
                      <p className="text-sm text-purple-700">
                        {member.roles.length > 0 ? member.roles.join('; ') : 'No roles assigned'}
                      </p>
                      {renderMemberBadges(member)}
                    </div>
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-purple-700">
                        Default % Share of MyStore Money =
                      </Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={member.merchRoyaltyShare || 0}
                          onChange={(e) => updateMemberMerchRoyalty(member.id, parseFloat(e.target.value) || 0)}
                          className="w-20 border-purple-200 focus:border-purple-400"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <span className="text-purple-700">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No team members added yet.</p>
              <p className="text-sm">Add team members in the Artist Crew section first.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Merch Button */}
      {teamMembers.length > 0 && (
        <Card id="artist-royalty-merch-save" className="scroll-mt-28">
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <button
                onClick={() => saveMoneySplits('merch')}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Save MyStore Money Splits
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
