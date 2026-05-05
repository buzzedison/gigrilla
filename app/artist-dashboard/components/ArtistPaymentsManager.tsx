"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Checkbox } from '../../components/ui/checkbox'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useAuth } from '../../../lib/auth-context'
import { CreditCard, Building2, CheckCircle, X, ShieldCheck, Users2, WalletCards, ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronUp, Landmark } from 'lucide-react'
import { COUNTRY_DIAL_CODE_CHOICES, DEFAULT_COUNTRY_DIAL_CODE, getDialCodeChoiceValue, getDialCodeFromChoiceValue } from '../../../lib/country-dial-codes'
import { cn } from '../../../lib/utils'

const COUNTRY_OPTIONS = Array.from(new Set(COUNTRY_DIAL_CODE_CHOICES.map(choice => choice.country))).sort((a, b) => a.localeCompare(b))

const ENTITY_TYPES = [
  'Incorporated Company',
  'Incorporated Partnership',
  'Sole Trader',
  'Partnership'
] as const

type EntityType = typeof ENTITY_TYPES[number]

type PaymentMethod = 'direct_debit' | 'card'

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
}

interface LegalMember {
  id: string
  name?: string
  email?: string
  roles?: string[]
  metadata?: {
    firstName?: string
    lastName?: string
    nickname?: string
    memberType?: 'performer' | 'support'
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

interface Notification {
  type: 'success' | 'error'
  message: string
  visible: boolean
}

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
  payment_in_card_cvv: ''
}

const corporateEntityTypes: EntityType[] = ['Incorporated Company', 'Incorporated Partnership']

export function ArtistPaymentsManager() {
  const { user } = useAuth()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(DEFAULT_PAYMENT_DETAILS)
  const [artistStageName, setArtistStageName] = useState('')
  const [legalMembers, setLegalMembers] = useState<LegalMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [officialNoticeOpen, setOfficialNoticeOpen] = useState(true)
  const [paymentFlowsOpen, setPaymentFlowsOpen] = useState(true)

  useEffect(() => {
    loadPaymentDetails()
  }, [user])

  const loadPaymentDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/artist-payments')
      const result = await response.json()

      if (result.artistProfile?.stage_name) {
        setArtistStageName(result.artistProfile.stage_name)
      }

      setLegalMembers((result.legalMembers ?? []).filter((member: LegalMember) => member.metadata?.memberType !== 'support'))

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
          payment_in_card_cvv: (data.payment_in_card_cvv as string | null) ?? ''
        })
        setOfficialNoticeOpen(!data.official_ids_acknowledged)
        setPaymentFlowsOpen(!data.payment_flows_acknowledged)
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

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/artist-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentDetails)
      })

      const result = await response.json().catch(() => null)
      if (!response.ok) {
        const details = result?.details || result?.error || 'Failed to save Artist Banking details'
        throw new Error(details)
      }

      showNotification('success', 'Artist Banking details saved successfully')
      setOfficialNoticeOpen(!paymentDetails.official_ids_acknowledged)
      setPaymentFlowsOpen(!paymentDetails.payment_flows_acknowledged)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('artist-profile-updated', { detail: { source: 'payments' } }))
      }
    } catch (error) {
      console.error('Error saving payment details:', error)
      showNotification('error', error instanceof Error ? error.message : 'Failed to save Artist Banking details')
    } finally {
      setSaving(false)
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
  }

  const entityType = paymentDetails.entity_type || ''
  const isCorporateEntity = corporateEntityTypes.includes(entityType as EntityType)
  const currentMembers = legalMembers.filter(member => member.metadata?.isCurrentMember !== false)
  const previousMembers = legalMembers.filter(member => member.metadata?.isCurrentMember === false)

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
          </CardContent>
        )}
      </Card>

      <Card id="artist-payments-legal-entity" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900"><Landmark className="w-5 h-5" /> Artist Legal Entity</CardTitle>
          <p className="text-sm text-gray-600">This is the legal payee Gigrilla uses for compliance, payouts, and payment reporting.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Artist Stage Name</Label>
              <Input value={artistStageName || 'Not set yet'} readOnly className="bg-gray-100" />
              <p className="text-xs text-gray-500">Carried over from Artist Basics.</p>
            </div>
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select value={paymentDetails.entity_type || ''} onValueChange={(value) => updatePaymentDetails('entity_type', value as EntityType)}>
                <SelectTrigger><SelectValue placeholder="Select entity type" /></SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Artist Entity Legal Name (Payee)</Label>
            <Input
              value={paymentDetails.artist_entity_legal_name}
              onChange={(event) => updatePaymentDetails('artist_entity_legal_name', event.target.value)}
              placeholder="Your business entity name, your legal name, or your Artist name"
            />
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 space-y-4">
            <h3 className="font-semibold text-purple-950">Main Contact (compliance/payments)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input value={paymentDetails.main_contact_first_name} onChange={(event) => updatePaymentDetails('main_contact_first_name', event.target.value)} placeholder="First/Given Name" />
              <Input value={paymentDetails.main_contact_last_name} onChange={(event) => updatePaymentDetails('main_contact_last_name', event.target.value)} placeholder="Last/Family Name" />
              <div className="grid grid-cols-[minmax(150px,220px)_1fr] gap-2 md:col-span-1">
                <Select
                  value={getDialCodeChoiceValue(paymentDetails.main_contact_phone_country_code)}
                  onValueChange={(value) => updatePaymentDetails('main_contact_phone_country_code', getDialCodeFromChoiceValue(value))}
                >
                  <SelectTrigger><SelectValue placeholder="Code" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {COUNTRY_DIAL_CODE_CHOICES.map(choice => <SelectItem key={choice.value} value={choice.value}>{choice.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={paymentDetails.main_contact_phone} onChange={(event) => updatePaymentDetails('main_contact_phone', event.target.value)} placeholder="Contact Phone" />
              </div>
              <Input value={paymentDetails.main_contact_email} onChange={(event) => updatePaymentDetails('main_contact_email', event.target.value)} placeholder="Contact Email" />
            </div>
          </div>

          {entityType && (
            <div className="space-y-4 rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-950">
                {isCorporateEntity ? 'Corporate Taxpayer ID Number (business)' : 'Income Taxpayer ID Number (individual)'}
              </h3>
              <div className="space-y-2">
                <Label>{isCorporateEntity ? 'Country of Incorporation' : 'Country of Tax Residence'}</Label>
                <Select
                  value={isCorporateEntity ? paymentDetails.country_of_incorporation : paymentDetails.country_of_tax_residence}
                  onValueChange={(value) => updatePaymentDetails(isCorporateEntity ? 'country_of_incorporation' : 'country_of_tax_residence', value)}
                >
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {COUNTRY_OPTIONS.map(country => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaxIdInput label="Generic/Tax ID" value={paymentDetails.generic_tax_id} onChange={(value) => updatePaymentDetails('generic_tax_id', value)} />
                <TaxIdInput label="Individual Tax ID" value={paymentDetails.individual_tax_id} onChange={(value) => updatePaymentDetails('individual_tax_id', value)} />
                <TaxIdInput label="Business Tax ID" value={paymentDetails.business_tax_id} onChange={(value) => updatePaymentDetails('business_tax_id', value)} />
                <TaxIdInput label="VAT/GST/SST ID" value={paymentDetails.vat_gst_sst_id} onChange={(value) => updatePaymentDetails('vat_gst_sst_id', value)} />
              </div>
              <p className="text-xs text-gray-500">Provide at least one valid ID number. Local labels and format checks can be added country-by-country without changing this data model.</p>
              {isCorporateEntity ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label>Company Registration Number (if issued)</Label>
                    <Input value={paymentDetails.company_registration_number} onChange={(event) => updatePaymentDetails('company_registration_number', event.target.value)} placeholder="Your Artist Company ID" />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Formation Date</Label>
                    <Input type="date" value={paymentDetails.company_formation_date} onChange={(event) => updatePaymentDetails('company_formation_date', event.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <Label>Your Date of Birth</Label>
                  <Input type="date" value={paymentDetails.legal_entity_date_of_birth} onChange={(event) => updatePaymentDetails('legal_entity_date_of_birth', event.target.value)} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="artist-payments-legal-members" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900"><Users2 className="w-5 h-5" /> Artist Legal Members</CardTitle>
          <p className="text-sm text-gray-600">Twinned with Artist Crew &gt; Performers for audit-proof accounting and accurate royalty/payment routing.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <LegalMemberSection title="Current Artist Members & IDs" members={currentMembers} emptyText="No current performer members have been added yet." />
          <LegalMemberSection title="Previous Artist Members & IDs" members={previousMembers} emptyText="No previous performer members have been recorded yet." previous />
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/artist-dashboard?section=crew&subSection=owner'}>Confirm/Update Shareholder Details</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => window.location.href = '/artist-dashboard?section=crew&subSection=add-members'}>Add a New Artist Shareholder</Button>
          </div>
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
          />
        </>
      )}

      <Card id="artist-payments-preference" className="scroll-mt-28">
        <CardContent className="p-5 space-y-4">
          <Label className="text-base font-medium">Should we use the same Banking Details for this Artist Profile payments as your Fan Profile?</Label>
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
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
          {saving ? 'Saving...' : 'Save Artist Banking Details'}
        </Button>
      </div>
    </div>
  )
}

function TaxIdInput({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder="Local name / format checker pending" />
    </div>
  )
}

function LegalMemberSection({ title, members, emptyText, previous = false }: { title: string; members: LegalMember[]; emptyText: string; previous?: boolean }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-950">{title}</h3>
      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">{emptyText}</div>
      ) : (
        <div className="space-y-3">
          {members.map(member => {
            const metadata = member.metadata ?? {}
            const displayName = [metadata.firstName, metadata.nickname ? `“${metadata.nickname}”` : '', metadata.lastName].filter(Boolean).join(' ') || member.name || member.email || 'Unnamed performer'
            return (
              <div key={member.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-950">{displayName}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{previous ? 'Previous' : 'Current'}</Badge>
                    {metadata.isShareholder && <Badge className="bg-green-100 text-green-800 border-green-200">Shareholder</Badge>}
                    {metadata.isMainContact && <Badge className="bg-blue-100 text-blue-800 border-blue-200">Main Contact</Badge>}
                    {metadata.isAdmin && <Badge className="bg-purple-100 text-purple-800 border-purple-200">Admin</Badge>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <MemberFact label="Individual ISNI" value={metadata.performerIsni} />
                  <MemberFact label="Performer IPN" value={metadata.performerIpn} />
                  <MemberFact label="Writer IPI" value={metadata.creatorIpiCae} />
                  <MemberFact label="Member Since" value={metadata.memberSince} />
                  <MemberFact label="Date Left" value={metadata.dateLeft} />
                  <MemberFact label="Roles" value={member.roles?.join(', ')} />
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/artist-dashboard?section=crew&subSection=owner'}>
                  {previous ? 'Reinstate Shareholder' : 'Confirm/Update Shareholder Details'}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MemberFact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || 'Not set'}</p>
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
  onSameAsOutChange
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
