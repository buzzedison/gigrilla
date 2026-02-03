'use client'

import { useEffect, useState } from 'react'
import {
    Ban, Search, RefreshCw, UserX, AlertCircle, CheckCircle,
    Unlock, Calendar, Mail
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import { toast } from 'sonner'

interface BannedUser {
    id: string
    user_id: string
    email: string
    full_name: string
    is_banned: boolean
    ban_reason?: string
    banned_at?: string
}

export default function BannedUsersPage() {
    const [users, setUsers] = useState<BannedUser[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchBannedUsers()
    }, [])

    const fetchBannedUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/bans')
            const data = await response.json()
            if (data.success) {
                setUsers(data.users || [])
            }
        } catch (error) {
            console.error('Failed to fetch banned users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUnban = async (userId: string) => {
        if (!confirm('Are you sure you want to unban this user? They will regain access to the platform immediately.')) {
            return
        }

        setActionLoading(userId)
        try {
            const response = await fetch('/api/admin/bans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'unban' })
            })

            const data = await response.json()
            if (data.success) {
                setUsers(prev => prev.filter(u => u.user_id !== userId))
                toast.success("User Unbanned", {
                    description: "The user has been successfully unbanned."
                })
            } else {
                toast.error("Error", {
                    description: data.error || "Failed to unban user"
                })
            }
        } catch (error) {
            console.error('Failed to unban user:', error)
            toast.error("Error", {
                description: "An unexpected error occurred"
            })
        } finally {
            setActionLoading(null)
        }
    }

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Ban className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Banned Users</h1>
                            <p className="mt-1 text-gray-500">Manage users who have been restricted from the platform</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="max-w-md relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Search banned users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading banned users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Banned Users</h3>
                        <p className="text-gray-500 mt-2">
                            {searchQuery ? 'No users matching your search.' : 'There are currently no banned users.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredUsers.map((user) => (
                            <Card key={user.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                                    {(user.full_name || user.email || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{user.full_name || 'Unknown User'}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                                    <div>
                                                        <span className="text-sm font-semibold text-red-900">Ban Reason:</span>
                                                        <p className="text-sm text-red-800 mt-0.5">{user.ban_reason || 'No reason provided'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {user.banned_at && (
                                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                                    <Calendar className="w-3 h-3" />
                                                    Banned on {formatDate(user.banned_at)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center">
                                            <Button
                                                onClick={() => handleUnban(user.user_id)}
                                                disabled={actionLoading === user.user_id}
                                                variant="outline"
                                                className="w-full md:w-auto text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                            >
                                                <Unlock className="w-4 h-4 mr-2" />
                                                {actionLoading === user.user_id ? 'Unbanning...' : 'Revoke Ban'}
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
