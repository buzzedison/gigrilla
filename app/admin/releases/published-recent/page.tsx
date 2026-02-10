'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Clock, User, ChevronRight, CheckCircle, XCircle, FileCheck } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'

interface PublishedRelease {
  id: string
  release_title: string
  status: string
  track_count?: number
  submitted_at: string | null
  published_at: string | null
  created_at: string
  identifier_summary?: {
    total_tracks: number
    tracks_with_isrc: number
    tracks_with_iswc: number
    confirmed_isrc: number
    confirmed_iswc: number
  }
  artist_profiles?: {
    stage_name?: string
  }
}

export default function PublishedRecentReleasesPage() {
  const router = useRouter()
  const [releases, setReleases] = useState<PublishedRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPublishedReleases()
  }, [])

  const fetchPublishedReleases = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/releases/published-recent')
      const data = await response.json()

      if (response.status === 403) {
        router.push('/')
        return
      }

      if (data.success) {
        setReleases(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch recently published releases')
      }
    } catch (fetchError) {
      console.error('Failed to fetch recently published releases:', fetchError)
      setError('Failed to fetch recently published releases')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Music className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recently Published</h1>
              <p className="mt-1 text-gray-500">Quick review list of latest published releases</p>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-auto">
              Published
            </Badge>
            <Button variant="outline" onClick={() => router.push('/admin/releases')}>
              <FileCheck className="w-4 h-4 mr-2" />
              Pending Queue
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recently published releases...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Unable to load releases</h3>
            <p className="text-gray-500 mt-2">{error}</p>
            <Button className="mt-4" onClick={fetchPublishedReleases}>Retry</Button>
          </div>
        ) : releases.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Published Releases Yet</h3>
            <p className="text-gray-500 mt-2">Recently published releases will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {releases.map((release) => (
              <Card
                key={release.id}
                className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-emerald-500"
                onClick={() => router.push(`/admin/releases/${release.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{release.release_title}</h3>
                        <Badge
                          variant="outline"
                          className={release.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'}
                        >
                          {release.status === 'published' ? 'Published' : 'Approved'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {release.artist_profiles?.stage_name || 'Unknown Artist'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Published {formatDate(release.published_at || release.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Submitted {formatDate(release.submitted_at || release.created_at)}
                        </div>
                      </div>
                      {release.identifier_summary && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                            ISRC {release.identifier_summary.tracks_with_isrc}/{release.identifier_summary.total_tracks}
                            {release.identifier_summary.confirmed_isrc > 0 ? ` (${release.identifier_summary.confirmed_isrc} confirmed)` : ''}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                            ISWC {release.identifier_summary.tracks_with_iswc}/{release.identifier_summary.total_tracks}
                            {release.identifier_summary.confirmed_iswc > 0 ? ` (${release.identifier_summary.confirmed_iswc} confirmed)` : ''}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-gray-400">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
