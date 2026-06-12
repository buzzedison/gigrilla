"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Checkbox } from '../../components/ui/checkbox'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useAuth } from '../../../lib/auth-context'
import { CreditCard, Building2, CheckCircle, X, ShieldCheck, Users2, WalletCards, ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronUp, Landmark, UserPlus } from 'lucide-react'
import { COUNTRY_DIAL_CODE_CHOICES, DEFAULT_COUNTRY_DIAL_CODE, getDialCodeChoiceValue, getDialCodeFromChoiceValue } from '../../../lib/country-dial-codes'
import { getCountryOptions } from '../../../lib/country-list'
import { cn } from '../../../lib/utils'
import { INSTRUMENT_TAXONOMY_3TIER } from '../../../data/instrument-taxonomy'
import {
  ARTIST_TAX_ID_COUNTRY_NAMES,
  ARTIST_TAX_ID_FIELD_KEYS,
  ArtistTaxIdField,
  ArtistTaxIdFieldKey,
  getArtistTaxIdProfile
} from '../../../data/artist-tax-id-options'
import type { CountryTaxIdRow } from '../../api/country-tax-ids/route'

/** Convert a DB row into the field list for the given entity type. */
function buildFieldsFromDbRow(row: CountryTaxIdRow, isCorp: boolean): ArtistTaxIdField[] {
  const result: ArtistTaxIdField[] = []
  const add = (
    corpFlag: boolean, indivFlag: boolean,
    key: ArtistTaxIdFieldKey, label: string,
    name: string | null, format: string | null
  ) => {
    if (!name) return
    if (isCorp && !corpFlag) return
    if (!isCorp && !indivFlag) return
    result.push({ key, label, localName: name, example: format ?? '' })
  }
  add(row.generic_id_corp_display,     row.generic_id_indiv_display,     'generic_tax_id',     'Generic/Tax ID',     row.generic_id_name,     row.generic_id_format)
  add(row.individual_id_corp_display,  row.individual_id_indiv_display,  'individual_tax_id',  'Individual Tax ID',  row.individual_id_name,  row.individual_id_format)
  add(row.business_id_corp_display,    row.business_id_indiv_display,    'business_tax_id',    'Business Tax ID',    row.business_id_name,    row.business_id_format)
  add(row.partnership_id_corp_display, row.partnership_id_indiv_display, 'partnership_tax_id', 'Partnership Tax ID', row.partnership_id_name, row.partnership_id_format)
  add(row.vat_id_corp_display,         row.vat_id_indiv_display,         'vat_gst_sst_id',     'VAT/GST/SST ID',     row.vat_id_name,         row.vat_id_format)
  return result
}

const COUNTRY_OPTIONS = Array.from(new Set([
  ...getCountryOptions().map(country => country.name),
  ...ARTIST_TAX_ID_COUNTRY_NAMES
])).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))

const ENTITY_TYPES = [
  'Incorporated Company',
  'Incorporated Partnership',
  'Sole Trader',
  'Partnership'
] as const

type EntityType = typeof ENTITY_TYPES[number]

type PaymentMethod = 'direct_debit' | 'card'
type LegalMemberConfirmation = {
  confirmed?: boolean
  confirmed_at?: string
  confirmed_by?: string
}
type LegalMemberConfirmations = Record<string, LegalMemberConfirmation>

interface PaymentDetails {
  official_ids_acknowledged?: boolean
  payment_flows_acknowledged?: boolean
  entity_type?: EntityType | ''
  artist_entity_legal_name?: string
  main_contact_first_name?: string
  main_contact_last_name?: string
  main_contact_phone_country_code?: string
  main_contact_phone?: string
  main_contact_email?: string
  country_of_incorporation?: string
  country_of_tax_residence?: string
  generic_tax_id?: string
  individual_tax_id?: string
  business_tax_id?: string
  partnership_tax_id?: string
  vat_gst_sst_id?: string
  company_registration_number?: string
  company_formation_date?: string
  legal_entity_date_of_birth?: string
  use_fan_banking?: boolean
  payment_out_method?: PaymentMethod
  payment_out_bank_name?: string
  payment_out_account_holder?: string
  payment_out_sort_code?: string
  payment_out_account_number?: string
  payment_out_card_name?: string
  payment_out_card_number?: string
  payment_out_card_expiry?: string
  payment_out_card_cvv?: string
  payment_in_same_as_out?: boolean
  payment_in_method?: PaymentMethod
  payment_in_bank_name?: string
  payment_in_account_holder?: string
  payment_in_sort_code?: string
  payment_in_account_number?: string
  payment_in_card_name?: string
  payment_in_card_number?: string
  payment_in_card_expiry?: string
  payment_in_card_cvv?: string
  legal_member_confirmations?: LegalMemberConfirmations
}

interface LegalMember {
  id: string
  invitation_id?: string | null
  name?: string
  email?: string
  status?: string
  roles?: string[]
  metadata?: {
    firstName?: string
    lastName?: string
    nickname?: string
    phone?: string
    phoneCountryCode?: string
    memberType?: 'performer' | 'support'
    isPerformer?: boolean
    performerIsni?: string
    performerIpn?: string
    creatorIpiCae?: string
    isShareholder?: boolean
    isMainContact?: boolean
    memberSince?: string
    isCurrentMember?: boolean
    dateLeft?: string
    isAdmin?: boolean
  }
}

interface LegalMemberDraft {
  firstName: string
  lastName: string
  nickname: string
  email: string
  phoneCountryCode: string
  phone: string
  performerIsni: string
  performerIpn: string
  creatorIpiCae: string
  memberSince: string
  dateLeft: string
  isPerformer: boolean
  isShareholder: boolean
  isMainContact: boolean
  isCurrentMember: boolean
  isAdmin: boolean
  rolesText: string
}

interface Notification {
  type: 'success' | 'error'
  message: string
  visible: boolean
}

type LegalEntityErrors = Partial<Record<
  | 'entity_type'
  | 'artist_entity_legal_name'
  | 'main_contact'
  | 'country'
  | 'tax_ids'
  | 'company_formation_date'
  | 'legal_entity_date_of_birth',
  string
>>

const DEFAULT_PAYMENT_DETAILS: PaymentDetails = {
  official_ids_acknowledged: false,
  payment_flows_acknowledged: false,
  entity_type: '',
  artist_entity_legal_name: '',
  main_contact_first_name: '',
  main_contact_last_name: '',
  main_contact_phone_country_code: DEFAULT_COUNTRY_DIAL_CODE,
  main_contact_phone: '',
  main_contact_email: '',
  country_of_incorporation: '',
  country_of_tax_residence: '',
  generic_tax_id: '',
  individual_tax_id: '',
  business_tax_id: '',
  partnership_tax_id: '',
  vat_gst_sst_id: '',
  company_registration_number: '',
  company_formation_date: '',
  legal_entity_date_of_birth: '',
  use_fan_banking: false,
  payment_out_method: 'direct_debit',
  payment_out_bank_name: '',
  payment_out_account_holder: '',
  payment_out_sort_code: '',
  payment_out_account_number: '',
  payment_out_card_name: '',
  payment_out_card_number: '',
  payment_out_card_expiry: '',
  payment_out_card_cvv: '',
  payment_in_same_as_out: true,
  payment_in_method: 'direct_debit',
  payment_in_bank_name: '',
  payment_in_account_holder: '',
  payment_in_sort_code: '',
  payment_in_account_number: '',
  payment_in_card_name: '',
  payment_in_card_number: '',
  payment_in_card_expiry: '',
  payment_in_card_cvv: '',
  legal_member_confirmations: {}
}

const corporateEntityTypes: EntityType[] = ['Incorporated Company', 'Incorporated Partnership']

