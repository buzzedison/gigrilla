"use client"

import { useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { ProtectedRoute } from '../../lib/protected-route'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    
    // Immediately redirect all logged-in users to fan dashboard
    console.log('Dashboard: Redirecting logged-in user to fan-dashboard')
    router.replace('/fan-dashboard')
  }, [user, router])

  // Show minimal loading state while redirecting
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
