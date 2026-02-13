'use client'

import { useEffect, useRef, useState } from 'react'
import {
    Plus, Check, Loader2, AlertCircle, Upload, X, Info,
    Calendar, Clock, MapPin, Globe, Ticket, Image as ImageIcon,
    Radio, Megaphone, Eye, EyeOff, ChevronDown, ChevronUp, Trash2, Edit
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { LocationAutocompleteInput } from '../../../components/ui/location-autocomplete'

/* ── Types ────────────────────────────────────────────── */

type GigType = 'in_person' | 'streaming'

interface TicketOption {
    id: string
    name: string
    durationType: 'one_gig' | 'weekend' | 'extended'
    admissionType: 'general' | 'premium' | 'vip' | 'vip_backstage'
    benefits: string
    price: string
    currency: string
}

interface VenueSuggestion {
    id: string
    name: string
    address: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    contactName?: string
    contactEmail?: string
    contactPhoneCode?: string
    contactPhone?: string
}

interface GigFormData {
    // 1. Name
    gigEventName: string
    // 2. Type
    gigType: GigType
    // 3. Date/Time
    gigDate: string
    doorsOpen: string
    streamOpens: string
    setStartTime: string
    setEndTime: string
    // 4. Venue (in-person only)
    venueName: string
    venueAddress: string
    venueContactName: string
    venueContactEmail: string
    venueContactPhoneCode: string
    venueContactPhone: string
    // 5. Stream link (streaming only)
    liveStreamUrl: string
    // 6. Age restrictions
    ageRestrictionMode: 'unknown' | 'has_restrictions'
    ageRestrictions: string[]
    // 7. Tickets
    ticketMode: 'unknown' | 'known'
    freeTicketOptions: string[]
    paidTicketOptions: string[]
    thirdPartyTicketLink: string
    ticketPriceVenue: string
    ticketPriceOnline: string
    ticketCurrency: string
    customTickets: TicketOption[]
    ticketAvailability: 'skip' | 'full_venue_capacity' | 'less_than_full_venue_capacity'
    customTicketCount: string
    // 8. Artwork
    artworkFile: File | null
    artworkCaption: string
    artworkPreview: string
    // 9. Publishing
    publishMode: 'immediate' | 'scheduled'
    publishDate: string
    publishTime: string
    // Description (additional)
    description: string
}

export type CreateGigFormInitialData = Partial<GigFormData>

const AGE_OPTIONS = [
    'All ages',
    'Over 16s', 'Under 16s',
    'Over 17s', 'Under 17s',
    'Over 18s', 'Under 18s',
    'Over 19s', 'Under 19s',
    'Over 20s', 'Under 20s',
    'Over 21s', 'Under 21s',
    'Over 25s', 'Under 25s',
    'Over 30s', 'Under 30s',
]

const CURRENCIES = [
    { value: 'GBP', label: '£ GBP', symbol: '£' },
    { value: 'USD', label: '$ USD', symbol: '$' },
    { value: 'EUR', label: '€ EUR', symbol: '€' },
    { value: 'GHS', label: '₵ GHS', symbol: '₵' },
]

const DEFAULT_FORM: GigFormData = {
    gigEventName: '',
    gigType: 'in_person',
    gigDate: '',
    doorsOpen: '',
    streamOpens: '',
    setStartTime: '',
    setEndTime: '',
    venueName: '',
    venueAddress: '',
    venueContactName: '',
    venueContactEmail: '',
    venueContactPhoneCode: '+',
    venueContactPhone: '',
    liveStreamUrl: '',
    ageRestrictionMode: 'unknown',
    ageRestrictions: [],
    ticketMode: 'unknown',
    freeTicketOptions: [],
    paidTicketOptions: [],
    thirdPartyTicketLink: '',
    ticketPriceVenue: '',
    ticketPriceOnline: '',
    ticketCurrency: 'GBP',
    customTickets: [],
    ticketAvailability: 'skip',
    customTicketCount: '',
    artworkFile: null,
    artworkCaption: '',
    artworkPreview: '',
    publishMode: 'immediate',
    publishDate: '',
    publishTime: '',
    description: '',
}

/* ── Helpers ──────────────────────────────────────────── */

function SectionHeading({ step, title, icon: Icon }: { step: number; title: string; icon: React.ElementType }) {
    return (
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold">
                {step}
            </div>
            <Icon className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
        </div>
    )
}

function InfoBox({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <div>{children}</div>
        </div>
    )
}

function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file)
        const image = new Image()

        image.onload = () => {
            const width = image.naturalWidth
            const height = image.naturalHeight
            URL.revokeObjectURL(objectUrl)
            resolve({ width, height })
        }

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('Could not read image dimensions'))
        }

        image.src = objectUrl
    })
}

/* ── Component ────────────────────────────────────────── */

interface CreateGigFormProps {
    onCancel: () => void
    onSuccess: () => void
    mode?: 'create' | 'edit'
    bookingId?: string
    initialData?: CreateGigFormInitialData
}

function buildInitialFormState(initialData?: CreateGigFormInitialData): GigFormData {
    return {
        ...DEFAULT_FORM,
        ...(initialData || {}),
        venueContactPhoneCode: initialData?.venueContactPhoneCode || DEFAULT_FORM.venueContactPhoneCode,
    }
}