const normalizeLegalMemberConfirmations = (value: unknown): LegalMemberConfirmations => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const confirmations: LegalMemberConfirmations = {}

  Object.entries(value as Record<string, unknown>).forEach(([memberId, rawConfirmation]) => {
    if (!memberId.trim()) return
    if (rawConfirmation === true) {
      confirmations[memberId] = { confirmed: true }
      return
    }
    if (!rawConfirmation || typeof rawConfirmation !== 'object' || Array.isArray(rawConfirmation)) return
    const confirmation = rawConfirmation as Record<string, unknown>
    if (confirmation.confirmed !== true) return
    confirmations[memberId] = {
      confirmed: true,
      confirmed_at: typeof confirmation.confirmed_at === 'string' ? confirmation.confirmed_at : undefined,
      confirmed_by: typeof confirmation.confirmed_by === 'string' ? confirmation.confirmed_by : undefined
    }
  })

  return confirmations
}

const titleCaseToken = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())

const formatRoleLabel = (role: string) => {
  if (role.startsWith('instrument:')) {
    const [, groupId, instrumentId, variantId] = role.split(':')
    const group = INSTRUMENT_TAXONOMY_3TIER.find(item => item.id === groupId)
    const instrument = group?.instruments.find(item => item.id === instrumentId)
    const variant = variantId ? instrument?.variants?.find(item => item.id === variantId) : undefined

    if (variant) return variant.label
    if (instrument) return instrument.label
    return titleCaseToken(variantId || instrumentId || groupId || role)
  }

  const parts = role.split(':').filter(Boolean)
  return titleCaseToken(parts[parts.length - 1] || role)
}

const formatRoleLabels = (roles?: string[]) =>
  Array.from(new Set((roles ?? []).map(formatRoleLabel).filter(Boolean)))

const EMPTY_LEGAL_MEMBER_DRAFT: LegalMemberDraft = {
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  phoneCountryCode: DEFAULT_COUNTRY_DIAL_CODE,
  phone: '',
  performerIsni: '',
  performerIpn: '',
  creatorIpiCae: '',
  memberSince: '',
  dateLeft: '',
  isPerformer: true,
  isShareholder: true,
  isMainContact: false,
  isCurrentMember: true,
  isAdmin: false,
  rolesText: ''
}

const parseLegalMemberRoles = (rolesText: string) =>
  Array.from(new Set(
    rolesText
      .split(/[\n,;]+/)
      .map(role => role.trim())
      .filter(Boolean)
  ))

const buildLegalMemberDisplayName = (draft: Pick<LegalMemberDraft, 'firstName' | 'lastName' | 'nickname' | 'email'>) =>
  [draft.firstName.trim(), draft.nickname.trim() ? `"${draft.nickname.trim()}"` : '', draft.lastName.trim()]
    .filter(Boolean)
    .join(' ')
    .trim() || draft.email.trim() || 'Unnamed performer'

const createLegalMemberDraft = (member?: LegalMember): LegalMemberDraft => {
  if (!member) return { ...EMPTY_LEGAL_MEMBER_DRAFT }
  const metadata = member.metadata ?? {}

  return {
    firstName: metadata.firstName || '',
    lastName: metadata.lastName || '',
    nickname: metadata.nickname || '',
    email: member.email || '',
    phoneCountryCode: metadata.phoneCountryCode || DEFAULT_COUNTRY_DIAL_CODE,
    phone: metadata.phone || '',
    performerIsni: metadata.performerIsni || '',
    performerIpn: metadata.performerIpn || '',
    creatorIpiCae: metadata.creatorIpiCae || '',
    memberSince: metadata.memberSince || '',
    dateLeft: metadata.dateLeft || '',
    isPerformer: metadata.isPerformer ?? metadata.memberType !== 'support',
    isShareholder: Boolean(metadata.isShareholder),
    isMainContact: Boolean(metadata.isMainContact),
    isCurrentMember: metadata.isCurrentMember !== false,
    isAdmin: Boolean(metadata.isAdmin),
    rolesText: (member.roles || []).join('\n')
  }
}

const applyLegalMemberDraft = (member: LegalMember, draft: LegalMemberDraft): LegalMember => ({
  ...member,
  name: buildLegalMemberDisplayName(draft),
  email: draft.email.trim(),
  roles: parseLegalMemberRoles(draft.rolesText),
  metadata: {
    ...(member.metadata ?? {}),
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    nickname: draft.nickname.trim(),
    phoneCountryCode: draft.phoneCountryCode,
    phone: draft.phone.trim(),
    memberType: 'performer',
    isPerformer: draft.isPerformer,
    performerIsni: draft.performerIsni.trim(),
    performerIpn: draft.performerIpn.trim(),
    creatorIpiCae: draft.creatorIpiCae.trim(),
    isShareholder: draft.isShareholder,
    isMainContact: draft.isMainContact,
    memberSince: draft.memberSince,
    isCurrentMember: draft.isCurrentMember,
    dateLeft: draft.isCurrentMember ? '' : draft.dateLeft,
    isAdmin: draft.isAdmin
  }
})

