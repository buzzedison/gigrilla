'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Music, FileText, CheckCircle, AlertCircle, Loader2, X, Plus, Info } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Label } from '../../../components/ui/label'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData, TrackData, createTrackData, releaseVersionOptions } from './types'

interface TrackUploadSectionProps {
  releaseData: ReleaseData
  releaseId: string | null
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
  onTracksUpdate?: (tracks: TrackData[]) => void
}

// Audio file validation
const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/aiff', 'audio/x-aiff', 'audio/aif']
  const validExtensions = ['.wav', '.aiff', '.aif']
  
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension)
  
  if (!isValidType) {
    return { valid: false, error: 'Audio file must be WAV or AIFF format' }
  }

  // Check file size (2GB max)
  const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
  if (file.size > maxSize) {
    return { valid: false, error: 'Audio file must be less than 2GB' }
  }

  // Check filename format: "Artist Name - Track Title.wav"
  const filenamePattern = /^.+ - .+\.(wav|aiff|aif)$/i
  if (!filenamePattern.test(file.name)) {
    return { valid: false, error: 'Filename must be in format: "Artist Name - Track Title.wav"' }
  }

  return { valid: true }
}

// ISRC validation (CC-XXX-YY-NNNNN format)
const validateISRC = (isrc: string): { valid: boolean; error?: string } => {
  if (!isrc.trim()) return { valid: false, error: 'ISRC is required' }
  
  const cleaned = isrc.replace(/-/g, '').toUpperCase()
  if (cleaned.length !== 12) {
    return { valid: false, error: 'ISRC must be 12 characters (format: CC-XXX-YY-NNNNN)' }
  }

  const pattern = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/
  if (!pattern.test(cleaned)) {
    return { valid: false, error: 'Invalid ISRC format. Use: CC-XXX-YY-NNNNN' }
  }

  return { valid: true }
}

