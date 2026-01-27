import {
  ArtistTypeCapabilities as DetailedCapabilities,
  getArtistTypeCapabilities
} from '../lib/artist-type-config'

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

const VOCAL_SOUND_DESCRIPTORS: ArtistTypeOption[] = [
  // Classical Voice Types
  { id: 'classical-soprano', label: 'Classical Soprano', group: 'Classical Voice Types' },
  { id: 'classical-mezzo', label: 'Classical Mezzo-Soprano', group: 'Classical Voice Types' },
  { id: 'classical-contralto', label: 'Classical Contralto', group: 'Classical Voice Types' },
  { id: 'classical-countertenor', label: 'Classical Countertenor', group: 'Classical Voice Types' },
  { id: 'classical-tenor', label: 'Classical Tenor', group: 'Classical Voice Types' },
  { id: 'classical-baritone', label: 'Classical Baritone', group: 'Classical Voice Types' },
  { id: 'classical-bass', label: 'Classical Bass', group: 'Classical Voice Types' },
  { id: 'coloratura', label: 'Coloratura', group: 'Classical Voice Types' },
  { id: 'lyric', label: 'Lyric', group: 'Classical Voice Types' },

  // Tonal Quality
  { id: 'deep-bassy', label: 'Deep Bassy', group: 'Tonal Quality' },
  { id: 'high-pitched', label: 'High Pitched', group: 'Tonal Quality' },
  { id: 'bright-voice', label: 'Bright', group: 'Tonal Quality' },
  { id: 'warm', label: 'Warm', group: 'Tonal Quality' },
  { id: 'nasal', label: 'Nasal', group: 'Tonal Quality' },
  { id: 'resonant', label: 'Resonant', group: 'Tonal Quality' },

  // Texture & Smoothness
  { id: 'silky', label: 'Silky', group: 'Texture & Smoothness' },
  { id: 'velvety', label: 'Velvety', group: 'Texture & Smoothness' },
  { id: 'breathy-voice', label: 'Breathy', group: 'Texture & Smoothness' },
  { id: 'soft', label: 'Soft', group: 'Texture & Smoothness' },
  { id: 'mellow', label: 'Mellow', group: 'Texture & Smoothness' },
  { id: 'smoky', label: 'Smoky', group: 'Texture & Smoothness' },

  // Intensity & Power
  { id: 'powerful', label: 'Powerful', group: 'Intensity & Power' },
  { id: 'robust', label: 'Robust', group: 'Intensity & Power' },
  { id: 'dramatic', label: 'Dramatic', group: 'Intensity & Power' },
  { id: 'gritty', label: 'Gritty', group: 'Intensity & Power' },
  { id: 'raspy', label: 'Raspy', group: 'Intensity & Power' },
  { id: 'husky', label: 'Husky', group: 'Intensity & Power' },
  { id: 'edgy', label: 'Edgy', group: 'Intensity & Power' },

  // Character & Emotion
  { id: 'soulful', label: 'Soulful', group: 'Character & Emotion' },
  { id: 'emotional', label: 'Emotional', group: 'Character & Emotion' },
  { id: 'ethereal', label: 'Ethereal', group: 'Character & Emotion' },
  { id: 'haunting', label: 'Haunting', group: 'Character & Emotion' },
  { id: 'whimsical', label: 'Whimsical', group: 'Character & Emotion' },
  { id: 'ballad-voice', label: 'Ballad', group: 'Character & Emotion' },

  // Technique
  { id: 'vibrato', label: 'Vibrato', group: 'Technique' }
]

