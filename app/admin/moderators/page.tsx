'use client'

import { useEffect, useState } from 'react'
import {
    Shield, Search, UserPlus, ShieldCheck, Mail, Calendar,
    Trash2, XCircle
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import { toast } from 'sonner'

interface Moderator {
    id: string
    user_id: string
    email: string
    full_name: string
    role: 'community_moderator' | 'admin' | 'super_admin'
    created_at: string
}

const roleLabels = {
    community_moderator: 'Moderator',
    admin: 'Admin',
    super_admin: 'Super Admin'
}

const roleColors = {
    community_moderator: 'bg-blue-100 text-blue-700',
    admin: 'bg-purple-100 text-purple-700',
    super_admin: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
}

export default function ModeratorsPage() {
    const [moderators, setModerators] = useState<Moderator[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [removingId, setRemovingId] = useState<string | null>(null)

    useEffect(() => {
        fetchModerators()
    }, [])

    const fetchModerators = async () => {
        try {
            setLoading(true)
            // Fetch users but we'll filter for role locally or via query param if supported
            // Reusing the general users endpoint but filtering results
            const response = await fetch('/api/admin/users?limit=100')
            const data = await response.json()
            if (data.success) {
                const mods = (data.users || []).filter((u: any) =>
                    ['community_moderator', 'admin', 'super_admin'].includes(u.role)
                )
                setModerators(mods)
            }
        } catch (error) {
            console.error('Failed to fetch moderators:', error)
            toast.error("Failed to load moderators")
        } finally {
            setLoading(false)
        }
    }

    const handleDemote = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this user from the moderation team? They will become a regular user.')) {
            return
        }

        setRemovingId(userId)
        try {
            const response = await fetch('/api/admin/users/role', {
                method: 'POST', // Using POST as implemented in users/route.ts (Wait, users/route.ts had a POST handler for role update? Or I need to create it?)
                // The file users/route.ts I viewed in Step 226 had a POST handler for role update!
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: 'user' })
            })

            const data = await response.json()
            if (response.ok) {
                setModerators(prev => prev.filter(mod => mod.user_id !== userId))
                toast.success("Team member removed", {
                    description: "User has been demoted to regular user status."
                })
            } else {
                toast.error("Error", {
                    description: data.error || "Failed to update user role"
                })
            }
        } catch (error) {
            console.error('Failed to demote user:', error)
            toast.error("Error", {
                description: "An unexpected error occurred"
            })
        } finally {
            setRemovingId(null)
        }
    }

    const filteredModerators = moderators.filter(mod =>
        mod.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <ShieldCheck className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Moderation Team</h1>
                                <p className="mt-1 text-gray-500">Manage admins and community moderators</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search team members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading team...</p>
                    </div>
                ) : filteredModerators.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Moderators Found</h3>
                        <p className="text-gray-500 mt-2">
                            {searchQuery ? 'No members matching your search.' : 'There are no other moderators or admins.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredModerators.map((mod) => (
                            <Card key={mod.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                                            {(mod.full_name || mod.email || '?')[0].toUpperCase()}
                                        </div>
                                        {mod.role !== 'super_admin' && (
                                            <button
                                                onClick={() => handleDemote(mod.user_id)}
                                                disabled={removingId === mod.user_id}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                                                title="Remove from team"
                                            >
                                                {removingId === mod.user_id ? (
                                                    <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                                                ) : (
                                                    <XCircle className="w-5 h-5" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{mod.full_name || 'Unknown User'}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                            <Mail className="w-3 h-3" />
                                            {mod.email}
                                        </div>

                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[mod.role]}`}>
                                            {roleLabels[mod.role]}
                                        </span>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Joined {new Date(mod.created_at).toLocaleDateString()}
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
