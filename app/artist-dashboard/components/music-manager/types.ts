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
  coverCaption: ''
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
  isrc: string
  isrcConfirmed: boolean
  iswc: string
  iswcConfirmed: boolean
  isni: string
  isniConfirmed: boolean
  ipiCae: string
  ipiCaeConfirmed: boolean
  explicitContent: boolean
  childSafeContent: 'yes-original' | 'yes-radio-edit' | 'no-adult-themes' | ''
  audioFile: File | null
  audioFileUrl: string
  audioFileSize: number
  audioFormat: string
  lyrics: string
  lyricsFile: File | null
  lyricsFileUrl: string
  durationSeconds: number
  featuredArtists: Array<{ name: string; role: string }>
  writers: Array<{ name: string; role: string; sharePercentage: number }>
  uploaded: boolean
}

export const createTrackData = (trackNumber: number): TrackData => ({
  trackNumber,
  trackTitle: '',
  trackTitleConfirmed: false,
  trackVersion: '',
  isrc: '',
  isrcConfirmed: false,
  iswc: '',
  iswcConfirmed: false,
  isni: '',
  isniConfirmed: false,
  ipiCae: '',
  ipiCaeConfirmed: false,
  explicitContent: false,
  childSafeContent: '',
  audioFile: null,
  audioFileUrl: '',
  audioFileSize: 0,
  audioFormat: '',
  lyrics: '',
  lyricsFile: null,
  lyricsFileUrl: '',
  durationSeconds: 0,
  featuredArtists: [],
  writers: [],
  uploaded: false
})
