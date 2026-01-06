'use client'

import { Calendar, Clock, Zap } from 'lucide-react'
import { Input } from '../../../components/ui/input'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData } from './types'

interface GoLiveDateSectionProps {
  releaseData: ReleaseData
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
}

export function GoLiveDateSection({ releaseData, onUpdate }: GoLiveDateSectionProps) {
  return (
    <SectionWrapper
      title="Go-Live Date"
      subtitle="When should your release become available?"
    >
      <div className="space-y-6">
        <InfoBox title="Release Timing Tips" variant="info">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>If scheduling a future Go-Live Date, it is best practice to allow 28 days between uploading Tracks and your Go-Live Date. This helps Chart Companies to account for your music release.</li>
            <li>If scheduling a future Go-Live Date, and if you’re releasing physical copies alongside digital, you must schedule your release to go-live everywhere on the same day to avoid disqualification.</li>
            <li>You can Go-Live &amp; Publish as soon as you’ve finished uploading, but you risk being excluded from Official Charts in some territories, especially if you’re also releasing physical copies offline.</li>
          </ul>
        </InfoBox>

        <div className="space-y-4">
          <label className="flex items-start gap-3 border rounded-2xl p-4 cursor-pointer">
            <input
              type="radio"
              name="release-go-live"
              checked={releaseData.goLiveOption === 'past'}
              onChange={() => onUpdate('goLiveOption', 'past')}
              className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Clock className="w-4 h-4 text-purple-500" /> Go-Live was in the PAST on this date:
              </div>
              <Input
                type="date"
                value={releaseData.goLiveOption === 'past' ? releaseData.goLiveDate : ''}
                onChange={(e) => onUpdate('goLiveDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-60"
                disabled={releaseData.goLiveOption !== 'past'}
              />
            </div>
          </label>

          <label className="flex items-start gap-3 border rounded-2xl p-4 cursor-pointer">
            <input
              type="radio"
              name="release-go-live"
              checked={releaseData.goLiveOption === 'asap'}
              onChange={() => {
                onUpdate('goLiveOption', 'asap')
                onUpdate('goLiveDate', new Date().toISOString().split('T')[0])
              }}
              className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Zap className="w-4 h-4 text-purple-500" /> Go-Live ASAP (within 24 hours).
              </div>
              <p className="text-xs text-gray-600 mt-1">We’ll stamp the go-live date with today’s date.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 border rounded-2xl p-4 cursor-pointer">
            <input
              type="radio"
              name="release-go-live"
              checked={releaseData.goLiveOption === 'future'}
              onChange={() => onUpdate('goLiveOption', 'future')}
              className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Calendar className="w-4 h-4 text-purple-500" /> Go-Live on this FUTURE date:
              </div>
              <Input
                type="date"
                value={releaseData.goLiveOption === 'future' ? releaseData.goLiveDate : ''}
                onChange={(e) => onUpdate('goLiveDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-60"
                disabled={releaseData.goLiveOption !== 'future'}
              />
            </div>
          </label>
        </div>
      </div>
    </SectionWrapper>
  )
}
