'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { ARTIST_TYPES, ArtistTypeConfig } from '../../../data/artist-types'

const TYPE_ICONS: Record<number, string> = {
  1: '🎤',
  2: '🎧',
  3: '🎶',
  4: '🎙️',
  5: '🎹',
  6: '✍️',
  7: '📝',
  8: '🎼'
}

export interface ArtistTypeSelection {
  artistTypeId: number
  selections: Record<string, string[]>
}

interface ArtistTypeSelectorProps {
  value?: ArtistTypeSelection | null
  onChange?: (selection: ArtistTypeSelection) => void
}

function validateSelections(type: ArtistTypeConfig, selections: Record<string, string[]>): boolean {
  return type.groups.every((group) => {
    if (!group.required) return true
    const selected = selections[group.id] ?? []
    if (!selected.length) return false
    if (group.minSelect && selected.length < group.minSelect) return false
    if (group.maxSelect && selected.length > group.maxSelect) return false
    return true
  })
}

export function ArtistTypeSelectorV2({ value, onChange }: ArtistTypeSelectorProps) {
  const [expandedTypeId, setExpandedTypeId] = useState<number | null>(value?.artistTypeId ?? null)
  const [selectionState, setSelectionState] = useState<Record<number, Record<string, string[]>>>(() => {
    const initial: Record<number, Record<string, string[]>> = {}
    ARTIST_TYPES.forEach((config) => {
      initial[config.id] = {}
      config.groups.forEach((group) => {
        initial[config.id][group.id] = []
      })
    })
    if (value) {
      initial[value.artistTypeId] = {
        ...initial[value.artistTypeId],
        ...value.selections
      }
    }
    return initial
  })

  const selectedTypeId = value?.artistTypeId ?? expandedTypeId ?? null
  const selectedType = useMemo<ArtistTypeConfig | undefined>(() => {
    if (!selectedTypeId) return undefined
    return ARTIST_TYPES.find((config) => config.id === selectedTypeId)
  }, [selectedTypeId])

  const updateSelections = (typeId: number, groupId: string, nextValues: string[]) => {
    setSelectionState((prev) => ({
      ...prev,
      [typeId]: {
        ...(prev[typeId] ?? {}),
        [groupId]: nextValues
      }
    }))
  }

  const saveSelection = (type: ArtistTypeConfig) => {
    const selections = selectionState[type.id] ?? {}
    if (!validateSelections(type, selections)) return
    onChange?.({ artistTypeId: type.id, selections })
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <header className="text-center mb-6 space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Select Your Artist Type</h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Each artist type has different profile requirements. Choose the type that matches how you plan to use Gigrilla, then configure the relevant sub-types.
          </p>
        </header>

        <div className="space-y-4">
          {ARTIST_TYPES.map((config) => {
            const isExpanded = expandedTypeId === config.id
            const isSavedSelection = value?.artistTypeId === config.id
            const selections = selectionState[config.id] ?? {}
            const isValid = validateSelections(config, selections)

            return (
              <article key={config.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedTypeId(isExpanded ? null : config.id)}
                  className={`w-full flex items-start gap-4 p-5 text-left transition-colors ${
                    isSavedSelection ? 'bg-purple-50 border-l-4 border-l-purple-500' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-3xl" aria-hidden>
                    {TYPE_ICONS[config.id] ?? '🎵'}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Artist Type {config.id}: {config.name.replace(/^Artist Type \d+: /, '')}
                      </h3>
                      {isSavedSelection && (
                        <span className="text-xs px-3 py-1 rounded-full bg-purple-600 text-white">Selected</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{config.summary}</p>
                    <p className="text-xs text-gray-500">{config.description}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 mt-1" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 mt-1" />
                  )}
                </button>

                {isExpanded && (
                  <div className="bg-white border-t border-gray-100 p-5 space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg bg-purple-50 p-4 border border-purple-100">
                        <h4 className="text-sm font-semibold text-purple-900 mb-2">Profile Requirements</h4>
                        <ul className="space-y-1 text-xs text-purple-800">
                          <li>
                            {config.capabilities.showGigAbility
                              ? 'GigAbility must be completed for this artist type.'
                              : 'GigAbility is hidden for this artist type.'}
                          </li>
                          <li>
                            {config.capabilities.showMusicUploads
                              ? 'Music uploads are required during onboarding.'
                              : 'Music uploads are hidden (except optional samples).'}
                          </li>
                          <li>
                            {config.capabilities.gigBookingMode === 'public'
                              ? 'Venues can invite you to gigs through Gigrilla.'
                              : 'Bookings occur via collaborations with other artists.'}
                          </li>
                        </ul>
                      </div>

                      <div className="md:col-span-2 space-y-6">
                        {config.groups.map((group) => {
                          const selectedOptions = selections[group.id] ?? []
                          const isSingleSelect = group.maxSelect === 1 || group.minSelect === 1

                          return (
                            <div key={group.id} className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900 text-sm md:text-base">
                                    {group.title}
                                    {group.required && <span className="ml-2 text-xs text-purple-600">Required</span>}
                                  </h4>
                                  {group.minSelect && group.maxSelect && (
                                    <span className="text-xs text-gray-500">
                                      Select {group.minSelect === group.maxSelect ? group.minSelect : `${group.minSelect}-${group.maxSelect}`} options
                                    </span>
                                  )}
                                </div>
                                {group.helpText && <p className="text-xs text-gray-500 mt-1">{group.helpText}</p>}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {group.options.map((option) => {
                                  const isSelected = selectedOptions.includes(option.id)
                                  const disabled = Boolean(!isSelected && group.maxSelect && selectedOptions.length >= group.maxSelect)

                                  const handleClick = () => {
                                    if (isSingleSelect) {
                                      updateSelections(config.id, group.id, [option.id])
                                      return
                                    }
                                    if (disabled) return
                                    const nextValues = isSelected
                                      ? selectedOptions.filter((value) => value !== option.id)
                                      : [...selectedOptions, option.id]
                                    updateSelections(config.id, group.id, nextValues)
                                  }

                                  return (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={handleClick}
                                      disabled={disabled}
                                      className={`text-left rounded-lg border px-4 py-3 transition-all ${
                                        isSelected
                                          ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                          : `border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 ${
                                              disabled ? 'opacity-50 cursor-not-allowed' : ''
                                            }`
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="font-medium text-sm md:text-base">
                                          {option.label}
                                        </div>
                                        {isSelected && <span className="text-xs">Selected</span>}
                                      </div>
                                      {option.description && (
                                        <p className={`mt-1 text-xs ${isSelected ? 'text-purple-100' : 'text-gray-600'}`}>
                                          {option.description}
                                        </p>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 flex-wrap gap-3">
                      <div className="space-x-2 text-xs">
                        <span className="font-medium text-gray-700">Selections:</span>
                        {Object.entries(selections)
                          .flatMap(([groupId, ids]) =>
                            ids.map((valueId) => (
                              <span
                                key={`${groupId}-${valueId}`}
                                className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                              >
                                {config.groups
                                  .find((group) => group.id === groupId)
                                  ?.options.find((option) => option.id === valueId)?.label ?? valueId}
                              </span>
                            ))
                          )}
                        {!Object.values(selections).some((ids) => ids.length) && (
                          <span className="text-gray-400">No selections yet</span>
                        )}
                      </div>

                      <Button
                        type="button"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={!isValid}
                        onClick={() => saveSelection(config)}
                      >
                        {isValid ? 'Save Artist Type' : 'Complete selections to continue'}
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      {selectedType && (
        <section className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900 flex items-start gap-3">
          <div className="text-lg" aria-hidden>✅</div>
          <div>
            <div className="font-semibold">Artist Type {selectedType.id} saved</div>
            <div className="mt-1 space-y-1">
              {Object.entries(selectionState)
                .filter(([, values]) => values?.length)
                .map(([groupId, values]) => {
                  const group = selectedType.groups.find((g) => g.id === groupId)
                  if (!group) return null
                  const safeValues = Array.isArray(values) ? values : []
                  const labels = safeValues
                    .map((valueId) => group.options.find((option) => option.id === valueId)?.label ?? valueId)
                    .join(', ')
                  return (
                    <div key={groupId}>
                      <span className="font-medium">{group.title}:</span> {labels}
                    </div>
                  )
                })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
