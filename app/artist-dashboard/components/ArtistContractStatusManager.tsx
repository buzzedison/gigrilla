"use client";

import { useState, useEffect } from "react"
import { useAuth } from "../../../lib/auth-context"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Save, Loader2, Info } from "lucide-react"

const RECORD_LABEL_STATUS_OPTIONS = [
  { value: "signed", label: "Signed to Label" },
  { value: "unsigned_seeking", label: "Unsigned - Seeking Label" },
  { value: "independent", label: "Self Signed - Independent" }
]

const MUSIC_PUBLISHER_STATUS_OPTIONS = [
  { value: "signed", label: "Signed to Publisher" },
  { value: "unsigned_seeking", label: "Unsigned - Seeking Publisher" },
  { value: "independent", label: "Self Publishing - Independent" }
]

const MANAGER_STATUS_OPTIONS = [
  { value: "signed", label: "Signed to Manager" },
  { value: "seeking", label: "Unsigned - Seeking Manager" },
  { value: "self_managed", label: "Self Managed - Independent" }
]

const BOOKING_AGENT_STATUS_OPTIONS = [
  { value: "signed", label: "Signed to Booking Agent" },
  { value: "seeking", label: "Unsigned - Seeking Booking Agent" },
  { value: "self_managed", label: "Self Booking - Independent" }
]

const normalizeLabelPublisherStatus = (value?: string | null) => {
  const normalized = value?.toString().trim().toLowerCase() ?? ''

  switch (normalized) {
    case 'signed':
    case 'signed to label':
    case 'signed to publisher':
      return 'signed'
    case 'unsigned':
    case 'seeking':
    case 'unsigned - seeking label':
    case 'unsigned - seeking publisher':
    case 'unsigned_seeking':
      return 'unsigned_seeking'
    case 'independent':
    case 'self signed - independent':
    case 'self publishing - independent':
    case 'self-signed':
    case 'self_signed':
      return 'independent'
    default:
      return ''
  }
}

const normalizeManagerStatus = (value?: string | null) => {
  const normalized = value?.toString().trim().toLowerCase() ?? ''

  switch (normalized) {
    case 'signed':
    case 'managed':
    case 'signed to manager':
      return 'signed'
    case 'seeking':
    case 'unsigned':
    case 'unsigned - seeking manager':
      return 'seeking'
    case 'self_managed':
    case 'self-managed':
    case 'self managed':
    case 'self managed - independent':
    case 'self booking':
    case 'self-booking':
      return 'self_managed'
    default:
      return ''
  }
}

const normalizeBookingStatus = (value?: string | null) => {
  const normalized = value?.toString().trim().toLowerCase() ?? ''

  switch (normalized) {
    case 'signed':
    case 'managed':
    case 'signed to booking agent':
      return 'signed'
    case 'seeking':
    case 'unsigned':
    case 'unsigned - seeking booking agent':
      return 'seeking'
    case 'self_managed':
    case 'self-managed':
    case 'self managed':
    case 'self booking':
    case 'self-booking':
    case 'self booking - independent':
      return 'self_managed'
    default:
      return ''
  }
}

const parseContactName = (value?: string | null) => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    return { firstName: '', lastName: '' }
  }

  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  }
}

const buildContactName = (firstName: string, lastName: string) => {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
}

const parsePhone = (value?: string | null) => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    return { code: '+', number: '' }
  }

  const match = trimmed.match(/^(\+\d{1,4})[\s-]*(.*)$/)
  if (match) {
    return {
      code: match[1],
      number: (match[2] ?? '').trim()
    }
  }

  return { code: '+', number: trimmed }
}

const buildPhone = (code: string, number: string) => {
  const normalizedCode = code.trim() || '+'
  const normalizedNumber = number.trim()
  if (!normalizedNumber) return ''
  return `${normalizedCode} ${normalizedNumber}`.trim()
}

