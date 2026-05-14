'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Flag, RefreshCw, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Checkbox } from '../../components/ui/checkbox'
import {
  fetchArtistGigReporting,
  fetchArtistGigView,
  submitArtistGigReporting,
} from './gig-manager/api'
import { ArtistGigRecord, ArtistGigReportingRecord } from './gig-manager/types'
import { formatDateTimeDDMMMyyyy } from '@/lib/date-format'

interface ArtistGigReportingManagerProps {
  mode: 'confirm' | 'report'
}

type ReportFormState = {
  rating: number
  reviewText: string
  issueTypes: string[]
  environmentDetails: string
  attitudeDetails: string
}

const ISSUE_OPTIONS = [
  'Unsafe environment',
  'Hostile attitude',
  'Payment issue',
  'Technical problem',
  'Misleading gig details',
  'No-show or late member',
]

function formatDate(value: string | null) {
  if (!value) return 'Date TBD'
  return formatDateTimeDDMMMyyyy(value, 'Date TBD')
}

function isPastGig(gig: ArtistGigRecord) {
  if (!gig.startDatetime) return true
  const date = new Date(gig.startDatetime)
  if (Number.isNaN(date.getTime())) return true
  return date.getTime() <= Date.now()
}

function defaultForm(): ReportFormState {
  return {
    rating: 5,
    reviewText: '',
    issueTypes: [],
    environmentDetails: '',
    attitudeDetails: '',
  }
}

