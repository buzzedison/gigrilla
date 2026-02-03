'use client'

import { useEffect, useState } from 'react'
import {
    Users, Search, Shield, UserPlus, ChevronDown, Check, X,
    MoreVertical, Mail, Calendar, ShieldCheck, ShieldAlert, User
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

interface UserProfile {
    id: string
    user_id: string
    email: string
    full_name: string
    role: 'user' | 'community_moderator' | 'admin' | 'super_admin'
    created_at: string
    last_sign_in_at?: string
    is_banned?: boolean
}

const roleConfig = {
    user: { label: 'User', color: 'bg-gray-100 text-gray-700', icon: User },
    community_moderator: { label: 'Community Moderator', color: 'bg-blue-100 text-blue-700', icon: Shield },
    admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: ShieldCheck },
    super_admin: { label: 'Super Admin', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', icon: ShieldAlert }
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
    const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null)
    const [updatingRole, setUpdatingRole] = useState<string | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/users')
            const data = await response.json()
            if (data.success) {
                setUsers(data.users || [])
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateUserRole = async (userId: string, newRole: string) => {
        setUpdatingRole(userId)
        try {
            const response = await fetch('/api/admin/users/role', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            })

            if (response.ok) {
                setUsers(prev => prev.map(u =>
                    u.user_id === userId ? { ...u, role: newRole as UserProfile['role'] } : u
                ))
            }
        } catch (error) {
            console.error('Failed to update role:', error)
        } finally {
            setUpdatingRole(null)
            setShowRoleMenu(null)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Never'
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Users & Permissions</h1>
                            <p className="mt-1 text-gray-500">Manage user roles and access permissions</p>
                        </div>
                        <Button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Admin User
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                                </div>
                                <Users className="w-10 h-10 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Admins</p>
                                    <p className="text-3xl font-bold text-purple-900">
                                        {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
                                    </p>
                                </div>
                                <ShieldCheck className="w-10 h-10 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Moderators</p>
                                    <p className="text-3xl font-bold text-blue-900">
                                        {users.filter(u => u.role === 'community_moderator').length}
                                    </p>
                                </div>
                                <Shield className="w-10 h-10 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Regular Users</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {users.filter(u => u.role === 'user').length}
                                    </p>
                                </div>
                                <User className="w-10 h-10 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'super_admin', 'admin', 'community_moderator', 'user'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === role
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {role === 'all' ? 'All' : roleConfig[role as keyof typeof roleConfig]?.label || role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No users found</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Active
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => {
                                    const RoleIcon = roleConfig[user.role]?.icon || User

                                    return (
                                        <tr key={user.user_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                                        {(user.full_name || user.email || '?')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.full_name || 'No name'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowRoleMenu(showRoleMenu === user.user_id ? null : user.user_id)}
                                                        disabled={updatingRole === user.user_id}
                                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${roleConfig[user.role]?.color || 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        <RoleIcon className="w-4 h-4" />
                                                        {roleConfig[user.role]?.label || user.role}
                                                        <ChevronDown className="w-3 h-3" />
                                                    </button>

                                                    {showRoleMenu === user.user_id && (
                                                        <div className="absolute z-10 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                                            {Object.entries(roleConfig).map(([role, config]) => (
                                                                <button
                                                                    key={role}
                                                                    onClick={() => updateUserRole(user.user_id, role)}
                                                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 ${user.role === role ? 'bg-purple-50' : ''
                                                                        }`}
                                                                >
                                                                    <config.icon className="w-4 h-4" />
                                                                    <span>{config.label}</span>
                                                                    {user.role === role && <Check className="w-4 h-4 ml-auto text-purple-600" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(user.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                    <MoreVertical className="w-5 h-5 text-gray-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Admin Modal */}
            {showAddModal && (
                <AddAdminModal onClose={() => setShowAddModal(false)} onSuccess={fetchUsers} />
            )}
        </div>
    )
}

function AddAdminModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('admin')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/admin/users/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role })
            })

            const data = await response.json()

            if (response.ok) {
                onSuccess()
                onClose()
            } else {
                setError(data.error || 'Failed to add admin user')
            }
        } catch (err) {
            setError('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Add Admin User</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User Email
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            User must already have an account
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="community_moderator">Community Moderator</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
                            {loading ? 'Adding...' : 'Add User'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