export function ArtistContractStatusManager() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [formData, setFormData] = useState({
    record_label_status: "",
    record_label_name: "",
    record_label_contact_first_name: "",
    record_label_contact_last_name: "",
    record_label_email: "",
    record_label_phone_code: "+",
    record_label_phone_number: "",
    music_publisher_status: "",
    music_publisher_name: "",
    music_publisher_contact_first_name: "",
    music_publisher_contact_last_name: "",
    music_publisher_email: "",
    music_publisher_phone_code: "+",
    music_publisher_phone_number: "",
    artist_manager_status: "",
    artist_manager_name: "",
    artist_manager_contact_first_name: "",
    artist_manager_contact_last_name: "",
    artist_manager_email: "",
    artist_manager_phone_code: "+",
    artist_manager_phone_number: "",
    booking_agent_status: "",
    booking_agent_name: "",
    booking_agent_contact_first_name: "",
    booking_agent_contact_last_name: "",
    booking_agent_email: "",
    booking_agent_phone_code: "+",
    booking_agent_phone_number: "",
  })

  useEffect(() => {
    if (!user) {
      setInitialLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      setInitialLoading(true)
      try {
        const response = await fetch('/api/artist-profile')
        const result = await response.json()

        if (!response.ok || !result?.data) {
          setInitialLoading(false)
          return
        }

        const profile = result.data as {
          record_label_status?: string | null
          record_label_name?: string | null
          record_label_contact_name?: string | null
          record_label_email?: string | null
          record_label_phone?: string | null
          music_publisher_status?: string | null
          music_publisher_name?: string | null
          music_publisher_contact_name?: string | null
          music_publisher_email?: string | null
          music_publisher_phone?: string | null
          artist_manager_status?: string | null
          artist_manager_name?: string | null
          artist_manager_contact_name?: string | null
          artist_manager_email?: string | null
          artist_manager_phone?: string | null
          booking_agent_status?: string | null
          booking_agent_name?: string | null
          booking_agent_contact_name?: string | null
          booking_agent_email?: string | null
          booking_agent_phone?: string | null
        }

        const recordLabelName = parseContactName(profile.record_label_contact_name)
        const recordLabelPhone = parsePhone(profile.record_label_phone)
        const publisherName = parseContactName(profile.music_publisher_contact_name)
        const publisherPhone = parsePhone(profile.music_publisher_phone)
        const managerName = parseContactName(profile.artist_manager_contact_name)
        const managerPhone = parsePhone(profile.artist_manager_phone)
        const bookingName = parseContactName(profile.booking_agent_contact_name)
        const bookingPhone = parsePhone(profile.booking_agent_phone)

        setFormData(prev => ({
          ...prev,
          record_label_status: normalizeLabelPublisherStatus(profile.record_label_status) || prev.record_label_status,
          record_label_name: profile.record_label_name ?? "",
          record_label_contact_first_name: recordLabelName.firstName,
          record_label_contact_last_name: recordLabelName.lastName,
          record_label_email: profile.record_label_email ?? "",
          record_label_phone_code: recordLabelPhone.code,
          record_label_phone_number: recordLabelPhone.number,
          music_publisher_status: normalizeLabelPublisherStatus(profile.music_publisher_status) || prev.music_publisher_status,
          music_publisher_name: profile.music_publisher_name ?? "",
          music_publisher_contact_first_name: publisherName.firstName,
          music_publisher_contact_last_name: publisherName.lastName,
          music_publisher_email: profile.music_publisher_email ?? "",
          music_publisher_phone_code: publisherPhone.code,
          music_publisher_phone_number: publisherPhone.number,
          artist_manager_status: normalizeManagerStatus(profile.artist_manager_status) || prev.artist_manager_status,
          artist_manager_name: profile.artist_manager_name ?? "",
          artist_manager_contact_first_name: managerName.firstName,
          artist_manager_contact_last_name: managerName.lastName,
          artist_manager_email: profile.artist_manager_email ?? "",
          artist_manager_phone_code: managerPhone.code,
          artist_manager_phone_number: managerPhone.number,
          booking_agent_status: normalizeBookingStatus(profile.booking_agent_status) || prev.booking_agent_status,
          booking_agent_name: profile.booking_agent_name ?? "",
          booking_agent_contact_first_name: bookingName.firstName,
          booking_agent_contact_last_name: bookingName.lastName,
          booking_agent_email: profile.booking_agent_email ?? "",
          booking_agent_phone_code: bookingPhone.code,
          booking_agent_phone_number: bookingPhone.number,
        }))
      } catch (error) {
        console.error('Error loading contract status:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadProfile()
  }, [user])

  useEffect(() => {
    if (!feedback) return

    const timer = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(timer)
  }, [feedback])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          record_label_status: formData.record_label_status || null,
          record_label_name: formData.record_label_name || null,
          record_label_contact_name: buildContactName(formData.record_label_contact_first_name, formData.record_label_contact_last_name) || null,
          record_label_email: formData.record_label_email || null,
          record_label_phone: buildPhone(formData.record_label_phone_code, formData.record_label_phone_number) || null,
          music_publisher_status: formData.music_publisher_status || null,
          music_publisher_name: formData.music_publisher_name || null,
          music_publisher_contact_name: buildContactName(formData.music_publisher_contact_first_name, formData.music_publisher_contact_last_name) || null,
          music_publisher_email: formData.music_publisher_email || null,
          music_publisher_phone: buildPhone(formData.music_publisher_phone_code, formData.music_publisher_phone_number) || null,
          artist_manager_status: formData.artist_manager_status || null,
          artist_manager_name: formData.artist_manager_name || null,
          artist_manager_contact_name: buildContactName(formData.artist_manager_contact_first_name, formData.artist_manager_contact_last_name) || null,
          artist_manager_email: formData.artist_manager_email || null,
          artist_manager_phone: buildPhone(formData.artist_manager_phone_code, formData.artist_manager_phone_number) || null,
          booking_agent_status: formData.booking_agent_status || null,
          booking_agent_name: formData.booking_agent_name || null,
          booking_agent_contact_name: buildContactName(formData.booking_agent_contact_first_name, formData.booking_agent_contact_last_name) || null,
          booking_agent_email: formData.booking_agent_email || null,
          booking_agent_phone: buildPhone(formData.booking_agent_phone_code, formData.booking_agent_phone_number) || null
        })
      })

      const result = await response.json()

      if (result.error) {
        console.error('Error saving contract status:', result.error)
        setFeedback({ type: 'error', message: 'Something went wrong while saving. Please try again.' })
        return
      }

      console.log('Contract status saved successfully')
      setFeedback({ type: 'success', message: 'Contract status saved successfully.' })

    } catch (error) {
      console.error('Error saving contract status:', error)
      setFeedback({ type: 'error', message: 'Unable to save contract status. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 text-sm text-gray-600 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
          Loading contract status…
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Contract Status</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your record label, publisher, manager, and booking agent relationships</p>
        </div>

        {feedback && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Record Label Section */}
          <div id="artist-contract-label" className="bg-gray-50 rounded-lg p-4 space-y-4 scroll-mt-28">
            <h2 className="text-xl font-semibold text-gray-900">Record Label Status</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={formData.record_label_status} onValueChange={(value) => handleInputChange('record_label_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECORD_LABEL_STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.record_label_status === 'signed' && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    If your Record Label is already on Gigrilla they&apos;ll show-up as you start to type. If not, just finish typing their full Label company name below to help us invite and match them to you.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Record Label Name</label>
                  <Input
                    value={formData.record_label_name}
                    onChange={(e) => handleInputChange('record_label_name', e.target.value)}
                    placeholder="Start typing label company name…"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    The following details are used for linking accounts to members and inviting non-members to Gigrilla. We do not share or sell this information and contact details remain strictly private.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Record Label Contact Name</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        value={formData.record_label_contact_first_name}
                        onChange={(e) => handleInputChange('record_label_contact_first_name', e.target.value)}
                        placeholder="First/Given Name"
                      />
                      <Input
                        value={formData.record_label_contact_last_name}
                        onChange={(e) => handleInputChange('record_label_contact_last_name', e.target.value)}
                        placeholder="Last/Family Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Record Label Contact Email</label>
                    <Input
                      type="email"
                      value={formData.record_label_email}
                      onChange={(e) => handleInputChange('record_label_email', e.target.value)}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Record Label Contact Phone</label>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                      <Input
                        type="tel"
                        value={formData.record_label_phone_code}
                        onChange={(e) => handleInputChange('record_label_phone_code', e.target.value)}
                        placeholder="+44"
                      />
                      <Input
                        type="tel"
                        value={formData.record_label_phone_number}
                        onChange={(e) => handleInputChange('record_label_phone_number', e.target.value)}
                        placeholder="Phone number…"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Music Publisher Section */}
          <div id="artist-contract-publisher" className="bg-gray-50 rounded-lg p-4 space-y-4 scroll-mt-28">
            <h2 className="text-xl font-semibold text-gray-900">Music Publisher Status</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={formData.music_publisher_status} onValueChange={(value) => handleInputChange('music_publisher_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSIC_PUBLISHER_STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.music_publisher_status === 'signed' && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    If your Music Publisher is already on Gigrilla they&apos;ll show-up as you start to type. If not, just finish typing their full Publisher company name below to help us invite and match them to you.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Music Publisher Name</label>
                  <Input
                    value={formData.music_publisher_name}
                    onChange={(e) => handleInputChange('music_publisher_name', e.target.value)}
                    placeholder="Start typing publisher company name…"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    The following details are used for linking accounts to members and inviting non-members to Gigrilla. We do not share or sell this information and contact details remain strictly private.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Music Publisher Contact Name</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        value={formData.music_publisher_contact_first_name}
                        onChange={(e) => handleInputChange('music_publisher_contact_first_name', e.target.value)}
                        placeholder="First/Given Name"
                      />
                      <Input
                        value={formData.music_publisher_contact_last_name}
                        onChange={(e) => handleInputChange('music_publisher_contact_last_name', e.target.value)}
                        placeholder="Last/Family Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Music Publisher Contact Email</label>
                    <Input
                      type="email"
                      value={formData.music_publisher_email}
                      onChange={(e) => handleInputChange('music_publisher_email', e.target.value)}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Music Publisher Contact Phone</label>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                      <Input
                        type="tel"
                        value={formData.music_publisher_phone_code}
                        onChange={(e) => handleInputChange('music_publisher_phone_code', e.target.value)}
                        placeholder="+44"
                      />
                      <Input
                        type="tel"
                        value={formData.music_publisher_phone_number}
                        onChange={(e) => handleInputChange('music_publisher_phone_number', e.target.value)}
                        placeholder="Phone number…"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Artist Manager Section */}
          <div id="artist-contract-manager" className="bg-gray-50 rounded-lg p-4 space-y-4 scroll-mt-28">
            <h2 className="text-xl font-semibold text-gray-900">Artist Manager Status</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={formData.artist_manager_status} onValueChange={(value) => handleInputChange('artist_manager_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANAGER_STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.artist_manager_status === 'signed' && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    If your Manager is already on Gigrilla they&apos;ll show-up as you start to type. If not, just finish typing their full Management company name below to help us invite and match them to you.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Artist Manager Name</label>
                  <Input
                    value={formData.artist_manager_name}
                    onChange={(e) => handleInputChange('artist_manager_name', e.target.value)}
                    placeholder="Start typing management company name…"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    The following details are used for linking accounts to members and inviting non-members to Gigrilla. We do not share or sell this information and contact details remain strictly private.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Artist Manager Contact Name</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        value={formData.artist_manager_contact_first_name}
                        onChange={(e) => handleInputChange('artist_manager_contact_first_name', e.target.value)}
                        placeholder="First/Given Name"
                      />
                      <Input
                        value={formData.artist_manager_contact_last_name}
                        onChange={(e) => handleInputChange('artist_manager_contact_last_name', e.target.value)}
                        placeholder="Last/Family Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Artist Manager Contact Email</label>
                    <Input
                      type="email"
                      value={formData.artist_manager_email}
                      onChange={(e) => handleInputChange('artist_manager_email', e.target.value)}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Artist Manager Contact Phone</label>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                      <Input
                        type="tel"
                        value={formData.artist_manager_phone_code}
                        onChange={(e) => handleInputChange('artist_manager_phone_code', e.target.value)}
                        placeholder="+44"
                      />
                      <Input
                        type="tel"
                        value={formData.artist_manager_phone_number}
                        onChange={(e) => handleInputChange('artist_manager_phone_number', e.target.value)}
                        placeholder="Phone number…"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Booking Agent Section */}
          <div id="artist-contract-booking" className="bg-gray-50 rounded-lg p-4 space-y-4 scroll-mt-28">
            <h2 className="text-xl font-semibold text-gray-900">Booking Agent Status</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={formData.booking_agent_status} onValueChange={(value) => handleInputChange('booking_agent_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_AGENT_STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.booking_agent_status === 'signed' && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    If your Booking Agent is already on Gigrilla they&apos;ll show-up as you start to type. If not, just finish typing their full Agency company name below to help us invite and match them to you.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Booking Agent Name</label>
                  <Input
                    value={formData.booking_agent_name}
                    onChange={(e) => handleInputChange('booking_agent_name', e.target.value)}
                    placeholder="Start typing agency company name…"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    The following details are used for linking accounts to members and inviting non-members to Gigrilla. We do not share or sell this information and contact details remain strictly private.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Booking Agent Contact Name</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        value={formData.booking_agent_contact_first_name}
                        onChange={(e) => handleInputChange('booking_agent_contact_first_name', e.target.value)}
                        placeholder="First/Given Name"
                      />
                      <Input
                        value={formData.booking_agent_contact_last_name}
                        onChange={(e) => handleInputChange('booking_agent_contact_last_name', e.target.value)}
                        placeholder="Last/Family Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Booking Agent Contact Email</label>
                    <Input
                      type="email"
                      value={formData.booking_agent_email}
                      onChange={(e) => handleInputChange('booking_agent_email', e.target.value)}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Booking Agent Contact Phone</label>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                      <Input
                        type="tel"
                        value={formData.booking_agent_phone_code}
                        onChange={(e) => handleInputChange('booking_agent_phone_code', e.target.value)}
                        placeholder="+44"
                      />
                      <Input
                        type="tel"
                        value={formData.booking_agent_phone_number}
                        onChange={(e) => handleInputChange('booking_agent_phone_number', e.target.value)}
                        placeholder="Phone number…"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex gap-4 justify-center">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Contract Status'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
