'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, FileText, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { fetchArtistGigView, updateArtistGig } from './gig-manager/api'
import { ArtistGigRecord } from './gig-manager/types'
import { formatDateTimeDDMMMyyyy } from '@/lib/date-format'

function formatDate(value: string | null) {
  if (!value) return 'Date TBD'
  return formatDateTimeDDMMMyyyy(value, 'Date TBD')
}

export function ArtistGigConfirmationsManager() {
  const [confirmations, setConfirmations] = useState<ArtistGigRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    try {
      setError(null)
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await fetchArtistGigView('calendar', { status: ['confirmed'], limit: 200 })
      setConfirmations(response.data || [])
      setWarning(response.warning || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load confirmations')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleMarkCompleted = async (bookingId: string) => {
    try {
      setActioningId(bookingId)
      await updateArtistGig(bookingId, 'mark_completed')
      await load(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark confirmation as completed')
    } finally {
      setActioningId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-gray-500">Loading confirmations...</CardContent>
      </Card>
    )
  }

  return (
    <div id="artist-gig-confirmations-overview" className="space-y-6 scroll-mt-28">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-700" />
              Confirmations (Contracts)
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Confirmed gig contracts from accepted invites and approved requests.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {warning && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {warning}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {!error && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Contracts</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{confirmations.length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">From Invites</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{confirmations.filter((item) => item.isInvite).length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">From Requests</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{confirmations.filter((item) => item.isRequest).length}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confirmed Gig Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {!error && confirmations.length === 0 ? (
            <p className="text-sm text-gray-500">No confirmed gig contracts yet.</p>
          ) : (
            <div className="space-y-3">
              {confirmations.map((gig) => (
                <div key={gig.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{gig.gigTitle}</p>
                      <p className="text-sm text-gray-700">{gig.venueName}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(gig.startDatetime)}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="default">confirmed</Badge>
                        <Badge variant="outline">{gig.isInvite ? 'from invite' : 'from request'}</Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkCompleted(gig.id)}
                      disabled={actioningId === gig.id}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Completed
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
