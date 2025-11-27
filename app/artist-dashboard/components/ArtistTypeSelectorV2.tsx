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

                          // Check if this group has grouped options
                          const hasGroupedOptions = group.options.some(opt => opt.group)
                          const groupedOptions = hasGroupedOptions
                            ? group.options.reduce((acc, opt) => {
                                const groupKey = opt.group || 'Other'
                                if (!acc[groupKey]) acc[groupKey] = []
                                acc[groupKey].push(opt)
                                return acc
                              }, {} as Record<string, typeof group.options>)
                            : null

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

                              <div className="relative">
                                {/* Scroll hint banner - top */}
                                {group.options.length > 6 && !hasGroupedOptions && (
                                  <div className="mb-3 rounded-lg bg-purple-100 border-2 border-purple-400 p-3 text-center">
                                    <div className="flex items-center justify-center gap-2 text-purple-900 font-semibold text-sm">
                                      <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                      <span>{group.options.length} Options Available - Scroll Down to See All</span>
                                      <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </div>
                                )}

                                {/* Render grouped options */}
                                {hasGroupedOptions && groupedOptions ? (
                                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                                    {Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
                                      <div key={groupName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <h5 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                                          {groupName}
                                        </h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {groupOpts.map((option) => {
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
                                                className={`text-left rounded-md border px-3 py-2 transition-all text-sm ${
                                                  isSelected
                                                    ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md font-medium'
                                                    : `border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50 ${
                                                        disabled ? 'opacity-50 cursor-not-allowed' : ''
                                                      }`
                                                }`}
                                              >
                                                <div className="flex items-center justify-between gap-2">
                                                  <span>{option.label}</span>
                                                  {isSelected && <span className="text-xs">✓</span>}
                                                </div>
                                              </button>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <>
                                    {/* Scroll indicator - top shadow */}
                                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10 opacity-0 transition-opacity"
                                         style={{ opacity: group.options.length > 6 ? 1 : 0 }} />

                                    {/* Scrollable container */}
                                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
                                      group.options.length > 6 ? 'max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100 border-2 border-purple-200 rounded-lg p-3' : ''
                                    }`}>
                                      {group.options.map((option) => {
                                    const isSelected = selectedOptions.includes(option.id)
                                    
                                    // Special logic for Type 4 "All Vocals" option
                                    const isAllVocalsGroup = config.id === 4 && group.id === 'vocal-role'
                                    const isAllVocalsOption = option.id === 'all-vocals'
                                    const individualVocalOptions = ['lead-vocalist', 'backing-vocalist', 'session-vocalist', 'voiceover-artist']
                                    const hasAllVocalsSelected = isAllVocalsGroup && selectedOptions.includes('all-vocals')
                                    const hasAllIndividualVocalsSelected = isAllVocalsGroup && 
                                      individualVocalOptions.every(opt => selectedOptions.includes(opt))
                                    
                                    // Disable individual options if "All Vocals" is selected
                                    // Disable "All Vocals" if any individual option is selected (but not all)
                                    let disabled = Boolean(!isSelected && group.maxSelect && selectedOptions.length >= group.maxSelect)
                                    if (isAllVocalsGroup) {
                                      if (isAllVocalsOption && selectedOptions.length > 0 && !hasAllIndividualVocalsSelected) {
                                        disabled = false // Allow clicking "All Vocals" when some individuals are selected
                                      } else if (!isAllVocalsOption && hasAllVocalsSelected) {
                                        disabled = true // Disable individual options when "All Vocals" is selected
                                      }
                                    }

                                    const handleClick = () => {
                                      if (isSingleSelect) {
                                        updateSelections(config.id, group.id, [option.id])
                                        return
                                      }
                                      if (disabled) return
                                      
                                      // Special handling for Type 4 vocal roles
                                      if (isAllVocalsGroup) {
                                        if (isAllVocalsOption) {
                                          // Clicking "All Vocals"
                                          if (isSelected) {
                                            // Deselect "All Vocals" only
                                            updateSelections(config.id, group.id, selectedOptions.filter(v => v !== 'all-vocals'))
                                          } else {
                                            // Select "All Vocals" and clear individual selections
                                            updateSelections(config.id, group.id, ['all-vocals'])
                                          }
                                          return
                                        } else {
                                          // Clicking an individual vocal option
                                          let nextValues: string[]
                                          if (isSelected) {
                                            // Deselecting an individual option
                                            nextValues = selectedOptions.filter((value) => value !== option.id && value !== 'all-vocals')
                                          } else {
                                            // Selecting an individual option
                                            nextValues = [...selectedOptions.filter(v => v !== 'all-vocals'), option.id]
                                            // If all individual options are now selected, auto-select "All Vocals"
                                            if (individualVocalOptions.every(opt => nextValues.includes(opt))) {
                                              nextValues = ['all-vocals']
                                            }
                                          }
                                          updateSelections(config.id, group.id, nextValues)
                                          return
                                        }
                                      }
                                      
                                      // Default multi-select behavior
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

                                {/* Scroll indicator - bottom shadow */}
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10 opacity-0 transition-opacity"
                                     style={{ opacity: group.options.length > 6 ? 1 : 0 }} />

                                {/* Scroll hint banner - bottom */}
                                {group.options.length > 6 && (
                                  <div className="mt-3 rounded-lg bg-orange-100 border-2 border-orange-400 p-3 text-center">
                                    <div className="flex items-center justify-center gap-2 text-orange-900 font-semibold text-sm">
                                      <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                      <span>Scroll Up to See More Options</span>
                                      <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 flex-wrap gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="font-semibold text-sm text-gray-900 mb-2">Your Selections:</div>
                        {Object.entries(selections).map(([groupId, ids]) => {
                          const group = config.groups.find((g) => g.id === groupId)
                          if (!group || !ids.length) return null
                          return (
                            <div key={groupId} className="space-y-1">
                              <div className="text-xs font-medium text-gray-600">{group.title}:</div>
                              <div className="flex flex-wrap gap-2">
                                {ids.map((valueId) => (
                                  <span
                                    key={`${groupId}-${valueId}`}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow-sm"
                                  >
                                    ✓ {group.options.find((option) => option.id === valueId)?.label ?? valueId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                        {!Object.values(selections).some((ids) => ids.length) && (
                          <span className="text-sm text-gray-400 italic">No selections yet - choose options above</span>
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
