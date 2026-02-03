'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Flag, AlertTriangle, Eye, CheckCircle, XCircle,
    Calendar, User, Music, ShieldAlert
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'

interface FlaggedRelease {
    id: string
    release_title: string
    user_id: string
    status: string
    submitted_at: string
    flagged_for_review: boolean
    is_offensive: boolean
    moderation_notes?: string
    flagged_at?: string
    artist_profiles?: {
        stage_name: string
    }
}

export default function FlaggedContentPage() {
    const router = useRouter()
    const [releases, setReleases] = useState<FlaggedRelease[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFlaggedContent()
    }, [])

    const fetchFlaggedContent = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/releases/flagged')
            const data = await response.json()
            if (data.success) {
                setReleases(data.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch flagged content:', error)
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading flagged content...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Flag className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Flagged Content</h1>
                            <p className="mt-1 text-gray-500">Review content requiring moderation attention</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {releases.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
                        <p className="text-gray-500 mt-2">No content currently flagged for review.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {releases.map((release) => (
                            <Card key={release.id} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        {/* Release Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{release.release_title}</h3>
                                                {release.is_offensive && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                                                        <ShieldAlert className="w-3 h-3" />
                                                        Offensive
                                                    </span>
                                                )}
                                                {release.flagged_for_review && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                                                        <Flag className="w-3 h-3" />
                                                        Flagged
                                                    </span>
                                                )}
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    {release.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {release.artist_profiles?.stage_name || 'Unknown Artist'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Submitted: {formatDate(release.submitted_at)}
                                                </div>
                                                {release.flagged_at && (
                                                    <div className="flex items-center gap-1 text-orange-600">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        Flagged: {formatDate(release.flagged_at)}
                                                    </div>
                                                )}
                                            </div>

                                            {release.moderation_notes && (
                                                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                                                    <span className="font-medium text-gray-700">Moderator Notes:</span>
                                                    <p className="text-gray-600 mt-1">{release.moderation_notes}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={() => router.push(`/admin/releases/${release.id}`)}
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Review Content
                                            </Button>
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
