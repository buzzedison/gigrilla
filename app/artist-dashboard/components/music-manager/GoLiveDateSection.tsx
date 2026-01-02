'use client'

import { Calendar, Clock, Zap, CheckCircle } from 'lucide-react'
import { Input } from '../../../components/ui/input'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData } from './types'

interface GoLiveDateSectionProps {
  releaseData: ReleaseData
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
}

export function GoLiveDateSection({ releaseData, onUpdate }: GoLiveDateSectionProps) {
  const goLiveOptions = [
    {
      value: 'past',
      label: 'Already Released',
      description: 'This release is already available elsewhere',
      icon: Clock
    },
    {
      value: 'asap',
      label: 'As Soon As Possible',
      description: 'Release as soon as processing is complete',
      icon: Zap
    },
    {
      value: 'future',
      label: 'Schedule for Later',
      description: 'Choose a specific release date',
      icon: Calendar
    }
  ]

  const getMinDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 14) // Minimum 2 weeks in advance
    return date.toISOString().split('T')[0]
  }

  return (
    <SectionWrapper
      title="Go-Live Date"
      subtitle="When should your release become available?"
    >
      <div className="space-y-6">
        {/* Go-Live Option Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Release Timing <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            {goLiveOptions.map((option) => {
              const Icon = option.icon
              const isSelected = releaseData.goLiveOption === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => onUpdate('goLiveOption', option.value)}
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
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Date Picker for Past Release */}
        {releaseData.goLiveOption === 'past' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Release Date
            </label>
            <Input
              type="date"
              value={releaseData.goLiveDate}
              onChange={(e) => onUpdate('goLiveDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-48"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the date when this release was originally made available.
            </p>
          </div>
        )}

        {/* Date Picker for Future Release */}
        {releaseData.goLiveOption === 'future' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Release Date
            </label>
            <Input
              type="date"
              value={releaseData.goLiveDate}
              onChange={(e) => onUpdate('goLiveDate', e.target.value)}
              min={getMinDate()}
              className="w-48"
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 2 weeks from today to allow for processing and store delivery.
            </p>
          </div>
        )}

        {/* ASAP Info */}
        {releaseData.goLiveOption === 'asap' && (
          <InfoBox title="ASAP Release" variant="info">
            <p>
              Your release will go live as soon as it passes quality checks and is delivered to stores.
              This typically takes 2-5 business days but may vary by platform.
            </p>
          </InfoBox>
        )}

        {/* Friday Release Tip */}
        {releaseData.goLiveOption === 'future' && (
          <InfoBox title="Pro Tip: Release on Friday" variant="success">
            <p>
              Most major releases drop on Fridays to maximize first-week streaming numbers and chart
              eligibility. Consider scheduling your release for a Friday at midnight.
            </p>
          </InfoBox>
        )}
      </div>
    </SectionWrapper>
  )
}
