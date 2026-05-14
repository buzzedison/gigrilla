'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CalendarDays, Clock3, MapPin, RefreshCw, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  createArtistUnavailability,
  deleteArtistUnavailability,
  fetchArtistGigView,
  fetchArtistUnavailability,
} from './gig-manager/api'
import { ArtistGigRecord, ArtistUnavailabilityRecord } from './gig-manager/types'
import { formatDateDDMMMyyyy, formatDateTimeDDMMMyyyy } from '@/lib/date-format'

interface ArtistGigPlannerManagerProps {
  defaultView?: 'calendar' | 'unavailability'
}

type PlannerDay = {
  date: Date
  key: string
  inMonth: boolean
  gigs: ArtistGigRecord[]
  blocks: ArtistUnavailabilityRecord[]
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(value: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return toDateKey(parsed)
}

function formatDate(value: string | null) {
  if (!value) return 'Date TBD'
  return formatDateTimeDDMMMyyyy(value, 'Date TBD')
}

function formatShortDate(date: Date) {
  return formatDateDDMMMyyyy(toDateKey(date), 'Date TBD')
}

function formatTime(value: string | null) {
  if (!value) return 'Time TBD'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Time TBD'
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

function getMonthRange(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const last = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - first.getDay())
  const gridEnd = new Date(last)
  gridEnd.setDate(last.getDate() + (6 - last.getDay()))

  return { first, last, gridStart, gridEnd }
}

function toDateTimeInput(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getDefaultStartInput() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  date.setHours(9, 0, 0, 0)
  return toDateTimeInput(date)
}

function getDefaultEndInput() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  date.setHours(18, 0, 0, 0)
  return toDateTimeInput(date)
}

