'use client'

import { Shield, Users, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { SectionWrapper, InfoBox, IdCodeCard } from './shared'
import { ReleaseData } from './types'

interface ReleaseRightsSectionProps {
  releaseData: ReleaseData
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
  onInviteLabel: () => void
  onInvitePublisher: () => void
}

export function ReleaseRightsSection({
  releaseData,
  onUpdate,
  onInviteLabel,
  onInvitePublisher
}: ReleaseRightsSectionProps) {
  return (
    <SectionWrapper
      title="Release Rights"
      subtitle="Specify who owns the master and publishing rights"
    >
      <div className="space-y-8">
        {/* Master Rights */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold text-gray-800">Master Rights (Sound Recording)</h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Master rights refer to ownership of the actual sound recording. This is typically owned
            by the artist, record label, or whoever funded the recording.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Rights Holder <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={releaseData.masterRightsHolder}
                onChange={(e) => onUpdate('masterRightsHolder', e.target.value)}
                placeholder="Enter name of rights holder (artist, label, etc.)"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISNI <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  type="text"
                  value={releaseData.masterIsni}
                  onChange={(e) => onUpdate('masterIsni', e.target.value)}
                  placeholder="0000 0001 2345 6789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IPI/CAE Number <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  type="text"
                  value={releaseData.masterIpiCae}
                  onChange={(e) => onUpdate('masterIpiCae', e.target.value)}
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={releaseData.masterRightsConfirmed}
                  onChange={(e) => onUpdate('masterRightsConfirmed', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  I confirm I have the authority to distribute this master recording
                </span>
              </label>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onInviteLabel}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-1" /> Invite Label
              </Button>
            </div>
          </div>
        </div>

        {/* Publishing Rights */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold text-gray-800">Publishing Rights (Composition)</h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Publishing rights refer to ownership of the underlying musical composition (melody, lyrics).
            This is typically owned by the songwriter(s) or their publisher.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publishing Rights Holder <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={releaseData.publishingRightsHolder}
                onChange={(e) => onUpdate('publishingRightsHolder', e.target.value)}
                placeholder="Enter name of publisher or songwriter"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISNI <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  type="text"
                  value={releaseData.publishingIsni}
                  onChange={(e) => onUpdate('publishingIsni', e.target.value)}
                  placeholder="0000 0001 2345 6789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IPI/CAE Number <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  type="text"
                  value={releaseData.publishingIpiCae}
                  onChange={(e) => onUpdate('publishingIpiCae', e.target.value)}
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={releaseData.publishingRightsConfirmed}
                  onChange={(e) => onUpdate('publishingRightsConfirmed', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  I confirm I have the authority to distribute this composition
                </span>
              </label>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onInvitePublisher}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-1" /> Invite Publisher
              </Button>
            </div>
          </div>
        </div>

        {/* ID Code Reference */}
        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
          <IdCodeCard
            title="ISNI"
            description="International Standard Name Identifier - uniquely identifies contributors to creative works."
            learnMoreUrl="https://isni.org/"
            examples={['0000 0001 2345 6789']}
          />
          <IdCodeCard
            title="IPI/CAE"
            description="Interested Party Information - identifies rights holders in musical works for royalty collection."
            learnMoreUrl="https://www.ascap.com/"
            examples={['123456789', '00123456789']}
          />
        </div>

        <InfoBox title="Rights Ownership" variant="warning">
          <p>
            If you&apos;re unsure about rights ownership, consult with a music attorney or your
            record label/publisher. Incorrect rights information can lead to royalty disputes
            and potential legal issues.
          </p>
        </InfoBox>
      </div>
    </SectionWrapper>
  )
}
