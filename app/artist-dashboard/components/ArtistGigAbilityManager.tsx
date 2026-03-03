"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useAuth } from '../../../lib/auth-context'
import { MapPin, Clock, Edit3, CheckCircle, X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { GigAbilityMap } from './GigAbilityMap'

interface ArtistProfile {
  id: string
  base_location?: string
  base_location_lat?: number | string | null
  base_location_lon?: number | string | null
  stage_name?: string
  minimum_set_length?: number
  maximum_set_length?: number
  local_gig_fee?: number
  local_gig_timescale?: number
  wider_gig_fee?: number
  wider_gig_timescale?: number
  wider_fixed_logistics_fee?: number
  wider_negotiated_logistics?: boolean
  local_gig_area?: {
  type: string
  coordinates?: number[][]
  radius?: number
  center?: [number, number]
}
  wider_gig_area?: {
  type: string
  coordinates?: number[][]
  radius?: number
  center?: [number, number]
}
  hometown_country?: string | null
  location_details?: Record<string, unknown> | null
}

interface LocationDetails {
  city?: string
  state?: string
  country?: string
}

interface MapPoint {
  lat: number
  lng: number
}

interface MapZone {
  type: 'radius' | 'polygon' | 'country'
  data: MapPoint[] | string | string[]
  radius?: number
}

interface Notification {
  type: 'success' | 'error'
  message: string
  visible: boolean
}

const TIME_OPTIONS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1hr', value: 60 },
  { label: '1hr15m', value: 75 },
  { label: '1hr30m', value: 90 },
  { label: '1hr45m', value: 105 },
  { label: '2hr', value: 120 },
  { label: '2hr15m', value: 135 },
  { label: '2hr30m', value: 150 },
  { label: '3hr', value: 180 }
]

const GIG_TIME_OPTIONS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '60m', value: 60 }
]

const CURRENCY_OPTIONS = [
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'GHS', symbol: 'GH₵', label: 'GHS (GH₵)' },
  { code: 'NGN', symbol: '₦', label: 'NGN (₦)' },
  { code: 'ZAR', symbol: 'R', label: 'ZAR (R)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' }
]

const COUNTRY_CURRENCY_FALLBACKS: Record<string, string> = {
  'united kingdom': 'GBP',
  'uk': 'GBP',
  'great britain': 'GBP',
  'england': 'GBP',
  'wales': 'GBP',
  'scotland': 'GBP',
  'united states': 'USD',
  'usa': 'USD',
  'us': 'USD',
  'canada': 'CAD',
  'australia': 'AUD',
  'ghana': 'GHS',
  'nigeria': 'NGN',
  'south africa': 'ZAR',
  'japan': 'JPY'
}

const getCurrencySymbol = (currencyCode: string) => {
  return CURRENCY_OPTIONS.find((currency) => currency.code === currencyCode)?.symbol || currencyCode
}

const getDefaultCurrencyByCountry = (country?: string | null) => {
  if (!country) return 'GBP'
  const normalized = country.trim().toLowerCase()
  return COUNTRY_CURRENCY_FALLBACKS[normalized] || 'GBP'
}

const clampNonNegativeNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? fallback))
  if (!Number.isFinite(parsed)) return fallback
  return parsed < 0 ? 0 : parsed
}

