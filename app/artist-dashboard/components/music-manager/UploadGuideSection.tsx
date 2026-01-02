'use client'

import { ChevronDown, ChevronUp, FileText, Music, Image, CheckCircle } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { SectionWrapper, InfoBox, IdCodeCard } from './shared'

interface UploadGuideSectionProps {
  showUploadGuide: boolean
  uploadGuideConfirmed: boolean
  onToggle: () => void
  onConfirm: (confirmed: boolean) => void
}

export function UploadGuideSection({
  showUploadGuide,
  uploadGuideConfirmed,
  onToggle,
  onConfirm
}: UploadGuideSectionProps) {
  return (
    <SectionWrapper
      title="Music Upload Guide"
      subtitle="Everything you need to know before uploading your music"
    >
      {/* Toggle button when confirmed */}
      {uploadGuideConfirmed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="mb-4 text-gray-600"
        >
          {showUploadGuide ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" /> Hide Guide
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" /> Show Guide
            </>
          )}
        </Button>
      )}

      {showUploadGuide && (
        <div className="space-y-6">
          {/* What you'll need */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              What You&apos;ll Need
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Audio files:</strong> WAV or FLAC format, 16-bit or 24-bit, 44.1kHz or higher sample rate</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Cover artwork:</strong> Square image, minimum 3000x3000 pixels, JPG or PNG format</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Metadata:</strong> Song titles, artist credits, songwriter info, release date</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Rights information:</strong> Master ownership, publishing splits, territory rights</span>
              </li>
            </ul>
          </div>

          {/* Audio Requirements */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-500" />
              Audio Requirements
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Format:</span>
                  <span className="ml-2 text-gray-800">WAV or FLAC</span>
                </div>
                <div>
                  <span className="text-gray-500">Bit Depth:</span>
                  <span className="ml-2 text-gray-800">16-bit or 24-bit</span>
                </div>
                <div>
                  <span className="text-gray-500">Sample Rate:</span>
                  <span className="ml-2 text-gray-800">44.1kHz minimum</span>
                </div>
                <div>
                  <span className="text-gray-500">Channels:</span>
                  <span className="ml-2 text-gray-800">Stereo (2 channels)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Artwork Requirements */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-500" />
              Artwork Requirements
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Dimensions:</span>
                  <span className="ml-2 text-gray-800">3000x3000 pixels (square)</span>
                </div>
                <div>
                  <span className="text-gray-500">Format:</span>
                  <span className="ml-2 text-gray-800">JPG or PNG</span>
                </div>
                <div>
                  <span className="text-gray-500">Color Mode:</span>
                  <span className="ml-2 text-gray-800">RGB</span>
                </div>
                <div>
                  <span className="text-gray-500">Max File Size:</span>
                  <span className="ml-2 text-gray-800">20MB</span>
                </div>
              </div>
            </div>
            <InfoBox title="Artwork Guidelines" variant="warning">
              <ul className="list-disc list-inside space-y-1">
                <li>No blurry or pixelated images</li>
                <li>No social media handles or URLs</li>
                <li>No explicit content without proper labeling</li>
                <li>Must own or have rights to the image</li>
              </ul>
            </InfoBox>
          </div>

          {/* Industry IDs */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Music Industry Identifiers</h4>
            <p className="text-sm text-gray-600 mb-4">
              These unique codes help identify your music across all platforms and ensure proper royalty tracking.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <IdCodeCard
                title="ISRC (International Standard Recording Code)"
                description="A unique 12-character code assigned to each individual recording (track)."
                learnMoreUrl="https://usisrc.org/"
                examples={['US-S1Z-21-00001', 'GBAYE2100001']}
              />
              <IdCodeCard
                title="ISWC (International Standard Musical Work Code)"
                description="Identifies the musical composition (the song itself, separate from the recording)."
                learnMoreUrl="https://www.iswc.org/"
                examples={['T-010.123.456-7']}
              />
              <IdCodeCard
                title="GTIN/UPC/EAN"
                description="A barcode number for the release (album, EP, or single) used for retail tracking."
                learnMoreUrl="https://www.gs1.org/"
                examples={['00602445790128', '5060134781234']}
              />
              <IdCodeCard
                title="ISNI (International Standard Name Identifier)"
                description="A unique identifier for contributors to creative works (artists, writers, producers)."
                learnMoreUrl="https://isni.org/"
                examples={['0000 0001 2345 6789']}
              />
            </div>
          </div>

          {/* Confirmation checkbox */}
          <div className="border-t pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={uploadGuideConfirmed}
                onChange={(e) => onConfirm(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                I have read and understood the upload requirements. I confirm that my files meet the
                specifications and I have all necessary rights and information ready.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Collapsed state message */}
      {!showUploadGuide && uploadGuideConfirmed && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          Upload guide confirmed
        </div>
      )}
    </SectionWrapper>
  )
}
