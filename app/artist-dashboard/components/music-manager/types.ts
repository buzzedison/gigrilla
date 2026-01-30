// Types and interfaces for ArtistMusicManager

export interface TerritorySelection {
  home: boolean
  specific: boolean
  worldwide: boolean
  specificList: string[]
}

export interface RecordLabelEntry {
  id: string
  name: string
  contactName: string
  contactEmail: string
  confirmed: boolean
  territories: TerritorySelection
}

export interface PublisherEntry {
  id: string
  name: string
  contactName: string
  contactEmail: string
  confirmed: boolean
  territories: TerritorySelection
}

export interface ReleaseData {
  upc: string
  upcConfirmed: boolean
  ean: string
  eanConfirmed: boolean
  releaseTitle: string
  releaseTitleConfirmed: boolean
  releaseTitleSource: 'gtin' | 'manual'
  releaseType: 'single' | 'ep' | 'album' | ''
  trackCount: number
  trackCountLabel: string
  releaseVersion: string
  applyVersionToAll: boolean
  countryOfOrigin: string
  availableHome: boolean
  availableSpecific: boolean
  availableWorldwide: boolean
  specificTerritories: string[]
  territoryRightsConfirmed: boolean
  goLiveOption: 'past' | 'asap' | 'future' | ''
  goLiveDate: string
  masterRightsType: 'independent' | 'label' | ''
  recordLabels: RecordLabelEntry[]
  masterRightsConfirmed: boolean
  publishingRightsType: 'independent' | 'publisher' | ''
  publishers: PublisherEntry[]
  applyPublisherToAllTracks: boolean
  publishingRightsConfirmed: boolean
  distributorName: string
  distributorConfirmed: boolean
  distributorContactName: string
  distributorContactEmail: string
  wroteComposition: boolean
  proName: string
  proConfirmed: boolean
  proContactName: string
  proContactEmail: string
  mcsName: string
  mcsConfirmed: boolean
  mcsContactName: string
  mcsContactEmail: string
  coverArtwork: File | string | null // File during selection, string URL after upload
  coverArtworkUrl?: string // R2 URL after upload
  coverCaption: string
  // Submission Ts&Cs & digital signature (required for pending_review)
  agreeTermsOfUse: boolean
  agreeDistributionPolicy: boolean
  agreePrivacyPolicy: boolean
  confirmDetailsTrue: boolean
  confirmLegalLiability: boolean
  confirmNoOtherArtistName: boolean
  signatoryRole: 'owner' | 'representative' | ''
  signatoryFirstName: string
  signatoryMiddleNames: string
  signatoryLastName: string
  signatoryEmail: string
}

const emptyTerritorySelection: TerritorySelection = {
  home: false,
  specific: false,
  worldwide: false,
  specificList: []
}

export const createRecordLabelEntry = (): RecordLabelEntry => ({
  id: crypto.randomUUID(),
  name: '',
  contactName: '',
  contactEmail: '',
  confirmed: false,
  territories: { ...emptyTerritorySelection }
})

export const createPublisherEntry = (): PublisherEntry => ({
  id: crypto.randomUUID(),
  name: '',
  contactName: '',
  contactEmail: '',
  confirmed: false,
  territories: { ...emptyTerritorySelection }
})

export const initialReleaseData: ReleaseData = {
  upc: '',
  upcConfirmed: false,
  ean: '',
  eanConfirmed: false,
  releaseTitle: '',
  releaseTitleConfirmed: false,
  releaseTitleSource: 'gtin',
  releaseType: '',
  trackCount: 1,
  trackCountLabel: '',
  releaseVersion: 'original-studio',
  applyVersionToAll: false,
  countryOfOrigin: '',
  availableHome: false,
  availableSpecific: false,
  availableWorldwide: false,
  specificTerritories: [],
  territoryRightsConfirmed: false,
  goLiveOption: '',
  goLiveDate: '',
  masterRightsType: '',
  recordLabels: [createRecordLabelEntry()],
  masterRightsConfirmed: false,
  publishingRightsType: '',
  publishers: [createPublisherEntry()],
  applyPublisherToAllTracks: false,
  publishingRightsConfirmed: false,
  distributorName: '',
  distributorConfirmed: false,
  distributorContactName: '',
  distributorContactEmail: '',
  wroteComposition: true,
  proName: '',
  proConfirmed: false,
  proContactName: '',
  proContactEmail: '',
  mcsName: '',
  mcsConfirmed: false,
  mcsContactName: '',
  mcsContactEmail: '',
  coverArtwork: null,
  coverArtworkUrl: '',
  coverCaption: '',
  agreeTermsOfUse: false,
  agreeDistributionPolicy: false,
  agreePrivacyPolicy: false,
  confirmDetailsTrue: false,
  confirmLegalLiability: false,
  confirmNoOtherArtistName: false,
  signatoryRole: '',
  signatoryFirstName: '',
  signatoryMiddleNames: '',
  signatoryLastName: '',
  signatoryEmail: ''
}

