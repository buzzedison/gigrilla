'use client'

import { useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, Flag, Loader2, HelpCircle, Search } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData } from './types'
import { GTINInfoModal } from './GTINInfoModal'
import { validateGTIN, lookupGTIN, debounce } from './gtinUtils'

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
  const [isLookingUpUpc, setIsLookingUpUpc] = useState(false)
  const [isLookingUpEan, setIsLookingUpEan] = useState(false)
  const [lookupSuccess, setLookupSuccess] = useState<string | null>(null)
  const [showGTINInfo, setShowGTINInfo] = useState(false)

  // Debounced lookup function
  const debouncedLookup = useCallback(
    debounce(async (gtin: string, type: 'upc' | 'ean') => {
      const validation = validateGTIN(gtin)

      if (!validation.valid) {
        if (type === 'upc') {
          setUpcError(validation.error || '')
          setIsLookingUpUpc(false)
        } else {
          setEanError(validation.error || '')
          setIsLookingUpEan(false)
        }
        return
      }

      // Clear errors for valid format
      if (type === 'upc') {
        setUpcError('')
        setIsLookingUpUpc(true)
      } else {
        setEanError('')
        setIsLookingUpEan(true)
      }

      // Perform lookup
      const result = await lookupGTIN(gtin)

      if (type === 'upc') {
        setIsLookingUpUpc(false)
      } else {
        setIsLookingUpEan(false)
      }

      if (result.success && result.data) {
        // Auto-populate release data
        onUpdate('releaseTitle', result.data.releaseTitle)
        onUpdate('releaseTitleSource', 'gtin')

        if (result.data.releaseType) {
          onUpdate('releaseType', result.data.releaseType)
        }

        if (result.data.trackCount) {
          onUpdate('trackCount', result.data.trackCount)
        }

        if (result.data.country) {
          // Map country code to your country options if needed
          const countryMap: Record<string, string> = {
            'US': 'united-states',
            'GB': 'united-kingdom',
            'UK': 'united-kingdom',
            'CA': 'canada',
            'AU': 'australia',
            'DE': 'germany',
            'FR': 'france',
            'BR': 'brazil',
            'ZA': 'south-africa',
            'JP': 'japan'
          }
          const mappedCountry = countryMap[result.data.country.toUpperCase()]
          if (mappedCountry) {
            onUpdate('countryOfOrigin', mappedCountry)
          }
        }

        setLookupSuccess(`Found: ${result.data.releaseTitle} by ${result.data.artistName}`)
        setTimeout(() => setLookupSuccess(null), 5000)
      } else if (result.error) {
        // Show lookup error as info, not blocking error
        if (type === 'upc') {
          setUpcError('')
        } else {
          setEanError('')
        }
        // Don't block the user - they can still manually confirm
      }
    }, 1000),
    [onUpdate]
  )

  const handleUpcChange = (value: string) => {
    onUpdate('upc', value)
    setLookupSuccess(null)

    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length === 12) {
      debouncedLookup(cleanValue, 'upc')
    } else if (cleanValue.length > 0) {
      setUpcError(`Must be exactly 12 digits (currently ${cleanValue.length})`)
      setIsLookingUpUpc(false)
    } else {
      setUpcError('')
      setIsLookingUpUpc(false)
    }
  }

  const handleEanChange = (value: string) => {
    onUpdate('ean', value)
    setLookupSuccess(null)

    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length === 13) {
      debouncedLookup(cleanValue, 'ean')
    } else if (cleanValue.length > 0) {
      setEanError(`Must be exactly 13 digits (currently ${cleanValue.length})`)
      setIsLookingUpEan(false)
    } else {
      setEanError('')
      setIsLookingUpEan(false)
    }
  }

  const canConfirmUpc = !upcError && releaseData.upc.replace(/\D/g, '').length === 12 && !isLookingUpUpc
  const canConfirmEan = !eanError && releaseData.ean.replace(/\D/g, '').length === 13 && !isLookingUpEan

  return (
    <>
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
            <div className="flex gap-3 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowGTINInfo(true)}
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                What is a GTIN?
              </Button>
              <a
                href="https://www.gs1.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-purple-600 font-medium hover:text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Search className="w-4 h-4" />
                Get a GTIN from GS1
              </a>
            </div>

            {lookupSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{lookupSuccess}</span>
              </div>
            )}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                12-digit UPC
                {isLookingUpUpc && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
              </p>
              <Input
                type="text"
                value={releaseData.upc}
                onChange={(e) => handleUpcChange(e.target.value)}
                placeholder="eg. 123456789012"
                className={upcError ? 'border-red-300' : ''}
                disabled={isLookingUpUpc}
              />
              {upcError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {upcError}
                </p>
              )}
              {isLookingUpUpc && (
                <p className="text-xs text-purple-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Looking up release data...
                </p>
              )}
              <Button
                variant={releaseData.upcConfirmed ? 'default' : 'outline'}
                onClick={() => onUpdate('upcConfirmed', !releaseData.upcConfirmed)}
                disabled={!canConfirmUpc}
                className="w-full"
              >
                {releaseData.upcConfirmed ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" /> UPC Confirmed
                  </>
                ) : (
                  'Confirm UPC'
                )}
              </Button>
            </div>

            <div className="border rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                13-digit EAN
                {isLookingUpEan && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
              </p>
              <Input
                type="text"
                value={releaseData.ean}
                onChange={(e) => handleEanChange(e.target.value)}
                placeholder="eg. 1234567890123"
                className={eanError ? 'border-red-300' : ''}
                disabled={isLookingUpEan}
              />
              {eanError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {eanError}
                </p>
              )}
              {isLookingUpEan && (
                <p className="text-xs text-purple-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Looking up release data...
                </p>
              )}
              <Button
                variant={releaseData.eanConfirmed ? 'default' : 'outline'}
                onClick={() => onUpdate('eanConfirmed', !releaseData.eanConfirmed)}
                disabled={!canConfirmEan}
                className="w-full"
              >
                {releaseData.eanConfirmed ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" /> EAN Confirmed
                  </>
                ) : (
                  'Confirm EAN'
                )}
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

    <GTINInfoModal isOpen={showGTINInfo} onClose={() => setShowGTINInfo(false)} />
  </>
  )
}
