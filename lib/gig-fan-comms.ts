import type { SupabaseClient } from '@supabase/supabase-js'

export type FanCommsSendMode = 'now' | 'scheduled'
export type FanCommsAudienceMode = 'all_followers' | 'specific_regions'
export type FanCommsArtworkChoice = 'artist' | 'venue'
export type FanCommsStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled'

export interface GigFanCommsQueueEntry {
  id: string
  status: FanCommsStatus
  created_at: string
  send_mode: FanCommsSendMode
  scheduled_for: string | null
  sent_at: string | null
  audience_mode: FanCommsAudienceMode
  regions: string[]
  artwork_choice: FanCommsArtworkChoice
  artwork_url: string | null
  title: string
  message: string
  recipient_count: number | null
  failure_reason?: string | null
}

interface NormalizeFanCommsInputParams {
  sendMode?: unknown
  scheduledDate?: unknown
  scheduledTime?: unknown
  audienceMode?: unknown
  regions?: unknown
  artworkChoice?: unknown
  title?: unknown
  message?: unknown
}

interface GigForFanComms {
  id: string
  title: string
  venue_id: string | null
  metadata: Record<string, unknown> | null
  gig_status: string | null
}

interface SendFanCommsParams {
  serviceSupabase: SupabaseClient
  artistUserId: string
  artistDisplayName: string
  gig: GigForFanComms
  entry: GigFanCommsQueueEntry
}

interface DispatchDueFanCommsParams {
  serviceSupabase: SupabaseClient
  artistUserId: string
  artistDisplayName: string
  gigs: GigForFanComms[]
}

interface NormalizedFanCommsInput {
  sendMode: FanCommsSendMode
  scheduledFor: string | null
  audienceMode: FanCommsAudienceMode
  regions: string[]
  artworkChoice: FanCommsArtworkChoice
  title: string
  message: string
}

const FAN_COMMS_NOTIFICATION_TYPE = 'artist_gig_fan_update'
const MAX_REGIONS = 20
const MAX_TITLE_LENGTH = 120
const MAX_MESSAGE_LENGTH = 500
const INSERT_CHUNK_SIZE = 500

function safeObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => readString(item))
    .filter((item): item is string => Boolean(item))
}

function nowIso() {
  return new Date().toISOString()
}

function parseScheduledDateTime(scheduledDate: string, scheduledTime: string | null) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
    throw new Error('scheduledDate must use YYYY-MM-DD format')
  }
  if (scheduledTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(scheduledTime)) {
    throw new Error('scheduledTime must use HH:MM 24-hour format')
  }

  const composed = new Date(`${scheduledDate}T${scheduledTime || '00:00'}:00`)
  if (Number.isNaN(composed.getTime())) {
    throw new Error('Scheduled date/time is invalid')
  }
  if (composed.getTime() <= Date.now()) {
    throw new Error('Scheduled date/time must be in the future')
  }

  return composed.toISOString()
}

