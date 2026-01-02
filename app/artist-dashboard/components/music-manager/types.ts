// Types and interfaces for ArtistMusicManager

export interface ReleaseData {
  gtin: string
  gtinConfirmed: boolean
  releaseTitle: string
  releaseTitleConfirmed: boolean
  releaseType: 'single' | 'ep' | 'album' | ''
  trackCount: number
  releaseVersion: string
  applyVersionToAll: boolean
  territoryType: 'home' | 'specific' | 'worldwide' | ''
  selectedTerritories: string[]
  territoryRightsConfirmed: boolean
  goLiveOption: 'past' | 'asap' | 'future' | ''
  goLiveDate: string
  // Master rights
  masterRightsHolder: string
  masterIsni: string
  masterIpiCae: string
  masterRightsConfirmed: boolean
  // Publishing rights
  publishingRightsHolder: string
  publishingIsni: string
  publishingIpiCae: string
  publishingRightsConfirmed: boolean
  // Royalties
  distributorName: string
  distributorConfirmed: boolean
  proName: string
  proConfirmed: boolean
  mcsName: string
  mcsConfirmed: boolean
  // Cover artwork
  coverArtwork: File | null
  coverCaption: string
}

export const initialReleaseData: ReleaseData = {
  gtin: '',
  gtinConfirmed: false,
  releaseTitle: '',
  releaseTitleConfirmed: false,
  releaseType: '',
  trackCount: 1,
  releaseVersion: '',
  applyVersionToAll: false,
  territoryType: '',
  selectedTerritories: [],
  territoryRightsConfirmed: false,
  goLiveOption: '',
  goLiveDate: '',
  masterRightsHolder: '',
  masterIsni: '',
  masterIpiCae: '',
  masterRightsConfirmed: false,
  publishingRightsHolder: '',
  publishingIsni: '',
  publishingIpiCae: '',
  publishingRightsConfirmed: false,
  distributorName: '',
  distributorConfirmed: false,
  proName: '',
  proConfirmed: false,
  mcsName: '',
  mcsConfirmed: false,
  coverArtwork: null,
  coverCaption: ''
}

export const releaseVersionOptions = [
  { value: 'original', label: 'Original' },
  { value: 'remix', label: 'Remix' },
  { value: 'live', label: 'Live' },
  { value: 'acoustic', label: 'Acoustic' },
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'radio-edit', label: 'Radio Edit' },
  { value: 'extended', label: 'Extended' },
  { value: 'remaster', label: 'Remaster' },
  { value: 'demo', label: 'Demo' }
]

export const trackCountOptions = {
  single: [1, 2, 3],
  ep: [4, 5, 6],
  album: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
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
