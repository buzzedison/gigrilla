'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ArrowLeft, FileText, Music, Globe, Calendar, Shield, DollarSign, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/textarea'

interface Release {
  id: string
  release_title: string
  user_id: string
  upc: string | null
  ean: string | null
  release_type: string | null
  track_count: number
  status: string
  submitted_at: string
  created_at: string
  updated_at: string
  cover_artwork_url: string | null
  country_of_origin: string | null
  available_worldwide: boolean
  go_live_date: string | null
  master_rights_type: string | null
  publishing_rights_type: string | null
  distributor_name: string | null
  pro_name: string | null
  mcs_name: string | null
  artist_profiles?: {
    stage_name: string
    user_id: string
  }
}

interface ReleaseTrack {
  id: string
  track_number: number
  track_title: string | null
  isrc: string | null
  isrc_confirmed: boolean
  iswc: string | null
  iswc_confirmed: boolean
  updated_at: string
}

export default function ReleaseReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [release, setRelease] = useState<Release | null>(null)
  const [tracks, setTracks] = useState<ReleaseTrack[]>([])
  const [tracksLoading, setTracksLoading] = useState(false)
  const [tracksError, setTracksError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [action, setAction] = useState<'approve' | 'reject' | 'request_changes' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [changesRequested, setChangesRequested] = useState('')

  useEffect(() => {
    fetchRelease()
  }, [id])

  const fetchRelease = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/music-releases?id=${id}`)
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.status === 403) {
        router.push('/admin/releases')
        return
      }

      if (res.status === 404) {
        setError('Release not found')
        setTracks([])
        return
      }

      if (!res.ok) {
        setError(data?.error || 'Failed to load release')
        setTracks([])
        return
      }

      if (data?.data) {
        setRelease(data.data)
        setTracksLoading(true)
        setTracksError(null)
        try {
          const tracksResponse = await fetch(`/api/admin/releases/${id}/tracks`)
          const tracksPayload = await tracksResponse.json().catch(() => ({}))

          if (tracksResponse.ok && Array.isArray(tracksPayload?.data)) {
            setTracks(tracksPayload.data as ReleaseTrack[])
          } else {
            setTracks([])
            if (tracksPayload?.error) {
              setTracksError(tracksPayload.error)
            }
          }
        } catch (trackErr) {
          console.error('Failed to load release tracks:', trackErr)
          setTracks([])
          setTracksError('Failed to load track identifiers')
        } finally {
          setTracksLoading(false)
        }
      } else {
        setError('Release not found')
        setTracks([])
      }
    } catch (err) {
      setError('Failed to load release')
      setTracks([])
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!action) return

    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    if (action === 'request_changes' && !changesRequested.trim()) {
      alert('Please specify what changes are needed')
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch('/api/admin/releases/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseId: id,
          action,
          adminNotes: adminNotes.trim() || undefined,
          rejectionReason: rejectionReason.trim() || undefined,
          changesRequested: changesRequested.trim() || undefined
        })
      })

      const data = await res.json()

      if (data.success) {
        alert(`Release ${action}d successfully!`)
        router.push('/admin/releases')
      } else {
        alert(data.error || 'Failed to submit review')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading release...</p>
        </div>
      </div>
    )
  }

  if (error || !release) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Release not found'}</p>
          <Button onClick={() => router.push('/admin/releases')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/releases')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{release.release_title}</h1>
          <p className="mt-1 text-gray-500">
            by {release.artist_profiles?.stage_name || 'Unknown Artist'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Release Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Artwork */}
            {release.cover_artwork_url && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Cover Artwork
                </h2>
                <img
                  src={release.cover_artwork_url}
                  alt={release.release_title}
                  className="w-full max-w-md rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Release Registration */}
            <DetailSection
              title="Release Registration"
              icon={<FileText className="w-5 h-5" />}
              items={[
                { label: 'UPC', value: release.upc || 'N/A' },
                { label: 'EAN', value: release.ean || 'N/A' },
                { label: 'Release Title', value: release.release_title },
                { label: 'Release Type', value: release.release_type || 'N/A' },
                { label: 'Track Count', value: release.track_count.toString() }
              ]}
            />

            {/* Track ISRC/ISWC */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Music className="w-5 h-5" />
                Track Identifiers (ISRC / ISWC)
              </h2>

              {tracksLoading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading track identifiers...
                </div>
              ) : tracksError ? (
                <p className="text-sm text-red-600">{tracksError}</p>
              ) : tracks.length === 0 ? (
                <p className="text-sm text-gray-500">No track identifiers submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {tracks.map((track) => (
                    <div key={track.id} className="rounded-lg border border-gray-200 p-4">
                      <p className="font-medium text-gray-900 mb-2">
                        Track {track.track_number}: {track.track_title || 'Untitled Track'}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">ISRC</p>
                          <p className="font-mono text-gray-900">{track.isrc || 'N/A'}</p>
                          <p className={`text-xs mt-1 ${track.isrc_confirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {track.isrc_confirmed ? 'Confirmed' : 'Not confirmed'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">ISWC</p>
                          <p className="font-mono text-gray-900">{track.iswc || 'N/A'}</p>
                          <p className={`text-xs mt-1 ${track.iswc_confirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {track.iswc_confirmed ? 'Confirmed' : 'Not confirmed'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Geographical Availability */}
            <DetailSection
              title="Geographical Availability"
              icon={<Globe className="w-5 h-5" />}
              items={[
                { label: 'Country of Origin', value: release.country_of_origin || 'N/A' },
                { label: 'Worldwide', value: release.available_worldwide ? 'Yes' : 'No' }
              ]}
            />

            {/* Go-Live Date */}
            <DetailSection
              title="Go-Live Date"
              icon={<Calendar className="w-5 h-5" />}
              items={[
                { label: 'Scheduled Date', value: release.go_live_date ? new Date(release.go_live_date).toLocaleDateString() : 'ASAP' }
              ]}
            />

            {/* Rights */}
            <DetailSection
              title="Release Rights"
              icon={<Shield className="w-5 h-5" />}
              items={[
                { label: 'Master Rights', value: release.master_rights_type || 'N/A' },
                { label: 'Publishing Rights', value: release.publishing_rights_type || 'N/A' }
              ]}
            />

            {/* Royalties */}
            <DetailSection
              title="Royalty Collection"
              icon={<DollarSign className="w-5 h-5" />}
              items={[
                { label: 'Distributor', value: release.distributor_name || 'N/A' },
                { label: 'PRO', value: release.pro_name || 'N/A' },
                { label: 'MCS', value: release.mcs_name || 'N/A' }
              ]}
            />
          </div>

          {/* Sidebar - Review Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Release Status</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Current Status</label>
                  <p className="font-medium text-amber-600 capitalize">{release.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Submitted</label>
                  <p className="font-medium">{new Date(release.submitted_at || release.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Review Action Selector */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Review Action</h2>

              <div className="space-y-3 mb-4">
                <button
                  onClick={() => setAction('approve')}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    action === 'approve'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-6 h-6 ${action === 'approve' ? 'text-green-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Approve</p>
                      <p className="text-xs text-gray-500">Release is ready to go live</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setAction('reject')}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    action === 'reject'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <XCircle className={`w-6 h-6 ${action === 'reject' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Reject</p>
                      <p className="text-xs text-gray-500">Release has issues</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setAction('request_changes')}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    action === 'request_changes'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-6 h-6 ${action === 'request_changes' ? 'text-amber-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Request Changes</p>
                      <p className="text-xs text-gray-500">Send back for revisions</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Conditional Fields */}
              {action === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this release is being rejected..."
                    rows={4}
                  />
                </div>
              )}

              {action === 'request_changes' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Changes Requested <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={changesRequested}
                    onChange={(e) => setChangesRequested(e.target.value)}
                    placeholder="Specify what changes are needed..."
                    rows={4}
                  />
                </div>
              )}

              {/* Admin Notes (optional for all) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this review..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitReview}
                disabled={!action || submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Submit Review</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DetailSectionProps {
  title: string
  icon: React.ReactNode
  items: { label: string; value: string }[]
}

function DetailSection({ title, icon, items }: DetailSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <dl className="space-y-3">
        {items.map((item, index) => (
          <div key={index}>
            <dt className="text-sm text-gray-600">{item.label}</dt>
            <dd className="font-medium text-gray-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