function normalizeRegions(input: unknown) {
  let values: string[] = []

  if (Array.isArray(input)) {
    values = input
      .map((entry) => (typeof entry === 'string' ? entry : ''))
      .map((entry) => entry.trim())
      .filter(Boolean)
  } else if (typeof input === 'string') {
    values = input
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  const unique = Array.from(new Set(values))
  if (unique.length > MAX_REGIONS) {
    throw new Error(`You can target up to ${MAX_REGIONS} regions per fan update`)
  }
  return unique
}

function parseQueueEntry(raw: unknown): GigFanCommsQueueEntry | null {
  const safe = safeObject(raw)
  const id = readString(safe.id)
  const status = readString(safe.status)
  const createdAt = readString(safe.created_at)
  const sendMode = readString(safe.send_mode)
  const audienceMode = readString(safe.audience_mode)
  const artworkChoice = readString(safe.artwork_choice)
  const title = readString(safe.title)
  const message = readString(safe.message)
  const scheduledFor = readString(safe.scheduled_for)
  const sentAt = readString(safe.sent_at)
  const artworkUrl = readString(safe.artwork_url)
  const failureReason = readString(safe.failure_reason)
  const recipientCount = typeof safe.recipient_count === 'number' && Number.isFinite(safe.recipient_count)
    ? safe.recipient_count
    : null
  const regions = readStringArray(safe.regions)

  if (!id || !createdAt || !title || !message) return null
  if (status !== 'scheduled' && status !== 'sent' && status !== 'failed' && status !== 'cancelled') return null
  if (sendMode !== 'now' && sendMode !== 'scheduled') return null
  if (audienceMode !== 'all_followers' && audienceMode !== 'specific_regions') return null
  if (artworkChoice !== 'artist' && artworkChoice !== 'venue') return null

  return {
    id,
    status,
    created_at: createdAt,
    send_mode: sendMode,
    scheduled_for: scheduledFor,
    sent_at: sentAt,
    audience_mode: audienceMode,
    regions,
    artwork_choice: artworkChoice,
    artwork_url: artworkUrl,
    title,
    message,
    recipient_count: recipientCount,
    failure_reason: failureReason,
  }
}

function readQueueFromMetadata(metadata: Record<string, unknown> | null | undefined) {
  const safeMetadata = safeObject(metadata)
  const fanComms = safeObject(safeMetadata.fan_comms)
  const rawQueue = Array.isArray(fanComms.queue) ? fanComms.queue : []
  return rawQueue
    .map((entry) => parseQueueEntry(entry))
    .filter((entry): entry is GigFanCommsQueueEntry => Boolean(entry))
}

function writeQueueToMetadata(
  metadata: Record<string, unknown> | null | undefined,
  queue: GigFanCommsQueueEntry[]
) {
  const safeMetadata = safeObject(metadata)
  const fanComms = safeObject(safeMetadata.fan_comms)

  const sent = queue.filter((entry) => entry.status === 'sent').length
  const scheduled = queue.filter((entry) => entry.status === 'scheduled').length
  const failed = queue.filter((entry) => entry.status === 'failed').length
  const lastSent = queue
    .filter((entry) => entry.sent_at)
    .map((entry) => entry.sent_at as string)
    .sort()
    .at(-1) || null

  return {
    ...safeMetadata,
    fan_comms: {
      ...fanComms,
      queue,
      summary: {
        sent,
        scheduled,
        failed,
        total: queue.length,
      },
      last_sent_at: lastSent,
    },
  }
}

function readLocationBlob(locationDetails: unknown) {
  if (locationDetails === null || locationDetails === undefined) return ''
  if (typeof locationDetails === 'string') return locationDetails.toLowerCase()
  try {
    return JSON.stringify(locationDetails).toLowerCase()
  } catch {
    return ''
  }
}

function splitIntoChunks<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }
  return chunks
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

export function getGigArtworkOptions(metadata: Record<string, unknown> | null | undefined) {
  const safeMetadata = safeObject(metadata)
  const venueOverride = safeObject(safeMetadata.venue_override)

  const artistArtworkUrl = readString(safeMetadata.artwork_url)
  const venueArtworkUrl = readString(venueOverride.artwork_url) || readString(venueOverride.image_url)

  return {
    artistArtworkUrl,
    venueArtworkUrl,
  }
}