const VOCAL_GENRE_DESCRIPTORS: ArtistTypeOption[] = [
  // Classical & Theatrical
  { id: 'opera-voice', label: 'Opera', group: 'Classical & Theatrical' },
  { id: 'choral-voice', label: 'Choral', group: 'Classical & Theatrical' },
  { id: 'gregorian-voice', label: 'Gregorian Chant', group: 'Classical & Theatrical' },
  { id: 'classical-crossover', label: 'Classical Crossover', group: 'Classical & Theatrical' },
  { id: 'musical-theatre-voice', label: 'Musical Theatre', group: 'Classical & Theatrical' },
  { id: 'a-cappella', label: 'A Cappella', group: 'Classical & Theatrical' },

  // Contemporary Pop & Rock
  { id: 'pop-voice', label: 'Pop', group: 'Contemporary Pop & Rock' },
  { id: 'rock-voice', label: 'Rock', group: 'Contemporary Pop & Rock' },
  { id: 'indie-voice', label: 'Indie', group: 'Contemporary Pop & Rock' },
  { id: 'alternative-voice', label: 'Alternative', group: 'Contemporary Pop & Rock' },
  { id: 'punk-voice', label: 'Punk', group: 'Contemporary Pop & Rock' },
  { id: 'metal-voice', label: 'Metal', group: 'Contemporary Pop & Rock' },
  { id: 'k-pop-voice', label: 'K-Pop', group: 'Contemporary Pop & Rock' },
  { id: 'electronic-voice', label: 'Electronic', group: 'Contemporary Pop & Rock' },

  // Urban & Soul
  { id: 'hip-hop-voice', label: 'Hip-Hop', group: 'Urban & Soul' },
  { id: 'rnb-voice', label: 'R&B', group: 'Urban & Soul' },
  { id: 'soul-voice', label: 'Soul', group: 'Urban & Soul' },
  { id: 'gospel-voice', label: 'Gospel', group: 'Urban & Soul' },
  { id: 'blues-voice', label: 'Blues', group: 'Urban & Soul' },

  // Jazz & Latin
  { id: 'jazz-voice', label: 'Jazz', group: 'Jazz & Latin' },
  { id: 'latin-voice', label: 'Latin', group: 'Jazz & Latin' },
  { id: 'bossa-nova-voice', label: 'Bossa Nova', group: 'Jazz & Latin' },
  { id: 'samba-voice', label: 'Samba', group: 'Jazz & Latin' },

  // World & Traditional
  { id: 'reggae-voice', label: 'Reggae', group: 'World & Traditional' },
  { id: 'country-voice', label: 'Country', group: 'World & Traditional' },
  { id: 'folk-voice', label: 'Folk', group: 'World & Traditional' },
  { id: 'flamenco-voice', label: 'Flamenco', group: 'World & Traditional' },
  { id: 'fado-voice', label: 'Fado', group: 'World & Traditional' },

  // Asian & Middle Eastern
  { id: 'hindustani-classical-voice', label: 'Hindustani Classical', group: 'Asian & Middle Eastern' },
  { id: 'qawwali-voice', label: 'Qawwali', group: 'Asian & Middle Eastern' },
  { id: 'arabic-voice', label: 'Arabic', group: 'Asian & Middle Eastern' },
  { id: 'bhangra-voice', label: 'Bhangra', group: 'Asian & Middle Eastern' },
  { id: 'kabuki-voice', label: 'Kabuki', group: 'Asian & Middle Eastern' },
  { id: 'enka-voice', label: 'Enka', group: 'Asian & Middle Eastern' },

  // African & Specialized
  { id: 'taarab-voice', label: 'Taarab', group: 'African & Specialized' },
  { id: 'throat-singing', label: 'Throat Singing', group: 'African & Specialized' },
  { id: 'yodel-voice', label: 'Yodel', group: 'African & Specialized' }
]

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
        options: [
          { id: 'strings', label: 'String Instruments' },
          { id: 'wind', label: 'Wind Instruments' },
          { id: 'brass', label: 'Brass Instruments' },
          { id: 'percussion', label: 'Percussion Instruments' },
          { id: 'keyboards', label: 'Keyboard Instruments' },
          { id: 'electronic', label: 'Electronic Instruments' }
        ]
      },
      {
        id: 'instrument-specialism',
        title: 'Main instrument family',
        helpText: 'Select the families or specific instruments you specialise in.',
        options: [
          { id: 'guitar', label: 'Guitar & Variants' },
          { id: 'bass-guitar', label: 'Bass Guitar & Variants' },
          { id: 'violin', label: 'Violin / Viola / Cello / Double Bass' },
          { id: 'harp', label: 'Harps & Zithers' },
          { id: 'woodwinds', label: 'Woodwinds (Flute, Clarinet, Saxophone, etc.)' },
          { id: 'brass-section', label: 'Brass (Trumpet, Trombone, Tuba, etc.)' },
          { id: 'drum-kit', label: 'Drum Kit' },
          { id: 'hand-percussion', label: 'Hand Percussion & World Percussion' },
          { id: 'mallet-percussion', label: 'Mallet Percussion' },
          { id: 'piano', label: 'Piano & Classical Keyboards' },
          { id: 'organ', label: 'Organs & Harmoniums' },
          { id: 'synthesiser', label: 'Synthesiser / Electronic Keys' },
          { id: 'sampler', label: 'Sampler / Drum Machine / Sequencer' }
        ]
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
