'use client'

import { useState } from 'react'
import { Save, ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ReleaseData, initialReleaseData } from './types'
import { UploadGuideSection } from './UploadGuideSection'
import { ReleaseRegistrationSection } from './ReleaseRegistrationSection'
import { ReleaseTypeSection } from './ReleaseTypeSection'
import { GeographicalSection } from './GeographicalSection'
import { GoLiveDateSection } from './GoLiveDateSection'
import { ReleaseRightsSection } from './ReleaseRightsSection'
import { ReleaseRoyaltiesSection } from './ReleaseRoyaltiesSection'
import { CoverArtworkSection } from './CoverArtworkSection'
import { InvitationModal, ErrorReportModal, InvitationData, ErrorReportData } from './InvitationModals'

// Step definitions
const STEPS = [
  { id: 'guide', label: 'Upload Guide' },
  { id: 'registration', label: 'Release Details' },
  { id: 'type', label: 'Release Type' },
  { id: 'geography', label: 'Availability' },
  { id: 'date', label: 'Go-Live Date' },
  { id: 'rights', label: 'Rights' },
  { id: 'royalties', label: 'Royalties' },
  { id: 'artwork', label: 'Artwork' }
] as const

type StepId = typeof STEPS[number]['id']

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

  // Loading states
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingAndProceeding, setIsSavingAndProceeding] = useState(false)

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1

  // Navigate to next step
  const goToNextStep = () => {
    if (!isLastStep) {
      setCurrentStep(STEPS[currentStepIndex + 1].id)
    }
  }

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentStepIndex - 1].id)
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
      default:
        return false
    }
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
  const handleInvitationSubmit = (data: InvitationData) => {
    console.log('Invitation submitted:', data)
    // TODO: Implement API call to send invitation
  }

  // Handle error report submission
  const handleErrorReportSubmit = (data: ErrorReportData) => {
    console.log('Error report submitted:', data)
    // TODO: Implement API call to submit error report
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

    return (
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
    )
  }

  // Handle save and come back later
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement API call to save release data
      console.log('Saving release data:', releaseData)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay
    } finally {
      setIsSaving(false)
    }
  }

  // Handle save and proceed
  const handleSaveAndProceed = async () => {
    if (!isFormValid()) return

    setIsSavingAndProceeding(true)
    try {
      // TODO: Implement API call to save and proceed
      console.log('Saving and proceeding with release data:', releaseData)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay
    } finally {
      setIsSavingAndProceeding(false)
    }
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
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl text-white p-6 md:p-8 mb-6 shadow-lg border border-purple-600/40">
        <p className="text-sm uppercase tracking-wide text-purple-200 font-semibold">Artist Music</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-2">Upload &amp; Manage Your Music</h1>
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
      />

      {/* Error Report Modal */}
      <ErrorReportModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        onSubmit={handleErrorReportSubmit}
      />
    </div>
  )
}

// Re-export for convenience
export type { ReleaseData } from './types'
