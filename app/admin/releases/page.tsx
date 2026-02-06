'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    FileCheck, Clock, User, Music, ChevronRight, CheckCircle, XCircle
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

interface PendingRelease {
    id: string
    release_title: string
    status: string
    submitted_at: string
    artist_profiles?: {
        stage_name: string
    }
}

interface PlatformSettingsResponse {
    success: boolean
    settings?: {
        approval_mode?: {
            mode?: 'auto' | 'manual'
        }
    }
}

export default function PendingReleasesPage() {
    const router = useRouter()
    const [releases, setReleases] = useState<PendingRelease[]>([])
    const [loading, setLoading] = useState(true)
    const [approvalMode, setApprovalMode] = useState<'auto' | 'manual'>('auto')

    useEffect(() => {
        fetchPendingReleases()
    }, [])

    const fetchPendingReleases = async () => {
        try {
            setLoading(true)
            const [pendingResponse, settingsResponse] = await Promise.all([
                fetch('/api/admin/releases/pending'),
                fetch('/api/admin/settings')
            ])

            const pendingData = await pendingResponse.json()
            const settingsData: PlatformSettingsResponse = await settingsResponse.json()

            if (pendingData.success) {
                setReleases(pendingData.data || [])
            }

            const mode = settingsData?.settings?.approval_mode?.mode
            if (mode === 'auto' || mode === 'manual') {
                setApprovalMode(mode)
            }
        } catch (error) {
            console.error('Failed to fetch pending releases:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString?: string) => {
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
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <FileCheck className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
                            <p className="mt-1 text-gray-500">Review and approve new release submissions</p>
                        </div>
                        <Badge
                            variant="outline"
                            className={approvalMode === 'manual'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }
                        >
                            {approvalMode === 'manual' ? 'Manual Review Mode' : 'Auto Publish Mode'}
                        </Badge>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/admin/releases/published-recent')}
                            className="ml-auto"
                        >
                            <Music className="w-4 h-4 mr-2" />
                            Recently Published
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading pending releases...</p>
                    </div>
                ) : releases.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                        <p className="text-gray-500 mt-2">
                            {approvalMode === 'manual'
                                ? 'There are no pending releases to review right now.'
                                : 'Auto publish is enabled, so new submissions are published instead of queued here.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {releases.map((release) => (
                            <Card
                                key={release.id}
                                className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500"
                                onClick={() => router.push(`/admin/releases/${release.id}`)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{release.release_title}</h3>
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    Pending Review
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {release.artist_profiles?.stage_name || 'Unknown Artist'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    Submitted {formatDate(release.submitted_at)}
                                                </div>
                                            </div>
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
