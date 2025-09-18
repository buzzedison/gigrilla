'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface PasswordProtectionProps {
  children: React.ReactNode
}

export default function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Check if we're in development or if password protection is disabled
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development'
    const isPasswordProtected = process.env.NEXT_PUBLIC_PASSWORD_PROTECT === 'true'
    
    if (isDev || !isPasswordProtected) {
      setIsAuthenticated(true)
      setLoading(false)
      return
    }

    // Check if user is already authenticated (stored in sessionStorage)
    const stored = sessionStorage.getItem('staging_authenticated')
    if (stored === 'true') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const correctPassword = process.env.NEXT_PUBLIC_STAGING_PASSWORD
    
    if (password === correctPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('staging_authenticated', 'true')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-900">
              Gigrilla Staging
            </CardTitle>
            <CardDescription>
              This is a development version. Please enter the password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full">
                Access Staging
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
