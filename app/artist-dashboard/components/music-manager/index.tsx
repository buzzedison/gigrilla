'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, ArrowRight, ArrowLeft, Loader2, CheckCircle, Plus } from 'lucide-react'
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
  created_at: string
  updated_at: string
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

export function ArtistMusicManager() {
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
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load existing draft release on mount
  const loadDraftRelease = useCallback(async () => {
    try {
      const response = await fetch('/api/music-releases?status=draft')
      const result = await response.json()
      
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

  useEffect(() => {
    loadDraftRelease()
  }, [loadDraftRelease])

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

  // Handle save and proceed (submit for review)
  const handleSaveAndProceed = async () => {
    if (!isFormValid()) return

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
        setSaveMessage({ type: 'success', text: 'Release submitted for review!' })
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

      <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl text-white p-6 md:p-8 mb-6 shadow-lg border border-purple-600/40">
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
          {releaseId && (
            <Button
              onClick={handleNewRelease}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="w-4 h-4 mr-2" /> New Release
            </Button>
          )}
        </div>
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
      </div>

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
                  <CheckCircle className="w-4 h-4 mr-2" /> Complete & Submit
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