export const releaseVersionOptions = [
  { value: 'original-studio', label: 'Original Studio Version (Default)' },
  { value: 'acoustic', label: 'Acoustic Version' },
  { value: 'child-safe', label: 'Child-Safe Version' },
  { value: 'deluxe', label: 'Deluxe Edition' },
  { value: 'demo', label: 'Demo Version' },
  { value: 'extended', label: 'Extended Version' },
  { value: 'radio-edit', label: 'Radio Edit' },
  { value: 'remastered', label: 'Remastered Version' },
  { value: 'remix', label: 'Remix Version' },
  { value: 'instrumental', label: 'Instrumental Version' },
  { value: 'live', label: 'Live Version' },
  { value: 'other', label: 'Other' }
]

export interface TrackCountOption {
  value: number
  label: string
}

export const trackCountOptions: Record<'single' | 'ep' | 'album', TrackCountOption[]> = {
  single: [
    { value: 1, label: '1 Track Single' },
    { value: 2, label: '2 Track Single' },
    { value: 3, label: '3 Track Single' }
  ],
  ep: [
    { value: 4, label: '4 Track EP' },
    { value: 5, label: '5 Track EP' },
    { value: 6, label: '6 Track EP' }
  ],
  album: [
    { value: 1, label: '1 Track Album (>30 mins)' },
    { value: 2, label: '2 Track Album (>30 mins)' },
    { value: 3, label: '3 Track Album (>30 mins)' },
    { value: 4, label: '4 Track Album (>30 mins)' },
    { value: 5, label: '5 Track Album (>30 mins)' },
    { value: 6, label: '6 Track Album (>30 mins)' },
    ...Array.from({ length: 44 }, (_, index) => {
      const trackNumber = index + 7
      return { value: trackNumber, label: `${trackNumber} Track Album` }
    })
  ]
}

