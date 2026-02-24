'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, Inbox, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { formatDateTimeDDMMMyyyy } from '@/lib/date-format'

export type InboxAudience = 'fan' | 'artist'

type InboxFolderSummary = {
  id: string
  label: string
  description: string
  total: number
  unread: number
}

type InboxMessage = {
  id: string
  folderId: string
  notificationType: string
  title: string
  content: string
  isRead: boolean
  readAt: string | null
  createdAt: string
  actionUrl: string | null
  data: {
    gigId: string | null
    gigTitle: string | null
    venueId: string | null
    source: string | null
    artworkUrl: string | null
  }
}

type InboxResponse = {
  success: boolean
  data: {
    audience: InboxAudience
    selectedFolder: string
    unreadTotal: number
    total: number
    folders: InboxFolderSummary[]
    messages: InboxMessage[]
  }
}

interface InboxPanelProps {
  audience: InboxAudience
  title: string
  subtitle: string
  initialFolderId?: string | null
  onFolderChange?: (folderId: string) => void
  onUnreadCountChange?: (count: number) => void
}

function formatDateTime(value: string) {
  return formatDateTimeDDMMMyyyy(value, 'Unknown time')
}

function truncateText(value: string, max = 180) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}…`
}

export function InboxPanel({
  audience,
  title,
  subtitle,
  initialFolderId,
  onFolderChange,
  onUnreadCountChange,
}: InboxPanelProps) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingRead, setUpdatingRead] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [folders, setFolders] = useState<InboxFolderSummary[]>([])
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>(initialFolderId || 'all')
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [unreadTotal, setUnreadTotal] = useState(0)

  const fetchInbox = useCallback(async (isRefresh = false) => {
    try {
      setError(null)
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const query = new URLSearchParams({ audience, limit: '200' })
      const response = await fetch(`/api/inbox?${query.toString()}`, { cache: 'no-store' })
      const payload = await response.json() as InboxResponse

      if (!response.ok || !payload?.success) {
        throw new Error((payload as { error?: string })?.error || 'Failed to load inbox')
      }

      setFolders(payload.data.folders || [])
      setMessages(payload.data.messages || [])
      setUnreadTotal(payload.data.unreadTotal || 0)

      const validFolders = new Set(['all', ...(payload.data.folders || []).map((folder) => folder.id)])
      setSelectedFolderId((prev) => {
        const requested = initialFolderId || prev || 'all'
        return validFolders.has(requested) ? requested : 'all'
      })

      const firstMessage = (payload.data.messages || [])[0]
      setSelectedMessageId(firstMessage?.id || null)
      onUnreadCountChange?.(payload.data.unreadTotal || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [audience, initialFolderId, onUnreadCountChange])

  useEffect(() => {
    fetchInbox()
  }, [fetchInbox])

  useEffect(() => {
    if (!initialFolderId) return
    setSelectedFolderId(initialFolderId)
  }, [initialFolderId])

  const visibleMessages = useMemo(() => {
    if (selectedFolderId === 'all') return messages
    return messages.filter((message) => message.folderId === selectedFolderId)
  }, [messages, selectedFolderId])

  const selectedMessage = useMemo(() => {
    if (!selectedMessageId) return null
    return messages.find((message) => message.id === selectedMessageId) || null
  }, [messages, selectedMessageId])

  useEffect(() => {
    if (visibleMessages.length < 1) {
      setSelectedMessageId(null)
      return
    }

    setSelectedMessageId((prev) => {
      if (prev && visibleMessages.some((message) => message.id === prev)) return prev
      return visibleMessages[0].id
    })
  }, [visibleMessages])

  const markOneAsRead = useCallback(async (messageId: string) => {
    const target = messages.find((message) => message.id === messageId)
    if (!target || target.isRead) return

    try {
      const response = await fetch('/api/inbox', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read',
          messageId,
          audience,
        }),
      })
      if (!response.ok) return

      const now = new Date().toISOString()
      setMessages((prev) => prev.map((message) => (
        message.id === messageId
          ? { ...message, isRead: true, readAt: now }
          : message
      )))
      setFolders((prev) => prev.map((folder) => (
        folder.id === target.folderId
          ? { ...folder, unread: Math.max(0, folder.unread - 1) }
          : folder
      )))
      setUnreadTotal((prev) => {
        const next = Math.max(0, prev - 1)
        onUnreadCountChange?.(next)
        return next
      })
    } catch {
      // keep local state unchanged on failure
    }
  }, [audience, messages, onUnreadCountChange])

  const markFolderAsRead = useCallback(async () => {
    if (selectedFolderId === 'all' || updatingRead) return
    const activeFolder = folders.find((folder) => folder.id === selectedFolderId)
    if (!activeFolder || activeFolder.unread < 1) return

    try {
      setUpdatingRead(true)
      const response = await fetch('/api/inbox', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_all_read',
          audience,
          folder: selectedFolderId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark folder as read')
      }

      const folderUnread = activeFolder.unread
      const now = new Date().toISOString()
      setMessages((prev) => prev.map((message) => (
        message.folderId === selectedFolderId
          ? { ...message, isRead: true, readAt: message.readAt || now }
          : message
      )))
      setFolders((prev) => prev.map((folder) => (
        folder.id === selectedFolderId
          ? { ...folder, unread: 0 }
          : folder
      )))
      setUnreadTotal((prev) => {
        const next = Math.max(0, prev - folderUnread)
        onUnreadCountChange?.(next)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark messages as read')
    } finally {
      setUpdatingRead(false)
    }
  }, [audience, folders, selectedFolderId, onUnreadCountChange, updatingRead])

  return (
    <Card className="border border-white/10 bg-white/95">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              unreadTotal > 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              <Bell className="h-3.5 w-3.5" />
              {unreadTotal} unread
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchInbox(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setSelectedFolderId('all')
              onFolderChange?.('all')
            }}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              selectedFolderId === 'all'
                ? 'border-purple-500 bg-purple-100 text-purple-800'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({messages.length})
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => {
                setSelectedFolderId(folder.id)
                onFolderChange?.(folder.id)
              }}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selectedFolderId === folder.id
                  ? 'border-purple-500 bg-purple-100 text-purple-800'
                  : folder.unread > 0
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {folder.label} ({folder.total})
            </button>
          ))}
        </div>

        {selectedFolderId !== 'all' && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-600">
              {folders.find((folder) => folder.id === selectedFolderId)?.description || 'Folder messages'}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markFolderAsRead}
              disabled={updatingRead || (folders.find((folder) => folder.id === selectedFolderId)?.unread || 0) < 1}
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark Folder Read
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex h-44 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        ) : visibleMessages.length < 1 ? (
          <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center">
            <Inbox className="h-5 w-5 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">No messages in this folder</p>
            <p className="text-xs text-gray-500">New updates will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,320px),minmax(0,1fr)]">
            <div className="max-h-[30rem] space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
              {visibleMessages.map((message) => {
                const active = selectedMessageId === message.id
                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => {
                      setSelectedMessageId(message.id)
                      void markOneAsRead(message.id)
                    }}
                    className={`w-full rounded-md border px-3 py-2 text-left transition ${
                      active
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                        {message.title}
                      </p>
                      {!message.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-gray-600">
                      {truncateText(message.content || 'No message body')}
                    </p>
                    <p className="mt-2 text-[11px] text-gray-500">
                      {formatDateTime(message.createdAt)}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              {selectedMessage ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedMessage.title}</h3>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${
                      selectedMessage.isRead ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedMessage.isRead ? 'Read' : 'New'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{formatDateTime(selectedMessage.createdAt)}</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {selectedMessage.content || 'No message body.'}
                  </p>
                  {selectedMessage.actionUrl && (
                    <a
                      href={selectedMessage.actionUrl}
                      className="inline-flex rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-700"
                    >
                      Open linked update
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-gray-500">
                  Select a message to view details.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
