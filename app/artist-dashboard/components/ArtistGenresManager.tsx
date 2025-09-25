'use client'

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { GENRE_FAMILIES, GenreFamily, GenreType, GenreSubType } from "../../../data/genres"
import { Plus, Trash2, Save } from "lucide-react"

interface ArtistGenrePath {
  familyId: string
  typeId: string
  subId?: string
}

function formatPathLabel(family: GenreFamily, type: GenreType, sub?: GenreSubType) {
  if (sub) return `${family.name} > ${type.name} > ${sub.name}`
  return `${family.name} > ${type.name}`
}

export function ArtistGenresManager() {
  const [selectedGenres, setSelectedGenres] = useState<ArtistGenrePath[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadGenres = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/artist-profile')
        const result = await response.json()
        if (result?.data?.preferred_genre_ids && Array.isArray(result.data.preferred_genre_ids)) {
          const paths: ArtistGenrePath[] = result.data.preferred_genre_ids
            .map((entry: string) => entry.split(':'))
            .filter((parts: string[]) => parts.length >= 2)
            .map((parts: string[]) => ({
              familyId: parts[0],
              typeId: parts[1],
              subId: parts[2]
            }))
          setSelectedGenres(paths)
        }
      } catch (error) {
        console.error('Error loading artist genres:', error)
      } finally {
        setLoading(false)
      }
    }
    loadGenres()
  }, [])

  const handleSave = async (paths: ArtistGenrePath[]) => {
    setSaving(true)
    try {
      const payload = paths.map((path) => path.subId ? `${path.familyId}:${path.typeId}:${path.subId}` : `${path.familyId}:${path.typeId}`)
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferred_genre_ids: payload })
      })
      const result = await response.json()
      if (result.error) {
        console.error('Failed to save artist genres', result.error)
      }
    } catch (error) {
      console.error('Error saving artist genres:', error)
    } finally {
      setSaving(false)
    }
  }

  const addGenre = (path: ArtistGenrePath) => {
    setSelectedGenres((prev) => {
      const exists = prev.some((item) => item.familyId === path.familyId && item.typeId === path.typeId && item.subId === path.subId)
      if (exists) return prev
      const next = [...prev, path]
      handleSave(next)
      return next
    })
  }

  const removeGenre = (index: number) => {
    setSelectedGenres((prev) => {
      const next = prev.filter((_, i) => i !== index)
      handleSave(next)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Artist Genres</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select the main genres and sub-genres that define your artistry. These choices power discovery, search, and matching across Gigrilla.
        </p>

        {loading ? (
          <div className="text-sm text-gray-500">Loading genres...</div>
        ) : (
          <div className="space-y-4">
            <GenreSelectionForm onSelect={addGenre} />

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Selected Genres</h3>
              {selectedGenres.length === 0 ? (
                <div className="text-sm text-gray-500">No genres selected yet.</div>
              ) : (
                <ul className="space-y-2">
                  {selectedGenres.map((path, index) => {
                    const family = GENRE_FAMILIES.find((f) => f.id === path.familyId)
                    const type = family?.types.find((t) => t.id === path.typeId)
                    const sub = type?.subs?.find((s) => s.id === path.subId)
                    if (!family || !type) return null
                    return (
                      <li key={`${path.familyId}-${path.typeId}-${path.subId ?? 'none'}`} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                        <div className="text-sm text-gray-800">
                          {formatPathLabel(family, type, sub)}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeGenre(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => handleSave(selectedGenres)} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          Save Genres
        </Button>
        {saving && <span className="text-sm text-gray-500">Saving…</span>}
      </div>
    </div>
  )
}

interface GenreSelectionFormProps {
  onSelect: (path: ArtistGenrePath) => void
}

function GenreSelectionForm({ onSelect }: GenreSelectionFormProps) {
  const [familyId, setFamilyId] = useState<string>('')
  const [typeId, setTypeId] = useState<string>('')
  const [subId, setSubId] = useState<string>('')

  const reset = () => {
    setFamilyId('')
    setTypeId('')
    setSubId('')
  }

  const selectedFamily = GENRE_FAMILIES.find((family) => family.id === familyId)
  const selectedType = selectedFamily?.types.find((type) => type.id === typeId)

  const handleAdd = () => {
    if (!selectedFamily || !selectedType) return
    onSelect({ familyId: selectedFamily.id, typeId: selectedType.id, subId: subId || undefined })
    reset()
  }

  return (
    <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Genre Family</label>
          <select
            value={familyId}
            onChange={(event) => {
              setFamilyId(event.target.value)
              setTypeId('')
              setSubId('')
            }}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select a family…</option>
            {GENRE_FAMILIES.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Main Genre</label>
          <select
            value={typeId}
            onChange={(event) => {
              setTypeId(event.target.value)
              setSubId('')
            }}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            disabled={!selectedFamily}
          >
            <option value="">Select a main genre…</option>
            {selectedFamily?.types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Sub-Genre (optional)</label>
          <select
            value={subId}
            onChange={(event) => setSubId(event.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            disabled={!selectedType || !selectedType.subs?.length}
          >
            <option value="">Select a sub-genre…</option>
            {selectedType?.subs?.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleAdd} disabled={!selectedFamily || !selectedType}>
          <Plus className="w-4 h-4 mr-2" />
          Add Genre
        </Button>
      </div>
    </div>
  )
}