export function ArtistGigPlannerManager({ defaultView = 'calendar' }: ArtistGigPlannerManagerProps) {
  const [activeView, setActiveView] = useState(defaultView)
  const [monthDate, setMonthDate] = useState(() => new Date())
  const [selectedDayKey, setSelectedDayKey] = useState(() => toDateKey(new Date()))
  const [selectedGig, setSelectedGig] = useState<ArtistGigRecord | null>(null)
  const [gigs, setGigs] = useState<ArtistGigRecord[]>([])
  const [blocks, setBlocks] = useState<ArtistUnavailabilityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actioningBlockId, setActioningBlockId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({
    startsAt: getDefaultStartInput(),
    endsAt: getDefaultEndInput(),
    reason: 'Unavailable',
    note: '',
  })

  useEffect(() => {
    setActiveView(defaultView)
  }, [defaultView])

  const load = useCallback(async (isRefresh = false) => {
    try {
      setError(null)
      setWarning(null)
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const { gridStart, gridEnd } = getMonthRange(monthDate)
      const [gigResponse, blockResponse] = await Promise.all([
        fetchArtistGigView('calendar', {
          dateFrom: gridStart.toISOString(),
          dateTo: gridEnd.toISOString(),
          limit: 200,
        }),
        fetchArtistUnavailability({
          dateFrom: gridStart.toISOString(),
          dateTo: gridEnd.toISOString(),
        }),
      ])

      setGigs(gigResponse.data || [])
      setBlocks(blockResponse.data || [])
      setWarning(gigResponse.warning || blockResponse.warning || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gig planner')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [monthDate])

  useEffect(() => {
    load()
  }, [load])

  const days = useMemo<PlannerDay[]>(() => {
    const { first, gridStart, gridEnd } = getMonthRange(monthDate)
    const result: PlannerDay[] = []
    const cursor = new Date(gridStart)

    while (cursor.getTime() <= gridEnd.getTime()) {
      const key = toDateKey(cursor)
      result.push({
        date: new Date(cursor),
        key,
        inMonth: cursor.getMonth() === first.getMonth(),
        gigs: gigs.filter((gig) => parseDateKey(gig.startDatetime) === key),
        blocks: blocks.filter((block) => {
          const start = parseDateKey(block.starts_at)
          const end = parseDateKey(block.ends_at)
          return Boolean(start && end && key >= start && key <= end)
        }),
      })
      cursor.setDate(cursor.getDate() + 1)
    }

    return result
  }, [blocks, gigs, monthDate])

  const selectedDay = days.find((day) => day.key === selectedDayKey) || days.find((day) => day.inMonth) || days[0]
  const monthLabel = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const handleSubmitBlock = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      await createArtistUnavailability({
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        reason: form.reason,
        note: form.note,
      })
      setSuccess('Unavailability saved.')
      await load(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save unavailability')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBlock = async (id: string) => {
    try {
      setActioningBlockId(id)
      setError(null)
      setSuccess(null)
      await deleteArtistUnavailability(id)
      setSuccess('Unavailability removed.')
      await load(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove unavailability')
    } finally {
      setActioningBlockId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-gray-500">Loading gig planner...</CardContent>
      </Card>
    )
  }

  return (
    <div id="artist-gig-planner-overview" className="space-y-6 scroll-mt-28">
      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-700" />
              Gig Planner
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Calendar view with clickable gigs and block-out unavailability.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={activeView === 'calendar' ? 'default' : 'outline'}
              onClick={() => setActiveView('calendar')}
            >
              View Calendar
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeView === 'unavailability' ? 'default' : 'outline'}
              onClick={() => setActiveView('unavailability')}
            >
              +Unavailability
            </Button>
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {warning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {warning}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {activeView === 'calendar' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Button variant="outline" size="sm" onClick={() => setMonthDate((prev) => addMonths(prev, -1))}>
                  Previous
                </Button>
                <h3 className="text-base font-semibold text-gray-900">{monthLabel}</h3>
                <Button variant="outline" size="sm" onClick={() => setMonthDate((prev) => addMonths(prev, 1))}>
                  Next
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="bg-gray-50 px-2 py-2 text-center font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {days.map((day) => {
                  const isSelected = day.key === selectedDay?.key
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => {
                        setSelectedDayKey(day.key)
                        setSelectedGig(null)
                      }}
                      className={`min-h-24 bg-white p-2 text-left transition hover:bg-purple-50 ${!day.inMonth ? 'text-gray-300' : 'text-gray-700'} ${isSelected ? 'ring-2 ring-inset ring-purple-500' : ''}`}
                    >
                      <span className="font-semibold">{day.date.getDate()}</span>
                      <div className="mt-2 space-y-1">
                        {day.gigs.slice(0, 2).map((gig) => (
                          <span key={gig.id} className="block truncate rounded bg-purple-100 px-1.5 py-0.5 text-[11px] text-purple-800">
                            {gig.gigTitle}
                          </span>
                        ))}
                        {day.blocks.length > 0 && (
                          <span className="block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {selectedDay && (
                <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{formatShortDate(selectedDay.date)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedDay.gigs.length === 0 && selectedDay.blocks.length === 0 ? (
                        <p className="text-sm text-gray-500">No gigs or unavailability on this day.</p>
                      ) : (
                        <>
                          {selectedDay.gigs.map((gig) => (
                            <button
                              key={gig.id}
                              type="button"
                              onClick={() => setSelectedGig(gig)}
                              className="w-full rounded-lg border border-gray-200 p-3 text-left transition hover:border-purple-300 hover:bg-purple-50/40"
                            >
                              <p className="font-semibold text-gray-900">{gig.gigTitle}</p>
                              <p className="text-sm text-gray-600">{gig.venueName}</p>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                <Badge variant={gig.bookingStatus === 'confirmed' ? 'default' : 'secondary'}>{gig.bookingStatus}</Badge>
                                <span>{formatTime(gig.startDatetime)}</span>
                              </div>
                            </button>
                          ))}
                          {selectedDay.blocks.map((block) => (
                            <div key={block.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                              <p className="font-semibold text-amber-900">{block.reason}</p>
                              <p className="text-xs text-amber-800">
                                {formatDate(block.starts_at)} to {formatDate(block.ends_at)}
                              </p>
                            </div>
                          ))}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Selected Gig</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedGig ? (
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{selectedGig.gigTitle}</p>
                            <p className="text-gray-600">{selectedGig.description || 'No description provided.'}</p>
                          </div>
                          <p className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-purple-700" />
                            {selectedGig.venueName}
                          </p>
                          <p className="flex items-center gap-2 text-gray-700">
                            <Clock3 className="w-4 h-4 text-purple-700" />
                            {formatDate(selectedGig.startDatetime)}
                          </p>
                          <Badge variant="outline">{selectedGig.isInvite ? 'invite' : selectedGig.isRequest ? 'request' : 'calendar'}</Badge>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Click a gig in the day list to see details.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div id="artist-gig-planner-unavailability" className="grid gap-6 lg:grid-cols-[0.85fr_1fr] scroll-mt-28">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Block-Out Unavailability</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleSubmitBlock}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="block-start">Start</Label>
                        <Input
                          id="block-start"
                          type="datetime-local"
                          value={form.startsAt}
                          onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="block-end">End</Label>
                        <Input
                          id="block-end"
                          type="datetime-local"
                          value={form.endsAt}
                          onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="block-reason">Reason</Label>
                      <Input
                        id="block-reason"
                        value={form.reason}
                        maxLength={80}
                        onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
                        placeholder="Unavailable"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="block-note">Note</Label>
                      <Textarea
                        id="block-note"
                        value={form.note}
                        maxLength={500}
                        onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                        placeholder="Optional internal note"
                      />
                    </div>
                    <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                      Save Unavailability
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Block-Out Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  {blocks.length === 0 ? (
                    <p className="text-sm text-gray-500">No unavailability in this month.</p>
                  ) : (
                    <div className="space-y-3">
                      {blocks.map((block) => (
                        <div key={block.id} className="rounded-lg border border-gray-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{block.reason}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(block.starts_at)} to {formatDate(block.ends_at)}
                              </p>
                              {block.note && <p className="text-sm text-gray-600 mt-2">{block.note}</p>}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBlock(block.id)}
                              disabled={actioningBlockId === block.id}
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
