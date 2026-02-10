"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Save, Pencil, Trash2, Loader2 } from "lucide-react"

const BIO_MAX_LENGTH = 1000

export function ArtistBiographyManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [savedBio, setSavedBio] = useState("")
  const [bioDraft, setBioDraft] = useState("")
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    const loadBio = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/artist-profile')
        const result = await response.json()

        if (!response.ok || !result?.data) {
          setSavedBio("")
          setBioDraft("")
          return
        }

        const bio = typeof result.data.bio === 'string' ? result.data.bio : ""
        setSavedBio(bio)
        setBioDraft(bio)
        setIsEditing(!bio)
      } catch (error) {
        console.error('Error loading artist bio:', error)
        setFeedback({ type: 'error', message: 'Failed to load artist bio.' })
      } finally {
        setLoading(false)
      }
    }

    loadBio()
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(timer)
  }, [feedback])

  const hasSavedBio = savedBio.trim().length > 0
  const isOverLimit = bioDraft.length > BIO_MAX_LENGTH
  const remaining = BIO_MAX_LENGTH - bioDraft.length

  const handleSaveBio = async () => {
    if (isOverLimit) {
      setFeedback({ type: 'error', message: `Artist bio must be ${BIO_MAX_LENGTH} characters or fewer.` })
      return
    }

    setSaving(true)
    try {
      const nextBio = bioDraft.trim()
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bio: nextBio || null
        })
      })

      const result = await response.json()
      if (!response.ok || result?.error) {
        throw new Error(result?.error || 'Failed to save bio')
      }

      setSavedBio(nextBio)
      setBioDraft(nextBio)
      setIsEditing(false)
      setFeedback({ type: 'success', message: nextBio ? 'Artist bio saved.' : 'Artist bio cleared.' })
    } catch (error) {
      console.error('Error saving artist bio:', error)
      setFeedback({ type: 'error', message: 'Unable to save artist bio right now.' })
    } finally {
      setSaving(false)
    }
  }

  const handleEditBio = () => {
    setBioDraft(savedBio)
    setIsEditing(true)
  }

  const handleDeleteBio = async () => {
    setDeleting(true)
    try {
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bio: null })
      })

      const result = await response.json()
      if (!response.ok || result?.error) {
        throw new Error(result?.error || 'Failed to delete bio')
      }

      setSavedBio("")
      setBioDraft("")
      setIsEditing(true)
      setFeedback({ type: 'success', message: 'Artist bio deleted.' })
    } catch (error) {
      console.error('Error deleting artist bio:', error)
      setFeedback({ type: 'error', message: 'Unable to delete artist bio right now.' })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-sm text-gray-600 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
        Loading artist bio…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div id="artist-bio-editor" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 scroll-mt-28">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Artist Bio</h2>
          <p className="text-sm text-gray-600">
            Write about you, your history, your mission, and purpose.
          </p>
        </div>

        {feedback && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
          >
            {feedback.message}
          </div>
        )}

        <Textarea
          value={bioDraft}
          onChange={(e) => setBioDraft(e.target.value)}
          placeholder="Write your Artist Bio section…"
          className="min-h-[240px] text-base leading-relaxed resize-none"
          disabled={!isEditing || saving || deleting}
        />

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className={isOverLimit ? 'text-red-600 font-medium' : 'text-gray-600'}>
            {bioDraft.length} / {BIO_MAX_LENGTH}
          </span>
          <span className={remaining < 0 ? 'text-red-600' : 'text-gray-500'}>
            {remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over limit`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleSaveBio}
          disabled={saving || deleting || isOverLimit || (!isEditing && bioDraft === savedBio)}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving…' : 'Save Artist Bio'}
        </Button>

        {hasSavedBio && (
          <Button
            variant="outline"
            onClick={handleEditBio}
            disabled={saving || deleting}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Artist Bio
          </Button>
        )}

        {hasSavedBio && (
          <Button
            variant="outline"
            onClick={handleDeleteBio}
            disabled={saving || deleting}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? 'Deleting…' : 'Delete Artist Bio'}
          </Button>
        )}
      </div>
    </div>
  )
}
