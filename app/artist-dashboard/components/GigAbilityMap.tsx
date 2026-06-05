"use client"

import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { MapPin, Maximize2, Move, Globe, X } from 'lucide-react'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Checkbox } from '../../components/ui/checkbox'
import dynamic from 'next/dynamic'
import { DrawingControls } from './DrawingControls'
import { getCountryOptions } from '../../../lib/country-list'

// Dynamically import WorldChoroplethMap to avoid SSR issues
const WorldChoroplethMap = dynamic(
  () => import('./WorldChoroplethMap').then((m) => m.WorldChoroplethMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
        <span className="text-sm text-slate-500">Loading map…</span>
      </div>
    ),
  }
)

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
// Circle, Polygon, FeatureGroup imports removed - not currently used
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
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
  allowCountrySelection?: boolean
  profileAreaLabel?: string
}

const COUNTRIES = getCountryOptions()
const KM_PER_MILE = 1.60934

const getCountryCodeFromValue = (value: string) => {
  const byCode = COUNTRIES.find((country) => country.code === value)?.code
  if (byCode) return byCode

  const byName = COUNTRIES.find((country) => country.name === value)?.code
  if (byName) return byName

  return /^[A-Z]{2}$/.test(value) ? value : null
}

const getFlagEmoji = (countryCode: string | null) => {
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return '🌍'

  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0))
  )
}

const getCountryNameFromValue = (value: string) => {
  const byCode = COUNTRIES.find((country) => country.code === value)?.name
  if (byCode) return byCode

  const byName = COUNTRIES.find((country) => country.name === value)?.name
  if (byName) return byName

  if (/^[A-Z]{2}$/.test(value)) {
    try {
      const intlWithDisplayNames = Intl as typeof Intl & {
        DisplayNames?: new (
          locales?: string | string[],
          options?: { type: 'region' }
        ) => { of: (code: string) => string | undefined }
      }
      if (typeof intlWithDisplayNames.DisplayNames === 'function') {
        const names = new intlWithDisplayNames.DisplayNames(['en'], { type: 'region' })
        const resolved = names.of(value)
        if (resolved && resolved !== value) return resolved
      }
    } catch {
      // Ignore and fall back to raw value
    }
  }

  return value
}

