'use client'

import { useState } from 'react'
import { useGenreTaxonomy } from '../../../../lib/hooks/useGenreTaxonomy'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Label } from '../../../components/ui/label'
import { TrackData, moodOptions, languageOptions } from './types'
import { Info } from 'lucide-react'

interface TrackTagsSectionProps {
  track: TrackData
  trackIndex: number
  onUpdate: (field: keyof TrackData, value: unknown) => void
  applyToAll?: (field: keyof TrackData, value: unknown) => void
}

export function TrackTagsSection({ track, trackIndex, onUpdate, applyToAll }: TrackTagsSectionProps) {
  const { families, loading: genresLoading } = useGenreTaxonomy()
  const [selectedPrimaryFamily, setSelectedPrimaryFamily] = useState(track.primaryGenre.familyId)
  const [selectedSecondaryFamily, setSelectedSecondaryFamily] = useState(track.secondaryGenre.familyId)

  const selectedPrimaryFamilyData = families.find(f => f.id === selectedPrimaryFamily)
  const selectedSecondaryFamilyData = families.find(f => f.id === selectedSecondaryFamily)

  const updatePrimaryGenre = (familyId: string, mainGenreId: string, subGenreId?: string) => {
    const family = families.find(f => f.id === familyId)
    const mainGenre = family?.mainGenres.find(m => m.id === mainGenreId)
    
    if (!family || !mainGenre) return

    const existingMainGenre = track.primaryGenre.mainGenres.find(m => m.id === mainGenreId)
    
    if (existingMainGenre) {
      // Update existing main genre's sub-genres
      const updatedMainGenres = track.primaryGenre.mainGenres.map(m =>
        m.id === mainGenreId
          ? { ...m, subGenres: subGenreId && !m.subGenres.includes(subGenreId)
              ? [...m.subGenres, subGenreId].slice(0, 3) // Max 3 sub-genres
              : m.subGenres.filter(s => s !== subGenreId)
            }
          : m
      )
      onUpdate('primaryGenre', {
        familyId,
        mainGenres: updatedMainGenres
      })
    } else {
      // Add new main genre (max 3 main genres)
      if (track.primaryGenre.mainGenres.length < 3) {
        onUpdate('primaryGenre', {
          familyId,
          mainGenres: [
            ...track.primaryGenre.mainGenres,
            { id: mainGenreId, subGenres: subGenreId ? [subGenreId] : [] }
          ]
        })
      }
    }
  }

  const removePrimaryMainGenre = (mainGenreId: string) => {
    onUpdate('primaryGenre', {
      ...track.primaryGenre,
      mainGenres: track.primaryGenre.mainGenres.filter(m => m.id !== mainGenreId)
    })
  }

  const updateSecondaryGenre = (familyId: string, mainGenreId: string, subGenreId?: string) => {
    const family = families.find(f => f.id === familyId)
    const mainGenre = family?.mainGenres.find(m => m.id === mainGenreId)
    
    if (!family || !mainGenre) return

    const existingMainGenre = track.secondaryGenre.mainGenres.find(m => m.id === mainGenreId)
    
    if (existingMainGenre) {
      const updatedMainGenres = track.secondaryGenre.mainGenres.map(m =>
        m.id === mainGenreId
          ? { ...m, subGenres: subGenreId && !m.subGenres.includes(subGenreId)
              ? [...m.subGenres, subGenreId].slice(0, 3)
              : m.subGenres.filter(s => s !== subGenreId)
            }
          : m
      )
      onUpdate('secondaryGenre', {
        familyId,
        mainGenres: updatedMainGenres
      })
    } else {
      if (track.secondaryGenre.mainGenres.length < 3) {
        onUpdate('secondaryGenre', {
          familyId,
          mainGenres: [
            ...track.secondaryGenre.mainGenres,
            { id: mainGenreId, subGenres: subGenreId ? [subGenreId] : [] }
          ]
        })
      }
    }
  }

  const removeSecondaryMainGenre = (mainGenreId: string) => {
    onUpdate('secondaryGenre', {
      ...track.secondaryGenre,
      mainGenres: track.secondaryGenre.mainGenres.filter(m => m.id !== mainGenreId)
    })
  }

  return (
    <div className="space-y-6">
      {/* Primary Genre */}
      <div>
        <Label className="mb-2 block">
          Primary Genre <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-3">
          <Select
            value={selectedPrimaryFamily}
            onValueChange={(value) => {
              setSelectedPrimaryFamily(value)
              onUpdate('primaryGenre', { familyId: value, mainGenres: [] })
            }}
            disabled={genresLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Genre Family" />
            </SelectTrigger>
            <SelectContent>
              {families.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  {family.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPrimaryFamilyData && (
            <div className="space-y-2">
              {track.primaryGenre.mainGenres.map((mainGenre) => {
                const mainGenreData = selectedPrimaryFamilyData.mainGenres.find(m => m.id === mainGenre.id)
                return (
                  <div key={mainGenre.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{mainGenreData?.name}</span>
                      <button
                        type="button"
                        onClick={() => removePrimaryMainGenre(mainGenre.id)}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                    {mainGenreData?.subGenres && mainGenreData.subGenres.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-xs">Sub-Genres (max 3)</Label>
                        <Select
                          onValueChange={(subId) => updatePrimaryGenre(selectedPrimaryFamily, mainGenre.id, subId)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Add sub-genre" />
                          </SelectTrigger>
                          <SelectContent>
                            {mainGenreData.subGenres
                              .filter(sub => !mainGenre.subGenres.includes(sub.id))
                              .map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {mainGenre.subGenres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {mainGenre.subGenres.map((subId) => {
                              const sub = mainGenreData.subGenres.find(s => s.id === subId)
                              return sub ? (
                                <span
                                  key={subId}
                                  className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full flex items-center gap-1"
                                >
                                  {sub.name}
                                  <button
                                    type="button"
                                    onClick={() => updatePrimaryGenre(selectedPrimaryFamily, mainGenre.id, subId)}
                                    className="hover:text-red-600"
                                  >
                                    ×
                                  </button>
                                </span>
                              ) : null
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              
              {track.primaryGenre.mainGenres.length < 3 && (
                <Select
                  onValueChange={(mainId) => updatePrimaryGenre(selectedPrimaryFamily, mainId)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add Main Genre (max 3)" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPrimaryFamilyData.mainGenres
                      .filter(m => !track.primaryGenre.mainGenres.some(existing => existing.id === m.id))
                      .map((mainGenre) => (
                        <SelectItem key={mainGenre.id} value={mainGenre.id}>
                          {mainGenre.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {applyToAll && (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    applyToAll('primaryGenre', track.primaryGenre)
                  }
                }}
                className="w-4 h-4"
              />
              Apply Primary Genre Selection to All Tracks in This Release
            </label>
          )}
        </div>
      </div>

      {/* Secondary Genre */}
      <div>
        <Label className="mb-2 block">Secondary Genre (Optional)</Label>
        <div className="space-y-3">
          <Select
            value={selectedSecondaryFamily}
            onValueChange={(value) => {
              setSelectedSecondaryFamily(value)
              onUpdate('secondaryGenre', { familyId: value, mainGenres: [] })
            }}
            disabled={genresLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Genre Family" />
            </SelectTrigger>
            <SelectContent>
              {families.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  {family.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedSecondaryFamilyData && (
            <div className="space-y-2">
              {track.secondaryGenre.mainGenres.map((mainGenre) => {
                const mainGenreData = selectedSecondaryFamilyData.mainGenres.find(m => m.id === mainGenre.id)
                return (
                  <div key={mainGenre.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{mainGenreData?.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSecondaryMainGenre(mainGenre.id)}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                    {mainGenreData?.subGenres && mainGenreData.subGenres.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-xs">Sub-Genres (max 3)</Label>
                        <Select
                          onValueChange={(subId) => updateSecondaryGenre(selectedSecondaryFamily, mainGenre.id, subId)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Add sub-genre" />
                          </SelectTrigger>
                          <SelectContent>
                            {mainGenreData.subGenres
                              .filter(sub => !mainGenre.subGenres.includes(sub.id))
                              .map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {mainGenre.subGenres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {mainGenre.subGenres.map((subId) => {
                              const sub = mainGenreData.subGenres.find(s => s.id === subId)
                              return sub ? (
                                <span
                                  key={subId}
                                  className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full flex items-center gap-1"
                                >
                                  {sub.name}
                                  <button
                                    type="button"
                                    onClick={() => updateSecondaryGenre(selectedSecondaryFamily, mainGenre.id, subId)}
                                    className="hover:text-red-600"
                                  >
                                    ×
                                  </button>
                                </span>
                              ) : null
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              
              {track.secondaryGenre.mainGenres.length < 3 && (
                <Select
                  onValueChange={(mainId) => updateSecondaryGenre(selectedSecondaryFamily, mainId)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add Main Genre (max 3)" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSecondaryFamilyData.mainGenres
                      .filter(m => !track.secondaryGenre.mainGenres.some(existing => existing.id === m.id))
                      .map((mainGenre) => (
                        <SelectItem key={mainGenre.id} value={mainGenre.id}>
                          {mainGenre.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {applyToAll && (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    applyToAll('secondaryGenre', track.secondaryGenre)
                  }
                }}
                className="w-4 h-4"
              />
              Apply Secondary Genre Selection to All Tracks in This Release
            </label>
          )}
        </div>
      </div>

      {/* Primary Mood */}
      <div>
        <Label htmlFor={`primary-mood-${trackIndex}`}>
          Primary Mood <span className="text-red-500">*</span>
        </Label>
        <Select
          value={track.primaryMood}
          onValueChange={(value) => onUpdate('primaryMood', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select primary mood" />
          </SelectTrigger>
          <SelectContent>
            {moodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {applyToAll && (
          <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  applyToAll('primaryMood', track.primaryMood)
                }
              }}
              className="w-4 h-4"
            />
            Apply Primary Mood to All Tracks in This Release
          </label>
        )}
      </div>

      {/* Secondary Moods */}
      <div>
        <Label htmlFor={`secondary-moods-${trackIndex}`}>Secondary Mood(s) (Optional)</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {moodOptions.filter(m => m.value !== track.primaryMood && m.value !== 'none').map((mood) => {
            const isSelected = track.secondaryMoods.includes(mood.value)
            return (
              <button
                key={mood.value}
                type="button"
                onClick={() => {
                  const newMoods = isSelected
                    ? track.secondaryMoods.filter(m => m !== mood.value)
                    : [...track.secondaryMoods, mood.value]
                  onUpdate('secondaryMoods', newMoods)
                }}
                className={`px-3 py-1 text-sm rounded-full border ${
                  isSelected
                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {mood.label}
              </button>
            )
          })}
        </div>
        {applyToAll && (
          <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  applyToAll('secondaryMoods', track.secondaryMoods)
                }
              }}
              className="w-4 h-4"
            />
            Apply Secondary Mood to All Tracks in This Release
          </label>
        )}
      </div>

      {/* Primary Language */}
      <div>
        <Label htmlFor={`primary-language-${trackIndex}`}>
          Primary Language of Lyrics <span className="text-red-500">*</span>
        </Label>
        <Select
          value={track.primaryLanguage}
          onValueChange={(value) => onUpdate('primaryLanguage', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select primary language" />
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {applyToAll && (
          <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  applyToAll('primaryLanguage', track.primaryLanguage)
                }
              }}
              className="w-4 h-4"
            />
            Apply Primary Language to All Tracks in This Release
          </label>
        )}
      </div>

      {/* Secondary Language */}
      <div>
        <Label htmlFor={`secondary-language-${trackIndex}`}>Secondary Language of Lyrics (Optional)</Label>
        <Select
          value={track.secondaryLanguage}
          onValueChange={(value) => onUpdate('secondaryLanguage', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select secondary language" />
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {applyToAll && (
          <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  applyToAll('secondaryLanguage', track.secondaryLanguage)
                }
              }}
              className="w-4 h-4"
            />
            Apply Secondary Language to All Tracks in This Release
          </label>
        )}
      </div>

      {/* Explicit Content */}
      <div>
        <Label htmlFor={`explicit-content-${trackIndex}`}>
          Explicit (E) Content? <span className="text-red-500">*</span>
        </Label>
        <Select
          value={track.explicitContent}
          onValueChange={(value) => {
            onUpdate('explicitContent', value)
            // Auto-set child-safe if explicit
            if (value === 'yes-explicit') {
              onUpdate('childSafeContent', 'no-adult-themes')
            }
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select explicit content option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-clean-original">No (Clean Original)</SelectItem>
            <SelectItem value="no-clean-radio-edit">No (Clean Radio Edit)</SelectItem>
            <SelectItem value="yes-explicit">Yes (Explicit Content)</SelectItem>
          </SelectContent>
        </Select>
        {applyToAll && (
          <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  applyToAll('explicitContent', track.explicitContent)
                }
              }}
              className="w-4 h-4"
            />
            Apply this Explicit Content Description to All Tracks in This Release
          </label>
        )}
      </div>

      {/* Child-Safe Content */}
      <div>
        <Label htmlFor={`child-safe-${trackIndex}`}>
          Child-Safe (CS) Content? <span className="text-red-500">*</span>
        </Label>
        <Select
          value={track.childSafeContent}
          onValueChange={(value) => onUpdate('childSafeContent', value)}
          disabled={track.explicitContent === 'yes-explicit'}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select child-safe option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes-original">Yes (Child-Safe Original)</SelectItem>
            <SelectItem value="yes-radio-edit">Yes (Child-Safe Radio Edit)</SelectItem>
            <SelectItem value="no-adult-themes">No (It Has Adult Themes)</SelectItem>
          </SelectContent>
        </Select>
        {track.explicitContent === 'yes-explicit' && (
          <div className="mt-2 flex items-start gap-2 text-xs text-gray-600">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Child-Safe Content is automatically set to "No (Adult Themes)" when Explicit Content is selected.</p>
          </div>
        )}
        {applyToAll && (
          <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  applyToAll('childSafeContent', track.childSafeContent)
                }
              }}
              className="w-4 h-4"
            />
            Apply this Child-Safe Content Description to All Tracks in This Release
          </label>
        )}
      </div>
    </div>
  )
}