export const territoryOptions = [
  { value: 'north-america', label: 'North America' },
  { value: 'south-america', label: 'South America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'africa', label: 'Africa' },
  { value: 'oceania', label: 'Oceania' },
  { value: 'middle-east', label: 'Middle East' }
]

export const countryOptions = [
  { value: 'united-kingdom', label: 'United Kingdom' },
  { value: 'united-states', label: 'United States' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'brazil', label: 'Brazil' },
  { value: 'south-africa', label: 'South Africa' },
  { value: 'japan', label: 'Japan' }
]

// Shared UI components
export interface InfoBoxProps {
  title: string
  children: React.ReactNode
  variant?: 'info' | 'warning' | 'success'
}

export interface IdCodeCardProps {
  title: string
  description: string
  learnMoreUrl: string
  examples?: string[]
}

// Track-related types
export interface TrackData {
  id?: string
  trackNumber: number
  trackTitle: string
  trackTitleConfirmed: boolean
  trackVersion: string
  masterRecordingDate: string // Month & Year
  isrc: string
  isrcConfirmed: boolean
  iswc: string
  iswcConfirmed: boolean
  musicalWorkTitle: string
  musicalWorkTitleConfirmed: boolean
  // Primary Artists
  primaryArtists: Array<{
    id: string
    name: string
    isni: string
    confirmed: boolean
  }>
  // Featured Artists
  featuredArtists: Array<{
    id: string
    name: string
    isni: string
    confirmed: boolean
  }>
  // Session Artists
  sessionArtists: Array<{
    id: string
    name: string
    isni: string
    roles: string[]
    confirmed: boolean
  }>
  // Songwriting Team (Creators)
  creators: Array<{
    id: string
    name: string
    isni: string
    ipiCae: string
    roles: string[] // Composer, Lyricist, Songwriter
    confirmed: boolean
  }>
  // Production Team
  producers: Array<{
    id: string
    name: string
    isni: string
    ipiCae: string
    roles: string[] // Arranger/Adaptor, Instrument Technician, Mixing & Mastering, Producer, Sound Engineer
    confirmed: boolean
  }>
  // Rights
  coverRights: 'no-original' | 'yes-licensed' | 'yes-compulsory' | ''
  coverLicenseUrl: string
  remixRights: 'no-original' | 'yes-authorized' | 'yes-unauthorized' | ''
  remixAuthorizationUrl: string
  samplesRights: 'no-original' | 'yes-cleared' | 'yes-uncleared' | ''
  samplesClearanceUrl: string
  // Tags
  primaryGenre: {
    familyId: string
    mainGenres: Array<{ id: string; subGenres: string[] }>
  }
  secondaryGenre: {
    familyId: string
    mainGenres: Array<{ id: string; subGenres: string[] }>
  }
  primaryMood: string
  secondaryMoods: string[]
  primaryLanguage: string
  secondaryLanguage: string
  explicitContent: 'no-clean-original' | 'no-clean-radio-edit' | 'yes-explicit' | ''
  childSafeContent: 'yes-original' | 'yes-radio-edit' | 'no-adult-themes' | ''
  // Upload
  audioFile: File | null
  audioFileUrl: string
  audioFileSize: number
  audioFormat: string
  dolbyAtmosFileUrl: string
  previewStartTime: number // seconds for 30sFP
  lyrics: string
  lyricsConfirmed: boolean
  lyricsFile: File | null
  lyricsFileUrl: string
  videoUrl: string
  videoUrlConfirmed: boolean
  durationSeconds: number
  uploaded: boolean
}

export const createTrackData = (trackNumber: number): TrackData => ({
  trackNumber,
  trackTitle: '',
  trackTitleConfirmed: false,
  trackVersion: '',
  masterRecordingDate: '',
  isrc: '',
  isrcConfirmed: false,
  iswc: '',
  iswcConfirmed: false,
  musicalWorkTitle: '',
  musicalWorkTitleConfirmed: false,
  primaryArtists: [],
  featuredArtists: [],
  sessionArtists: [],
  creators: [],
  producers: [],
  coverRights: '',
  coverLicenseUrl: '',
  remixRights: '',
  remixAuthorizationUrl: '',
  samplesRights: '',
  samplesClearanceUrl: '',
  primaryGenre: { familyId: '', mainGenres: [] },
  secondaryGenre: { familyId: '', mainGenres: [] },
  primaryMood: '',
  secondaryMoods: [],
  primaryLanguage: '',
  secondaryLanguage: '',
  explicitContent: '',
  childSafeContent: '',
  audioFile: null,
  audioFileUrl: '',
  audioFileSize: 0,
  audioFormat: '',
  dolbyAtmosFileUrl: '',
  previewStartTime: 0,
  lyrics: '',
  lyricsConfirmed: false,
  lyricsFile: null,
  lyricsFileUrl: '',
  videoUrl: '',
  videoUrlConfirmed: false,
  durationSeconds: 0,
  uploaded: false
})

// Mood options
export const moodOptions = [
  { value: '', label: 'None Selected (Default)' },
  { value: 'angry', label: 'Angry' },
  { value: 'break-up', label: 'Break-up' },
  { value: 'chilled', label: 'Chilled' },
  { value: 'euphoric', label: 'Euphoric' },
  { value: 'feel-good', label: 'Feel-good' },
  { value: 'focus', label: 'Focus' },
  { value: 'happy', label: 'Happy' },
  { value: 'loss', label: 'Loss' },
  { value: 'loved-up', label: 'Loved-up' },
  { value: 'meditation', label: 'Meditation' },
  { value: 'motivational', label: 'Motivational' },
  { value: 'party', label: 'Party' },
  { value: 'reflective', label: 'Reflective' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'sleepy', label: 'Sleepy' },
  { value: 'sad', label: 'Sad' },
  { value: 'up-beat', label: 'Up-beat' },
  { value: 'workout-energy', label: 'Workout Energy' },
  { value: 'other', label: 'Other' }
]

// Language options (simplified - would need full list)
export const languageOptions = [
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'mandarin', label: 'Mandarin' },
  { value: 'other', label: 'Other' }
]

// Role options for creators
export const creatorRoleOptions = [
  { value: 'composer', label: 'Composer' },
  { value: 'lyricist', label: 'Lyricist' },
  { value: 'songwriter', label: 'Songwriter' }
]

// Role options for producers
export const producerRoleOptions = [
  { value: 'arranger-adaptor', label: 'Arranger/Adaptor' },
  { value: 'instrument-technician', label: 'Instrument Technician' },
  { value: 'mixing-mastering', label: 'Mixing & Mastering' },
  { value: 'producer', label: 'Producer' },
  { value: 'sound-engineer', label: 'Sound Engineer' }
]

// Role options for session artists
export const sessionArtistRoleOptions = [
  { value: 'backing-vocals', label: 'Backing Vocals' },
  { value: 'electronic-instruments', label: 'Electronic Instruments' },
  { value: 'keyboard-instruments', label: 'Keyboard Instruments' },
  { value: 'percussion-instruments', label: 'Percussion Instruments' },
  { value: 'string-instruments', label: 'String Instruments' },
  { value: 'wind-instruments', label: 'Wind Instruments' }
]
