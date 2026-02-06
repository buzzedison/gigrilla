'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard, Users, Settings, Music, Flag,
    Shield, ChevronLeft, ChevronRight, LogOut, Ban,
    FileCheck, BarChart3, Bell
} from 'lucide-react'

interface AdminLayoutProps {
    children: ReactNode
}

const sidebarItems = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        exact: true
    },
    {
        name: 'Pending Releases',
        href: '/admin/releases',
        icon: FileCheck
    },
    {
        name: 'Published Recent',
        href: '/admin/releases/published-recent',
        icon: Music
    },
    {
        name: 'Flagged Content',
        href: '/admin/flagged',
        icon: Flag
    },
    {
        name: 'Users & Permissions',
        href: '/admin/users',
        icon: Users
    },
    {
        name: 'Banned Users',
        href: '/admin/bans',
        icon: Ban
    },
    {
        name: 'Moderators',
        href: '/admin/moderators',
        icon: Shield
    },
    {
        name: 'Platform Settings',
        href: '/admin/settings',
        icon: Settings
    },
    {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3
    },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)

    const isActive = (item: typeof sidebarItems[0]) => {
        if (item.href === '/admin/releases' && pathname.startsWith('/admin/releases/published-recent')) {
            return false
        }

        if (item.exact) {
            return pathname === item.href
        }
        return pathname.startsWith(item.href)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`${collapsed ? 'w-20' : 'w-64'
                    } bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col transition-all duration-300 fixed h-full z-40`}
            >
                {/* Logo/Header */}
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        {!collapsed && (
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Gigrilla Admin
                                </h1>
                                <p className="text-xs text-slate-400 mt-1">Super Admin Panel</p>
                            </div>
                        )}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            {collapsed ? (
                                <ChevronRight className="w-5 h-5" />
                            ) : (
                                <ChevronLeft className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${active
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                    }`}
                                title={collapsed ? item.name : undefined}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : ''}`} />
                                {!collapsed && (
                                    <span className="font-medium">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={() => router.push('/')}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all w-full ${collapsed ? 'justify-center' : ''
                            }`}
                        title={collapsed ? 'Exit Admin' : undefined}
                    >
                        <LogOut className="w-5 h-5" />
                        {!collapsed && <span className="font-medium">Exit Admin</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
                {children}
            </main>
        </div>
    )
}
