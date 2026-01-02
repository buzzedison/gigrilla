'use client'

import { Globe, Home, MapPin, CheckCircle } from 'lucide-react'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData, territoryOptions } from './types'

interface GeographicalSectionProps {
  releaseData: ReleaseData
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
}

export function GeographicalSection({ releaseData, onUpdate }: GeographicalSectionProps) {
  const territoryTypes = [
    {
      value: 'home',
      label: 'Home Territory Only',
      description: 'Release only in your home country',
      icon: Home
    },
    {
      value: 'specific',
      label: 'Specific Territories',
      description: 'Choose specific regions',
      icon: MapPin
    },
    {
      value: 'worldwide',
      label: 'Worldwide',
      description: 'Release globally',
      icon: Globe
    }
  ]

  const handleTerritoryTypeChange = (type: 'home' | 'specific' | 'worldwide') => {
    onUpdate('territoryType', type)
    if (type !== 'specific') {
      onUpdate('selectedTerritories', [])
    }
  }

  const toggleTerritory = (territory: string) => {
    const current = releaseData.selectedTerritories
    if (current.includes(territory)) {
      onUpdate('selectedTerritories', current.filter(t => t !== territory))
    } else {
      onUpdate('selectedTerritories', [...current, territory])
    }
  }

  return (
    <SectionWrapper
      title="Geographical Availability"
      subtitle="Where should your release be available?"
    >
      <div className="space-y-6">
        {/* Territory Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Distribution Scope <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            {territoryTypes.map((type) => {
              const Icon = type.icon
              const isSelected = releaseData.territoryType === type.value
              return (
                <button
                  key={type.value}
                  onClick={() => handleTerritoryTypeChange(type.value as 'home' | 'specific' | 'worldwide')}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all text-left
                    ${isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  {isSelected && (
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-purple-500" />
                  )}
                  <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-purple-500' : 'text-gray-400'}`} />
                  <h4 className={`font-semibold ${isSelected ? 'text-purple-700' : 'text-gray-800'}`}>
                    {type.label}
                  </h4>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Specific Territories Selection */}
        {releaseData.territoryType === 'specific' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Territories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {territoryOptions.map((territory) => {
                const isSelected = releaseData.selectedTerritories.includes(territory.value)
                return (
                  <button
                    key={territory.value}
                    onClick={() => toggleTerritory(territory.value)}
                    className={`
                      p-3 rounded-lg border transition-all text-sm
                      ${isSelected
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {territory.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Rights Confirmation */}
        {releaseData.territoryType && (
          <div className="border-t pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={releaseData.territoryRightsConfirmed}
                onChange={(e) => onUpdate('territoryRightsConfirmed', e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                I confirm that I have the rights to distribute this release in the selected territories
                and that the content complies with local regulations.
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