export function TrackUploadSection({ releaseData, releaseId, onUpdate, onTracksUpdate }: TrackUploadSectionProps) {
  const [tracks, setTracks] = useState<TrackData[]>([])
  const [uploadingTrackIndex, setUploadingTrackIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})
  const lyricsFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  // Initialize tracks based on trackCount
  useEffect(() => {
    if (releaseData.trackCount > 0) {
      const newTracks: TrackData[] = []
      for (let i = 1; i <= releaseData.trackCount; i++) {
        newTracks.push(createTrackData(i))
      }
      setTracks(newTracks)
    }
  }, [releaseData.trackCount])

  // Load existing tracks if releaseId exists
  useEffect(() => {
    if (releaseId) {
      loadTracks()
    }
  }, [releaseId])

  const loadTracks = async () => {
    if (!releaseId) return

    try {
      const response = await fetch(`/api/music-tracks?releaseId=${releaseId}`)
      const result = await response.json()

      if (result.success && result.data) {
        const loadedTracks = result.data.map((dbTrack: any) => ({
          id: dbTrack.id,
          trackNumber: dbTrack.track_number,
          trackTitle: dbTrack.track_title || '',
          trackTitleConfirmed: dbTrack.track_title_confirmed || false,
          trackVersion: dbTrack.track_version || releaseData.releaseVersion || '',
          isrc: dbTrack.isrc || '',
          isrcConfirmed: dbTrack.isrc_confirmed || false,
          iswc: dbTrack.iswc || '',
          iswcConfirmed: dbTrack.iswc_confirmed || false,
          isni: dbTrack.isni || '',
          isniConfirmed: dbTrack.isni_confirmed || false,
          ipiCae: dbTrack.ipi_cae || '',
          ipiCaeConfirmed: dbTrack.ipi_cae_confirmed || false,
          explicitContent: dbTrack.explicit_content || false,
          childSafeContent: dbTrack.child_safe_content || '',
          audioFile: null,
          audioFileUrl: dbTrack.audio_file_url || '',
          audioFileSize: dbTrack.audio_file_size || 0,
          audioFormat: dbTrack.audio_format || '',
          lyrics: dbTrack.lyrics || '',
          lyricsFile: null,
          lyricsFileUrl: dbTrack.lyrics_file_url || '',
          durationSeconds: dbTrack.duration_seconds || 0,
          featuredArtists: dbTrack.featured_artists || [],
          writers: dbTrack.writers || [],
          uploaded: !!dbTrack.audio_file_url
        }))
        setTracks(loadedTracks)
      }
    } catch (error) {
      console.error('Error loading tracks:', error)
    }
  }

  const updateTrack = (index: number, field: keyof TrackData, value: unknown) => {
    setTracks(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      onTracksUpdate?.(updated)
      return updated
    })
  }

  const handleAudioFileSelect = async (index: number, file: File | null) => {
    if (!file) return

    const validation = validateAudioFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    updateTrack(index, 'audioFile', file)
    updateTrack(index, 'audioFormat', file.name.split('.').pop()?.toUpperCase() || 'WAV')

    // Upload file
    await uploadAudioFile(index, file)
  }

  const uploadAudioFile = async (index: number, file: File) => {
    if (!releaseId) {
      alert('Please save the release first before uploading tracks')
      return
    }

    setUploadingTrackIndex(index)
    setUploadProgress(prev => ({ ...prev, [index]: 0 }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'track-audio')
      formData.append('entityId', releaseId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success && result.url) {
        updateTrack(index, 'audioFileUrl', result.url)
        updateTrack(index, 'audioFileSize', result.size)
        updateTrack(index, 'uploaded', true)
      } else {
        alert(result.error || 'Failed to upload audio file')
      }
    } catch (error) {
      console.error('Error uploading audio:', error)
      alert('Failed to upload audio file')
    } finally {
      setUploadingTrackIndex(null)
      setUploadProgress(prev => {
        const updated = { ...prev }
        delete updated[index]
        return updated
      })
    }
  }

  const handleLyricsFileSelect = async (index: number, file: File | null) => {
    if (!file) return

    if (!releaseId) {
      alert('Please save the release first before uploading lyrics')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'track-lyrics')
      formData.append('entityId', releaseId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success && result.url) {
        // Read lyrics file content
        const text = await file.text()
        updateTrack(index, 'lyrics', text)
        updateTrack(index, 'lyricsFileUrl', result.url)
      } else {
        alert(result.error || 'Failed to upload lyrics file')
      }
    } catch (error) {
      console.error('Error uploading lyrics:', error)
      alert('Failed to upload lyrics file')
    }
  }

  const applyToAllTracks = (field: keyof TrackData, value: unknown) => {
    setTracks(prev => prev.map(track => ({ ...track, [field]: value })))
  }

  const saveTrack = async (index: number) => {
    const track = tracks[index]
    
    if (!releaseId) {
      alert('Please save the release first')
      return
    }

    if (!track.trackTitle.trim()) {
      alert('Track title is required')
      return
    }

    if (!track.isrc.trim()) {
      alert('ISRC code is required')
      return
    }

    const isrcValidation = validateISRC(track.isrc)
    if (!isrcValidation.valid) {
      alert(isrcValidation.error)
      return
    }

    try {
      const payload = {
        releaseId,
        trackNumber: track.trackNumber,
        trackTitle: track.trackTitle,
        trackTitleConfirmed: track.trackTitleConfirmed,
        trackVersion: track.trackVersion || releaseData.releaseVersion,
        isrc: track.isrc.replace(/-/g, '').toUpperCase(),
        isrcConfirmed: track.isrcConfirmed,
        iswc: track.iswc,
        iswcConfirmed: track.iswcConfirmed,
        isni: track.isni,
        isniConfirmed: track.isniConfirmed,
        ipiCae: track.ipiCae,
        ipiCaeConfirmed: track.ipiCaeConfirmed,
        explicitContent: track.explicitContent,
        childSafeContent: track.childSafeContent,
        audioFileUrl: track.audioFileUrl,
        audioFileSize: track.audioFileSize,
        audioFormat: track.audioFormat,
        lyrics: track.lyrics,
        lyricsFileUrl: track.lyricsFileUrl,
        durationSeconds: track.durationSeconds,
        featuredArtists: track.featuredArtists,
        writers: track.writers
      }

      const response = await fetch('/api/music-tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        if (result.data?.id) {
          updateTrack(index, 'id', result.data.id)
        }
        alert('Track saved successfully!')
      } else {
        alert(result.error || 'Failed to save track')
      }
    } catch (error) {
      console.error('Error saving track:', error)
      alert('Failed to save track')
    }
  }

  return (
    <SectionWrapper
      title="Upload Tracks"
      subtitle={`Upload audio files and metadata for each track in this ${releaseData.releaseType || 'release'}`}
    >
      <div className="space-y-6">
        <InfoBox title="Audio File Requirements" variant="info">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Audio Filenames must be = "Artist Name - Track Title.wav"</li>
            <li>WAV/AIFF 16–24‑bit, 44.1–96 kHz. No clipping or dithering artifacts.</li>
            <li>Loudness Tip: Aim −14 LUFS integrated; avoid limiter pumping.</li>
            <li>Stereo required (mono not accepted).</li>
            <li>True Peak must be &lt; -1 dBTP (to prevent clipping on streaming platforms).</li>
            <li>No silence &gt;2 seconds at start/end of Audio.</li>
            <li>Maximum file size: 2GB.</li>
            <li>Minimum duration: 30 Seconds; Maximum duration: 60 Minutes.</li>
          </ul>
        </InfoBox>

        {tracks.map((track, index) => (
          <div key={track.trackNumber} className="border border-gray-200 rounded-xl p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Track {track.trackNumber}
              </h3>
              {track.uploaded && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Uploaded</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Track Title */}
              <div>
                <Label htmlFor={`track-title-${index}`}>
                  Track Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`track-title-${index}`}
                  value={track.trackTitle}
                  onChange={(e) => updateTrack(index, 'trackTitle', e.target.value)}
                  placeholder="Enter track title"
                  className="mt-1"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id={`track-title-confirmed-${index}`}
                    checked={track.trackTitleConfirmed}
                    onChange={(e) => updateTrack(index, 'trackTitleConfirmed', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`track-title-confirmed-${index}`} className="text-sm text-gray-600 cursor-pointer">
                    Confirm track title
                  </Label>
                </div>
              </div>

              {/* Track Version */}
              <div>
                <Label htmlFor={`track-version-${index}`}>Track Version</Label>
                <Select
                  value={track.trackVersion || releaseData.releaseVersion}
                  onValueChange={(value) => updateTrack(index, 'trackVersion', value)}
                >
                  <SelectTrigger className="mt-1">
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
              </div>

              {/* ISRC Code */}
              <div>
                <Label htmlFor={`isrc-${index}`}>
                  ISRC Code <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id={`isrc-${index}`}
                    value={track.isrc}
                    onChange={(e) => updateTrack(index, 'isrc', e.target.value.toUpperCase())}
                    placeholder="CC-XXX-YY-NNNNN"
                    className="flex-1"
                  />
                  <a
                    href="https://usisrc.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    Get ISRC
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id={`isrc-confirmed-${index}`}
                    checked={track.isrcConfirmed}
                    onChange={(e) => updateTrack(index, 'isrcConfirmed', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`isrc-confirmed-${index}`} className="text-sm text-gray-600 cursor-pointer">
                    Confirm ISRC
                  </Label>
                </div>
              </div>

              {/* ISWC Code */}
              <div>
                <Label htmlFor={`iswc-${index}`}>ISWC Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id={`iswc-${index}`}
                    value={track.iswc}
                    onChange={(e) => updateTrack(index, 'iswc', e.target.value)}
                    placeholder="T-123456789-0"
                    className="flex-1"
                  />
                  <a
                    href="https://www.iswc.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    Get ISWC
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id={`iswc-confirmed-${index}`}
                    checked={track.iswcConfirmed}
                    onChange={(e) => updateTrack(index, 'iswcConfirmed', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`iswc-confirmed-${index}`} className="text-sm text-gray-600 cursor-pointer">
                    Confirm ISWC
                  </Label>
                </div>
              </div>

              {/* Audio File Upload */}
              <div>
                <Label>Audio File <span className="text-red-500">*</span></Label>
                <div className="mt-2">
                  <input
                    ref={(el) => { fileInputRefs.current[index] = el }}
                    type="file"
                    accept=".wav,.aiff,.aif,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff"
                    onChange={(e) => handleAudioFileSelect(index, e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      disabled={uploadingTrackIndex === index}
                    >
                      {uploadingTrackIndex === index ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {track.audioFileUrl ? 'Replace Audio' : 'Upload Audio'}
                        </>
                      )}
                    </Button>
                    {track.audioFileUrl && (
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Audio uploaded
                      </span>
                    )}
                    {track.audioFile && (
                      <span className="text-sm text-gray-600">
                        {track.audioFile.name} ({(track.audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Lyrics */}
              <div>
                <Label htmlFor={`lyrics-${index}`}>Lyrics</Label>
                <div className="mt-2 space-y-2">
                  <Textarea
                    id={`lyrics-${index}`}
                    value={track.lyrics}
                    onChange={(e) => updateTrack(index, 'lyrics', e.target.value)}
                    placeholder="Enter lyrics for this track..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      ref={(el) => { lyricsFileInputRefs.current[index] = el }}
                      type="file"
                      accept=".txt,.md,.json,text/plain"
                      onChange={(e) => handleLyricsFileSelect(index, e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => lyricsFileInputRefs.current[index]?.click()}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Upload Lyrics File
                    </Button>
                  </div>
                </div>
              </div>

              {/* Explicit Content */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`explicit-${index}`}
                    checked={track.explicitContent}
                    onChange={(e) => updateTrack(index, 'explicitContent', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`explicit-${index}`} className="cursor-pointer">
                    Explicit Content
                  </Label>
                </div>
              </div>

              {/* Save Track Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => saveTrack(index)}
                  disabled={!track.trackTitle.trim() || !track.isrc.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Track {track.trackNumber}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}
