"use client"

import { useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { ProtectedRoute } from '../../lib/protected-route'
import { Button } from '../components/ui/button'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    
    // Since database queries are timing out, just redirect all logged-in users to fan dashboard
    // This is the better UX - users can always navigate back if needed
    console.log('Dashboard: Redirecting logged-in user to fan-dashboard')
    router.replace('/fan-dashboard')
  }, [user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Loading state removed since we immediately redirect to fan-dashboard

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <img
                  src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
                  alt="Gigrilla Logo"
                  className="h-8 w-auto"
                />
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.user_metadata?.first_name || user?.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Gigrilla!</h2>
            <p className="text-gray-600 mb-6">
              Your music platform for artists, venues, services, and fans. DDEX-compliant metadata,
              gigs, and commerce in one place.
            </p>

            {/* Upgrade prompt removed since this page redirects to fan-dashboard */}

            {/* Industry profile prompt removed since this page redirects to fan-dashboard */}
            {false && (
              <div className="mb-6 rounded-lg border border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Ready for Industry Profiles?</h3>
                    <p className="text-sm text-blue-600">You&apos;re a Full Fan - time to go professional!</p>
                  </div>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Create Artist, Venue, or Service profiles to showcase your professional music industry presence.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    onClick={() => router.push('/upgrade?type=industry')}
                  >
                    Add Industry Profile
                  </Button>
                  <p className="text-xs text-blue-600">
                    🎵 Artist • 🎪 Venue • 🎛️ Service • Multiple profiles allowed
                  </p>
                </div>
              </div>
            )}

            {/* Fan Dashboard Link */}
            <div className="mb-6">
              <div 
                onClick={() => router.push('/fan-dashboard')}
                className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-dashed border-purple-300 rounded-lg p-6 cursor-pointer hover:from-purple-200 hover:to-pink-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 mb-1">
                      👑 Complete Your Fan Profile
                    </h3>
                    <p className="text-purple-700 text-sm">
                      Set up your detailed fan profile with genres, bio, location, and more
                    </p>
                  </div>
                  <div className="text-purple-600 text-2xl">→</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => router.push('/upgrade?type=industry&role=artist')}
                className="bg-purple-50 p-6 rounded-lg cursor-pointer hover:bg-purple-100 hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-purple-200 group"
              >
                <h3 className="text-lg font-semibold text-purple-900 mb-2 group-hover:text-purple-800">
                  🎵 Artists
                </h3>
                <p className="text-purple-700 mb-3 group-hover:text-purple-600">
                  Create and manage your music career
                </p>
                <div className="text-purple-600 text-sm font-medium group-hover:text-purple-800 flex items-center gap-1">
                  Add Artist Profile 
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
              
              <div 
                onClick={() => router.push('/upgrade?type=industry&role=venue')}
                className="bg-blue-50 p-6 rounded-lg cursor-pointer hover:bg-blue-100 hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-blue-200 group"
              >
                <h3 className="text-lg font-semibold text-blue-900 mb-2 group-hover:text-blue-800">
                  🎪 Venues
                </h3>
                <p className="text-blue-700 mb-3 group-hover:text-blue-600">
                  Book gigs and manage events
                </p>
                <div className="text-blue-600 text-sm font-medium group-hover:text-blue-800 flex items-center gap-1">
                  Add Venue Profile 
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
              
              <div 
                onClick={() => router.push('/upgrade?type=industry&role=specialist')}
                className="bg-green-50 p-6 rounded-lg cursor-pointer hover:bg-green-100 hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-green-200 group"
              >
                <h3 className="text-lg font-semibold text-green-900 mb-2 group-hover:text-green-800">
                  🎛️ Services
                </h3>
                <p className="text-green-700 mb-3 group-hover:text-green-600">
                  Connect with industry professionals
                </p>
                <div className="text-green-600 text-sm font-medium group-hover:text-green-800 flex items-center gap-1">
                  Add Service Profile 
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
