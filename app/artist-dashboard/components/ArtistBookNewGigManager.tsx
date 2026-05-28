"use client"

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Building2, CalendarPlus, Check, ChevronsUpDown, Loader2, MapPin, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command'
import { cn } from '../../components/ui/utils'

interface VenueSuggestion {
  id: string
  name: string
  address: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  contactName?: string
  contactEmail?: string
  contactPhoneCode?: string
  contactPhone?: string
}

interface ArtistBookNewGigManagerProps {
  onBookVenue: (venue: VenueSuggestion) => void
  onAddManualGig: () => void
}

export const BOOK_NEW_GIG_STORAGE_KEY = 'gigrilla-book-new-gig-venue'

export function ArtistBookNewGigManager({ onBookVenue, onAddManualGig }: ArtistBookNewGigManagerProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<VenueSuggestion[]>([])
  const [countryFilter, setCountryFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [countryFilterOpen, setCountryFilterOpen] = useState(false)
  const [cityFilterOpen, setCityFilterOpen] = useState(false)

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    const abortController = new AbortController()
    const timeout = window.setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/venues/search?query=${encodeURIComponent(trimmedQuery)}&limit=20`, {
          cache: 'no-store',
          signal: abortController.signal,
          headers: { Accept: 'application/json' }
        })

        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to search venues right now.')
        }

        const suggestions = Array.isArray(payload?.suggestions) ? payload.suggestions as VenueSuggestion[] : []
        setResults(suggestions)
      } catch (searchError) {
        if (abortController.signal.aborted) return
        setResults([])
        setError(searchError instanceof Error ? searchError.message : 'Unable to search venues right now.')
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }, 250)

    return () => {
      abortController.abort()
      window.clearTimeout(timeout)
    }
  }, [query])

  useEffect(() => {
    setCountryFilter('all')
    setCityFilter('all')
  }, [query])

  const countryOptions = useMemo(() => {
    return Array.from(
      new Set(
        results
          .map((venue) => venue.country?.trim())
          .filter((country): country is string => Boolean(country))
      )
    ).sort((a, b) => a.localeCompare(b))
  }, [results])

  const cityOptions = useMemo(() => {
    return Array.from(
      new Set(
        results
          .filter((venue) => countryFilter === 'all' || venue.country === countryFilter)
          .map((venue) => venue.city?.trim())
          .filter((city): city is string => Boolean(city))
      )
    ).sort((a, b) => a.localeCompare(b))
  }, [results, countryFilter])

  const filteredResults = useMemo(() => {
    return results.filter((venue) => {
      const countryMatches = countryFilter === 'all' || venue.country === countryFilter
      const cityMatches = cityFilter === 'all' || venue.city === cityFilter
      return countryMatches && cityMatches
    })
  }, [results, countryFilter, cityFilter])

  const useVenueForBooking = (venue: VenueSuggestion) => {
    window.sessionStorage.setItem(BOOK_NEW_GIG_STORAGE_KEY, JSON.stringify(venue))
    onBookVenue(venue)
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92)_0%,_rgba(250,243,252,0.95)_100%)] shadow-[0_24px_60px_rgba(12,6,20,0.28)]">
        <CardHeader className="relative gap-5 lg:min-h-[148px] lg:pr-64">
          <div className="space-y-3">
            <CardTitle className="flex items-center gap-3 text-3xl text-slate-900">
              <CalendarPlus className="h-8 w-8 text-[#b33b86]" />
              Book a New Gig
            </CardTitle>
            <p className="max-w-3xl text-base text-slate-600">
              Gigrilla Booking System - Venue Gigs & Other Member Gigs. Search verified venues, narrow the list with filters,
              then carry your selected venue straight into the gig booking form.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="self-start border-slate-300 bg-white text-slate-700 hover:bg-slate-50 lg:absolute lg:right-6 lg:top-6"
            onClick={onAddManualGig}
          >
            Add Gig Manually
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white/90 shadow-[0_18px_44px_rgba(16,185,129,0.16)]">
            <div className="h-2 bg-[#16a34a]" />
            <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-[minmax(0,1fr)_220px_220px] lg:items-end">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Search Venues
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by venue name"
                    className="border-emerald-200 bg-white pl-10 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Country
                </label>
                <Popover open={countryFilterOpen} onOpenChange={setCountryFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryFilterOpen}
                      className="w-full justify-between border-emerald-200 bg-white text-slate-900 hover:bg-white"
                    >
                      <span className="truncate">
                        {countryFilter === 'all' ? 'All countries' : countryFilter}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-emerald-600" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search countries..." />
                      <CommandList>
                        <CommandEmpty>No countries found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="All countries"
                            onSelect={() => {
                              setCountryFilter('all')
                              setCountryFilterOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                countryFilter === 'all' ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            All countries
                          </CommandItem>
                          {countryOptions.map((country) => (
                            <CommandItem
                              key={country}
                              value={country}
                              onSelect={() => {
                                setCountryFilter(country)
                                setCountryFilterOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  countryFilter === country ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {country}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  City
                </label>
                <Popover open={cityFilterOpen} onOpenChange={setCityFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={cityFilterOpen}
                      className="w-full justify-between border-emerald-200 bg-white text-slate-900 hover:bg-white"
                    >
                      <span className="truncate">
                        {cityFilter === 'all' ? 'All cities' : cityFilter}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-emerald-600" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search cities..." />
                      <CommandList>
                        <CommandEmpty>No cities found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="All cities"
                            onSelect={() => {
                              setCityFilter('all')
                              setCityFilterOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                cityFilter === 'all' ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            All cities
                          </CommandItem>
                          {cityOptions.map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={() => {
                                setCityFilter(city)
                                setCityFilterOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  cityFilter === city ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {city}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Verified venues</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{results.length}</p>
              <p className="mt-1 text-sm text-slate-600">Live search only returns verified, active venue profiles.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Filtered results</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{filteredResults.length}</p>
              <p className="mt-1 text-sm text-slate-600">Country and city filters apply on top of your venue-name search.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Next step</p>
              <p className="mt-2 text-lg font-bold text-slate-900">Prefill booking form</p>
              <p className="mt-1 text-sm text-slate-600">Choose a venue card below to carry its details into your gig setup form.</p>
            </div>
          </div>

          {query.trim().length < 2 && (
            <div className="rounded-2xl border border-dashed border-white/30 bg-white/50 px-6 py-10 text-center text-slate-600">
              Start typing at least 2 characters to search verified venues on Gigrilla.
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-slate-600">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-emerald-600" />
              Searching venues...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && query.trim().length >= 2 && filteredResults.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-slate-600">
              No venues match the current search and filters.
            </div>
          )}

          {!loading && !error && filteredResults.length > 0 && (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredResults.map((venue) => (
                <div
                  key={venue.id}
                  className="rounded-3xl border border-white/50 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95)_0%,_rgba(248,240,250,0.95)_100%)] p-5 shadow-[0_16px_40px_rgba(15,8,20,0.12)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8c5f86]">Verified venue</p>
                      <h3 className="mt-2 text-xl font-bold text-slate-900">{venue.name}</h3>
                    </div>
                    <div className="rounded-full bg-[#f5e6ef] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9f3c79]">
                      Gigrilla
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                      <div>
                        <div>{venue.address || 'Address not yet published'}</div>
                        {(venue.city || venue.country) && (
                          <div className="text-slate-500">{[venue.city, venue.country].filter(Boolean).join(', ')}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                      <div className="text-slate-500">
                        {venue.contactName || venue.contactEmail || venue.contactPhone
                          ? [venue.contactName, venue.contactEmail, [venue.contactPhoneCode, venue.contactPhone].filter(Boolean).join(' ')].filter(Boolean).join(' • ')
                          : 'Public contact details not shown yet'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      className="bg-[#16a34a] text-white hover:bg-[#15803d]"
                      onClick={() => useVenueForBooking(venue)}
                    >
                      Use This Venue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-300 bg-white"
                      onClick={onAddManualGig}
                    >
                      Skip and Add Manually
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
