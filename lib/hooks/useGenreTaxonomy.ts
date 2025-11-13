'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { GenreFamily } from '../../types/genres'

interface ApiResponse {
  data?: {
    families?: GenreFamily[]
  }
  error?: string
  details?: string
}

interface UseGenreTaxonomyResult {
  families: GenreFamily[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useGenreTaxonomy(): UseGenreTaxonomyResult {
  const [families, setFamilies] = useState<GenreFamily[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchTaxonomy = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/genres', {
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }

      const payload = (await response.json()) as ApiResponse
      const nextFamilies = payload.data?.families ?? []

      setFamilies(nextFamilies)
      if (nextFamilies.length === 0) {
        setError('No genre taxonomy records found in the database.')
      }
    } catch (caught) {
      if ((caught as Error).name === 'AbortError') return
      console.error('[useGenreTaxonomy] Failed to load taxonomy', caught)
      setError(caught instanceof Error ? caught.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTaxonomy()
    return () => abortRef.current?.abort()
  }, [fetchTaxonomy])

  return {
    families,
    loading,
    error,
    refresh: fetchTaxonomy
  }
}
