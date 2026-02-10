'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, ArrowRight, ArrowLeft, Loader2, CheckCircle, Plus, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ReleaseData, initialReleaseData } from './types'

// Database release type (snake_case from API)
interface DbRelease {
  id: string
  user_id: string
  upc: string | null
  upc_confirmed: boolean
  ean: string | null
  ean_confirmed: boolean
  release_title: string
  release_title_confirmed: boolean
  release_title_source: 'gtin' | 'manual'
  release_type: 'single' | 'ep' | 'album' | null
  track_count: number
  track_count_label: string | null
  release_version: string
  apply_version_to_all: boolean
  country_of_origin: string | null
  available_home: boolean
  available_specific: boolean
  available_worldwide: boolean
  specific_territories: string[]
  territory_rights_confirmed: boolean
  go_live_option: 'past' | 'asap' | 'future' | null
  go_live_date: string | null
  master_rights_type: 'independent' | 'label' | null
  record_labels: unknown[]
  master_rights_confirmed: boolean
  publishing_rights_type: 'independent' | 'publisher' | null
  publishers: unknown[]
  apply_publisher_to_all_tracks: boolean
  publishing_rights_confirmed: boolean
  distributor_name: string | null
  distributor_confirmed: boolean
  distributor_contact_name: string | null
  distributor_contact_email: string | null
  wrote_composition: boolean
  pro_name: string | null
  pro_confirmed: boolean
  pro_contact_name: string | null
  pro_contact_email: string | null
  mcs_name: string | null
  mcs_confirmed: boolean
  mcs_contact_name: string | null
  mcs_contact_email: string | null
  cover_artwork_url: string | null
  cover_caption: string | null
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected'
  current_step: string
  upload_guide_confirmed: boolean
  agree_terms_of_use?: boolean
  agree_distribution_policy?: boolean
  agree_privacy_policy?: boolean
  confirm_details_true?: boolean
  confirm_legal_liability?: boolean
  confirm_no_other_artist_name?: boolean
  signatory_role?: 'owner' | 'representative' | null
  signatory_first_name?: string | null
  signatory_middle_names?: string | null
  signatory_last_name?: string | null
  signatory_email?: string | null
  submitted_at?: string | null
  published_at?: string | null
  created_at: string
  updated_at: string
}

interface ReleasesApiResponse {
  data?: DbRelease[]
  user_id?: string
  approval_mode?: 'auto' | 'manual'
}
import { UploadGuideSection } from './UploadGuideSection'
import { ReleaseRegistrationSection } from './ReleaseRegistrationSection'
import { ReleaseTypeSection } from './ReleaseTypeSection'
import { GeographicalSection } from './GeographicalSection'
import { GoLiveDateSection } from './GoLiveDateSection'
import { ReleaseRightsSection } from './ReleaseRightsSection'
import { ReleaseRoyaltiesSection } from './ReleaseRoyaltiesSection'
import { CoverArtworkSection } from './CoverArtworkSection'
import { TrackUploadSection } from './TrackUploadSection'
import { SubmitReleaseSection } from './SubmitReleaseSection'
import { InvitationModal, ErrorReportModal, SuccessModal, InvitationData, ErrorReportData } from './InvitationModals'

// Step definitions
const STEPS = [
  { id: 'guide', label: 'Upload Guide' },
  { id: 'registration', label: 'Release Details' },
  { id: 'type', label: 'Release Type' },
  { id: 'geography', label: 'Availability' },
  { id: 'date', label: 'Go-Live Date' },
  { id: 'rights', label: 'Rights' },
  { id: 'royalties', label: 'Royalties' },
  { id: 'artwork', label: 'Artwork' },
  { id: 'tracks', label: 'Upload Tracks' },
  { id: 'submit', label: 'Submit Release' }
] as const

type StepId = typeof STEPS[number]['id']
type MusicManagerView = 'upload' | 'manage'

interface ArtistMusicManagerProps {
  defaultView?: MusicManagerView
}

const MUSIC_MANAGER_INTRO_COLLAPSED_STORAGE_KEY = 'artist-music-manager:intro-collapsed:v1'

