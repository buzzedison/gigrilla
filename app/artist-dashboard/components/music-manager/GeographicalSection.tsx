'use client'

import { useState } from 'react'
import { Globe, Home, MapPin, X } from 'lucide-react'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData, territoryOptions, countryOptions } from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'

interface GeographicalSectionProps {
  releaseData: ReleaseData
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
}

export function GeographicalSection({ releaseData, onUpdate }: GeographicalSectionProps) {
  const [territorySelectKey, setTerritorySelectKey] = useState(0)
  const toggleTerritory = (territory: string) => {
    const current = releaseData.specificTerritories
    if (current.includes(territory)) {
      onUpdate('specificTerritories', current.filter(t => t !== territory))
    } else {
      onUpdate('specificTerritories', [...current, territory])
    }
  }

  const handleWorldwideToggle = (checked: boolean) => {
    onUpdate('availableWorldwide', checked)
    if (checked) {
      onUpdate('availableHome', true)
    }
  }

  return (
    <SectionWrapper
      title="Release Geographical Availability"
      subtitle="Where Should This Release Be Available to Stream/Download?"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-800">Country of Origin</label>
          <Select
            value={releaseData.countryOfOrigin}
            onValueChange={(value) => onUpdate('countryOfOrigin', value)}
          >
            <SelectTrigger className="w-full md:w-72">
              <SelectValue placeholder="Set Country of Origin" />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="flex items-start gap-3 border rounded-2xl p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={releaseData.availableHome}
              onChange={(e) => onUpdate('availableHome', e.target.checked)}
              className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Home className="w-4 h-4 text-purple-500" /> Available in Home Territory?
              </div>
              <p className="text-xs text-gray-600 mt-1">Uses your Country of Origin as the home market.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 border rounded-2xl p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={releaseData.availableSpecific}
              onChange={(e) => {
                const checked = e.target.checked
                onUpdate('availableSpecific', checked)
                if (!checked) {
                  onUpdate('specificTerritories', [])
                }
              }}
              className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPin className="w-4 h-4 text-purple-500" /> Available in Specific Territories?
              </div>
              <p className="text-xs text-gray-600 mt-1">Add territories below as you need them.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 border rounded-2xl p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={releaseData.availableWorldwide}
              onChange={(e) => handleWorldwideToggle(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Globe className="w-4 h-4 text-purple-500" /> Available Worldwide?
              </div>
              <p className="text-xs text-gray-600 mt-1">Choosing Worldwide automatically keeps Home Territory enabled.</p>
            </div>
          </label>
        </div>

        {releaseData.availableSpecific && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-800">
              Add Specific Territories
            </label>
            <Select
              key={territorySelectKey}
              onValueChange={(value) => {
                toggleTerritory(value)
                setTerritorySelectKey((prev) => prev + 1)
              }}
            >
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Add Specific Territories" />
              </SelectTrigger>
              <SelectContent>
                {territoryOptions.map((territory) => (
                  <SelectItem key={territory.value} value={territory.value}>
                    {territory.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {releaseData.specificTerritories.map((territory) => {
                const territoryLabel = territoryOptions.find(t => t.value === territory)?.label || territory
                return (
                  <span
                    key={territory}
                    className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                  >
                    {territoryLabel}
                    <button type="button" onClick={() => toggleTerritory(territory)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
              {releaseData.specificTerritories.length === 0 && (
                <p className="text-xs text-gray-500">No territories selected yet.</p>
              )}
            </div>
          </div>
        )}
        
        {(releaseData.availableHome || releaseData.availableSpecific || releaseData.availableWorldwide) && (
          <div className="border-t pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={releaseData.territoryRightsConfirmed}
                onChange={(e) => onUpdate('territoryRightsConfirmed', e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                I warrant that I hold the necessary Rights to exploit this Sound Recording(s) in my selected territories for all Tracks on this Specific Release.
              </span>
            </label>
          </div>
        )}

        <InfoBox title="Territory Rights" variant="warning">
          <p>
            Ensure you have proper licensing and rights clearance for each territory where you plan
            to distribute. Some territories may have specific requirements for content or metadata.
          </p>
        </InfoBox>
      </div>
    </SectionWrapper>
  )
}
