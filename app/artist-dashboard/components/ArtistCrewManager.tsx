'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Switch } from '../../components/ui/switch'
// Separator import removed - not used
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible'
import { ChevronDown, ChevronUp, Plus, User, Users2, Music, Mic, Guitar, Drum, Piano, Keyboard, Briefcase, Settings, ExternalLink, CheckCircle2, XCircle, AlertCircle, Loader2, Info } from 'lucide-react'
import { useAuth } from '../../../lib/auth-context'
import { cn } from '../../../lib/utils'
import {
  validateISNI,
  validateIPI,
  formatISNI,
  formatIPI,
  lookupISNI,
  PROFESSIONAL_ID_URLS,
  type ValidationStatus,
  type ISNILookupResult,
  getValidationStatusClasses
} from '../../../lib/professional-id-utils'

interface CrewMember {
  id: string
  name: string
  nickname: string
  dateOfBirth: string
  hometown: string
  roles: string[]
  instruments: string[]
  management: string[]
  isPublic: boolean
  isProfileOwner: boolean
  email?: string
  phone?: string
  isAdmin?: boolean
  status?: 'joined' | 'invited' | 'invite'
  firstName?: string
  lastName?: string
  performerIsni?: string
  creatorIpiCae?: string
}

interface InvitationData {
  id: string
  name?: string
  email?: string
  roles?: string[]
  status?: 'pending' | 'accepted' | 'rejected'
  metadata?: {
    nickname?: string
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    roles?: string[]
    instruments?: string[]
    management?: string[]
    isPublic?: boolean
    isAdmin?: boolean
  }
}

interface MemberData {
  id: string
  name?: string
  email?: string
  roles?: string[]
  metadata?: {
    nickname?: string
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    roles?: string[]
    instruments?: string[]
    management?: string[]
    isPublic?: boolean
    isAdmin?: boolean
  }
}

interface RoleCategory {
  id: string
  name: string
  icon: React.ReactNode
  items: string[]
  expanded?: boolean
}

const ROLE_CATEGORIES: RoleCategory[] = [
  {
    id: 'songwriting',
    name: 'Songwriting & Composition',
    icon: <Music className="w-4 h-4" />,
    items: [
      'Songwriter (words and musical compositions for songs)',
      'Lyricist (words for songs)',
      'Composer (musical compositions)'
    ]
  },
  {
    id: 'vocals',
    name: 'Vocals',
    icon: <Mic className="w-4 h-4" />,
    items: [
      'All Vocals',
      'Lead Vocals',
      'Backing Vocals'
    ]
  },
  {
    id: 'strings',
    name: 'String Instruments',
    icon: <Guitar className="w-4 h-4" />,
    items: [
      'All String Instruments',
      'Banjo',
      'Bass Guitar',
      'Cello',
      'Double Bass',
      'Guitar',
      'Harp',
      'Lute',
      'Mandolin',
      'Nyckelharpa',
      'Phonofiddle',
      'Sitar',
      'Ukulele',
      'Viola',
      'Violin',
      'Zither'
    ]
  },
  {
    id: 'wind',
    name: 'Wind Instruments',
    icon: <Music className="w-4 h-4" />,
    items: [
      'All Wind Instruments',
      'Alboka',
      'Clarinet',
      'Didgeridoo',
      'Flute',
      'Harmonica',
      'Jaw Harp',
      'Kazoo',
      'Kubing',
      'Lur',
      'Nose Flute',
      'Oboe',
      'Recorder',
      'Saxophone',
      'Shawm',
      'Triton Shell',
      'Vuvuzela',
      'Whistle',
      'Xun'
    ]
  },
  {
    id: 'percussion',
    name: 'Percussion Instruments',
    icon: <Drum className="w-4 h-4" />,
    items: [
      'All Percussion Instruments',
      'Drum Set',
      'Hand Drums',
      'Mallet Percussion',
      'Metal Percussion',
      'Cowbell',
      'Shakers',
      'Misc. Percussion'
    ]
  },
  {
    id: 'keyboard',
    name: 'Keyboard Instruments',
    icon: <Piano className="w-4 h-4" />,
    items: [
      'All Keyboard Instruments',
      'Accordion',
      'Celesta',
      'Clavichord',
      'Harpsichord',
      'Melodica',
      'Organ',
      'Piano'
    ]
  },
  {
    id: 'electronic',
    name: 'Electronic Instruments',
    icon: <Keyboard className="w-4 h-4" />,
    items: [
      'All Electronic Instruments',
      'Electronic Keyboard',
      'Sampler',
      'Synthesizer'
    ]
  },
  {
    id: 'management-independent',
    name: 'Management - Independent',
    icon: <Briefcase className="w-4 h-4" />,
    items: [
      'All Management - Independent',
      'Artist Manager',
      'Booking Agent',
      'Finance & Accounts Manager',
      'Marketing Manager',
      'Personal Assistant',
      'Tour Manager'
    ]
  },
  {
    id: 'management-label',
    name: 'Management - Label-based',
    icon: <Settings className="w-4 h-4" />,
    items: [
      'All Management - Label-based',
      'A&R (Artists & Repertoire) Representative - Label',
      'Artist Manager - Label',
      'Brand Manager - Label',
      'Business Manager - Label',
      'Distribution Manager - Label',
      'Label Manager - Label',
      'Music Publicist - Label',
      'Personal Assistant - Label',
      'Radio Plugger / Promoter - Label',
      'Social Media Manager - Label',
      'Sync & Licensing Agent - Label',
      'Talent Agent - Label',
      'Tour Manager - Label',
      'Tour Support Staff - Label'
    ]
  }
]

