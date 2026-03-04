import {
  ArtistTypeCapabilities as DetailedCapabilities,
  getArtistTypeCapabilities
} from '../lib/artist-type-config'
import {
  VOCAL_SOUND_DESCRIPTORS as SHARED_VOCAL_SOUND_DESCRIPTORS,
  VOCAL_GENRE_DESCRIPTORS as SHARED_VOCAL_GENRE_DESCRIPTORS
} from './vocal-descriptors'
import {
  TYPE5_INSTRUMENT_GROUP_OPTIONS,
  TYPE5_MAIN_INSTRUMENT_FAMILY_OPTIONS
} from './instrument-taxonomy'

export type GigBookingMode = 'public' | 'collaboration' | 'both'

export interface ArtistTypeOption {
  id: string
  label: string
  description?: string
  group?: string
}

export interface ArtistTypeGroup {
  id: string
  title: string
  helpText?: string
  required?: boolean
  minSelect?: number
  maxSelect?: number
  options: ArtistTypeOption[]
}

// Extended capabilities that include both old and new systems
export interface ArtistTypeCapabilities extends DetailedCapabilities {
  showGigAbility: boolean
  showMusicUploads: boolean
  gigBookingMode: GigBookingMode
}

export interface ArtistTypeConfig {
  id: number
  name: string
  summary: string
  description: string
  groups: ArtistTypeGroup[]
  capabilities: ArtistTypeCapabilities
}

const ARTIST_TYPE_ONE_SUB_TYPES: ArtistTypeOption[] = [
  { id: 'band', label: 'Band' },
  { id: 'dj-producer', label: 'DJ-Producer' },
  { id: 'dj-producers', label: 'DJ-Producers' },
  { id: 'rapper', label: 'Rapper' },
  { id: 'rappers', label: 'Rappers' },
  { id: 'singer-songwriter', label: 'Singer-Songwriter' },
  { id: 'solo-artist', label: 'Solo Artist' },
  { id: 'group', label: 'Group' },
  { id: 'duo', label: 'Duo' },
  { id: 'trio', label: 'Trio' },
  { id: 'quartet', label: 'Quartet' },
  { id: 'ensemble', label: 'Ensemble' },
  { id: 'orchestra', label: 'Orchestra' },
  { id: 'choir', label: 'Choir' },
  { id: 'instrumental-artist', label: 'Instrumental Artist' },
  { id: 'spoken-word', label: 'Spoken Word Artist' },
  { id: 'a-cappella', label: 'A Cappella Group' }
]

const ARTIST_TYPE_THREE_SUB_TYPES: ArtistTypeOption[] = [
  { id: 'cover-band', label: 'Cover Band' },
  { id: 'tribute-band', label: 'Tribute Band' },
  { id: 'dj-entertainer', label: 'DJ-Entertainer' },
  { id: 'cover-rapper', label: 'Cover Rapper' },
  { id: 'tribute-rapper', label: 'Tribute Rapper' },
  { id: 'cover-solo', label: 'Cover Solo Artist' },
  { id: 'tribute-solo', label: 'Tribute Solo Artist' },
  { id: 'cover-group', label: 'Cover Group' },
  { id: 'tribute-group', label: 'Tribute Group' },
  { id: 'cover-duo', label: 'Cover Duo' },
  { id: 'tribute-duo', label: 'Tribute Duo' },
  { id: 'cover-trio', label: 'Cover Trio' },
  { id: 'tribute-trio', label: 'Tribute Trio' },
  { id: 'cover-quartet', label: 'Cover Quartet' },
  { id: 'tribute-quartet', label: 'Tribute Quartet' },
  { id: 'cover-ensemble', label: 'Cover Ensemble' },
  { id: 'tribute-ensemble', label: 'Tribute Ensemble' },
  { id: 'orchestra', label: 'Orchestra' },
  { id: 'choir', label: 'Choir' },
  { id: 'cover-a-cappella', label: 'Cover A Cappella Group' }
]

