import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type InboxAudience = 'fan' | 'artist'

type InboxFolder = {
  id: string
  label: string
  description: string
}

type NotificationRow = {
  id: string
  notification_type: string
  title: string
  content: string | null
  data: Record<string, unknown> | null
  is_read: boolean | null
  read_at: string | null
  action_url: string | null
  created_at: string
  expires_at: string | null
}

const FAN_FOLDERS: InboxFolder[] = [
  { id: 'upcoming_gigs', label: 'Upcoming Gigs', description: 'Gig reminders and schedule updates' },
  { id: 'artist_updates', label: 'Artist Updates', description: 'Artist communications and announcements' },
  { id: 'venue_updates', label: 'Venue Updates', description: 'Venue-side updates for gigs you follow' },
  { id: 'system', label: 'System', description: 'Account and platform notices' },
]

const ARTIST_FOLDERS: InboxFolder[] = [
  { id: 'gig_invites', label: 'Gig Invites', description: 'Invitations sent by venues and promoters' },
  { id: 'gig_requests', label: 'Gig Requests', description: 'Direct booking requests requiring action' },
  { id: 'release_updates', label: 'Release Updates', description: 'Music release workflow and admin updates' },
  { id: 'venue_updates', label: 'Venue Updates', description: 'Venue-side updates that affect your gigs' },
  { id: 'system', label: 'System', description: 'Account and platform notices' },
]

function safeObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function readString(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function parseAudience(value: string | null): InboxAudience {
  return value === 'artist' ? 'artist' : 'fan'
}

function isMissingTableError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const maybe = error as { code?: string; message?: string; details?: string }
  const message = `${maybe.message ?? ''} ${maybe.details ?? ''}`.toLowerCase()
  return (
    maybe.code === '42P01' ||
    (message.includes('relation') && message.includes('does not exist')) ||
    message.includes('could not find the table')
  )
}

function classifyFanFolder(row: NotificationRow) {
  const type = readString(row.notification_type).toLowerCase()
  const data = safeObject(row.data)
  const source = readString(data.source).toLowerCase()

  if (type.includes('artist') || source.includes('artist')) return 'artist_updates'
  if (type.includes('venue') || source.includes('venue')) return 'venue_updates'
  if (
    type.includes('gig') ||
    source.includes('gig') ||
    readString(data.gig_id)
  ) {
    return 'upcoming_gigs'
  }

  return 'system'
}

function classifyArtistFolder(row: NotificationRow) {
  const type = readString(row.notification_type).toLowerCase()
  const data = safeObject(row.data)
  const source = readString(data.source).toLowerCase()

  if (type.includes('invite')) return 'gig_invites'
  if (type.includes('request')) return 'gig_requests'
  if (type.includes('release') || source.includes('release')) return 'release_updates'
  if (type.includes('venue') || source.includes('venue')) return 'venue_updates'

  return 'system'
}

function getFolders(audience: InboxAudience) {
  return audience === 'artist' ? ARTIST_FOLDERS : FAN_FOLDERS
}

function classifyFolder(audience: InboxAudience, row: NotificationRow) {
  if (audience === 'artist') return classifyArtistFolder(row)
  return classifyFanFolder(row)
}

function toInboxMessage(audience: InboxAudience, row: NotificationRow) {
  const data = safeObject(row.data)
  const folderId = classifyFolder(audience, row)

  return {
    id: row.id,
    folderId,
    notificationType: row.notification_type,
    title: row.title,
    content: row.content || '',
    isRead: Boolean(row.is_read),
    readAt: row.read_at,
    createdAt: row.created_at,
    actionUrl: row.action_url,
    data: {
      gigId: readString(data.gig_id) || null,
      gigTitle: readString(data.gig_title) || null,
      venueId: readString(data.venue_id) || null,
      source: readString(data.source) || null,
      artworkUrl: readString(data.artwork_url) || null,
    },
  }
}

async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignore cookie writes from Server Components.
          }
        },
      },
    }
  )
}

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value || '100', 10)
  if (!Number.isFinite(parsed) || parsed < 1) return 100
  return Math.min(parsed, 500)
}

