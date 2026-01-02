'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Flag } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData } from './types'

interface ReleaseRegistrationSectionProps {
  releaseData: ReleaseData
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
  onReportError: () => void
}

export function ReleaseRegistrationSection({
  releaseData,
  onUpdate,
  onReportError
}: ReleaseRegistrationSectionProps) {
  const [gtinError, setGtinError] = useState('')

  const validateGtin = (value: string) => {
    // GTIN can be 8, 12, 13, or 14 digits
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length > 0 && ![8, 12, 13, 14].includes(cleanValue.length)) {
      setGtinError('GTIN must be 8, 12, 13, or 14 digits')
      return false
    }
    setGtinError('')
    return true
  }

  const handleGtinChange = (value: string) => {
    onUpdate('gtin', value)
    validateGtin(value)
  }

  return (
    <SectionWrapper
      title="Release Registration"
      subtitle="Enter your release identification codes and title"
    >
      <div className="space-y-6">
        {/* GTIN/UPC/EAN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GTIN / UPC / EAN <span className="text-gray-400">(optional)</span>
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                value={releaseData.gtin}
                onChange={(e) => handleGtinChange(e.target.value)}
                placeholder="Enter barcode number (e.g., 00602445790128)"
                className={gtinError ? 'border-red-300' : ''}
              />
              {gtinError && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {gtinError}
                </p>
              )}
            </div>
            <Button
              variant={releaseData.gtinConfirmed ? 'default' : 'outline'}
              onClick={() => onUpdate('gtinConfirmed', !releaseData.gtinConfirmed)}
              disabled={!!gtinError || !releaseData.gtin}
              className="whitespace-nowrap"
            >
              {releaseData.gtinConfirmed ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" /> Confirmed
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            If you don&apos;t have a GTIN, one will be assigned automatically by your distributor.
          </p>
        </div>

        {/* Release Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Release Title <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                value={releaseData.releaseTitle}
                onChange={(e) => onUpdate('releaseTitle', e.target.value)}
                placeholder="Enter the title of your release"
              />
            </div>
            <Button
              variant={releaseData.releaseTitleConfirmed ? 'default' : 'outline'}
              onClick={() => onUpdate('releaseTitleConfirmed', !releaseData.releaseTitleConfirmed)}
              disabled={!releaseData.releaseTitle.trim()}
              className="whitespace-nowrap"
            >
              {releaseData.releaseTitleConfirmed ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" /> Confirmed
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </div>

        {/* Report Error Button */}
        {(releaseData.gtinConfirmed || releaseData.releaseTitleConfirmed) && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReportError}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Flag className="w-4 h-4 mr-1" /> Report an error with this information
            </Button>
          </div>
        )}

        <InfoBox title="About Release Titles" variant="info">
          <p>
            Your release title should match exactly how you want it to appear on streaming platforms.
            Avoid including version information in the title (use the version field instead).
          </p>
        </InfoBox>
      </div>
    </SectionWrapper>
  )
}
