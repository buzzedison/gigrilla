export type GigBookingMode = 'public' | 'collaboration' | 'both'

export interface ArtistTypeOption {
  id: string
  label: string
  description?: string
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

export interface ArtistTypeCapabilities {
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
  { id: 'ballad-voice', label: 'Ballad Voice' },
  { id: 'breathy-voice', label: 'Breathy Voice' },
  { id: 'bright-voice', label: 'Bright Voice' },
  { id: 'classical-baritone', label: 'Classical Baritone Voice' },
  { id: 'classical-bass', label: 'Classical Bass Voice' },
  { id: 'classical-contralto', label: 'Classical Contralto Voice' },
  { id: 'classical-countertenor', label: 'Classical Countertenor Voice' },
  { id: 'classical-mezzo', label: 'Classical Mezzo-Soprano Voice' },
  { id: 'classical-soprano', label: 'Classical Soprano Voice' },
  { id: 'classical-tenor', label: 'Classical Tenor Voice' },
  { id: 'coloratura', label: 'Coloratura Voice' },
  { id: 'deep-bassy', label: 'Deep Bassy Voice' },
  { id: 'dramatic', label: 'Dramatic Voice' },
  { id: 'edgy', label: 'Edgy Voice' },
  { id: 'emotional', label: 'Emotional Voice' },
  { id: 'ethereal', label: 'Ethereal Voice' },
  { id: 'gritty', label: 'Gritty Voice' },
  { id: 'haunting', label: 'Haunting Voice' },
  { id: 'high-pitched', label: 'High Pitched Voice' },
  { id: 'husky', label: 'Husky Voice' },
  { id: 'lyric', label: 'Lyric Voice' },
  { id: 'mellow', label: 'Mellow Voice' },
  { id: 'nasal', label: 'Nasal Voice' },
  { id: 'powerful', label: 'Powerful Voice' },
  { id: 'raspy', label: 'Raspy Voice' },
  { id: 'resonant', label: 'Resonant Voice' },
  { id: 'robust', label: 'Robust Voice' },
  { id: 'silky', label: 'Silky Voice' },
  { id: 'smoky', label: 'Smoky Voice' },
  { id: 'soft', label: 'Soft Voice' },
  { id: 'soulful', label: 'Soulful Voice' },
  { id: 'velvety', label: 'Velvety Voice' },
  { id: 'vibrato', label: 'Vibrato Voice' },
  { id: 'warm', label: 'Warm Voice' },
  { id: 'whimsical', label: 'Whimsical Voice' }
]

const VOCAL_GENRE_DESCRIPTORS: ArtistTypeOption[] = [
  { id: 'a-cappella', label: 'A Cappella Voice' },
  { id: 'alternative-voice', label: 'Alternative Voice' },
  { id: 'arabic-voice', label: 'Arabic Voice' },
  { id: 'blues-voice', label: 'Blues Voice' },
  { id: 'bhangra-voice', label: 'Bhangra Voice' },
  { id: 'bossa-nova-voice', label: 'Bossa Nova Voice' },
  { id: 'choral-voice', label: 'Choral Voice' },
  { id: 'classical-crossover', label: 'Classical Crossover Voice' },
  { id: 'country-voice', label: 'Country Voice' },
  { id: 'electronic-voice', label: 'Electronic Voice' },
  { id: 'enka-voice', label: 'Enka Voice' },
  { id: 'fado-voice', label: 'Fado Voice' },
  { id: 'flamenco-voice', label: 'Flamenco Voice' },
  { id: 'folk-voice', label: 'Folk Voice' },
  { id: 'gospel-voice', label: 'Gospel Voice' },
  { id: 'gregorian-voice', label: 'Gregorian Chant Voice' },
  { id: 'hip-hop-voice', label: 'Hip-Hop Voice' },
  { id: 'hindustani-classical-voice', label: 'Hindustani Classical Voice' },
  { id: 'indie-voice', label: 'Indie Voice' },
  { id: 'jazz-voice', label: 'Jazz Voice' },
  { id: 'k-pop-voice', label: 'K-Pop Voice' },
  { id: 'kabuki-voice', label: 'Kabuki Voice' },
  { id: 'latin-voice', label: 'Latin Voice' },
  { id: 'metal-voice', label: 'Metal Voice' },
  { id: 'musical-theatre-voice', label: 'Musical Theatre Voice' },
  { id: 'opera-voice', label: 'Opera Voice' },
  { id: 'pop-voice', label: 'Pop Voice' },
  { id: 'punk-voice', label: 'Punk Voice' },
  { id: 'qawwali-voice', label: 'Qawwali Voice' },
  { id: 'rnb-voice', label: 'R&B Voice' },
  { id: 'reggae-voice', label: 'Reggae Voice' },
  { id: 'rock-voice', label: 'Rock Voice' },
  { id: 'samba-voice', label: 'Samba Voice' },
  { id: 'soul-voice', label: 'Soul Voice' },
  { id: 'taarab-voice', label: 'Taarab Voice' },
  { id: 'throat-singing', label: 'Throat Singing Voice' },
  { id: 'yodel-voice', label: 'Yodel Voice' }
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
    capabilities: {
      showGigAbility: true,
      showMusicUploads: true,
      gigBookingMode: 'public'
    }
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
    capabilities: {
      showGigAbility: false,
      showMusicUploads: true,
      gigBookingMode: 'public'
    }
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
    capabilities: {
      showGigAbility: true,
      showMusicUploads: false,
      gigBookingMode: 'public'
    }
  },
  {
    id: 4,
    name: 'Artist Type 4: Vocalist for Hire',
    summary: 'Provides vocals for sessions, features, and collaborations.',
    description: 'Offer live or studio vocals, collaborate with other artists, and showcase vocal descriptors for discovery.',
    groups: [
      {
        id: 'vocal-role',
        title: 'Primary vocal role',
        required: true,
        minSelect: 1,
        options: [
          { id: 'lead-vocalist', label: 'Lead / Featured Vocalist' },
          { id: 'backing-vocalist', label: 'Backing Vocalist' },
          { id: 'session-vocalist', label: 'Session / Recording Vocalist' },
          { id: 'choir-vocalist', label: 'Choir / Ensemble Vocalist' }
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
    capabilities: {
      showGigAbility: true,
      showMusicUploads: false,
      gigBookingMode: 'collaboration'
    }
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
    capabilities: {
      showGigAbility: true,
      showMusicUploads: false,
      gigBookingMode: 'collaboration'
    }
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
    capabilities: {
      showGigAbility: true,
      showMusicUploads: false,
      gigBookingMode: 'collaboration'
    }
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
    capabilities: {
      showGigAbility: true,
      showMusicUploads: false,
      gigBookingMode: 'collaboration'
    }
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
    capabilities: {
      showGigAbility: true,
      showMusicUploads: false,
      gigBookingMode: 'collaboration'
    }
  }
]

export const DEFAULT_ARTIST_TYPE_ID = 1

export function getArtistTypeConfig(id?: number | null) {
  if (!id) return undefined
  return ARTIST_TYPES.find((type) => type.id === id)
}