export function normalizeFanCommsInput(params: NormalizeFanCommsInputParams): NormalizedFanCommsInput {
  const sendMode: FanCommsSendMode = params.sendMode === 'scheduled' ? 'scheduled' : 'now'
  const audienceMode: FanCommsAudienceMode = params.audienceMode === 'specific_regions'
    ? 'specific_regions'
    : 'all_followers'
  const artworkChoice: FanCommsArtworkChoice = params.artworkChoice === 'venue' ? 'venue' : 'artist'

  const title = (typeof params.title === 'string' ? params.title.trim() : '').slice(0, MAX_TITLE_LENGTH)
  const message = typeof params.message === 'string' ? params.message.trim() : ''

  if (!message) {
    throw new Error('Fan update message is required')
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Fan update message must be ${MAX_MESSAGE_LENGTH} characters or fewer`)
  }

  const regions = normalizeRegions(params.regions)
  if (audienceMode === 'specific_regions' && regions.length === 0) {
    throw new Error('Select at least one region when targeting specific regions')
  }

  let scheduledFor: string | null = null
  if (sendMode === 'scheduled') {
    const scheduledDate = typeof params.scheduledDate === 'string' ? params.scheduledDate.trim() : ''
    const scheduledTime = typeof params.scheduledTime === 'string' ? params.scheduledTime.trim() : ''
    if (!scheduledDate) {
      throw new Error('Scheduled fan updates require a date')
    }
    scheduledFor = parseScheduledDateTime(scheduledDate, scheduledTime || null)
  }

  return {
    sendMode,
    scheduledFor,
    audienceMode,
    regions,
    artworkChoice,
    title,
    message,
  }
}

function buildFanCommsEntry(params: {
  normalized: NormalizedFanCommsInput
  artworkUrl: string | null
}): GigFanCommsQueueEntry {
  const createdAt = nowIso()
  return {
    id: crypto.randomUUID(),
    status: params.normalized.sendMode === 'scheduled' ? 'scheduled' : 'sent',
    created_at: createdAt,
    send_mode: params.normalized.sendMode,
    scheduled_for: params.normalized.scheduledFor,
    sent_at: params.normalized.sendMode === 'now' ? createdAt : null,
    audience_mode: params.normalized.audienceMode,
    regions: params.normalized.regions,
    artwork_choice: params.normalized.artworkChoice,
    artwork_url: params.artworkUrl,
    title: params.normalized.title,
    message: params.normalized.message,
    recipient_count: null,
    failure_reason: null,
  }
}

async function resolveRecipientIds(params: {
  serviceSupabase: SupabaseClient
  artistUserId: string
  audienceMode: FanCommsAudienceMode
  regions: string[]
}) {
  const { serviceSupabase, artistUserId, audienceMode, regions } = params

  const { data: followRows, error: followError } = await serviceSupabase
    .from('user_follows')
    .select('follower_id')
    .eq('following_id', artistUserId)

  if (followError) {
    if (isMissingTableError(followError)) {
      throw new Error('Follower data is not available in this environment')
    }
    throw new Error(`Failed to load followers: ${followError.message}`)
  }

  const followerIds = Array.from(
    new Set(
      (followRows || [])
        .map((row) => readString((row as { follower_id?: unknown }).follower_id))
        .filter((id): id is string => Boolean(id) && id !== artistUserId)
    )
  )

  if (audienceMode === 'all_followers' || followerIds.length === 0) {
    return followerIds
  }

  const normalizedRegions = regions.map((region) => region.toLowerCase())

  const { data: fanProfiles, error: fanProfileError } = await serviceSupabase
    .from('fan_profiles')
    .select('user_id, location_details')
    .in('user_id', followerIds)

  if (fanProfileError) {
    if (isMissingTableError(fanProfileError)) {
      throw new Error('Fan location data is not available in this environment')
    }
    throw new Error(`Failed to load fan locations: ${fanProfileError.message}`)
  }

  const matchedFollowerIds = new Set<string>()
  for (const row of fanProfiles || []) {
    const userId = readString((row as { user_id?: unknown }).user_id)
    if (!userId) continue

    const locationBlob = readLocationBlob((row as { location_details?: unknown }).location_details)
    if (!locationBlob) continue

    const matches = normalizedRegions.some((region) => locationBlob.includes(region))
    if (matches) {
      matchedFollowerIds.add(userId)
    }
  }

  return followerIds.filter((id) => matchedFollowerIds.has(id))
}

async function insertNotifications(params: {
  serviceSupabase: SupabaseClient
  recipientIds: string[]
  artistDisplayName: string
  gig: GigForFanComms
  entry: GigFanCommsQueueEntry
}) {
  const { serviceSupabase, recipientIds, artistDisplayName, gig, entry } = params
  if (recipientIds.length === 0) {
    return 0
  }

  const title = entry.title || `${artistDisplayName} shared a gig update`
  const actionUrl = `/gigfinder?gig=${gig.id}`
  const createdAt = nowIso()

  const rows = recipientIds.map((userId) => ({
    user_id: userId,
    notification_type: FAN_COMMS_NOTIFICATION_TYPE,
    title,
    content: entry.message,
    data: {
      source: 'artist_gig_fan_comms',
      gig_id: gig.id,
      gig_title: gig.title,
      venue_id: gig.venue_id,
      audience_mode: entry.audience_mode,
      regions: entry.regions,
      artwork_choice: entry.artwork_choice,
      artwork_url: entry.artwork_url,
      comms_entry_id: entry.id,
      sent_at: entry.sent_at || createdAt,
      scheduled_for: entry.scheduled_for,
    },
    is_read: false,
    action_url: actionUrl,
    created_at: createdAt,
  }))

  for (const chunk of splitIntoChunks(rows, INSERT_CHUNK_SIZE)) {
    const { error: insertError } = await serviceSupabase
      .from('notifications')
      .insert(chunk)

    if (insertError) {
      if (isMissingTableError(insertError)) {
        throw new Error('Notifications are not available in this environment')
      }
      throw new Error(`Failed to create fan notifications: ${insertError.message}`)
    }
  }

  return rows.length
}

async function sendFanCommsNotifications(params: SendFanCommsParams) {
  const { serviceSupabase, artistUserId, artistDisplayName, gig, entry } = params
  const recipientIds = await resolveRecipientIds({
    serviceSupabase,
    artistUserId,
    audienceMode: entry.audience_mode,
    regions: entry.regions,
  })

  const insertedCount = await insertNotifications({
    serviceSupabase,
    recipientIds,
    artistDisplayName,
    gig,
    entry,
  })

  return {
    targetedCount: recipientIds.length,
    insertedCount,
  }
}

export async function createGigFanCommsEntry(params: {
  serviceSupabase: SupabaseClient
  artistUserId: string
  artistDisplayName: string
  gig: GigForFanComms
  input: NormalizeFanCommsInputParams
}) {
  const { serviceSupabase, artistUserId, artistDisplayName, gig, input } = params

  const normalized = normalizeFanCommsInput(input)
  const artworkOptions = getGigArtworkOptions(gig.metadata)
  const selectedArtworkUrl = normalized.artworkChoice === 'venue'
    ? (artworkOptions.venueArtworkUrl || artworkOptions.artistArtworkUrl)
    : (artworkOptions.artistArtworkUrl || artworkOptions.venueArtworkUrl)

  let entry = buildFanCommsEntry({
    normalized,
    artworkUrl: selectedArtworkUrl,
  })

  if (normalized.sendMode === 'now') {
    try {
      const sendResult = await sendFanCommsNotifications({
        serviceSupabase,
        artistUserId,
        artistDisplayName,
        gig,
        entry: {
          ...entry,
          sent_at: entry.sent_at || nowIso(),
        },
      })

      entry = {
        ...entry,
        status: 'sent',
        sent_at: entry.sent_at || nowIso(),
        recipient_count: sendResult.insertedCount,
      }

      return {
        entry,
        targetedCount: sendResult.targetedCount,
        sentCount: sendResult.insertedCount,
      }
    } catch (error) {
      const failureReason = error instanceof Error ? error.message : 'Failed to send fan update'
      entry = {
        ...entry,
        status: 'failed',
        sent_at: null,
        recipient_count: 0,
        failure_reason: failureReason,
      }
      return {
        entry,
        targetedCount: 0,
        sentCount: 0,
      }
    }
  }

  return {
    entry,
    targetedCount: null,
    sentCount: null,
  }
}

export async function dispatchDueFanCommsForArtistGigs(params: DispatchDueFanCommsParams) {
  const { serviceSupabase, artistUserId, artistDisplayName, gigs } = params
  const updatedGigMetadataById = new Map<string, Record<string, unknown>>()

  for (const gig of gigs) {
    if (gig.gig_status !== 'published') continue

    const queue = readQueueFromMetadata(gig.metadata)
    if (queue.length === 0) continue

    let changed = false
    const nextQueue: GigFanCommsQueueEntry[] = []

    for (const entry of queue) {
      const isScheduled = entry.status === 'scheduled'
      const dueAt = entry.scheduled_for ? new Date(entry.scheduled_for).getTime() : Number.NaN
      const dueNow = isScheduled && (!Number.isNaN(dueAt) ? dueAt <= Date.now() : true)

      if (!dueNow) {
        nextQueue.push(entry)
        continue
      }

      try {
        const sentAt = nowIso()
        const sendResult = await sendFanCommsNotifications({
          serviceSupabase,
          artistUserId,
          artistDisplayName,
          gig,
          entry: {
            ...entry,
            sent_at: sentAt,
          },
        })

        nextQueue.push({
          ...entry,
          status: 'sent',
          sent_at: sentAt,
          recipient_count: sendResult.insertedCount,
          failure_reason: null,
        })
      } catch (error) {
        nextQueue.push({
          ...entry,
          status: 'failed',
          sent_at: null,
          recipient_count: 0,
          failure_reason: error instanceof Error ? error.message : 'Failed to send scheduled update',
        })
      }

      changed = true
    }

    if (!changed) continue

    const metadata = writeQueueToMetadata(gig.metadata, nextQueue)
    const updatedAt = nowIso()
    const { error: updateError } = await serviceSupabase
      .from('gigs')
      .update({
        metadata,
        updated_at: updatedAt,
      })
      .eq('id', gig.id)

    if (updateError) {
      console.warn('Failed to persist scheduled fan comm dispatch state', {
        gigId: gig.id,
        updateError,
      })
      continue
    }

    updatedGigMetadataById.set(gig.id, metadata)
  }

  return { updatedGigMetadataById }
}

export function appendFanCommsEntryToMetadata(
  metadata: Record<string, unknown> | null | undefined,
  entry: GigFanCommsQueueEntry
) {
  const queue = readQueueFromMetadata(metadata)
  queue.push(entry)
  return writeQueueToMetadata(metadata, queue)
}

export function getFanCommsQueue(metadata: Record<string, unknown> | null | undefined) {
  return readQueueFromMetadata(metadata)
}

export function replaceFanCommsQueueInMetadata(
  metadata: Record<string, unknown> | null | undefined,
  queue: GigFanCommsQueueEntry[]
) {
  return writeQueueToMetadata(metadata, queue)
}