const VOCAL_SOUND_DESCRIPTORS: ArtistTypeOption[] = SHARED_VOCAL_SOUND_DESCRIPTORS.map((item) => ({
  id: item.id,
  label: item.label,
  group: item.group
}))

const VOCAL_GENRE_DESCRIPTORS: ArtistTypeOption[] = SHARED_VOCAL_GENRE_DESCRIPTORS.map((item) => ({
  id: item.id,
  label: item.label,
  group: item.group
}))

const SONGWRITER_OPTIONS: ArtistTypeOption[] = [
  { id: 'lyrics-and-melody', label: 'Lyrics & Melodies' },
  { id: 'lyrics-only', label: 'Lyrics Only' },
  { id: 'melody-only', label: 'Melodies/Harmonies Only' },
  { id: 'arrangements', label: 'Arrangements & Structure' }
]

const COMPOSER_OPTIONS: ArtistTypeOption[] = [
  { id: 'film-tv', label: 'Film / TV / Media Composition' },
  { id: 'recording-artist', label: 'Recording Artist Composition' },
  { id: 'collaboration', label: 'Collaborative Composition' }
]

// Helper function to merge detailed capabilities with dashboard-specific ones
function createCapabilities(typeId: number): ArtistTypeCapabilities {
  const detailedCaps = getArtistTypeCapabilities(typeId)

  // Map detailed capabilities to dashboard capabilities
  const showGigAbility = detailedCaps.canPerformLiveGigs || detailedCaps.hasGigPricing
  const showMusicUploads = detailedCaps.canUploadMusic

  // Determine booking mode
  let gigBookingMode: GigBookingMode = 'public'
  if (detailedCaps.isForHire) {
    gigBookingMode = 'collaboration'
  } else if (detailedCaps.canPerformLiveGigs) {
    gigBookingMode = 'public'
  }

  return {
    ...detailedCaps,
    showGigAbility,
    showMusicUploads,
    gigBookingMode
  }
}

