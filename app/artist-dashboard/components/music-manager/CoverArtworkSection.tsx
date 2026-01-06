'use client'

import { useState, useRef } from 'react'
import { Image, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData } from './types'

interface CoverArtworkSectionProps {
  releaseData: ReleaseData
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
}

export function CoverArtworkSection({ releaseData, onUpdate }: CoverArtworkSectionProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('File must be JPG or PNG format')
        resolve(false)
        return
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        resolve(false)
        return
      }

      // Check dimensions
      const img = new window.Image()
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        if (img.width < 3000 || img.height < 3000) {
          setError('Image must be at least 3000x3000 pixels')
          resolve(false)
          return
        }
        if (img.width > 6000 || img.height > 6000) {
          setError('Image must be no more than 6000x6000 pixels')
          resolve(false)
          return
        }
        if (img.width !== img.height) {
          setError('Image must be square (equal width and height)')
          resolve(false)
          return
        }
        setError(null)
        resolve(true)
      }
      img.onerror = () => {
        setError('Failed to load image')
        resolve(false)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (file: File) => {
    const isValid = await validateImage(file)
    if (isValid) {
      onUpdate('coverArtwork', file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    onUpdate('coverArtwork', null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <SectionWrapper
      title="Release Cover Artwork"
      subtitle="Upload &amp; Caption Your Release Cover Artwork"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${isDragOver
              ? 'border-purple-500 bg-purple-50'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          {preview ? (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Cover artwork preview"
                className="w-48 h-48 object-cover rounded-lg shadow-lg"
              />
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mt-3 flex items-center justify-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Artwork uploaded</span>
              </div>
            </div>
          ) : (
            <>
              <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop your cover artwork here, or
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" /> Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleInputChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-4">
                JPG or PNG • Square image between 3000x3000 and 6000x6000 pixels • Max 10MB • Recommended 72–300 DPI
              </p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Caption */}
        {releaseData.coverArtwork && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artwork Caption <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={releaseData.coverCaption}
              onChange={(e) => onUpdate('coverCaption', e.target.value)}
              placeholder="Write a caption for your Cover Artwork…"
            />
            <p className="mt-1 text-xs text-gray-500">
              ℹ️ This image is your Specific Release’s cover artwork across Gigrilla, and forms part of your Specific Release Download Pack.
            </p>
          </div>
        )}

        <InfoBox title="Artwork Guidelines" variant="warning">
          <ul className="list-disc list-inside space-y-1">
            <li>Images must be .jpg (preferred) or .png - a 1:1 square image with min. 3000x3000 pixels, to max. 6000x6000 pixels, max. 10MB file size, min. 72 DPI, max. 300 DPI.</li>
            <li>No blurry, pixelated, or stretched images.</li>
            <li>No social media handles, URLs, QR codes, pricing, or promotional text.</li>
            <li>No explicit content without proper labeling.</li>
            <li>You must own or have rights to use the image.</li>
          </ul>
        </InfoBox>
      </div>
    </SectionWrapper>
  )
}
