"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
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
  }
  roles?: string[]
}

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
      const response = await fetch('/api/artist-members')
      if (response.ok) {
        const result = await response.json()
        
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
              gigRoyaltyShare: inv.metadata?.gigRoyaltyShare || 0
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
              gigRoyaltyShare: member.metadata?.gigRoyaltyShare || 0
            })
          })
        }
        
        setTeamMembers(allMembers)
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

  const updateMemberGigRoyalty = (id: string, share: number) => {
    setTeamMembers(prev => prev.map(member =>
      member.id === id ? { ...member, gigRoyaltyShare: share } : member
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

  const saveRoyaltySplits = async () => {
    try {
      const savePromises = teamMembers.map(async (member) => {
        const response = await fetch('/api/artist-members', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            memberId: member.id,
            gigRoyaltyShare: member.gigRoyaltyShare || 0
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to save gig royalty splits')
        }

        return response.json()
      })

      await Promise.all(savePromises)
      alert('Gig royalty splits saved successfully!')
    } catch (error) {
      console.error('Error saving gig royalty splits:', error)
      alert('Failed to save gig royalty splits. Please try again.')
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
      <Card>
        <CardHeader>
          <CardTitle className="text-purple-900">Default Gig Royalty Splits</CardTitle>
          <p className="text-sm text-gray-600">
            Gig royalties are paid directly to Rights Holders. Now you can set the default Gig Royalty Splits.
          </p>
          <p className="text-sm text-gray-600">
            Ignore other Rights Holders here - this is purely for the Artist-share of Gig Royalties, and how that is divided among Artist Members (and your Artist Support Team, if they get a share).
          </p>
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Think of Default Gig Royalty Splits like this:</strong><br/>
              When you perform a Gig, which members of your Artist team get paid, and what share?
            </p>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>ℹ️ Gig Royalty Splits can be adjusted on an individual gig basis from your Control Panel later.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>ℹ️ Individual Members will be paid their share of Gig Royalties directly via Gigrilla.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>ℹ️ All Gig Royalties owed to the Artist&apos;s members must add-up to 100%.</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Gig Royalty Splits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-purple-900">Team Members Gig Royalty Splits</h4>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-700 font-medium">
                [[{calculateTotalGigRoyalties().toFixed(2)}%]] = Total % Share of Default Artist Gig Royalty Splits Assigned
              </span>
              <span className="text-orange-700 font-medium">
                [{(100 - calculateTotalGigRoyalties()).toFixed(2)}%] = Total % Share of Default Artist Gig Royalty Splits Remaining
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          member.status === 'joined' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        )}>
                          {member.status === 'joined' ? 'Joined' : 'Invited'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium text-purple-700">
                        Default % Share of Royalties =
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

      {/* Save Button */}
      {teamMembers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <button
                onClick={saveRoyaltySplits}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Gig Royalty Splits
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
