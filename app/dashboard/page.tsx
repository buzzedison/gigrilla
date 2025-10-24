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
    
    console.log('Dashboard: Redirecting logged-in user to control-panel')
    router.replace('/control-panel')
  }, [user, router])

  // Show minimal loading state while redirecting
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-slice-azure/40">
        <div className="text-center">
          <div className="mx-auto mb-4 h-2 w-2 animate-pulse rounded-full bg-primary"></div>
          <p className="text-foreground/70">Redirecting to your control panel...</p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