export function GigAbilityMap({
  title,
  description,
  value,
  onChange,
  baseLocation,
  mapId = 'gig-map',
  allowCountrySelection = true,
  profileAreaLabel = 'Gig Area',
}: GigAbilityMapProps) {
  const [mode, setMode] = useState<'radius' | 'polygon' | 'country'>('radius')
  const [radius] = useState(50) // km
  const [radiusUnit, setRadiusUnit] = useState<'km' | 'mi'>('km')
  const [radiusInput, setRadiusInput] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
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

  const toggleCountry = (countryCode: string) => {
    const nextCountries = selectedCountries.includes(countryCode)
      ? selectedCountries.filter((code) => code !== countryCode)
      : [...selectedCountries, countryCode]

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

  const selectWorldwide = () => {
    const allCountryCodes = COUNTRIES.map((country) => country.code)
    setSelectedCountries(allCountryCodes)
    onChange({
      type: 'country',
      data: allCountryCodes
    })
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
    setCountrySearch('')
    setSelectedCountries([])
  }

  const countryPreviewItems = selectedCountries.map((countryValue) => {
    const name = getCountryNameFromValue(countryValue)
    const code = getCountryCodeFromValue(countryValue)

    return {
      value: countryValue,
      name,
      code,
      flag: getFlagEmoji(code)
    }
  })

  useEffect(() => {
    if (value?.type !== 'country') return
    const countries = Array.isArray(value.data)
      ? value.data
      : typeof value.data === 'string'
        ? [value.data]
        : []
    setSelectedCountries(countries.filter((country): country is string => typeof country === 'string' && country.length > 0))
  }, [value])

  useEffect(() => {
    if (allowCountrySelection || mode !== 'country') return
    setMode('radius')
  }, [allowCountrySelection, mode])

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.trim().toLowerCase())
  )

  useEffect(() => {
    if (value?.type !== 'radius' || typeof value.radius !== 'number') {
      setRadiusInput('')
      return
    }

    const displayRadius = radiusUnit === 'km'
      ? value.radius
      : value.radius / KM_PER_MILE

    setRadiusInput(displayRadius.toFixed(radiusUnit === 'km' ? 0 : 1))
  }, [value, radiusUnit])

  const updateRadiusFromManualInput = () => {
    if (!baseLocation) return

    const parsed = Number.parseFloat(radiusInput)
    if (!Number.isFinite(parsed) || parsed <= 0) return

    const radiusInKm = radiusUnit === 'km'
      ? Math.round(parsed)
      : Math.max(1, Math.round(parsed * KM_PER_MILE))

    const centerPoint = value?.type === 'radius' && Array.isArray(value.data) && value.data[0] && typeof value.data[0] === 'object'
      ? value.data[0] as MapPoint
      : baseLocation

    onChange({
      type: 'radius',
      data: [{ lat: centerPoint.lat, lng: centerPoint.lng }],
      radius: radiusInKm
    })
  }

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
      <div className="flex flex-wrap gap-2">
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
        {allowCountrySelection && (
          <Button
            variant={mode === 'country' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('country')}
          >
            <Globe className="w-4 h-4 mr-1" />
            Countries
          </Button>
        )}
        {allowCountrySelection && mode === 'country' && (
          <Button
            variant="outline"
            size="sm"
            onClick={selectWorldwide}
          >
            <Globe className="w-4 h-4 mr-1" />
            Worldwide
          </Button>
        )}
      </div>

      {/* Mode-specific Controls */}
      {mode === 'radius' && (
        <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-800">
            🎯 Drag from your base location on the map to create a radius. Release to save the set distance.
          </span>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Radius
              </label>
              <Input
                type="number"
                min="1"
                step={radiusUnit === 'km' ? '1' : '0.1'}
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
                onBlur={updateRadiusFromManualInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    updateRadiusFromManualInput()
                  }
                }}
                placeholder={radiusUnit === 'km' ? 'Enter km' : 'Enter miles'}
                className="w-32 bg-white"
                disabled={!baseLocation}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Units
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={radiusUnit === 'km' ? 'default' : 'outline'}
                  onClick={() => setRadiusUnit('km')}
                >
                  Kilometres
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={radiusUnit === 'mi' ? 'default' : 'outline'}
                  onClick={() => setRadiusUnit('mi')}
                >
                  Miles
                </Button>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={updateRadiusFromManualInput}
              disabled={!radiusInput.trim() || !baseLocation}
            >
              Update Radius
            </Button>
          </div>
        </div>
      )}

      {mode === 'polygon' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm text-green-800">
            ✏️ Draw-a-Zone is selected. Click the map to start your custom area, add points around the zone, then press Finish.
          </span>
        </div>
      )}

      {allowCountrySelection && mode === 'country' && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h5 className="text-sm font-semibold text-slate-900">Country Coverage</h5>
                <p className="text-xs text-slate-500">
                  Search, select, and remove countries from one place.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={selectWorldwide}
                >
                  Select Worldwide
                </Button>
                {selectedCountries.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={clearMap}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <Input
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              placeholder="Search countries"
              className="bg-white"
            />

            <ScrollArea className="h-72 rounded-xl border border-slate-200 bg-slate-50">
              <div className="p-2">
                {filteredCountries.length === 0 ? (
                  <div className="px-3 py-6 text-sm text-slate-500">
                    No countries match your search.
                  </div>
                ) : (
                  filteredCountries.map((country) => {
                    const isSelected = selectedCountries.includes(country.code)

                    return (
                      <div
                        key={country.code}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleCountry(country.code)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggleCountry(country.code)
                          }
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                          isSelected
                            ? 'bg-purple-50 text-purple-950'
                            : 'text-slate-800 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={() => toggleCountry(country.code)}
                            aria-label={`Select ${country.name}`}
                          />
                          <span className="text-base">{getFlagEmoji(country.code)}</span>
                          <span className="text-sm font-medium">{country.name}</span>
                        </div>
                        {isSelected && (
                          <span className="text-xs font-semibold text-purple-700">
                            Added
                          </span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-700">
                  Selected Countries
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedCountries.length === 0
                    ? 'No countries selected yet.'
                    : `${selectedCountries.length} selected for ${profileAreaLabel.toLowerCase()}.`}
                </p>
              </div>
              {selectedCountries.length > 0 && (
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-purple-700 shadow-sm">
                  {selectedCountries.length}
                </span>
              )}
            </div>

            {selectedCountries.length > 0 && (
              <div className="mt-4 flex max-h-64 flex-wrap gap-2 overflow-y-auto pr-1">
                {countryPreviewItems.map((country) => (
                  <span
                    key={country.value}
                    className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
                  >
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                    <button
                      type="button"
                      className="text-slate-400 transition-colors hover:text-red-500"
                      onClick={() => handleCountryRemove(country.value)}
                      aria-label={`Remove ${country.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Country choropleth — shown when countries are selected */}
      {allowCountrySelection && mode === 'country' && selectedCountries.length > 0 && (
        <WorldChoroplethMap
          selectedCodes={selectedCountries}
          label="Coverage Map — Selected Countries Highlighted"
        />
      )}

      {/* Map Display */}
      <div className={`relative rounded-lg overflow-hidden border border-gray-300 ${mode === 'country' && selectedCountries.length > 0 ? 'h-48' : 'h-96'}`}>
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
            
            {/* Base Location Center Point */}
            <CircleMarker
              center={[baseLocation.lat, baseLocation.lng]}
              radius={8}
              pathOptions={{
                color: '#1d4ed8',
                fillColor: '#60a5fa',
                fillOpacity: 0.9,
                weight: 3
              }}
              interactive={false}
            />
            
            {/* Drawing Controls - handles displaying drawn shapes */}
            <DrawingControls
              mode={mode}
              baseLocation={baseLocation}
              value={value}
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
        
        {value?.type === 'country' && countryPreviewItems.length > 0 && (
          <div className="absolute inset-0 z-10 pointer-events-none p-4">
            <div className="h-full rounded-2xl border border-white/50 bg-gradient-to-br from-sky-500/20 via-blue-500/10 to-indigo-500/20 shadow-inner">
              <div className="pointer-events-none absolute right-6 top-6 max-w-md rounded-2xl border border-white/70 bg-white/92 p-4 shadow-xl backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Artist Public Profile Preview
                    </p>
                    <h5 className="mt-1 text-lg font-bold text-slate-900">
                      {profileAreaLabel}
                    </h5>
                    <p className="mt-1 text-sm text-slate-600">
                      Your profile will show these selected countries as part of this coverage area.
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {countryPreviewItems.length} selected
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {countryPreviewItems.map((country) => (
                    <div
                      key={country.value}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
                    >
                      <span className="text-base">{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Selection Display */}
      {value && value.type !== 'country' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              Current selection: {value.type === 'radius'
                ? `${value.radius}km radius${value.radius ? ` (${(value.radius / KM_PER_MILE).toFixed(1)}mi)` : ''}`
                :
                `${Array.isArray(value.data) ? value.data.length : 0} points`}
            </p>
          </div>
      )}
    </div>
  )
}
