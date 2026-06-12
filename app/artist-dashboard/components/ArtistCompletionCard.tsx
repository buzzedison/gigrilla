"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "../../../lib/auth-context"
import { HelpCircle, CheckCircle2, Circle, PartyPopper, X } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { getArtistSubTypeLabels } from "../../../lib/artist-subtype-utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export type CompletionSection =
  | 'profile'
  | 'payments'
  | 'crew'
  | 'royalty'
  | 'gigability'
  | 'collabability'
  | 'bio'
  | 'genres'
  | 'maps'
  | 'logo'
  | 'photos'
  | 'videos'
  | 'type'
  | 'contract'
  | 'music-uploads'

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
  id?: string | null
  stage_name?: string | null
  artist_type_id?: number | null
  artist_sub_types?: string[] | Record<string, string[] | string | null | undefined> | string | null
  artist_entity_isni?: string | null
  artist_primary_roles?: string[] | null
  established_date?: string | null
  performing_members?: number | string | null
  preferred_genre_ids?: string[] | null
  bio?: string | null
  social_links?: Record<string, string | null> | null
  base_location?: string | null
  base_location_lat?: number | null
  base_location_lon?: number | null
  hometown_city?: string | null
  hometown_state?: string | null
  hometown_country?: string | null
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
  local_gig_area?: unknown
  wider_gig_area?: unknown
  location_details?: Record<string, unknown> | null
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
  name?: string | null
  roles?: string[] | null
  status?: string | null
  metadata?: {
    gigRoyaltyShare?: number
    merchRoyaltyShare?: number
    isCurrentMember?: boolean
  }
}

interface LegalMemberData {
  id: string
  metadata?: {
    isCurrentMember?: boolean
  } | null
}

interface PaymentDetailsData {
  entity_type?: string | null
  artist_entity_legal_name?: string | null
  main_contact_first_name?: string | null
  main_contact_last_name?: string | null
  main_contact_phone?: string | null
  main_contact_email?: string | null
  country_of_incorporation?: string | null
  country_of_tax_residence?: string | null
  generic_tax_id?: string | null
  individual_tax_id?: string | null
  business_tax_id?: string | null
  vat_gst_sst_id?: string | null
  company_formation_date?: string | null
  legal_entity_date_of_birth?: string | null
  use_fan_banking?: boolean
  payment_out_method?: string
  payment_out_bank_name?: string
  payment_out_account_holder?: string
  payment_out_sort_code?: string
  payment_out_account_number?: string
  payment_out_card_name?: string
  payment_out_card_number?: string
  payment_out_card_expiry?: string
  payment_out_card_cvv?: string
  payment_in_same_as_out?: boolean
  payment_in_method?: string
  payment_in_bank_name?: string
  payment_in_account_holder?: string
  payment_in_sort_code?: string
  payment_in_account_number?: string
  payment_in_card_name?: string
  payment_in_card_number?: string
  payment_in_card_expiry?: string
  payment_in_card_cvv?: string
  legal_member_confirmations?: Record<string, boolean | { confirmed?: boolean }>
}

interface MusicReleaseData {
  id: string
  upload_guide_confirmed?: boolean | null
}

interface ArtistCompletionCardProps {
  onCompletionStateChange?: (items: CompletionItemState[]) => void
  onNavigateToItem?: (item: CompletionItemState) => void
  refreshKey?: number
}

const ARTIST_TYPE_ONE_ID = 1

const LEGACY_COMPLETION_DEFINITIONS: CompletionItemDefinition[] = [
  { id: 'artist_type', label: 'Artist Type', required: true, section: 'type' },
  { id: 'artist_sub_types', label: 'Artist Sub-Type', required: true, dependsOn: ['artist_type'], section: 'type' },
  { id: 'stage_name', label: 'Artist Stage Name', required: true, section: 'profile' },
  { id: 'established_date', label: 'Artist Formed', required: true, section: 'profile' },
  { id: 'record_label', label: 'Record Label', section: 'contract' },
  { id: 'music_publisher', label: 'Music Publisher', section: 'contract' },
  { id: 'artist_manager', label: 'Artist Manager', section: 'contract' },
  { id: 'booking_agent', label: 'Booking Agent', section: 'contract' },
  { id: 'genres', label: 'Artist Genre(s)', required: true, section: 'genres' },
  { id: 'bio', label: 'Artist Biography', section: 'bio' },
  { id: 'crew', label: 'Artist Crew', section: 'crew' },
  { id: 'royalty_splits', label: 'Gig Money Splits', section: 'royalty' },
  { id: 'payments', label: 'Artist Banking', section: 'payments' },
  { id: 'logo_artwork', label: 'Logo/Profile Artwork', required: true, section: 'logo' },
  { id: 'photos', label: 'Photos', required: true, section: 'photos' },
  { id: 'videos', label: 'Videos', required: true, section: 'videos' },
  { id: 'gig_ability', label: 'Artist Gig-Ability', section: 'gigability' },
  { id: 'gig_fee', label: 'Basic Gig Fee', required: true, section: 'gigability' },
]

