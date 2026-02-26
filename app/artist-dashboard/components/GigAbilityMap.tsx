"use client"

import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
// Card imports removed - not used
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { MapPin, Maximize2, Move, Globe, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { DrawingControls } from './DrawingControls'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
// Circle, Polygon, Marker, FeatureGroup imports removed - not currently used
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

interface MapPoint {
  lat: number
  lng: number
}

interface MapZone {
  type: 'radius' | 'polygon' | 'country'
  data: MapPoint[] | string | string[]
  radius?: number // for radius type
}

interface GigAbilityMapProps {
  title: string
  description: string
  value: MapZone | null
  onChange: (zone: MapZone | null) => void
  baseLocation?: { lat: number; lng: number }
  mapId?: string // Unique ID for the map container
}

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NO', name: 'Norway' },
  { code: 'SE', name: 'Sweden' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' }
]

export function GigAbilityMap({ title, description, value, onChange, baseLocation, mapId = 'gig-map' }: GigAbilityMapProps) {
  const [mode, setMode] = useState<'radius' | 'polygon' | 'country'>('radius')
  const [radius] = useState(50) // km
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [, setIsDrawing] = useState(false)
  const [polygonPoints, setPolygonPoints] = useState<MapPoint[]>([])

  // Initialize map centered on base location
  useEffect(() => {
    // TODO: Initialize Leaflet map here
    // Example Leaflet initialization:
    // const map = L.map(mapRef.current).setView([baseLocation.lat, baseLocation.lng], 10)
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    
    if (baseLocation) {
      console.log('Map centered on base location:', baseLocation)
    } else {
      console.log('No base location set - using default center')
    }
  }, [baseLocation])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleRadiusChange = () => {
    if (!baseLocation) return
    
    const newZone: MapZone = {
      type: 'radius',
      data: [baseLocation],
      radius: radius
    }
    onChange(newZone)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handlePolygonComplete = () => {
    if (polygonPoints.length < 3) {
      alert('Please draw a complete area with at least 3 points')
      return
    }

    const newZone: MapZone = {
      type: 'polygon',
      data: polygonPoints
    }
    onChange(newZone)
    setPolygonPoints([])
    setIsDrawing(false)
  }

  const handleCountrySelect = () => {
    if (!selectedCountry) return

    const nextCountries = selectedCountries.includes(selectedCountry)
      ? selectedCountries
      : [...selectedCountries, selectedCountry]
    setSelectedCountries(nextCountries)

    const newZone: MapZone = {
      type: 'country',
      data: nextCountries
    }
    onChange(newZone)
    setSelectedCountry('')
  }

  const handleCountryRemove = (countryCode: string) => {
    const nextCountries = selectedCountries.filter((code) => code !== countryCode)
    setSelectedCountries(nextCountries)
    if (nextCountries.length === 0) {
      onChange(null)
      return
    }
    onChange({
      type: 'country',
      data: nextCountries
    })
  }

  const clearMap = () => {
    onChange(null)
    setPolygonPoints([])
    setIsDrawing(false)
    setSelectedCountry('')
    setSelectedCountries([])
  }

  useEffect(() => {
    if (value?.type !== 'country') return
    const countries = Array.isArray(value.data)
      ? value.data
      : typeof value.data === 'string'
        ? [value.data]
        : []
    setSelectedCountries(countries.filter((country): country is string => typeof country === 'string' && country.length > 0))
  }, [value])

  // Polygon drawing will be handled by Leaflet.draw plugin in future enhancement
  // For now, users can use the radius mode or manually set polygon points

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {value && (
          <Button variant="outline" size="sm" onClick={clearMap}>
            Clear
          </Button>
        )}
      </div>

      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'radius' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('radius')}
        >
          <Maximize2 className="w-4 h-4 mr-1" />
          Create Radius
        </Button>
        <Button
          variant={mode === 'polygon' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('polygon')}
        >
          <Move className="w-4 h-4 mr-1" />
          Draw-a-Zone
        </Button>
        <Button
          variant={mode === 'country' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('country')}
        >
          <Globe className="w-4 h-4 mr-1" />
          Select Countries
        </Button>
      </div>

      {/* Mode-specific Controls */}
      {mode === 'radius' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-800">
            🎯 Click the circle tool on the map to draw your radius. Drag to adjust size, click to place. The radius will be automatically calculated and displayed.
          </span>
        </div>
      )}

      {mode === 'polygon' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm text-green-800">
            ✏️ Click the drawing tools on the map to draw your custom gig zone. Use the polygon tool to create your coverage area.
          </span>
        </div>
      )}

      {mode === 'country' && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleCountrySelect} disabled={!selectedCountry}>
              Add Country
            </Button>
          </div>
          {selectedCountries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCountries.map((countryCode) => {
                const countryName = COUNTRIES.find((country) => country.code === countryCode)?.name || countryCode
                return (
                  <span
                    key={countryCode}
                    className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-3 py-1 text-sm text-gray-700"
                  >
                    {countryName}
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => handleCountryRemove(countryCode)}
                      aria-label={`Remove ${countryName}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Map Display */}
      <div className="relative h-96 rounded-lg overflow-hidden border border-gray-300">
        {baseLocation ? (
          <MapContainer
            key={mapId}
            id={mapId}
            center={[baseLocation.lat, baseLocation.lng]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Base Location Marker */}
            <Marker position={[baseLocation.lat, baseLocation.lng]} />
            
            {/* Drawing Controls - handles displaying drawn shapes */}
            <DrawingControls
              mode={mode}
              onZoneCreated={onChange}
            />
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center p-6">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">No Base Location Set</p>
              <p className="text-xs text-gray-500 mt-2">
                Please set your base location in Artist Profile first
              </p>
            </div>
          </div>
        )}
        
        {/* Country Selection Overlay */}
        {value?.type === 'country' && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-90 z-10 pointer-events-none">
            <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
              <p className="text-sm text-gray-600">Selected Countries:</p>
              <p className="text-xl font-bold text-blue-600">
                {(Array.isArray(value.data) ? value.data : [value.data])
                  .map((code) => COUNTRIES.find((country) => country.code === code)?.name || code)
                  .join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Current Selection Display */}
      {value && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Current selection: {value.type === 'radius' ? `${value.radius}km radius` : 
                             value.type === 'country'
                               ? (Array.isArray(value.data) ? value.data : [value.data])
                                   .map((code) => COUNTRIES.find((country) => country.code === code)?.name || code)
                                   .join(', ')
                               :
                             `${Array.isArray(value.data) ? value.data.length : 0} points`}
          </p>
        </div>
      )}
    </div>
  )
}