async function fetchNotificationsForUser(params: {
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>
  userId: string
  limit: number
}) {
  const { supabase, userId, limit } = params
  const nowIso = new Date().toISOString()

  const { data, error } = await supabase
    .from('notifications')
    .select('id, notification_type, title, content, data, is_read, read_at, action_url, created_at, expires_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    if (isMissingTableError(error)) return { rows: [] as NotificationRow[] }
    throw new Error(`Failed to load inbox notifications: ${error.message}`)
  }

  const rows = (data || []) as NotificationRow[]
  return {
    rows: rows.filter((row) => !row.expires_at || row.expires_at > nowIso),
  }
}

function buildInboxPayload(params: {
  audience: InboxAudience
  rows: NotificationRow[]
  selectedFolder: string | null
}) {
  const { audience, rows, selectedFolder } = params
  const folders = getFolders(audience)
  const allMessages = rows.map((row) => toInboxMessage(audience, row))

  const folderSet = new Set(folders.map((folder) => folder.id))
  const activeFolder = selectedFolder && folderSet.has(selectedFolder) ? selectedFolder : null
  const filteredMessages = activeFolder
    ? allMessages.filter((message) => message.folderId === activeFolder)
    : allMessages

  const folderSummaries = folders.map((folder) => {
    const folderMessages = allMessages.filter((message) => message.folderId === folder.id)
    const unread = folderMessages.filter((message) => !message.isRead).length
    return {
      ...folder,
      total: folderMessages.length,
      unread,
    }
  })

  const unreadTotal = allMessages.filter((message) => !message.isRead).length

  return {
    audience,
    selectedFolder: activeFolder || 'all',
    unreadTotal,
    total: allMessages.length,
    folders: folderSummaries,
    messages: filteredMessages,
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = new URL(request.url).searchParams
    const audience = parseAudience(searchParams.get('audience'))
    const folder = searchParams.get('folder')
    const summaryOnly = searchParams.get('summary') === 'true'
    const limit = parseLimit(searchParams.get('limit'))

    const { rows } = await fetchNotificationsForUser({
      supabase,
      userId: user.id,
      limit,
    })
    const payload = buildInboxPayload({
      audience,
      rows,
      selectedFolder: summaryOnly ? null : folder,
    })

    return NextResponse.json({
      success: true,
      data: summaryOnly
        ? {
            audience: payload.audience,
            unreadTotal: payload.unreadTotal,
            total: payload.total,
            folders: payload.folders,
          }
        : payload,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Inbox GET error:', error)
    return NextResponse.json({
      error: 'Failed to load inbox',
      details: message,
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as {
      action?: 'mark_read' | 'mark_all_read'
      messageId?: string
      audience?: InboxAudience
      folder?: string
    }

    const action = body.action
    if (action !== 'mark_read' && action !== 'mark_all_read') {
      return NextResponse.json({ error: 'action must be mark_read or mark_all_read' }, { status: 400 })
    }

    const audience: InboxAudience = body.audience === 'artist' ? 'artist' : 'fan'
    const nowIso = new Date().toISOString()

    if (action === 'mark_read') {
      const messageId = readString(body.messageId)
      if (!messageId) {
        return NextResponse.json({ error: 'messageId is required for mark_read' }, { status: 400 })
      }

      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: nowIso,
        })
        .eq('id', messageId)
        .eq('user_id', user.id)

      if (updateError) {
        if (isMissingTableError(updateError)) {
          return NextResponse.json({ success: true, updated: 0 })
        }
        throw new Error(`Failed to mark notification as read: ${updateError.message}`)
      }

      return NextResponse.json({ success: true, updated: 1 })
    }

    const { rows } = await fetchNotificationsForUser({
      supabase,
      userId: user.id,
      limit: 500,
    })
    const folder = readString(body.folder)

    const idsToMark = rows
      .filter((row) => !row.is_read)
      .filter((row) => {
        if (!folder || folder === 'all') return true
        return classifyFolder(audience, row) === folder
      })
      .map((row) => row.id)

    if (idsToMark.length === 0) {
      return NextResponse.json({ success: true, updated: 0 })
    }

    const { error: bulkUpdateError } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: nowIso,
      })
      .in('id', idsToMark)
      .eq('user_id', user.id)

    if (bulkUpdateError) {
      if (isMissingTableError(bulkUpdateError)) {
        return NextResponse.json({ success: true, updated: 0 })
      }
      throw new Error(`Failed to mark notifications as read: ${bulkUpdateError.message}`)
    }

    return NextResponse.json({
      success: true,
      updated: idsToMark.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Inbox PATCH error:', error)
    return NextResponse.json({
      error: 'Failed to update inbox',
      details: message,
    }, { status: 500 })
  }
}
