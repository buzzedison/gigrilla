'use client'

import { DollarSign, Building2, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { SectionWrapper, InfoBox } from './shared'
import { ReleaseData } from './types'

interface ReleaseRoyaltiesSectionProps {
  releaseData: ReleaseData
  onUpdate: (field: keyof ReleaseData, value: unknown) => void
  onInviteDistributor: () => void
  onInvitePro: () => void
  onInviteMcs: () => void
}

export function ReleaseRoyaltiesSection({
  releaseData,
  onUpdate,
  onInviteDistributor,
  onInvitePro,
  onInviteMcs
}: ReleaseRoyaltiesSectionProps) {
  return (
    <SectionWrapper
      title="Release Royalties"
      subtitle="Gigrilla will only pay your Royalties to the organisations you confirm below."
    >
      <div className="space-y-8">
        <InfoBox title="Why this matters" variant="info">
          <p>
            This ensures that all relevant Rights Holders get paid properly and that all laws are complied with. It is important that you are fully registered to avoid missing out on money owed to you, globally.
          </p>
        </InfoBox>

        <div className="border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <div>
              <h4 className="font-semibold text-gray-900">Your Master Royalties (Sound Recording)</h4>
              <p className="text-sm text-gray-600">
                Whoever uploads the Music will receive the Master Royalties earned, and they are legally responsible for distributing these Master Royalties to all relevant Master Rights Holders accordingly, not Gigrilla.
              </p>
            </div>
          </div>

          <label className="text-sm font-medium text-gray-800">Distributor Name</label>
          <Input
            type="text"
            value={releaseData.distributorName}
            onChange={(e) => onUpdate('distributorName', e.target.value)}
            placeholder="Distributor Name (if pulled through) // Start Typing Distributor Name..."
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={releaseData.distributorConfirmed}
              onChange={(e) => onUpdate('distributorConfirmed', e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            I confirm my distributor agreement is in place for this release.
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Distributor’s Contact Name (if known)</label>
              <Input
                type="text"
                value={releaseData.distributorContactName}
                onChange={(e) => onUpdate('distributorContactName', e.target.value)}
                placeholder="Distributor contact name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Distributor’s Email</label>
              <Input
                type="email"
                value={releaseData.distributorContactEmail}
                onChange={(e) => onUpdate('distributorContactEmail', e.target.value)}
                placeholder="contact@distributor.com"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onInviteDistributor}
            className="text-green-600 border-green-200"
          >
            <Plus className="w-4 h-4 mr-1" /> Send Gigrilla Invite
          </Button>
        </div>

        <div className="border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <div>
              <h4 className="font-semibold text-gray-900">Your Composition Royalties (Musical Work)</h4>
              <p className="text-sm text-gray-600">
                Select whether you wrote any part of this release. If you did, provide your Performing Rights Organisation and Mechanical Collection Society so we can ensure royalties route correctly.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-800">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!releaseData.wroteComposition}
                onChange={(e) => {
                  onUpdate('wroteComposition', !e.target.checked)
                }}
                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              I did not write any of the lyrics and/or musical composition within this Release.
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={releaseData.wroteComposition}
                onChange={(e) => onUpdate('wroteComposition', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              I did write some/all of the lyrics and/or musical composition within this Release.
            </label>
          </div>

          {releaseData.wroteComposition && (
            <div className="space-y-6">
              <div className="border rounded-2xl p-4 space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">Your Performing Rights Organisation</p>
                  <p className="text-xs text-gray-600">ℹ️ This is PRS for Music (UK); BMI/ASCAP/SESAC (USA); whoever collects your Performance Royalties.</p>
                </div>
                <Input
                  type="text"
                  value={releaseData.proName}
                  onChange={(e) => onUpdate('proName', e.target.value)}
                  placeholder="Performing Rights Organisation (if pulled through) // Start Typing PRO Name..."
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={releaseData.proConfirmed}
                    onChange={(e) => onUpdate('proConfirmed', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  I confirm my works are registered with my PRO.
                </label>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">PRO’s Contact Name (if known)</label>
                    <Input
                      type="text"
                      value={releaseData.proContactName}
                      onChange={(e) => onUpdate('proContactName', e.target.value)}
                      placeholder="PRO contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">PRO’s Email</label>
                    <Input
                      type="email"
                      value={releaseData.proContactEmail}
                      onChange={(e) => onUpdate('proContactEmail', e.target.value)}
                      placeholder="contact@pro.org"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={onInvitePro}
                  className="text-blue-600 border-blue-200"
                >
                  <Plus className="w-4 h-4 mr-1" /> Send Gigrilla Invite
                </Button>
              </div>

              <div className="border rounded-2xl p-4 space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">Your Mechanical Collection Society</p>
                  <p className="text-xs text-gray-600">ℹ️ This is MCPS in the UK; The MLC in the USA; whoever collects your Mechanical Royalties.</p>
                </div>
                <Input
                  type="text"
                  value={releaseData.mcsName}
                  onChange={(e) => onUpdate('mcsName', e.target.value)}
                  placeholder="Mechanical Collection Society (if pulled through) // Start Typing MCS Name..."
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={releaseData.mcsConfirmed}
                    onChange={(e) => onUpdate('mcsConfirmed', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  I confirm my works are registered for mechanical royalty collection.
                </label>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">MCS’s Contact Name (if known)</label>
                    <Input
                      type="text"
                      value={releaseData.mcsContactName}
                      onChange={(e) => onUpdate('mcsContactName', e.target.value)}
                      placeholder="MCS contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">MCS’s Email</label>
                    <Input
                      type="email"
                      value={releaseData.mcsContactEmail}
                      onChange={(e) => onUpdate('mcsContactEmail', e.target.value)}
                      placeholder="contact@mcs.org"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={onInviteMcs}
                  className="text-amber-600 border-amber-200"
                >
                  <Plus className="w-4 h-4 mr-1" /> Send Gigrilla Invite
                </Button>
              </div>
            </div>
          )}
        </div>

        <InfoBox title="Maximize Your Royalties" variant="success">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Register with a PRO to collect performance royalties.</li>
            <li>Register with The MLC (US) or equivalent for mechanical royalties.</li>
            <li>Consider a publishing administrator if you’re self-published.</li>
            <li>Keep your metadata accurate and consistent across all platforms.</li>
          </ul>
        </InfoBox>
      </div>
    </SectionWrapper>
  )
}
