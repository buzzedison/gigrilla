'use client'

import { Disc, Music, Album, CheckCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { SectionWrapper } from './shared'
import { ReleaseData, releaseVersionOptions, trackCountOptions, TrackCountOption } from './types'

interface ReleaseTypeSectionProps {
  releaseData: ReleaseData
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
}

export function ReleaseTypeSection({ releaseData, onUpdate }: ReleaseTypeSectionProps) {
  const releaseTypes = [
    {
      value: 'single',
      label: 'Single',
      description: '1 to 3 tracks • under 30 mins total playtime',
      icon: Music
    },
    {
      value: 'ep',
      label: 'EP',
      description: '4 to 6 tracks • under 30 mins total playtime',
      icon: Disc
    },
    {
      value: 'album',
      label: 'Album',
      description: '7+ tracks OR longer than 30 mins total playtime',
      icon: Album
    }
  ]

  const handleReleaseTypeChange = (type: 'single' | 'ep' | 'album') => {
    onUpdate('releaseType', type)
    const defaultOption = trackCountOptions[type][0]
    if (defaultOption) {
      onUpdate('trackCount', defaultOption.value)
      onUpdate('trackCountLabel', defaultOption.label)
    }
  }

  const getTrackOptions = () => {
    if (!releaseData.releaseType) return []
    return trackCountOptions[releaseData.releaseType as keyof typeof trackCountOptions] || []
  }

  const handleTrackCountSelect = (option: TrackCountOption) => {
    onUpdate('trackCount', option.value)
    onUpdate('trackCountLabel', option.label)
  }

  return (
    <SectionWrapper
      title="Release Type & Tracks"
      subtitle="Select the type of release and number of tracks"
    >
      <div className="space-y-6">
        {/* Release Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Release Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            {releaseTypes.map((type) => {
              const Icon = type.icon
              const isSelected = releaseData.releaseType === type.value
              return (
                <button
                  key={type.value}
                  onClick={() => handleReleaseTypeChange(type.value as 'single' | 'ep' | 'album')}
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

        {/* Track Count */}
        {releaseData.releaseType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tracks <span className="text-red-500">*</span>
            </label>
            <Select
              value={releaseData.trackCount.toString()}
              onValueChange={(value) => {
                const selected = getTrackOptions().find(opt => opt.value.toString() === value)
                if (selected) {
                  handleTrackCountSelect(selected)
                }
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select track count" />
              </SelectTrigger>
              <SelectContent>
                {getTrackOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Release Version */}
        {releaseData.releaseType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Release Version <span className="text-gray-400">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <Select
                value={releaseData.releaseVersion}
                onValueChange={(value) => onUpdate('releaseVersion', value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {releaseVersionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {releaseData.releaseVersion &&
                releaseData.trackCount > 1 &&
                releaseData.releaseVersion !== 'deluxe' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={releaseData.applyVersionToAll}
                    onChange={(e) => onUpdate('applyVersionToAll', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">Apply to all tracks</span>
                </label>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Selecting Deluxe Edition automatically disables the “Apply to all tracks” toggle because deluxe releases are treated track-by-track.
            </p>
          </div>
        )}
      </div>
    </SectionWrapper>
  )
}
