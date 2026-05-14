import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { getInboxFolders, normalizeArtistInboxFolderId, type InboxAudience, type InboxFolderDefinition } from '@/data/inbox-folders'

type ConversationRow = {
  id: string
  conversation_type: string | null
  title: string | null
  description: string | null
  created_by: string | null
  is_active: boolean | null
  last_message_at: string | null
  created_at: string
  updated_at: string | null
  metadata?: Record<string, unknown> | null
}

type ParticipantRow = {
  conversation_id: string
  user_id: string
  role: string | null
  last_read_at: string | null
  is_active: boolean | null
  users?: {
    id: string
    email: string | null
    display_name: string | null
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
    user_role: string | null
  } | {
    id: string
    email: string | null
    display_name: string | null
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
    user_role: string | null
  }[] | null
}

type MessageRow = {
  id: string
  conversation_id: string
  sender_id: string
  message_type: string | null
  content: string | null
  media_url: string | null
  media_metadata: Record<string, unknown> | null
  reply_to_message_id: string | null
  is_edited: boolean | null
  edited_at: string | null
  created_at: string
}

type UserLookup = {
  id: string
  email: string | null
  display_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  user_role: string | null
}

const SYSTEM_FOLDER = 'system'

function safeObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  return {}
}

function readString(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function parseAudience(value: string | null): InboxAudience {
  return value === 'artist' ? 'artist' : 'fan'
}

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value || '100', 10)
  if (!Number.isFinite(parsed) || parsed < 1) return 100
  return Math.min(parsed, 500)
}

function normalizeFolderForAudience(audience: InboxAudience, value?: string | null) {
  if (audience === 'artist') {
    const normalized = normalizeArtistInboxFolderId(value)
    return getInboxFolders('artist').some((folder) => folder.id === normalized) ? normalized : SYSTEM_FOLDER
  }

  const folder = readString(value) || 'system'
  return getInboxFolders('fan').some((item) => item.id === folder) ? folder : 'system'
}

function getJoinedUser(user?: UserLookup | UserLookup[] | null): UserLookup | null {
  if (Array.isArray(user)) return user[0] || null
  return user || null
}

function getDisplayName(user?: UserLookup | UserLookup[] | null) {
  const normalizedUser = getJoinedUser(user)
  if (!normalizedUser) return 'Unknown user'
  return (
    readString(normalizedUser.display_name) ||
    [readString(normalizedUser.first_name), readString(normalizedUser.last_name)].filter(Boolean).join(' ') ||
    readString(normalizedUser.email) ||
    'Unknown user'
  )
}

