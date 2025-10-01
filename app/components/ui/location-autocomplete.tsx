'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'

import { Input } from './input'
import { cn } from './utils'

export interface LocationSuggestion {
  id: string
  formatted: string
  city?: string
  state?: string
  country?: string
  lat?: number
  lon?: number
}

interface LocationAutocompleteProps {
  value: string
  onSelect: (suggestion: LocationSuggestion) => void
  onInputChange?: (value: string) => void
  placeholder?: string
  minQueryLength?: number
  disabled?: boolean
  className?: string
  inputClassName?: string
  noResultsMessage?: string
  searchingMessage?: string
}

const DEFAULT_MIN_QUERY_LENGTH = 2
const FETCH_DEBOUNCE_MS = 250

export function LocationAutocompleteInput({
  value,
  onSelect,
  onInputChange,
  placeholder = 'Search locations…',
  minQueryLength = DEFAULT_MIN_QUERY_LENGTH,
  disabled,
  className,
  inputClassName,
  noResultsMessage = 'No matching locations found.',
  searchingMessage = 'Searching…'
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [debouncedValue, setDebouncedValue] = useState(value)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const fetchIdRef = useRef(0)
  const cacheRef = useRef<Map<string, LocationSuggestion[]>>(new Map())

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (inputValue === debouncedValue) return
    const handler = window.setTimeout(() => {
      setDebouncedValue(inputValue)
    }, FETCH_DEBOUNCE_MS)

    return () => window.clearTimeout(handler)
  }, [inputValue, debouncedValue])

  useEffect(() => {
    const query = debouncedValue.trim()

    if (query.length < minQueryLength) {
      setSuggestions([])
      setLoading(false)
      setError(null)
      return
    }

    const cached = cacheRef.current.get(query.toLowerCase())
    if (cached) {
      setSuggestions(cached)
      setLoading(false)
      setError(null)
      return
    }

    const abortController = new AbortController()
    const timeoutId = window.setTimeout(() => abortController.abort(), 8000)
    const fetchId = ++fetchIdRef.current

    setLoading(true)
    setError(null)

    fetch(`/api/location-search?query=${encodeURIComponent(query)}`, {
      signal: abortController.signal,
      headers: {
        Accept: 'application/json'
      },
      cache: 'no-store'
    })
      .then(async (response) => {
        if (!response.ok) {
          const bodyText = await response.text()
          throw new Error(bodyText || 'Request failed')
        }
        return response.json() as Promise<{ suggestions?: LocationSuggestion[]; error?: string }>
      })
      .then((data) => {
        if (fetchId !== fetchIdRef.current) return

        if (data.error) {
          setError(data.error)
          setSuggestions([])
          return
        }

        const items = (data.suggestions ?? []).map((item, index) => ({
          ...item,
          id: item.id || `${query.toLowerCase()}-${index}`
        }))

        cacheRef.current.set(query.toLowerCase(), items)
        setSuggestions(items)
      })
      .catch((fetchError) => {
        if (abortController.signal.aborted) return
        console.error('Location autocomplete fetch error', fetchError)
        setError('Unable to retrieve location suggestions right now.')
        setSuggestions([])
      })
      .finally(() => {
        if (fetchId === fetchIdRef.current) {
          setLoading(false)
        }
        window.clearTimeout(timeoutId)
      })

    return () => {
      abortController.abort()
      window.clearTimeout(timeoutId)
    }
  }, [debouncedValue, minQueryLength])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return
      if (containerRef.current.contains(event.target as Node)) return
      setOpen(false)
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const showDropdown = open && !disabled && (loading || suggestions.length > 0 || error)

  const handleInputChangeInternal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setInputValue(nextValue)
    onInputChange?.(nextValue)
    if (!open) setOpen(true)
  }

  const handleSelect = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.formatted)
    onInputChange?.(suggestion.formatted)
    setSuggestions([])
    setOpen(false)
    onSelect(suggestion)
  }

  const handleFocus = () => {
    if (disabled) return
    setOpen(true)
  }

  const handleBlur = () => {
    // Delay closing to allow click handlers to run
    window.setTimeout(() => {
      setOpen(false)
    }, 100)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        value={inputValue}
        onChange={handleInputChangeInternal}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={inputClassName}
      />

      {showDropdown && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-slate-900">
      {loading && (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          {searchingMessage}
        </div>
      )}

      {!loading && error && (
        <div className="px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
          {noResultsMessage}
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <ul className="max-h-64 divide-y divide-gray-100 overflow-auto dark:divide-gray-800">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-100 focus:outline-none dark:hover:bg-slate-800"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(suggestion)}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                <span className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{suggestion.formatted}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {[suggestion.city, suggestion.state, suggestion.country]
                      .filter(Boolean)
                      .map((part) => part?.toString().trim())
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
        </div>
      )}
    </div>
  )
}

export type { LocationAutocompleteProps }

