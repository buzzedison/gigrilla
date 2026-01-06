'use client'

import { Plus, Shield, Users, Home, MapPin, Globe } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { SectionWrapper, InfoBox } from './shared'
import {
  ReleaseData,
  createRecordLabelEntry,
  createPublisherEntry,
  territoryOptions,
  TerritorySelection
} from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'

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
  const updateRecordLabel = (id: string, field: string, value: unknown) => {
    const updated = releaseData.recordLabels.map((label) =>
      label.id === id ? { ...label, [field]: value } : label
    )
    onUpdate('recordLabels', updated)
  }

  const updateLabelTerritories = (id: string, updates: Partial<TerritorySelection>) => {
    const updated = releaseData.recordLabels.map((label) => {
      if (label.id === id) {
        return {
          ...label,
          territories: {
            ...label.territories,
            ...updates
          }
        }
      }
      return label
    })
    onUpdate('recordLabels', updated)
  }

  const toggleLabelSpecificTerritory = (id: string, territory: string) => {
    const updated = releaseData.recordLabels.map((label) => {
      if (label.id === id) {
        const current = label.territories.specificList
        const nextList = current.includes(territory)
          ? current.filter((t) => t !== territory)
          : [...current, territory]
        return {
          ...label,
          territories: {
            ...label.territories,
            specificList: nextList
          }
        }
      }
      return label
    })
    onUpdate('recordLabels', updated)
  }

  const addRecordLabel = () => {
    onUpdate('recordLabels', [...releaseData.recordLabels, createRecordLabelEntry()])
  }

  const removeRecordLabel = (id: string) => {
    if (releaseData.recordLabels.length === 1) return
    onUpdate('recordLabels', releaseData.recordLabels.filter((label) => label.id !== id))
  }

  const updatePublisher = (id: string, field: string, value: unknown) => {
    const updated = releaseData.publishers.map((publisher) =>
      publisher.id === id ? { ...publisher, [field]: value } : publisher
    )
    onUpdate('publishers', updated)
  }

  const updatePublisherTerritories = (id: string, updates: Partial<TerritorySelection>) => {
    const updated = releaseData.publishers.map((publisher) => {
      if (publisher.id === id) {
        return {
          ...publisher,
          territories: {
            ...publisher.territories,
            ...updates
          }
        }
      }
      return publisher
    })
    onUpdate('publishers', updated)
  }

  const togglePublisherSpecificTerritory = (id: string, territory: string) => {
    const updated = releaseData.publishers.map((publisher) => {
      if (publisher.id === id) {
        const current = publisher.territories.specificList
        const nextList = current.includes(territory)
          ? current.filter((t) => t !== territory)
          : [...current, territory]
        return {
          ...publisher,
          territories: {
            ...publisher.territories,
            specificList: nextList
          }
        }
      }
      return publisher
    })
    onUpdate('publishers', updated)
  }

  const addPublisher = () => {
    onUpdate('publishers', [...releaseData.publishers, createPublisherEntry()])
  }

  const removePublisher = (id: string) => {
    if (releaseData.publishers.length === 1) return
    onUpdate('publishers', releaseData.publishers.filter((publisher) => publisher.id !== id))
  }

  const renderTerritoryControls = (
    territory: TerritorySelection,
    onChange: (updates: Partial<TerritorySelection>) => void,
    onToggleSpecific: (val: string) => void
  ) => {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={territory.home}
              onChange={(e) => onChange({ home: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            <span className="flex items-center gap-1 font-medium text-gray-800">
              <Home className="w-4 h-4 text-purple-500" /> Home Territory?
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={territory.specific}
              onChange={(e) => onChange({ specific: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            <span className="flex items-center gap-1 font-medium text-gray-800">
              <MapPin className="w-4 h-4 text-purple-500" /> Specific Territories?
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={territory.worldwide}
              onChange={(e) => onChange({ worldwide: e.target.checked, home: e.target.checked || territory.home })}
              className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            <span className="flex items-center gap-1 font-medium text-gray-800">
              <Globe className="w-4 h-4 text-purple-500" /> Worldwide?
            </span>
          </label>
        </div>

        {territory.specific && (
          <div className="space-y-2">
            <Select onValueChange={(value) => onToggleSpecific(value)}>
              <SelectTrigger className="w-full md:w-72">
                <SelectValue placeholder="Add Specific Territories" />
              </SelectTrigger>
              <SelectContent>
                {territoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {territory.specificList.map((territoryValue) => {
                const label = territoryOptions.find((opt) => opt.value === territoryValue)?.label || territoryValue
                return (
                  <span
                    key={territoryValue}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-xs text-purple-700"
                  >
                    {label}
                    <button type="button" onClick={() => onToggleSpecific(territoryValue)} className="text-purple-700">
                      x
                    </button>
                  </span>
                )
              })}
              {territory.specificList.length === 0 && (
                <span className="text-xs text-gray-500">No specific territories added.</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <SectionWrapper
      title="Release Rights"
      subtitle="Who controls the Master and Publishing Rights for this release?"
    >
      <div className="space-y-8">
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold text-gray-800">Master Rights (Sound Recording)</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Who owns the Sound Recording/Master of this Release?
          </p>

          <div className="space-y-4">
            <div className="max-w-sm">
              <label className="block text-sm font-medium text-gray-800 mb-2">Master Rights Owner <span className="text-red-500">*</span></label>
              <Select
                value={releaseData.masterRightsType || undefined}
                onValueChange={(value: 'independent' | 'label') => onUpdate('masterRightsType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent Artist</SelectItem>
                  <SelectItem value="label">I Have a Record Label</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {releaseData.masterRightsType === 'independent' && (
              <label className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-4">
                <input
                  type="checkbox"
                  checked={releaseData.masterRightsConfirmed}
                  onChange={(e) => onUpdate('masterRightsConfirmed', e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-800">
                  I am an Independent Artist and confirm I hold the necessary Sound Recording/Master Rights for this Release.
                </span>
              </label>
            )}

            {releaseData.masterRightsType === 'label' && (
              <div className="space-y-6">
                {releaseData.recordLabels.map((label, index) => (
                  <div key={label.id} className="border rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">Track [{index + 1}] Record Label Name</p>
                      {releaseData.recordLabels.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeRecordLabel(label.id)} className="text-red-500">
                          Remove Record Label
                        </Button>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="Start Typing Record Label Name..."
                      value={label.name}
                      onChange={(e) => updateRecordLabel(label.id, 'name', e.target.value)}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Record Label’s Contact Name</label>
                        <Input
                          type="text"
                          value={label.contactName}
                          onChange={(e) => updateRecordLabel(label.id, 'contactName', e.target.value)}
                          placeholder="Contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Record Label’s Contact Email</label>
                        <Input
                          type="email"
                          value={label.contactEmail}
                          onChange={(e) => updateRecordLabel(label.id, 'contactEmail', e.target.value)}
                          placeholder="contact@label.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Label Territorial Rights (required)</p>
                      {renderTerritoryControls(
                        label.territories,
                        (updates) => updateLabelTerritories(label.id, updates),
                        (territoryValue) => toggleLabelSpecificTerritory(label.id, territoryValue)
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant={label.confirmed ? 'default' : 'outline'}
                        onClick={() => updateRecordLabel(label.id, 'confirmed', !label.confirmed)}
                      >
                        {label.confirmed ? 'Record Label Confirmed' : 'Confirm Record Label'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onInviteLabel}
                        className="text-purple-600 border-purple-200"
                      >
                        Send Gigrilla Invite
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addRecordLabel}
                  className="border-dashed border-2"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Another Record Label
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold text-gray-800">Publishing Rights (Musical Work)</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Who is the Music Publisher for this Musical Work, and in which Territories?
          </p>

          <div className="space-y-4">
            <div className="max-w-sm">
              <label className="block text-sm font-medium text-gray-800 mb-2">Publishing Rights Owner <span className="text-red-500">*</span></label>
              <Select
                value={releaseData.publishingRightsType || undefined}
                onValueChange={(value: 'independent' | 'publisher') => onUpdate('publishingRightsType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent Artist (Self-Publishing)</SelectItem>
                  <SelectItem value="publisher">I Have a Publisher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {releaseData.publishingRightsType === 'independent' && (
              <label className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-4">
                <input
                  type="checkbox"
                  checked={releaseData.publishingRightsConfirmed}
                  onChange={(e) => onUpdate('publishingRightsConfirmed', e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-800">
                  I am self-publishing and confirm I hold the necessary Publishing Rights for this Musical Work.
                </span>
              </label>
            )}

            {releaseData.publishingRightsType === 'publisher' && (
              <div className="space-y-6">
                {releaseData.publishers.map((publisher, index) => (
                  <div key={publisher.id} className="border rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">Track [{index + 1}] Music Publisher Name</p>
                      {releaseData.publishers.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removePublisher(publisher.id)} className="text-red-500">
                          Remove Music Publisher
                        </Button>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="Start Typing Music Publisher Name..."
                      value={publisher.name}
                      onChange={(e) => updatePublisher(publisher.id, 'name', e.target.value)}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Publisher’s Contact Name</label>
                        <Input
                          type="text"
                          value={publisher.contactName}
                          onChange={(e) => updatePublisher(publisher.id, 'contactName', e.target.value)}
                          placeholder="Publisher contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Publisher’s Contact Email</label>
                        <Input
                          type="email"
                          value={publisher.contactEmail}
                          onChange={(e) => updatePublisher(publisher.id, 'contactEmail', e.target.value)}
                          placeholder="contact@publisher.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Publisher Territorial Rights (required)</p>
                      {renderTerritoryControls(
                        publisher.territories,
                        (updates) => updatePublisherTerritories(publisher.id, updates),
                        (territoryValue) => togglePublisherSpecificTerritory(publisher.id, territoryValue)
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant={publisher.confirmed ? 'default' : 'outline'}
                        onClick={() => updatePublisher(publisher.id, 'confirmed', !publisher.confirmed)}
                      >
                        {publisher.confirmed ? 'Music Publisher Confirmed' : 'Confirm Music Publisher'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onInvitePublisher}
                        className="text-purple-600 border-purple-200"
                      >
                        Send Gigrilla Invite
                      </Button>
                    </div>
                  </div>
                ))}

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={releaseData.applyPublisherToAllTracks}
                    onChange={(e) => onUpdate('applyPublisherToAllTracks', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  💾 Apply This Music Publisher to All Tracks in This Release
                </label>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addPublisher}
                  className="border-dashed border-2"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Another Publisher
                </Button>
              </div>
            )}
          </div>
        </div>

        <InfoBox title="Rights Ownership" variant="warning">
          <p>
            If you&apos;re unsure about rights ownership, consult with a music attorney or your Record Label/Publisher. Incorrect rights information can lead to royalty disputes and potential legal issues.
          </p>
        </InfoBox>
      </div>
    </SectionWrapper>
  )
}