const ARTIST_TYPE_ONE_COMPLETION_DEFINITIONS: CompletionItemDefinition[] = [
  { id: 'artist_type', label: 'Artist Type', required: true, section: 'type' },
  { id: 'stage_name', label: 'Artist Entity Stage Name', required: true, section: 'profile' },
  { id: 'artist_entity_isni', label: 'Artist Entity ISNI', required: true, section: 'profile' },
  { id: 'established_date', label: 'Artist Formed', required: true, section: 'profile' },
  { id: 'performing_members', label: 'Number of Performers', required: true, section: 'profile' },
  { id: 'hometown', label: 'Artist Hometown', required: true, section: 'profile' },
  { id: 'contract_status', label: 'Artist Contract Status', required: true, section: 'contract' },
  { id: 'genres', label: 'Artist Genres', required: true, section: 'genres' },
  { id: 'primary_roles', label: 'Your Roles & Info Role', required: true, section: 'crew' },
  { id: 'artist_gig_money_splits', label: 'Gig Money Splits', required: true, section: 'royalty' },
  { id: 'artist_collab_money_splits', label: 'Collab Money Splits', required: true, section: 'royalty' },
  { id: 'merch_money_splits', label: 'MyStore Money Splits', required: true, section: 'royalty' },
  { id: 'legal_entity', label: 'Artist Legal Entity', required: true, section: 'payments' },
  { id: 'legal_members', label: 'Artist Legal Members', required: true, section: 'payments' },
  { id: 'money_in', label: 'Money In', required: true, section: 'payments' },
  { id: 'money_out', label: 'Money Out', required: true, section: 'payments' },
  { id: 'logo', label: 'Logo', required: true, section: 'logo' },
  { id: 'header', label: 'Header', required: true, section: 'logo' },
  { id: 'gig_money_splits', label: 'Gig Money Splits', required: true, section: 'royalty' },
  { id: 'gig_base_location', label: 'Base Location', required: true, section: 'gigability' },
  { id: 'gig_set_lengths', label: 'Set Lengths', required: true, section: 'gigability' },
  { id: 'gig_fees', label: 'Gig Fees', required: true, section: 'gigability' },
  { id: 'gig_local_area', label: 'Local Gig Area', required: true, section: 'gigability' },
  { id: 'gig_wider_area', label: 'Wider Gig Area', required: true, section: 'gigability' },
  { id: 'collab_money_splits', label: 'Collab Money Splits', required: true, section: 'royalty' },
  { id: 'collab_base_location', label: 'Base Location', required: true, section: 'collabability' },
  { id: 'collab_set_lengths', label: 'Set Lengths', required: true, section: 'collabability' },
  { id: 'collab_fees', label: 'Collab Fees', required: true, section: 'collabability' },
  { id: 'collab_local_area', label: 'Local Collab Area', required: true, section: 'collabability' },
  { id: 'collab_wider_area', label: 'Wider Collab Area', required: true, section: 'collabability' },
  { id: 'upload_guide', label: 'Upload Guide', required: true, section: 'music-uploads' },
]

const toFiniteNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

const hasPositiveNumber = (value: unknown) => toFiniteNumber(value) > 0

const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0

const getRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

const getNestedRecord = (record: Record<string, unknown>, key: string) => getRecord(record[key])

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return false
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return hasMeaningfulValue(JSON.parse(trimmed))
      } catch {
        return true
      }
    }
    return true
  }
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (typeof value === 'object') return Object.values(value).some(hasMeaningfulValue)
  return false
}

const isConfirmedLegalMember = (confirmation: boolean | { confirmed?: boolean } | undefined) => {
  if (confirmation === true) return true
  return Boolean(confirmation && typeof confirmation === 'object' && confirmation.confirmed === true)
}

