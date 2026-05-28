'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Music, FileText, CheckCircle, AlertCircle, Loader2, X, Plus, Info, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Label } from '../../../components/ui/label'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData, TrackData, createTrackData, releaseVersionOptions } from './types'
import { TrackTalentSection } from './TrackTalentSection'
import { TrackTagsSection } from './TrackTagsSection'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible'
import { ISRCInfoModal } from './ISRCInfoModal'
import { ISWCInfoModal } from './ISWCInfoModal'

// Notification Modal Component
interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

function NotificationModal({ isOpen, onClose, title, message, type }: NotificationModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const iconConfig = {
    success: {
      icon: <CheckCircle className="w-16 h-16" />,
      gradient: 'from-emerald-400 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
      textColor: 'text-emerald-600',
      buttonGradient: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
      pulseColor: 'bg-emerald-400',
    },
    error: {
      icon: <XCircle className="w-16 h-16" />,
      gradient: 'from-red-400 to-rose-500',
      bgGradient: 'from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-gradient-to-br from-red-100 to-rose-100',
      textColor: 'text-red-600',
      buttonGradient: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
      pulseColor: 'bg-red-400',
    },
    warning: {
      icon: <AlertCircle className="w-16 h-16" />,
      gradient: 'from-orange-400 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      iconBg: 'bg-gradient-to-br from-orange-100 to-amber-100',
      textColor: 'text-orange-600',
      buttonGradient: 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700',
      pulseColor: 'bg-orange-400',
    },
    info: {
      icon: <Info className="w-16 h-16" />,
      gradient: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100',
      textColor: 'text-blue-600',
      buttonGradient: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
      pulseColor: 'bg-blue-400',
    },
  }

  const config = iconConfig[type]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Gradient Header Strip */}
        <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 group"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>

        {/* Content */}
        <div className="p-8 pt-6">
          {/* Icon with animated background */}
          <div className="relative flex justify-center mb-6">
            {/* Pulsing ring effect */}
            <div className={`absolute w-24 h-24 rounded-full ${config.pulseColor} opacity-20 animate-ping`} style={{ animationDuration: '2s' }} />
            <div className={`absolute w-20 h-20 rounded-full ${config.pulseColor} opacity-10 animate-ping`} style={{ animationDuration: '2s', animationDelay: '0.5s' }} />

            {/* Icon container */}
            <div className={`relative w-20 h-20 rounded-full ${config.iconBg} ${config.borderColor} border-2 flex items-center justify-center shadow-lg`}>
              <div className={`${config.textColor} animate-in zoom-in duration-500`} style={{ animationDelay: '0.2s' }}>
                {config.icon}
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className={`text-center p-6 rounded-2xl bg-gradient-to-br ${config.bgGradient} ${config.borderColor} border mb-6`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
              {title}
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
              {message}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg bg-gradient-to-r ${config.buttonGradient} shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50`}
          >
            Got it
          </button>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-gray-400 mt-3">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono text-xs">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}

interface TrackUploadSectionProps {
  releaseData: ReleaseData
  releaseId: string | null
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
  onTracksUpdate?: (tracks: TrackData[]) => void
}

const TRACK_UPLOAD_INTRO_COLLAPSED_STORAGE_KEY = 'artist-music-manager:track-upload-intro-collapsed:v1'

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

  // Check filename format: "Artist Name - Track Title.wav" (flexible with spaces around hyphen)
  const filenamePattern = /^.+\s*-\s*.+\.(wav|aiff|aif)$/i
  if (!filenamePattern.test(file.name)) {
    return { valid: false, error: 'Filename must be in format: "Artist Name - Track Title.wav"' }
  }

  return { valid: true }
}

// Extract duration (in seconds) from a local audio File using the browser's
// HTMLAudioElement. Returns 0 on any error so it never blocks the upload.
const getAudioDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    const cleanup = (value: number) => {
      URL.revokeObjectURL(url)
      audio.src = ''
      resolve(value)
    }
    audio.addEventListener('loadedmetadata', () => {
      const secs = Number.isFinite(audio.duration) && audio.duration > 0
        ? Math.round(audio.duration)
        : 0
      cleanup(secs)
    })
    audio.addEventListener('error', () => cleanup(0))
    // Some browsers need a timeout fallback if metadata never fires
    const timeout = window.setTimeout(() => cleanup(0), 8000)
    audio.addEventListener('loadedmetadata', () => window.clearTimeout(timeout), { once: true })
    audio.preload = 'metadata'
    audio.src = url
  })

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

const normalizeISWCInput = (value: string) => value.replace(/[.\s]/g, '').toUpperCase()

const resolveMusicalWorkTitle = (track: Pick<TrackData, 'trackTitle' | 'musicalWorkTitle'>) => {
  const musicalWorkTitle = track.musicalWorkTitle.trim()
  if (musicalWorkTitle) return musicalWorkTitle
  return track.trackTitle.trim()
}

const buildTrackPayload = (track: TrackData, releaseId: string, releaseVersion: string) => ({
  releaseId,
  trackNumber: track.trackNumber,
  trackTitle: track.trackTitle,
  trackTitleConfirmed: track.trackTitleConfirmed,
  trackVersion: track.trackVersion || releaseVersion,
  masterRecordingDate: track.masterRecordingDate,
  isrc: track.isrc.replace(/-/g, '').toUpperCase(),
  isrcConfirmed: track.isrcConfirmed,
  iswc: track.iswc,
  iswcConfirmed: track.iswcConfirmed,
  musicalWorkTitle: resolveMusicalWorkTitle(track),
  musicalWorkTitleConfirmed: track.musicalWorkTitleConfirmed,
  primaryArtists: track.primaryArtists,
  featuredArtists: track.featuredArtists,
  sessionArtists: track.sessionArtists,
  creators: track.creators,
  producers: track.producers,
  coverRights: track.coverRights,
  coverLicenseUrl: track.coverLicenseUrl,
  remixRights: track.remixRights,
  remixAuthorizationUrl: track.remixAuthorizationUrl,
  samplesRights: track.samplesRights,
  samplesClearanceUrl: track.samplesClearanceUrl,
  primaryGenre: track.primaryGenre,
  secondaryGenre: track.secondaryGenre,
  primaryMood: track.primaryMood,
  secondaryMoods: track.secondaryMoods,
  primaryLanguage: track.primaryLanguage,
  secondaryLanguage: track.secondaryLanguage,
  explicitContent: track.explicitContent,
  childSafeContent: track.childSafeContent,
  audioFileUrl: track.audioFileUrl,
  audioFileSize: track.audioFileSize,
  audioFormat: track.audioFormat,
  dolbyAtmosFileUrl: track.dolbyAtmosFileUrl,
  previewStartTime: track.previewStartTime,
  hasNoLyrics: track.hasNoLyrics,
  lyricsInputMode: track.lyricsInputMode,
  lyrics: track.lyrics,
  lyricsConfirmed: track.lyricsConfirmed,
  lyricsFileUrl: track.lyricsFileUrl,
  hasNoVideo: track.hasNoVideo,
  videoUrl: track.videoUrl,
  videoUrlConfirmed: track.videoUrlConfirmed,
  durationSeconds: track.durationSeconds,
  aiUsed: track.aiUsed,
  aiType: track.aiType
})

export function TrackUploadSection({ releaseData, releaseId, onUpdate, onTracksUpdate }: TrackUploadSectionProps) {
  const [tracks, setTracks] = useState<TrackData[]>([])
  const [defaultPrimaryArtists, setDefaultPrimaryArtists] = useState<TrackData['primaryArtists']>([])
  const [defaultCreators, setDefaultCreators] = useState<TrackData['creators']>([])
  const [uploadingTrackIndex, setUploadingTrackIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const [isLoadingTracks, setIsLoadingTracks] = useState(true)
  const [savingTrackIndex, setSavingTrackIndex] = useState<number | null>(null)
  const [verifyingISRC, setVerifyingISRC] = useState<Record<number, boolean>>({})
  const [isrcErrors, setIsrcErrors] = useState<Record<number, string>>({})
  const [isrcSuccess, setIsrcSuccess] = useState<Record<number, string>>({})
  const [verifyingISWC, setVerifyingISWC] = useState<Record<number, boolean>>({})
  const [iswcErrors, setIswcErrors] = useState<Record<number, string>>({})
  const [iswcSuccess, setIswcSuccess] = useState<Record<number, string>>({})
  const [isTrackUploadIntroCollapsed, setIsTrackUploadIntroCollapsed] = useState(false)
  const [showISRCInfo, setShowISRCInfo] = useState(false)
  const [showISWCInfo, setShowISWCInfo] = useState(false)
  const fileInputRefs = useRef<Record<number | string, HTMLInputElement | null>>({})
  const lyricsFileInputRefs = useRef<Record<number | string, HTMLInputElement | null>>({})
  const onTracksUpdateRef = useRef(onTracksUpdate)

  useEffect(() => {
    onTracksUpdateRef.current = onTracksUpdate
  }, [onTracksUpdate])

  useEffect(() => {
    let cancelled = false

    const loadArtistDefaults = async () => {
      try {
        const response = await fetch('/api/artist-profile', { cache: 'no-store' })
        const result = await response.json()
        const stageName = typeof result?.data?.stage_name === 'string' ? result.data.stage_name.trim() : ''
        const performerIsni = typeof result?.data?.performer_isni === 'string' ? result.data.performer_isni.trim() : ''
        const creatorIpiCae = typeof result?.data?.creator_ipi_cae === 'string' ? result.data.creator_ipi_cae.trim() : ''

        if (!cancelled && stageName) {
          setDefaultPrimaryArtists([
            {
              id: 'artist-profile-owner',
              name: stageName,
              isni: performerIsni,
              confirmed: true
            }
          ])

          setDefaultCreators([
            {
              id: 'artist-profile-creator',
              name: stageName,
              isni: performerIsni,
              ipiCae: creatorIpiCae,
              roles: [],
              confirmed: true
            }
          ])
        }
      } catch (error) {
        console.error('TrackUploadSection: Error loading artist defaults:', error)
      }
    }

    void loadArtistDefaults()

    return () => {
      cancelled = true
    }
  }, [])

  // Initialize tracks based on trackCount and load from DB if releaseId exists
  useEffect(() => {
    let isMounted = true

    const initializeTracks = async () => {
      console.log('TrackUploadSection: Initializing tracks...', {
        releaseId,
        trackCount: releaseData.trackCount
      })

      if (!isMounted) return
      setIsLoadingTracks(true)

      try {
        // If we have a releaseId, try to load existing tracks first
        if (releaseId) {
          console.log('TrackUploadSection: Loading existing tracks from DB...')
          try {
            const response = await fetch(`/api/music-tracks?releaseId=${releaseId}`)
            const result = await response.json()
            console.log('TrackUploadSection: API response:', result)

            if (result.success && result.data && result.data.length > 0) {
              console.log('TrackUploadSection: Found existing tracks:', result.data.length)
              // Load existing tracks from database
              const loadedTracks = result.data.map((dbTrack: any) => ({
                id: dbTrack.id,
                trackNumber: dbTrack.track_number,
                trackTitle: dbTrack.track_title || '',
                trackTitleConfirmed: dbTrack.track_title_confirmed || false,
                trackVersion: dbTrack.track_version || releaseData.releaseVersion || '',
                masterRecordingDate: dbTrack.master_recording_date || '',
                isrc: dbTrack.isrc || '',
                isrcConfirmed: dbTrack.isrc_confirmed || false,
                iswc: dbTrack.iswc || '',
                iswcConfirmed: dbTrack.iswc_confirmed || false,
                musicalWorkTitle: dbTrack.musical_work_title || dbTrack.track_title || '',
                musicalWorkTitleConfirmed: dbTrack.musical_work_title_confirmed || false,
                primaryArtists: dbTrack.primary_artists || [],
                featuredArtists: dbTrack.featured_artists || [],
                sessionArtists: dbTrack.session_artists || [],
                creators: dbTrack.creators || [],
                producers: dbTrack.producers || [],
                coverRights: dbTrack.cover_rights || '',
                coverLicenseUrl: dbTrack.cover_license_url || '',
                remixRights: dbTrack.remix_rights || '',
                remixAuthorizationUrl: dbTrack.remix_authorization_url || '',
                samplesRights: dbTrack.samples_rights || '',
                samplesClearanceUrl: dbTrack.samples_clearance_url || '',
                primaryGenre: dbTrack.primary_genre || { familyId: '', mainGenres: [] },
                secondaryGenre: dbTrack.secondary_genre || { familyId: '', mainGenres: [] },
                primaryMood: dbTrack.primary_mood || '',
                secondaryMoods: dbTrack.secondary_moods || [],
                primaryLanguage: dbTrack.primary_language || '',
                secondaryLanguage: dbTrack.secondary_language || '',
                explicitContent: typeof dbTrack.explicit_content === 'boolean'
                  ? (dbTrack.explicit_content ? 'yes-explicit' : 'no-clean-original')
                  : (dbTrack.explicit_content || ''),
                childSafeContent: dbTrack.child_safe_content || '',
                audioFile: null,
                audioFileUrl: dbTrack.audio_file_url || '',
                audioFileSize: dbTrack.audio_file_size || 0,
                audioFormat: dbTrack.audio_format || '',
                dolbyAtmosFileUrl: dbTrack.dolby_atmos_file_url || '',
                previewStartTime: dbTrack.preview_start_time || 0,
                hasNoLyrics: dbTrack.no_lyrics || false,
                lyricsInputMode: dbTrack.lyrics_input_mode === 'upload' ? 'upload' : 'paste',
                lyrics: dbTrack.lyrics || '',
                lyricsConfirmed: dbTrack.lyrics_confirmed || false,
                lyricsFile: null,
                lyricsFileUrl: dbTrack.lyrics_file_url || '',
                hasNoVideo: dbTrack.no_video || false,
                videoUrl: dbTrack.video_url || '',
                videoUrlConfirmed: dbTrack.video_url_confirmed || false,
                durationSeconds: dbTrack.duration_seconds || 0,
                aiUsed: dbTrack.ai_used || false,
                aiType: dbTrack.ai_type || '',
                uploaded: !!dbTrack.audio_file_url
              }))

              // Ensure we always render the full expected track count.
              // Existing rows can be partial drafts when only some tracks were saved.
              const tracksByNumber = new Map<number, TrackData>()
              loadedTracks.forEach((track: TrackData) => {
                tracksByNumber.set(track.trackNumber, track)
              })

              const mergedTracks: TrackData[] = []
              for (let i = 1; i <= releaseData.trackCount; i++) {
                const existingTrack = tracksByNumber.get(i)
                const fallbackTrack = createTrackData(i)
                mergedTracks.push(
                  existingTrack
                    ? {
                        ...existingTrack,
                        musicalWorkTitle: resolveMusicalWorkTitle(existingTrack),
                        creators:
                          existingTrack.creators?.length
                            ? existingTrack.creators
                            : defaultCreators,
                        primaryArtists:
                          existingTrack.primaryArtists?.length
                            ? existingTrack.primaryArtists
                            : defaultPrimaryArtists
                      }
                    : {
                        ...fallbackTrack,
                        creators: defaultCreators,
                        primaryArtists: defaultPrimaryArtists
                      }
                )
              }

              if (!isMounted) return
              setTracks(mergedTracks)
              console.log('TrackUploadSection: Loaded existing tracks successfully')
              return // Exit early if we loaded tracks
            } else {
              console.log('TrackUploadSection: No existing tracks found, will create new ones')
            }
          } catch (error) {
            console.error('TrackUploadSection: Error loading tracks from API:', error)
            // Fall through to create new tracks
          }
        }

        // If no releaseId or failed to load, create new empty tracks
        if (releaseData.trackCount > 0) {
          console.log('TrackUploadSection: Creating new empty tracks:', releaseData.trackCount)
          const newTracks: TrackData[] = []
          for (let i = 1; i <= releaseData.trackCount; i++) {
            newTracks.push({
              ...createTrackData(i),
              creators: defaultCreators,
              primaryArtists: defaultPrimaryArtists
            })
          }
          console.log('TrackUploadSection: Created tracks:', newTracks.length)
          if (!isMounted) return
          setTracks(newTracks)
        } else {
          console.log('TrackUploadSection: No tracks to create (trackCount = 0)')
          if (!isMounted) return
          setTracks([])
        }
      } catch (error) {
        console.error('TrackUploadSection: Fatal error during initialization:', error)
      } finally {
        if (isMounted) {
          setIsLoadingTracks(false)
          console.log('TrackUploadSection: Initialization complete, loading=false')
        }
      }
    }

    initializeTracks()

    return () => {
      isMounted = false
    }
  }, [defaultCreators, defaultPrimaryArtists, releaseData.trackCount, releaseId])

  useEffect(() => {
    if (defaultPrimaryArtists.length === 0 && defaultCreators.length === 0) return

    setTracks((prev) => {
      if (prev.length === 0) return prev

      const updated = prev.map((track) => ({
        ...track,
        primaryArtists: track.primaryArtists?.length ? track.primaryArtists : defaultPrimaryArtists,
        creators: track.creators?.length ? track.creators : defaultCreators
      }))
      return updated
    })
  }, [defaultCreators, defaultPrimaryArtists])

  useEffect(() => {
    if (isLoadingTracks) return
    onTracksUpdateRef.current?.(tracks)
  }, [tracks, isLoadingTracks])


  const updateTrack = (index: number, field: keyof TrackData, value: unknown) => {
    setTracks(prev => {
      const updated = [...prev]
      const currentTrack = updated[index]
      const nextTrack = { ...currentTrack, [field]: value }

      if (field === 'trackTitle' && typeof value === 'string') {
        const nextTitle = value
        const shouldMirrorToMusicalWorkTitle =
          !currentTrack.musicalWorkTitle.trim() ||
          currentTrack.musicalWorkTitle.trim() === currentTrack.trackTitle.trim()

        if (shouldMirrorToMusicalWorkTitle) {
          nextTrack.musicalWorkTitle = nextTitle
        }
      }

      updated[index] = nextTrack
      return updated
    })
  }

  const handleAudioFileSelect = async (index: number, file: File | null) => {
    if (!file) return

    const validation = validateAudioFile(file)
    if (!validation.valid) {
      showNotification('Invalid Audio File', validation.error || 'Please check the file format and try again.', 'error')
      return
    }

    updateTrack(index, 'audioFile', file)
    updateTrack(index, 'audioFormat', file.name.split('.').pop()?.toUpperCase() || 'WAV')

    // Upload file
    await uploadAudioFile(index, file)
  }

  const parseUploadFailure = (xhr: XMLHttpRequest): { success: false; error: string } => {
    const rawText = xhr.responseText?.trim() || ''
    const contentType = xhr.getResponseHeader('content-type') || ''

    if (contentType.includes('application/json') && rawText) {
      try {
        const parsed = JSON.parse(rawText) as { error?: string; details?: string }
        return {
          success: false,
          error: parsed.error || parsed.details || 'Upload failed'
        }
      } catch {
        // Fall through to the generic parser below.
      }
    }

    if (xhr.status === 413 || /payload too large/i.test(rawText)) {
      return {
        success: false,
        error: 'Upload failed before Gigrilla could process the file. The file is still only selected locally and has not been uploaded.'
      }
    }

    if (rawText) {
      const compactText = rawText
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 180)

      return {
        success: false,
        error: compactText || `Upload failed with status ${xhr.status}`
      }
    }

    return {
      success: false,
      error: `Upload failed with status ${xhr.status || 'unknown'}. The file is still only selected locally and has not been uploaded.`
    }
  }

  /**
   * Generic helper: get a pre-signed R2 PUT URL from /api/upload/sign, then
   * PUT the file bytes directly to R2 (bypassing Vercel's 4.5 MB body limit).
   * Returns the permanent public URL on success; throws on failure.
   */
  const presignedUpload = async (type: string, file: File, entityId?: string): Promise<string> => {
    const signRes = await fetch('/api/upload/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        entityId,
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSize: file.size,
      }),
    })

    if (!signRes.ok) {
      let errMsg = 'Could not prepare upload'
      try {
        const errData = await signRes.json()
        errMsg = errData.error || errMsg
      } catch {}
      throw new Error(errMsg)
    }

    const { uploadUrl, publicUrl } = await signRes.json() as { uploadUrl: string; publicUrl: string }

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })

    if (!putRes.ok) {
      throw new Error(`Upload to storage failed (${putRes.status}). Please try again.`)
    }

    return publicUrl
  }

  const uploadAudioFile = async (index: number, file: File) => {
    if (!releaseId) {
      showNotification('Release Not Saved', 'Please save the release first before uploading tracks.', 'warning')
      return
    }

    setUploadingTrackIndex(index)
    setUploadProgress(prev => ({ ...prev, [index]: 0 }))

    // Read duration from local file now, before the upload occupies the thread.
    // We pass it explicitly to saveTrackSilently rather than relying on a state
    // update propagating in time.
    const durationSeconds = await getAudioDuration(file)
    if (durationSeconds > 0) {
      updateTrack(index, 'durationSeconds', durationSeconds)
    }

    try {
      // ----------------------------------------------------------------
      // Step 1: Ask our server for a pre-signed R2 PUT URL.
      // This is a tiny JSON request — no file bytes sent here — so it is
      // never blocked by any body-size limit.
      // ----------------------------------------------------------------
      const signRes = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'track-audio',
          entityId: releaseId,
          filename: file.name,
          contentType: file.type || 'audio/wav',
          fileSize: file.size,
        }),
      })

      if (!signRes.ok) {
        let errMsg = 'Could not prepare upload'
        try {
          const errData = await signRes.json()
          errMsg = errData.error || errMsg
        } catch {}
        showNotification('Upload Failed', errMsg, 'error')
        return
      }

      const { uploadUrl, publicUrl } = await signRes.json() as { uploadUrl: string; publicUrl: string }

      // ----------------------------------------------------------------
      // Step 2: PUT the file bytes DIRECTLY to R2 via the pre-signed URL.
      // The bytes never pass through our Next.js server, so there is no
      // server-side body-size limit to hit.
      // ----------------------------------------------------------------
      const directUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(prev => ({ ...prev, [index]: percentComplete }))
          }
        })

        xhr.addEventListener('load', () => {
          // R2 returns 200 on success for pre-signed PUT
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(publicUrl)
          } else {
            const statusText = xhr.statusText || String(xhr.status)
            reject(new Error(`Upload to storage failed (${statusText}). Please try again.`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload. Please check your connection and try again.'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'))
        })

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type || 'audio/wav')
        xhr.send(file)
      })

      // ----------------------------------------------------------------
      // Step 3: Record the result in state and persist to DB.
      // ----------------------------------------------------------------
      const audioFormat = file.name.split('.').pop()?.toUpperCase() || 'WAV'
      const audioFileSize = file.size
      updateTrack(index, 'audioFileUrl', directUrl)
      updateTrack(index, 'audioFileSize', audioFileSize)
      updateTrack(index, 'audioFormat', audioFormat)
      updateTrack(index, 'uploaded', true)

      await saveTrackSilently(index, {
        audioFileUrl: directUrl,
        audioFileSize,
        audioFormat,
        uploaded: true,
        ...(durationSeconds > 0 ? { durationSeconds } : {}),
      })
      showNotification(
        'Upload Complete',
        'Your audio file has been uploaded and saved as a draft. You can add ISRC/title details anytime.',
        'success'
      )
    } catch (error) {
      console.error('Error uploading audio:', error)
      updateTrack(index, 'audioFileUrl', '')
      updateTrack(index, 'audioFileSize', 0)
      updateTrack(index, 'uploaded', false)
      const msg = error instanceof Error ? error.message : 'Failed to upload audio file. Please check your connection and try again.'
      showNotification('Upload Error', msg, 'error')
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
      showNotification('Release Not Saved', 'Please save the release first before uploading lyrics.', 'warning')
      return
    }

    try {
      const lyricsUrl = await presignedUpload('track-lyrics', file, releaseId)

      // Read lyrics file content locally (file is already in memory)
      const text = await file.text()
      updateTrack(index, 'hasNoLyrics', false)
      updateTrack(index, 'lyricsInputMode', 'upload')
      updateTrack(index, 'lyrics', text)
      updateTrack(index, 'lyricsFileUrl', lyricsUrl)
      updateTrack(index, 'lyricsConfirmed', false)
      await saveTrackSilently(index, {
        hasNoLyrics: false,
        lyricsInputMode: 'upload',
        lyrics: text,
        lyricsFileUrl: lyricsUrl,
        lyricsConfirmed: false
      })
    } catch (error) {
      console.error('Error uploading lyrics:', error)
      showNotification('Upload Error', 'Failed to upload lyrics file. Please check your connection and try again.', 'error')
    }
  }

  const applyToAllTracks = (field: keyof TrackData, value: unknown) => {
    setTracks(prev => prev.map(track => ({ ...track, [field]: value })))
  }

  const verifyISRC = async (index: number, isrcCode: string) => {
    if (!isrcCode.trim()) return

    const validation = validateISRC(isrcCode)
    if (!validation.valid) {
      setIsrcErrors(prev => ({ ...prev, [index]: validation.error || 'Invalid ISRC' }))
      setIsrcSuccess(prev => {
        const updated = { ...prev }
        delete updated[index]
        return updated
      })
      return
    }

    setVerifyingISRC(prev => ({ ...prev, [index]: true }))
    setIsrcErrors(prev => {
      const updated = { ...prev }
      delete updated[index]
      return updated
    })
    setIsrcSuccess(prev => {
      const updated = { ...prev }
      delete updated[index]
      return updated
    })

    try {
      const cleanedISRC = isrcCode.replace(/-/g, '').toUpperCase()
      const response = await fetch(`/api/verify-isrc?isrc=${encodeURIComponent(cleanedISRC)}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }))
        setIsrcErrors(prev => ({ ...prev, [index]: errorData.error || 'Failed to verify ISRC. Please try again.' }))
        return
      }

      const result = await response.json()

      if (result.valid) {
        // Update ISRC with formatted version
        updateTrack(index, 'isrc', result.isrc)

        if (result.found && result.data) {
          // Auto-fill track details if found
          if (result.data.trackTitle && !tracks[index].trackTitle) {
            updateTrack(index, 'trackTitle', result.data.trackTitle)
          }
          if (result.data.duration) {
            updateTrack(index, 'durationSeconds', result.data.duration)
          }
          setIsrcSuccess(prev => ({
            ...prev,
            [index]: `✓ Verified: ${result.data.trackTitle || 'Track found'} ${result.data.source ? `(${result.data.source})` : ''}`
          }))
        } else {
          setIsrcSuccess(prev => ({
            ...prev,
            [index]: '✓ ISRC format valid. Please enter track details manually.'
          }))
        }

        // Mark as confirmed since it's verified
        updateTrack(index, 'isrcConfirmed', true)
      } else {
        setIsrcErrors(prev => ({ ...prev, [index]: result.error || 'Invalid ISRC' }))
      }
    } catch (error) {
      console.error('ISRC verification error:', error)
      setIsrcErrors(prev => ({ ...prev, [index]: 'Failed to verify ISRC. Please check your connection.' }))
    } finally {
      setVerifyingISRC(prev => ({ ...prev, [index]: false }))
    }
  }

  const verifyISWC = async (index: number, iswcCode: string) => {
    if (!iswcCode.trim()) return

    setVerifyingISWC(prev => ({ ...prev, [index]: true }))
    setIswcErrors(prev => {
      const updated = { ...prev }
      delete updated[index]
      return updated
    })
    setIswcSuccess(prev => {
      const updated = { ...prev }
      delete updated[index]
      return updated
    })

    try {
      const cleanedISWC = iswcCode.replace(/[-.\s]/g, '').toUpperCase()
      const response = await fetch(`/api/verify-iswc?iswc=${encodeURIComponent(cleanedISWC)}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }))
        setIswcErrors(prev => ({ ...prev, [index]: errorData.error || 'Failed to verify ISWC. Please try again.' }))
        return
      }

      const result = await response.json()

      if (result.valid) {
        // Update ISWC with formatted version
        updateTrack(index, 'iswc', result.iswc)

        if (result.found && result.data) {
          // Auto-fill musical work title if found and not already set
          if (result.data.workTitle && !tracks[index].musicalWorkTitle) {
            updateTrack(index, 'musicalWorkTitle', result.data.workTitle)
          }
          setIswcSuccess(prev => ({
            ...prev,
            [index]: `✓ Verified: ${result.data.workTitle || 'Musical work found'} ${result.data.source ? `(${result.data.source})` : ''}`
          }))
        } else {
          setIswcSuccess(prev => ({
            ...prev,
            [index]: '✓ ISWC format valid. Please enter musical work details manually.'
          }))
        }

        // Mark as confirmed since it's verified
        updateTrack(index, 'iswcConfirmed', true)
      } else {
        setIswcErrors(prev => ({ ...prev, [index]: result.error || 'Invalid ISWC' }))
      }
    } catch (error) {
      console.error('ISWC verification error:', error)
      setIswcErrors(prev => ({ ...prev, [index]: 'Failed to verify ISWC. Please check your connection.' }))
    } finally {
      setVerifyingISWC(prev => ({ ...prev, [index]: false }))
    }
  }

  const saveTrackSilently = async (index: number, overrides?: Partial<TrackData>) => {
    const track = tracks[index]
    if (!releaseId) return
    if (!track) return

    const mergedTrack: TrackData = { ...track, ...overrides }

    try {
      const payload = buildTrackPayload(mergedTrack, releaseId, releaseData.releaseVersion)

      const response = await fetch('/api/music-tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.id) {
          updateTrack(index, 'id', result.data.id)
        }
      }
    } catch (error) {
      console.error('Error auto-saving track:', error)
      // Fail silently - user can still manually save later
    }
  }

  const saveTrack = async (index: number) => {
    const track = tracks[index]

    if (!releaseId) {
      showNotification('Release Not Saved', 'Please save the release first before saving tracks.', 'warning')
      return
    }

    if (!track) return

    setSavingTrackIndex(index)
    try {
      const payload = buildTrackPayload(track, releaseId, releaseData.releaseVersion)

      const response = await fetch('/api/music-tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }))
        showNotification('Save Failed', errorData.error || 'Failed to save track. Please try again.', 'error')
        return
      }

      const result = await response.json()

      if (result.success) {
        if (result.data?.id) {
          updateTrack(index, 'id', result.data.id)
        }
        showNotification('Success!', `Track ${track.trackNumber} draft saved. You can switch tracks and come back later.`, 'success')
      } else {
        showNotification('Save Failed', result.error || 'Failed to save track. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Error saving track:', error)
      showNotification('Save Error', 'Failed to save track. Please check your connection and try again.', 'error')
    } finally {
      setSavingTrackIndex(null)
    }
  }

  const selectTrack = async (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(tracks.length - 1, nextIndex))
    if (boundedIndex === currentPage) return

    if (releaseId && tracks[currentPage]) {
      await saveTrackSilently(currentPage)
    }

    setCurrentPage(boundedIndex)
    window.scrollTo(0, 0)
  }

  const isYouTubeVideoUrl = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return false

    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
      return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname)
    } catch {
      return false
    }
  }

  const confirmVideoLink = async (index: number) => {
    const track = tracks[index]
    const videoUrl = track.videoUrl.trim()

    if (!videoUrl) {
      showNotification('Missing Video Link', 'Paste a YouTube music video link before confirming.', 'warning')
      return
    }

    if (!isYouTubeVideoUrl(videoUrl)) {
      showNotification('Invalid Video Link', 'Please use a valid YouTube or youtu.be link.', 'error')
      return
    }

    updateTrack(index, 'hasNoVideo', false)
    updateTrack(index, 'videoUrlConfirmed', true)
    await saveTrackSilently(index, {
      hasNoVideo: false,
      videoUrl,
      videoUrlConfirmed: true
    })
    showNotification('Video Link Confirmed', `Track ${track.trackNumber} YouTube music video link saved.`, 'success')
  }

  const [expandedSections, setExpandedSections] = useState<Record<number, Set<string>>>({})
  const [currentPage, setCurrentPage] = useState(0) // For single-track pagination

  // Notification modal state
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ isOpen: true, title, message, type })
  }

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }

  // Auto-expand key sections for the first track on mount
  useEffect(() => {
    if (tracks.length > 0 && Object.keys(expandedSections).length === 0) {
      setExpandedSections({
        0: new Set(['registration', 'upload']) // Expand these sections for first track
      })
    }
  }, [tracks.length])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedState = window.localStorage.getItem(TRACK_UPLOAD_INTRO_COLLAPSED_STORAGE_KEY)
    if (savedState === '1') {
      setIsTrackUploadIntroCollapsed(true)
    }
  }, [])

  const toggleTrackUploadIntroCollapsed = () => {
    setIsTrackUploadIntroCollapsed((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TRACK_UPLOAD_INTRO_COLLAPSED_STORAGE_KEY, next ? '1' : '0')
      }
      return next
    })
  }

  const toggleSection = (trackIndex: number, section: string) => {
    setExpandedSections(prev => {
      const trackSections = prev[trackIndex] || new Set()
      const newSections = new Set(trackSections)
      if (newSections.has(section)) {
        newSections.delete(section)
      } else {
        newSections.add(section)
      }
      return { ...prev, [trackIndex]: newSections }
    })
  }

  const isSectionExpanded = (trackIndex: number, section: string) => {
    return expandedSections[trackIndex]?.has(section) ?? false
  }

  // Calculate completion for progress indicators
  const getCompletion = (track: TrackData): number => {
    let done = 0
    if (track.trackTitle) done++
    if (track.isrc && track.isrcConfirmed) done++
    if (track.masterRecordingDate) done++
    if (track.audioFileUrl) done++
    if (track.primaryArtists?.length) done++
    if (track.coverRights) done++
    if (track.remixRights) done++
    if (track.samplesRights) done++
    return Math.round((done / 8) * 100)
  }

  // Determine which tracks to show
  const useSingleTrackView = tracks.length > 3
  const tracksToShow = useSingleTrackView ? [tracks[currentPage]] : tracks

  return (
    <>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      <SectionWrapper
        title="Upload Tracks"
        subtitle={`Upload audio files and metadata for each track in this ${releaseData.releaseType || 'release'}`}
      >
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={toggleTrackUploadIntroCollapsed}
              className="text-xs sm:text-sm"
            >
              {isTrackUploadIntroCollapsed ? (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Expand Upload Instructions
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Collapse Upload Instructions
                </>
              )}
            </Button>
          </div>

          {!isTrackUploadIntroCollapsed && (
            <>
              {/* Important: Show upload count status */}
              {releaseData.trackCount > 0 && !isLoadingTracks && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Music className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Ready to Upload {releaseData.trackCount} Track{releaseData.trackCount > 1 ? 's' : ''}
                      </h3>
                      <p className="text-gray-700 mb-4">
                        For each track below, you need to:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span><strong>Expand "Track Registration Details"</strong> - Enter ISRC, track title, and metadata</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span><strong>Expand "Track Uploader"</strong> - Upload your audio file (WAV/AIFF)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span><strong>Click "Save Track"</strong> at the bottom of each track</span>
                        </li>
                      </ul>
                      <p className="text-sm text-gray-600 mt-4 font-medium">
                        💡 Tip: The first track's sections are already expanded to get you started!
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
            </>
          )}

          {/* Loading State */}
          {isLoadingTracks && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">Loading tracks...</span>
            </div>
          )}

          {/* No Tracks Message */}
          {!isLoadingTracks && tracks.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No tracks to upload</p>
              <p className="text-sm text-gray-500 mt-1">
                Please go back to "Release Type" and select the number of tracks
              </p>
            </div>
          )}

          {/* Track Navigator */}
          {!isLoadingTracks && useSingleTrackView && (
            <div className="bg-white border-2 border-purple-200 rounded-xl p-4 mb-6 sticky top-4 z-10 shadow-lg">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => void selectTrack(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Prev
                  </Button>
                  <span className="text-sm font-bold">Track {currentPage + 1} of {tracks.length}</span>
                  <Button
                    variant="outline"
                    onClick={() => void selectTrack(currentPage + 1)}
                    disabled={currentPage === tracks.length - 1}
                  >
                    Next
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Progress:</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                      style={{ width: `${Math.round(tracks.reduce((s, t) => s + getCompletion(t), 0) / tracks.length)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{tracks.filter(t => t.uploaded).length}/{tracks.length}</span>
                </div>
              </div>
              <p className="mb-3 text-xs font-medium text-gray-600">
                Each track saves as its own draft. You can jump to any track and finish them in any order.
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <span className="text-xs font-semibold text-gray-600 self-center whitespace-nowrap">Jump:</span>
                {tracks.map((t, i) => {
                  const comp = getCompletion(t)
                  return (
                    <button
                      key={i}
                      onClick={() => void selectTrack(i)}
                      className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 font-bold text-sm transition-all relative ${currentPage === i
                        ? 'border-purple-500 bg-purple-500 text-white shadow-lg scale-110'
                        : comp === 100
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                        }`}
                    >
                      {i + 1}
                      {t.uploaded && currentPage !== i && (
                        <CheckCircle className="w-3 h-3 text-emerald-600 absolute -top-1 -right-1 bg-white rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Track Cards */}
          {!isLoadingTracks && tracksToShow.map((track, idx) => {
            const index = useSingleTrackView ? currentPage : idx
            const trackExpanded = expandedSections[index] || new Set()
            return (
              <div key={track.trackNumber} className="border border-gray-200 rounded-xl p-6 bg-white">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-bold text-gray-900 ${useSingleTrackView ? 'text-2xl' : 'text-lg'}`}>
                        Track {track.trackNumber}
                      </h3>
                      {track.trackTitle && (
                        <span className={`text-gray-600 ${useSingleTrackView ? 'text-lg' : 'text-sm'}`}>
                          {track.trackTitle}
                        </span>
                      )}
                    </div>
                    {track.uploaded && (
                      <div className={`flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full ${useSingleTrackView ? 'border-2 border-emerald-300' : 'border border-emerald-200'}`}>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Uploaded</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${useSingleTrackView ? 'h-3' : 'h-2'}`}>
                      <div
                        className={`h-full transition-all ${getCompletion(track) === 100 ? 'bg-emerald-500' :
                          getCompletion(track) >= 50 ? 'bg-purple-500' : 'bg-orange-400'
                          }`}
                        style={{ width: `${getCompletion(track)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 min-w-[60px]">{getCompletion(track)}%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Track Registration Details */}
                  <Collapsible
                    open={isSectionExpanded(index, 'registration')}
                    onOpenChange={() => toggleSection(index, 'registration')}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100">
                        <span className="font-semibold text-gray-900">Track Registration Details</span>
                        {isSectionExpanded(index, 'registration') ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4">
                      {/* ISRC Code */}
                      <div>
                        <Label htmlFor={`isrc-${index}`}>
                          ISRC Code <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id={`isrc-${index}`}
                            value={track.isrc}
                            onChange={(e) => {
                              updateTrack(index, 'isrc', e.target.value.toUpperCase())
                              // Clear previous verification status
                              setIsrcErrors(prev => {
                                const updated = { ...prev }
                                delete updated[index]
                                return updated
                              })
                              setIsrcSuccess(prev => {
                                const updated = { ...prev }
                                delete updated[index]
                                return updated
                              })
                              updateTrack(index, 'isrcConfirmed', false)
                            }}
                            onBlur={(e) => {
                              // Auto-verify on blur if ISRC is entered
                              if (e.target.value.trim().length >= 12) {
                                verifyISRC(index, e.target.value)
                              }
                            }}
                            placeholder="CC-XXX-YY-NNNNN"
                            className={`flex-1 ${isrcErrors[index] ? 'border-red-500' :
                              isrcSuccess[index] ? 'border-green-500' : ''
                              }`}
                            disabled={verifyingISRC[index]}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => verifyISRC(index, track.isrc)}
                            disabled={!track.isrc.trim() || verifyingISRC[index]}
                            className="whitespace-nowrap"
                          >
                            {verifyingISRC[index] ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verify
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowISRCInfo(true)}
                            className="text-sm text-purple-600 hover:text-purple-800 whitespace-nowrap px-2"
                          >
                            Get / Find
                          </Button>
                        </div>

                        {/* Verification Status Messages */}
                        {isrcErrors[index] && (
                          <div className="flex items-start gap-2 mt-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{isrcErrors[index]}</span>
                          </div>
                        )}
                        {isrcSuccess[index] && (
                          <div className="flex items-start gap-2 mt-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{isrcSuccess[index]}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            id={`isrc-confirmed-${index}`}
                            checked={track.isrcConfirmed}
                            onChange={(e) => updateTrack(index, 'isrcConfirmed', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <Label htmlFor={`isrc-confirmed-${index}`} className="text-sm text-gray-600 cursor-pointer">
                            Confirm ISRC {track.isrcConfirmed && '✓'}
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Enter your ISRC code and we'll automatically verify it and look up track details
                        </p>
                      </div>

                      {/* ISWC Code */}
                      <div>
                        <Label htmlFor={`iswc-${index}`}>ISWC Code (Musical Work)</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id={`iswc-${index}`}
                            value={track.iswc}
                            onChange={(e) => {
                              updateTrack(index, 'iswc', normalizeISWCInput(e.target.value))
                              // Clear previous verification status
                              setIswcErrors(prev => {
                                const updated = { ...prev }
                                delete updated[index]
                                return updated
                              })
                              setIswcSuccess(prev => {
                                const updated = { ...prev }
                                delete updated[index]
                                return updated
                              })
                              updateTrack(index, 'iswcConfirmed', false)
                            }}
                            onBlur={(e) => {
                              // Auto-verify on blur if ISWC is entered
                              if (e.target.value.trim().length >= 11) {
                                verifyISWC(index, e.target.value)
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault()
                              const pastedText = e.clipboardData.getData('text')
                              updateTrack(index, 'iswc', normalizeISWCInput(pastedText))
                              setIswcErrors(prev => {
                                const updated = { ...prev }
                                delete updated[index]
                                return updated
                              })
                              setIswcSuccess(prev => {
                                const updated = { ...prev }
                                delete updated[index]
                                return updated
                              })
                              updateTrack(index, 'iswcConfirmed', false)
                            }}
                            placeholder="T-123456789-0"
                            className={`flex-1 ${iswcErrors[index] ? 'border-red-500' :
                              iswcSuccess[index] ? 'border-green-500' : ''
                              }`}
                            disabled={verifyingISWC[index]}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => verifyISWC(index, track.iswc)}
                            disabled={!track.iswc.trim() || verifyingISWC[index]}
                            className="whitespace-nowrap"
                          >
                            {verifyingISWC[index] ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verify
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowISWCInfo(true)}
                            className="text-sm text-purple-600 hover:text-purple-800 whitespace-nowrap px-2"
                          >
                            Get / Find
                          </Button>
                        </div>

                        {/* Verification Status Messages */}
                        {iswcErrors[index] && (
                          <div className="flex items-start gap-2 mt-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{iswcErrors[index]}</span>
                          </div>
                        )}
                        {iswcSuccess[index] && (
                          <div className="flex items-start gap-2 mt-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{iswcSuccess[index]}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            id={`iswc-confirmed-${index}`}
                            checked={track.iswcConfirmed}
                            onChange={(e) => updateTrack(index, 'iswcConfirmed', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <Label htmlFor={`iswc-confirmed-${index}`} className="text-sm text-gray-600 cursor-pointer">
                            Confirm ISWC {track.iswcConfirmed && '✓'}
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Enter your ISWC code and we'll automatically verify it and look up musical work details
                        </p>
                      </div>

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
                        <Label htmlFor={`track-version-${index}`}>Track Version <span className="text-red-500">*</span></Label>
                        <div className="space-y-2">
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
                          {track.trackVersion !== 'deluxe' && releaseData.trackCount > 1 && (
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    applyToAllTracks('trackVersion', track.trackVersion || releaseData.releaseVersion)
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              Apply Track Version to All Tracks in This Release
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Master Recording Date */}
                      <div>
                        <Label htmlFor={`master-date-${index}`}>
                          Date of Master Recording <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Input
                            id={`master-date-month-${index}`}
                            type="month"
                            value={track.masterRecordingDate}
                            onChange={(e) => updateTrack(index, 'masterRecordingDate', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                        <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                applyToAllTracks('masterRecordingDate', track.masterRecordingDate)
                              }
                            }}
                            className="w-4 h-4"
                          />
                          Apply Master Recording Date to All Tracks in This Release
                        </label>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Musical Work Title */}
                  <Collapsible
                    open={isSectionExpanded(index, 'musical-work')}
                    onOpenChange={() => toggleSection(index, 'musical-work')}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100">
                        <span className="font-semibold text-gray-900">Musical Work Title</span>
                        {isSectionExpanded(index, 'musical-work') ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div>
                        <Label htmlFor={`musical-work-title-${index}`}>Musical Work Title</Label>
                        <Input
                          id={`musical-work-title-${index}`}
                          value={track.musicalWorkTitle}
                          onChange={(e) => updateTrack(index, 'musicalWorkTitle', e.target.value)}
                          placeholder="Enter musical work title (defaults to track title)"
                          className="mt-1"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            id={`musical-work-title-confirmed-${index}`}
                            checked={track.musicalWorkTitleConfirmed}
                            onChange={(e) => updateTrack(index, 'musicalWorkTitleConfirmed', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <Label htmlFor={`musical-work-title-confirmed-${index}`} className="text-sm text-gray-600 cursor-pointer">
                            Confirm Musical Work Title
                          </Label>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>


                  {/* Track Talent */}
                  <Collapsible
                    open={isSectionExpanded(index, 'talent')}
                    onOpenChange={() => toggleSection(index, 'talent')}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100">
                        <span className="font-semibold text-gray-900">Track Talent</span>
                        {isSectionExpanded(index, 'talent') ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <TrackTalentSection
                        track={track}
                        trackIndex={index}
                        onUpdate={(field, value) => updateTrack(index, field, value)}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Track Rights */}
                  <Collapsible
                    open={isSectionExpanded(index, 'rights')}
                    onOpenChange={() => toggleSection(index, 'rights')}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100">
                        <span className="font-semibold text-gray-900">Track Rights</span>
                        {isSectionExpanded(index, 'rights') ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4">
                      {/* Cover Rights */}
                      <div>
                        <Label htmlFor={`cover-rights-${index}`}>
                          Is this Sound Recording a Cover Version? <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={track.coverRights}
                          onValueChange={(value) => updateTrack(index, 'coverRights', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-original">No (Original)</SelectItem>
                            <SelectItem value="yes-licensed">Yes (I have a Licence)</SelectItem>
                            <SelectItem value="yes-compulsory">Yes (Eligible Compulsory)</SelectItem>
                          </SelectContent>
                        </Select>
                        {(track.coverRights === 'yes-licensed' || track.coverRights === 'yes-compulsory') && (
                          <div className="mt-2">
                            <input
                              ref={(el) => { fileInputRefs.current[`cover-${index}`] = el }}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file || !releaseId) return

                                try {
                                  const url = await presignedUpload('cover-license', file, releaseId)
                                  updateTrack(index, 'coverLicenseUrl', url)
                                  showNotification('Success', 'Cover license uploaded successfully!', 'success')
                                } catch (error) {
                                  console.error('License upload error:', error)
                                  showNotification('Upload Error', error instanceof Error ? error.message : 'Failed to upload license. Please try again.', 'error')
                                }
                              }}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRefs.current[`cover-${index}`]?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Proof of Licence
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Remix Rights */}
                      <div>
                        <Label htmlFor={`remix-rights-${index}`}>
                          Is this Sound Recording a Remix or Derivative Work? <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={track.remixRights}
                          onValueChange={(value) => updateTrack(index, 'remixRights', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-original">No (Original)</SelectItem>
                            <SelectItem value="yes-authorized">Yes (Authorised)</SelectItem>
                            <SelectItem value="yes-unauthorized">Yes (Unauthorised: Not Allowed)</SelectItem>
                          </SelectContent>
                        </Select>
                        {track.remixRights === 'yes-authorized' && (
                          <div className="mt-2">
                            <input
                              ref={(el) => { fileInputRefs.current[`remix-${index}`] = el }}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file || !releaseId) return

                                try {
                                  const url = await presignedUpload('remix-authorization', file, releaseId)
                                  updateTrack(index, 'remixAuthorizationUrl', url)
                                  showNotification('Success', 'Remix authorization uploaded successfully!', 'success')
                                } catch (error) {
                                  console.error('Remix upload error:', error)
                                  showNotification('Upload Error', error instanceof Error ? error.message : 'Failed to upload authorisation. Please try again.', 'error')
                                }
                              }}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRefs.current[`remix-${index}`]?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Proof of Authorisation
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Samples Rights */}
                      <div>
                        <Label htmlFor={`samples-rights-${index}`}>
                          Are any Samples used in this Sound Recording? <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={track.samplesRights}
                          onValueChange={(value) => updateTrack(index, 'samplesRights', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-original">No (Original)</SelectItem>
                            <SelectItem value="yes-cleared">Yes (Cleared)</SelectItem>
                            <SelectItem value="yes-uncleared">Yes (Uncleared: Not Allowed)</SelectItem>
                          </SelectContent>
                        </Select>
                        {track.samplesRights === 'yes-cleared' && (
                          <div className="mt-2">
                            <input
                              ref={(el) => { fileInputRefs.current[`samples-${index}`] = el }}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file || !releaseId) return

                                try {
                                  const url = await presignedUpload('samples-clearance', file, releaseId)
                                  updateTrack(index, 'samplesClearanceUrl', url)
                                  showNotification('Success', 'Samples clearance uploaded successfully!', 'success')
                                } catch (error) {
                                  console.error('Sample upload error:', error)
                                  showNotification('Upload Error', error instanceof Error ? error.message : 'Failed to upload clearance. Please try again.', 'error')
                                }
                              }}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRefs.current[`samples-${index}`]?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Proof of Clearance
                            </Button>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Track Tags */}
                  <Collapsible
                    open={isSectionExpanded(index, 'tags')}
                    onOpenChange={() => toggleSection(index, 'tags')}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100">
                        <span className="font-semibold text-gray-900">Track Tags</span>
                        {isSectionExpanded(index, 'tags') ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <TrackTagsSection
                        track={track}
                        trackIndex={index}
                        onUpdate={(field, value) => updateTrack(index, field, value)}
                        applyToAll={applyToAllTracks}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Track Uploader */}
                  <Collapsible
                    open={isSectionExpanded(index, 'upload')}
                    onOpenChange={() => toggleSection(index, 'upload')}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100">
                        <span className="font-semibold text-gray-900">Track Uploader (Audio, Lyrics & Video)</span>
                        {isSectionExpanded(index, 'upload') ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4">
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="space-y-4">
                          {/* Standard Audio File */}
                          <div>
                            <Label>Standard Audio File <span className="text-red-500">*</span></Label>
                            <div className="mt-2">
                              <input
                                ref={(el) => { fileInputRefs.current[index] = el }}
                                type="file"
                                accept=".wav,.aiff,.aif,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff"
                                onChange={(e) => handleAudioFileSelect(index, e.target.files?.[0] || null)}
                                className="hidden"
                              />
                              <div className="flex items-center gap-3">
                                {track.audioFile && !track.audioFileUrl && uploadingTrackIndex !== index && (
                                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                                    Upload failed or not completed
                                  </span>
                                )}
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (track.audioFile && !track.audioFileUrl) {
                                      void uploadAudioFile(index, track.audioFile)
                                      return
                                    }

                                    fileInputRefs.current[index]?.click()
                                  }}
                                  disabled={uploadingTrackIndex === index}
                                  className={
                                    track.audioFile && !track.audioFileUrl
                                      ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200 hover:bg-emerald-700'
                                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                  }
                                >
                                  {uploadingTrackIndex === index ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Uploading... {uploadProgress[index] || 0}%
                                    </>
                                  ) : track.audioFile && !track.audioFileUrl ? (
                                    <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Retry Audio Upload
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      {track.audioFileUrl ? 'Replace Audio' : 'Upload Standard Audio File'}
                                    </>
                                  )}
                                </Button>
                              </div>
                              {uploadingTrackIndex === index && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-600">Uploading audio file...</span>
                                    <span className="font-medium text-purple-600">{uploadProgress[index] || 0}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                                      style={{ width: `${uploadProgress[index] || 0}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Please don&apos;t close this page while uploading</p>
                                </div>
                              )}
                              {track.audioFileUrl && (
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  Audio uploaded
                                </span>
                              )}
                              {track.audioFile && !track.audioFileUrl && uploadingTrackIndex !== index && (
                                <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <div>
                                      <p className="font-semibold">File selected locally only. Upload not confirmed yet.</p>
                                      <p className="mt-0.5 text-xs text-amber-800">Click the green retry button to upload this selected file, or choose another file to replace it.</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {track.audioFile && (
                                <span className="text-sm text-gray-600">
                                  {track.audioFile.name} ({(track.audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Dolby Atmos Audio File (Optional) */}
                          <div>
                            <Label>Dolby Atmos/Spacial Audio File (Optional)</Label>
                            <div className="mt-2">
                              <input
                                ref={(el) => { fileInputRefs.current[`dolby-${index}`] = el }}
                                type="file"
                                accept=".wav,.aiff,.aif,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (!file || !releaseId) return
                                  const validation = validateAudioFile(file)
                                  if (!validation.valid) {
                                    showNotification('Invalid Audio File', validation.error || 'Please check the file format.', 'error')
                                    return
                                  }
                                  try {
                                    // Get pre-signed URL then upload directly to R2
                                    const signRes = await fetch('/api/upload/sign', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        type: 'track-audio',
                                        entityId: releaseId,
                                        filename: file.name,
                                        contentType: file.type || 'audio/wav',
                                        fileSize: file.size,
                                      }),
                                    })
                                    if (!signRes.ok) {
                                      const errData = await signRes.json().catch(() => ({ error: 'Unknown error' }))
                                      showNotification('Upload Failed', errData.error || 'Failed to prepare Dolby Atmos upload.', 'error')
                                      return
                                    }
                                    const { uploadUrl, publicUrl } = await signRes.json() as { uploadUrl: string; publicUrl: string }
                                    const putRes = await fetch(uploadUrl, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': file.type || 'audio/wav' },
                                      body: file,
                                    })
                                    if (putRes.ok) {
                                      updateTrack(index, 'dolbyAtmosFileUrl', publicUrl)
                                      showNotification('Success', 'Dolby Atmos file uploaded successfully!', 'success')
                                    } else {
                                      showNotification('Upload Failed', `Upload to storage failed (${putRes.status}). Please try again.`, 'error')
                                    }
                                  } catch (error) {
                                    console.error('Dolby upload error:', error)
                                    showNotification('Upload Error', 'Failed to upload Dolby Atmos file. Please try again.', 'error')
                                  }
                                }}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRefs.current[`dolby-${index}`]?.click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Dolby Audio File
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                          <h4 className="font-semibold text-purple-800 mb-2">Audio upload notes</h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <p>Audio filenames must be <strong>Artist Name - Track Title.wav</strong>.</p>
                            <ul className="space-y-1 list-none">
                              <li>✓ WAV/AIFF 16-24-bit, 44.1-96 kHz. No clipping or dithering artifacts.</li>
                              <li>✓ Loudness tip: Aim -14 LUFS integrated; avoid limiter pumping. We won&apos;t alter your master.</li>
                              <li>✓ Stereo required. Mono is not accepted.</li>
                              <li>✓ True Peak must be below -1 dBTP.</li>
                              <li>✓ No silence longer than 2 seconds at the start or end.</li>
                              <li>✓ Maximum file size: 2GB.</li>
                              <li>✓ Minimum duration: 30 seconds. Maximum duration: 60 minutes.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* 30 Second Preview */}
                      <div>
                        <Label>30 Second FreePlay Preview (30sFP)</Label>
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`preview-${index}`}
                              checked={track.previewStartTime === 0}
                              onChange={() => updateTrack(index, 'previewStartTime', 0)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Start this Track's 30sFP at the beginning (00:00)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`preview-${index}`}
                                checked={track.previewStartTime > 0}
                                onChange={() => updateTrack(index, 'previewStartTime', 30)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">Start this Track's 30sFP at</span>
                            </label>
                            {track.previewStartTime > 0 && (
                              <Input
                                type="number"
                                value={Math.floor(track.previewStartTime / 60)}
                                onChange={(e) => {
                                  const minutes = parseInt(e.target.value) || 0
                                  const seconds = track.previewStartTime % 60
                                  updateTrack(index, 'previewStartTime', minutes * 60 + seconds)
                                }}
                                placeholder="00"
                                className="w-16"
                                min="0"
                                max="59"
                              />
                            )}
                            <span className="text-sm">:</span>
                            {track.previewStartTime > 0 && (
                              <Input
                                type="number"
                                value={track.previewStartTime % 60}
                                onChange={(e) => {
                                  const seconds = parseInt(e.target.value) || 0
                                  const minutes = Math.floor(track.previewStartTime / 60)
                                  updateTrack(index, 'previewStartTime', minutes * 60 + seconds)
                                }}
                                placeholder="00"
                                className="w-16"
                                min="0"
                                max="59"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Lyrics */}
                      <div>
                        <Label htmlFor={`lyrics-${index}`}>Lyrics</Label>
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={track.hasNoLyrics}
                              onChange={(e) => {
                                updateTrack(index, 'hasNoLyrics', e.target.checked)
                                if (e.target.checked) {
                                  updateTrack(index, 'lyrics', '')
                                  updateTrack(index, 'lyricsFileUrl', '')
                                  updateTrack(index, 'lyricsConfirmed', false)
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">This Track has no Lyrics - it is an Instrumental.</span>
                          </label>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!track.hasNoLyrics && track.lyricsInputMode === 'paste'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updateTrack(index, 'hasNoLyrics', false)
                                    updateTrack(index, 'lyricsInputMode', 'paste')
                                    if (track.lyricsFileUrl) {
                                      updateTrack(index, 'lyricsFileUrl', '')
                                      updateTrack(index, 'lyricsConfirmed', false)
                                    }
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span>Copy / Paste Lyrics</span>
                            </label>
                            <span className="text-gray-400 font-medium">OR</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!track.hasNoLyrics && track.lyricsInputMode === 'upload'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updateTrack(index, 'hasNoLyrics', false)
                                    updateTrack(index, 'lyricsInputMode', 'upload')
                                    if (track.lyrics && !track.lyricsFileUrl) {
                                      updateTrack(index, 'lyrics', '')
                                      updateTrack(index, 'lyricsConfirmed', false)
                                    }
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span>Upload Lyrics File</span>
                            </label>
                          </div>
                          <Textarea
                            id={`lyrics-${index}`}
                            value={track.lyrics}
                            onChange={(e) => {
                              updateTrack(index, 'hasNoLyrics', false)
                              updateTrack(index, 'lyricsInputMode', 'paste')
                              updateTrack(index, 'lyrics', e.target.value)
                              if (track.lyricsFileUrl) {
                                updateTrack(index, 'lyricsFileUrl', '')
                              }
                              updateTrack(index, 'lyricsConfirmed', false)
                            }}
                            placeholder={
                              track.hasNoLyrics
                                ? 'Lyrics not required for instrumentals.'
                                : track.lyricsInputMode === 'upload'
                                  ? 'Lyrics upload mode selected. Switch to Copy / Paste Lyrics to type here.'
                                  : 'Copy and paste lyrics text here...'
                            }
                            rows={8}
                            className="font-mono text-sm"
                            disabled={track.hasNoLyrics || track.lyricsInputMode === 'upload'}
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
                              disabled={track.hasNoLyrics || track.lyricsInputMode !== 'upload'}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Upload Lyrics File
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateTrack(index, 'lyricsConfirmed', true)}
                              disabled={!track.lyrics.trim() && !track.lyricsFileUrl}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm Track {track.trackNumber} Lyrics
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Video Link */}
                      <div>
                        <Label htmlFor={`video-url-${index}`}>Track Video Link</Label>
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={track.hasNoVideo}
                              onChange={(e) => {
                                updateTrack(index, 'hasNoVideo', e.target.checked)
                                if (e.target.checked) {
                                  updateTrack(index, 'videoUrl', '')
                                  updateTrack(index, 'videoUrlConfirmed', false)
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">This Track version has no matching Music Video.</span>
                          </label>
                          <Input
                            id={`video-url-${index}`}
                            value={track.videoUrl}
                            onChange={(e) => {
                              if (e.target.value.trim()) {
                                updateTrack(index, 'hasNoVideo', false)
                              }
                              updateTrack(index, 'videoUrl', e.target.value)
                              updateTrack(index, 'videoUrlConfirmed', false)
                            }}
                            placeholder="Paste YouTube URL here..."
                            className="mt-1"
                            disabled={track.hasNoVideo}
                          />
                          {track.videoUrl && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => void confirmVideoLink(index)}
                              disabled={track.videoUrlConfirmed}
                              className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-100 disabled:text-emerald-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {track.videoUrlConfirmed ? 'YouTube Music Video Link Confirmed' : 'Confirm YouTube Music Video Link'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Save Track Button */}
                  <div className="pt-6 border-t-2 flex items-center justify-between">
                    <Button
                      onClick={() => saveTrack(index)}
                      disabled={savingTrackIndex === index}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-6 py-3 disabled:bg-gray-200 disabled:text-gray-500"
                    >
                      {savingTrackIndex === index ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      )}
                      {savingTrackIndex === index ? 'Saving...' : `Save Track ${track.trackNumber}`}
                    </Button>
                    {useSingleTrackView && currentPage < tracks.length - 1 && (
                      <Button
                        onClick={() => void selectTrack(currentPage + 1)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-6 py-3"
                      >
                        Next Track ({currentPage + 2}/{tracks.length}) →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper >
      <ISRCInfoModal isOpen={showISRCInfo} onClose={() => setShowISRCInfo(false)} />
      <ISWCInfoModal isOpen={showISWCInfo} onClose={() => setShowISWCInfo(false)} />
    </>
  )
}