export const ARTIST_TYPES: ArtistTypeConfig[] = [
  {
    id: 1,
    name: 'Artist Type 1: Live Gig & Original Recording Artist',
    summary: 'Records original music and performs live gigs.',
    description: 'Record original or licensed music, perform live gigs, and make catalogue available for streaming, charts, and commerce on Gigrilla.',
    groups: [
      {
        id: 'primary-role',
        title: 'Primary configuration',
        required: true,
        minSelect: 1,
        options: ARTIST_TYPE_ONE_SUB_TYPES
      }
    ],
    capabilities: createCapabilities(1)
  },
  {
    id: 2,
    name: 'Artist Type 2: Original Recording Artist',
    summary: 'Records original/licensed music without performing live gigs.',
    description: 'Focus on studio recordings. Music and merchandise are available via Gigrilla, but live gig availability is optional.',
    groups: [
      {
        id: 'primary-role',
        title: 'Primary configuration',
        required: true,
        minSelect: 1,
        options: ARTIST_TYPE_ONE_SUB_TYPES
      }
    ],
    capabilities: createCapabilities(2)
  },
  {
    id: 3,
    name: 'Artist Type 3: Live Gig Artist (Cover, Tribute, Classical, Theatrical)',
    summary: 'Performs live shows but does not release original recordings.',
    description: 'Deliver live performances (covers, tributes, classical, theatrical). Focus on live bookings, ticketing, and merchandise.',
    groups: [
      {
        id: 'primary-role',
        title: 'Act format',
        required: true,
        minSelect: 1,
        options: ARTIST_TYPE_THREE_SUB_TYPES
      }
    ],
    capabilities: createCapabilities(3)
  },
  {
    id: 4,
    name: 'Artist Type 4: Vocalist for Hire',
    summary: 'Provides vocals for sessions, features, and collaborations.',
    description: 'Offer live or studio vocals, collaborate with other artists, and showcase vocal descriptors for discovery.',
    groups: [
      {
        id: 'vocal-role',
        title: 'Vocal services offered',
        helpText: 'Select all vocal services you provide. "All Vocals" covers all options.',
        required: true,
        minSelect: 1,
        options: [
          { id: 'all-vocals', label: 'All Vocals', description: 'I provide all vocal services listed below' },
          { id: 'lead-vocalist', label: 'Lead Vocals', description: 'Primary/featured vocal performances' },
          { id: 'backing-vocalist', label: 'Backing Vocals', description: 'Harmony and support vocals' },
          { id: 'session-vocalist', label: 'Session Vocalist', description: 'Studio recording vocals' },
          { id: 'voiceover-artist', label: 'Voiceover Artist', description: 'Spoken word, narration, voice acting' }
        ]
      },
      {
        id: 'vocal-sound',
        title: 'Sound-based voice descriptors',
        helpText: 'Select descriptors that match your vocal tone and delivery.',
        options: VOCAL_SOUND_DESCRIPTORS
      },
      {
        id: 'vocal-genre',
        title: 'Genre-based vocal descriptors',
        helpText: 'Select genres that suit your vocal style. Choose as many as apply.',
        options: VOCAL_GENRE_DESCRIPTORS
      }
    ],
    capabilities: createCapabilities(4)
  },
  {
    id: 5,
    name: 'Artist Type 5: Instrumentalist for Hire',
    summary: 'Provides live or session instrumentation for collaborations.',
    description: 'Offer instrumental performances for live shows or studio recordings. Showcase instrument groups and families for discovery.',
    groups: [
      {
        id: 'instrument-group',
        title: 'Instrument group',
        required: true,
        minSelect: 1,
        options: TYPE5_INSTRUMENT_GROUP_OPTIONS
      },
      {
        id: 'instrument-specialism',
        title: 'Main instrument family',
        helpText: 'Select the families or specific instruments you specialise in.',
        options: TYPE5_MAIN_INSTRUMENT_FAMILY_OPTIONS
      }
    ],
    capabilities: createCapabilities(5)
  },
  {
    id: 6,
    name: 'Artist Type 6: Songwriter for Hire',
    summary: 'Writes lyrics and/or melodies for artists and media.',
    description: 'Provide songwriting services for recording artists, labels, or other media projects. Specify deliverables and genre focus.',
    groups: [
      {
        id: 'songwriting-focus',
        title: 'Songwriting deliverables',
        required: true,
        minSelect: 1,
        options: SONGWRITER_OPTIONS
      }
    ],
    capabilities: createCapabilities(6)
  },
  {
    id: 7,
    name: 'Artist Type 7: Lyricist for Hire',
    summary: 'Specialises in lyrics for songs across genres.',
    description: 'Craft song lyrics for recording artists, media companies, or collaborative projects. Highlight genre familiarity for matching.',
    groups: [
      {
        id: 'lyricist-focus',
        title: 'Lyric writing preferences',
        required: true,
        minSelect: 1,
        options: [
          { id: 'any-genre', label: 'Any Genre' },
          { id: 'specific-genre', label: 'Specific Genre Families' }
        ]
      }
    ],
    capabilities: createCapabilities(7)
  },
  {
    id: 8,
    name: 'Artist Type 8: Composer for Hire',
    summary: 'Writes musical compositions for artists and media.',
    description: 'Compose original music for recording artists, media productions, and collaborations. Note composition formats and availability.',
    groups: [
      {
        id: 'composer-focus',
        title: 'Composition focus',
        required: true,
        minSelect: 1,
        options: COMPOSER_OPTIONS
      }
    ],
    capabilities: createCapabilities(8)
  }
]

export const DEFAULT_ARTIST_TYPE_ID = 1

export function getArtistTypeConfig(id?: number | null) {
  if (!id) return undefined
  return ARTIST_TYPES.find((type) => type.id === id)
}

// Re-export capabilities helpers for convenience
export { getArtistTypeCapabilities, hasCapability, getArtistTypeName } from '../lib/artist-type-config'

// Helper to get unified capabilities (includes both old and new)
export function getUnifiedCapabilities(id?: number | null): ArtistTypeCapabilities | undefined {
  const config = getArtistTypeConfig(id)
  return config?.capabilities
}
