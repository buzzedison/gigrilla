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
  const [upcError, setUpcError] = useState('')
  const [eanError, setEanError] = useState('')

  const validateDigits = (value: string, requiredLength: number, setError: (msg: string) => void) => {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue && cleanValue.length !== requiredLength) {
      setError(`Must be exactly ${requiredLength} digits`)
      return false
    }
    setError('')
    return true
  }

  const handleUpcChange = (value: string) => {
    onUpdate('upc', value)
    validateDigits(value, 12, setUpcError)
  }

  const handleEanChange = (value: string) => {
    onUpdate('ean', value)
    validateDigits(value, 13, setEanError)
  }

  const canConfirmUpc = !upcError && releaseData.upc.replace(/\D/g, '').length === 12
  const canConfirmEan = !eanError && releaseData.ean.replace(/\D/g, '').length === 13

  return (
    <SectionWrapper
      title="Release Registration Details"
      subtitle="Confirm your GTIN (UPC/EAN) and release title"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-900">
            Global Trade Item Number? (UPC/EAN) <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-700 flex gap-2">
            <span className="text-purple-500">ℹ️</span>
            Global Trade Item Number (for this specific Release); UPC is generally used in the USA, while EAN is generally used Internationally; you only need one of these, not both.
          </p>
          <a
            href="https://www.gs1.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-purple-600 font-medium hover:text-purple-800"
          >
            Get / Find a GTIN
          </a>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-gray-800">12-digit UPC</p>
              <Input
                type="text"
                value={releaseData.upc}
                onChange={(e) => handleUpcChange(e.target.value)}
                placeholder="eg. 123456789012"
                className={upcError ? 'border-red-300' : ''}
              />
              {upcError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {upcError}
                </p>
              )}
              <Button
                variant={releaseData.upcConfirmed ? 'default' : 'outline'}
                onClick={() => onUpdate('upcConfirmed', !releaseData.upcConfirmed)}
                disabled={!canConfirmUpc}
                className="w-full"
              >
                {releaseData.upcConfirmed ? 'UPC Confirmed' : 'Confirm UPC'}
              </Button>
            </div>

            <div className="border rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-gray-800">13-digit EAN</p>
              <Input
                type="text"
                value={releaseData.ean}
                onChange={(e) => handleEanChange(e.target.value)}
                placeholder="eg. 1234567890123"
                className={eanError ? 'border-red-300' : ''}
              />
              {eanError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {eanError}
                </p>
              )}
              <Button
                variant={releaseData.eanConfirmed ? 'default' : 'outline'}
                onClick={() => onUpdate('eanConfirmed', !releaseData.eanConfirmed)}
                disabled={!canConfirmEan}
                className="w-full"
              >
                {releaseData.eanConfirmed ? 'EAN Confirmed' : 'Confirm EAN'}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <label className="block text-sm font-semibold text-gray-900">
            Release Title? (API Pull-through &amp; required confirmation) <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-700">
            ℹ️ The name of this specific Single/EP/Album Release must match your registered release details, and should avoid ‘ALL CAPS’ unless stylised when registered.
          </p>

          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Release Title Source:</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={releaseData.releaseTitleSource === 'gtin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate('releaseTitleSource', 'gtin')}
              >
                Pull through from GTIN
              </Button>
              <Button
                type="button"
                variant={releaseData.releaseTitleSource === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate('releaseTitleSource', 'manual')}
              >
                Enter manually
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              type="text"
              value={releaseData.releaseTitle}
              onChange={(e) => onUpdate('releaseTitle', e.target.value)}
              placeholder="Release Title"
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                variant={releaseData.releaseTitleConfirmed ? 'default' : 'outline'}
                onClick={() => onUpdate('releaseTitleConfirmed', !releaseData.releaseTitleConfirmed)}
                disabled={!releaseData.releaseTitle.trim()}
              >
                {releaseData.releaseTitleConfirmed ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" /> Confirmed
                  </>
                ) : (
                  'Confirm Release Title'
                )}
              </Button>
              {releaseData.releaseTitleSource === 'gtin' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onReportError}
                  className="border-amber-300 text-amber-700"
                >
                  <Flag className="w-4 h-4 mr-1" /> Report Error
                </Button>
              )}
            </div>
          </div>

          {releaseData.releaseTitleSource === 'gtin' ? (
            <InfoBox title="Release Title Pull-Through" variant="info">
              <p>
                Release Title pulls through from GTIN (UPC/EAN); if it doesn’t pull through from the UPC/EAN (delayed registration details?) then it becomes a free text entry box. Use the error report button if the pulled title is incorrect.
              </p>
            </InfoBox>
          ) : (
            <InfoBox title="Manual Title Entry" variant="warning">
              <p>
                If the API fails, manually enter the exact registered Release Title. Once the official registry updates, you can re-confirm and submit an error report to align the records.
              </p>
            </InfoBox>
          )}
        </div>
      </div>
    </SectionWrapper>
  )
}