const COMPLETION_DASHBOARD_DESTINATIONS: Record<string, { section: string; subSection?: string }> = {
  stage_name: { section: 'profile', subSection: 'artist-stage-name' },
  artist_entity_isni: { section: 'profile', subSection: 'artist-entity-isni' },
  artist_type: { section: 'type', subSection: 'selector' },
  artist_sub_types: { section: 'type', subSection: 'selector' },
  established_date: { section: 'profile', subSection: 'artist-formed' },
  performing_members: { section: 'profile', subSection: 'artist-performers-count' },
  hometown: { section: 'profile', subSection: 'artist-hometown' },
  contract_status: { section: 'contract', subSection: 'label' },
  genres: { section: 'genres', subSection: 'selector' },
  payments: { section: 'payments', subSection: 'legal-entity' },
  crew: { section: 'crew', subSection: 'owner' },
  primary_roles: { section: 'crew', subSection: 'owner' },
  royalty_splits: { section: 'royalty', subSection: 'splits' },
  artist_gig_money_splits: { section: 'royalty', subSection: 'splits' },
  artist_collab_money_splits: { section: 'royalty', subSection: 'splits' },
  merch_money_splits: { section: 'royalty', subSection: 'merch-splits' },
  gig_ability: { section: 'gigability', subSection: 'base' },
  bio: { section: 'bio', subSection: 'editor' },
  record_label: { section: 'contract', subSection: 'label' },
  music_publisher: { section: 'contract', subSection: 'publisher' },
  artist_manager: { section: 'contract', subSection: 'manager' },
  booking_agent: { section: 'contract', subSection: 'booking' },
  gig_fee: { section: 'gigability', subSection: 'fees' },
  logo_artwork: { section: 'logo', subSection: 'logo' },
  legal_entity: { section: 'payments', subSection: 'legal-entity' },
  legal_members: { section: 'payments', subSection: 'legal-members' },
  money_in: { section: 'payments', subSection: 'in' },
  money_out: { section: 'payments', subSection: 'out' },
  logo: { section: 'logo', subSection: 'logo' },
  header: { section: 'logo', subSection: 'header' },
  gig_money_splits: { section: 'royalty', subSection: 'splits' },
  gig_base_location: { section: 'gigability', subSection: 'base' },
  gig_set_lengths: { section: 'gigability', subSection: 'sets' },
  gig_fees: { section: 'gigability', subSection: 'fees' },
  gig_local_area: { section: 'gigability', subSection: 'local' },
  gig_wider_area: { section: 'gigability', subSection: 'wider' },
  collab_money_splits: { section: 'royalty', subSection: 'splits' },
  collab_base_location: { section: 'collabability', subSection: 'base' },
  collab_set_lengths: { section: 'collabability', subSection: 'sets' },
  collab_fees: { section: 'collabability', subSection: 'fees' },
  collab_local_area: { section: 'collabability', subSection: 'local' },
  collab_wider_area: { section: 'collabability', subSection: 'wider' },
  upload_guide: { section: 'music-uploads', subSection: 'guide' },
  photos: { section: 'photos', subSection: 'gallery' },
  videos: { section: 'videos', subSection: 'upload' },
}