export function ArtistGigReportingManager({ mode }: ArtistGigReportingManagerProps) {
  const [gigs, setGigs] = useState<ArtistGigRecord[]>([])
  const [entries, setEntries] = useState<ArtistGigReportingRecord[]>([])
  const [forms, setForms] = useState<Record<string, ReportFormState>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    try {
      setError(null)
      setWarning(null)
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const nowIso = new Date().toISOString()
      const [gigResponse, reportingResponse] = await Promise.all([
        fetchArtistGigView('calendar', {
          status: mode === 'confirm' ? ['confirmed'] : ['confirmed', 'completed'],
          dateTo: nowIso,
          limit: 200,
        }),
        fetchArtistGigReporting(mode),
      ])

      setGigs((gigResponse.data || []).filter(isPastGig))
      setEntries(reportingResponse.data || [])
      setWarning(gigResponse.warning || reportingResponse.warning || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gig reporting')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [mode])

  useEffect(() => {
    load()
  }, [load])

  const entryByBookingId = useMemo(() => {
    return new Map(entries.map((entry) => [entry.booking_id, entry]))
  }, [entries])

  const visibleGigs = useMemo(() => {
    if (mode === 'confirm') {
      return gigs.filter((gig) => !entryByBookingId.has(gig.id))
    }
    return gigs
  }, [entryByBookingId, gigs, mode])

  const updateForm = (bookingId: string, patch: Partial<ReportFormState>) => {
    setForms((prev) => ({
      ...prev,
      [bookingId]: {
        ...defaultForm(),
        ...(prev[bookingId] || {}),
        ...patch,
      },
    }))
  }

  const toggleIssue = (bookingId: string, issue: string) => {
    const current = forms[bookingId] || defaultForm()
    updateForm(bookingId, {
      issueTypes: current.issueTypes.includes(issue)
        ? current.issueTypes.filter((item) => item !== issue)
        : [...current.issueTypes, issue],
    })
  }

  const handleSubmit = async (event: FormEvent, gig: ArtistGigRecord) => {
    event.preventDefault()
    const form = forms[gig.id] || defaultForm()

    try {
      setSubmittingId(gig.id)
      setError(null)
      setSuccess(null)

      await submitArtistGigReporting({
        bookingId: gig.id,
        actionType: mode,
        targetMemberType: 'venue',
        targetMemberId: null,
        rating: mode === 'confirm' ? form.rating : null,
        reviewText: form.reviewText,
        issueTypes: mode === 'report' ? form.issueTypes : [],
        environmentDetails: mode === 'report' ? form.environmentDetails : '',
        attitudeDetails: mode === 'report' ? form.attitudeDetails : '',
      })

      setSuccess(mode === 'confirm' ? 'Gig confirmed as completed.' : 'Gig report submitted.')
      await load(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save gig reporting')
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-gray-500">Loading gig reporting...</CardContent>
      </Card>
    )
  }

  return (
    <div id={`artist-gig-reporting-${mode}`} className="space-y-6 scroll-mt-28">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              {mode === 'confirm' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              ) : (
                <Flag className="w-5 h-5 text-red-700" />
              )}
              {mode === 'confirm' ? 'Confirm a Gig' : 'Report a Gig'}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'confirm'
                ? 'Affirm completion of gig performance and review the member.'
                : 'Submit negative feedback for bad environment or attitude by a member.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Eligible Gigs</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{visibleGigs.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Submitted</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{entries.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Mode</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{mode === 'confirm' ? 'Confirm' : 'Report'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {visibleGigs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-sm text-gray-500">
            {mode === 'confirm'
              ? 'No completed confirmed gigs are waiting for confirmation.'
              : 'No completed gigs are available to report.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleGigs.map((gig) => {
            const form = forms[gig.id] || defaultForm()
            const existing = entryByBookingId.get(gig.id)

            return (
              <Card key={gig.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-base">{gig.gigTitle}</CardTitle>
                      <p className="text-sm text-gray-600">{gig.venueName}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(gig.startDatetime)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={gig.bookingStatus === 'completed' ? 'outline' : 'default'}>{gig.bookingStatus}</Badge>
                      {existing && <Badge variant="secondary">submitted</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={(event) => handleSubmit(event, gig)}>
                    {mode === 'confirm' ? (
                      <>
                        <div className="space-y-2">
                          <Label>Member Review Rating</Label>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button
                                key={rating}
                                type="button"
                                size="sm"
                                variant={form.rating === rating ? 'default' : 'outline'}
                                onClick={() => updateForm(gig.id, { rating })}
                              >
                                <Star className="w-4 h-4 mr-1" />
                                {rating}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`confirm-review-${gig.id}`}>Review</Label>
                          <Textarea
                            id={`confirm-review-${gig.id}`}
                            value={form.reviewText}
                            maxLength={2000}
                            onChange={(event) => updateForm(gig.id, { reviewText: event.target.value })}
                            placeholder="Optional member review"
                          />
                        </div>
                        <Button type="submit" disabled={submittingId === gig.id} className="bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Confirm Gig Completed
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Issue Type</Label>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {ISSUE_OPTIONS.map((issue) => (
                              <label key={issue} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 text-sm">
                                <Checkbox
                                  checked={form.issueTypes.includes(issue)}
                                  onCheckedChange={() => toggleIssue(gig.id, issue)}
                                />
                                {issue}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label htmlFor={`environment-${gig.id}`}>Environment</Label>
                            <Textarea
                              id={`environment-${gig.id}`}
                              value={form.environmentDetails}
                              maxLength={2000}
                              onChange={(event) => updateForm(gig.id, { environmentDetails: event.target.value })}
                              placeholder="What happened with the environment?"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`attitude-${gig.id}`}>Attitude</Label>
                            <Textarea
                              id={`attitude-${gig.id}`}
                              value={form.attitudeDetails}
                              maxLength={2000}
                              onChange={(event) => updateForm(gig.id, { attitudeDetails: event.target.value })}
                              placeholder="What happened with the member?"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`report-review-${gig.id}`}>Additional Detail</Label>
                          <Textarea
                            id={`report-review-${gig.id}`}
                            value={form.reviewText}
                            maxLength={2000}
                            onChange={(event) => updateForm(gig.id, { reviewText: event.target.value })}
                            placeholder="Add context for review"
                          />
                        </div>
                        <Button type="submit" disabled={submittingId === gig.id} className="bg-red-600 hover:bg-red-700">
                          <Flag className="w-4 h-4 mr-2" />
                          Submit Gig Report
                        </Button>
                      </>
                    )}
                  </form>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