export function CreateGigForm({
    onCancel,
    onSuccess,
    mode = 'create',
    bookingId,
    initialData,
}: CreateGigFormProps) {
    const [form, setForm] = useState<GigFormData>(() => buildInitialFormState(initialData))
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [expandedTicketBuilder, setExpandedTicketBuilder] = useState(false)
    const [showFanPromotionInfo, setShowFanPromotionInfo] = useState(false)
    const [venueSuggestions, setVenueSuggestions] = useState<VenueSuggestion[]>([])
    const [venueSuggestionsLoading, setVenueSuggestionsLoading] = useState(false)
    const [venueSuggestionsError, setVenueSuggestionsError] = useState<string | null>(null)
    const [venueDropdownOpen, setVenueDropdownOpen] = useState(false)
    const venueFetchIdRef = useRef(0)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // New ticket being built
    const [newTicket, setNewTicket] = useState<Omit<TicketOption, 'id'>>({
        name: '',
        durationType: 'one_gig',
        admissionType: 'general',
        benefits: '',
        price: '',
        currency: 'GBP',
    })

    const isInPerson = form.gigType === 'in_person'
    const isStreaming = form.gigType === 'streaming'
    const hasPaidTickets = form.paidTicketOptions.length > 0
    const currencySymbol = CURRENCIES.find(c => c.value === form.ticketCurrency)?.symbol || '£'
    const isEditMode = mode === 'edit'

    useEffect(() => {
        setForm(buildInitialFormState(initialData))
    }, [initialData, mode])

    const update = <K extends keyof GigFormData>(key: K, value: GigFormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    useEffect(() => {
        const query = form.venueName.trim()

        if (!isInPerson || query.length < 2) {
            setVenueSuggestions([])
            setVenueSuggestionsError(null)
            setVenueSuggestionsLoading(false)
            return
        }

        const fetchId = ++venueFetchIdRef.current
        const abortController = new AbortController()
        const debounceTimeout = window.setTimeout(async () => {
            setVenueSuggestionsLoading(true)
            setVenueSuggestionsError(null)

            try {
                const response = await fetch(`/api/venues/search?query=${encodeURIComponent(query)}`, {
                    signal: abortController.signal,
                    cache: 'no-store',
                    headers: { Accept: 'application/json' },
                })

                const payload = await response.json().catch(() => ({}))
                if (fetchId !== venueFetchIdRef.current) return

                if (!response.ok) {
                    setVenueSuggestions([])
                    setVenueSuggestionsError(payload?.error || 'Unable to search venues right now.')
                    return
                }

                const suggestions = Array.isArray(payload?.suggestions)
                    ? payload.suggestions as VenueSuggestion[]
                    : []
                setVenueSuggestions(suggestions)
            } catch (error) {
                if (abortController.signal.aborted || fetchId !== venueFetchIdRef.current) return
                setVenueSuggestions([])
                setVenueSuggestionsError(error instanceof Error ? error.message : 'Unable to search venues right now.')
            } finally {
                if (fetchId === venueFetchIdRef.current) {
                    setVenueSuggestionsLoading(false)
                }
            }
        }, 250)

        return () => {
            abortController.abort()
            window.clearTimeout(debounceTimeout)
        }
    }, [form.venueName, isInPerson])

    const applyVenueSuggestion = (suggestion: VenueSuggestion) => {
        update('venueName', suggestion.name)
        if (suggestion.address) {
            update('venueAddress', suggestion.address)
        }
        if (suggestion.contactName) {
            update('venueContactName', suggestion.contactName)
        }
        if (suggestion.contactEmail) {
            update('venueContactEmail', suggestion.contactEmail)
        }
        if (suggestion.contactPhoneCode) {
            update('venueContactPhoneCode', suggestion.contactPhoneCode)
        }
        if (suggestion.contactPhone) {
            update('venueContactPhone', suggestion.contactPhone)
        }
        setVenueDropdownOpen(false)
    }

    const toggleArrayItem = (key: 'ageRestrictions' | 'freeTicketOptions' | 'paidTicketOptions', value: string) => {
        if (key === 'ageRestrictions') {
            setForm(prev => {
                const current = prev.ageRestrictions
                const alreadySelected = current.includes(value)

                if (value === 'All ages') {
                    return {
                        ...prev,
                        ageRestrictions: alreadySelected ? [] : ['All ages'],
                    }
                }

                const filtered = current.filter(option => option !== 'All ages')
                const isOver = value.startsWith('Over')
                const isUnder = value.startsWith('Under')

                if (alreadySelected) {
                    return {
                        ...prev,
                        ageRestrictions: filtered.filter(option => option !== value),
                    }
                }

                if (isOver) {
                    return {
                        ...prev,
                        ageRestrictions: [...filtered.filter(option => !option.startsWith('Over')), value],
                    }
                }

                if (isUnder) {
                    return {
                        ...prev,
                        ageRestrictions: [...filtered.filter(option => !option.startsWith('Under')), value],
                    }
                }

                return {
                    ...prev,
                    ageRestrictions: [...filtered, value],
                }
            })
            return
        }

        setForm(prev => {
            const arr = prev[key]
            return {
                ...prev,
                [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
            }
        })
    }

    const getAgeDisplay = (selections: string[]) => {
        if (selections.length === 0) return 'None selected'
        if (selections.includes('All ages')) return 'Family Friendly'

        const over = selections.find(option => option.startsWith('Over')) || null
        const under = selections.find(option => option.startsWith('Under')) || null
        const parts: string[] = []
        if (over) parts.push(over)
        if (under) parts.push(under)
        return parts.length > 0 ? parts.join('. ') + '.' : selections.join(', ')
    }

    const validateAgeRestrictionSelections = (selections: string[]) => {
        const uniqueSelections = Array.from(new Set(
            selections.map(option => option.trim()).filter(Boolean)
        ))

        if (uniqueSelections.length === 0) {
            throw new Error('Please choose at least one age restriction option')
        }

        if (uniqueSelections.includes('All ages') && uniqueSelections.length > 1) {
            throw new Error('Choose either "All ages" or one "Over" and/or one "Under" option')
        }

        const unsupported = uniqueSelections.filter(option =>
            option !== 'All ages' && !option.startsWith('Over') && !option.startsWith('Under')
        )
        if (unsupported.length > 0) {
            throw new Error('One or more age restriction options are invalid')
        }

        const overCount = uniqueSelections.filter(option => option.startsWith('Over')).length
        const underCount = uniqueSelections.filter(option => option.startsWith('Under')).length
        if (overCount > 1 || underCount > 1) {
            throw new Error('You can choose up to one "Over" and one "Under" age option')
        }

        return uniqueSelections
    }

    const ageDisplayPreview = getAgeDisplay(form.ageRestrictions)

    const handleArtworkSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        // Validate
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setSubmitError('Artwork must be a .jpg or .png file')
            e.target.value = ''
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            setSubmitError('Artwork must be less than 10MB')
            e.target.value = ''
            return
        }

        try {
            const { width, height } = await loadImageDimensions(file)
            if (width !== height) {
                setSubmitError('Artwork must be a square image (1:1 ratio)')
                e.target.value = ''
                return
            }
            if (width < 3000 || height < 3000) {
                setSubmitError('Artwork must be at least 3000 x 3000 pixels')
                e.target.value = ''
                return
            }
            if (width > 6000 || height > 6000) {
                setSubmitError('Artwork must be no larger than 6000 x 6000 pixels')
                e.target.value = ''
                return
            }
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Could not validate image dimensions')
            e.target.value = ''
            return
        }

        const previewUrl = URL.createObjectURL(file)
        update('artworkFile', file)
        update('artworkPreview', previewUrl)
        setSubmitError(null)
    }

    const removeArtwork = () => {
        if (form.artworkPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(form.artworkPreview)
        }
        update('artworkFile', null)
        update('artworkPreview', '')
    }

    const addCustomTicket = () => {
        if (!newTicket.name.trim()) return
        const ticket: TicketOption = {
            id: crypto.randomUUID(),
            ...newTicket,
        }
        update('customTickets', [...form.customTickets, ticket])
        setNewTicket({
            name: '', durationType: 'one_gig', admissionType: 'general',
            benefits: '', price: '', currency: form.ticketCurrency,
        })
    }

    const removeCustomTicket = (id: string) => {
        update('customTickets', form.customTickets.filter(t => t.id !== id))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setSubmitError(null)

        try {
            if (isEditMode && !bookingId) {
                throw new Error('Cannot edit this gig: booking ID is missing')
            }
            // Validation
            if (!form.gigEventName.trim()) throw new Error('Please enter a Gig Event Name')
            if (!form.gigDate) throw new Error('Please enter the date of the gig')
            if (!form.setStartTime) throw new Error('Please enter your set start time')
            const normalizedAgeRestrictions = form.ageRestrictionMode === 'has_restrictions'
                ? validateAgeRestrictionSelections(form.ageRestrictions)
                : []
            if (form.publishMode === 'scheduled' && !form.publishDate) {
                throw new Error('Please enter the date to publish this gig')
            }
            if (form.ticketAvailability === 'less_than_full_venue_capacity' && !form.customTicketCount) {
                throw new Error('Please enter how many tickets are available')
            }

            // Build start datetime
            const startDatetime = new Date(`${form.gigDate}T${form.setStartTime}:00`).toISOString()
            const endDatetime = form.setEndTime
                ? new Date(`${form.gigDate}T${form.setEndTime}:00`).toISOString()
                : undefined
            if (endDatetime && new Date(endDatetime).getTime() <= new Date(startDatetime).getTime()) {
                throw new Error('Set finish time must be after set start time')
            }

            // Compute age display
            let ageDisplay: string | null = null
            if (form.ageRestrictionMode === 'has_restrictions' && normalizedAgeRestrictions.length > 0) {
                ageDisplay = getAgeDisplay(normalizedAgeRestrictions)
            }

            // Upload artwork if provided
            let artworkUrl: string | null = null
            const existingArtworkUrl = form.artworkPreview && !form.artworkPreview.startsWith('blob:')
                ? form.artworkPreview
                : null
            if (form.artworkFile) {
                const artworkFormData = new FormData()
                artworkFormData.append('file', form.artworkFile)
                artworkFormData.append('type', 'gig-artwork')
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: artworkFormData })
                const uploadData = await uploadRes.json()
                if (!uploadRes.ok) {
                    throw new Error(uploadData?.error || 'Gig artwork upload failed')
                }
                artworkUrl = uploadData.url || null
            } else if (isEditMode) {
                artworkUrl = existingArtworkUrl
            }

            const payload = {
                title: form.gigEventName.trim(),
                event_type: isStreaming ? 'livestream' : 'concert',
                start_datetime: startDatetime,
                end_datetime: endDatetime,
                description: form.description || undefined,
                venue_name: isInPerson ? form.venueName : undefined,
                venue_address: isInPerson ? form.venueAddress : undefined,
                venue_city: undefined,
                venue_country: undefined,
                booking_fee: form.ticketPriceOnline ? parseFloat(form.ticketPriceOnline) : null,
                currency: form.ticketCurrency,
                special_requests: undefined,
                // Extended metadata
                metadata: {
                    gig_type: form.gigType,
                    doors_open: isInPerson ? form.doorsOpen : null,
                    stream_opens: isStreaming ? form.streamOpens : null,
                    set_start_time: form.setStartTime,
                    set_end_time: form.setEndTime,
                    live_stream_url: isStreaming ? form.liveStreamUrl : null,
                    venue_address: isInPerson ? form.venueAddress : null,
                    venue_contact: isInPerson ? {
                        name: form.venueContactName,
                        email: form.venueContactEmail,
                        phone_code: form.venueContactPhoneCode,
                        phone: form.venueContactPhone,
                    } : null,
                    age_restriction_mode: form.ageRestrictionMode,
                    age_restrictions: normalizedAgeRestrictions,
                    age_display: ageDisplay,
                    ticket_mode: form.ticketMode,
                    free_ticket_options: form.freeTicketOptions,
                    paid_ticket_options: form.paidTicketOptions,
                    third_party_ticket_link: form.thirdPartyTicketLink || null,
                    ticket_price_venue: form.ticketPriceVenue || null,
                    ticket_price_online: form.ticketPriceOnline || null,
                    ticket_currency: form.ticketCurrency,
                    custom_tickets: form.customTickets,
                    ticket_availability: form.ticketAvailability,
                    custom_ticket_count: form.customTicketCount || null,
                    agreed_gig_date: form.gigDate,
                    artwork_url: artworkUrl,
                    artwork_caption: form.artworkCaption || null,
                    publish_mode: form.publishMode,
                    publish_date: form.publishMode === 'scheduled' ? form.publishDate : null,
                    publish_time: form.publishMode === 'scheduled' ? form.publishTime : null,
                },
            }

            const response = await fetch('/api/artist-gigs', {
                method: isEditMode ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEditMode ? {
                    bookingId,
                    ...payload,
                } : payload),
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error || (isEditMode ? 'Failed to update gig' : 'Failed to create gig'))

            onSuccess()
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : (isEditMode ? 'Failed to update gig' : 'Failed to create gig'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {submitError}
                </div>
            )}

            {/* ─── 1. NAME YOUR GIG ─────────────────────────────── */}
            <div className="space-y-4">
                <SectionHeading step={1} title="Name Your Gig" icon={Megaphone} />
                <p className="text-sm text-gray-600">
                    How should we advertise this Gig — does it have a special name, like a theme night, an annual event, or a one-off special?
                    For example, <em>&quot;Norwich Rocks Summer Anthems&quot;</em>, <em>&quot;Pam&apos;s House Reunion @ UEA&quot;</em> — or simply <em>&quot;YourArtistName @ VenueName&quot;</em>.
                </p>
                <div>
                    <Label htmlFor="gigEventName">Gig Event Name *</Label>
                    <Input
                        id="gigEventName"
                        placeholder="Write your Gig Event Name"
                        value={form.gigEventName}
                        onChange={e => update('gigEventName', e.target.value)}
                        required
                        className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">This can be superseded by a Venue hosting this Gig.</p>
                </div>
            </div>

            {/* ─── 2. BUILD YOUR GIG DETAILS ────────────────────── */}
            <div className="space-y-4">
                <SectionHeading step={2} title="Build Your Gig Details" icon={Radio} />
                <p className="text-sm text-gray-600 font-medium">
                    Is this a Live In-person Gig, or a Live Streaming Gig?
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <label
                        className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${isInPerson ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <input
                            type="radio"
                            name="gigType"
                            value="in_person"
                            checked={isInPerson}
                            onChange={() => update('gigType', 'in_person')}
                            className="mt-1 accent-purple-600"
                        />
                        <div>
                            <p className="font-semibold text-gray-900">A Live In-person Gig</p>
                            <p className="text-sm text-gray-600">This Gig is at a physical Venue.</p>
                        </div>
                    </label>
                    <label
                        className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${isStreaming ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <input
                            type="radio"
                            name="gigType"
                            value="streaming"
                            checked={isStreaming}
                            onChange={() => update('gigType', 'streaming')}
                            className="mt-1 accent-purple-600"
                        />
                        <div>
                            <p className="font-semibold text-gray-900">A Live Streaming Gig</p>
                            <p className="text-sm text-gray-600">This Gig is transmitted online.</p>
                        </div>
                    </label>
                </div>

                {/* When is this Gig? */}
                <div className="space-y-4 mt-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <p className="font-semibold text-gray-900">When is this Gig?</p>
                    </div>
                    {isInPerson && (
                        <p className="text-xs text-gray-500">This can be superseded by a Venue hosting this Gig.</p>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label htmlFor="gigDate">Agreed Gig Date *</Label>
                            <Input
                                id="gigDate"
                                type="date"
                                value={form.gigDate}
                                onChange={e => update('gigDate', e.target.value)}
                                required
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">All gig timings in this form are tied to this one agreed date.</p>
                        </div>

                        {isInPerson && (
                            <div>
                                <Label htmlFor="doorsOpen">Doors Open</Label>
                                <Input
                                    id="doorsOpen"
                                    type="time"
                                    value={form.doorsOpen}
                                    onChange={e => update('doorsOpen', e.target.value)}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Your Gig&apos;s local time</p>
                            </div>
                        )}

                        {isStreaming && (
                            <div>
                                <Label htmlFor="streamOpens">Stream Opens</Label>
                                <Input
                                    id="streamOpens"
                                    type="time"
                                    value={form.streamOpens}
                                    onChange={e => update('streamOpens', e.target.value)}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Your Gig&apos;s local time</p>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="setStartTime">Your Set Start Time *</Label>
                            <Input
                                id="setStartTime"
                                type="time"
                                value={form.setStartTime}
                                onChange={e => update('setStartTime', e.target.value)}
                                required
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="setEndTime">Your Set Finish Time</Label>
                            <Input
                                id="setEndTime"
                                type="time"
                                value={form.setEndTime}
                                onChange={e => update('setEndTime', e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* ─── VENUE (In-Person only) ───────────────────────── */}
            {isInPerson && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900 text-base">Which Venue is hosting this Gig?</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                        If your Gig Venue is already on Gigrilla they&apos;ll show up as you start to type.
                        If not, just finish typing their full Venue name and add their address below.
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label htmlFor="venueName">Venue Name</Label>
                            <div className="relative mt-1">
                                <Input
                                    id="venueName"
                                    placeholder="Start typing Venue name…"
                                    value={form.venueName}
                                    onChange={e => update('venueName', e.target.value)}
                                    onFocus={() => setVenueDropdownOpen(true)}
                                    onBlur={() => window.setTimeout(() => setVenueDropdownOpen(false), 120)}
                                    autoComplete="off"
                                />

                                {venueDropdownOpen && (venueSuggestionsLoading || venueSuggestions.length > 0 || venueSuggestionsError) && (
                                    <div className="absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                        {venueSuggestionsLoading && (
                                            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Searching Gigrilla venues...
                                            </div>
                                        )}

                                        {!venueSuggestionsLoading && venueSuggestionsError && (
                                            <div className="px-3 py-2 text-sm text-rose-600">{venueSuggestionsError}</div>
                                        )}

                                        {!venueSuggestionsLoading && !venueSuggestionsError && venueSuggestions.length === 0 && (
                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                No matching Gigrilla venues yet. You can still type a new venue name.
                                            </div>
                                        )}

                                        {!venueSuggestionsLoading && !venueSuggestionsError && venueSuggestions.length > 0 && (
                                            <ul className="max-h-60 divide-y divide-gray-100 overflow-auto">
                                                {venueSuggestions.map(suggestion => (
                                                    <li key={suggestion.id}>
                                                        <button
                                                            type="button"
                                                            className="w-full px-3 py-2 text-left hover:bg-gray-50"
                                                            onMouseDown={event => event.preventDefault()}
                                                            onClick={() => applyVenueSuggestion(suggestion)}
                                                        >
                                                            <p className="text-sm font-medium text-gray-900">{suggestion.name}</p>
                                                            <p className="text-xs text-gray-500">{suggestion.address || 'Address unavailable'}</p>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="venueAddress">Venue Address</Label>
                            <LocationAutocompleteInput
                                value={form.venueAddress}
                                placeholder="Start typing Venue address…"
                                onInputChange={value => update('venueAddress', value)}
                                onSelect={suggestion => update('venueAddress', suggestion.formatted)}
                                minQueryLength={2}
                                inputClassName="mt-1"
                                noResultsMessage="No matching addresses found. You can continue typing manually."
                            />
                        </div>
                    </div>

                    {/* Venue Contact */}
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <Globe className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold text-gray-900 text-base">How can we contact this Venue?</h3>
                        </div>

                        <InfoBox>
                            Gigrilla may contact the Venue to verify that this Gig is legitimate, and reserves the right to remove
                            this Gig from Gigrilla if it is found to be fraudulent or misleading in any way.
                        </InfoBox>
                        <InfoBox>
                            The following details are used for verification, linking accounts to members, and inviting non-members
                            to Gigrilla. We do not share or sell this information and contact details remain strictly private.
                        </InfoBox>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="venueContactName">Venue Contact Name</Label>
                                <Input
                                    id="venueContactName"
                                    placeholder="Start typing contact name…"
                                    value={form.venueContactName}
                                    onChange={e => update('venueContactName', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="venueContactEmail">Venue Contact Email</Label>
                                <Input
                                    id="venueContactEmail"
                                    type="email"
                                    placeholder="contact@company.com…"
                                    value={form.venueContactEmail}
                                    onChange={e => update('venueContactEmail', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Label>Venue Contact Phone</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        id="venueContactPhoneCode"
                                        placeholder="+Country code"
                                        value={form.venueContactPhoneCode}
                                        onChange={e => update('venueContactPhoneCode', e.target.value)}
                                        className="w-36 shrink-0"
                                    />
                                    <Input
                                        placeholder="Phone number…"
                                        value={form.venueContactPhone}
                                        onChange={e => update('venueContactPhone', e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Use any international dial code, e.g. +1, +44, +233, +971.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── LIVE STREAM LINK (Streaming only) ────────────── */}
            {isStreaming && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <Globe className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900 text-base">What is your Live Stream Link URL?</h3>
                    </div>
                    <div>
                        <Label htmlFor="liveStreamUrl">
                            {form.gigEventName || 'Your Gig'} Live Stream Link
                        </Label>
                        <Input
                            id="liveStreamUrl"
                            type="url"
                            placeholder="Type Live Stream Link URL…"
                            value={form.liveStreamUrl}
                            onChange={e => update('liveStreamUrl', e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </div>
            )}

            {/* ─── AGE RESTRICTIONS ─────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900 text-base">Age Restrictions for this Gig?</h3>
                </div>

                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="ageRestrictionMode"
                            checked={form.ageRestrictionMode === 'unknown'}
                            onChange={() => { update('ageRestrictionMode', 'unknown'); update('ageRestrictions', []) }}
                            className="mt-1 accent-purple-600"
                        />
                        <div>
                            <p className="text-sm font-medium text-gray-900">I don&apos;t know if entry to this Gig has age restrictions</p>
                            <p className="text-xs text-gray-500">No age will be advertised — this can be superseded by a Venue hosting this Gig.</p>
                        </div>
                    </label>

                    <div className="text-center text-xs font-bold text-gray-400 uppercase">— or —</div>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="ageRestrictionMode"
                            checked={form.ageRestrictionMode === 'has_restrictions'}
                            onChange={() => update('ageRestrictionMode', 'has_restrictions')}
                            className="mt-1 accent-purple-600"
                        />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Entry to this Gig has age restrictions</p>
                            <p className="text-xs text-gray-500">Multiple choice — this can be superseded by a Venue hosting this Gig.</p>
                        </div>
                    </label>
                </div>

                {form.ageRestrictionMode === 'has_restrictions' && (
                    <div className="ml-6 space-y-3">
                        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                            {AGE_OPTIONS.map(opt => (
                                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                                    <input
                                        type="checkbox"
                                        checked={form.ageRestrictions.includes(opt)}
                                        onChange={() => toggleArrayItem('ageRestrictions', opt)}
                                        className="accent-purple-600"
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                            <p className="font-medium">Age Display Preview</p>
                            <p className="mt-1">{ageDisplayPreview}</p>
                            <p className="mt-1 text-xs text-blue-800">
                                Rule: choose only &quot;All ages&quot; OR up to one &quot;Over&quot; and one &quot;Under&quot; option.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── TICKET ENTRY ─────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Ticket className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900 text-base">Ticket Entry for this Gig?</h3>
                </div>

                {/* Ticket mode (only for in-person) */}
                {isInPerson && (
                    <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="ticketMode"
                                checked={form.ticketMode === 'unknown'}
                                onChange={() => update('ticketMode', 'unknown')}
                                className="mt-1 accent-purple-600"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">I don&apos;t know how Tickets work for this Gig</p>
                                <p className="text-xs text-gray-500">This can be superseded by a Venue hosting this Gig.</p>
                            </div>
                        </label>
                        <div className="text-center text-xs font-bold text-gray-400 uppercase">— or —</div>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="ticketMode"
                                checked={form.ticketMode === 'known'}
                                onChange={() => update('ticketMode', 'known')}
                                className="mt-1 accent-purple-600"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">I know how Tickets work for this Gig</p>
                                <p className="text-xs text-gray-500">Multiple choice — this can be superseded by a Venue hosting this Gig.</p>
                            </div>
                        </label>
                    </div>
                )}

                {(form.ticketMode === 'known' || isStreaming) && (
                    <div className="space-y-6 pl-2">
                        {/* Free Ticket Options */}
                        <div className="space-y-2">
                            <p className="font-medium text-sm text-gray-900">Free Ticket Options:</p>
                            <div className="space-y-1">
                                {isInPerson && (
                                    <>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                                            <input type="checkbox" checked={form.freeTicketOptions.includes('free_entry_no_tickets')} onChange={() => toggleArrayItem('freeTicketOptions', 'free_entry_no_tickets')} className="accent-purple-600" />
                                            Free Entry Without Tickets
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                                            <input type="checkbox" checked={form.freeTicketOptions.includes('free_entry_venue_tickets')} onChange={() => toggleArrayItem('freeTicketOptions', 'free_entry_venue_tickets')} className="accent-purple-600" />
                                            Free Entry: Tickets At The Venue
                                        </label>
                                    </>
                                )}
                                <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                                    <input type="checkbox" checked={form.freeTicketOptions.includes('free_online_advance')} onChange={() => toggleArrayItem('freeTicketOptions', 'free_online_advance')} className="accent-purple-600" />
                                    Free Entry: Online Tickets In Advance
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                                    <input type="checkbox" checked={form.freeTicketOptions.includes('free_gigrilla_digital')} onChange={() => toggleArrayItem('freeTicketOptions', 'free_gigrilla_digital')} className="accent-purple-600" />
                                    Digital Tickets Available From Gigrilla
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                                    <input type="checkbox" checked={form.freeTicketOptions.includes('free_3rd_party')} onChange={() => toggleArrayItem('freeTicketOptions', 'free_3rd_party')} className="accent-purple-600" />
                                    Digital Tickets Available From 3rd Party
                                </label>
                            </div>
                        </div>

                        {/* Paid Ticket Options */}
                        <div className="space-y-2">
                            <p className="font-medium text-sm text-gray-900">Paid Ticket Options:</p>
                            <div className="space-y-2">
                                {isInPerson && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                                            <input type="checkbox" checked={form.paidTicketOptions.includes('paid_at_venue')} onChange={() => toggleArrayItem('paidTicketOptions', 'paid_at_venue')} className="accent-purple-600" />
                                            Tickets Sold At The Venue:
                                        </label>
                                        {form.paidTicketOptions.includes('paid_at_venue') && (
                                            <div className="flex items-center gap-1">
                                                <select value={form.ticketCurrency} onChange={e => update('ticketCurrency', e.target.value)} className="h-8 rounded border border-input px-2 text-sm">
                                                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                </select>
                                                <Input
                                                    type="number" step="0.01" min="0" placeholder="Price"
                                                    value={form.ticketPriceVenue} onChange={e => update('ticketPriceVenue', e.target.value)}
                                                    className="w-24 h-8"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                                        <input type="checkbox" checked={form.paidTicketOptions.includes('paid_online_advance')} onChange={() => toggleArrayItem('paidTicketOptions', 'paid_online_advance')} className="accent-purple-600" />
                                        Tickets Sold Online In Advance:
                                    </label>
                                    {form.paidTicketOptions.includes('paid_online_advance') && (
                                        <div className="flex items-center gap-1">
                                            <select value={form.ticketCurrency} onChange={e => update('ticketCurrency', e.target.value)} className="h-8 rounded border border-input px-2 text-sm">
                                                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                            <Input
                                                type="number" step="0.01" min="0" placeholder="Price"
                                                value={form.ticketPriceOnline} onChange={e => update('ticketPriceOnline', e.target.value)}
                                                className="w-24 h-8"
                                            />
                                        </div>
                                    )}
                                </div>
                                <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                                    <input type="checkbox" checked={form.paidTicketOptions.includes('paid_gigrilla_digital')} onChange={() => toggleArrayItem('paidTicketOptions', 'paid_gigrilla_digital')} className="accent-purple-600" />
                                    Digital Tickets Available From Gigrilla
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                                    <input type="checkbox" checked={form.paidTicketOptions.includes('paid_3rd_party')} onChange={() => toggleArrayItem('paidTicketOptions', 'paid_3rd_party')} className="accent-purple-600" />
                                    Digital Tickets Available From 3rd Party
                                </label>
                            </div>

                            {/* 3rd party link */}
                            {(form.freeTicketOptions.includes('free_3rd_party') || form.paidTicketOptions.includes('paid_3rd_party')) && (
                                <div className="mt-2">
                                    <Label htmlFor="thirdPartyTicketLink">Link to 3rd Party Online Tickets</Label>
                                    <Input
                                        id="thirdPartyTicketLink"
                                        type="url"
                                        placeholder="https://…"
                                        value={form.thirdPartyTicketLink}
                                        onChange={e => update('thirdPartyTicketLink', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Build Your Paid Ticket Options */}
                        {hasPaidTickets && (
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setExpandedTicketBuilder(!expandedTicketBuilder)}
                                    className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
                                >
                                    {expandedTicketBuilder ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    OPTIONAL: Build Your Paid Ticket Options
                                </button>
                                <p className="text-xs text-gray-500">
                                    Only enter Paid Ticket details if you know them and have permission from the Venue — these can be superseded by a Venue hosting this Gig.
                                </p>

                                {expandedTicketBuilder && (
                                    <div className="space-y-4 rounded-lg border border-gray-200 p-4 bg-gray-50/50">
                                        {/* Existing custom tickets */}
                                        {form.customTickets.map(ticket => (
                                            <div key={ticket.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm space-y-1">
                                                <div className="flex items-start justify-between">
                                                    <p className="font-semibold">Ticket: {ticket.name}</p>
                                                    <div className="flex gap-1">
                                                        <button type="button" onClick={() => removeCustomTicket(ticket.id)} className="text-red-500 hover:text-red-700">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p>Duration: {ticket.durationType.replace('_', ' ')}</p>
                                                <p>Admission: {ticket.admissionType.replace('_', ' & ')}</p>
                                                <p>Benefits: {ticket.benefits || '—'}</p>
                                                <p>Price: {CURRENCIES.find(c => c.value === ticket.currency)?.symbol}{ticket.price}</p>
                                            </div>
                                        ))}

                                        {/* Add new ticket form */}
                                        <div className="space-y-3">
                                            <div>
                                                <Label>Name your Ticket Type</Label>
                                                <Input
                                                    placeholder="Enter Ticket Name..."
                                                    value={newTicket.name}
                                                    onChange={e => setNewTicket(prev => ({ ...prev, name: e.target.value }))}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div>
                                                    <Label>Ticket Duration Type</Label>
                                                    <select
                                                        value={newTicket.durationType}
                                                        onChange={e => setNewTicket(prev => ({ ...prev, durationType: e.target.value as TicketOption['durationType'] }))}
                                                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                    >
                                                        <option value="one_gig">One Gig</option>
                                                        <option value="weekend">Weekend</option>
                                                        <option value="extended">Extended</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label>Ticket Admission Type</Label>
                                                    <select
                                                        value={newTicket.admissionType}
                                                        onChange={e => setNewTicket(prev => ({ ...prev, admissionType: e.target.value as TicketOption['admissionType'] }))}
                                                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                    >
                                                        <option value="general">General</option>
                                                        <option value="premium">Premium</option>
                                                        <option value="vip">VIP</option>
                                                        <option value="vip_backstage">VIP &amp; Back Stage</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Describe Ticket Benefits (160 chars max)</Label>
                                                <Input
                                                    placeholder="Standard admission to all public areas."
                                                    value={newTicket.benefits}
                                                    onChange={e => setNewTicket(prev => ({ ...prev, benefits: e.target.value.slice(0, 160) }))}
                                                    maxLength={160}
                                                    className="mt-1"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">{newTicket.benefits.length}/160</p>
                                            </div>
                                            <div className="flex gap-2 items-end">
                                                <div className="w-28">
                                                    <Label>Currency</Label>
                                                    <select
                                                        value={newTicket.currency}
                                                        onChange={e => setNewTicket(prev => ({ ...prev, currency: e.target.value }))}
                                                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                                                    >
                                                        {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex-1">
                                                    <Label>Price</Label>
                                                    <Input
                                                        type="number" step="0.01" min="0"
                                                        placeholder="0.00"
                                                        value={newTicket.price}
                                                        onChange={e => setNewTicket(prev => ({ ...prev, price: e.target.value }))}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addCustomTicket}
                                                    disabled={!newTicket.name.trim()}
                                                    className="shrink-0"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Add Ticket
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Ticket Availability */}
                                <div className="space-y-3 mt-4">
                                    <p className="text-sm font-medium text-gray-900">OPTIONAL: How Many Tickets Available (Total)?</p>
                                    <p className="text-xs text-gray-500">Only enter Ticket Availability details if you know them and have permission from the Venue.</p>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="radio" name="ticketAvailability" checked={form.ticketAvailability === 'skip'} onChange={() => update('ticketAvailability', 'skip')} className="accent-purple-600" />
                                            Skip Ticket Availability Details
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="radio" name="ticketAvailability" checked={form.ticketAvailability === 'full_venue_capacity'} onChange={() => update('ticketAvailability', 'full_venue_capacity')} className="accent-purple-600" />
                                            Ticket availability equals full venue capacity
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="radio" name="ticketAvailability" checked={form.ticketAvailability === 'less_than_full_venue_capacity'} onChange={() => update('ticketAvailability', 'less_than_full_venue_capacity')} className="accent-purple-600" />
                                            Less tickets available than full venue capacity
                                        </label>
                                        {form.ticketAvailability === 'less_than_full_venue_capacity' && (
                                            <div className="ml-6">
                                                <Input
                                                    type="number" min="1"
                                                    placeholder="Number of tickets available"
                                                    value={form.customTicketCount}
                                                    onChange={e => update('customTicketCount', e.target.value)}
                                                    className="w-48"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ─── 3. GIG ARTWORK ───────────────────────────────── */}
            <div className="space-y-4">
                <SectionHeading step={3} title="Add Gig Artwork" icon={ImageIcon} />
                <p className="text-sm text-gray-600">
                    <strong>{form.gigEventName || 'Your Gig'}</strong> — this can be superseded by a Venue hosting this Gig.
                    This is your Gig Artwork across Gigrilla.
                </p>
                <p className="text-xs text-gray-500">
                    Artwork must be: .jpg (preferred) or .png — a 1:1 square image with min. 3000×3000 pixels, max. 6000×6000 pixels, max. 10MB file size, min. 72 DPI, max. 300 DPI.
                </p>

                {form.artworkPreview ? (
                    <div className="space-y-3">
                        <div className="relative inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={form.artworkPreview}
                                alt="Gig artwork preview"
                                className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={removeArtwork}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <div>
                            <Label htmlFor="artworkCaption">Write a Caption for your Gig Artwork</Label>
                            <Input
                                id="artworkCaption"
                                placeholder="Write a Caption for your Gig Artwork…"
                                value={form.artworkCaption}
                                onChange={e => update('artworkCaption', e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
                    >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Drag &amp; Drop or Upload From Device</p>
                        <p className="text-xs text-gray-500 mt-1">.jpg or .png, square (3000×3000 to 6000×6000), max 10MB</p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleArtworkSelect}
                    className="hidden"
                />
            </div>

            {/* ─── 4. SCHEDULE PUBLISHING ───────────────────────── */}
            <div className="space-y-4">
                <SectionHeading step={4} title="Choose When To Schedule Gig Publishing" icon={Clock} />
                <p className="text-sm text-gray-600">
                    <strong>{form.gigEventName || 'Your Gig'}</strong> — When do you want this Gig to be visible to the public?
                    This will determine when the Gig appears on Gigrilla GigFinder, your Artist profile, and the Venue profile.
                </p>

                <div className="space-y-3">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <button
                            type="button"
                            onClick={() => setShowFanPromotionInfo(prev => !prev)}
                            className="flex w-full items-center justify-between text-left"
                        >
                            <span className="text-sm font-semibold text-blue-900">
                                Info: Separate public display from fan promotion
                            </span>
                            {showFanPromotionInfo ? <ChevronUp className="w-4 h-4 text-blue-700" /> : <ChevronDown className="w-4 h-4 text-blue-700" />}
                        </button>
                        {showFanPromotionInfo && (
                            <div className="mt-3 space-y-2 text-sm text-blue-900">
                                <p>
                                    Public Display: on the agreed publication date, official venue gig information appears across GigFinder, artist pages, and venue pages.
                                </p>
                                <p>
                                    Fan Promotion: after public launch, artists control fan communications: when to send, who receives (including region targeting), and which artwork to use (artist artwork or venue artwork).
                                </p>
                            </div>
                        )}
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="publishMode"
                            checked={form.publishMode === 'immediate'}
                            onChange={() => update('publishMode', 'immediate')}
                            className="mt-1 accent-purple-600"
                        />
                        <div>
                            <p className="text-sm font-medium text-gray-900">As soon as I publish it, publicise this Gig everywhere.</p>
                        </div>
                    </label>
                    <div className="text-center text-xs font-bold text-gray-400 uppercase">— or —</div>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="publishMode"
                            checked={form.publishMode === 'scheduled'}
                            onChange={() => update('publishMode', 'scheduled')}
                            className="mt-1 accent-purple-600"
                        />
                        <div>
                            <p className="text-sm font-medium text-gray-900">After I publish it, hide the details from the public until:</p>
                        </div>
                    </label>

                    {form.publishMode === 'scheduled' && (
                        <div className="ml-6 grid gap-3 sm:grid-cols-2 max-w-sm">
                            <div>
                                <Label htmlFor="publishDate">Date</Label>
                                <Input
                                    id="publishDate"
                                    type="date"
                                    value={form.publishDate}
                                    onChange={e => update('publishDate', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="publishTime">Time</Label>
                                <Input
                                    id="publishTime"
                                    type="time"
                                    value={form.publishTime}
                                    onChange={e => update('publishTime', e.target.value)}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Your Gig&apos;s local time</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── 5. PUBLISH ───────────────────────────────────── */}
            <div className="space-y-4">
                <SectionHeading step={5} title="Publish This Gig" icon={Megaphone} />
                <p className="text-sm text-gray-600">
                    <strong>{form.gigEventName || 'Your Gig'}</strong>
                </p>

                <div className="rounded-lg bg-purple-50 border border-purple-200 p-4 text-sm text-purple-800 space-y-2">
                    <p>When you publish this Gig, we&apos;ll:</p>
                    <ul className="list-disc ml-4 space-y-1">
                        <li>Add it to your Artist Profile Upcoming Gig List</li>
                        <li>Add it to Gigrilla GigFinder</li>
                        <li>Show the public gig listing based on your publish timing selection</li>
                        <li>Keep fan communications under your control after the public listing is live</li>
                        {isInPerson && (
                            <li>Use official venue data as the public source of truth when a venue override exists</li>
                        )}
                    </ul>
                    <p className="mt-2">
                        🤫 <strong>Publishing mode:</strong>{' '}
                        {form.publishMode === 'immediate'
                            ? 'Publish immediately — visible everywhere right away.'
                            : form.publishDate
                                ? `Scheduled to be visible on ${form.publishDate} at ${form.publishTime || '00:00'}.`
                                : 'Scheduled — please set a date above.'
                        }
                    </p>
                    <p>
                        <strong>Fan promotion:</strong> artist updates are sent when you choose from fan comms controls, not automatically at publish.
                    </p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 px-8"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {isEditMode ? 'Saving...' : 'Publishing...'}
                            </>
                        ) : (
                            <>
                                <Megaphone className="w-4 h-4 mr-2" />
                                {isEditMode ? 'SAVE GIG CHANGES' : 'PUBLISH THIS GIG'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    )
}
