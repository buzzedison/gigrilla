'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Switch } from '../../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
// Separator import removed - not used
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible'
import { ChevronDown, ChevronUp, Plus, User, Users2, Music, Mic, Guitar, Briefcase, Settings, ExternalLink, CheckCircle2, XCircle, AlertCircle, Loader2, Info, Landmark } from 'lucide-react'
import { useAuth } from '../../../lib/auth-context'
import { cn } from '../../../lib/utils'
import { ISNIHelperModal } from '../../signup/components/ISNIHelperModal'
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
import { INSTRUMENT_TAXONOMY_3TIER } from '@/data/instrument-taxonomy'
import {
  InstrumentPicker3Tier,
  ALL_FAMILY_VARIANT_ID,
  serializeInstruments3Tier,
  type SelectedInstrument,
} from '../../components/ui/instrument-picker-3tier'
import {
  COUNTRY_DIAL_CODE_CHOICES,
  DEFAULT_COUNTRY_DIAL_CODE,
  getDialCodeChoiceValue,
  getDialCodeFromChoiceValue,
} from '../../../lib/country-dial-codes'

// ── Instrument ↔ role-string helpers ──────────────────────────────────────────
// Instruments are stored inside the roles[] array with an "instrument:" prefix
// e.g. "instrument:strings:guitar:electric" so no separate DB column is needed.

function instrumentsToRoleStrings(items: SelectedInstrument[]): string[] {
  return items.map(i =>
    `instrument:${i.groupId}:${i.instrumentId}${i.variantId ? ':' + i.variantId : ''}`
  )
}

function instrumentRolesFromStrings(roles: string[]): SelectedInstrument[] {
  return roles
    .filter(r => r.startsWith('instrument:'))
    .map((r): SelectedInstrument | null => {
      const parts = r.split(':')
      const [, groupId, instrumentId, variantId] = parts
      if (!groupId || !instrumentId) return null
      const group = INSTRUMENT_TAXONOMY_3TIER.find(g => g.id === groupId)
      const instrument = group?.instruments.find(i => i.id === instrumentId)
      if (!group || !instrument) return null
      const variant = variantId ? instrument.variants?.find(v => v.id === variantId) : undefined
      const isFamilyAllSelection = Boolean(instrument.variants?.length) && !variantId
      return {
        groupId,
        groupName: group.name,
        instrumentId,
        instrumentLabel: instrument.label,
        variantId: variantId || (isFamilyAllSelection ? ALL_FAMILY_VARIANT_ID : undefined),
        variantLabel: variant?.label ?? (isFamilyAllSelection ? `All ${instrument.label}` : undefined),
      }
    })
    .filter((x): x is SelectedInstrument => x !== null)
}

function nonInstrumentRoles(roles: string[]): string[] {
  return roles.filter(r => !r.startsWith('instrument:'))
}

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
  phoneCountryCode?: string
  performerIsni?: string
  performerIpn?: string
  creatorIpiCae?: string
  isShareholder?: boolean
  isMainContact?: boolean
  isPerformer?: boolean
  memberSince?: string
  memberType?: 'performer' | 'support'
  isCurrentMember?: boolean
  dateLeft?: string
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
    phone?: string
    phoneCountryCode?: string
    performerIsni?: string
    performerIpn?: string
    creatorIpiCae?: string
    memberType?: 'performer' | 'support'
    isShareholder?: boolean
    isMainContact?: boolean
    isPerformer?: boolean
    memberSince?: string
    isCurrentMember?: boolean
    dateLeft?: string
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
    phone?: string
    phoneCountryCode?: string
    performerIsni?: string
    performerIpn?: string
    creatorIpiCae?: string
    memberType?: 'performer' | 'support'
    isShareholder?: boolean
    isMainContact?: boolean
    isPerformer?: boolean
    memberSince?: string
    isCurrentMember?: boolean
    dateLeft?: string
  }
}

interface RoleCategory {
  id: string
  name: string
  icon: React.ReactNode
  items: string[]
  expanded?: boolean
}

const POSTCODE_LIKE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

function sanitizeLocationPart(value?: string | null) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (POSTCODE_LIKE_REGEX.test(trimmed)) return ''
  return trimmed
}

function splitLocation(value?: string | null) {
  const parts = String(value || '')
    .split(',')
    .map(part => sanitizeLocationPart(part))
    .filter(Boolean)

  if (parts.length === 0) {
    return { city: '', state: '', country: '' }
  }

  const working = [...parts]
  let country = ''
  if (working.length >= 2) {
    const last = working[working.length - 1].toLowerCase()
    const previous = working[working.length - 2].toLowerCase()
    if (last === 'uk' && ['england', 'scotland', 'wales', 'northern ireland'].includes(previous)) {
      country = `${working[working.length - 2]}, ${working[working.length - 1]}`
      working.splice(-2, 2)
    }
  }

  if (!country) {
    country = working.pop() || ''
  }

  let state = working.length > 1 ? working[working.length - 1] || '' : ''
  let city = ''

  if (working.length === 1) {
    city = working[0] || ''
  } else if (working.length >= 2) {
    city = working[working.length - 2] || ''
  }

  return { city, state, country }
}

function buildPublicLocation(parts: Array<string | null | undefined>) {
  return parts.map(part => sanitizeLocationPart(part)).filter(Boolean).join(', ')
}

function getStringDetail(record: Record<string, unknown>, key: string, fallback = '') {
  const value = record[key]
  return typeof value === 'string' ? value.trim() : fallback
}

function getBooleanDetail(record: Record<string, unknown>, key: string, fallback = false) {
  const value = record[key]
  return typeof value === 'boolean' ? value : fallback
}

function splitDisplayName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  }
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
      'Backing Vocals',
      'Harmony Vocals'
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

interface RoleSelectionRule {
  parentRole: string
  dependentRoles: string[]
  includeDependentsWithParent: boolean
}

function getRoleSelectionRule(category?: RoleCategory): RoleSelectionRule | null {
  if (!category) return null

  if (category.id === 'songwriting') {
    const [parentRole, ...dependentRoles] = category.items
    return {
      parentRole,
      dependentRoles,
      includeDependentsWithParent: true
    }
  }

  const allItem = category.items[0]?.startsWith('All ') ? category.items[0] : null
  if (!allItem) return null

  return {
    parentRole: allItem,
    dependentRoles: category.items.slice(1),
    includeDependentsWithParent: false
  }
}

function dedupeRoles(roles: string[]) {
  return Array.from(new Set(roles))
}

function sortCategoryRoles(roles: string[], category: RoleCategory) {
  const categoryRoles = category.items.filter(item => roles.includes(item))
  const otherRoles = roles.filter(role => !category.items.includes(role))
  return [...otherRoles, ...categoryRoles]
}

function toggleCategoryRole(roles: string[], role: string, category?: RoleCategory) {
  const cat = category ?? ROLE_CATEGORIES.find(c => c.items.includes(role))
  const rule = getRoleSelectionRule(cat)
  const roleIsSelected = roles.includes(role)
  let nextRoles = [...roles]

  if (!rule) {
    nextRoles = roleIsSelected
      ? nextRoles.filter(currentRole => currentRole !== role)
      : [...nextRoles, role]
    return dedupeRoles(nextRoles)
  }

  const isParentRole = role === rule.parentRole
  const isDependentRole = rule.dependentRoles.includes(role)

  if (roleIsSelected) {
    if (isParentRole) {
      nextRoles = nextRoles.filter(currentRole =>
        currentRole !== rule.parentRole &&
        (!rule.includeDependentsWithParent || !rule.dependentRoles.includes(currentRole))
      )
    } else {
      nextRoles = nextRoles.filter(currentRole => currentRole !== role)
      if (isDependentRole && rule.includeDependentsWithParent) {
        nextRoles = nextRoles.filter(currentRole => currentRole !== rule.parentRole)
      }
    }
  } else if (isParentRole) {
    nextRoles = nextRoles.filter(currentRole =>
      currentRole !== rule.parentRole && !rule.dependentRoles.includes(currentRole)
    )
    nextRoles.push(rule.parentRole)
    if (rule.includeDependentsWithParent) {
      nextRoles.push(...rule.dependentRoles)
    }
  } else if (isDependentRole) {
    nextRoles = nextRoles.filter(currentRole => currentRole !== rule.parentRole)
    nextRoles.push(role)

    if (
      rule.includeDependentsWithParent &&
      rule.dependentRoles.every(dependentRole => dependentRole === role || nextRoles.includes(dependentRole))
    ) {
      nextRoles.push(rule.parentRole)
    }
  } else {
    nextRoles.push(role)
  }

  const dedupedRoles = dedupeRoles(nextRoles)
  return cat ? sortCategoryRoles(dedupedRoles, cat) : dedupedRoles
}

function isDependentRoleDisabled(roles: string[], item: string, category: RoleCategory) {
  const rule = getRoleSelectionRule(category)
  return Boolean(rule && item !== rule.parentRole && rule.dependentRoles.includes(item) && roles.includes(rule.parentRole))
}