export function ArtistGigAbilityManager() {
  const { user } = useAuth()
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [locationDetails, setLocationDetails] = useState<LocationDetails>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [localGigZone, setLocalGigZone] = useState<MapZone | null>(null)
  const [widerGigZone, setWiderGigZone] = useState<MapZone | null>(null)
  const [baseLocationCoords, setBaseLocationCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [localGigCurrency, setLocalGigCurrency] = useState('GBP')
  const [widerGigCurrency, setWiderGigCurrency] = useState('GBP')
  const [logisticsCurrency, setLogisticsCurrency] = useState('GBP')
  const [baseGigCurrency, setBaseGigCurrency] = useState('GBP')
  const [baseGigFee, setBaseGigFee] = useState(0)
  const [baseGigTimescale, setBaseGigTimescale] = useState(30)
  const [logisticsMode, setLogisticsMode] = useState<'fixed' | 'negotiated'>('fixed')

  useEffect(() => {
    loadArtistProfile()
  }, [user])

  const loadArtistProfile = async () => {
    try {
      setLoading(true)
      
      // Load artist profile
      const profileResponse = await fetch('/api/artist-profile')
      let profileData = null
      let hasSavedCurrencyConfig = false
      let hasHomeCountrySignal = false
      if (profileResponse.ok) {
        const profileResult = await profileResponse.json()
        profileData = profileResult.data
        setArtistProfile(profileData)

        const rawLocationDetails = (
          profileData?.location_details &&
          typeof profileData.location_details === 'object' &&
          !Array.isArray(profileData.location_details)
        ) ? profileData.location_details as Record<string, unknown> : {}
        const pricingConfig = (
          rawLocationDetails.gig_pricing &&
          typeof rawLocationDetails.gig_pricing === 'object' &&
          !Array.isArray(rawLocationDetails.gig_pricing)
        ) ? rawLocationDetails.gig_pricing as Record<string, unknown> : {}
        const profileCountry = typeof rawLocationDetails.country === 'string'
          ? rawLocationDetails.country
          : null
        hasHomeCountrySignal = Boolean(profileCountry || profileData?.hometown_country)

        const fallbackCurrency = getDefaultCurrencyByCountry(profileCountry || profileData?.hometown_country)
        const savedLocalCurrency = typeof pricingConfig.local_currency === 'string' ? pricingConfig.local_currency : null
        const savedWiderCurrency = typeof pricingConfig.wider_currency === 'string' ? pricingConfig.wider_currency : null
        const savedLogisticsCurrency = typeof pricingConfig.logistics_currency === 'string' ? pricingConfig.logistics_currency : null
        const savedBaseCurrency = typeof pricingConfig.base_currency === 'string' ? pricingConfig.base_currency : null
        const savedBaseFee = typeof pricingConfig.base_fee === 'number'
          ? pricingConfig.base_fee
          : Number.parseFloat(String(pricingConfig.base_fee ?? '0'))
        const savedBaseTimescale = typeof pricingConfig.base_timescale === 'number'
          ? pricingConfig.base_timescale
          : Number.parseInt(String(pricingConfig.base_timescale ?? '30'), 10)
        const savedLogisticsMode = typeof pricingConfig.logistics_mode === 'string'
          ? pricingConfig.logistics_mode
          : null
        hasSavedCurrencyConfig = Boolean(savedLocalCurrency || savedWiderCurrency || savedLogisticsCurrency)

        setLocalGigCurrency(savedLocalCurrency || fallbackCurrency)
        setWiderGigCurrency(savedWiderCurrency || fallbackCurrency)
        setLogisticsCurrency(savedLogisticsCurrency || savedWiderCurrency || fallbackCurrency)
        setBaseGigCurrency(savedBaseCurrency || savedLocalCurrency || fallbackCurrency)
        setBaseGigFee(
          Number.isFinite(savedBaseFee) && savedBaseFee >= 0
            ? savedBaseFee
            : clampNonNegativeNumber(profileData?.local_gig_fee ?? profileData?.wider_gig_fee, 0)
        )
        setBaseGigTimescale(Number.isFinite(savedBaseTimescale) && savedBaseTimescale > 0 ? savedBaseTimescale : 30)
        setLogisticsMode(
          savedLogisticsMode === 'negotiated' || profileData?.wider_negotiated_logistics
            ? 'negotiated'
            : 'fixed'
        )
      }
      
      // Load fan profile data for location details (same as ArtistCrewManager)
      const fanProfileResponse = await fetch('/api/fan-profile')
      let fanProfileData = null
      if (fanProfileResponse.ok) {
        const fanResult = await fanProfileResponse.json()
        fanProfileData = fanResult.data
        console.log('Fan Profile Data:', fanProfileData)
        
        // Set location details from fan profile
        if (fanProfileData?.location_details) {
          setLocationDetails(fanProfileData.location_details)
          if (!profileData?.location_details || (!hasSavedCurrencyConfig && !hasHomeCountrySignal)) {
            const fallbackCurrency = getDefaultCurrencyByCountry(fanProfileData.location_details.country)
            setLocalGigCurrency(fallbackCurrency)
            setWiderGigCurrency(fallbackCurrency)
            setLogisticsCurrency(fallbackCurrency)
            setBaseGigCurrency(fallbackCurrency)
          }
        }
      } else {
        console.log('Fan Profile Response:', fanProfileResponse.status)
      }
      
      console.log('Location Details:', fanProfileData?.location_details)
      
      // Initialize map zones from profile data
      if (profileData?.local_gig_area) {
        try {
          setLocalGigZone(typeof profileData.local_gig_area === 'string' 
            ? JSON.parse(profileData.local_gig_area) 
            : profileData.local_gig_area)
        } catch (e) {
          console.error('Error parsing local gig area:', e)
        }
      }
      
      if (profileData?.wider_gig_area) {
        try {
          setWiderGigZone(typeof profileData.wider_gig_area === 'string' 
            ? JSON.parse(profileData.wider_gig_area) 
            : profileData.wider_gig_area)
        } catch (e) {
          console.error('Error parsing wider gig area:', e)
        }
      }
      
      const lat = profileData?.base_location_lat !== undefined && profileData?.base_location_lat !== null
        ? (typeof profileData.base_location_lat === 'number' ? profileData.base_location_lat : parseFloat(profileData.base_location_lat))
        : NaN
      const lon = profileData?.base_location_lon !== undefined && profileData?.base_location_lon !== null
        ? (typeof profileData.base_location_lon === 'number' ? profileData.base_location_lon : parseFloat(profileData.base_location_lon))
        : NaN

      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        setBaseLocationCoords({
          lat,
          lng: lon
        })
      } else {
        setBaseLocationCoords(null)
      }
      
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true })
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, visible: false } : null)
    }, 5000)
  }

  const saveGigAbility = async () => {
    try {
      setSaving(true)

      const existingLocationDetails = (
        artistProfile?.location_details &&
        typeof artistProfile.location_details === 'object' &&
        !Array.isArray(artistProfile.location_details)
      ) ? artistProfile.location_details as Record<string, unknown> : {}
      const existingGigPricing = (
        existingLocationDetails.gig_pricing &&
        typeof existingLocationDetails.gig_pricing === 'object' &&
        !Array.isArray(existingLocationDetails.gig_pricing)
      ) ? existingLocationDetails.gig_pricing as Record<string, unknown> : {}
      const normalizedBaseFee = clampNonNegativeNumber(baseGigFee, 0)
      const fixedLogisticsFee = logisticsMode === 'fixed'
        ? clampNonNegativeNumber(artistProfile?.wider_fixed_logistics_fee, 0)
        : 0
      const mergedLocationDetails = {
        ...existingLocationDetails,
        gig_pricing: {
          ...existingGigPricing,
          base_currency: baseGigCurrency,
          base_fee: normalizedBaseFee,
          base_timescale: baseGigTimescale,
          local_currency: localGigCurrency,
          wider_currency: widerGigCurrency,
          logistics_currency: logisticsCurrency,
          logistics_mode: logisticsMode
        }
      }
      
      // All migrations have been run - enable saving all fields
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          minimum_set_length: artistProfile?.minimum_set_length || 30,
          maximum_set_length: artistProfile?.maximum_set_length || 120,
          local_gig_fee: normalizedBaseFee,
          local_gig_timescale: baseGigTimescale,
          wider_gig_fee: normalizedBaseFee,
          wider_gig_timescale: baseGigTimescale,
          wider_fixed_logistics_fee: fixedLogisticsFee,
          wider_negotiated_logistics: logisticsMode === 'negotiated',
          local_gig_area: localGigZone || null,
          wider_gig_area: widerGigZone || null,
          location_details: mergedLocationDetails
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save gig ability settings')
      }

      const result = await response.json()
      // Preserve all gig ability values since API might not return them all
      setArtistProfile(prev => ({
        ...result.data,
        // Preserve set lengths
        minimum_set_length: prev?.minimum_set_length || 30,
        maximum_set_length: prev?.maximum_set_length || 120,
        // Preserve gig fees and settings
        local_gig_fee: normalizedBaseFee,
        local_gig_timescale: baseGigTimescale,
        wider_gig_fee: normalizedBaseFee,
        wider_gig_timescale: baseGigTimescale,
        wider_fixed_logistics_fee: fixedLogisticsFee,
        wider_negotiated_logistics: logisticsMode === 'negotiated',
        // Preserve map zones
        local_gig_area: localGigZone || null,
        wider_gig_area: widerGigZone || null,
        location_details: mergedLocationDetails
      }))
      showNotification('success', 'Gig ability settings saved successfully!')
      window.dispatchEvent(new CustomEvent('artist-profile-updated', { detail: { source: 'gigability' } }))
    } catch (error) {
      console.error('Error saving gig ability:', error)
      showNotification('error', 'Failed to save gig ability settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const formatLocation = () => {
    // Use same logic as ArtistCrewManager: prioritize artist base_location, fallback to fan profile location
    const baseLocation = artistProfile?.base_location
    if (baseLocation) {
      return baseLocation
    }
    
    // Fallback to fan profile location details
    const parts = []
    if (locationDetails.city) parts.push(locationDetails.city)
    if (locationDetails.state) parts.push(locationDetails.state)
    if (locationDetails.country) parts.push(locationDetails.country)
    return parts.join(', ') || 'Not set'
  }

  const getTimeLabel = (minutes?: number) => {
    if (!minutes) return '30m' // Default to 30m instead of 'Not set'
    const option = TIME_OPTIONS.find(opt => opt.value === minutes)
    return option ? option.label : `${minutes}m`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Beautiful Notification */}
      {notification && notification.visible && (
        <div className={cn(
          "p-4 rounded-lg border transition-all duration-300 transform relative",
          notification.type === 'success' && "bg-green-50 border-green-200 text-green-800",
          notification.type === 'error' && "bg-red-50 border-red-200 text-red-800"
        )}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4 opacity-60" />
            </button>
          </div>
        </div>
      )}

      {/* Artist Base Location */}
      <Card id="artist-gigability-base" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <MapPin className="w-5 h-5" />
            Artist Base Location
          </CardTitle>
          <p className="text-sm text-gray-600">
            This location is used to determine your gig availability and travel preferences.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-purple-900">Current Base Location</h4>
                  <p className="text-lg text-purple-700 mt-1">{formatLocation()}</p>
                  <div className="text-sm text-purple-600 mt-1">
                    Pre-populated from your Artist Profile (or Fan Profile if not set)
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Link href="/artist-dashboard?section=profile&subSection=details">
                    <Edit3 className="w-4 h-4" />
                    Manage
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>
                To update your base location, go to{' '}
                <Link
                  href="/artist-dashboard?section=profile&subSection=details"
                  className="font-semibold text-purple-700 hover:text-purple-800 underline underline-offset-2"
                >
                  Basic Artist Details
                </Link>{' '}
                and edit your profile information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artist Set Lengths */}
      <Card id="artist-gigability-sets" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Clock className="w-5 h-5" />
            Artist Set Lengths
          </CardTitle>
          <p className="text-sm text-gray-600">
            Your Stage Timing:
          </p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ This is displayed on your Artist Profile to show how long you are willing to play a set for.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Minimum Set Length */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Minimum Set Length:
              </label>
              <Select
                value={(artistProfile?.minimum_set_length || 30).toString()}
                onValueChange={(value) => 
                  setArtistProfile(prev => prev ? { ...prev, minimum_set_length: parseInt(value) } : null)
                }
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Choose minimum set length" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label} performing on stage
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Maximum Set Length */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Maximum Set Length:
              </label>
              <Select
                value={(artistProfile?.maximum_set_length || 120).toString()}
                onValueChange={(value) => 
                  setArtistProfile(prev => prev ? { ...prev, maximum_set_length: parseInt(value) } : null)
                }
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Choose maximum set length" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label} performing on stage
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Settings Display */}
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Current Settings:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Minimum Set Length</p>
                  <p className="text-lg font-medium text-gray-900">
                    {getTimeLabel(artistProfile?.minimum_set_length || 30)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Maximum Set Length</p>
                  <p className="text-lg font-medium text-gray-900">
                    {getTimeLabel(artistProfile?.maximum_set_length || 120)}
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={saveGigAbility}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saving ? 'Saving...' : 'Save Set Length Settings'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artist Local Gig Area */}
      <Card id="artist-gigability-fees" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Clock className="w-5 h-5" />
            Gig Fees
          </CardTitle>
          <p className="text-sm text-gray-600">
            Set your baseline performance fee once. Local and wider gig sections use this same base fee.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="max-w-xs space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Currency</label>
              <Select value={baseGigCurrency} onValueChange={(value) => {
                setBaseGigCurrency(value)
                setLocalGigCurrency(value)
                setWiderGigCurrency(value)
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg font-medium text-gray-900">{getCurrencySymbol(baseGigCurrency)}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={baseGigFee}
                onChange={(e) => setBaseGigFee(clampNonNegativeNumber(e.target.value, 0))}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-600">per</span>
              <Select
                value={baseGigTimescale.toString()}
                onValueChange={(value) => setBaseGigTimescale(Number.parseInt(value, 10) || 30)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GIG_TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-gray-600">set on stage.</span>
            </div>

            <p className="text-sm text-gray-600">
              Base Fee Preview: {getCurrencySymbol(baseGigCurrency)}{baseGigFee.toFixed(2)} per {GIG_TIME_OPTIONS.find(opt => opt.value === baseGigTimescale)?.label} set.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card id="artist-gigability-local" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <MapPin className="w-5 h-5" />
            Artist Local Gig Area
          </CardTitle>
          <p className="text-sm text-gray-600">
            Your Local Gig Fee:
          </p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ This is displayed on your Artist Profile so Venues know if they can afford you.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
              Local gigs use your base fee: <strong>{getCurrencySymbol(baseGigCurrency)}{baseGigFee.toFixed(2)} per {GIG_TIME_OPTIONS.find(opt => opt.value === baseGigTimescale)?.label} set.</strong>
            </div>

            {/* Local Map */}
            <GigAbilityMap
              mapId="local-gig-map"
              title="Local Map: Draw-a-Zone, or Create a Radius from your Artist Base Location:"
              description="This is where you're willing to perform a Gig within a set fee, without charging additional fees to cover travel, freight, accommodation and meals."
              value={localGigZone}
              onChange={setLocalGigZone}
              baseLocation={baseLocationCoords || undefined}
            />
          </div>
        </CardContent>
      </Card>

      {/* Artist Wider Gig Area */}
      <Card id="artist-gigability-wider" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <MapPin className="w-5 h-5" />
            Artist Wider Gig Area
          </CardTitle>
          <p className="text-sm text-gray-600">
            Your Wider Gig Fee:
          </p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ This is displayed on your Artist Profile so Venues know if they can afford you.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
              Wider gigs use your base fee: <strong>{getCurrencySymbol(baseGigCurrency)}{baseGigFee.toFixed(2)} per {GIG_TIME_OPTIONS.find(opt => opt.value === baseGigTimescale)?.label} set</strong>, with optional logistics below.
            </div>

            {/* Logistics Fees */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Logistics Fee Options:
              </label>
              <div className="space-y-3">
                <div className="max-w-xs space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Logistics Currency</label>
                  <Select value={logisticsCurrency} onValueChange={setLogisticsCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="wider-logistics-mode"
                      checked={logisticsMode === 'fixed'}
                      onChange={() => setLogisticsMode('fixed')}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    Fixed logistics fee
                  </label>
                  <div className="flex items-center gap-4 pl-6">
                    <span className="text-gray-600">+</span>
                    <div className="flex items-center">
                      <span className="text-lg font-medium text-gray-900 mr-2">{getCurrencySymbol(logisticsCurrency)}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={artistProfile?.wider_fixed_logistics_fee || 0}
                        onChange={(e) =>
                          setArtistProfile(prev => prev ? { ...prev, wider_fixed_logistics_fee: clampNonNegativeNumber(e.target.value, 0) } : null)
                        }
                        disabled={logisticsMode !== 'fixed'}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                    <span className="text-gray-600">Per-Gig Fixed Logistics Fee - covers travel, freight, accommodation, meals.</span>
                  </div>
                </div>
                <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="wider-logistics-mode"
                      checked={logisticsMode === 'negotiated'}
                      onChange={() => setLogisticsMode('negotiated')}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    Negotiated logistics fee
                  </label>
                  <p className="pl-6 text-sm text-gray-600">
                    Fees are agreed Gig-by-Gig for travel, freight, accommodation, and meals.
                  </p>
                </div>
              </div>
            </div>

            {/* Wider Map */}
            <GigAbilityMap
              mapId="wider-gig-map"
              title="Wider Map: Draw-a-Zone, or Create a Radius from your Artist Base Location, or Select Entire Countries:"
              description="This is where you're willing to perform a Gig for a set fee, plus an additional fee to cover your travel, freight, accommodation and food & drink."
              value={widerGigZone}
              onChange={setWiderGigZone}
              baseLocation={baseLocationCoords || undefined}
            />
          </div>
        </CardContent>
      </Card>

      {/* Master Save Button */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Save All Gig Ability Settings</h3>
              <p className="text-sm text-purple-700 mt-1">
                Save your set lengths, fees, and gig area zones to your artist profile
              </p>
            </div>
            <Button
              onClick={saveGigAbility}
              disabled={saving}
              size="lg"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Save All Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