// Convert DB release to frontend ReleaseData
function dbToReleaseData(db: DbRelease): Partial<ReleaseData> {
  return {
    upc: db.upc || '',
    upcConfirmed: db.upc_confirmed,
    ean: db.ean || '',
    eanConfirmed: db.ean_confirmed,
    releaseTitle: db.release_title || '',
    releaseTitleConfirmed: db.release_title_confirmed,
    releaseTitleSource: db.release_title_source,
    releaseType: db.release_type || '',
    trackCount: db.track_count,
    trackCountLabel: db.track_count_label || '',
    releaseVersion: db.release_version,
    applyVersionToAll: db.apply_version_to_all,
    countryOfOrigin: db.country_of_origin || '',
    availableHome: db.available_home,
    availableSpecific: db.available_specific,
    availableWorldwide: db.available_worldwide,
    specificTerritories: db.specific_territories || [],
    territoryRightsConfirmed: db.territory_rights_confirmed,
    goLiveOption: db.go_live_option || '',
    goLiveDate: db.go_live_date || '',
    masterRightsType: db.master_rights_type || '',
    recordLabels: db.record_labels as ReleaseData['recordLabels'],
    masterRightsConfirmed: db.master_rights_confirmed,
    publishingRightsType: db.publishing_rights_type || '',
    publishers: db.publishers as ReleaseData['publishers'],
    applyPublisherToAllTracks: db.apply_publisher_to_all_tracks,
    publishingRightsConfirmed: db.publishing_rights_confirmed,
    distributorName: db.distributor_name || '',
    distributorConfirmed: db.distributor_confirmed,
    distributorContactName: db.distributor_contact_name || '',
    distributorContactEmail: db.distributor_contact_email || '',
    wroteComposition: db.wrote_composition,
    proName: db.pro_name || '',
    proConfirmed: db.pro_confirmed,
    proContactName: db.pro_contact_name || '',
    proContactEmail: db.pro_contact_email || '',
    mcsName: db.mcs_name || '',
    mcsConfirmed: db.mcs_confirmed,
    mcsContactName: db.mcs_contact_name || '',
    mcsContactEmail: db.mcs_contact_email || '',
    coverArtwork: db.cover_artwork_url || null,
    coverArtworkUrl: db.cover_artwork_url || '',
    coverCaption: db.cover_caption || '',
    agreeTermsOfUse: db.agree_terms_of_use ?? false,
    agreeDistributionPolicy: db.agree_distribution_policy ?? false,
    agreePrivacyPolicy: db.agree_privacy_policy ?? false,
    confirmDetailsTrue: db.confirm_details_true ?? false,
    confirmLegalLiability: db.confirm_legal_liability ?? false,
    confirmNoOtherArtistName: db.confirm_no_other_artist_name ?? false,
    signatoryRole: (db.signatory_role as 'owner' | 'representative') || '',
    signatoryFirstName: db.signatory_first_name || '',
    signatoryMiddleNames: db.signatory_middle_names || '',
    signatoryLastName: db.signatory_last_name || '',
    signatoryEmail: db.signatory_email || ''
  }
}

// Convert frontend ReleaseData to DB format
function releaseDataToDb(data: ReleaseData, uploadGuideConfirmed: boolean, currentStep: string) {
  return {
    upc: data.upc || null,
    upc_confirmed: data.upcConfirmed,
    ean: data.ean || null,
    ean_confirmed: data.eanConfirmed,
    release_title: data.releaseTitle || 'Untitled Release',
    release_title_confirmed: data.releaseTitleConfirmed,
    release_title_source: data.releaseTitleSource,
    release_type: data.releaseType || null,
    track_count: data.trackCount,
    track_count_label: data.trackCountLabel || null,
    release_version: data.releaseVersion,
    apply_version_to_all: data.applyVersionToAll,
    country_of_origin: data.countryOfOrigin || null,
    available_home: data.availableHome,
    available_specific: data.availableSpecific,
    available_worldwide: data.availableWorldwide,
    specific_territories: data.specificTerritories,
    territory_rights_confirmed: data.territoryRightsConfirmed,
    go_live_option: data.goLiveOption || null,
    go_live_date: data.goLiveDate || null,
    master_rights_type: data.masterRightsType || null,
    record_labels: data.recordLabels,
    master_rights_confirmed: data.masterRightsConfirmed,
    publishing_rights_type: data.publishingRightsType || null,
    publishers: data.publishers,
    apply_publisher_to_all_tracks: data.applyPublisherToAllTracks,
    publishing_rights_confirmed: data.publishingRightsConfirmed,
    distributor_name: data.distributorName || null,
    distributor_confirmed: data.distributorConfirmed,
    distributor_contact_name: data.distributorContactName || null,
    distributor_contact_email: data.distributorContactEmail || null,
    wrote_composition: data.wroteComposition,
    pro_name: data.proName || null,
    pro_confirmed: data.proConfirmed,
    pro_contact_name: data.proContactName || null,
    pro_contact_email: data.proContactEmail || null,
    mcs_name: data.mcsName || null,
    mcs_confirmed: data.mcsConfirmed,
    mcs_contact_name: data.mcsContactName || null,
    mcs_contact_email: data.mcsContactEmail || null,
    cover_artwork_url: data.coverArtworkUrl || (typeof data.coverArtwork === 'string' ? data.coverArtwork : null),
    cover_caption: data.coverCaption || null,
    upload_guide_confirmed: uploadGuideConfirmed,
    current_step: currentStep,
    agree_terms_of_use: data.agreeTermsOfUse,
    agree_distribution_policy: data.agreeDistributionPolicy,
    agree_privacy_policy: data.agreePrivacyPolicy,
    confirm_details_true: data.confirmDetailsTrue,
    confirm_legal_liability: data.confirmLegalLiability,
    confirm_no_other_artist_name: data.confirmNoOtherArtistName,
    signatory_role: data.signatoryRole || null,
    signatory_first_name: data.signatoryFirstName?.trim() || null,
    signatory_middle_names: data.signatoryMiddleNames?.trim() || null,
    signatory_last_name: data.signatoryLastName?.trim() || null,
    signatory_email: data.signatoryEmail?.trim() || null
  }
}

