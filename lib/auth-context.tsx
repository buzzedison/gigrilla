"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  signUp: (email: string, password: string, firstName?: string, lastName?: string, memberType?: string) => Promise<{ error: string | null; needsEmailVerification?: boolean }>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Check session on mount
  const checkSession = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/session')
      const data = await response.json()

      if (response.ok && data.authenticated) {
        setUser(data.user)
        setSession(data.session)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch (error) {
      console.error('AuthContext: Error checking session:', error)
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update user and session immediately without loading state delay
        setUser(data.user)
        setSession(data.session)
        setLoading(false)
        return { error: null }
      } else {
        setLoading(false)
        return { error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('AuthContext: Sign in error:', error)
      setLoading(false)
      return { error: 'Network error' }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        setUser(null)
        setSession(null)
        return { error: null }
      } else {
        const data = await response.json()
        return { error: data.error || 'Logout failed' }
      }
    } catch (error) {
      console.error('AuthContext: Sign out error:', error)
      return { error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, memberType?: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, memberType }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.needsEmailVerification) {
          return { error: null, needsEmailVerification: true }
        } else {
          setUser(data.user)
          setSession(data.session)
          return { error: null }
        }
      } else {
        return { error: data.error || 'Signup failed' }
      }
    } catch (error) {
      console.error('AuthContext: Sign up error:', error)
      return { error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
    checkSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}