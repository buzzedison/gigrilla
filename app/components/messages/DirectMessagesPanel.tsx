'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, Inbox, Loader2, Mail, RefreshCw, Send, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { formatDateTimeDDMMMyyyy } from '@/lib/date-format'
import { ARTIST_INBOX_GROUPS, ARTIST_INBOX_FOLDERS, type InboxAudience, type InboxFolderGroupId } from '@/data/inbox-folders'

type FolderSummary = {
  id: string
  label: string
  description: string
  groupId?: InboxFolderGroupId
  total: number
  unread: number
}

type ConversationSummary = {
  id: string
  folderId: string
  title: string
  conversationType: string
  participants: Array<{
    userId: string
    name: string
    email: string | null
    avatarUrl: string | null
    role: string | null
  }>
  latestMessage: {
    id: string
    content: string
    senderId: string
    createdAt: string
  } | null
  unread: number
  lastMessageAt: string
  createdAt: string
}

type DirectMessage = {
  id: string
  conversationId: string
  senderId: string
  isOwn: boolean
  content: string
  messageType: string
  mediaUrl: string | null
  createdAt: string
  isEdited: boolean
  editedAt: string | null
}

type MessagesResponse = {
  success: boolean
  data: {
    audience: InboxAudience
    selectedFolder: string
    selectedConversationId: string | null
    unreadTotal: number
    total: number
    folders: FolderSummary[]
    conversations: ConversationSummary[]
    messages: DirectMessage[]
  }
}

interface DirectMessagesPanelProps {
  audience: InboxAudience
  title: string
  subtitle: string
  initialFolderId?: string | null
  onFolderChange?: (folderId: string) => void
  onUnreadCountChange?: (count: number) => void
}

const groupIcons: Record<InboxFolderGroupId, React.ComponentType<{ className?: string }>> = {
  gig_negotiations: Mail,
  user_messages: Users,
  system_messages: ShieldCheck,
}

function formatDateTime(value: string) {
  return formatDateTimeDDMMMyyyy(value, 'Unknown time')
}