export function ArtistCrewManager() {
  const { user } = useAuth()
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([])
  const [profileOwner, setProfileOwner] = useState<CrewMember | null>(null)
  const [savingOwner, setSavingOwner] = useState(false)
  const [updatingAdminMemberId, setUpdatingAdminMemberId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['vocals', 'strings']))
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState<Partial<CrewMember>>({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    phone: '',
    roles: [],
    isAdmin: false,
    status: 'invite'
  })
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    visible: boolean
  } | null>(null)

  // ISNI validation state
  const [isniValidation, setIsniValidation] = useState<{
    status: ValidationStatus
    message: string
    ownerData?: ISNILookupResult
    confirmed?: boolean
  }>({ status: 'idle', message: '' })

  // IPI/CAE validation state
  const [ipiValidation, setIpiValidation] = useState<{
    status: ValidationStatus
    message: string
    type?: 'CAE' | 'IPI'
  }>({ status: 'idle', message: '' })

  // Helper function to check if names match (fuzzy comparison)
  const namesMatch = useCallback((artistName: string, isniOwnerName: string): boolean => {
    if (!artistName || !isniOwnerName) return false

    // Normalize both names (lowercase, remove extra spaces, common punctuation)
    const normalize = (name: string) =>
      name.toLowerCase()
        .replace(/['".,\-]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    const normalizedArtist = normalize(artistName)
    const normalizedOwner = normalize(isniOwnerName)

    // Exact match after normalization
    if (normalizedArtist === normalizedOwner) return true

    // Check if one contains the other
    if (normalizedArtist.includes(normalizedOwner) || normalizedOwner.includes(normalizedArtist)) return true

    // Check individual words for partial matches
    const artistWords = normalizedArtist.split(' ').filter(w => w.length > 2)
    const ownerWords = normalizedOwner.split(' ').filter(w => w.length > 2)

    const matchingWords = artistWords.filter(w => ownerWords.includes(w))
    if (matchingWords.length >= 2) return true

    // Check if first name matches
    if (artistWords[0] && ownerWords[0] && artistWords[0] === ownerWords[0]) return true

    return false
  }, [])

  // ISNI validation handler with lookup and name comparison
  const validateISNIField = useCallback(async (value: string) => {
    if (!value.trim()) {
      setIsniValidation({ status: 'idle', message: '' })
      return
    }

    const result = validateISNI(value)
    if (!result.valid) {
      setIsniValidation({
        status: 'invalid',
        message: result.error || 'Invalid ISNI format'
      })
      return
    }

    // Format is valid, now look up the owner
    setIsniValidation({
      status: 'validating',
      message: 'Looking up ISNI owner...'
    })

    const lookupResult = await lookupISNI(value)

    if (lookupResult.success && lookupResult.data) {
      // Found the owner - check if name matches
      const artistName = profileOwner?.nickname || profileOwner?.name || ''
      const isMatch = namesMatch(artistName, lookupResult.data.name)

      if (isMatch) {
        // Names match - mark as valid
        setIsniValidation({
          status: 'valid',
          message: `✓ ISNI verified for: ${lookupResult.data.name}`,
          ownerData: lookupResult.data,
          confirmed: true
        })
      } else {
        // Names don't match - show warning
        setIsniValidation({
          status: 'warning',
          message: `This ISNI is registered to "${lookupResult.data.name}" which differs from your name "${artistName || 'Not set'}"`,
          ownerData: lookupResult.data,
          confirmed: false
        })
      }
    } else if (lookupResult.warning) {
      setIsniValidation({
        status: 'valid',
        message: lookupResult.warning
      })
    } else if (lookupResult.message) {
      setIsniValidation({
        status: 'valid',
        message: lookupResult.message
      })
    } else {
      setIsniValidation({
        status: 'valid',
        message: result.formatted ? `Valid ISNI: ${result.formatted}` : 'Valid ISNI format'
      })
    }
  }, [profileOwner?.nickname, profileOwner?.name, namesMatch])

  // Handle ISNI ownership confirmation
  const handleISNIConfirmation = useCallback((confirmed: boolean) => {
    setIsniValidation(prev => ({
      ...prev,
      status: confirmed ? 'valid' : 'warning',
      confirmed
    }))
  }, [])

  // IPI/CAE validation handler
  const validateIPIField = useCallback((value: string) => {
    if (!value.trim()) {
      setIpiValidation({ status: 'idle', message: '', type: undefined })
      return
    }

    const result = validateIPI(value)
    if (result.valid) {
      setIpiValidation({
        status: result.error ? 'warning' : 'valid',
        message: result.error || (result.formatted ? `Valid ${result.type}: ${result.formatted}` : 'Valid format'),
        type: result.type
      })
    } else {
      setIpiValidation({
        status: 'invalid',
        message: result.error || 'Invalid IPI/CAE format',
        type: undefined
      })
    }
  }, [])

  // Handle ISNI input change with formatting
  const handleISNIChange = useCallback((value: string) => {
    const cleaned = value.replace(/[^0-9\s\-Xx]/g, '').toUpperCase()
    updateProfileOwner({ performerIsni: cleaned })

    if (isniValidation.status !== 'idle') {
      setIsniValidation({ status: 'idle', message: '' })
    }

    const digitsOnly = cleaned.replace(/[\s\-]/g, '')
    if (digitsOnly.length === 16) {
      const formatted = formatISNI(digitsOnly)
      updateProfileOwner({ performerIsni: formatted })
      validateISNIField(digitsOnly)
    }
  }, [isniValidation.status, validateISNIField])

  // Handle IPI/CAE input change
  const handleIPIChange = useCallback((value: string) => {
    const cleaned = value.replace(/[^0-9\s]/g, '')
    updateProfileOwner({ creatorIpiCae: cleaned })

    if (ipiValidation.status !== 'idle') {
      setIpiValidation({ status: 'idle', message: '', type: undefined })
    }

    const digitsOnly = cleaned.replace(/\s/g, '')
    if (digitsOnly.length >= 9 && digitsOnly.length <= 11) {
      const formatted = formatIPI(digitsOnly)
      updateProfileOwner({ creatorIpiCae: formatted })
      validateIPIField(digitsOnly)
    }
  }, [ipiValidation.status, validateIPIField])

  useEffect(() => {
    // Load crew data from API
    loadCrewData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadCrewData = async () => {
    try {
      // Load artist profile data to get stage name and other info
      const profileResponse = await fetch('/api/artist-profile')
      if (profileResponse.ok) {
        const profileResult = await profileResponse.json()
        const profileData = profileResult.data

        // Load fan profile data for personal info
        const fanProfileResponse = await fetch('/api/fan-profile')
        let fanProfileData = null
        if (fanProfileResponse.ok) {
          const fanResult = await fanProfileResponse.json()
          fanProfileData = fanResult.data
          console.log('Fan Profile Data:', fanProfileData)
        } else {
          console.log('Fan Profile Response:', fanProfileResponse.status)
        }

        // Load existing team members and invitations
        const membersResponse = await fetch('/api/artist-members')
        let membersData = { invitations: [], activeMembers: [] }
        if (membersResponse.ok) {
          const membersResult = await membersResponse.json()
          membersData = membersResult
          console.log('Members Data:', membersResult)
        } else {
          console.log('Members Response:', membersResponse.status)
        }

        if (user) {
          const dateOfBirth = user?.user_metadata?.date_of_birth || ''
          const hometown = [
            profileData?.hometown_city,
            profileData?.hometown_state,
            profileData?.hometown_country
          ].filter(Boolean).join(', ') || profileData?.base_location || fanProfileData?.location_details?.city || ''

          console.log('Extracted Date of Birth:', dateOfBirth)
          console.log('Extracted Hometown:', hometown)
          console.log('Contact Details:', fanProfileData?.contact_details)
          console.log('Location Details:', fanProfileData?.location_details)

          const owner: CrewMember = {
            id: user.id,
            name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'Your Name',
            nickname: profileData?.stage_name || '',
            dateOfBirth: dateOfBirth,
            hometown: hometown,
            roles: Array.isArray(profileData?.artist_primary_roles)
              ? profileData.artist_primary_roles.filter((role: unknown): role is string => typeof role === 'string' && role.trim().length > 0)
              : [],
            instruments: [],
            management: [],
            isPublic: false,
            isProfileOwner: true,
            performerIsni: profileData?.performer_isni || '',
            creatorIpiCae: profileData?.creator_ipi_cae || ''
          }

          // Convert invitations to crew members
          const invitationMembers: CrewMember[] = (membersData.invitations || []).map((inv: InvitationData) => ({
            id: inv.id,
            name: inv.name || 'Unknown',
            nickname: inv.metadata?.nickname || '',
            firstName: inv.metadata?.firstName || '',
            lastName: inv.metadata?.lastName || '',
            email: inv.email,
            phone: '',
            roles: inv.roles || [],
            isAdmin: inv.metadata?.isAdmin || false,
            status: inv.status === 'pending' ? 'invited' : inv.status === 'accepted' ? 'joined' : 'invited',
            dateOfBirth: inv.metadata?.dateOfBirth || '',
            hometown: '',
            instruments: [],
            management: [],
            isPublic: false,
            isProfileOwner: false
          }))

          // Convert active members to crew members
          const activeMembers: CrewMember[] = (membersData.activeMembers || []).map((member: MemberData) => ({
            id: member.id,
            name: member.name || 'Unknown',
            nickname: member.metadata?.nickname || '',
            firstName: member.metadata?.firstName || '',
            lastName: member.metadata?.lastName || '',
            email: member.email,
            phone: '',
            roles: member.roles || [],
            isAdmin: member.metadata?.isAdmin || false,
            status: 'joined',
            dateOfBirth: member.metadata?.dateOfBirth || '',
            hometown: '',
            instruments: [],
            management: [],
            isPublic: false,
            isProfileOwner: false
          }))

          setProfileOwner(owner)
          setCrewMembers([owner, ...invitationMembers, ...activeMembers])
        }
      } else {
        // Fallback if no profile exists yet
        if (user) {
          const owner: CrewMember = {
            id: user.id,
            name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'Your Name',
            nickname: '',
            dateOfBirth: '',
            hometown: '',
            roles: [],
            instruments: [],
            management: [],
            isPublic: false,
            isProfileOwner: true
          }
          setProfileOwner(owner)
          setCrewMembers([owner])
        }
      }
    } catch (error) {
      console.error('Error loading crew data:', error)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const updateProfileOwner = (updates: Partial<CrewMember>) => {
    if (!profileOwner) return

    const updated = { ...profileOwner, ...updates }
    setProfileOwner(updated)
    setCrewMembers(prev => prev.map(member =>
      member.isProfileOwner ? updated : member
    ))
  }

  const saveProfileOwner = async () => {
    if (!profileOwner) return

    try {
      setSavingOwner(true)

      const hometownParts = profileOwner.hometown
        ? profileOwner.hometown.split(',').map(part => part.trim()).filter(Boolean)
        : []

      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stage_name: profileOwner.nickname?.trim() || null,
          artist_primary_roles: profileOwner.roles,
          performer_isni: profileOwner.performerIsni?.trim() || null,
          creator_ipi_cae: profileOwner.creatorIpiCae?.trim() || null,
          hometown_city: hometownParts[0] || null,
          hometown_state: hometownParts[1] || null,
          hometown_country: hometownParts[2] || null
        })
      })

      const result = await response.json()

      if (!response.ok || result?.error) {
        console.error('Failed to save profile owner info:', result)
        showNotification('error', `Failed to save your roles and info: ${result?.error || 'Unknown error'}`)
        return
      }

      showNotification('success', 'Your own roles and profile info were saved successfully')
    } catch (error) {
      console.error('Error saving profile owner info:', error)
      showNotification('error', 'Unable to save your roles and profile info right now.')
    } finally {
      setSavingOwner(false)
    }
  }

  const toggleRole = (role: string) => {
    if (!profileOwner) return

    const currentRoles = [...profileOwner.roles]
    const index = currentRoles.indexOf(role)

    if (index > -1) {
      currentRoles.splice(index, 1)
    } else {
      currentRoles.push(role)
    }

    updateProfileOwner({ roles: currentRoles })
  }

  const isRoleSelected = (role: string) => {
    return profileOwner?.roles.includes(role) || false
  }

  const addNewMember = () => {
    setShowAddMember(true)
  }

  const handleAddMember = async () => {
    if (!newMember.firstName || !newMember.email) {
      showNotification('error', 'Please fill in at least First Name and Email fields')
      return
    }

    try {
      // Call the API to create and send invitation
      const response = await fetch('/api/artist-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: newMember.firstName,
          lastName: newMember.lastName || '',
          nickname: newMember.nickname || '',
          email: newMember.email,
          phone: newMember.phone || '',
          roles: newMember.roles || [],
          isAdmin: newMember.isAdmin || false
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Failed to add member:', result)
        showNotification('error', `Failed to send invitation: ${result.error || 'Unknown error'}`)
        return
      }

      // Add the member to local state with the returned data
      const member: CrewMember = {
        id: result.data.id,
        name: result.data.name || `${newMember.firstName} ${newMember.lastName || ''}`.trim(),
        nickname: newMember.nickname || '',
        firstName: newMember.firstName,
        lastName: newMember.lastName || '',
        email: newMember.email,
        phone: newMember.phone || '',
        roles: newMember.roles || [],
        isAdmin: newMember.isAdmin || false,
        status: 'invited',
        dateOfBirth: '',
        hometown: '',
        instruments: [],
        management: [],
        isPublic: false,
        isProfileOwner: false
      }

      setCrewMembers(prev => [...prev, member])
      setNewMember({
        firstName: '',
        lastName: '',
        nickname: '',
        email: '',
        phone: '',
        roles: [],
        isAdmin: false,
        status: 'invite'
      })
      setShowAddMember(false)

      showNotification('success', `Invitation sent successfully to ${newMember.email}!`)
      console.log('Member invitation sent:', result.data)

    } catch (error) {
      console.error('Error adding member:', error)
      showNotification('error', 'Failed to send invitation. Please try again.')
    }
  }

  const removeMember = async (id: string) => {
    try {
      const response = await fetch('/api/artist-members', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Failed to remove member:', result)
        showNotification('error', `Failed to remove member: ${result.error || 'Unknown error'}`)
        return
      }

      setCrewMembers(prev => prev.filter(member => member.id !== id))
      showNotification('success', 'Team member removed successfully')
      console.log('Member removed successfully:', result)
    } catch (error) {
      console.error('Error removing member:', error)
      showNotification('error', 'Failed to remove member. Please try again.')
    }
  }

  const updateMemberAdmin = async (id: string, isAdmin: boolean) => {
    const previousMembers = crewMembers
    setCrewMembers(prev => prev.map(member =>
      member.id === id ? { ...member, isAdmin } : member
    ))
    setUpdatingAdminMemberId(id)

    try {
      const response = await fetch('/api/artist-members', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId: id,
          isAdmin
        })
      })

      const result = await response.json()
      if (!response.ok || result?.error) {
        throw new Error(result?.error || 'Failed to update admin rights')
      }

      showNotification('success', `Admin rights updated to ${isAdmin ? 'Yes' : 'No'}`)
    } catch (error) {
      console.error('Error updating member admin rights:', error)
      setCrewMembers(previousMembers)
      showNotification('error', 'Failed to update admin rights. Please try again.')
    } finally {
      setUpdatingAdminMemberId(null)
    }
  }

  const getDisplayName = (member: CrewMember) => {
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

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true })
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, visible: false } : null)
    }, 5000)
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && notification.visible && (
        <div className={cn(
          "p-4 rounded-lg border transition-all duration-300 transform",
          notification.type === 'success' && "bg-green-50 border-green-200 text-green-800",
          notification.type === 'error' && "bg-red-50 border-red-200 text-red-800",
          notification.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800"
        )}>
          <div className="flex items-start gap-3">
            {notification.type === 'success' && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-200 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-800" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {notification.type === 'error' && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-200 flex items-center justify-center">
                <svg className="w-3 h-3 text-red-800" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {notification.type === 'info' && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(prev => prev ? { ...prev, visible: false } : null)}
              className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Profile Owner Section */}
      <Card className="border-2 border-purple-200 bg-purple-50/30">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 border-b border-purple-200">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <User className="w-5 h-5" />
            Your Own Roles & Info
          </CardTitle>
          <p className="text-sm text-purple-700">
            Let&apos;s begin with you - the Artist Profile Owner - then add other members and admins.
          </p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {profileOwner && (
            <>
              {/* Personal Information */}
              <div className="space-y-4 p-4 rounded-lg bg-white/70 border border-purple-200">
                <h4 className="font-semibold text-sm text-purple-900">Personal Information</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-purple-700">Artist Real Name</Label>
                    <div className="p-3 rounded-lg bg-white border border-purple-200">
                      <p className="font-medium text-purple-900">{profileOwner.name}</p>
                      <p className="text-xs text-purple-600 mt-1">From Guest Fan Details</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="namePublic"
                          checked={profileOwner.isPublic}
                          onCheckedChange={(checked) => updateProfileOwner({ isPublic: checked })}
                        />
                        <label htmlFor="namePublic" className="text-purple-700">is public</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="namePrivate"
                          checked={!profileOwner.isPublic}
                          onCheckedChange={(checked) => updateProfileOwner({ isPublic: !checked })}
                        />
                        <label htmlFor="namePrivate" className="text-purple-700">is private, except contracts</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="artistNickname" className="text-xs font-medium text-purple-700">
                      Artist Nickname / Stagename
                    </Label>
                    <Input
                      id="artistNickname"
                      value={profileOwner.nickname}
                      onChange={(e) => updateProfileOwner({ nickname: e.target.value })}
                      placeholder="Enter Nickname / Stagename (if you have one)"
                      className="border-purple-200 focus:border-purple-400"
                    />
                    <p className="text-xs text-purple-600 italic">
                      is always public & searchable.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="artistDateOfBirth" className="text-xs font-medium text-purple-700">
                      Artist Date-of-Birth
                    </Label>
                    <Input
                      id="artistDateOfBirth"
                      type="date"
                      value={profileOwner.dateOfBirth || ''}
                      onChange={(e) => updateProfileOwner({ dateOfBirth: e.target.value })}
                      placeholder="dd/mm/yyyy"
                      className="border-purple-200 focus:border-purple-400"
                    />
                    <p className="text-xs text-purple-600">
                      {profileOwner.dateOfBirth ? '(PrePopulated - you can edit if needed)' : '(Enter your date of birth)'}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Switch id="dobPublic" />
                        <label htmlFor="dobPublic" className="text-purple-700">is public</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="dobPrivate" defaultChecked />
                        <label htmlFor="dobPrivate" className="text-purple-700">is private, except contracts</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="artistHometown" className="text-xs font-medium text-purple-700">
                      Artist Hometown
                    </Label>
                    <Input
                      id="artistHometown"
                      value={profileOwner.hometown || ''}
                      onChange={(e) => updateProfileOwner({ hometown: e.target.value })}
                      placeholder="Town/City, Country/State, Country"
                      className="border-purple-200 focus:border-purple-400"
                    />
                    <p className="text-xs text-purple-600">
                      {profileOwner.hometown ? '(PrePopulated - you can edit if needed)' : '(Enter your hometown)'}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Switch id="hometownPublic" />
                        <label htmlFor="hometownPublic" className="text-purple-700">is public</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="hometownPrivate" defaultChecked />
                        <label htmlFor="hometownPrivate" className="text-purple-700">is private, except contracts</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional IDs Section */}
              <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900">Professional Identification</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Each Artist Member and the Artist Entity can have individual ISNIs. Your unique digital ID prevents name confusion, ensures correct crediting, tracks all your work across platforms, and guarantees you get paid accurately.
                    </p>
                  </div>
                </div>

                {/* ISNI Field */}
                <div className="bg-white/60 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                        Artist Performer ISNI
                        {isniValidation.status === 'valid' && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                        {isniValidation.status === 'invalid' && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </Label>
                      <p className="text-xs text-blue-700 mt-1">
                        International Standard Name Identifier (16 digits) for Creators.
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a
                        href={PROFESSIONAL_ID_URLS.isni.search}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                      >
                        Get/Find <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      value={profileOwner.performerIsni || ''}
                      onChange={(e) => handleISNIChange(e.target.value)}
                      onBlur={() => validateISNIField(profileOwner.performerIsni || '')}
                      placeholder="Start Typing Performer ISNI…"
                      className={`bg-white pr-10 font-mono border-blue-200 ${getValidationStatusClasses(isniValidation.status).border}`}
                      maxLength={19}
                    />
                    {isniValidation.status === 'validating' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                  {isniValidation.message && (
                    <div className={`flex items-start gap-2 text-xs ${getValidationStatusClasses(isniValidation.status).text}`}>
                      {isniValidation.status === 'invalid' ? (
                        <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      ) : isniValidation.status === 'valid' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      ) : isniValidation.status === 'validating' ? (
                        <Loader2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 animate-spin" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{isniValidation.message}</span>
                    </div>
                  )}

                  {/* Owner Info Card - shown when ISNI owner is found */}
                  {isniValidation.ownerData && (
                    <div className={`rounded-lg p-3 border ${isniValidation.confirmed ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">
                            {isniValidation.ownerData.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {isniValidation.ownerData.name}
                          </h4>
                          {isniValidation.ownerData.creationRole && (
                            <p className="text-xs text-gray-500">
                              Role: {isniValidation.ownerData.creationRole}
                            </p>
                          )}
                          {isniValidation.ownerData.uri && (
                            <a
                              href={isniValidation.ownerData.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                            >
                              View on ISNI.org <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Confirmation checkbox */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isniValidation.confirmed || false}
                            onChange={(e) => handleISNIConfirmation(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-xs text-gray-700">
                            <strong>I confirm this ISNI belongs to me</strong> or I am authorized to use it.
                          </span>
                        </label>
                        {!isniValidation.confirmed && (
                          <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Please confirm this ISNI belongs to you.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* IPI/CAE Field - shown when Songwriter/Lyricist/Composer is selected */}
                {(profileOwner.roles.some(r =>
                  r.includes('Songwriter') || r.includes('Lyricist') || r.includes('Composer')
                ) || profileOwner.creatorIpiCae) && (
                    <div className="bg-white/60 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                            Creator IPI/CAE
                            {ipiValidation.status === 'valid' && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                            {ipiValidation.status === 'invalid' && (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            {ipiValidation.type && (
                              <span className="text-xs font-normal px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {ipiValidation.type}
                              </span>
                            )}
                          </Label>
                          <p className="text-xs text-blue-700 mt-1">
                            Interested Parties Number for Songwriters, Lyricists, Composers, and Music Publishers. Issued by PROs like ASCAP, BMI, PRS.
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <a
                            href={PROFESSIONAL_ID_URLS.ipi.search}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                          >
                            Get/Find <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <Input
                        value={profileOwner.creatorIpiCae || ''}
                        onChange={(e) => handleIPIChange(e.target.value)}
                        onBlur={() => validateIPIField(profileOwner.creatorIpiCae || '')}
                        placeholder="Start Typing Creator IPI/CAE…"
                        className={`bg-white font-mono border-blue-200 ${getValidationStatusClasses(ipiValidation.status).border}`}
                        maxLength={14}
                      />
                      {ipiValidation.message && (
                        <div className={`flex items-start gap-2 text-xs ${getValidationStatusClasses(ipiValidation.status).text}`}>
                          {ipiValidation.status === 'invalid' ? (
                            <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          ) : ipiValidation.status === 'valid' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          )}
                          <span>{ipiValidation.message}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-blue-600">
                        <span>Get from:</span>
                        <a href={PROFESSIONAL_ID_URLS.ipi.ascap} target="_blank" rel="noopener noreferrer" className="hover:underline">ASCAP</a>
                        <span>•</span>
                        <a href={PROFESSIONAL_ID_URLS.ipi.bmi} target="_blank" rel="noopener noreferrer" className="hover:underline">BMI</a>
                        <span>•</span>
                        <a href={PROFESSIONAL_ID_URLS.ipi.prs} target="_blank" rel="noopener noreferrer" className="hover:underline">PRS</a>
                      </div>
                    </div>
                  )}
              </div>

              {/* Roles Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-purple-900">Roles & Skills</h4>
                  <Button variant="outline" size="sm" className="text-purple-700 border-purple-200 hover:bg-purple-50">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Roles
                  </Button>
                </div>

                <div className="space-y-3">
                  {ROLE_CATEGORIES.map((category) => (
                    <Collapsible
                      key={category.id}
                      open={expandedCategories.has(category.id)}
                      onOpenChange={() => toggleCategory(category.id)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 transition-colors">
                          <div className="flex items-center gap-2">
                            {category.icon}
                            <span className="font-medium text-sm text-purple-900">{category.name}</span>
                          </div>
                          {expandedCategories.has(category.id) ? (
                            <ChevronUp className="w-4 h-4 text-purple-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-200">
                          {category.items.map((item) => (
                            <div key={item} className="flex items-center gap-2 py-1">
                              <Switch
                                id={item}
                                checked={isRoleSelected(item)}
                                onCheckedChange={() => toggleRole(item)}
                              />
                              <label htmlFor={item} className="text-sm text-purple-800 cursor-pointer">
                                {item}
                              </label>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>

              {/* Selected Roles Display */}
              {profileOwner.roles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-purple-900">Your Selected Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileOwner.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={saveProfileOwner}
                  disabled={savingOwner}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {savingOwner ? 'Saving…' : 'Save Your Own Roles & Info'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Members & Support Team Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Add Members & Support Team</span>
            {!showAddMember && (
              <Button onClick={addNewMember} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Every Artist has a team around them, supporting and keeping them organised. This is where you add any &apos;band members&apos; or anyone else you consider part of your &apos;crew&apos;.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              ℹ️ You select whether an Artist Member or Support Team Member is an Admin for this Profile. If you don&apos;t select them as an Admin, they will still be displayed on your Artist Profile once they accept your Invite, but they won&apos;t be able to manage this Artist Profile.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showAddMember && (
            <div className="space-y-4 p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50/30">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-purple-900">Add New Team Member</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMember(false)}
                  className="text-purple-700 border-purple-200"
                >
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-purple-700">
                    Given/FirstName?
                  </Label>
                  <Input
                    value={newMember.firstName || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First name"
                    className="border-purple-200 focus:border-purple-400"
                  />
                  <p className="text-xs text-purple-600">is private by default; they can choose to make this public.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-purple-700">
                    Surname/FamilyName?
                  </Label>
                  <Input
                    value={newMember.lastName || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last name"
                    className="border-purple-200 focus:border-purple-400"
                  />
                  <p className="text-xs text-purple-600">is private by default; they can choose to make this public.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-purple-700">
                    Nickname?
                  </Label>
                  <Input
                    value={newMember.nickname || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="Nickname"
                    className="border-purple-200 focus:border-purple-400"
                  />
                  <p className="text-xs text-purple-600 italic">is always public & searchable.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-purple-700">
                    Their Email?
                  </Label>
                  <Input
                    type="email"
                    value={newMember.email || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                    className="border-purple-200 focus:border-purple-400"
                  />
                  <p className="text-xs text-purple-600">is private. Used to securely match members to Profiles and to invite non-members.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-purple-700">
                    Their Phone?
                  </Label>
                  <Input
                    type="tel"
                    value={newMember.phone || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="border-purple-200 focus:border-purple-400"
                  />
                  <p className="text-xs text-purple-600">is private. Used to securely match members to Profiles and to invite non-members.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-medium text-purple-700">
                    Their Role(s)?
                  </Label>
                  <div className="bg-white border border-purple-200 rounded-lg p-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(newMember.roles || []).length > 0 ? (
                        (newMember.roles || []).map((role) => (
                          <Badge
                            key={role}
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 border-purple-300 pr-1"
                          >
                            {role}
                            <button
                              onClick={() => setNewMember(prev => ({
                                ...prev,
                                roles: (prev.roles || []).filter(r => r !== role)
                              }))}
                              className="ml-1 hover:text-purple-900"
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No roles selected</span>
                      )}
                    </div>
                    <Collapsible>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-2 rounded bg-purple-50 hover:bg-purple-100 transition-colors">
                          <span className="text-xs font-medium text-purple-700">+ Add Roles</span>
                          <ChevronDown className="w-3 h-3 text-purple-600" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 max-h-48 overflow-y-auto">
                        <div className="space-y-2 p-2 bg-purple-50/50 rounded-lg">
                          {ROLE_CATEGORIES.map((category) => (
                            <div key={category.id}>
                              <p className="text-xs font-semibold text-purple-800 mb-1">{category.name}</p>
                              <div className="flex flex-wrap gap-1">
                                {category.items.map((item) => (
                                  <button
                                    key={item}
                                    onClick={() => {
                                      const roles = newMember.roles || []
                                      if (!roles.includes(item)) {
                                        setNewMember(prev => ({
                                          ...prev,
                                          roles: [...(prev.roles || []), item]
                                        }))
                                      }
                                    }}
                                    disabled={(newMember.roles || []).includes(item)}
                                    className={cn(
                                      "text-xs px-2 py-0.5 rounded transition-colors",
                                      (newMember.roles || []).includes(item)
                                        ? "bg-purple-200 text-purple-500 cursor-not-allowed"
                                        : "bg-white border border-purple-200 text-purple-700 hover:bg-purple-100"
                                    )}
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-purple-700">
                    Artist Profile Admin Rights?
                  </Label>
                  <select
                    value={newMember.isAdmin ? 'Yes' : 'No'}
                    onChange={(e) => setNewMember(prev => ({ ...prev, isAdmin: e.target.value === 'Yes' }))}
                    className="w-full p-2 border border-purple-200 rounded-lg focus:border-purple-400 focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleAddMember}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  +Add & Invite Artist Profile Member
                </Button>
              </div>
            </div>
          )}

          {/* Manage Team Section */}
          {crewMembers.filter(member => !member.isProfileOwner).length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-purple-900">Manage Team</h4>
              <div className="space-y-3">
                {crewMembers.filter(member => !member.isProfileOwner).map((member) => (
                  <div key={member.id} className="p-4 border border-purple-200 rounded-lg bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-purple-900">
                          {getDisplayName(member)}
                        </h5>
                        <p className="text-sm text-purple-700 mt-1">
                          {member.roles.length > 0 ? member.roles.join('; ') : 'No roles assigned'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={member.status === 'joined' ? 'default' : 'secondary'}
                            className={member.status === 'joined' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {member.status === 'joined' ? 'Joined' : member.status === 'invited' ? 'Invited' : 'Invite'}
                          </Badge>
                          <span className="text-xs text-purple-600">Admin</span>
                          <select
                            value={member.isAdmin ? 'Yes' : 'No'}
                            onChange={(e) => updateMemberAdmin(member.id, e.target.value === 'Yes')}
                            disabled={updatingAdminMemberId === member.id}
                            className="text-xs border border-purple-200 rounded px-2 py-1 focus:border-purple-400 focus:outline-none"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="text-purple-700 border-purple-200">
                          Manage
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {crewMembers.filter(member => !member.isProfileOwner).length === 0 && !showAddMember && (
            <div className="text-center py-8 text-gray-500">
              <Users2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No team members added yet.</p>
              <p className="text-sm">Click &quot;Add Member&quot; to invite band members and support staff.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