export function ArtistCompletionCard({ onCompletionStateChange, onNavigateToItem, refreshKey = 0 }: ArtistCompletionCardProps) {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<ArtistProfileData | null>(null)
  const [photos, setPhotos] = useState<PhotoData[]>([])
  const [videos, setVideos] = useState<VideoData[]>([])
  const [crewMembers, setCrewMembers] = useState<CrewMemberData[]>([])
  const [legalMembers, setLegalMembers] = useState<LegalMemberData[]>([])
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsData | null>(null)
  const [musicReleases, setMusicReleases] = useState<MusicReleaseData[]>([])
  const [loading, setLoading] = useState(true)
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [dismissConfirmOpen, setDismissConfirmOpen] = useState(false)

  const completionDefinitions = useMemo<CompletionItemDefinition[]>(() => (
    profile?.artist_type_id === ARTIST_TYPE_ONE_ID
      ? ARTIST_TYPE_ONE_COMPLETION_DEFINITIONS
      : LEGACY_COMPLETION_DEFINITIONS
  ), [profile?.artist_type_id])

  const evaluatedItems = useMemo<CompletionItemState[]>(() => {
    const hasLogo = photos.some(p => p.type === 'logo')
    const hasHeader = photos.some(p => p.type === 'header')
    const hasPhotos = photos.some(p => p.type === 'photo')
    const hasVideos = videos.length > 0
    const activeCrewMembers = crewMembers.filter(member => member.metadata?.isCurrentMember !== false)
    const hasCrewMembers = activeCrewMembers.length > 0
    const locationDetails = getRecord(profile?.location_details)
    const gigPricingDetails = getNestedRecord(locationDetails, 'gig_pricing')
    const merchPricingDetails = getNestedRecord(locationDetails, 'merch_pricing')
    const ownerGigRoyaltyShare = toFiniteNumber(gigPricingDetails.owner_gig_royalty_share)
    const ownerMerchRoyaltyShare = toFiniteNumber(merchPricingDetails.owner_merch_royalty_share)
    const totalGigRoyaltyShare = activeCrewMembers.reduce((sum, member) => {
      return sum + toFiniteNumber(member.metadata?.gigRoyaltyShare)
    }, ownerGigRoyaltyShare)
    const totalMerchRoyaltyShare = activeCrewMembers.reduce((sum, member) => {
      return sum + toFiniteNumber(member.metadata?.merchRoyaltyShare)
    }, ownerMerchRoyaltyShare)
    const hasAnyGigRoyaltyShare = activeCrewMembers.some(member => hasPositiveNumber(member.metadata?.gigRoyaltyShare)) || ownerGigRoyaltyShare > 0
    const hasAnyMerchRoyaltyShare = activeCrewMembers.some(member => hasPositiveNumber(member.metadata?.merchRoyaltyShare)) || ownerMerchRoyaltyShare > 0
    const hasCompleteRoyaltySplits = hasAnyGigRoyaltyShare && Math.abs(totalGigRoyaltyShare - 100) < 0.01
    const hasCompleteMerchSplits = hasAnyMerchRoyaltyShare && Math.abs(totalMerchRoyaltyShare - 100) < 0.01

    const isCorporateEntity = paymentDetails?.entity_type === 'Incorporated Company' || paymentDetails?.entity_type === 'Incorporated Partnership'
    const hasTaxId = Boolean(
      paymentDetails?.generic_tax_id ||
      paymentDetails?.individual_tax_id ||
      paymentDetails?.business_tax_id ||
      paymentDetails?.vat_gst_sst_id
    )
    const hasLegalEntity = !!paymentDetails && Boolean(
      paymentDetails.entity_type &&
      paymentDetails.artist_entity_legal_name &&
      paymentDetails.main_contact_first_name &&
      paymentDetails.main_contact_last_name &&
      paymentDetails.main_contact_phone &&
      paymentDetails.main_contact_email &&
      hasTaxId &&
      (
        isCorporateEntity
          ? paymentDetails.country_of_incorporation && paymentDetails.company_formation_date
          : paymentDetails.country_of_tax_residence && paymentDetails.legal_entity_date_of_birth
      )
    )
    const hasDirectDebitDetails = (prefix: 'payment_in' | 'payment_out') => Boolean(
      hasText(paymentDetails?.[`${prefix}_bank_name` as keyof PaymentDetailsData]) &&
      hasText(paymentDetails?.[`${prefix}_account_holder` as keyof PaymentDetailsData]) &&
      hasText(paymentDetails?.[`${prefix}_sort_code` as keyof PaymentDetailsData]) &&
      hasText(paymentDetails?.[`${prefix}_account_number` as keyof PaymentDetailsData])
    )
    const hasCardDetails = (prefix: 'payment_in' | 'payment_out') => Boolean(
      hasText(paymentDetails?.[`${prefix}_card_name` as keyof PaymentDetailsData]) &&
      hasText(paymentDetails?.[`${prefix}_card_number` as keyof PaymentDetailsData]) &&
      hasText(paymentDetails?.[`${prefix}_card_expiry` as keyof PaymentDetailsData]) &&
      hasText(paymentDetails?.[`${prefix}_card_cvv` as keyof PaymentDetailsData])
    )
    const hasMoneyOut = !!paymentDetails && (
      paymentDetails.use_fan_banking === true ||
      (
        paymentDetails.payment_out_method === 'direct_debit'
          ? hasDirectDebitDetails('payment_out')
          : paymentDetails.payment_out_method === 'card' && hasCardDetails('payment_out')
      )
    )
    const hasMoneyIn = !!paymentDetails && (
      paymentDetails.use_fan_banking === true ||
      (paymentDetails.payment_in_same_as_out === true && hasMoneyOut) ||
      (
        paymentDetails.payment_in_method === 'direct_debit'
          ? hasDirectDebitDetails('payment_in')
          : paymentDetails.payment_in_method === 'card' && hasCardDetails('payment_in')
      )
    )
    const currentLegalMembers = legalMembers.filter(member => member.metadata?.isCurrentMember !== false)
    const legalMemberConfirmations = paymentDetails?.legal_member_confirmations ?? {}
    const hasLegalMembers = !!paymentDetails && currentLegalMembers.length > 0 && currentLegalMembers.every(member => (
      isConfirmedLegalMember(legalMemberConfirmations[member.id])
    ))
    const hasPayments = !!paymentDetails && hasLegalEntity && hasLegalMembers && hasMoneyIn && hasMoneyOut

    const isSignedStatus = (value?: string | null) => value === 'signed' || value === 'signed_admin'
    const isContractStatusSet = (value?: string | null) => {
      return ['signed', 'signed_admin', 'unsigned_seeking', 'independent', 'seeking', 'self_managed'].includes(value ?? '')
    }
    const isContractItemComplete = (status?: string | null, name?: string | null) => {
      if (!isContractStatusSet(status)) return false
      if (isSignedStatus(status)) {
        return Boolean(name && name.trim().length > 0)
      }
      return true
    }

    const hasArtistSubTypes = getArtistSubTypeLabels(profile?.artist_sub_types, profile?.artist_type_id).length > 0
    const hasContractStatus = (
      isContractItemComplete(profile?.record_label_status, profile?.record_label_name) &&
      isContractItemComplete(profile?.music_publisher_status, profile?.music_publisher_name) &&
      isContractItemComplete(profile?.artist_manager_status, profile?.artist_manager_name) &&
      isContractItemComplete(profile?.booking_agent_status, profile?.booking_agent_name)
    )
    const hasHometown = hasText(profile?.base_location) || (
      hasText(profile?.hometown_city) &&
      hasText(profile?.hometown_country)
    )
    const hasBaseLocation = hasText(profile?.base_location) || (
      typeof profile?.base_location_lat === 'number' &&
      typeof profile?.base_location_lon === 'number'
    )
    const hasSetLengths = hasPositiveNumber(profile?.minimum_set_length) && hasPositiveNumber(profile?.maximum_set_length)
    const hasGigFees = Boolean(
      hasPositiveNumber(profile?.local_gig_fee) ||
      hasPositiveNumber(profile?.wider_gig_fee) ||
      hasPositiveNumber(gigPricingDetails.base_fee)
    )
    const hasPrimaryRoles = Array.isArray(profile?.artist_primary_roles) && profile.artist_primary_roles.length > 0
    const hasUploadGuide = musicReleases.some(release => release.upload_guide_confirmed === true)

    const profileMetrics: Record<string, boolean> = {
      stage_name: hasText(profile?.stage_name),
      artist_type: hasPositiveNumber(profile?.artist_type_id),
      artist_sub_types: hasArtistSubTypes,
      artist_entity_isni: hasText(profile?.artist_entity_isni),
      established_date: hasText(profile?.established_date),
      performing_members: hasPositiveNumber(profile?.performing_members),
      hometown: hasHometown,
      contract_status: hasContractStatus,
      genres: Array.isArray(profile?.preferred_genre_ids) && profile!.preferred_genre_ids!.length > 0,
      payments: hasPayments,
      crew: hasCrewMembers,
      royalty_splits: hasCompleteRoyaltySplits,
      artist_gig_money_splits: hasCompleteRoyaltySplits,
      artist_collab_money_splits: hasCompleteRoyaltySplits,
      merch_money_splits: hasCompleteMerchSplits,
      gig_ability: hasBaseLocation && hasSetLengths,
      bio: Boolean(profile?.bio && profile.bio.trim().length > 0),
      record_label: isContractItemComplete(profile?.record_label_status, profile?.record_label_name),
      music_publisher: isContractItemComplete(profile?.music_publisher_status, profile?.music_publisher_name),
      artist_manager: isContractItemComplete(profile?.artist_manager_status, profile?.artist_manager_name),
      booking_agent: isContractItemComplete(profile?.booking_agent_status, profile?.booking_agent_name),
      gig_fee: hasGigFees,
      logo_artwork: hasLogo,
      legal_entity: hasLegalEntity,
      legal_members: hasLegalMembers,
      money_in: hasMoneyIn,
      money_out: hasMoneyOut,
      primary_roles: hasPrimaryRoles,
      logo: hasLogo,
      header: hasHeader,
      gig_money_splits: hasCompleteRoyaltySplits,
      gig_base_location: hasBaseLocation,
      gig_set_lengths: hasSetLengths,
      gig_fees: hasGigFees,
      gig_local_area: hasMeaningfulValue(profile?.local_gig_area),
      gig_wider_area: hasMeaningfulValue(profile?.wider_gig_area),
      collab_money_splits: hasCompleteRoyaltySplits,
      collab_base_location: hasBaseLocation,
      collab_set_lengths: hasSetLengths,
      collab_fees: hasGigFees,
      collab_local_area: hasMeaningfulValue(profile?.local_gig_area),
      collab_wider_area: hasMeaningfulValue(profile?.wider_gig_area),
      upload_guide: hasUploadGuide,
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
  }, [completionDefinitions, profile, photos, videos, crewMembers, legalMembers, paymentDetails, musicReleases])

  useEffect(() => {
    onCompletionStateChange?.(evaluatedItems)
  }, [evaluatedItems, onCompletionStateChange])

  const completedCount = useMemo(() => evaluatedItems.filter(item => item.completed).length, [evaluatedItems])
  const totalCount = evaluatedItems.length
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)
  const requiredItems = useMemo(() => evaluatedItems.filter(item => item.required), [evaluatedItems])
  const requiredCompletedCount = useMemo(() => requiredItems.filter(item => item.completed).length, [requiredItems])
  const allRequiredComplete = requiredCompletedCount === requiredItems.length && requiredItems.length > 0
  const nextIncompleteItem = useMemo(
    () => requiredItems.find((item) => !item.completed) ?? evaluatedItems.find((item) => !item.completed) ?? null,
    [evaluatedItems, requiredItems]
  )

  const loadCompletionStatus = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const noCache = { cache: 'no-store' as const }
      const [profileResponse, photosResponse, videosResponse, crewResponse, paymentsResponse, releasesResponse] = await Promise.all([
        fetch('/api/artist-profile', noCache),
        fetch('/api/artist-photos', noCache),
        fetch('/api/artist-videos', noCache),
        fetch('/api/artist-members', noCache),
        fetch('/api/artist-payments', noCache),
        fetch('/api/music-releases', noCache)
      ])

      const profileResult = await profileResponse.json()
      if (profileResult.data) {
        const rawProfile = profileResult.data as ArtistProfileData & { onboarding_completed?: boolean }
        setProfile(rawProfile)
        setOnboardingCompleted(rawProfile.onboarding_completed ?? false)
      } else {
        setProfile(null)
        setOnboardingCompleted(false)
      }

      const photosResult = await photosResponse.json()
      if (photosResult.data) {
        setPhotos(photosResult.data)
      } else {
        setPhotos([])
      }

      const videosResult = await videosResponse.json()
      if (videosResult.data) {
        setVideos(videosResult.data)
      } else {
        setVideos([])
      }

      const crewResult = await crewResponse.json()
      const invitationMembers = Array.isArray(crewResult.invitations) ? crewResult.invitations : []
      const activeMembers = Array.isArray(crewResult.activeMembers) ? crewResult.activeMembers : []
      const ownerMember = profileResult.data?.id
        ? [{ id: `owner:${profileResult.data.id}`, name: profileResult.data.stage_name || 'Profile Owner' }]
        : []
      const combinedCrewMembers = [...ownerMember, ...invitationMembers, ...activeMembers]
      setCrewMembers(combinedCrewMembers)

      const paymentsResult = await paymentsResponse.json()
      if (paymentsResult.data) {
        setPaymentDetails(paymentsResult.data)
      } else {
        setPaymentDetails(null)
      }

      setLegalMembers(Array.isArray(paymentsResult.legalMembers) ? paymentsResult.legalMembers : [])

      const releasesResult = await releasesResponse.json()
      setMusicReleases(Array.isArray(releasesResult.data) ? releasesResult.data : [])
    } catch (error) {
      console.error('Error loading completion status:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const recent = searchParams.get('completed')
    if (recent) setRecentlyCompleted(recent)
  }, [searchParams])

  useEffect(() => {
    void loadCompletionStatus()
  }, [loadCompletionStatus, refreshKey])

  useEffect(() => {
    const handleProfileUpdated = () => {
      void loadCompletionStatus()
    }

    window.addEventListener('artist-profile-updated', handleProfileUpdated)
    return () => {
      window.removeEventListener('artist-profile-updated', handleProfileUpdated)
    }
  }, [loadCompletionStatus])

  // ── Restore dismissed state from localStorage ──────────────────────────────
  useEffect(() => {
    if (!user) return
    try {
      const stored = localStorage.getItem(`completion-panel-dismissed-${user.id}`)
      if (stored === 'true') setIsDismissed(true)
    } catch {}
  }, [user])

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

  // ── Auto-complete onboarding when all items reach 100% ────────────────────
  // Fires after handleCompleteOnboarding is defined to avoid TS forward-ref warning
  useEffect(() => {
    if (
      percentage === 100 &&
      !onboardingCompleted &&
      !loading &&
      !isMarkingComplete &&
      allRequiredComplete
    ) {
      void handleCompleteOnboarding()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage, onboardingCompleted, loading, isMarkingComplete, allRequiredComplete])

  const navigateToItemSection = (item: CompletionItemState) => {
    if (onNavigateToItem) {
      onNavigateToItem(item)
      return
    }

    const destination = COMPLETION_DASHBOARD_DESTINATIONS[item.id] ?? { section: item.section }

    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('section', destination.section)
    if (destination.subSection) {
      params.set('subSection', destination.subSection)
    } else {
      params.delete('subSection')
    }
    params.delete('folder')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleContinueSetup = () => {
    if (!nextIncompleteItem) return
    navigateToItemSection(nextIncompleteItem)
  }

  const persistDismissedState = () => {
    setIsDismissed(true)
    try {
      if (user) localStorage.setItem(`completion-panel-dismissed-${user.id}`, 'true')
    } catch {}
  }

  const handleDismissPanel = () => {
    if (!onboardingCompleted) return
    setDismissConfirmOpen(true)
  }

  if (isDismissed && onboardingCompleted) {
    return null
  }

  return (
    <>
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
              {nextIncompleteItem && percentage < 100 && (
                <div className="mt-4 space-y-2">
                  <Button
                    type="button"
                    onClick={handleContinueSetup}
                    className="w-full bg-[#3b1b4d] text-white hover:bg-[#30163f]"
                  >
                    Continue Setup
                  </Button>
                  <p className="text-xs font-medium text-purple-700">
                    Next: {nextIncompleteItem.label}
                  </p>
                </div>
              )}
              {lastCompletedLabel && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                  Nice! You just completed {lastCompletedLabel}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-1">
            <p className="mb-2 text-xs text-gray-500">Tap an item to jump to that section.</p>
            <div className="space-y-1.5">
              {evaluatedItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateToItemSection(item)}
                  className="w-full flex items-center justify-between py-0.5 text-left rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  aria-label={`Go to ${item.label}`}
                >
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
                </button>
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                        <PartyPopper className="w-4 h-4" />
                        <span>Onboarding Complete!</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDismissPanel}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-foreground/50 hover:text-foreground/80 transition-colors py-1"
                      >
                        <X className="w-3 h-3" />
                        Close permanently
                      </button>
                    </div>
                  ) : allRequiredComplete ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-600 font-medium">
                        All required fields complete!
                      </p>
                      {nextIncompleteItem && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleContinueSetup}
                          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          Continue Setup
                        </Button>
                      )}
                      <Button
                        onClick={handleCompleteOnboarding}
                        disabled={isMarkingComplete}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        {isMarkingComplete ? 'Completing...' : 'Complete Onboarding'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        onClick={handleContinueSetup}
                        disabled={!nextIncompleteItem}
                        className="w-full bg-[#3b1b4d] text-white hover:bg-[#30163f]"
                      >
                        Continue Setup
                      </Button>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Complete all required fields to finish onboarding
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={dismissConfirmOpen} onOpenChange={setDismissConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide onboarding panel permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the completed onboarding card from your artist dashboard on this device to free up space, especially on mobile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it visible</AlertDialogCancel>
            <AlertDialogAction onClick={persistDismissedState}>
              Hide permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