export function ArtistMusicManager({ defaultView = 'upload' }: ArtistMusicManagerProps) {
  const permanentMessages = [
    {
      icon: '💎',
      message: 'Together, we are making the Music Industry fairer by ensuring everyone involved gets paid properly - and where laws allow, paying 100% of Royalties.'
    },
    {
      icon: '⚠️',
      message: 'It is crucial that you enter/confirm all data and ID codes correctly, to ensure all Rights Holders get paid their fair share. Beside fairness, having proper identification codes is a sign of professionalism in the Music Industry.'
    },
    {
      icon: '🚨',
      message: 'You are legally and financially responsible for any music you upload, regardless of territory - so please pay attention to all of the tips and details.'
    },
    {
      icon: '📊',
      message: 'While some metadata is sent to us by 3rd Parties, we ask you to check and add more layers of data to make sure your music gets heard and pays properly.'
    }
  ]

  // Current release ID (null for new release)
  const [releaseId, setReleaseId] = useState<string | null>(null)
  const [musicView, setMusicView] = useState<MusicManagerView>(defaultView)
  
  // Current step state
  const [currentStep, setCurrentStep] = useState<StepId>('guide')

  // Upload guide state
  const [showUploadGuide, setShowUploadGuide] = useState(true)
  const [uploadGuideConfirmed, setUploadGuideConfirmed] = useState(false)

  // Release data state
  const [releaseData, setReleaseData] = useState<ReleaseData>(initialReleaseData)

  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteModalType, setInviteModalType] = useState<'label' | 'publisher' | 'distributor' | 'pro' | 'mcs'>('label')
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [successModalData, setSuccessModalData] = useState<{ name: string; email: string; type: 'label' | 'publisher' | 'distributor' | 'pro' | 'mcs' } | null>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingAndProceeding, setIsSavingAndProceeding] = useState(false)
  const [editingReleaseId, setEditingReleaseId] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isIntroCollapsed, setIsIntroCollapsed] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const [approvalMode, setApprovalMode] = useState<'auto' | 'manual'>('auto')
  const [publishedReleases, setPublishedReleases] = useState<DbRelease[]>([])
  const [pendingReleases, setPendingReleases] = useState<DbRelease[]>([])
  const [isLoadingPublished, setIsLoadingPublished] = useState(true)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load existing draft release on mount
  const loadDraftRelease = useCallback(async () => {
    try {
      const response = await fetch('/api/music-releases?status=draft')
      const result = await response.json() as ReleasesApiResponse

      if (result.approval_mode === 'manual' || result.approval_mode === 'auto') {
        setApprovalMode(result.approval_mode)
      }
      
      if (result.data && result.data.length > 0) {
        // Load the most recent draft
        const draft = result.data[0] as DbRelease
        setReleaseId(draft.id)
        setUploadGuideConfirmed(draft.upload_guide_confirmed)
        setCurrentStep((draft.current_step as StepId) || 'guide')
        setReleaseData(prev => ({ ...prev, ...dbToReleaseData(draft) }))
      }
    } catch (error) {
      console.error('Error loading draft release:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadPublishedReleases = useCallback(async () => {
    try {
      setIsLoadingPublished(true)
      const [publishedResponse, pendingResponse] = await Promise.all([
        fetch('/api/music-releases?status=published'),
        fetch('/api/music-releases?status=pending_review')
      ])
      const [publishedResult, pendingResult] = await Promise.all([
        publishedResponse.json() as Promise<ReleasesApiResponse>,
        pendingResponse.json() as Promise<ReleasesApiResponse>
      ])

      if (publishedResult.approval_mode === 'manual' || publishedResult.approval_mode === 'auto') {
        setApprovalMode(publishedResult.approval_mode)
      } else if (pendingResult.approval_mode === 'manual' || pendingResult.approval_mode === 'auto') {
        setApprovalMode(pendingResult.approval_mode)
      }

      setPublishedReleases(publishedResult.data || [])
      setPendingReleases(pendingResult.data || [])
    } catch (error) {
      console.error('Error loading published releases:', error)
      setPublishedReleases([])
      setPendingReleases([])
    } finally {
      setIsLoadingPublished(false)
    }
  }, [])

  useEffect(() => {
    loadDraftRelease()
    loadPublishedReleases()
  }, [loadDraftRelease, loadPublishedReleases])

  useEffect(() => {
    setMusicView(defaultView)
  }, [defaultView])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedState = window.localStorage.getItem(MUSIC_MANAGER_INTRO_COLLAPSED_STORAGE_KEY)
    if (savedState === '1') {
      setIsIntroCollapsed(true)
    }
  }, [])

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1

  // Navigate to next step
  const goToNextStep = () => {
    if (!isLastStep) {
      setCurrentStep(STEPS[currentStepIndex + 1].id)
      // Trigger auto-save when moving to next step
      autoSave()
    }
  }

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentStepIndex - 1].id)
      // Trigger auto-save when moving to previous step
      autoSave()
    }
  }

  // Check if current step is complete
  const isStepComplete = (stepId: StepId): boolean => {
    const hasValidTerritories =
      releaseData.availableWorldwide ||
      releaseData.availableHome ||
      (releaseData.availableSpecific && releaseData.specificTerritories.length > 0)

    const hasLabelDetails = releaseData.masterRightsType === 'label'
      ? releaseData.recordLabels.some(label => label.name.trim() && label.confirmed)
      : releaseData.masterRightsType === 'independent' && releaseData.masterRightsConfirmed

    const hasPublisherDetails = releaseData.publishingRightsType === 'publisher'
      ? releaseData.publishers.some(publisher => publisher.name.trim() && publisher.confirmed)
      : releaseData.publishingRightsType === 'independent' && releaseData.publishingRightsConfirmed

    const goLiveReady =
      releaseData.goLiveOption === 'asap'
        ? true
        : releaseData.goLiveOption === ''
          ? false
          : Boolean(releaseData.goLiveDate)

    switch (stepId) {
      case 'guide':
        return uploadGuideConfirmed
      case 'registration':
        return (
          releaseData.releaseTitleConfirmed &&
          (releaseData.upcConfirmed || releaseData.eanConfirmed)
        )
      case 'type':
        return !!releaseData.releaseType && releaseData.trackCount > 0
      case 'geography':
        return hasValidTerritories && !!releaseData.countryOfOrigin && releaseData.territoryRightsConfirmed
      case 'date':
        return !!releaseData.goLiveOption && goLiveReady
      case 'rights':
        return hasLabelDetails && hasPublisherDetails
      case 'royalties':
        return Boolean(
          releaseData.distributorName.trim() &&
          releaseData.distributorConfirmed &&
          (!releaseData.wroteComposition || (releaseData.proName.trim() && releaseData.proConfirmed))
        )
      case 'artwork':
        return !!releaseData.coverArtwork && !!releaseData.coverCaption.trim()
      case 'tracks':
        // For now, tracks step is optional - users can proceed without uploading all tracks
        // In the future, we might want to require at least one track
        return true
      case 'submit':
        return isSubmissionValid(releaseData)
      default:
        return false
    }
  }

  // Ts&Cs and digital signature must all be complete before release can go to pending_review
  function isSubmissionValid(data: ReleaseData): boolean {
    const termsOk =
      data.agreeTermsOfUse &&
      data.agreeDistributionPolicy &&
      data.agreePrivacyPolicy
    const confirmOk =
      data.confirmDetailsTrue &&
      data.confirmLegalLiability &&
      data.confirmNoOtherArtistName
    const roleOk = data.signatoryRole === 'owner' || data.signatoryRole === 'representative'
    const signatureOk =
      data.signatoryFirstName.trim() !== '' &&
      data.signatoryLastName.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.signatoryEmail.trim())
    return Boolean(termsOk && confirmOk && roleOk && signatureOk)
  }

  // Toggle upload guide visibility
  const handleToggleUploadGuide = () => {
    if (uploadGuideConfirmed) {
      setShowUploadGuide(!showUploadGuide)
    }
  }

  // Update release data
  const updateReleaseData = (field: keyof ReleaseData, value: unknown) => {
    setReleaseData(prev => ({ ...prev, [field]: value }))
  }

  // Open invitation modal
  const openInviteModal = (type: 'label' | 'publisher' | 'distributor' | 'pro' | 'mcs') => {
    setInviteModalType(type)
    setInviteModalOpen(true)
  }

  // Handle invitation submission
  const handleInvitationSubmit = async (data: InvitationData) => {
    if (!releaseId) {
      setSaveMessage({ type: 'error', text: 'Please save your release first before sending invitations.' })
      return
    }

    try {
      const response = await fetch('/api/music-release-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseId,
          invitationType: data.type,
          organizationName: data.name,
          contactEmail: data.email,
          contactName: null,
          customMessage: data.message
        })
      })

      const result = await response.json()

      if (result.success) {
        // Show success modal
        setSuccessModalData({
          name: data.name,
          email: data.email,
          type: data.type as 'label' | 'publisher' | 'distributor' | 'pro' | 'mcs'
        })
        setSuccessModalOpen(true)
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to send invitation' })
        setTimeout(() => setSaveMessage(null), 5000)
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      setSaveMessage({ type: 'error', text: 'Failed to send invitation. Please try again.' })
      setTimeout(() => setSaveMessage(null), 5000)
    }
  }

  // Handle error report submission
  const handleErrorReportSubmit = async (data: ErrorReportData) => {
    if (!releaseId) {
      setSaveMessage({ type: 'error', text: 'Please save your release first before reporting errors.' })
      return
    }

    try {
      const response = await fetch('/api/music-release-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseId,
          field: data.field,
          description: data.description,
          expectedValue: data.expectedValue,
          currentValue: releaseData.releaseTitle // Or get current value based on field
        })
      })

      const result = await response.json()

      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Error report submitted. Thank you for helping us improve!' })
        setTimeout(() => setSaveMessage(null), 4000)
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to submit error report' })
        setTimeout(() => setSaveMessage(null), 5000)
      }
    } catch (error) {
      console.error('Error submitting error report:', error)
      setSaveMessage({ type: 'error', text: 'Failed to submit error report. Please try again.' })
      setTimeout(() => setSaveMessage(null), 5000)
    }
  }

  // Check if form is valid for proceeding
  const isFormValid = () => {
    const hasValidTerritories =
      releaseData.availableWorldwide ||
      releaseData.availableHome ||
      (releaseData.availableSpecific && releaseData.specificTerritories.length > 0)

    const hasLabelDetails = releaseData.masterRightsType === 'independent'
      ? releaseData.masterRightsConfirmed
      : releaseData.recordLabels.some(label => label.name.trim() && label.confirmed)

    const hasPublisherDetails = releaseData.publishingRightsType === 'independent'
      ? releaseData.publishingRightsConfirmed
      : releaseData.publishers.some(publisher => publisher.name.trim() && publisher.confirmed)

    const goLiveReady =
      releaseData.goLiveOption === 'asap'
        ? true
        : releaseData.goLiveOption === ''
          ? false
          : Boolean(releaseData.goLiveDate)

    const baseValid =
      uploadGuideConfirmed &&
      (releaseData.upcConfirmed || releaseData.eanConfirmed) &&
      releaseData.releaseTitleConfirmed &&
      releaseData.releaseType !== '' &&
      releaseData.trackCount > 0 &&
      hasValidTerritories &&
      !!releaseData.countryOfOrigin &&
      releaseData.territoryRightsConfirmed &&
      releaseData.goLiveOption !== '' &&
      goLiveReady &&
      releaseData.masterRightsType !== '' &&
      hasLabelDetails &&
      releaseData.publishingRightsType !== '' &&
      hasPublisherDetails &&
      releaseData.distributorName.trim() !== '' &&
      releaseData.distributorConfirmed &&
      (!releaseData.wroteComposition || (releaseData.proName.trim() && releaseData.proConfirmed)) &&
      releaseData.coverArtwork !== null &&
      releaseData.coverCaption.trim() !== ''

    // On submit step, Ts&Cs and digital signature must also be complete
    if (currentStep === 'submit') {
      return baseValid && isSubmissionValid(releaseData)
    }
    return baseValid
  }

  // Auto-save function (silent save without showing messages)
  const autoSave = useCallback(async () => {
    // Don't auto-save if we're in the guide step or if already saving
    if (currentStep === 'guide' || isSaving || isSavingAndProceeding) return

    try {
      setAutoSaveStatus('saving')
      const dbData = releaseDataToDb(releaseData, uploadGuideConfirmed, currentStep)
      const payload = releaseId ? { id: releaseId, ...dbData, status: 'draft' } : { ...dbData, status: 'draft' }

      const response = await fetch('/api/music-releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        if (!releaseId && result.data?.id) {
          setReleaseId(result.data.id)
        }
        setAutoSaveStatus('saved')
        // Reset to idle after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      } else {
        setAutoSaveStatus('idle')
      }
    } catch (error) {
      console.error('Auto-save error:', error)
      setAutoSaveStatus('idle')
    }
  }, [releaseData, uploadGuideConfirmed, currentStep, releaseId, isSaving, isSavingAndProceeding])

  // Auto-save when releaseData changes (debounced)
  useEffect(() => {
    // Don't auto-save on initial load
    if (isLoading) return

    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Set a new timer to auto-save after 2 seconds of inactivity
    autoSaveTimerRef.current = setTimeout(() => {
      autoSave()
    }, 2000)

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [releaseData, autoSave, isLoading])

  // Handle save and come back later
  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const dbData = releaseDataToDb(releaseData, uploadGuideConfirmed, currentStep)
      const payload = releaseId ? { id: releaseId, ...dbData, status: 'draft' } : { ...dbData, status: 'draft' }

      const response = await fetch('/api/music-releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        if (!releaseId && result.data?.id) {
          setReleaseId(result.data.id)
        }
        setSaveMessage({ type: 'success', text: 'Progress saved successfully!' })
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to save' })
      }
    } catch (error) {
      console.error('Error saving release:', error)
      setSaveMessage({ type: 'error', text: 'Failed to save. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle save and proceed (submit/publish depending on approval mode)
  const handleSaveAndProceed = async () => {
    if (!isFormValid()) return

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }

    setIsSavingAndProceeding(true)
    setSaveMessage(null)
    try {
      const dbData = releaseDataToDb(releaseData, uploadGuideConfirmed, currentStep)
      const payload = releaseId 
        ? { id: releaseId, ...dbData, status: 'pending_review' } 
        : { ...dbData, status: 'pending_review' }
      
      const response = await fetch('/api/music-releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (result.success) {
        const finalStatus = result?.data?.status as string | undefined
        const isPublished = finalStatus === 'published'
        const isPending = finalStatus === 'pending_review'
        await loadPublishedReleases()
        setSaveMessage({
          type: 'success',
          text:
            isPublished
              ? 'Release published successfully. Preview it in Fan Dashboard > Music.'
              : isPending
                ? 'Release submitted for review. It will appear in Fan Dashboard after approval.'
                : 'Release saved successfully.'
        })
        // Could redirect to a releases list or show success state
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to submit' })
      }
    } catch (error) {
      console.error('Error submitting release:', error)
      setSaveMessage({ type: 'error', text: 'Failed to submit. Please try again.' })
    } finally {
      setIsSavingAndProceeding(false)
    }
  }

  // Start a new release
  const handleNewRelease = () => {
    setReleaseId(null)
    setReleaseData(initialReleaseData)
    setUploadGuideConfirmed(false)
    setCurrentStep('guide')
    setSaveMessage(null)
    setMusicView('upload')
  }

  const toggleIntroCollapsed = () => {
    setIsIntroCollapsed((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(MUSIC_MANAGER_INTRO_COLLAPSED_STORAGE_KEY, next ? '1' : '0')
      }
      return next
    })
  }

  const applyReleaseToEditor = (release: DbRelease) => {
    const nextStep = STEPS.some((step) => step.id === release.current_step)
      ? (release.current_step as StepId)
      : 'registration'

    setReleaseId(release.id)
    setUploadGuideConfirmed(release.upload_guide_confirmed)
    setCurrentStep(nextStep)
    setReleaseData({ ...initialReleaseData, ...dbToReleaseData(release) })
    setMusicView('upload')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleEditRelease = async (release: DbRelease) => {
    setEditingReleaseId(release.id)
    try {
      const response = await fetch(`/api/music-releases?id=${release.id}`)
      const result = await response.json()
      if (response.ok && result?.data) {
        applyReleaseToEditor(result.data as DbRelease)
        setSaveMessage({ type: 'success', text: `Opened "${(result.data as DbRelease).release_title}" for editing.` })
        setTimeout(() => setSaveMessage(null), 3000)
        return
      }

      // Fallback to list payload if detailed load fails.
      applyReleaseToEditor(release)
      setSaveMessage({ type: 'success', text: `Opened "${release.release_title}" for editing.` })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error opening release for edit:', error)
      setSaveMessage({ type: 'error', text: 'Failed to load release for editing. Please try again.' })
      setTimeout(() => setSaveMessage(null), 4000)
    } finally {
      setEditingReleaseId(null)
    }
  }

  const formatDate = (value: string | null | undefined) => {
    if (!value) return 'Not published yet'
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'guide':
        return (
          <UploadGuideSection
            showUploadGuide={showUploadGuide}
            uploadGuideConfirmed={uploadGuideConfirmed}
            onToggle={handleToggleUploadGuide}
            onConfirm={setUploadGuideConfirmed}
          />
        )
      case 'registration':
        return (
          <ReleaseRegistrationSection
            releaseData={releaseData}
            onUpdate={updateReleaseData}
            onReportError={() => setErrorModalOpen(true)}
          />
        )
      case 'type':
        return (
          <ReleaseTypeSection
            releaseData={releaseData}
            onUpdate={updateReleaseData}
          />
        )
      case 'geography':
        return (
          <GeographicalSection
            releaseData={releaseData}
            onUpdate={updateReleaseData}
          />
        )
      case 'date':
        return (
          <GoLiveDateSection
            releaseData={releaseData}
            onUpdate={updateReleaseData}
          />
        )
      case 'rights':
        return (
          <ReleaseRightsSection
            releaseData={releaseData}
            onUpdate={updateReleaseData}
            onInviteLabel={() => openInviteModal('label')}
            onInvitePublisher={() => openInviteModal('publisher')}
          />
        )
      case 'royalties':
        return (
          <ReleaseRoyaltiesSection
            releaseData={releaseData}
            onUpdate={updateReleaseData}
            onInviteDistributor={() => openInviteModal('distributor')}
            onInvitePro={() => openInviteModal('pro')}
            onInviteMcs={() => openInviteModal('mcs')}
          />
        )
      case 'artwork':
        return (
          <CoverArtworkSection
            releaseData={releaseData}
            onUpdate={updateReleaseData}
          />
        )
      case 'tracks':
        return (
          <TrackUploadSection
            releaseData={releaseData}
            releaseId={releaseId}
            onUpdate={updateReleaseData}
          />
        )
      case 'submit':
        return (
          <SubmitReleaseSection
            releaseData={releaseData}
            onUpdate={updateReleaseData}
          />
        )
      default:
        return null
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-ui">Loading your releases...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Save Message Toast */}
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          saveMessage.type === 'success' 
            ? 'bg-emerald-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {saveMessage.text}
        </div>
      )}

      <div id="artist-music-upload-intro" className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl text-white p-6 md:p-8 mb-6 shadow-lg border border-purple-600/40 scroll-mt-28">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-purple-200 font-semibold">Artist Music</p>
                <h1 className="text-3xl md:text-4xl font-bold mt-2">Upload &amp; Manage Your Music</h1>
              </div>
              {/* Auto-save indicator */}
              {autoSaveStatus !== 'idle' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                  {autoSaveStatus === 'saving' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span className="text-sm">Saved</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isIntroCollapsed && releaseId && (
              <Button
                onClick={handleNewRelease}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Plus className="w-4 h-4 mr-2" /> New Release
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={toggleIntroCollapsed}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {isIntroCollapsed ? (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" /> Expand
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" /> Collapse
                </>
              )}
            </Button>
          </div>
        </div>

        {!isIntroCollapsed && (
          <>
            <div className="mt-6 bg-white/10 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-purple-200 mb-3">Permanent Message</p>
              <div className="space-y-3">
                {permanentMessages.map((item) => (
                  <div key={item.icon} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                    <p className="text-purple-50">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 inline-flex rounded-xl border border-white/20 bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setMusicView('upload')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  musicView === 'upload'
                    ? 'bg-white text-purple-700'
                    : 'text-purple-100 hover:bg-white/15'
                }`}
              >
                Upload Music
              </button>
              <button
                type="button"
                onClick={() => setMusicView('manage')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  musicView === 'manage'
                    ? 'bg-white text-purple-700'
                    : 'text-purple-100 hover:bg-white/15'
                }`}
              >
                Manage Music
              </button>
            </div>
          </>
        )}
        {isIntroCollapsed && (
          <div className="mt-4 text-xs text-purple-200">
            Intro panel collapsed. Your preference is saved for next time.
          </div>
        )}
      </div>

      {/* Manage Music Library */}
      {musicView === 'manage' && (
        <div id="artist-music-manage-library" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 scroll-mt-28">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-ui">Manage Music Library</h2>
            <p className="text-sm text-gray-500">
              Approval mode: <span className="font-medium">{approvalMode === 'auto' ? 'Auto Publish' : 'Manual Review'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {musicView === 'manage' && (
              <Button
                variant="outline"
                onClick={() => setMusicView('upload')}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Continue Upload Flow
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.location.assign('/fan-dashboard')}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview In Fan Dashboard
            </Button>
          </div>
        </div>

        {isLoadingPublished ? (
          <p className="mt-4 text-sm text-gray-500">Loading published releases...</p>
        ) : (
          <div className="mt-4 space-y-4">
            {releaseId && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Draft In Progress</p>
                    <p className="mt-1 text-xs text-blue-800">
                      You have an in-progress upload. Open Upload Music to continue editing and submit.
                    </p>
                  </div>
                  {musicView === 'manage' && (
                    <Button
                      variant="outline"
                      onClick={() => setMusicView('upload')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Continue Draft
                    </Button>
                  )}
                </div>
              </div>
            )}

            {approvalMode === 'manual' && pendingReleases.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Pending Review ({pendingReleases.length})</p>
                <p className="mt-1 text-xs text-amber-800">
                  These are submitted and waiting for admin approval before they appear in Fan Dashboard.
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {(musicView === 'manage' ? pendingReleases : pendingReleases.slice(0, 6)).map((release) => (
                    <div key={release.id} className="rounded-lg border border-amber-200 bg-white p-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{release.release_title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {(release.release_type || 'release').toUpperCase()} • {release.track_count || 0} track{release.track_count === 1 ? '' : 's'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted {formatDate(release.submitted_at || release.created_at)}
                      </p>
                      {musicView === 'manage' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRelease(release)}
                          disabled={editingReleaseId === release.id}
                          className="mt-2 border-amber-300 text-amber-800 hover:bg-amber-100"
                        >
                          {editingReleaseId === release.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Opening...
                            </>
                          ) : (
                            'Edit Release'
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {publishedReleases.length === 0 ? (
              <p className="text-sm text-gray-500">
                No releases published yet. Published releases appear here and in Fan Dashboard.
              </p>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Live In Fan Dashboard ({publishedReleases.length})</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {(musicView === 'manage' ? publishedReleases : publishedReleases.slice(0, 6)).map((release) => (
                    <div key={release.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{release.release_title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {(release.release_type || 'release').toUpperCase()} • {release.track_count || 0} track{release.track_count === 1 ? '' : 's'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Published {formatDate(release.published_at || release.created_at)}
                      </p>
                      {musicView === 'manage' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRelease(release)}
                          disabled={editingReleaseId === release.id}
                          className="mt-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                          {editingReleaseId === release.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Opening...
                            </>
                          ) : (
                            'Edit Release'
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
          </div>
        )}

      {musicView === 'upload' && (
        <div id="artist-music-upload-workflow" className="scroll-mt-28">
          {/* Step Progress Indicator */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">
                  {currentStepIndex + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 font-ui">
                    {STEPS[currentStepIndex].label}
                  </p>
                  <p className="text-xs text-gray-500">
                    Step {currentStepIndex + 1} of {STEPS.length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-ui">
                  {Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}% complete
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    if (index <= currentStepIndex || isStepComplete(STEPS[index - 1]?.id)) {
                      setCurrentStep(step.id)
                    }
                  }}
                  className={`
                    flex-1 h-2.5 rounded-full transition-all duration-300
                    ${index < currentStepIndex
                      ? 'bg-emerald-500 cursor-pointer hover:bg-emerald-400'
                      : index === currentStepIndex
                        ? 'bg-purple-500 shadow-sm'
                        : 'bg-gray-200'
                    }
                  `}
                  title={step.label}
                />
              ))}
            </div>
            {/* Step labels */}
            <div className="flex justify-between mt-2 px-1">
              {STEPS.map((step, index) => (
                <span
                  key={step.id}
                  className={`text-[10px] font-ui truncate max-w-[60px] text-center ${
                    index <= currentStepIndex ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Progress
                    </>
                  )}
                </Button>
              </div>

              {isLastStep ? (
                <Button
                  onClick={handleSaveAndProceed}
                  disabled={!isFormValid() || isSaving || isSavingAndProceeding}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md"
                >
                  {isSavingAndProceeding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" /> {approvalMode === 'auto' ? 'Complete & Publish' : 'Complete & Submit'}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={goToNextStep}
                  disabled={!isStepComplete(currentStep)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      <InvitationModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        type={inviteModalType}
        onSubmit={handleInvitationSubmit}
        initialData={
          inviteModalType === 'distributor'
            ? {
                name: releaseData.distributorName,
                email: releaseData.distributorContactEmail,
                contactName: releaseData.distributorContactName
              }
            : inviteModalType === 'pro'
            ? {
                name: releaseData.proName,
                email: releaseData.proContactEmail,
                contactName: releaseData.proContactName
              }
            : inviteModalType === 'mcs'
            ? {
                name: releaseData.mcsName,
                email: releaseData.mcsContactEmail,
                contactName: releaseData.mcsContactName
              }
            : inviteModalType === 'label' && releaseData.recordLabels.length > 0
            ? {
                name: releaseData.recordLabels[0].name,
                email: releaseData.recordLabels[0].contactEmail,
                contactName: releaseData.recordLabels[0].contactName
              }
            : inviteModalType === 'publisher' && releaseData.publishers.length > 0
            ? {
                name: releaseData.publishers[0].name,
                email: releaseData.publishers[0].contactEmail,
                contactName: releaseData.publishers[0].contactName
              }
            : undefined
        }
      />

      {/* Error Report Modal */}
      <ErrorReportModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        onSubmit={handleErrorReportSubmit}
      />

      {/* Success Confirmation Modal */}
      {successModalData && (
        <SuccessModal
          isOpen={successModalOpen}
          onClose={() => {
            setSuccessModalOpen(false)
            setSuccessModalData(null)
          }}
          organizationName={successModalData.name}
          contactEmail={successModalData.email}
          type={successModalData.type}
        />
      )}
    </div>
  )
}

// Re-export for convenience
export type { ReleaseData } from './types'
