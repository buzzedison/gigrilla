'use client'

import { DollarSign, Building2, Music2, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { SectionWrapper, InfoBox, IdCodeCard } from './shared'
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
      subtitle="Configure how royalties are collected and distributed"
    >
      <div className="space-y-8">
        {/* Master Royalties - Distributor */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold text-gray-800">Master Royalties (Recording)</h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Master royalties are paid for the use of your sound recording. These are typically
            collected by your distributor from streaming platforms and digital stores.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distributor <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={releaseData.distributorName}
                  onChange={(e) => onUpdate('distributorName', e.target.value)}
                  placeholder="Enter distributor name (e.g., DistroKid, TuneCore)"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onInviteDistributor}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-1" /> Invite
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={releaseData.distributorConfirmed}
                onChange={(e) => onUpdate('distributorConfirmed', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                I confirm my distributor agreement is in place for this release
              </span>
            </label>
          </div>
        </div>

        {/* Composition Royalties - PRO */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-800">Performance Royalties (PRO)</h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Performance royalties are paid when your music is played publicly (radio, TV, venues,
            streaming). These are collected by Performing Rights Organizations (PROs).
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PRO Affiliation <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={releaseData.proName}
                  onChange={(e) => onUpdate('proName', e.target.value)}
                  placeholder="Enter PRO name (e.g., ASCAP, BMI, SESAC, PRS)"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onInvitePro}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-1" /> Invite
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={releaseData.proConfirmed}
                onChange={(e) => onUpdate('proConfirmed', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                I confirm my works are registered with my PRO
              </span>
            </label>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Common PROs:</strong> ASCAP, BMI, SESAC (US) • PRS (UK) • SOCAN (Canada) •
                APRA AMCOS (Australia) • GEMA (Germany) • SACEM (France)
              </p>
            </div>
          </div>
        </div>

        {/* Mechanical Royalties - MCS */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Music2 className="w-5 h-5 text-amber-500" />
            <h4 className="font-semibold text-gray-800">Mechanical Royalties (MCS)</h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Mechanical royalties are paid for the reproduction of your composition (streaming,
            downloads, physical copies). These are collected by Mechanical Collection Societies.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MCS Affiliation <span className="text-gray-400">(if applicable)</span>
              </label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={releaseData.mcsName}
                  onChange={(e) => onUpdate('mcsName', e.target.value)}
                  placeholder="Enter MCS name (e.g., MLC, Harry Fox Agency)"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onInviteMcs}
                  className="text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  <Plus className="w-4 h-4 mr-1" /> Invite
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={releaseData.mcsConfirmed}
                onChange={(e) => onUpdate('mcsConfirmed', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                I confirm my works are registered for mechanical royalty collection
              </span>
            </label>

            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> In the US, The MLC (Mechanical Licensing Collective) collects
                mechanical royalties from streaming services. Registration is free and recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Royalty Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
          <IdCodeCard
            title="ISRC"
            description="Identifies individual recordings for royalty tracking across platforms."
            learnMoreUrl="https://usisrc.org/"
            examples={['US-S1Z-21-00001']}
          />
          <IdCodeCard
            title="ISWC"
            description="Identifies the underlying composition for publishing royalties."
            learnMoreUrl="https://www.iswc.org/"
            examples={['T-010.123.456-7']}
          />
          <IdCodeCard
            title="IPI/CAE"
            description="Identifies you as a rights holder for royalty collection."
            learnMoreUrl="https://www.ascap.com/"
            examples={['123456789']}
          />
        </div>

        <InfoBox title="Maximize Your Royalties" variant="success">
          <ul className="list-disc list-inside space-y-1">
            <li>Register with a PRO to collect performance royalties</li>
            <li>Register with The MLC (US) or equivalent for mechanical royalties</li>
            <li>Consider a publishing administrator if you&apos;re self-published</li>
            <li>Keep your metadata accurate and consistent across all platforms</li>
          </ul>
        </InfoBox>
      </div>
    </SectionWrapper>
  )
}