export function ArtistPaymentsManager() {
  const { user } = useAuth()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(DEFAULT_PAYMENT_DETAILS)
  const [artistStageName, setArtistStageName] = useState('')
  const [legalMembers, setLegalMembers] = useState<LegalMember[]>([])
  const [loading, setLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [officialNoticeOpen, setOfficialNoticeOpen] = useState(true)
  const [paymentFlowsOpen, setPaymentFlowsOpen] = useState(true)
  const [legalEntityErrors, setLegalEntityErrors] = useState<LegalEntityErrors>({})
  const [editingLegalMemberId, setEditingLegalMemberId] = useState<string | null>(null)
  const [legalMemberDrafts, setLegalMemberDrafts] = useState<Record<string, LegalMemberDraft>>({})
  const [newLegalMemberDraft, setNewLegalMemberDraft] = useState<LegalMemberDraft>({ ...EMPTY_LEGAL_MEMBER_DRAFT })
  const [showNewLegalMemberForm, setShowNewLegalMemberForm] = useState(false)
  const [savingLegalMemberId, setSavingLegalMemberId] = useState<string | null>(null)
  const [dbTaxProfile, setDbTaxProfile] = useState<CountryTaxIdRow | null>(null)
  const [loadingTaxProfile, setLoadingTaxProfile] = useState(false)
  const saving = savingSection !== null

  useEffect(() => {
    loadPaymentDetails()
  }, [user])

  // Fetch tax ID data from the database whenever the selected country changes
  useEffect(() => {
    const entityType = paymentDetails.entity_type || ''
    const isCorp = corporateEntityTypes.includes(entityType as EntityType)
    const country = isCorp ? paymentDetails.country_of_incorporation : paymentDetails.country_of_tax_residence

    if (!country?.trim()) {
      setDbTaxProfile(null)
      return
    }

    let cancelled = false
    setLoadingTaxProfile(true)
    fetch(`/api/country-tax-ids?name=${encodeURIComponent(country.trim())}`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (cancelled) return
        setDbTaxProfile(json?.data ?? null)
      })
      .catch(() => { if (!cancelled) setDbTaxProfile(null) })
      .finally(() => { if (!cancelled) setLoadingTaxProfile(false) })

    return () => { cancelled = true }
  }, [paymentDetails.country_of_incorporation, paymentDetails.country_of_tax_residence, paymentDetails.entity_type])

  const loadPaymentDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/artist-payments')
      const result = await response.json()

      if (result.artistProfile?.stage_name) {
        setArtistStageName(result.artistProfile.stage_name)
      }

      setLegalMembers((result.legalMembers ?? []).filter((member: LegalMember) => {
        const metadata = member.metadata ?? {}
        return metadata.memberType !== 'support' || metadata.isPerformer || metadata.isShareholder
      }))

      if (result.data) {
        const data = result.data as Record<string, unknown>
        setPaymentDetails({
          ...DEFAULT_PAYMENT_DETAILS,
          official_ids_acknowledged: (data.official_ids_acknowledged as boolean | null) ?? false,
          payment_flows_acknowledged: (data.payment_flows_acknowledged as boolean | null) ?? false,
          entity_type: (data.entity_type as EntityType | null) ?? '',
          artist_entity_legal_name: (data.artist_entity_legal_name as string | null) ?? '',
          main_contact_first_name: (data.main_contact_first_name as string | null) ?? '',
          main_contact_last_name: (data.main_contact_last_name as string | null) ?? '',
          main_contact_phone_country_code: (data.main_contact_phone_country_code as string | null) ?? DEFAULT_COUNTRY_DIAL_CODE,
          main_contact_phone: (data.main_contact_phone as string | null) ?? '',
          main_contact_email: (data.main_contact_email as string | null) ?? '',
          country_of_incorporation: (data.country_of_incorporation as string | null) ?? '',
          country_of_tax_residence: (data.country_of_tax_residence as string | null) ?? '',
          generic_tax_id: (data.generic_tax_id as string | null) ?? '',
          individual_tax_id: (data.individual_tax_id as string | null) ?? '',
          business_tax_id: (data.business_tax_id as string | null) ?? '',
          partnership_tax_id: (data.partnership_tax_id as string | null) ?? '',
          vat_gst_sst_id: (data.vat_gst_sst_id as string | null) ?? '',
          company_registration_number: (data.company_registration_number as string | null) ?? '',
          company_formation_date: (data.company_formation_date as string | null) ?? '',
          legal_entity_date_of_birth: (data.legal_entity_date_of_birth as string | null) ?? '',
          use_fan_banking: (data.use_fan_banking as boolean | null) ?? DEFAULT_PAYMENT_DETAILS.use_fan_banking,
          payment_out_method: (data.payment_out_method as PaymentMethod | null) ?? DEFAULT_PAYMENT_DETAILS.payment_out_method,
          payment_out_bank_name: (data.payment_out_bank_name as string | null) ?? '',
          payment_out_account_holder: (data.payment_out_account_holder as string | null) ?? '',
          payment_out_sort_code: (data.payment_out_sort_code as string | null) ?? '',
          payment_out_account_number: (data.payment_out_account_number as string | null) ?? '',
          payment_out_card_name: (data.payment_out_card_name as string | null) ?? '',
          payment_out_card_number: (data.payment_out_card_number as string | null) ?? '',
          payment_out_card_expiry: (data.payment_out_card_expiry as string | null) ?? '',
          payment_out_card_cvv: (data.payment_out_card_cvv as string | null) ?? '',
          payment_in_same_as_out: (data.payment_in_same_as_out as boolean | null) ?? DEFAULT_PAYMENT_DETAILS.payment_in_same_as_out,
          payment_in_method: (data.payment_in_method as PaymentMethod | null) ?? DEFAULT_PAYMENT_DETAILS.payment_in_method,
          payment_in_bank_name: (data.payment_in_bank_name as string | null) ?? '',
          payment_in_account_holder: (data.payment_in_account_holder as string | null) ?? '',
          payment_in_sort_code: (data.payment_in_sort_code as string | null) ?? '',
          payment_in_account_number: (data.payment_in_account_number as string | null) ?? '',
          payment_in_card_name: (data.payment_in_card_name as string | null) ?? '',
          payment_in_card_number: (data.payment_in_card_number as string | null) ?? '',
          payment_in_card_expiry: (data.payment_in_card_expiry as string | null) ?? '',
          payment_in_card_cvv: (data.payment_in_card_cvv as string | null) ?? '',
          legal_member_confirmations: normalizeLegalMemberConfirmations(data.legal_member_confirmations)
        })
        setOfficialNoticeOpen(true)
        setPaymentFlowsOpen(true)
      } else {
        setPaymentDetails(DEFAULT_PAYMENT_DETAILS)
        setOfficialNoticeOpen(true)
        setPaymentFlowsOpen(true)
      }
    } catch (error) {
      console.error('Error loading payment details:', error)
      showNotification('error', 'Failed to load Artist Banking details')
    } finally {
      setLoading(false)
    }
  }

  const confirmLegalMember = (memberId: string) => {
    const nextDetails = {
      ...paymentDetails,
      legal_member_confirmations: {
        ...(paymentDetails.legal_member_confirmations ?? {}),
        [memberId]: {
          confirmed: true,
          confirmed_at: new Date().toISOString()
        }
      }
    }

    setPaymentDetails(nextDetails)
    void handleSave('Legal member confirmation', {
      validateLegalEntity: false,
      detailsOverride: nextDetails
    })
  }

  const beginEditLegalMember = (member: LegalMember, override?: Partial<LegalMemberDraft>) => {
    setLegalMemberDrafts(prev => ({
      ...prev,
      [member.id]: {
        ...createLegalMemberDraft(member),
        ...override
      }
    }))
    setEditingLegalMemberId(member.id)
  }

  const updateLegalMemberDraft = (memberId: string, updates: Partial<LegalMemberDraft>) => {
    setLegalMemberDrafts(prev => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || createLegalMemberDraft(legalMembers.find(member => member.id === memberId))),
        ...updates
      }
    }))
  }

  const validateLegalMemberDraft = (draft: LegalMemberDraft, isNew = false) => {
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      return 'Add the member given name and family name.'
    }
    if (!draft.email.trim()) {
      return 'Add the member email address.'
    }
    if (draft.isShareholder && !draft.isPerformer) {
      return 'A shareholder must also be a performer/writer legal member.'
    }
    if (draft.isMainContact && !draft.isShareholder) {
      return 'The main contact must also be marked as a shareholder.'
    }
    if (!draft.isCurrentMember && !draft.dateLeft) {
      return 'Add a date left for a previous legal member.'
    }
    if (isNew && parseLegalMemberRoles(draft.rolesText).length === 0) {
      return 'Add at least one role for the new legal member.'
    }
    return null
  }

  const buildLegalMemberRequestBody = (draft: LegalMemberDraft) => ({
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    nickname: draft.nickname.trim(),
    email: draft.email.trim(),
    phoneCountryCode: draft.phoneCountryCode,
    phone: draft.phone.trim(),
    roles: parseLegalMemberRoles(draft.rolesText),
    memberType: 'performer',
    isPerformer: draft.isPerformer,
    performerIsni: draft.performerIsni.trim(),
    performerIpn: draft.performerIpn.trim(),
    creatorIpiCae: draft.creatorIpiCae.trim(),
    isShareholder: draft.isShareholder,
    isMainContact: draft.isMainContact,
    memberSince: draft.memberSince,
    isCurrentMember: draft.isCurrentMember,
    dateLeft: draft.isCurrentMember ? '' : draft.dateLeft,
    isAdmin: draft.isAdmin
  })

  const saveLegalMemberDraft = async (member: LegalMember) => {
    const draft = legalMemberDrafts[member.id] || createLegalMemberDraft(member)
    const validationError = validateLegalMemberDraft(draft)
    if (validationError) {
      showNotification('error', validationError)
      return
    }

    try {
      setSavingLegalMemberId(member.id)
      const response = await fetch('/api/artist-members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          ...buildLegalMemberRequestBody(draft)
        })
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || result?.error) {
        throw new Error(result?.error || 'Failed to update legal member')
      }

      setLegalMembers(prev => prev.map(existing => {
        const updatedMember = existing.id === member.id
          ? applyLegalMemberDraft({ ...existing, ...(result?.data || {}) }, draft)
          : existing

        if (draft.isMainContact && existing.id !== member.id) {
          return {
            ...updatedMember,
            metadata: {
              ...(updatedMember.metadata ?? {}),
              isMainContact: false
            }
          }
        }

        return updatedMember
      }))
      setEditingLegalMemberId(null)
      showNotification('success', 'Legal member details saved successfully')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('artist-profile-updated', { detail: { source: 'legal-member' } }))
      }
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to update legal member')
    } finally {
      setSavingLegalMemberId(null)
    }
  }

  const addLegalMember = async () => {
    const draft = newLegalMemberDraft
    const validationError = validateLegalMemberDraft(draft, true)
    if (validationError) {
      showNotification('error', validationError)
      return
    }

    try {
      setSavingLegalMemberId('new')
      const response = await fetch('/api/artist-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildLegalMemberRequestBody(draft))
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || result?.error) {
        throw new Error(result?.error || 'Failed to add legal member')
      }

      const newMember: LegalMember = applyLegalMemberDraft({
        id: result?.data?.id || `new-${Date.now()}`,
        invitation_id: result?.data?.id || null,
        name: result?.data?.name || buildLegalMemberDisplayName(draft),
        email: result?.data?.email || draft.email.trim(),
        status: result?.data?.status || 'pending',
        roles: Array.isArray(result?.data?.roles) ? result.data.roles : parseLegalMemberRoles(draft.rolesText),
        metadata: result?.data?.metadata || {}
      }, draft)

      setLegalMembers(prev => [
        ...(draft.isMainContact
          ? prev.map(existing => ({
              ...existing,
              metadata: {
                ...(existing.metadata ?? {}),
                isMainContact: false
              }
            }))
          : prev),
        newMember
      ])
      setNewLegalMemberDraft({ ...EMPTY_LEGAL_MEMBER_DRAFT })
      setShowNewLegalMemberForm(false)
      showNotification('success', result?.warning || 'Legal member added successfully')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('artist-profile-updated', { detail: { source: 'legal-member' } }))
      }
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to add legal member')
    } finally {
      setSavingLegalMemberId(null)
    }
  }

  const handleSave = async (
    sectionLabel = 'Artist Banking details',
    options: { validateLegalEntity?: boolean; detailsOverride?: PaymentDetails } = {}
  ) => {
    try {
      const detailsToSave = options.detailsOverride ?? paymentDetails

      if (options.validateLegalEntity ?? true) {
        const errors = validateLegalEntityDetails(detailsToSave)
        setLegalEntityErrors(errors)

        if (Object.keys(errors).length > 0) {
          const firstError = Object.values(errors)[0] || 'Complete Artist Legal Entity before saving'
          showNotification('error', firstError)
          return
        }
      }

      setSavingSection(sectionLabel)
      const payload = buildPaymentPayload(detailsToSave)
      const response = await fetch('/api/artist-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json().catch(() => null)
      if (!response.ok) {
        const details = result?.details || result?.error || 'Failed to save Artist Banking details'
        throw new Error(details)
      }

      showNotification('success', `${sectionLabel} saved successfully`)
      if (result?.data && typeof result.data === 'object' && 'legal_member_confirmations' in result.data) {
        setPaymentDetails(prev => ({
          ...prev,
          legal_member_confirmations: normalizeLegalMemberConfirmations(result.data.legal_member_confirmations)
        }))
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('artist-profile-updated', { detail: { source: 'payments' } }))
      }
    } catch (error) {
      console.error('Error saving payment details:', error)
      showNotification('error', error instanceof Error ? error.message : 'Failed to save Artist Banking details')
    } finally {
      setSavingSection(null)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true })
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, visible: false } : null)
    }, 3000)
  }

  const updatePaymentDetails = <K extends keyof PaymentDetails>(field: K, value: PaymentDetails[K]) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }))
    setLegalEntityErrors(prev => {
      if (Object.keys(prev).length === 0) return prev
      return validateLegalEntityDetails({ ...paymentDetails, [field]: value })
    })
  }

  const entityType = paymentDetails.entity_type || ''
  const isCorporateEntity = corporateEntityTypes.includes(entityType as EntityType)
  const selectedTaxCountry = isCorporateEntity ? paymentDetails.country_of_incorporation : paymentDetails.country_of_tax_residence

  // DB is the source of truth; static TS file is the fallback when DB hasn't responded yet
  const staticTaxProfile = entityType && selectedTaxCountry ? getArtistTaxIdProfile(selectedTaxCountry) : null
  const selectedTaxProfile = dbTaxProfile
    ? { countryName: dbTaxProfile.country_name, authority: dbTaxProfile.tax_authority ?? 'Local Tax Authority', isUnverifiable: dbTaxProfile.is_unverifiable }
    : staticTaxProfile

  // DB row → correct field list for this entity type; fall back to static TS profile
  const activeTaxFields = dbTaxProfile
    ? buildFieldsFromDbRow(dbTaxProfile, isCorporateEntity)
    : staticTaxProfile
      ? (isCorporateEntity ? staticTaxProfile.corporateFields : staticTaxProfile.individualFields)
      : null
  const currentMembers = legalMembers.filter(member => member.metadata?.isCurrentMember !== false)
  const previousMembers = legalMembers.filter(member => member.metadata?.isCurrentMember === false)
  const confirmedLegalMemberIds = Object.entries(paymentDetails.legal_member_confirmations ?? {})
    .filter(([, confirmation]) => confirmation.confirmed === true)
    .map(([memberId]) => memberId)

  function buildPaymentPayload(details = paymentDetails): PaymentDetails {
    const payload = { ...details }
    const payloadEntityType = details.entity_type || ''
    const payloadIsCorporate = corporateEntityTypes.includes(payloadEntityType as EntityType)

    if (payloadIsCorporate) {
      payload.country_of_tax_residence = ''
      payload.legal_entity_date_of_birth = ''
    } else {
      payload.country_of_incorporation = ''
      payload.company_registration_number = ''
      payload.company_formation_date = ''
    }

    return payload
  }

  function validateLegalEntityDetails(details = paymentDetails): LegalEntityErrors {
    const errors: LegalEntityErrors = {}
    const resolvedEntityType = details.entity_type || ''
    const resolvedIsCorporate = corporateEntityTypes.includes(resolvedEntityType as EntityType)
    const country = resolvedIsCorporate ? details.country_of_incorporation : details.country_of_tax_residence
    // Use DB data if available, fall back to static TS profile
    const entityFields = dbTaxProfile
      ? buildFieldsFromDbRow(dbTaxProfile, resolvedIsCorporate)
      : (() => {
          const countryProfile = country ? getArtistTaxIdProfile(country) : null
          return countryProfile ? (resolvedIsCorporate ? countryProfile.corporateFields : countryProfile.individualFields) : null
        })()
    const visibleTaxIdKeys = entityFields?.map(field => field.key) ?? ARTIST_TAX_ID_FIELD_KEYS
    const hasVisibleTaxId = visibleTaxIdKeys.some(key => details[key as keyof typeof details]?.toString().trim())

    if (!resolvedEntityType) {
      errors.entity_type = 'Select an entity type'
    }

    if (!details.artist_entity_legal_name?.trim()) {
      errors.artist_entity_legal_name = 'Enter the Artist Entity Legal Name'
    }

    if (
      !details.main_contact_first_name?.trim() ||
      !details.main_contact_last_name?.trim() ||
      !details.main_contact_phone?.trim() ||
      !details.main_contact_email?.trim()
    ) {
      errors.main_contact = 'Complete the main contact name, phone, and email'
    }

    if (!country?.trim()) {
      errors.country = resolvedIsCorporate ? 'Select the country of incorporation' : 'Select the country of tax residence'
    }

    if (!hasVisibleTaxId) {
      errors.tax_ids = 'Provide at least one valid ID number'
    }

    if (resolvedEntityType) {
      if (resolvedIsCorporate && !details.company_formation_date?.trim()) {
        errors.company_formation_date = 'Enter the company formation date'
      }

      if (!resolvedIsCorporate && !details.legal_entity_date_of_birth?.trim()) {
        errors.legal_entity_date_of_birth = 'Enter your date of birth'
      }
    }

    return errors
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading Artist Banking details...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300",
            notification.visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
            notification.type === 'success' ? "bg-green-500" : "bg-red-500"
          )}
        >
          <div className="flex items-center space-x-2 text-white">
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <Card id="artist-payments-preference" className="scroll-mt-28 border-emerald-200 bg-emerald-50/40">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-emerald-950">
            <Badge className="bg-emerald-600 text-white border-emerald-700">Step 1</Badge>
            Use Fan Banking Details?
          </CardTitle>
          <p className="text-sm text-emerald-900">
            Choose this first. If you use your Fan Profile banking details, Artist Money In and Money Out forms stay hidden.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={paymentDetails.use_fan_banking ? 'same' : 'different'} onValueChange={(value) => updatePaymentDetails('use_fan_banking', value === 'same')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="same" id="same-banking" />
              <Label htmlFor="same-banking" className="font-normal cursor-pointer">Use the same Banking Details as Fan Profile for Artist Profile</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="different" id="different-banking" />
              <Label htmlFor="different-banking" className="font-normal cursor-pointer">Use different Banking Details for Artist Profile</Label>
            </div>
          </RadioGroup>
          {paymentDetails.use_fan_banking && (
            <div className="rounded-lg border border-emerald-200 bg-white p-3 text-sm text-emerald-900">
              Money In and Money Out are hidden because this Artist Profile will use your Fan Profile banking details.
            </div>
          )}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => handleSave('Banking preference', { validateLegalEntity: false })}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {savingSection === 'Banking preference' ? 'Saving...' : 'Save Step 1'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card id="artist-banking-official-ids" className="scroll-mt-28 border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-3 text-amber-950">
            <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Official ID Numbers</span>
            {paymentDetails.official_ids_acknowledged && (
              <Button variant="outline" size="sm" onClick={() => setOfficialNoticeOpen(prev => !prev)}>
                {officialNoticeOpen ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                {officialNoticeOpen ? 'Hide' : 'Review'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        {officialNoticeOpen && (
          <CardContent className="space-y-4 text-sm text-amber-950">
            <p>Gigrilla must keep and report on all financial transactions in-and-out of Gigrilla. You have to provide Official ID Numbers.</p>
            <p>If your Artist Entity is incorporated as a business, you’ll provide business details; otherwise you provide personal details.</p>
            <p>You won’t be eligible for any payouts from Gigrilla until you complete your Legal Entity & Legal Members sections below.</p>
            <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-white p-3 font-semibold">
              <Checkbox
                checked={Boolean(paymentDetails.official_ids_acknowledged)}
                onCheckedChange={(checked) => updatePaymentDetails('official_ids_acknowledged', checked === true)}
              />
              <span>I confirm that I have read and understood the Official ID Numbers notification.</span>
            </label>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => handleSave('Official ID acknowledgement', { validateLegalEntity: false })}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {savingSection === 'Official ID acknowledgement' ? 'Saving...' : 'Save Official ID Section'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card id="artist-banking-payment-flows" className="scroll-mt-28 border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-3 text-blue-950">
            <span className="flex items-center gap-2"><WalletCards className="w-5 h-5" /> Payment Flows</span>
            {paymentDetails.payment_flows_acknowledged && (
              <Button variant="outline" size="sm" onClick={() => setPaymentFlowsOpen(prev => !prev)}>
                {paymentFlowsOpen ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                {paymentFlowsOpen ? 'Hide' : 'Review'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        {paymentFlowsOpen && (
          <CardContent className="space-y-4 text-sm text-blue-950">
            <ul className="space-y-2 list-disc pl-5">
              <li>When you do paid Gigs, we pay all Gig Fees earned into your nominated Artist account. You then distribute accordingly.</li>
              <li>We pay your Aggregator all Master Royalties earned if your music is imported by them. They will distribute accordingly.</li>
              <li>If you upload music, we pay your nominated Artist account all Master Royalties earned. You then distribute accordingly.</li>
              <li>For all Mechanic/Performance Royalties we pay the Societies associated with the music. They will distribute accordingly.</li>
              <li>We take payments from your nominated Artist account for payment to other Members. This can be a separate account.</li>
            </ul>
            <label className="flex items-start gap-3 rounded-lg border border-blue-200 bg-white p-3 font-semibold">
              <Checkbox
                checked={Boolean(paymentDetails.payment_flows_acknowledged)}
                onCheckedChange={(checked) => updatePaymentDetails('payment_flows_acknowledged', checked === true)}
              />
              <span>I confirm that I have read and understood the Payment Flows notification.</span>
            </label>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => handleSave('Payment flows acknowledgement', { validateLegalEntity: false })}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {savingSection === 'Payment flows acknowledgement' ? 'Saving...' : 'Save Payment Flows'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card id="artist-payments-legal-entity" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-purple-900">
            <Landmark className="w-5 h-5" />
            Artist Legal Entity
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">NEW</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">This is the legal payee Gigrilla uses for compliance, payouts, and payment reporting.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 rounded-xl border border-purple-100 bg-purple-50/40 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-purple-100 text-purple-900 border-purple-200">Step One</Badge>
              <h3 className="font-semibold text-purple-950">Entity details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Artist Stage Name</Label>
                <Input value={artistStageName || 'Not set yet'} readOnly className="bg-gray-100" />
                <p className="text-xs text-gray-500">Carried over from Artist Basics.</p>
              </div>
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select value={paymentDetails.entity_type || ''} onValueChange={(value) => updatePaymentDetails('entity_type', value as EntityType)}>
                  <SelectTrigger className={legalEntityErrors.entity_type ? 'border-red-400' : undefined}><SelectValue placeholder="Select entity type" /></SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
                {legalEntityErrors.entity_type && <p className="text-xs text-red-600">{legalEntityErrors.entity_type}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Artist Entity Legal Name (Payee)</Label>
              <Input
                value={paymentDetails.artist_entity_legal_name}
                onChange={(event) => updatePaymentDetails('artist_entity_legal_name', event.target.value)}
                placeholder="Your business entity name, your legal name, or your Artist name"
                className={legalEntityErrors.artist_entity_legal_name ? 'border-red-400' : undefined}
              />
              {legalEntityErrors.artist_entity_legal_name && <p className="text-xs text-red-600">{legalEntityErrors.artist_entity_legal_name}</p>}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-purple-950">Main Contact (compliance/payments)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input value={paymentDetails.main_contact_first_name} onChange={(event) => updatePaymentDetails('main_contact_first_name', event.target.value)} placeholder="First/Given Name" className={legalEntityErrors.main_contact ? 'border-red-400' : undefined} />
                <Input value={paymentDetails.main_contact_last_name} onChange={(event) => updatePaymentDetails('main_contact_last_name', event.target.value)} placeholder="Last/Family Name" className={legalEntityErrors.main_contact ? 'border-red-400' : undefined} />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(150px,220px)_1fr] md:col-span-1">
                  <Select
                    value={getDialCodeChoiceValue(paymentDetails.main_contact_phone_country_code)}
                    onValueChange={(value) => updatePaymentDetails('main_contact_phone_country_code', getDialCodeFromChoiceValue(value))}
                  >
                    <SelectTrigger><SelectValue placeholder="Code" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {COUNTRY_DIAL_CODE_CHOICES.map(choice => <SelectItem key={choice.value} value={choice.value}>{choice.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={paymentDetails.main_contact_phone} onChange={(event) => updatePaymentDetails('main_contact_phone', event.target.value)} placeholder="Contact Phone" className={legalEntityErrors.main_contact ? 'border-red-400' : undefined} />
                </div>
                <Input value={paymentDetails.main_contact_email} onChange={(event) => updatePaymentDetails('main_contact_email', event.target.value)} placeholder="Contact Email" className={legalEntityErrors.main_contact ? 'border-red-400' : undefined} />
              </div>
              {legalEntityErrors.main_contact && <p className="text-xs text-red-600">{legalEntityErrors.main_contact}</p>}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-gray-100 text-gray-900 border-gray-200">Step Two</Badge>
              <h3 className="font-semibold text-gray-950">
                {entityType
                  ? isCorporateEntity
                    ? 'Corporate Taxpayer ID Number (business)'
                    : 'Income Taxpayer ID Number (individual)'
                  : 'Taxpayer ID Number'}
              </h3>
            </div>
            {!entityType ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">Select an Entity Type in Step One to show the correct tax ID section.</p>
            ) : (
              <>
              <div className="space-y-2">
                <Label>{isCorporateEntity ? 'Country of Incorporation' : 'Country of Tax Residence'}</Label>
                <Select
                  value={isCorporateEntity ? paymentDetails.country_of_incorporation : paymentDetails.country_of_tax_residence}
                  onValueChange={(value) => updatePaymentDetails(isCorporateEntity ? 'country_of_incorporation' : 'country_of_tax_residence', value)}
                >
                  <SelectTrigger className={legalEntityErrors.country ? 'border-red-400' : undefined}><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {COUNTRY_OPTIONS.map(country => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                  </SelectContent>
                </Select>
                {legalEntityErrors.country && <p className="text-xs text-red-600">{legalEntityErrors.country}</p>}
              </div>

              {loadingTaxProfile && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Loading tax ID requirements…
                </div>
              )}

              {!loadingTaxProfile && selectedTaxProfile && activeTaxFields && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-sm font-semibold text-gray-950">{selectedTaxProfile.countryName} — {selectedTaxProfile.authority}</p>
                    {selectedTaxProfile.isUnverifiable ? (
                      <p className="text-xs text-amber-600 mt-1">Official tax IDs for this country are unverifiable. Enter your ID details below if known.</p>
                    ) : (
                      <p className="text-xs text-gray-500">Provide at least one valid ID Number.</p>
                    )}
                  </div>
                  {activeTaxFields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTaxFields.map(field => (
                        <TaxIdInput
                          key={field.key}
                          field={field}
                          value={paymentDetails[field.key as keyof PaymentDetails] as string | undefined}
                          error={legalEntityErrors.tax_ids}
                          onChange={(value) => updatePaymentDetails(field.key as keyof PaymentDetails, value)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No specific tax ID fields defined for this country and entity type.</p>
                  )}
                  {legalEntityErrors.tax_ids && <p className="text-xs text-red-600">{legalEntityErrors.tax_ids}</p>}
                </div>
              )}

              {isCorporateEntity ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label>Company Registration Number (if issued)</Label>
                    <Input value={paymentDetails.company_registration_number} onChange={(event) => updatePaymentDetails('company_registration_number', event.target.value)} placeholder="Your Artist Company ID" />
                  </div>
	                  <div className="space-y-2">
	                    <Label>Company Formation Date</Label>
	                    <Input type="date" value={paymentDetails.company_formation_date} onChange={(event) => updatePaymentDetails('company_formation_date', event.target.value)} className={legalEntityErrors.company_formation_date ? 'border-red-400' : undefined} />
	                    {legalEntityErrors.company_formation_date && <p className="text-xs text-red-600">{legalEntityErrors.company_formation_date}</p>}
	                  </div>
                </div>
              ) : (
	                <div className="space-y-2 pt-2">
	                  <Label>Your Date of Birth</Label>
	                  <Input type="date" value={paymentDetails.legal_entity_date_of_birth} onChange={(event) => updatePaymentDetails('legal_entity_date_of_birth', event.target.value)} className={legalEntityErrors.legal_entity_date_of_birth ? 'border-red-400' : undefined} />
	                  {legalEntityErrors.legal_entity_date_of_birth && <p className="text-xs text-red-600">{legalEntityErrors.legal_entity_date_of_birth}</p>}
	                </div>
              )}
              </>
            )}
            <div className="flex justify-end border-t border-purple-100 pt-4">
              <Button
                type="button"
                onClick={() => handleSave('Legal entity')}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {savingSection === 'Legal entity' ? 'Saving...' : 'Save Legal Entity'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="artist-payments-legal-members" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Users2 className="w-5 h-5" /> Artist Legal Members
            <Badge className="ml-1 bg-yellow-400 text-yellow-900 border-yellow-500 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5">NEW</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">Gives us accurate audit-proof accounting &amp; ensures we don&apos;t pay the wrong people Royalties. Twinned with Artist Crew &gt; Performers.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <LegalMemberSection
            title="Current Artist Members & IDs"
            members={currentMembers}
            emptyText="No current performer members have been added yet."
            confirmedMemberIds={confirmedLegalMemberIds}
            onConfirmMember={confirmLegalMember}
            editingMemberId={editingLegalMemberId}
            memberDrafts={legalMemberDrafts}
            savingMemberId={savingLegalMemberId}
            onBeginEditMember={beginEditLegalMember}
            onCancelEditMember={() => setEditingLegalMemberId(null)}
            onDraftChange={updateLegalMemberDraft}
            onSaveDraft={saveLegalMemberDraft}
            footer={
              <div className="space-y-4 border-t border-gray-100 pt-4 mt-2">
                {showNewLegalMemberForm && (
                  <LegalMemberInlineForm
                    title="Add New Artist Shareholder"
                    draft={newLegalMemberDraft}
                    onChange={(updates) => setNewLegalMemberDraft(prev => ({ ...prev, ...updates }))}
                    onSave={addLegalMember}
                    onCancel={() => {
                      setShowNewLegalMemberForm(false)
                      setNewLegalMemberDraft({ ...EMPTY_LEGAL_MEMBER_DRAFT })
                    }}
                    saving={savingLegalMemberId === 'new'}
                    saveLabel="Save & Invite Legal Member"
                  />
                )}
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => setShowNewLegalMemberForm(prev => !prev)}>
                    <UserPlus className="w-4 h-4" />
                    {showNewLegalMemberForm ? 'Hide New Shareholder Form' : 'Add a New Artist Shareholder'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleSave('Legal members', { validateLegalEntity: false })}
                    disabled={saving}
                  >
                    {savingSection === 'Legal members' ? 'Saving...' : 'Save Legal Members'}
                  </Button>
                </div>
              </div>
            }
          />
          <LegalMemberSection
            title="Previous Artist Members & IDs"
            members={previousMembers}
            emptyText="No previous performer members have been recorded yet."
            previous
            confirmedMemberIds={confirmedLegalMemberIds}
            onConfirmMember={confirmLegalMember}
            editingMemberId={editingLegalMemberId}
            memberDrafts={legalMemberDrafts}
            savingMemberId={savingLegalMemberId}
            onBeginEditMember={beginEditLegalMember}
            onCancelEditMember={() => setEditingLegalMemberId(null)}
            onDraftChange={updateLegalMemberDraft}
            onSaveDraft={saveLegalMemberDraft}
            footer={
              <div className="border-t border-gray-100 pt-4 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={previousMembers.length === 0}
                  onClick={() => {
                    const previousMember = previousMembers[0]
                    if (previousMember) beginEditLegalMember(previousMember, { isCurrentMember: true, dateLeft: '' })
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  {previousMembers.length === 0 ? 'No Previous Shareholders to Reinstate' : 'Reinstate Shareholder'}
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      {!paymentDetails.use_fan_banking && (
        <>
          <BankingSection
            id="artist-payments-in"
            title="Money In"
            description="Banking details to receive gig fees, uploaded-master royalties, and other Gigrilla payouts."
            icon={<ArrowDownCircle className="w-5 h-5" />}
            method={paymentDetails.payment_in_method || 'direct_debit'}
            onMethodChange={(value) => updatePaymentDetails('payment_in_method', value)}
            sameAsOut={paymentDetails.payment_in_same_as_out}
            onSameAsOutChange={(value) => updatePaymentDetails('payment_in_same_as_out', value)}
            fields={{
              bankName: paymentDetails.payment_in_bank_name || '',
              accountHolder: paymentDetails.payment_in_account_holder || '',
              sortCode: paymentDetails.payment_in_sort_code || '',
              accountNumber: paymentDetails.payment_in_account_number || '',
              cardName: paymentDetails.payment_in_card_name || '',
              cardNumber: paymentDetails.payment_in_card_number || '',
              cardExpiry: paymentDetails.payment_in_card_expiry || '',
              cardCvv: paymentDetails.payment_in_card_cvv || ''
            }}
            onFieldChange={(field, value) => updatePaymentDetails(`payment_in_${field}` as keyof PaymentDetails, value as never)}
            onSave={() => handleSave('Money In', { validateLegalEntity: false })}
            saving={savingSection === 'Money In'}
          />
          <BankingSection
            id="artist-payments-out"
            title="Money Out"
            description="Banking details for payments from your nominated Artist account to other Members or suppliers."
            icon={<ArrowUpCircle className="w-5 h-5" />}
            method={paymentDetails.payment_out_method || 'direct_debit'}
            onMethodChange={(value) => updatePaymentDetails('payment_out_method', value)}
            fields={{
              bankName: paymentDetails.payment_out_bank_name || '',
              accountHolder: paymentDetails.payment_out_account_holder || '',
              sortCode: paymentDetails.payment_out_sort_code || '',
              accountNumber: paymentDetails.payment_out_account_number || '',
              cardName: paymentDetails.payment_out_card_name || '',
              cardNumber: paymentDetails.payment_out_card_number || '',
              cardExpiry: paymentDetails.payment_out_card_expiry || '',
              cardCvv: paymentDetails.payment_out_card_cvv || ''
            }}
            onFieldChange={(field, value) => updatePaymentDetails(`payment_out_${field}` as keyof PaymentDetails, value as never)}
            onSave={() => handleSave('Money Out', { validateLegalEntity: false })}
            saving={savingSection === 'Money Out'}
          />
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={() => handleSave()} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
          {savingSection === 'Artist Banking details' ? 'Saving...' : 'Save All Artist Banking Details'}
        </Button>
      </div>
    </div>
  )
}

function TaxIdInput({
  field,
  value,
  error,
  onChange
}: {
  field: ArtistTaxIdField
  value?: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{field.label} ({field.localName})</Label>
      <Input
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter ID#..."
        className={error ? 'border-red-400' : undefined}
      />
      <p className="text-xs text-gray-500">Example format: {field.example}</p>
    </div>
  )
}

// Support roles come from the management categories in ROLE_CATEGORIES (management-independent + management-label)
const SUPPORT_ROLE_STRINGS = new Set([
  'All Management - Independent', 'Artist Manager', 'Booking Agent',
  'Finance & Accounts Manager', 'Marketing Manager', 'Personal Assistant', 'Tour Manager',
  'All Management - Label-based', 'A&R (Artists & Repertoire) Representative - Label',
  'Artist Manager - Label', 'Brand Manager - Label', 'Business Manager - Label',
  'Distribution Manager - Label', 'Label Manager - Label', 'Music Publicist - Label',
  'Personal Assistant - Label', 'Radio Plugger / Promoter - Label',
  'Social Media Manager - Label', 'Sync & Licensing Agent - Label',
  'Talent Agent - Label', 'Tour Manager - Label', 'Tour Support Staff - Label',
])

function splitRoles(roles?: string[]) {
  const all = roles ?? []
  const performer = all.filter(r => !SUPPORT_ROLE_STRINGS.has(r))
  const support = all.filter(r => SUPPORT_ROLE_STRINGS.has(r))
  return { performer, support }
}

function RoleChips({ roles, empty = 'None' }: { roles: string[]; empty?: string }) {
  const labels = formatRoleLabels(roles)
  return labels.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {labels.map(role => (
        <Badge key={role} variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">{role}</Badge>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-400">{empty}</p>
  )
}

function LegalMemberInlineForm({
  title,
  draft,
  onChange,
  onSave,
  onCancel,
  saving,
  saveLabel
}: {
  title: string
  draft: LegalMemberDraft
  onChange: (updates: Partial<LegalMemberDraft>) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  saveLabel: string
}) {
  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-purple-950">{title}</h4>
        <Badge variant="outline" className="border-purple-200 bg-white text-purple-800">Inline Legal Member Details</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Given Name</Label>
          <Input value={draft.firstName} onChange={(event) => onChange({ firstName: event.target.value })} placeholder="First/Given Name" />
        </div>
        <div className="space-y-2">
          <Label>Family Name</Label>
          <Input value={draft.lastName} onChange={(event) => onChange({ lastName: event.target.value })} placeholder="Last/Family Name" />
        </div>
        <div className="space-y-2">
          <Label>Nickname / Stage Name</Label>
          <Input value={draft.nickname} onChange={(event) => onChange({ nickname: event.target.value })} placeholder="Optional" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={draft.email} onChange={(event) => onChange({ email: event.target.value })} placeholder="member@example.com" />
        </div>
        <div className="space-y-2">
          <Label>Phone Country Code</Label>
          <Select value={getDialCodeChoiceValue(draft.phoneCountryCode)} onValueChange={(value) => onChange({ phoneCountryCode: getDialCodeFromChoiceValue(value) })}>
            <SelectTrigger><SelectValue placeholder="Country Code" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {COUNTRY_DIAL_CODE_CHOICES.map(choice => <SelectItem key={`legal-member-phone-${choice.value}`} value={choice.value}>{choice.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={draft.phone} onChange={(event) => onChange({ phone: event.target.value })} placeholder="Phone number" />
        </div>
        <div className="space-y-2">
          <Label>Individual ISNI</Label>
          <Input value={draft.performerIsni} onChange={(event) => onChange({ performerIsni: event.target.value })} placeholder="0000000000000000" />
        </div>
        <div className="space-y-2">
          <Label>Performer IPN</Label>
          <Input value={draft.performerIpn} onChange={(event) => onChange({ performerIpn: event.target.value })} placeholder="Performer IPN" />
        </div>
        <div className="space-y-2">
          <Label>Writer IPI</Label>
          <Input value={draft.creatorIpiCae} onChange={(event) => onChange({ creatorIpiCae: event.target.value })} placeholder="Writer IPI/CAE" />
        </div>
        <div className="space-y-2">
          <Label>Member Since</Label>
          <Input type="month" value={draft.memberSince} onChange={(event) => onChange({ memberSince: event.target.value })} />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label>Roles</Label>
        <textarea
          value={draft.rolesText}
          onChange={(event) => onChange({ rolesText: event.target.value })}
          placeholder="Enter one or more roles, separated by commas or new lines"
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm">
          <Checkbox
            checked={draft.isPerformer}
            onCheckedChange={(checked) => onChange({
              isPerformer: checked === true,
              isShareholder: checked === true ? draft.isShareholder : false,
              isMainContact: checked === true ? draft.isMainContact : false
            })}
          />
          Performer / Writer
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm">
          <Checkbox
            checked={draft.isShareholder}
            onCheckedChange={(checked) => onChange({
              isShareholder: checked === true,
              isPerformer: checked === true ? true : draft.isPerformer,
              isMainContact: checked === true ? draft.isMainContact : false
            })}
          />
          Shareholder
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm">
          <Checkbox
            checked={draft.isMainContact}
            onCheckedChange={(checked) => onChange({
              isMainContact: checked === true,
              isShareholder: checked === true ? true : draft.isShareholder,
              isPerformer: checked === true ? true : draft.isPerformer
            })}
          />
          Main Contact
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm">
          <Checkbox checked={draft.isAdmin} onCheckedChange={(checked) => onChange({ isAdmin: checked === true })} />
          Admin
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm">
          <Checkbox checked={draft.isCurrentMember} onCheckedChange={(checked) => onChange({ isCurrentMember: checked === true, dateLeft: checked === true ? '' : draft.dateLeft })} />
          Current Member
        </label>
      </div>

      {!draft.isCurrentMember && (
        <div className="mt-4 max-w-xs space-y-2">
          <Label>Date Left</Label>
          <Input type="date" value={draft.dateLeft} onChange={(event) => onChange({ dateLeft: event.target.value })} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-purple-100 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="button" onClick={onSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
          {saving ? 'Saving...' : saveLabel}
        </Button>
      </div>
    </div>
  )
}

function LegalMemberSection({
  title,
  members,
  emptyText,
  previous = false,
  footer,
  confirmedMemberIds = [],
  onConfirmMember,
  editingMemberId = null,
  memberDrafts = {},
  savingMemberId = null,
  onBeginEditMember,
  onCancelEditMember,
  onDraftChange,
  onSaveDraft
}: {
  title: string
  members: LegalMember[]
  emptyText: string
  previous?: boolean
  footer?: React.ReactNode
  confirmedMemberIds?: string[]
  onConfirmMember?: (memberId: string) => void
  editingMemberId?: string | null
  memberDrafts?: Record<string, LegalMemberDraft>
  savingMemberId?: string | null
  onBeginEditMember?: (member: LegalMember) => void
  onCancelEditMember?: () => void
  onDraftChange?: (memberId: string, updates: Partial<LegalMemberDraft>) => void
  onSaveDraft?: (member: LegalMember) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-950">{title}</h3>
        <Badge variant="outline" className="border-gray-200 bg-white text-gray-600">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </Badge>
      </div>
      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-4 text-sm text-gray-500">{emptyText}</div>
      ) : (
        <div className="space-y-3">
          {members.map(member => {
            const metadata = member.metadata ?? {}
            const displayName = [metadata.firstName, metadata.nickname ? `"${metadata.nickname}"` : '', metadata.lastName].filter(Boolean).join(' ') || member.name || member.email || 'Unnamed performer'
            const { performer: performerRoles, support: supportRoles } = splitRoles(member.roles)
            const isConfirmed = confirmedMemberIds.includes(member.id)
            const isEditing = editingMemberId === member.id
            const draft = memberDrafts[member.id] || createLegalMemberDraft(member)
            return (
              <div key={member.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                {/* Header: name + status badges */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-gray-950">{displayName}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={previous ? 'border-gray-200 bg-gray-100 text-gray-700' : 'border-teal-200 bg-teal-100 text-teal-800'}>{previous ? 'Previous' : 'Current'}</Badge>
                    {member.status && member.status !== 'active' && (
                      <Badge className="border-amber-200 bg-amber-50 text-amber-800">{formatRoleLabel(member.status)} Invite</Badge>
                    )}
                    {metadata.isPerformer && <Badge className="border-purple-200 bg-purple-50 text-purple-800">Performer</Badge>}
                    {metadata.memberType === 'support' && <Badge className="border-blue-200 bg-blue-50 text-blue-800">Support Crew</Badge>}
                    {metadata.isShareholder && <Badge className="border-green-200 bg-green-50 text-green-800">Shareholder</Badge>}
                    {metadata.isMainContact && <Badge className="border-blue-200 bg-blue-50 text-blue-800">Main Contact</Badge>}
                    {metadata.isAdmin && <Badge className="border-purple-200 bg-purple-50 text-purple-800">Admin</Badge>}
                    {isConfirmed && <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">Confirmed in Banking</Badge>}
                  </div>
                </div>

                {/* Registration IDs + dates */}
                <div className="mt-4 grid grid-cols-1 overflow-hidden rounded-lg border border-gray-200 sm:grid-cols-2 lg:grid-cols-5">
                  <MemberFact label="Individual ISNI" value={metadata.performerIsni} />
                  <MemberFact label="Performer IPN" value={metadata.performerIpn} />
                  <MemberFact label="Writer IPI" value={metadata.creatorIpiCae} />
                  <MemberFact label="Member Since" value={metadata.memberSince} />
                  <MemberFact label="Date Left" value={metadata.dateLeft} />
                </div>

                {/* Performer Roles + Support Roles (separate rows) */}
                <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Performer Roles</p>
                    <RoleChips roles={performerRoles} empty="No performer roles assigned" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Support Roles</p>
                    <RoleChips roles={supportRoles} empty="No support roles assigned" />
                  </div>
                  {isEditing && onDraftChange && onSaveDraft && onCancelEditMember ? (
                    <LegalMemberInlineForm
                      title={`Review / Update ${displayName}`}
                      draft={draft}
                      onChange={(updates) => onDraftChange(member.id, updates)}
                      onSave={() => onSaveDraft(member)}
                      onCancel={onCancelEditMember}
                      saving={savingMemberId === member.id}
                      saveLabel="Save Legal Member Details"
                    />
                  ) : (
                    <>
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-sm text-emerald-950">
                        Review this member’s shareholder, main contact, role, and ID details here. Update details inline or confirm them for Artist Banking.
                      </div>
                      <div className="flex flex-wrap justify-end gap-2 pt-1">
                        {onBeginEditMember && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onBeginEditMember(member)}
                          >
                            Update Details
                          </Button>
                        )}
                        {onConfirmMember && (
                          <Button
                            type="button"
                            variant={isConfirmed ? 'outline' : 'default'}
                            size="sm"
                            className={isConfirmed ? 'border-emerald-200 bg-white text-emerald-800' : 'bg-emerald-600 text-white hover:bg-emerald-700'}
                            onClick={() => onConfirmMember(member.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            {isConfirmed ? 'Confirmed' : previous ? 'Confirm Previous Details' : 'Confirm Details'}
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {footer}
    </div>
  )
}

function MemberFact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-r border-gray-200 bg-gray-50/70 p-3 last:border-r-0 sm:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-gray-950" title={value || 'Not set'}>{value || 'Not set'}</p>
    </div>
  )
}

function BankingSection({
  id,
  title,
  description,
  icon,
  method,
  onMethodChange,
  fields,
  onFieldChange,
  sameAsOut,
  onSameAsOutChange,
  onSave,
  saving = false
}: {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  method: PaymentMethod
  onMethodChange: (value: PaymentMethod) => void
  fields: Record<string, string>
  onFieldChange: (field: string, value: string) => void
  sameAsOut?: boolean
  onSameAsOutChange?: (value: boolean) => void
  onSave?: () => void
  saving?: boolean
}) {
  const isDisabled = sameAsOut === true
  return (
    <Card id={id} className="scroll-mt-28">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">{icon}{title}</CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {onSameAsOutChange && (
          <RadioGroup value={sameAsOut ? 'same' : 'different'} onValueChange={(value) => onSameAsOutChange(value === 'same')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="same" id="money-in-same" />
              <Label htmlFor="money-in-same" className="font-normal cursor-pointer">Same as Money Out</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="different" id="money-in-different" />
              <Label htmlFor="money-in-different" className="font-normal cursor-pointer">Different to Money Out</Label>
            </div>
          </RadioGroup>
        )}

        {!isDisabled && (
          <>
            <RadioGroup value={method} onValueChange={(value: PaymentMethod) => onMethodChange(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct_debit" id={`${id}-direct-debit`} />
                <Label htmlFor={`${id}-direct-debit`} className="font-normal cursor-pointer flex items-center"><Building2 className="w-4 h-4 mr-2" /> Use Direct Debit Transfers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id={`${id}-card`} />
                <Label htmlFor={`${id}-card`} className="font-normal cursor-pointer flex items-center"><CreditCard className="w-4 h-4 mr-2" /> Use Bank Card</Label>
              </div>
            </RadioGroup>

            {method === 'direct_debit' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <BankField label="Bank Name" value={fields.bankName} onChange={(value) => onFieldChange('bank_name', value)} />
                <BankField label="Name of Account Holder" value={fields.accountHolder} onChange={(value) => onFieldChange('account_holder', value)} />
                <BankField label="Sort Code" value={fields.sortCode} onChange={(value) => onFieldChange('sort_code', value)} placeholder="00-00-00" />
                <BankField label="Bank Account Number" value={fields.accountNumber} onChange={(value) => onFieldChange('account_number', value)} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <BankField label="Name On Card" value={fields.cardName} onChange={(value) => onFieldChange('card_name', value)} className="md:col-span-2" />
                <BankField label="Long Card Number" value={fields.cardNumber} onChange={(value) => onFieldChange('card_number', value)} placeholder="0000 0000 0000 0000" className="md:col-span-2" />
                <BankField label="Expiry Date" value={fields.cardExpiry} onChange={(value) => onFieldChange('card_expiry', value)} placeholder="MM/YY" />
                <BankField label="Security Code" value={fields.cardCvv} onChange={(value) => onFieldChange('card_cvv', value)} placeholder="CVV" />
              </div>
            )}
          </>
        )}
        {onSave && (
          <div className="flex justify-end border-t border-gray-100 pt-4">
            <Button type="button" onClick={onSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
              {saving ? `Saving ${title}...` : `Save ${title}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BankField({ label, value, onChange, placeholder, className }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder || label} />
    </div>
  )
}
