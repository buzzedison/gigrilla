'use client'

import Link from 'next/link'
import { Checkbox } from '../../../components/ui/checkbox'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData } from './types'

interface SubmitReleaseSectionProps {
  releaseData: ReleaseData
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
}

const policyLinks = {
  terms: '/terms',
  distribution: '/distribution-policy',
  privacy: '/privacy'
}

export function SubmitReleaseSection({ releaseData, onUpdate }: SubmitReleaseSectionProps) {
  return (
    <SectionWrapper
      title="Submit This Release"
      subtitle="Ts&Cs & Confirmations (all required). You must tick each box and complete the digital signature before submitting."
    >
      {/* I Agree To */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 font-ui">I Agree To:</h3>
        <div className="space-y-3 pl-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              id="agree-terms"
              checked={releaseData.agreeTermsOfUse}
              onCheckedChange={(c) => onUpdate('agreeTermsOfUse', c === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-gray-700">
              Gigrilla&apos;s{' '}
              <Link href={policyLinks.terms} className="text-purple-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                Terms of Use
              </Link>
              ; and
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              id="agree-distribution"
              checked={releaseData.agreeDistributionPolicy}
              onCheckedChange={(c) => onUpdate('agreeDistributionPolicy', c === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-gray-700">
              Gigrilla&apos;s{' '}
              <Link href={policyLinks.distribution} className="text-purple-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                Distribution Policy
              </Link>
              ; and
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              id="agree-privacy"
              checked={releaseData.agreePrivacyPolicy}
              onCheckedChange={(c) => onUpdate('agreePrivacyPolicy', c === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-gray-700">
              Gigrilla&apos;s{' '}
              <Link href={policyLinks.privacy} className="text-purple-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>
      </div>

      {/* I Confirm That */}
      <div className="space-y-4 mt-8">
        <h3 className="text-sm font-semibold text-gray-800 font-ui">I Confirm That:</h3>
        <div className="space-y-3 pl-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              id="confirm-details"
              checked={releaseData.confirmDetailsTrue}
              onCheckedChange={(c) => onUpdate('confirmDetailsTrue', c === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-gray-700">
              All Details Given By Me Are True, Honest &amp; Correct At This Time Of Submission; and
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              id="confirm-liability"
              checked={releaseData.confirmLegalLiability}
              onCheckedChange={(c) => onUpdate('confirmLegalLiability', c === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I Accept Legal Liability For This Release Submission; and
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              id="confirm-no-other-artist"
              checked={releaseData.confirmNoOtherArtistName}
              onCheckedChange={(c) => onUpdate('confirmNoOtherArtistName', c === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I&apos;m not using any other Artist&apos;s name in my name, Track Titles, or Release Title, without their prior approval.
            </span>
          </label>
        </div>
      </div>

      {/* I Am */}
      <div className="space-y-4 mt-8">
        <h3 className="text-sm font-semibold text-gray-800 font-ui">I Am:</h3>
        <InfoBox title="Authority" variant="info">
          Only Artist Admins can authorise this submission; this means the Artist (or Artist members) themself, their appointed Manager, or their contracted Record Label&apos;s approved representative.
        </InfoBox>
        <div className="space-y-3 pl-1 mt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="signatoryRole"
              checked={releaseData.signatoryRole === 'owner'}
              onChange={() => onUpdate('signatoryRole', 'owner')}
              className="mt-1 h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700 font-medium">
              The Owner Of The Master Recording.
            </span>
          </label>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-ui">— OR —</div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="signatoryRole"
              checked={releaseData.signatoryRole === 'representative'}
              onChange={() => onUpdate('signatoryRole', 'representative')}
              className="mt-1 h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700 font-medium">
              The Appointed &amp; Authorised Representative Of The Owner Of The Master Recording.
            </span>
          </label>
        </div>
      </div>

      {/* Digital Signature */}
      <div className="space-y-4 mt-8">
        <h3 className="text-sm font-semibold text-gray-800 font-ui">Digital Signature</h3>
        <p className="text-sm text-gray-600">
          First and last name plus email required. Type your full, real legal name, including any middle names if you have them.
        </p>
        <InfoBox title="Your data" variant="info">
          We do not use emails for 3rd party marketing, and we&apos;ll never sell your data.
        </InfoBox>
        <div className="grid gap-4 sm:grid-cols-3 mt-4">
          <div>
            <Label htmlFor="signatory-first" className="text-sm font-medium text-gray-700">First / Given Name *</Label>
            <Input
              id="signatory-first"
              value={releaseData.signatoryFirstName}
              onChange={(e) => onUpdate('signatoryFirstName', e.target.value)}
              placeholder="First name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="signatory-middle" className="text-sm font-medium text-gray-700">Middle Name(s)</Label>
            <Input
              id="signatory-middle"
              value={releaseData.signatoryMiddleNames}
              onChange={(e) => onUpdate('signatoryMiddleNames', e.target.value)}
              placeholder="Middle name(s)"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="signatory-last" className="text-sm font-medium text-gray-700">Last / Family Name *</Label>
            <Input
              id="signatory-last"
              value={releaseData.signatoryLastName}
              onChange={(e) => onUpdate('signatoryLastName', e.target.value)}
              placeholder="Last name"
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-4 max-w-md">
          <Label htmlFor="signatory-email" className="text-sm font-medium text-gray-700">Email Address For Confirmation *</Label>
          <Input
            id="signatory-email"
            type="email"
            value={releaseData.signatoryEmail}
            onChange={(e) => onUpdate('signatoryEmail', e.target.value)}
            placeholder="your@email.com"
            className="mt-1"
          />
        </div>
      </div>
    </SectionWrapper>
  )
}
