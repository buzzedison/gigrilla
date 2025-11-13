'use client'

import { useState, useEffect } from "react"
import { useAuth } from "../../../lib/auth-context"
import { useGenreTaxonomy } from "../../../lib/hooks/useGenreTaxonomy"
import type { GenreFamily, GenreType, GenreSubType } from "../../../types/genres"

interface SelectedGenrePath {
  familyId: string
  typeId: string
  subId?: string
}

function buildLabel(family: GenreFamily, type: GenreType, sub?: GenreSubType) {
  if (sub) return `${family.name} > ${type.name} > ${sub.name}`
  return `${family.name} > ${type.name}`
}

export function MusicGenreSelector() {
  const { user } = useAuth()
  const [selectedPaths, setSelectedPaths] = useState<SelectedGenrePath[]>([])
  const [preferencesLoading, setPreferencesLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { families, loading: taxonomyLoading, error: taxonomyError } = useGenreTaxonomy()

  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      setPreferencesLoading(true)
      try {
        const response = await fetch('/api/user-genres')
        const result = await response.json()
        if (Array.isArray(result.data)) {
          const paths: SelectedGenrePath[] = result.data
            .map((entry: string) => entry.split(':'))
            .filter((parts: string[]) => parts.length >= 2)
            .map((parts: string[]) => ({
              familyId: parts[0],
              typeId: parts[1],
              subId: parts[2]
            }))
          setSelectedPaths(paths)
        } else {
          setSelectedPaths([])
        }
      } catch (error) {
        console.error('Error loading user genres:', error)
      } finally {
        setPreferencesLoading(false)
      }
    }
    load()
  }, [user?.id])

  const handleSave = async (paths: SelectedGenrePath[]) => {
    if (!user) return
    setSaving(true)
    try {
      const payload = paths.map((path) => {
        if (path.subId) return `${path.familyId}:${path.typeId}:${path.subId}`
        return `${path.familyId}:${path.typeId}`
      })
      const response = await fetch('/api/user-genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ genres: payload })
      })
      const result = await response.json()
      if (result.error) {
        console.error('Error saving genres:', result.error)
      }
    } catch (error) {
      console.error('Error saving genres:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleSelection = (path: SelectedGenrePath) => {
    setSelectedPaths((prev) => {
      const exists = prev.some((p) => p.familyId === path.familyId && p.typeId === path.typeId && p.subId === path.subId)
      const next = exists
        ? prev.filter((p) => !(p.familyId === path.familyId && p.typeId === path.typeId && p.subId === path.subId))
        : [...prev, path]
      handleSave(next)
      return next
    })
  }

  const isLoading = preferencesLoading || taxonomyLoading

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white text-lg font-semibold">Music Genres</h3>
        <p className="text-gray-300 text-sm">
          Select the genres you listen to most. Choose a family, then pick main genre and optional sub-genre.
        </p>
      </div>

      {taxonomyError && (
        <div className="text-sm text-red-300">{taxonomyError}</div>
      )}

      {isLoading ? (
        <div className="text-gray-300 text-sm">Loading your genres...</div>
      ) : families.length === 0 ? (
        <div className="text-gray-400 text-sm">No genres available. Please try again later.</div>
      ) : (
        <div className="space-y-3">
          {families.map((family) => (
            <FamilySelectionRow
              key={family.id}
              family={family}
              selectedPaths={selectedPaths.filter((path) => path.familyId === family.id)}
              onSelectionChange={toggleSelection}
            />
          ))}
        </div>
      )}

      <div className="text-xs text-gray-300">
        Selected: {selectedPaths.length} genre{selectedPaths.length !== 1 ? 's' : ''}
        {saving && (
          <span className="text-gray-400 ml-2">Saving…</span>
        )}
      </div>
    </div>
  )
}

interface FamilySelectionRowProps {
  family: GenreFamily
  selectedPaths: SelectedGenrePath[]
  onSelectionChange: (path: SelectedGenrePath) => void
}

function FamilySelectionRow({ family, selectedPaths, onSelectionChange }: FamilySelectionRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white/10 rounded-lg border border-white/10">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-4 py-3 text-left text-white flex justify-between items-center"
      >
        <span className="font-medium">{family.name}</span>
        <span className="text-xs text-gray-300">{selectedPaths.length} selected</span>
      </button>
      {open && (
        <div className="bg-[#2c2140] px-4 py-3 space-y-3">
          {family.mainGenres.map((type) => (
            <TypeSelectionRow
              key={type.id}
              family={family}
              type={type}
              selectedPaths={selectedPaths.filter((path) => path.typeId === type.id)}
              onSelectionChange={onSelectionChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TypeSelectionRowProps {
  family: GenreFamily
  type: GenreType
  selectedPaths: SelectedGenrePath[]
  onSelectionChange: (path: SelectedGenrePath) => void
}

function TypeSelectionRow({ family, type, selectedPaths, onSelectionChange }: TypeSelectionRowProps) {
  const [open, setOpen] = useState(false)

  const isTypeSelected = selectedPaths.some((path) => !path.subId)

  const handleTypeToggle = () => {
    onSelectionChange({ familyId: family.id, typeId: type.id })
  }

  const handleSubToggle = (sub: GenreSubType) => {
    onSelectionChange({ familyId: family.id, typeId: type.id, subId: sub.id })
  }

  return (
    <div className="bg-white/5 rounded-lg border border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-2 gap-2">
        <button
          type="button"
          onClick={handleTypeToggle}
          className={`text-left text-sm font-medium px-3 py-2 rounded-md border transition-colors ${
            isTypeSelected
              ? 'bg-purple-600 text-white border-purple-500'
              : 'border-white/20 text-white hover:border-purple-400'
          }`}
        >
          {type.name}
        </button>
        {type.subGenres && type.subGenres.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="text-xs text-purple-200 hover:text-purple-100"
          >
            {open ? 'Hide sub-genres' : 'Select sub-genres'}
          </button>
        )}
      </div>

      {open && type.subGenres && (
        <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {type.subGenres.map((sub) => {
            const isSelected = selectedPaths.some((path) => path.subId === sub.id)
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSubToggle(sub)}
                className={`text-left text-xs px-3 py-2 rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-pink-500 text-white border-pink-400'
                    : 'border-white/10 text-gray-200 hover:border-pink-300 hover:text-white'
                }`}
              >
                {sub.name}
              </button>
            )
          })}
        </div>
      )}

      {selectedPaths.length > 0 && (
        <div className="px-3 pb-3 text-xs text-gray-300">
          Selected:
          <ul className="mt-1 space-y-1">
            {selectedPaths.map((path) => {
              const sub = type.subGenres?.find((s) => s.id === path.subId)
              return (
                <li key={`${path.typeId}-${path.subId ?? 'none'}`} className="text-gray-100">
                  {buildLabel(family, type, sub)}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