async function createAuthClient() {
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

async function ensureUserRecord(serviceSupabase: ReturnType<typeof createServiceClient>, user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
  const { data: existing, error: selectError } = await serviceSupabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (selectError) throw new Error(`Failed to check user record: ${selectError.message}`)
  if (existing?.id) return

  const { error: insertError } = await serviceSupabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email || '',
      first_name: readString(user.user_metadata?.first_name),
      last_name: readString(user.user_metadata?.last_name),
      display_name: readString(user.user_metadata?.display_name),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (insertError) throw new Error(`Failed to create user record: ${insertError.message}`)
}

async function loadConversationData(params: {
  serviceSupabase: ReturnType<typeof createServiceClient>
  userId: string
  audience: InboxAudience
  folder: string | null
  conversationId: string | null
  limit: number
  summaryOnly?: boolean
}) {
  const { serviceSupabase, userId, audience, folder, conversationId, limit, summaryOnly = false } = params
  const { data: ownParticipants, error: participantError } = await serviceSupabase
    .from('conversation_participants')
    .select('conversation_id, user_id, role, last_read_at, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (participantError) throw new Error(`Failed to load conversation participants: ${participantError.message}`)

  const ownParticipantRows = (ownParticipants || []) as ParticipantRow[]
  const conversationIds = ownParticipantRows.map((row) => row.conversation_id)
  const ownParticipantByConversation = new Map(ownParticipantRows.map((row) => [row.conversation_id, row]))

  if (conversationIds.length === 0) {
    return buildPayload({ audience, userId, conversations: [], participants: [], messages: [], folder, conversationId })
  }

  const { data: conversationsData, error: conversationsError } = await serviceSupabase
    .from('conversations')
    .select('id, conversation_type, title, description, created_by, is_active, last_message_at, created_at, updated_at, metadata')
    .in('id', conversationIds)
    .eq('is_active', true)
    .order('last_message_at', { ascending: false })
    .limit(limit)

  if (conversationsError) throw new Error(`Failed to load conversations: ${conversationsError.message}`)

  const conversations = (conversationsData || []) as ConversationRow[]
  const activeConversationIds = conversations.map((row) => row.id)

  const { data: participantData, error: allParticipantError } = await serviceSupabase
    .from('conversation_participants')
    .select('conversation_id, user_id, role, last_read_at, is_active, users(id, email, display_name, first_name, last_name, avatar_url, user_role)')
    .in('conversation_id', activeConversationIds)
    .eq('is_active', true)

  if (allParticipantError) throw new Error(`Failed to load conversation members: ${allParticipantError.message}`)

  const participants = (participantData || []) as unknown as ParticipantRow[]

  const messageLimit = summaryOnly ? 500 : 1000
  const { data: messageData, error: messagesError } = await serviceSupabase
    .from('messages')
    .select('id, conversation_id, sender_id, message_type, content, media_url, media_metadata, reply_to_message_id, is_edited, edited_at, created_at')
    .in('conversation_id', activeConversationIds)
    .order('created_at', { ascending: false })
    .limit(messageLimit)

  if (messagesError) throw new Error(`Failed to load messages: ${messagesError.message}`)

  return buildPayload({
    audience,
    userId,
    conversations,
    participants,
    messages: (messageData || []) as MessageRow[],
    folder,
    conversationId,
    ownParticipantByConversation,
  })
}

function buildPayload(params: {
  audience: InboxAudience
  userId: string
  conversations: ConversationRow[]
  participants: ParticipantRow[]
  messages: MessageRow[]
  folder: string | null
  conversationId: string | null
  ownParticipantByConversation?: Map<string, ParticipantRow>
}) {
  const { audience, userId, conversations, participants, messages, folder, conversationId, ownParticipantByConversation = new Map() } = params
  const folders = getInboxFolders(audience)
  const folderSet = new Set(folders.map((item) => item.id))
  const selectedFolder = folder ? normalizeFolderForAudience(audience, folder) : null
  const participantsByConversation = new Map<string, ParticipantRow[]>()
  const messagesByConversation = new Map<string, MessageRow[]>()

  participants.forEach((participant) => {
    const existing = participantsByConversation.get(participant.conversation_id) || []
    existing.push(participant)
    participantsByConversation.set(participant.conversation_id, existing)
  })

  messages.forEach((message) => {
    const existing = messagesByConversation.get(message.conversation_id) || []
    existing.push(message)
    messagesByConversation.set(message.conversation_id, existing)
  })

  const threadSummaries = conversations.map((conversation) => {
    const metadata = safeObject(conversation.metadata)
    const conversationFolder = normalizeFolderForAudience(audience, readString(metadata.folder))
    const members = participantsByConversation.get(conversation.id) || []
    const otherMembers = members.filter((member) => member.user_id !== userId)
    const conversationMessages = (messagesByConversation.get(conversation.id) || []).sort((a, b) => a.created_at.localeCompare(b.created_at))
    const latestMessage = conversationMessages[conversationMessages.length - 1] || null
    const ownParticipant = ownParticipantByConversation.get(conversation.id)
    const lastReadAt = ownParticipant?.last_read_at || null
    const unread = conversationMessages.filter((message) => (
      message.sender_id !== userId &&
      (!lastReadAt || message.created_at > lastReadAt)
    )).length

    return {
      id: conversation.id,
      folderId: folderSet.has(conversationFolder) ? conversationFolder : SYSTEM_FOLDER,
      title: readString(conversation.title) || otherMembers.map((member) => getDisplayName(member.users)).join(', ') || 'Direct message',
      conversationType: conversation.conversation_type || 'direct',
      participants: members.map((member) => ({
        ...(() => {
          const memberUser = getJoinedUser(member.users)
          return {
            name: getDisplayName(memberUser),
            email: memberUser?.email || null,
            avatarUrl: memberUser?.avatar_url || null,
            role: memberUser?.user_role || null,
          }
        })(),
        userId: member.user_id,
      })),
      latestMessage: latestMessage
        ? {
            id: latestMessage.id,
            content: latestMessage.content || '',
            senderId: latestMessage.sender_id,
            createdAt: latestMessage.created_at,
          }
        : null,
      unread,
      lastMessageAt: conversation.last_message_at || latestMessage?.created_at || conversation.created_at,
      createdAt: conversation.created_at,
    }
  })

  const visibleThreads = selectedFolder
    ? threadSummaries.filter((thread) => thread.folderId === selectedFolder)
    : threadSummaries

  const activeConversationId = conversationId && threadSummaries.some((thread) => thread.id === conversationId)
    ? conversationId
    : visibleThreads[0]?.id || null

  const activeMessages = activeConversationId
    ? (messagesByConversation.get(activeConversationId) || []).sort((a, b) => a.created_at.localeCompare(b.created_at)).map((message) => ({
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        isOwn: message.sender_id === userId,
        content: message.content || '',
        messageType: message.message_type || 'text',
        mediaUrl: message.media_url,
        createdAt: message.created_at,
        isEdited: Boolean(message.is_edited),
        editedAt: message.edited_at,
      }))
    : []

  const folderSummaries = folders.map((folderItem: InboxFolderDefinition) => {
    const folderThreads = threadSummaries.filter((thread) => thread.folderId === folderItem.id)
    return {
      ...folderItem,
      total: folderThreads.length,
      unread: folderThreads.reduce((sum, thread) => sum + thread.unread, 0),
    }
  })

  return {
    audience,
    selectedFolder: selectedFolder || 'all',
    selectedConversationId: activeConversationId,
    unreadTotal: threadSummaries.reduce((sum, thread) => sum + thread.unread, 0),
    total: threadSummaries.length,
    folders: folderSummaries,
    conversations: visibleThreads,
    messages: activeMessages,
  }
}

export async function GET(request: NextRequest) {
  try {
    const authSupabase = await createAuthClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const searchParams = new URL(request.url).searchParams
    const audience = parseAudience(searchParams.get('audience'))
    const folder = searchParams.get('folder')
    const conversationId = searchParams.get('conversationId')
    const summaryOnly = searchParams.get('summary') === 'true'
    const limit = parseLimit(searchParams.get('limit'))
    const serviceSupabase = createServiceClient()

    await ensureUserRecord(serviceSupabase, {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata as Record<string, unknown> | undefined,
    })

    const payload = await loadConversationData({
      serviceSupabase,
      userId: user.id,
      audience,
      folder,
      conversationId,
      limit,
      summaryOnly,
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
    console.error('Messages GET error:', error)
    return NextResponse.json({ error: 'Failed to load messages', details: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authSupabase = await createAuthClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({})) as {
      conversationId?: string
      recipientEmail?: string
      recipientUserId?: string
      folder?: string
      content?: string
      audience?: InboxAudience
    }

    const content = readString(body.content)
    if (!content) return NextResponse.json({ error: 'Message content is required' }, { status: 400 })

    const audience = body.audience === 'fan' ? 'fan' : 'artist'
    const serviceSupabase = createServiceClient()
    await ensureUserRecord(serviceSupabase, {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata as Record<string, unknown> | undefined,
    })

    let conversationId = readString(body.conversationId)
    const nowIso = new Date().toISOString()

    if (conversationId) {
      const { data: participant, error: participantError } = await serviceSupabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (participantError) throw new Error(`Failed to verify conversation membership: ${participantError.message}`)
      if (!participant) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    } else {
      const recipientUserId = readString(body.recipientUserId)
      const recipientEmail = readString(body.recipientEmail).toLowerCase()

      if (!recipientUserId && !recipientEmail) {
        return NextResponse.json({ error: 'recipientEmail or recipientUserId is required to start a message' }, { status: 400 })
      }

      let recipient: UserLookup | null = null
      if (recipientUserId) {
        const { data, error } = await serviceSupabase
          .from('users')
          .select('id, email, display_name, first_name, last_name, avatar_url, user_role')
          .eq('id', recipientUserId)
          .maybeSingle()
        if (error) throw new Error(`Failed to find recipient: ${error.message}`)
        recipient = data as UserLookup | null
      } else {
        const { data, error } = await serviceSupabase
          .from('users')
          .select('id, email, display_name, first_name, last_name, avatar_url, user_role')
          .ilike('email', recipientEmail)
          .maybeSingle()
        if (error) throw new Error(`Failed to find recipient: ${error.message}`)
        recipient = data as UserLookup | null
      }

      if (!recipient?.id) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
      if (recipient.id === user.id) return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 })

      const folder = normalizeFolderForAudience(audience, body.folder)
      const { data: conversation, error: conversationError } = await serviceSupabase
        .from('conversations')
        .insert({
          conversation_type: 'direct',
          title: getDisplayName(recipient),
          description: null,
          created_by: user.id,
          is_active: true,
          last_message_at: nowIso,
          metadata: {
            folder,
            audience,
            created_from: 'artist_dashboard_messages'
          },
          created_at: nowIso,
          updated_at: nowIso
        })
        .select('id')
        .single()

      if (conversationError) throw new Error(`Failed to create conversation: ${conversationError.message}`)
      conversationId = conversation.id as string

      const { error: participantsError } = await serviceSupabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: user.id, role: 'admin', joined_at: nowIso, last_read_at: nowIso, is_active: true },
          { conversation_id: conversationId, user_id: recipient.id, role: 'member', joined_at: nowIso, last_read_at: null, is_active: true },
        ])

      if (participantsError) throw new Error(`Failed to create conversation participants: ${participantsError.message}`)
    }

    const { data: message, error: messageError } = await serviceSupabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_type: 'text',
        content,
        created_at: nowIso
      })
      .select('id, conversation_id, sender_id, content, created_at')
      .single()

    if (messageError) throw new Error(`Failed to send message: ${messageError.message}`)

    await serviceSupabase
      .from('conversations')
      .update({ last_message_at: nowIso, updated_at: nowIso })
      .eq('id', conversationId)

    await serviceSupabase
      .from('conversation_participants')
      .update({ last_read_at: nowIso })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, data: { conversationId, message } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Failed to send message', details: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authSupabase = await createAuthClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({})) as { conversationId?: string }
    const conversationId = readString(body.conversationId)
    if (!conversationId) return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })

    const serviceSupabase = createServiceClient()
    const { error } = await serviceSupabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (error) throw new Error(`Failed to mark conversation read: ${error.message}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Messages PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update messages', details: message }, { status: 500 })
  }
}
