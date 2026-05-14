export type InboxAudience = 'fan' | 'artist'

export type InboxFolderGroupId = 'gig_negotiations' | 'user_messages' | 'system_messages'

export type InboxFolderDefinition = {
  id: string
  label: string
  description: string
  groupId?: InboxFolderGroupId
}

export type InboxFolderGroupDefinition = {
  id: InboxFolderGroupId
  label: string
  description: string
  folderIds: string[]
}

export const FAN_INBOX_FOLDERS: InboxFolderDefinition[] = [
  { id: 'upcoming_gigs', label: 'Upcoming Gigs', description: 'Gig reminders and schedule updates' },
  { id: 'artist_updates', label: 'Artist Updates', description: 'Artist communications and announcements' },
  { id: 'venue_updates', label: 'Venue Updates', description: 'Venue-side updates for gigs you follow' },
  { id: 'system', label: 'System', description: 'Account and platform notices' },
]

export const ARTIST_INBOX_GROUPS: InboxFolderGroupDefinition[] = [
  {
    id: 'gig_negotiations',
    label: 'Gig Negotiations',
    description: 'Invites, requests, and confirmations tied to bookings and contracts.',
    folderIds: ['gig_invites', 'gig_requests', 'confirmations']
  },
  {
    id: 'user_messages',
    label: 'User Messages',
    description: 'Messages between artists, members, fans, venues, services, and professionals.',
    folderIds: ['colleagues', 'auditions', 'fans', 'artists', 'venues', 'services', 'pros']
  },
  {
    id: 'system_messages',
    label: 'System Messages',
    description: 'Platform notices from Gigrilla.',
    folderIds: ['system']
  }
]

export const ARTIST_INBOX_FOLDERS: InboxFolderDefinition[] = [
  { id: 'gig_invites', label: 'Gig Invites', description: 'Invitations from venues and artists', groupId: 'gig_negotiations' },
  { id: 'gig_requests', label: 'Gig Requests', description: 'Booking requests sent to others or received from others', groupId: 'gig_negotiations' },
  { id: 'confirmations', label: 'Confirmations', description: 'Confirmed gig contracts and related contract notices', groupId: 'gig_negotiations' },
  { id: 'colleagues', label: 'Colleague Messages', description: "Messages from other members of this profile's crew", groupId: 'user_messages' },
  { id: 'auditions', label: 'My Advert Messages', description: 'Replies and messages tied to your adverts', groupId: 'user_messages' },
  { id: 'fans', label: 'Fan Messages', description: 'Messages from fan users, excluding colleagues', groupId: 'user_messages' },
  { id: 'artists', label: 'Artist Messages', description: 'Messages from other artists', groupId: 'user_messages' },
  { id: 'venues', label: 'Venue Messages', description: 'Messages from venue users outside booking-system notices', groupId: 'user_messages' },
  { id: 'services', label: 'Service Messages', description: 'Messages from music service users', groupId: 'user_messages' },
  { id: 'pros', label: 'MusicPro Messages', description: 'Messages from music professional users', groupId: 'user_messages' },
  { id: 'system', label: 'System Messages', description: 'Messages from Gigrilla', groupId: 'system_messages' },
]

const FOLDER_ALIASES: Record<string, string> = {
  advert: 'auditions',
  adverts: 'auditions',
  audition: 'auditions',
  audition_messages: 'auditions',
  collab: 'auditions',
  collabs: 'auditions',
  colleague: 'colleagues',
  colleague_messages: 'colleagues',
  confirmation: 'confirmations',
  confirmations_contracts: 'confirmations',
  contracts: 'confirmations',
  fan: 'fans',
  artist: 'artists',
  venue: 'venues',
  venue_updates: 'venues',
  service: 'services',
  music_service: 'services',
  musicpro: 'pros',
  music_pro: 'pros',
  professional: 'pros',
  professionals: 'pros',
  release_updates: 'system',
  system_messages: 'system',
}

export function getInboxFolders(audience: InboxAudience) {
  return audience === 'artist' ? ARTIST_INBOX_FOLDERS : FAN_INBOX_FOLDERS
}

export function normalizeArtistInboxFolderId(value?: string | null) {
  if (!value) return ''
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, '_')
  if (ARTIST_INBOX_FOLDERS.some((folder) => folder.id === normalized)) return normalized
  return FOLDER_ALIASES[normalized] || normalized
}