function truncateText(value: string, max = 110) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}...`
}

export function DirectMessagesPanel({
  audience,
  title,
  subtitle,
  initialFolderId,
  onFolderChange,
  onUnreadCountChange,
}: DirectMessagesPanelProps) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [folders, setFolders] = useState<FolderSummary[]>([])
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState(initialFolderId || 'all')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [unreadTotal, setUnreadTotal] = useState(0)
  const [replyText, setReplyText] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [composeFolder, setComposeFolder] = useState(initialFolderId && initialFolderId !== 'all' ? initialFolderId : 'artists')
  const [composeText, setComposeText] = useState('')

  const fetchMessages = useCallback(async (options?: { refresh?: boolean; folderId?: string; conversationId?: string | null }) => {
    try {
      setError(null)
      if (options?.refresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const folderId = options?.folderId ?? selectedFolderId
      const conversationId = options?.conversationId ?? selectedConversationId
      const query = new URLSearchParams({ audience, limit: '200' })
      if (folderId && folderId !== 'all') query.set('folder', folderId)
      if (conversationId) query.set('conversationId', conversationId)

      const response = await fetch(`/api/messages?${query.toString()}`, { cache: 'no-store' })
      const payload = await response.json() as MessagesResponse

      if (!response.ok || !payload?.success) {
        throw new Error((payload as { error?: string; details?: string })?.details || (payload as { error?: string })?.error || 'Failed to load messages')
      }

      setFolders(payload.data.folders || [])
      setConversations(payload.data.conversations || [])
      setMessages(payload.data.messages || [])
      setUnreadTotal(payload.data.unreadTotal || 0)
      setSelectedFolderId(payload.data.selectedFolder || 'all')
      setSelectedConversationId(payload.data.selectedConversationId)
      onUnreadCountChange?.(payload.data.unreadTotal || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [audience, onUnreadCountChange, selectedConversationId, selectedFolderId])

  useEffect(() => {
    fetchMessages({ folderId: initialFolderId || 'all', conversationId: null })
  }, [fetchMessages, initialFolderId])

  const folderGroups = useMemo(() => {
    const folderMap = new Map(folders.map((folder) => [folder.id, folder]))
    return ARTIST_INBOX_GROUPS.map((group) => {
      const groupFolders = group.folderIds
        .map((folderId) => folderMap.get(folderId))
        .filter((folder): folder is FolderSummary => Boolean(folder))

      return {
        ...group,
        folders: groupFolders,
        total: groupFolders.reduce((sum, folder) => sum + folder.total, 0),
        unread: groupFolders.reduce((sum, folder) => sum + folder.unread, 0),
      }
    })
  }, [folders])

  const selectedConversation = useMemo(() => (
    conversations.find((conversation) => conversation.id === selectedConversationId) || null
  ), [conversations, selectedConversationId])

  const selectFolder = (folderId: string) => {
    setSelectedFolderId(folderId)
    setSelectedConversationId(null)
    onFolderChange?.(folderId)
    void fetchMessages({ folderId, conversationId: null })
  }

  const selectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId)
    await fetchMessages({ folderId: selectedFolderId, conversationId })
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId })
    }).catch(() => null)
  }

  const sendReply = async () => {
    if (!selectedConversationId || !replyText.trim()) return
    try {
      setSending(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience,
          conversationId: selectedConversationId,
          content: replyText.trim()
        })
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.details || payload?.error || 'Failed to send message')
      }
      setReplyText('')
      await fetchMessages({ folderId: selectedFolderId, conversationId: selectedConversationId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const startConversation = async () => {
    if (!recipientEmail.trim() || !composeText.trim()) return
    try {
      setSending(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience,
          recipientEmail: recipientEmail.trim(),
          folder: composeFolder,
          content: composeText.trim()
        })
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.details || payload?.error || 'Failed to start conversation')
      }
      setRecipientEmail('')
      setComposeText('')
      setComposeOpen(false)
      onFolderChange?.(composeFolder)
      await fetchMessages({ folderId: composeFolder, conversationId: payload.data?.conversationId || null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="border border-white/10 bg-white/95">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              unreadTotal > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <Bell className="h-3.5 w-3.5" />
              {unreadTotal} unread
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchMessages({ refresh: true })} disabled={refreshing}>
              {refreshing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
              Refresh
            </Button>
            <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => setComposeOpen(prev => !prev)}>
              <UserPlus className="mr-1 h-4 w-4" />
              New message
            </Button>
          </div>
        </div>

        {composeOpen && (
          <div className="grid gap-3 rounded-lg border border-purple-100 bg-purple-50/50 p-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <Input value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} placeholder="Recipient email" />
            <Select value={composeFolder} onValueChange={setComposeFolder}>
              <SelectTrigger><SelectValue placeholder="Folder" /></SelectTrigger>
              <SelectContent>
                {ARTIST_INBOX_FOLDERS.filter(folder => folder.id !== 'system').map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>{folder.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea className="md:col-span-2" value={composeText} onChange={(event) => setComposeText(event.target.value)} placeholder="Write the first message..." rows={3} />
            <div className="flex justify-end md:col-span-2">
              <Button onClick={startConversation} disabled={sending || !recipientEmail.trim() || !composeText.trim()} className="bg-purple-600 text-white hover:bg-purple-700">
                {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                Send
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => selectFolder('all')}
            className={`rounded-lg border p-3 text-left transition ${
              selectedFolderId === 'all' ? 'border-purple-400 bg-purple-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-950">All Threads</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{conversations.length}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Every real message thread.</p>
          </button>

          {folderGroups.map((group) => {
            const Icon = groupIcons[group.id]
            return (
              <div key={group.id} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-purple-700" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-950">{group.label}</p>
                      <p className="line-clamp-2 text-xs text-gray-500">{group.description}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    group.unread > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {group.total}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.folders.map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => selectFolder(folder.id)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition ${
                        selectedFolderId === folder.id ? 'bg-purple-100 text-purple-900' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{folder.label}</span>
                      <span className={`ml-2 rounded-full px-1.5 py-0.5 font-semibold ${
                        folder.unread > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {folder.total}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        ) : conversations.length < 1 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center">
            <Inbox className="h-5 w-5 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">No message threads in this folder</p>
            <p className="text-xs text-gray-500">Start a new message or wait for replies to appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,340px),minmax(0,1fr)]">
            <div className="max-h-[34rem] space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => void selectConversation(conversation.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left transition ${
                    selectedConversationId === conversation.id ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-semibold text-gray-900">{conversation.title}</p>
                    {conversation.unread > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">{conversation.unread}</span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs text-gray-600">{truncateText(conversation.latestMessage?.content || 'No messages yet')}</p>
                  <p className="mt-2 text-[11px] text-gray-500">{formatDateTime(conversation.lastMessageAt)}</p>
                </button>
              ))}
            </div>

            <div className="flex min-h-[34rem] flex-col rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedConversation?.title || 'Select a thread'}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedConversation ? `${selectedConversation.participants.length} participants` : 'Choose a conversation to read and reply.'}
                    </p>
                  </div>
                  {selectedConversationId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => fetch('/api/messages', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ conversationId: selectedConversationId })
                      }).catch(() => null)}
                    >
                      <CheckCheck className="mr-1 h-3.5 w-3.5" />
                      Mark read
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length < 1 ? (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    No messages in this thread yet.
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] rounded-lg px-3 py-2 ${
                        message.isOwn ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                        <p className={`mt-1 text-[10px] ${message.isOwn ? 'text-purple-100' : 'text-gray-500'}`}>{formatDateTime(message.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-200 p-3">
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    disabled={!selectedConversationId}
                    placeholder={selectedConversationId ? 'Write a reply...' : 'Select a thread to reply'}
                    rows={2}
                  />
                  <Button
                    onClick={sendReply}
                    disabled={sending || !selectedConversationId || !replyText.trim()}
                    className="self-end bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
