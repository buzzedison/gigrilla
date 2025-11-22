"use client"

import { useState, useEffect } from 'react'
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
  data: MapPoint[] | string
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

  useEffect(() => {
    loadArtistProfile()
  }, [user])

  const loadArtistProfile = async () => {
    try {
      setLoading(true)
      
      // Load artist profile
      const profileResponse = await fetch('/api/artist-profile')
      let profileData = null
      if (profileResponse.ok) {
        const profileResult = await profileResponse.json()
        profileData = profileResult.data
        setArtistProfile(profileData)
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
      
      // Set base location coordinates (placeholder - would geocode in real implementation)
      if (profileData?.base_location_lat && profileData?.base_location_lon) {
        setBaseLocationCoords({
          lat: profileData.base_location_lat,
          lng: profileData.base_location_lon
        })
      } else {
        // Default to London if no coordinates
        setBaseLocationCoords({ lat: 51.5074, lng: -0.1278 })
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
      
      // All migrations have been run - enable saving all fields
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          minimum_set_length: artistProfile?.minimum_set_length || 30,
          maximum_set_length: artistProfile?.maximum_set_length || 120,
          local_gig_fee: artistProfile?.local_gig_fee || 0,
          local_gig_timescale: artistProfile?.local_gig_timescale || 30,
          wider_gig_fee: artistProfile?.wider_gig_fee || 0,
          wider_gig_timescale: artistProfile?.wider_gig_timescale || 30,
          wider_fixed_logistics_fee: artistProfile?.wider_fixed_logistics_fee || 0,
          wider_negotiated_logistics: artistProfile?.wider_negotiated_logistics || false,
          local_gig_area: localGigZone ? JSON.stringify(localGigZone) : null,
          wider_gig_area: widerGigZone ? JSON.stringify(widerGigZone) : null
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
        local_gig_fee: prev?.local_gig_fee || 0,
        local_gig_timescale: prev?.local_gig_timescale || 30,
        wider_gig_fee: prev?.wider_gig_fee || 0,
        wider_gig_timescale: prev?.wider_gig_timescale || 30,
        wider_fixed_logistics_fee: prev?.wider_fixed_logistics_fee || 0,
        wider_negotiated_logistics: prev?.wider_negotiated_logistics || false,
        // Preserve map zones
        local_gig_area: prev?.local_gig_area || null,
        wider_gig_area: prev?.wider_gig_area || null
      }))
      showNotification('success', 'Gig ability settings saved successfully!')
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
      <Card>
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
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/artist-dashboard?section=profile'}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Manage
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>To update your base location, go to <strong>Basic Artist Details</strong> and edit your profile information.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artist Set Lengths */}
      <Card>
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
      <Card>
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
            {/* Minimum Local Gig Fee */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Minimum Local Gig Fee
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <span className="text-lg font-medium text-gray-900 mr-2">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={artistProfile?.local_gig_fee || 0}
                    onChange={(e) => 
                      setArtistProfile(prev => prev ? { ...prev, local_gig_fee: parseFloat(e.target.value) || 0 } : null)
                    }
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <span className="text-gray-600">per</span>
                <Select
                  value={(artistProfile?.local_gig_timescale || 30).toString()}
                  onValueChange={(value) => 
                    setArtistProfile(prev => prev ? { ...prev, local_gig_timescale: parseInt(value) } : null)
                  }
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
              <div className="text-sm text-gray-600">
                £{(artistProfile?.local_gig_fee || 0).toFixed(2)} per {GIG_TIME_OPTIONS.find(opt => opt.value === (artistProfile?.local_gig_timescale || 30))?.label} set on stage.
              </div>
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
      <Card>
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
            {/* Minimum Wider Gig Fee */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Minimum Wider Gig Fee
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <span className="text-lg font-medium text-gray-900 mr-2">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={artistProfile?.wider_gig_fee || 0}
                    onChange={(e) => 
                      setArtistProfile(prev => prev ? { ...prev, wider_gig_fee: parseFloat(e.target.value) || 0 } : null)
                    }
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <span className="text-gray-600">per</span>
                <Select
                  value={(artistProfile?.wider_gig_timescale || 30).toString()}
                  onValueChange={(value) => 
                    setArtistProfile(prev => prev ? { ...prev, wider_gig_timescale: parseInt(value) } : null)
                  }
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
            </div>

            {/* Logistics Fees */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Logistics Fee Options:
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">+</span>
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-900 mr-2">£</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={artistProfile?.wider_fixed_logistics_fee || 0}
                      onChange={(e) => 
                        setArtistProfile(prev => prev ? { ...prev, wider_fixed_logistics_fee: parseFloat(e.target.value) || 0 } : null)
                      }
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <span className="text-gray-600">Per-Gig Fixed Logistics Fee - this covers any travel, freight, accommodation, meals.</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">+</span>
                  <input
                    type="checkbox"
                    checked={artistProfile?.wider_negotiated_logistics || false}
                    onChange={(e) => 
                      setArtistProfile(prev => prev ? { ...prev, wider_negotiated_logistics: e.target.checked } : null)
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-600">Negotiated Gig-by-Gig Logistics Fee - this covers any travel, freight, accommodation, meals.</span>
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
