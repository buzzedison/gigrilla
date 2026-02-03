'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle, XCircle, Clock, Eye, Music, Flag,
  Shield, AlertTriangle, Settings, ToggleLeft, ToggleRight,
  Users, Ban
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

interface DashboardStats {
  pending_count: number
  approved_this_week: number
  rejected_this_week: number
  published_count: number
  flagged_count?: number
  offensive_count?: number
  banned_users_count?: number
  total_releases?: number
  total_tracks?: number
}

interface PendingRelease {
  id: string
  release_title: string
  user_id: string
  status: string
  submitted_at: string
  created_at: string
  flagged_for_review?: boolean
  is_offensive?: boolean
  artist_profiles?: {
    stage_name: string
  }
}

interface PlatformSettings {
  approval_mode: {
    mode: 'auto' | 'manual'
    beta_phase: boolean
  }
  automated_verification_enabled: boolean
  moderation_settings: {
    auto_flag_explicit: boolean
    require_isrc: boolean
    require_iswc: boolean
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingReleases, setPendingReleases] = useState<PendingRelease[]>([])
  const [flaggedReleases, setFlaggedReleases] = useState<PendingRelease[]>([])
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch stats
      const statsRes = await fetch('/api/admin/stats')
      if (statsRes.status === 403) {
        router.push('/')
        return
      }

      const statsData = await statsRes.json()
      if (statsData.success) {
        setStats(statsData.stats)
      }

      // Fetch pending releases
      const releasesRes = await fetch('/api/admin/releases/pending')
      const releasesData = await releasesRes.json()
      if (releasesData.success) {
        setPendingReleases(releasesData.data)
      }

      // Fetch flagged releases
      const flaggedRes = await fetch('/api/admin/releases/flagged')
      const flaggedData = await flaggedRes.json()
      if (flaggedData.success) {
        setFlaggedReleases(flaggedData.data || [])
      }

      // Fetch platform settings
      const settingsRes = await fetch('/api/admin/settings')
      const settingsData = await settingsRes.json()
      if (settingsData.success) {
        setPlatformSettings(settingsData.settings)
      }
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleApprovalMode = async () => {
    if (!platformSettings) return

    setSavingSettings(true)
    try {
      const newMode = platformSettings.approval_mode.mode === 'auto' ? 'manual' : 'auto'
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_key: 'approval_mode',
          setting_value: {
            mode: newMode,
            beta_phase: platformSettings.approval_mode.beta_phase
          }
        })
      })

      if (response.ok) {
        setPlatformSettings(prev => prev ? {
          ...prev,
          approval_mode: { ...prev.approval_mode, mode: newMode }
        } : null)
      }
    } catch (err) {
      console.error('Failed to update approval mode:', err)
    } finally {
      setSavingSettings(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="mt-1 text-gray-500">Manage and review music releases</p>
            </div>
            {/* Approval Mode Toggle */}
            <div className="flex items-center gap-4">
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">Approval Mode</p>
                      <p className="text-xs text-gray-500">
                        {platformSettings?.approval_mode.mode === 'auto'
                          ? 'Auto-approve (Beta)'
                          : 'Manual Review Required'}
                      </p>
                    </div>
                    <button
                      onClick={toggleApprovalMode}
                      disabled={savingSettings}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${platformSettings?.approval_mode.mode === 'auto'
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${platformSettings?.approval_mode.mode === 'auto'
                            ? 'translate-x-7'
                            : 'translate-x-1'
                          }`}
                      />
                    </button>
                    <div className="text-left">
                      {platformSettings?.approval_mode.mode === 'auto' ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Review"
            value={stats?.pending_count || 0}
            icon={<Clock className="w-8 h-8 text-amber-600" />}
            color="amber"
          />
          <StatCard
            title="Approved This Week"
            value={stats?.approved_this_week || 0}
            icon={<CheckCircle className="w-8 h-8 text-green-600" />}
            color="green"
          />
          <StatCard
            title="Rejected This Week"
            value={stats?.rejected_this_week || 0}
            icon={<XCircle className="w-8 h-8 text-red-600" />}
            color="red"
          />
          <StatCard
            title="Published Releases"
            value={stats?.published_count || 0}
            icon={<Music className="w-8 h-8 text-purple-600" />}
            color="purple"
          />
        </div>

        {/* Moderation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flag className="w-5 h-5 text-orange-600" />
                Flagged Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{stats?.flagged_count || 0}</p>
              <p className="text-sm text-gray-500">Releases flagged for review</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Offensive Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats?.offensive_count || 0}</p>
              <p className="text-sm text-gray-500">Marked as inappropriate</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Ban className="w-5 h-5 text-slate-600" />
                Banned Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-600">{stats?.banned_users_count || 0}</p>
              <p className="text-sm text-gray-500">Currently banned accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Settings Card */}
        <Card className="mb-8 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Platform Moderation Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Auto-Flag Explicit Content</p>
                  <p className="text-sm text-gray-500">Automatically flag releases marked explicit</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${platformSettings?.moderation_settings?.auto_flag_explicit
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {platformSettings?.moderation_settings?.auto_flag_explicit ? 'ON' : 'OFF'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Require ISRC</p>
                  <p className="text-sm text-gray-500">ISRC code mandatory for tracks</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${platformSettings?.moderation_settings?.require_isrc
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {platformSettings?.moderation_settings?.require_isrc ? 'ON' : 'OFF'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Require ISWC</p>
                  <p className="text-sm text-gray-500">ISWC code mandatory for works</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${platformSettings?.moderation_settings?.require_iswc
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {platformSettings?.moderation_settings?.require_iswc ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flagged Releases Section */}
        {flaggedReleases.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8 border-2 border-orange-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Flagged Releases</h2>
              </div>
              <p className="text-sm text-gray-500">Content flagged by moderators requiring attention</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Release
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Flag Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {flaggedReleases.map((release) => (
                    <tr key={release.id} className="hover:bg-orange-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {release.release_title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {release.artist_profiles?.stage_name || 'Unknown Artist'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {release.flagged_for_review && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                              Flagged
                            </span>
                          )}
                          {release.is_offensive && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Offensive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => router.push(`/admin/releases/${release.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pending Releases Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pending Releases</h2>
            <p className="text-sm text-gray-500">Releases awaiting your review</p>
          </div>

          {pendingReleases.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pending releases</p>
              <p className="text-sm text-gray-400">All caught up!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Release
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingReleases.map((release) => (
                    <tr key={release.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {release.release_title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {release.artist_profiles?.stage_name || 'Unknown Artist'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(release.submitted_at || release.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                          {release.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => router.push(`/admin/releases/${release.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'amber' | 'green' | 'red' | 'purple'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    amber: 'bg-amber-50 border-amber-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200'
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="flex-shrink-0">{icon}</div>
      </div>
    </div>
  )
}