export function ArtistCrewManager() {
  const { user } = useAuth()
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([])
  const [profileOwner, setProfileOwner] = useState<CrewMember | null>(null)
  const [profileOwnerLocationDetails, setProfileOwnerLocationDetails] = useState<Record<string, unknown>>({})
  const [savingOwner, setSavingOwner] = useState(false)
  const [updatingAdminMemberId, setUpdatingAdminMemberId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['vocals', 'strings']))
  const [ownerInstrumentPickerResetKey, setOwnerInstrumentPickerResetKey] = useState(0)
  const [ownerInstrumentPickerStartCollapsed, setOwnerInstrumentPickerStartCollapsed] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberType, setNewMemberType] = useState<'performer' | 'support'>('performer')
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editingMemberFields, setEditingMemberFields] = useState<{
    firstName: string
    lastName: string
    nickname: string
    phone: string
    phoneCountryCode: string
    performerIsni: string
    performerIpn: string
    creatorIpiCae: string
    isShareholder: boolean
    isMainContact: boolean
    isPerformer: boolean
    memberSince: string
    isCurrentMember: boolean
    dateLeft: string
    roles: string[]
    instruments3tier: SelectedInstrument[]
  }>({
    firstName: '',
    lastName: '',
    nickname: '',
    phone: '',
    phoneCountryCode: DEFAULT_COUNTRY_DIAL_CODE,
    performerIsni: '',
    performerIpn: '',
    creatorIpiCae: '',
    isShareholder: false,
    isMainContact: false,
    isPerformer: false,
    memberSince: '',
    isCurrentMember: true,
    dateLeft: '',
    roles: [],
    instruments3tier: []
  })
  const [ownerInstruments3tier, setOwnerInstruments3tier] = useState<SelectedInstrument[]>([])
  const [ownerNicknameError, setOwnerNicknameError] = useState<string | null>(null)
  const [newMemberInstruments, setNewMemberInstruments] = useState<SelectedInstrument[]>([])
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null)
  const [newMember, setNewMember] = useState<Partial<CrewMember>>({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    phoneCountryCode: DEFAULT_COUNTRY_DIAL_CODE,
    phone: '',
    roles: [],
    isAdmin: false,
    isShareholder: false,
    isMainContact: false,
    isPerformer: true,
    isCurrentMember: true,
    memberSince: '',
    dateLeft: '',
    performerIsni: '',
    performerIpn: '',
    creatorIpiCae: '',
    status: 'invite'
  })
  const [newMemberPerformerRolePickerOpen, setNewMemberPerformerRolePickerOpen] = useState(false)
  const [newMemberSupportRolePickerOpen, setNewMemberSupportRolePickerOpen] = useState(false)
  const [newMemberErrors, setNewMemberErrors] = useState<Partial<Record<'firstName' | 'lastName' | 'email' | 'phone', string>>>({})
  const [newMemberErrorSummary, setNewMemberErrorSummary] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    visible: boolean
  } | null>(null)
  const notifyProfileUpdated = useCallback((source: string) => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('artist-profile-updated', { detail: { source } }))
  }, [])

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
          const fallbackLocation = splitLocation(profileData?.base_location)
          const existingLocationDetails =
            profileData?.location_details &&
            typeof profileData.location_details === 'object' &&
            !Array.isArray(profileData.location_details)
              ? profileData.location_details as Record<string, unknown>
              : {}
          const hometown = buildPublicLocation([
            sanitizeLocationPart(profileData?.hometown_city) || fallbackLocation.city || sanitizeLocationPart(fanProfileData?.location_details?.city),
            sanitizeLocationPart(profileData?.hometown_state) || fallbackLocation.state || sanitizeLocationPart(fanProfileData?.location_details?.state),
            sanitizeLocationPart(profileData?.hometown_country) || fallbackLocation.country || sanitizeLocationPart(fanProfileData?.location_details?.country)
          ])
          const legalName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim()
          const fallbackNameParts = splitDisplayName(legalName)
          const artistName = typeof profileData?.company_name === 'string' ? profileData.company_name.trim() : ''
          const fanContactDetails =
            fanProfileData?.contact_details &&
            typeof fanProfileData.contact_details === 'object' &&
            !Array.isArray(fanProfileData.contact_details)
              ? fanProfileData.contact_details as Record<string, unknown>
              : {}
          const storedOwnerNickname = typeof existingLocationDetails.artist_owner_nickname === 'string'
            ? existingLocationDetails.artist_owner_nickname.trim()
            : ''
          const storedStageName = typeof profileData?.stage_name === 'string' ? profileData.stage_name.trim() : ''
          const nickname =
            storedOwnerNickname
              ? storedOwnerNickname
              : storedStageName &&
                storedStageName !== artistName &&
                storedStageName !== legalName
                ? ''
              : ''

          console.log('Extracted Date of Birth:', dateOfBirth)
          console.log('Extracted Hometown:', hometown)
          console.log('Contact Details:', fanProfileData?.contact_details)
          console.log('Location Details:', fanProfileData?.location_details)

          const owner: CrewMember = {
            id: user.id,
            name: legalName || 'Your Name',
            nickname,
            dateOfBirth: dateOfBirth,
            hometown: hometown,
            roles: Array.isArray(profileData?.artist_primary_roles)
              ? profileData.artist_primary_roles.filter((role: unknown): role is string => typeof role === 'string' && role.trim().length > 0)
              : [],
            instruments: Array.isArray(profileData?.artist_primary_roles)
              ? profileData.artist_primary_roles.filter((r: unknown): r is string => typeof r === 'string' && r.startsWith('instrument:'))
              : [],
            management: [],
            isPublic: false,
            isProfileOwner: true,
            firstName: getStringDetail(existingLocationDetails, 'artist_owner_first_name', user.user_metadata?.first_name || fallbackNameParts.firstName),
            lastName: getStringDetail(existingLocationDetails, 'artist_owner_last_name', user.user_metadata?.last_name || fallbackNameParts.lastName),
            email: getStringDetail(existingLocationDetails, 'artist_owner_email', user.email || getStringDetail(fanContactDetails, 'email')),
            phoneCountryCode: getStringDetail(existingLocationDetails, 'artist_owner_phone_country_code', getStringDetail(fanContactDetails, 'phone_country_code', DEFAULT_COUNTRY_DIAL_CODE)),
            phone: getStringDetail(existingLocationDetails, 'artist_owner_phone', getStringDetail(fanContactDetails, 'phone')),
            isShareholder: getBooleanDetail(existingLocationDetails, 'artist_owner_is_shareholder', false),
            isMainContact: getBooleanDetail(existingLocationDetails, 'artist_owner_is_main_contact', false),
            isPerformer: getBooleanDetail(existingLocationDetails, 'artist_owner_is_performer', true),
            memberSince: getStringDetail(existingLocationDetails, 'artist_owner_member_since'),
            performerIsni: profileData?.performer_isni || '',
            performerIpn: getStringDetail(existingLocationDetails, 'artist_owner_performer_ipn'),
            creatorIpiCae: profileData?.creator_ipi_cae || ''
          }

          setProfileOwnerLocationDetails(existingLocationDetails)
          // Convert invitations to crew members
          const invitationMembers: CrewMember[] = (membersData.invitations || []).map((inv: InvitationData) => ({
            id: inv.id,
            name: inv.name || 'Unknown',
            nickname: inv.metadata?.nickname || '',
            firstName: inv.metadata?.firstName || '',
            lastName: inv.metadata?.lastName || '',
            email: inv.email,
            phone: inv.metadata?.phone || '',
            phoneCountryCode: inv.metadata?.phoneCountryCode || DEFAULT_COUNTRY_DIAL_CODE,
            roles: inv.roles || [],
            isAdmin: inv.metadata?.isAdmin || false,
            memberType: inv.metadata?.memberType || 'performer',
            performerIsni: inv.metadata?.performerIsni || '',
            performerIpn: inv.metadata?.performerIpn || '',
            creatorIpiCae: inv.metadata?.creatorIpiCae || '',
            isShareholder: inv.metadata?.isShareholder || false,
            isMainContact: inv.metadata?.isMainContact || false,
            isPerformer: inv.metadata?.isPerformer ?? inv.metadata?.memberType !== 'support',
            memberSince: inv.metadata?.memberSince || '',
            isCurrentMember: inv.metadata?.isCurrentMember !== false,
            dateLeft: inv.metadata?.dateLeft || '',
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
            phone: member.metadata?.phone || '',
            phoneCountryCode: member.metadata?.phoneCountryCode || DEFAULT_COUNTRY_DIAL_CODE,
            roles: member.roles || [],
            isAdmin: member.metadata?.isAdmin || false,
            memberType: member.metadata?.memberType || 'performer',
            performerIsni: member.metadata?.performerIsni || '',
            performerIpn: member.metadata?.performerIpn || '',
            creatorIpiCae: member.metadata?.creatorIpiCae || '',
            isShareholder: member.metadata?.isShareholder || false,
            isMainContact: member.metadata?.isMainContact || false,
            isPerformer: member.metadata?.isPerformer ?? member.metadata?.memberType !== 'support',
            memberSince: member.metadata?.memberSince || '',
            isCurrentMember: member.metadata?.isCurrentMember !== false,
            dateLeft: member.metadata?.dateLeft || '',
            status: 'joined',
            dateOfBirth: member.metadata?.dateOfBirth || '',
            hometown: '',
            instruments: [],
            management: [],
            isPublic: false,
            isProfileOwner: false
          }))

          setProfileOwner(owner)
          setOwnerInstruments3tier(instrumentRolesFromStrings(owner.roles))
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
            isProfileOwner: true,
            firstName: user.user_metadata?.first_name || '',
            lastName: user.user_metadata?.last_name || '',
            email: user.email || '',
            phoneCountryCode: DEFAULT_COUNTRY_DIAL_CODE,
            phone: '',
            isShareholder: false,
            isMainContact: false,
            isPerformer: true,
            memberSince: '',
            performerIpn: ''
          }
          setProfileOwnerLocationDetails({})
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

  const getMemberLabel = (member?: CrewMember | null) => {
    if (!member) return 'this person'
    return getDisplayName(member)
  }

  const confirmMainContactChange = (targetId: string, targetLabel: string) => {
    const existingMainContact = crewMembers.find(member => member.isMainContact && member.id !== targetId)
    if (!existingMainContact) return true

    if (typeof window === 'undefined') return true

    return window.confirm(
      `${getMemberLabel(existingMainContact)} is currently the main contact for this Artist Entity. Make ${targetLabel} the only main contact instead?`
    )
  }

  const markOnlyMainContactLocally = (targetId: string) => {
    setCrewMembers(prev => prev.map(member => ({
      ...member,
      isMainContact: member.id === targetId
    })))
    setProfileOwner(prev => prev ? { ...prev, isMainContact: prev.id === targetId } : prev)
  }

  const setOwnerAsMainContact = () => {
    if (!profileOwner) return
    if (!confirmMainContactChange(profileOwner.id, getMemberLabel(profileOwner))) return
    updateProfileOwner({ isMainContact: true, isShareholder: true })
  }

  const clearPersistedMainContactsExcept = async (targetId: string) => {
    const updateRequests: Promise<Response>[] = []

    if (profileOwner?.id !== targetId && profileOwner?.isMainContact) {
      const nextLocationDetails = {
        ...profileOwnerLocationDetails,
        artist_owner_is_main_contact: false
      }

      setProfileOwnerLocationDetails(nextLocationDetails)
      updateRequests.push(fetch('/api/artist-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_details: nextLocationDetails })
      }))
    }

    crewMembers
      .filter(member => !member.isProfileOwner && member.id !== targetId && member.isMainContact)
      .forEach(member => {
        updateRequests.push(fetch('/api/artist-members', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: member.id,
            isMainContact: false
          })
        }))
      })

    if (updateRequests.length > 0) {
      const responses = await Promise.all(updateRequests)
      const failed = responses.find(response => !response.ok)
      if (failed) {
        throw new Error('Failed to clear the previous main contact')
      }
    }
  }

  const ownerHasPerformerOrWriterRole = () => {
    if (!profileOwner) return false
    const ownerRoles = nonInstrumentRoles(profileOwner.roles)
    const hasWriterRole = ownerRoles.some(role =>
      role.includes('Songwriter') || role.includes('Lyricist') || role.includes('Composer')
    )
    const hasPerformerRole =
      ownerRoles.some(role => role.includes('Vocals')) ||
      ownerInstruments3tier.length > 0

    return hasWriterRole || hasPerformerRole
  }

  const memberHasPerformerOrWriterRole = (roles: string[], instruments: SelectedInstrument[]) => {
    const roleList = nonInstrumentRoles(roles)
    const hasWriterRole = roleList.some(role =>
      role.includes('Songwriter') || role.includes('Lyricist') || role.includes('Composer')
    )
    const hasPerformerRole =
      roleList.some(role => role.includes('Vocals')) ||
      instruments.length > 0

    return hasWriterRole || hasPerformerRole
  }

  const isPerformerMember = (member: Pick<CrewMember, 'isPerformer' | 'memberType'>) => {
    return member.isPerformer ?? member.memberType !== 'support'
  }

  const goToArtistBankingLegalMembers = () => {
    if (typeof window === 'undefined') return
    window.location.href = '/artist-dashboard?section=payments&subSection=legal-members'
  }

  const resetEditingMemberFields = () => {
    setEditingMemberFields({
      firstName: '',
      lastName: '',
      nickname: '',
      phone: '',
      phoneCountryCode: DEFAULT_COUNTRY_DIAL_CODE,
      performerIsni: '',
      performerIpn: '',
      creatorIpiCae: '',
      isShareholder: false,
      isMainContact: false,
      isPerformer: false,
      memberSince: '',
      isCurrentMember: true,
      dateLeft: '',
      roles: [],
      instruments3tier: []
    })
  }

  const resetNewMember = () => {
    setNewMember({
      firstName: '',
      lastName: '',
      nickname: '',
      email: '',
      phoneCountryCode: DEFAULT_COUNTRY_DIAL_CODE,
      phone: '',
      roles: [],
      isAdmin: false,
      isShareholder: false,
      isMainContact: false,
      isPerformer: newMemberType === 'performer',
      isCurrentMember: true,
      memberSince: '',
      dateLeft: '',
      performerIsni: '',
      performerIpn: '',
      creatorIpiCae: '',
      status: 'invite'
    })
    setNewMemberInstruments([])
    setNewMemberErrors({})
    setNewMemberErrorSummary(null)
    setNewMemberPerformerRolePickerOpen(false)
    setNewMemberSupportRolePickerOpen(false)
  }

  const saveProfileOwner = async () => {
    if (!profileOwner) return

    const nickname = profileOwner.nickname?.trim() || ''
    const firstName = profileOwner.firstName?.trim() || ''
    const lastName = profileOwner.lastName?.trim() || ''
    if (!firstName || !lastName) {
      showNotification('error', 'Please add your given name and family name before saving.')
      return
    }

    if (profileOwner.isShareholder && !ownerHasPerformerOrWriterRole()) {
      showNotification('error', 'A shareholder must have at least one performer or writer role selected.')
      return
    }

    if (profileOwner.isMainContact && !profileOwner.isShareholder) {
      showNotification('error', 'The main contact must also be marked as a shareholder.')
      return
    }

    const hasAtLeastOneProfessionalId = [
      profileOwner.performerIsni,
      profileOwner.performerIpn,
      profileOwner.creatorIpiCae
    ].some(value => typeof value === 'string' && value.trim().length > 0)

    if (!hasAtLeastOneProfessionalId) {
      showNotification('error', 'Please add at least one professional ID: Individual ISNI, Performer IPN, or Writer IPI.')
      return
    }

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
          location_details: {
            ...profileOwnerLocationDetails,
            artist_owner_first_name: firstName,
            artist_owner_last_name: lastName,
            artist_owner_nickname: nickname,
            artist_owner_email: profileOwner.email?.trim() || null,
            artist_owner_phone_country_code: profileOwner.phoneCountryCode || DEFAULT_COUNTRY_DIAL_CODE,
            artist_owner_phone: profileOwner.phone?.trim() || null,
            artist_owner_is_shareholder: Boolean(profileOwner.isShareholder),
            artist_owner_is_main_contact: Boolean(profileOwner.isMainContact && profileOwner.isShareholder),
            artist_owner_is_performer: Boolean(profileOwner.isPerformer),
            artist_owner_performer_ipn: profileOwner.performerIpn?.trim() || null,
            artist_owner_member_since: profileOwner.memberSince || null,
            artist_owner_status: 'current',
            artist_owner_is_admin: true
          },
          artist_primary_roles: [
            ...nonInstrumentRoles(profileOwner.roles),
            ...instrumentsToRoleStrings(ownerInstruments3tier),
          ],
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

      if (profileOwner.isMainContact) {
        await clearPersistedMainContactsExcept(profileOwner.id)
        markOnlyMainContactLocally(profileOwner.id)
      }

      setOwnerNicknameError(null)
      setExpandedCategories(new Set())
      setOwnerInstrumentPickerStartCollapsed(true)
      setOwnerInstrumentPickerResetKey(prev => prev + 1)
      showNotification('success', 'Your own roles and profile info were saved successfully')
      notifyProfileUpdated('crew-owner')
    } catch (error) {
      console.error('Error saving profile owner info:', error)
      showNotification('error', 'Unable to save your roles and profile info right now.')
    } finally {
      setSavingOwner(false)
    }
  }

  const toggleRole = (role: string, category?: RoleCategory) => {
    if (!profileOwner) return

    updateProfileOwner({
      roles: toggleCategoryRole(profileOwner.roles, role, category)
    })
  }

  const isRoleSelected = (role: string) => {
    return profileOwner?.roles.includes(role) || false
  }

  const startEditingMember = (member: CrewMember) => {
    if (editingMemberId === member.id) {
      setEditingMemberId(null)
      resetEditingMemberFields()
    } else {
      setEditingMemberId(member.id)
      setEditingMemberFields({
        firstName: member.firstName ?? '',
        lastName: member.lastName ?? '',
        nickname: member.nickname ?? '',
        phone: member.phone ?? '',
        phoneCountryCode: member.phoneCountryCode ?? DEFAULT_COUNTRY_DIAL_CODE,
        performerIsni: member.performerIsni ?? '',
        performerIpn: member.performerIpn ?? '',
        creatorIpiCae: member.creatorIpiCae ?? '',
        isShareholder: Boolean(member.isShareholder),
        isMainContact: Boolean(member.isMainContact),
        isPerformer: isPerformerMember(member),
        memberSince: member.memberSince ?? '',
        isCurrentMember: member.isCurrentMember !== false,
        dateLeft: member.dateLeft ?? '',
        roles: nonInstrumentRoles(member.roles),
        instruments3tier: instrumentRolesFromStrings(member.roles),
      })
    }
  }

  const closeEditingMember = () => {
    setEditingMemberId(null)
    resetEditingMemberFields()
  }

  const toggleMemberRole = (role: string, category?: RoleCategory) => {
    setEditingMemberFields(prev => {
      return {
        ...prev,
        roles: toggleCategoryRole(prev.roles, role, category)
      }
    })
  }

  const saveMember = async (memberId: string) => {
    setSavingMemberId(memberId)
    try {
      const nextRoles = [
        ...nonInstrumentRoles(editingMemberFields.roles),
        ...instrumentsToRoleStrings(editingMemberFields.instruments3tier),
      ]
      const nextIsPerformer = Boolean(editingMemberFields.isPerformer)
      const nextIsShareholder = nextIsPerformer && Boolean(editingMemberFields.isShareholder)
      const nextIsMainContact = nextIsShareholder && Boolean(editingMemberFields.isMainContact)

      const professionalIds = [
        editingMemberFields.performerIsni,
        editingMemberFields.performerIpn,
        editingMemberFields.creatorIpiCae
      ].filter(value => value.trim().length > 0)

      if (nextIsPerformer && professionalIds.length === 0) {
        throw new Error('Please add at least one performer ID: Individual ISNI, Performer IPN, or Writer IPI.')
      }

      if (nextIsShareholder && !memberHasPerformerOrWriterRole(nextRoles, editingMemberFields.instruments3tier)) {
        throw new Error('A shareholder must have at least one performer or writer role selected.')
      }

      if (!editingMemberFields.isCurrentMember && !editingMemberFields.dateLeft) {
        throw new Error('Please add the date left for a previous member.')
      }

      if (nextIsMainContact) {
        await clearPersistedMainContactsExcept(memberId)
      }

      const response = await fetch('/api/artist-members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          roles: nextRoles,
          firstName: editingMemberFields.firstName.trim() || undefined,
          lastName: editingMemberFields.lastName.trim() || undefined,
          nickname: editingMemberFields.nickname.trim() || undefined,
          phone: editingMemberFields.phone.trim() || undefined,
          phoneCountryCode: editingMemberFields.phoneCountryCode || DEFAULT_COUNTRY_DIAL_CODE,
          performerIsni: editingMemberFields.performerIsni.trim() || undefined,
          performerIpn: editingMemberFields.performerIpn.trim() || undefined,
          creatorIpiCae: editingMemberFields.creatorIpiCae.trim() || undefined,
          isPerformer: nextIsPerformer,
          isShareholder: nextIsShareholder,
          isMainContact: nextIsMainContact,
          memberSince: editingMemberFields.memberSince || undefined,
          isCurrentMember: editingMemberFields.isCurrentMember,
          dateLeft: editingMemberFields.isCurrentMember ? undefined : editingMemberFields.dateLeft || undefined,
        })
      })
      const result = await response.json()
      if (!response.ok || result?.error) throw new Error(result?.error || 'Failed to update')

      setCrewMembers(prev => prev.map(m => {
        if (nextIsMainContact && m.id !== memberId) {
          return { ...m, isMainContact: false }
        }

        return m.id === memberId ? {
          ...m,
          roles: nextRoles,
          firstName: editingMemberFields.firstName.trim() || m.firstName,
          lastName: editingMemberFields.lastName.trim() || m.lastName,
          nickname: editingMemberFields.nickname.trim() || m.nickname,
          phone: editingMemberFields.phone.trim() || m.phone,
          phoneCountryCode: editingMemberFields.phoneCountryCode || m.phoneCountryCode,
          performerIsni: editingMemberFields.performerIsni.trim() || m.performerIsni,
          performerIpn: editingMemberFields.performerIpn.trim() || m.performerIpn,
          creatorIpiCae: editingMemberFields.creatorIpiCae.trim() || m.creatorIpiCae,
          isPerformer: nextIsPerformer,
          isShareholder: nextIsShareholder,
          isMainContact: nextIsMainContact,
          memberSince: editingMemberFields.memberSince || m.memberSince,
          isCurrentMember: editingMemberFields.isCurrentMember,
          dateLeft: editingMemberFields.isCurrentMember ? '' : editingMemberFields.dateLeft,
        } : m
      }))
      if (nextIsMainContact) {
        setProfileOwner(prev => prev ? { ...prev, isMainContact: false } : prev)
      }
      closeEditingMember()
      showNotification('success', 'Member updated successfully')
      notifyProfileUpdated('crew-member-update')
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to update member. Please try again.')
    } finally {
      setSavingMemberId(null)
    }
  }

  const addNewMember = (type: 'performer' | 'support') => {
    setNewMemberType(type)
    setShowAddMember(true)
    resetNewMember()
    setNewMember(prev => ({
      ...prev,
      isPerformer: type === 'performer'
    }))
  }

  const handleAddMember = async () => {
    const firstName = (newMember.firstName || '').trim()
    const lastName = (newMember.lastName || '').trim()
    const email = (newMember.email || '').trim()
    const phone = (newMember.phone || '').trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const professionalIds = [
      newMember.performerIsni,
      newMember.performerIpn,
      newMember.creatorIpiCae
    ].filter(value => typeof value === 'string' && value.trim().length > 0)
    const combinedRoles = [
      ...(newMember.roles || []),
      ...instrumentsToRoleStrings(newMemberInstruments),
    ]
    const newMemberIsPerformer = newMemberType === 'performer' || Boolean(newMember.isPerformer)
    const newMemberIsShareholder = newMemberIsPerformer && Boolean(newMember.isShareholder)
    const newMemberIsMainContact = newMemberIsShareholder && Boolean(newMember.isMainContact)

    const nextErrors: Partial<Record<'firstName' | 'lastName' | 'email' | 'phone', string>> = {}
    if (!firstName) nextErrors.firstName = 'First name is required.'
    if (!lastName) nextErrors.lastName = 'Last name is required.'
    if (!email) nextErrors.email = 'Email is required.'
    if (email && !emailPattern.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!phone) nextErrors.phone = 'Phone is required.'

    setNewMemberErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setNewMemberErrorSummary('Please complete all required fields: First Name, Last Name, Email, and Phone.')
      return
    }

    if (newMemberIsPerformer && professionalIds.length === 0) {
      setNewMemberErrorSummary('Please add at least one performer ID: Individual ISNI, Performer IPN, or Writer IPI.')
      return
    }

    if (newMemberIsShareholder && !memberHasPerformerOrWriterRole(combinedRoles, newMemberInstruments)) {
      setNewMemberErrorSummary('A shareholder must have at least one performer or writer role selected.')
      return
    }

    if (newMember.isMainContact && !newMemberIsShareholder) {
      setNewMemberErrorSummary('The main contact must also be marked as a shareholder.')
      return
    }

    if (newMember.isCurrentMember === false && !newMember.dateLeft) {
      setNewMemberErrorSummary('Please add the date left for a previous member.')
      return
    }

    setNewMemberErrorSummary(null)

    try {
      // Call the API to create and send invitation
      const response = await fetch('/api/artist-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          nickname: newMember.nickname || '',
          email,
          phoneCountryCode: newMember.phoneCountryCode || DEFAULT_COUNTRY_DIAL_CODE,
          phone,
          roles: combinedRoles,
          isAdmin: newMember.isAdmin || false,
          memberType: newMemberType,
          isPerformer: newMemberIsPerformer,
          performerIsni: newMember.performerIsni || '',
          performerIpn: newMember.performerIpn || '',
          creatorIpiCae: newMember.creatorIpiCae || '',
          isShareholder: newMemberIsShareholder,
          isMainContact: newMemberIsMainContact,
          memberSince: newMember.memberSince || '',
          isCurrentMember: newMember.isCurrentMember !== false,
          dateLeft: newMember.isCurrentMember === false ? newMember.dateLeft || '' : ''
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Failed to add member:', result)
        showNotification('error', `Failed to send invitation: ${result.error || 'Unknown error'}`)
        return
      }

      if (newMemberIsMainContact) {
        await clearPersistedMainContactsExcept(result.data.id)
      }

      // Add the member to local state with the returned data
      const member: CrewMember = {
        id: result.data.id,
        name: result.data.name || `${newMember.firstName} ${newMember.lastName || ''}`.trim(),
        nickname: newMember.nickname || '',
        firstName,
        lastName,
        email,
        phoneCountryCode: newMember.phoneCountryCode || DEFAULT_COUNTRY_DIAL_CODE,
        phone,
        roles: combinedRoles,
        isAdmin: newMember.isAdmin || false,
        memberType: newMemberType,
        isPerformer: newMemberIsPerformer,
        performerIsni: newMember.performerIsni || '',
        performerIpn: newMember.performerIpn || '',
        creatorIpiCae: newMember.creatorIpiCae || '',
        isShareholder: newMemberIsShareholder,
        isMainContact: newMemberIsMainContact,
        memberSince: newMember.memberSince || '',
        isCurrentMember: newMember.isCurrentMember !== false,
        dateLeft: newMember.isCurrentMember === false ? newMember.dateLeft || '' : '',
        status: 'invited',
        dateOfBirth: '',
        hometown: '',
        instruments: [],
        management: [],
        isPublic: false,
        isProfileOwner: false
      }

      setCrewMembers(prev => [
        ...(newMemberIsMainContact ? prev.map(existing => ({ ...existing, isMainContact: false })) : prev),
        member
      ])
      if (newMemberIsMainContact) {
        setProfileOwner(prev => prev ? { ...prev, isMainContact: false } : prev)
      }
      resetNewMember()
      setShowAddMember(false)

      if (result.warning) {
        showNotification('info', result.warning)
      } else {
        showNotification('success', `Invitation sent successfully to ${email}!`)
      }
      notifyProfileUpdated('crew-member-add')
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
      notifyProfileUpdated('crew-member-remove')
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
      notifyProfileUpdated('crew-member-admin')
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

  const toggleNewMemberRole = (role: string, category: RoleCategory) => {
    setNewMember(prev => {
      return {
        ...prev,
        roles: toggleCategoryRole(prev.roles || [], role, category)
      }
    })
  }

  const performerRoleCategories = ROLE_CATEGORIES.filter(category =>
    ['songwriting', 'vocals'].includes(category.id)
  )
  const supportRoleCategories = ROLE_CATEGORIES.filter(category =>
    category.id.startsWith('management')
  )
  const renderRoleCategory = (category: RoleCategory) => (
    <Collapsible
      key={category.id}
      open={expandedCategories.has(category.id)}
      onOpenChange={() => toggleCategory(category.id)}
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 transition-colors">
          <div className="flex items-center gap-2">
            {category.icon}
            <span className="font-semibold text-base text-gray-900">{category.name}</span>
          </div>
          {expandedCategories.has(category.id) ? (
            <ChevronUp className="w-4 h-4 text-purple-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-purple-600" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
          {(() => {
            return category.items.map((item) => {
              const isDisabled = profileOwner ? isDependentRoleDisabled(profileOwner.roles, item, category) : false
              return (
                <div key={item} className={`flex items-center gap-2 py-1 ${isDisabled ? 'opacity-40' : ''}`}>
                  <Switch
                    id={`owner-${category.id}-${item}`}
                    checked={isRoleSelected(item)}
                    onCheckedChange={() => !isDisabled && toggleRole(item, category)}
                    disabled={isDisabled}
                  />
                  <label htmlFor={`owner-${category.id}-${item}`} className={`text-sm font-medium text-gray-900 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    {item}
                  </label>
                </div>
              )
            })
          })()}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )

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
      <Card id="artist-crew-owner" className="border-2 border-purple-200 bg-purple-50/30 scroll-mt-28">
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
              {/* Profile Owner Identity */}
              <div className="space-y-5 p-4 rounded-lg bg-white/70 border border-purple-200">
                <div>
                  <h4 className="font-semibold text-sm text-purple-900">Your Roles & Info</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Role + minimum 1 of 3 IDs: Artist Person ISNI, Performer IPN, or Writer IPI.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Your Real Name</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        value={profileOwner.firstName || ''}
                        onChange={(e) => {
                          const firstName = e.target.value
                          updateProfileOwner({
                            firstName,
                            name: `${firstName} ${profileOwner.lastName || ''}`.trim()
                          })
                        }}
                        placeholder="First/Given Name"
                        className="border-purple-200 focus:border-purple-400"
                      />
                      <Input
                        value={profileOwner.lastName || ''}
                        onChange={(e) => {
                          const lastName = e.target.value
                          updateProfileOwner({
                            lastName,
                            name: `${profileOwner.firstName || ''} ${lastName}`.trim()
                          })
                        }}
                        placeholder="Last/Family Name"
                        className="border-purple-200 focus:border-purple-400"
                      />
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
                    <Label htmlFor="artistNickname" className="text-sm font-semibold text-gray-700">
                      Nickname? <span className="text-xs font-normal text-gray-500">(optional)</span>
                    </Label>
                    <Input
                      id="artistNickname"
                      value={profileOwner.nickname}
                      onChange={(e) => {
                        updateProfileOwner({ nickname: e.target.value })
                        setOwnerNicknameError(null)
                      }}
                      placeholder="Optional Nickname / Stage Name"
                      className={cn(
                        "border-purple-200 focus:border-purple-400",
                        ownerNicknameError && "border-red-400 focus:border-red-500"
                      )}
                    />
                    {ownerNicknameError && <p className="text-xs text-red-600">{ownerNicknameError}</p>}
                    <p className="text-xs text-gray-500 italic">Always public and searchable.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Contact Details</Label>
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,280px)_minmax(0,1fr)] gap-2">
                    <Input
                      type="email"
                      value={profileOwner.email || ''}
                      onChange={(e) => updateProfileOwner({ email: e.target.value })}
                      placeholder="Email Address"
                      className="border-purple-200 focus:border-purple-400"
                    />
                    <Select
                      value={getDialCodeChoiceValue(profileOwner.phoneCountryCode)}
                      onValueChange={(value) => updateProfileOwner({ phoneCountryCode: getDialCodeFromChoiceValue(value) })}
                    >
                      <SelectTrigger className="border-purple-200 focus:border-purple-400">
                        <SelectValue placeholder="Country Code" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 min-w-[320px]">
                        {COUNTRY_DIAL_CODE_CHOICES.map(option => (
                          <SelectItem key={`owner-phone-${option.value}`} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      value={profileOwner.phone || ''}
                      onChange={(e) => updateProfileOwner({ phone: e.target.value })}
                      placeholder="Phone Number"
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Private. Used for contracts, profile ownership, and account verification.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 rounded-lg border border-purple-200 bg-white p-3">
                    <Label className="text-sm font-semibold text-gray-700">Is a Performer?</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={profileOwner.isPerformer !== false ? 'default' : 'outline'}
                        className={profileOwner.isPerformer !== false ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        onClick={() => updateProfileOwner({ isPerformer: true })}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant={profileOwner.isPerformer === false ? 'default' : 'outline'}
                        className={profileOwner.isPerformer === false ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        onClick={() => updateProfileOwner({ isPerformer: false })}
                      >
                        No
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Explicitly marks whether the profile owner performs for this Artist.</p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-purple-200 bg-white p-3">
                    <Label className="text-sm font-semibold text-gray-700">Shareholder of Artist Entity?</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={profileOwner.isShareholder ? 'default' : 'outline'}
                        className={profileOwner.isShareholder ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        onClick={() => updateProfileOwner({ isShareholder: true })}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant={!profileOwner.isShareholder ? 'default' : 'outline'}
                        className={!profileOwner.isShareholder ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        onClick={() => updateProfileOwner({ isShareholder: false, isMainContact: false })}
                      >
                        No
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Must be a performer and/or writer.</p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-purple-200 bg-white p-3">
                    <Label className="text-sm font-semibold text-gray-700">Main Contact for Artist Entity?</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={profileOwner.isMainContact ? 'default' : 'outline'}
                        className={profileOwner.isMainContact ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        onClick={setOwnerAsMainContact}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant={!profileOwner.isMainContact ? 'default' : 'outline'}
                        className={!profileOwner.isMainContact ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        onClick={() => updateProfileOwner({ isMainContact: false })}
                      >
                        No
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Only one main contact. Must be a shareholder.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="artistMemberSince" className="text-sm font-semibold text-gray-700">Member of Artist Since?</Label>
                    <Input
                      id="artistMemberSince"
                      type="month"
                      value={profileOwner.memberSince || ''}
                      onChange={(e) => updateProfileOwner({ memberSince: e.target.value })}
                      className="border-purple-200 focus:border-purple-400"
                    />
                    <p className="text-xs text-gray-500">Date joined, month/year.</p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-3">
                    <Label className="text-sm font-semibold text-green-900">Status: Current</Label>
                    <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                      <CheckCircle2 className="w-4 h-4" />
                      Is Current Member
                    </div>
                    <p className="text-xs text-green-700">Set to current for the profile owner.</p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <Label className="text-sm font-semibold text-blue-900">Admin: Artist Profile Rights?</Label>
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                      <CheckCircle2 className="w-4 h-4" />
                      Yes
                    </div>
                    <p className="text-xs text-blue-700">Admin is fixed for the profile owner.</p>
                  </div>
                </div>
              </div>

              {/* Professional IDs Section */}
              <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900">Performer Registrations?</h4>
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
                        Individual ISNI
                        {isniValidation.status === 'valid' && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                        {isniValidation.status === 'invalid' && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </Label>
                      <p className="text-xs text-blue-700 mt-1">
                        This is your Natural Person ISNI, not your Artist Entity ISNI, unless all members operate under one Artist Entity ISNI.
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <ISNIHelperModal
                        initialTab="get"
                        trigger={
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                          >
                            Get an ISNI <ExternalLink className="w-3 h-3" />
                          </button>
                        }
                      />
                      <ISNIHelperModal
                        initialTab="find"
                        trigger={
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                          >
                            Find an ISNI <ExternalLink className="w-3 h-3" />
                          </button>
                        }
                      />
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

                {/* IPN Field */}
                <div className="bg-white/60 rounded-lg p-4 space-y-3">
                  <div>
                    <Label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                      Performer IPN
                    </Label>
                    <p className="text-xs text-blue-700 mt-1">
                      Performer identifier used for neighbouring rights and performer royalty registrations.
                    </p>
                  </div>
                  <Input
                    value={profileOwner.performerIpn || ''}
                    onChange={(e) => updateProfileOwner({ performerIpn: e.target.value })}
                    placeholder="Start Typing Performer IPN…"
                    className="bg-white font-mono border-blue-200"
                  />
                </div>

                {/* IPI/CAE Field */}
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
                            For Songwriters, Lyricists, and Composers: Creator IPI/CAE is optional unless you write lyrics/composition.
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <a
                            href={PROFESSIONAL_ID_URLS.ipi.info}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                          >
                            Get an IPI/CAE <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={PROFESSIONAL_ID_URLS.ipi.search}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                          >
                            Find an IPI/CAE <ExternalLink className="w-3 h-3" />
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
              </div>

              {/* Roles Section */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-xl text-blue-100">Performer Roles & Support Roles</h4>
                </div>

                <div className="space-y-3 rounded-lg border border-purple-200 bg-white/40 p-3">
                  <h5 className="font-semibold text-base text-blue-100 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-blue-100" />
                    Performer Roles?
                  </h5>
                  {performerRoleCategories.map(renderRoleCategory)}
                </div>

                {/* Instruments (3-tier multi-select) */}
                <div className="space-y-3 rounded-lg border border-purple-200 bg-white/40 p-3">
                  <h5 className="font-semibold text-base text-blue-100 flex items-center gap-2 pt-1">
                    <Guitar className="w-4 h-4 text-blue-100" />
                    Instruments
                  </h5>
                  <InstrumentPicker3Tier
                    key={ownerInstrumentPickerResetKey}
                    value={ownerInstruments3tier}
                    onChange={(value) => {
                      setOwnerInstrumentPickerStartCollapsed(false)
                      setOwnerInstruments3tier(value)
                    }}
                    allowedGroups={['strings', 'wind', 'percussion', 'keyboard', 'electronic']}
                    startCollapsed={ownerInstrumentPickerStartCollapsed}
                  />
                </div>

                <div className="space-y-3 rounded-lg border border-purple-200 bg-white/40 p-3">
                  <h5 className="font-semibold text-base text-blue-100 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-100" />
                    Support Roles?
                  </h5>
                  {supportRoleCategories.map(renderRoleCategory)}
                </div>
              </div>

              {/* Selected Roles Display */}
              {profileOwner.roles.length > 0 && (
                <div className="space-y-2 rounded-lg bg-purple-50 border border-purple-200 p-3">
                  <h4 className="font-semibold text-sm text-purple-900">Your Selected Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileOwner.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="bg-purple-600 text-white border-purple-600 font-medium">
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

      {/* Add Performer & Support Crew Section */}
      <Card id="artist-crew-add-members" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Add Performer & Support Crew</span>
            {!showAddMember && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => addNewMember('performer')} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Performer
                </Button>
                <Button onClick={() => addNewMember('support')} className="bg-blue-700 hover:bg-blue-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Support Crew
                </Button>
              </div>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Add performers separately from support crew so registrations, rights, admin access, and legal member data stay clear.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              ℹ️ Performer records are twinned with Artist Banking &gt; Artist Legal Members. Support crew registrations are optional. Admin rights control whether this person can manage the Artist Profile.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showAddMember && (
            <div className="space-y-4 p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-purple-900">
                    {newMemberType === 'performer' ? 'Add Performer' : 'Add Support Crew'}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {newMemberType === 'performer'
                      ? 'Role + minimum 1 of 3 IDs: Artist Person ISNI, Performer IPN, or Writer IPI.'
                      : 'Optional IDs: Artist Person ISNI, Performer IPN, or Writer IPI.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddMember(false)
                    resetNewMember()
                  }}
                  className="text-purple-700 border-purple-200"
                >
                  Cancel
                </Button>
              </div>

              {newMemberErrorSummary && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {newMemberErrorSummary}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    {newMemberType === 'performer' ? 'Performer Real Name' : 'Crew Real Name'}
                  </Label>
                  <Input
                    value={newMember.firstName || ''}
                    onChange={(e) => {
                      setNewMember(prev => ({ ...prev, firstName: e.target.value }))
                      setNewMemberErrors(prev => ({ ...prev, firstName: undefined }))
                    }}
                    placeholder="First name"
                    className={cn(
                      "border-purple-200 focus:border-purple-400",
                      newMemberErrors.firstName && "border-red-400 focus:border-red-500"
                    )}
                  />
                  {newMemberErrors.firstName && <p className="text-xs text-red-600">{newMemberErrors.firstName}</p>}
                  <p className="text-xs text-gray-500">First/Given Name. Private by default; they can choose to make this public.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Last/Family Name
                  </Label>
                  <Input
                    value={newMember.lastName || ''}
                    onChange={(e) => {
                      setNewMember(prev => ({ ...prev, lastName: e.target.value }))
                      setNewMemberErrors(prev => ({ ...prev, lastName: undefined }))
                    }}
                    placeholder="Last name"
                    className={cn(
                      "border-purple-200 focus:border-purple-400",
                      newMemberErrors.lastName && "border-red-400 focus:border-red-500"
                    )}
                  />
                  {newMemberErrors.lastName && <p className="text-xs text-red-600">{newMemberErrors.lastName}</p>}
                  <p className="text-xs text-gray-500">Twinned - Public/Private.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Nickname?
                  </Label>
                  <Input
                    value={newMember.nickname || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="Nickname / Stagename"
                    className="border-purple-200 focus:border-purple-400"
                  />
                  <p className="text-xs text-gray-500 italic">Optional. Always public and searchable.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Contact Details - Email Address
                  </Label>
                  <Input
                    type="email"
                    value={newMember.email || ''}
                    onChange={(e) => {
                      setNewMember(prev => ({ ...prev, email: e.target.value }))
                      setNewMemberErrors(prev => ({ ...prev, email: undefined }))
                    }}
                    placeholder="Email address"
                    className={cn(
                      "border-purple-200 focus:border-purple-400",
                      newMemberErrors.email && "border-red-400 focus:border-red-500"
                    )}
                  />
                  {newMemberErrors.email && <p className="text-xs text-red-600">{newMemberErrors.email}</p>}
                  <p className="text-xs text-gray-500">is private. Used to securely match members to Profiles and to invite non-members.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Contact Details - Phone
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-2">
                    <Select
                      value={getDialCodeChoiceValue(newMember.phoneCountryCode)}
                      onValueChange={(value) => setNewMember(prev => ({ ...prev, phoneCountryCode: getDialCodeFromChoiceValue(value) }))}
                    >
                      <SelectTrigger className="border-purple-200 focus:border-purple-400">
                        <SelectValue placeholder="Country Code" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 min-w-[320px]">
                        {COUNTRY_DIAL_CODE_CHOICES.map(option => (
                          <SelectItem key={`new-member-phone-${option.value}`} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      value={newMember.phone || ''}
                      onChange={(e) => {
                        setNewMember(prev => ({ ...prev, phone: e.target.value }))
                        setNewMemberErrors(prev => ({ ...prev, phone: undefined }))
                      }}
                      placeholder="Phone number"
                      className={cn(
                        "border-purple-200 focus:border-purple-400",
                        newMemberErrors.phone && "border-red-400 focus:border-red-500"
                      )}
                    />
                  </div>
                  {newMemberErrors.phone && <p className="text-xs text-red-600">{newMemberErrors.phone}</p>}
                  <p className="text-xs text-gray-500">Twinned - Private. Used to securely match members to Profiles and invite non-members.</p>
                </div>

                <div className="space-y-2 rounded-lg border border-purple-200 bg-white p-3">
                  <Label className="text-sm font-semibold text-gray-700">Is a Performer?</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newMemberType === 'performer' || Boolean(newMember.isPerformer)}
                      disabled={newMemberType === 'performer'}
                      onCheckedChange={(checked) => setNewMember(prev => ({
                        ...prev,
                        isPerformer: checked,
                        isShareholder: checked ? prev.isShareholder : false,
                        isMainContact: checked ? prev.isMainContact : false
                      }))}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {newMemberType === 'performer' || Boolean(newMember.isPerformer) ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Performer records appear in Artist Banking and can be included in splits.
                  </p>
                </div>

                {(newMemberType === 'performer' || Boolean(newMember.isPerformer)) && (
                  <>
                    <div className="space-y-2 rounded-lg border border-purple-200 bg-white p-3">
                      <Label className="text-sm font-semibold text-gray-700">Shareholder of Artist Entity?</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={newMember.isShareholder ? 'default' : 'outline'}
                          className={newMember.isShareholder ? 'bg-purple-600 hover:bg-purple-700' : ''}
                          onClick={() => setNewMember(prev => ({ ...prev, isShareholder: true }))}
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={!newMember.isShareholder ? 'default' : 'outline'}
                          className={!newMember.isShareholder ? 'bg-purple-600 hover:bg-purple-700' : ''}
                          onClick={() => setNewMember(prev => ({ ...prev, isShareholder: false, isMainContact: false }))}
                        >
                          No
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Must be a performer and/or writer. Twinned.</p>
                    </div>

                    <div className="space-y-2 rounded-lg border border-purple-200 bg-white p-3">
                      <Label className="text-sm font-semibold text-gray-700">Main Contact for Artist Entity?</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={newMember.isMainContact ? 'default' : 'outline'}
                          className={newMember.isMainContact ? 'bg-purple-600 hover:bg-purple-700' : ''}
                          onClick={() => {
                            const label = [newMember.firstName, newMember.lastName].filter(Boolean).join(' ') || 'this new member'
                            if (!confirmMainContactChange('__new_member__', label)) return
                            setNewMember(prev => ({ ...prev, isMainContact: true, isShareholder: true, isPerformer: true }))
                          }}
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={!newMember.isMainContact ? 'default' : 'outline'}
                          className={!newMember.isMainContact ? 'bg-purple-600 hover:bg-purple-700' : ''}
                          onClick={() => setNewMember(prev => ({ ...prev, isMainContact: false }))}
                        >
                          No
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Only one main contact. Must be a shareholder. Twinned.</p>
                    </div>
                  </>
                )}

                <div className="space-y-3 md:col-span-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <Label className="text-sm font-semibold text-blue-900">
                    {newMemberType === 'performer' || Boolean(newMember.isPerformer) ? 'Performer Registrations?' : 'Optional Registrations?'}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      value={newMember.performerIsni || ''}
                      onChange={(e) => setNewMember(prev => ({ ...prev, performerIsni: e.target.value }))}
                      placeholder="Individual ISNI"
                      className="bg-white border-blue-200 font-mono"
                    />
                    <Input
                      value={newMember.performerIpn || ''}
                      onChange={(e) => setNewMember(prev => ({ ...prev, performerIpn: e.target.value }))}
                      placeholder="Performer IPN"
                      className="bg-white border-blue-200 font-mono"
                    />
                    <Input
                      value={newMember.creatorIpiCae || ''}
                      onChange={(e) => setNewMember(prev => ({ ...prev, creatorIpiCae: e.target.value }))}
                      placeholder="Writer IPI"
                      className="bg-white border-blue-200 font-mono"
                    />
                  </div>
                  <p className="text-xs text-blue-700">
                    {newMemberType === 'performer' || Boolean(newMember.isPerformer)
                      ? 'At least one ID is required for performers.'
                      : 'Optional for support crew, useful where they also perform or write.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    {newMemberType === 'performer' ? 'Member of Artist Since?' : 'Crew Since?'}
                  </Label>
                  <Input
                    type="month"
                    value={newMember.memberSince || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, memberSince: e.target.value }))}
                    className="border-purple-200 focus:border-purple-400"
                  />
                  <p className="text-xs text-gray-500">Date joined, month/year.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Status: Current/Previous?</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={newMember.isCurrentMember !== false ? 'default' : 'outline'}
                      className={newMember.isCurrentMember !== false ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      onClick={() => setNewMember(prev => ({ ...prev, isCurrentMember: true, dateLeft: '' }))}
                    >
                      Is Current {newMemberType === 'performer' || Boolean(newMember.isPerformer) ? 'Member' : 'Crew'}
                    </Button>
                    <Input
                      type="month"
                      value={newMember.dateLeft || ''}
                      onChange={(e) => setNewMember(prev => ({ ...prev, isCurrentMember: false, dateLeft: e.target.value }))}
                      className="border-purple-200 focus:border-purple-400"
                      placeholder="Date left"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Choose current or add Date Left for previous members.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    {newMemberType === 'performer' || Boolean(newMember.isPerformer) ? 'Performer Roles?' : 'Support Roles?'}
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
                                roles: toggleCategoryRole(prev.roles || [], role)
                              }))}
                              className="ml-1 hover:text-purple-900"
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 italic">No roles selected yet</span>
                      )}
                    </div>
                    {(newMemberType === 'performer' || Boolean(newMember.isPerformer)) && (
                      <Collapsible open={newMemberPerformerRolePickerOpen} onOpenChange={setNewMemberPerformerRolePickerOpen}>
                      <CollapsibleTrigger className="w-full" type="button">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors">
                          <span className="text-sm font-semibold text-purple-800">+ Add Performer Roles</span>
                          {newMemberPerformerRolePickerOpen ? (
                            <ChevronUp className="w-4 h-4 text-purple-700" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-purple-700" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="space-y-2 p-2 bg-purple-50 rounded-lg">
                          {performerRoleCategories.map((category) => (
                            <div key={category.id}>
                              <p className="text-sm font-semibold text-gray-800 mb-1.5">{category.name}</p>
                              <div className="flex flex-wrap gap-1">
                                {category.items.map((item) => (
                                  <button
                                    key={item}
                                    onClick={() => toggleNewMemberRole(item, category)}
                                    type="button"
                                    disabled={isDependentRoleDisabled(newMember.roles || [], item, category)}
                                    className={cn(
                                      "text-sm px-2.5 py-1 rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                                      (newMember.roles || []).includes(item)
                                        ? "bg-purple-600 text-white border border-purple-600"
                                        : "bg-white border border-gray-300 text-gray-800 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-900"
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
                    )}
                    <Collapsible open={newMemberSupportRolePickerOpen} onOpenChange={setNewMemberSupportRolePickerOpen}>
                      <CollapsibleTrigger className="w-full mt-2" type="button">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                          <span className="text-sm font-semibold text-blue-800">+ Add Support Roles</span>
                          {newMemberSupportRolePickerOpen ? (
                            <ChevronUp className="w-4 h-4 text-blue-700" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-700" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="space-y-2 p-2 bg-blue-50 rounded-lg">
                          {supportRoleCategories.map((category) => (
                            <div key={category.id}>
                              <p className="text-sm font-semibold text-gray-800 mb-1.5">{category.name}</p>
                              <div className="flex flex-wrap gap-1">
                                {category.items.map((item) => (
                                  <button
                                    key={item}
                                    onClick={() => toggleNewMemberRole(item, category)}
                                    type="button"
                                    disabled={isDependentRoleDisabled(newMember.roles || [], item, category)}
                                    className={cn(
                                      "text-sm px-2.5 py-1 rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                                      (newMember.roles || []).includes(item)
                                        ? "bg-blue-700 text-white border border-blue-700"
                                        : "bg-white border border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900"
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

                {/* Instruments (3-tier multi-select) */}
                {(newMemberType === 'performer' || Boolean(newMember.isPerformer)) && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Guitar className="w-4 h-4 text-purple-600" />
                      Performer Instruments?
                    </Label>
                    <InstrumentPicker3Tier
                      value={newMemberInstruments}
                      onChange={setNewMemberInstruments}
                      allowedGroups={['strings', 'wind', 'percussion', 'keyboard', 'electronic']}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
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

          <div id="artist-crew-manage-team" className="scroll-mt-28">
            {/* Manage Team Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-purple-900">Manage Team</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <div id="artist-crew-view-performers" className="scroll-mt-28 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-purple-800">View Performers</p>
                  <p className="text-sm text-gray-700">
                    {crewMembers.filter(member => isPerformerMember(member) && member.isCurrentMember !== false).length} current
                  </p>
                </div>
                <div id="artist-crew-view-support-crew" className="scroll-mt-28 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-800">View Support Crew</p>
                  <p className="text-sm text-gray-700">
                    {crewMembers.filter(member => !member.isProfileOwner && member.memberType === 'support' && member.isCurrentMember !== false).length} current
                  </p>
                </div>
                <div id="artist-crew-manage-admins" className="scroll-mt-28 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-green-800">Manage Admins</p>
                  <p className="text-sm text-gray-700">
                    {crewMembers.filter(member => !member.isProfileOwner && member.isAdmin).length} admins
                  </p>
                </div>
                <div id="artist-crew-view-shareholders" className="scroll-mt-28 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Shareholders</p>
                  <p className="text-sm text-gray-700">
                    {crewMembers.filter(member => member.isShareholder && member.isCurrentMember !== false).length} current
                  </p>
                </div>
                <div id="artist-crew-historic-members" className="scroll-mt-28 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-800">Historic Members</p>
                  <p className="text-sm text-gray-700">
                    {crewMembers.filter(member => !member.isProfileOwner && member.isCurrentMember === false).length} previous
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-amber-300 text-amber-800 hover:bg-amber-50"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/artist-dashboard?section=crew&subSection=owner'
                    }
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm / Update Shareholder Details
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={goToArtistBankingLegalMembers}
                >
                  <Landmark className="w-4 h-4 mr-2" />
                  Open Artist Banking
                </Button>
              </div>
              {crewMembers.some(member => member.isShareholder && member.isCurrentMember !== false) && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Current Shareholders</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {crewMembers
                      .filter(member => member.isShareholder && member.isCurrentMember !== false)
                      .map(member => (
                        <Badge key={`shareholder-${member.id}`} variant="secondary" className="bg-white text-amber-800 border-amber-200">
                          {getDisplayName(member)}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
              {crewMembers.filter(member => !member.isProfileOwner).length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  Existing team members and invitations have been loaded from this artist profile.
                  Use <span className="font-semibold">Manage</span> to review them or <span className="font-semibold">Remove</span> if they no longer belong to this profile.
                </div>
              )}
              {crewMembers.length > 0 ? (
                <div className="space-y-3">
                  {crewMembers.map((member) => (
                    <div key={member.id} className="p-4 border border-purple-200 rounded-lg bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">
                            {getDisplayName(member)}
                          </h5>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary" className={member.memberType === 'support' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-100 text-purple-800 border-purple-200'}>
                              {member.isProfileOwner ? 'Profile Owner' : member.memberType === 'support' ? 'Support Crew' : 'Performer'}
                            </Badge>
                            {member.isProfileOwner ? (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                                Auto-Included
                              </Badge>
                            ) : null}
                            {isPerformerMember(member) ? (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                                Is a Performer
                              </Badge>
                            ) : null}
                            {member.isCurrentMember === false ? (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                                Previous{member.dateLeft ? ` - left ${member.dateLeft}` : ''}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                Current
                              </Badge>
                            )}
                            {member.isShareholder ? (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                                Shareholder
                              </Badge>
                            ) : null}
                            {member.isMainContact ? (
                              <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 border-cyan-200">
                                Main Contact
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {member.roles.length > 0 ? member.roles.filter(r => !r.startsWith('instrument:')).join('; ') || 'No roles assigned' : 'No roles assigned'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={member.status === 'joined' ? 'default' : 'secondary'}
                              className={member.status === 'joined' ? 'bg-green-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-300'}
                            >
                              {member.status === 'joined' ? 'Joined' : member.status === 'invited' ? 'Invited' : 'Invite'}
                            </Badge>
                            <span className="text-sm font-medium text-gray-700">Admin</span>
                            <select
                              value={member.isAdmin ? 'Yes' : 'No'}
                              onChange={(e) => updateMemberAdmin(member.id, e.target.value === 'Yes')}
                              disabled={member.isProfileOwner || updatingAdminMemberId === member.id}
                              className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-800 focus:border-purple-400 focus:outline-none"
                            >
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (member.isProfileOwner) {
                                document.getElementById('artist-crew-owner')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                return
                              }
                              startEditingMember(member)
                            }}
                            className={editingMemberId === member.id ? "text-white bg-purple-600 border-purple-600 hover:bg-purple-700" : "text-purple-700 border-purple-200 hover:bg-purple-50"}
                          >
                            {member.isProfileOwner ? 'Edit Owner' : editingMemberId === member.id ? 'Close' : 'Manage'}
                          </Button>
                          {!member.isProfileOwner && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMember(member.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Inline member editor */}
                      {!member.isProfileOwner && editingMemberId === member.id && (
                        <div className="mt-4 pt-4 border-t border-purple-100 space-y-4">
                          {/* Name fields */}
                          <div>
                            <p className="text-sm font-medium text-purple-900 mb-3">Edit Details</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-sm font-semibold text-gray-700">First Name</Label>
                                <Input
                                  value={editingMemberFields.firstName}
                                  onChange={(e) => setEditingMemberFields(prev => ({ ...prev, firstName: e.target.value }))}
                                  placeholder="First name"
                                  className="border-purple-200 focus:border-purple-400 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-semibold text-gray-700">Last Name</Label>
                                <Input
                                  value={editingMemberFields.lastName}
                                  onChange={(e) => setEditingMemberFields(prev => ({ ...prev, lastName: e.target.value }))}
                                  placeholder="Last name"
                                  className="border-purple-200 focus:border-purple-400 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-semibold text-gray-700">Nickname</Label>
                                <Input
                                  value={editingMemberFields.nickname}
                                  onChange={(e) => setEditingMemberFields(prev => ({ ...prev, nickname: e.target.value }))}
                                  placeholder="Nickname (public)"
                                  className="border-purple-200 focus:border-purple-400 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] gap-2">
                                  <Select
                                    value={getDialCodeChoiceValue(editingMemberFields.phoneCountryCode)}
                                    onValueChange={(value) => setEditingMemberFields(prev => ({ ...prev, phoneCountryCode: getDialCodeFromChoiceValue(value) }))}
                                  >
                                    <SelectTrigger className="border-purple-200 focus:border-purple-400 text-sm">
                                      <SelectValue placeholder="Country Code" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 min-w-[320px]">
                                      {COUNTRY_DIAL_CODE_CHOICES.map(option => (
                                        <SelectItem key={`edit-member-phone-${option.value}`} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={editingMemberFields.phone}
                                    onChange={(e) => setEditingMemberFields(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Phone number"
                                    className="border-purple-200 focus:border-purple-400 text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1 rounded-lg border border-blue-200 bg-blue-50 p-3">
                              <Label className="text-sm font-semibold text-blue-900">Individual ISNI</Label>
                              <Input
                                value={editingMemberFields.performerIsni}
                                onChange={(e) => setEditingMemberFields(prev => ({ ...prev, performerIsni: e.target.value }))}
                                placeholder="Individual ISNI"
                                className="bg-white border-blue-200 font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-1 rounded-lg border border-blue-200 bg-blue-50 p-3">
                              <Label className="text-sm font-semibold text-blue-900">Performer IPN</Label>
                              <Input
                                value={editingMemberFields.performerIpn}
                                onChange={(e) => setEditingMemberFields(prev => ({ ...prev, performerIpn: e.target.value }))}
                                placeholder="Performer IPN"
                                className="bg-white border-blue-200 font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-1 rounded-lg border border-blue-200 bg-blue-50 p-3">
                              <Label className="text-sm font-semibold text-blue-900">Writer IPI</Label>
                              <Input
                                value={editingMemberFields.creatorIpiCae}
                                onChange={(e) => setEditingMemberFields(prev => ({ ...prev, creatorIpiCae: e.target.value }))}
                                placeholder="Writer IPI"
                                className="bg-white border-blue-200 font-mono text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="space-y-2 rounded-lg border border-purple-200 bg-white p-3">
                              <Label className="text-sm font-semibold text-gray-700">Is a Performer?</Label>
                              <Switch
                                checked={editingMemberFields.isPerformer}
                                onCheckedChange={(checked) => setEditingMemberFields(prev => ({
                                  ...prev,
                                  isPerformer: checked,
                                  isShareholder: checked ? prev.isShareholder : false,
                                  isMainContact: checked ? prev.isMainContact : false
                                }))}
                              />
                            </div>
                            <div className="space-y-2 rounded-lg border border-purple-200 bg-white p-3">
                              <Label className="text-sm font-semibold text-gray-700">Shareholder?</Label>
                              <Switch
                                checked={editingMemberFields.isPerformer && editingMemberFields.isShareholder}
                                onCheckedChange={(checked) => setEditingMemberFields(prev => ({
                                  ...prev,
                                  isPerformer: checked ? true : prev.isPerformer,
                                  isShareholder: checked,
                                  isMainContact: checked ? prev.isMainContact : false
                                }))}
                              />
                            </div>
                            <div className="space-y-2 rounded-lg border border-purple-200 bg-white p-3">
                              <Label className="text-sm font-semibold text-gray-700">Main Contact?</Label>
                              <Switch
                                checked={editingMemberFields.isPerformer && editingMemberFields.isMainContact}
                                onCheckedChange={(checked) => {
                                  if (checked && !confirmMainContactChange(member.id, getMemberLabel(member))) return
                                  setEditingMemberFields(prev => ({
                                    ...prev,
                                    isPerformer: checked ? true : prev.isPerformer,
                                    isMainContact: checked,
                                    isShareholder: checked ? true : prev.isShareholder
                                  }))
                                }}
                              />
                            </div>
                            <div className="space-y-2 rounded-lg border border-purple-200 bg-white p-3">
                              <Label className="text-sm font-semibold text-gray-700">Status</Label>
                              <div className="grid grid-cols-1 gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={editingMemberFields.isCurrentMember ? 'default' : 'outline'}
                                  className={editingMemberFields.isCurrentMember ? 'bg-purple-600 hover:bg-purple-700' : ''}
                                  onClick={() => setEditingMemberFields(prev => ({ ...prev, isCurrentMember: true, dateLeft: '' }))}
                                >
                                  Current
                                </Button>
                                <Input
                                  type="month"
                                  value={editingMemberFields.dateLeft}
                                  onChange={(e) => setEditingMemberFields(prev => ({ ...prev, isCurrentMember: false, dateLeft: e.target.value }))}
                                  className="border-purple-200 text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Roles */}
                          <div>
                            <p className="text-base font-semibold text-gray-900 mb-2">Roles & Skills</p>
                            <div className="space-y-2">
                              {ROLE_CATEGORIES.map((category) => {
                                return (
                                  <Collapsible key={category.id}>
                                    <CollapsibleTrigger className="w-full">
                                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 transition-colors text-left">
                                        <div className="flex items-center gap-2">
                                          {category.icon}
                                          <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <div className="mt-1 p-3 rounded-lg bg-purple-50 border border-purple-100 space-y-1">
                                        {category.items.map((item) => {
                                          const isDisabled = isDependentRoleDisabled(editingMemberFields.roles, item, category)
                                          return (
                                            <div key={item} className={`flex items-center gap-2 py-0.5 ${isDisabled ? 'opacity-40' : ''}`}>
                                              <Switch
                                                id={`edit-${member.id}-${item}`}
                                                checked={editingMemberFields.roles.includes(item)}
                                                onCheckedChange={() => !isDisabled && toggleMemberRole(item, category)}
                                                disabled={isDisabled}
                                              />
                                              <label htmlFor={`edit-${member.id}-${item}`} className={`text-sm font-medium text-gray-900 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                {item}
                                              </label>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                )
                              })}
                            </div>

                            {/* Instruments (3-tier multi-select) */}
                            <div className="space-y-3 mt-3 pt-3 border-t border-purple-200">
                              <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                <Guitar className="w-4 h-4 text-blue-700" />
                                Instruments
                              </p>
                              <InstrumentPicker3Tier
                                value={editingMemberFields.instruments3tier}
                                onChange={(val) => setEditingMemberFields(prev => ({ ...prev, instruments3tier: val }))}
                                allowedGroups={['strings', 'wind', 'percussion', 'keyboard', 'electronic']}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              onClick={() => saveMember(member.id)}
                              disabled={savingMemberId === member.id}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              {savingMemberId === member.id ? 'Saving…' : 'Save Changes'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={closeEditingMember}
                              className="text-purple-700 border-purple-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                !showAddMember && (
	                  <div className="text-center py-8 text-gray-500">
	                    <Users2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
	                    <p>No team members added yet.</p>
	                    <p className="text-sm">Use &quot;Add Performer&quot; or &quot;Add Support Crew&quot; to invite people into this Artist Crew.</p>
	                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
