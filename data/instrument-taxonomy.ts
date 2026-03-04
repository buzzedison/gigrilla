export interface InstrumentGroupSchema {
  id: string
  name: string
  allLabel: string
  families: string[]
}

export const INSTRUMENT_GROUP_SCHEMA: InstrumentGroupSchema[] = [
  {
    id: 'strings',
    name: 'String Instruments',
    allLabel: 'All String Instruments',
    families: [
      'Banjo',
      'Bass Guitar',
      'Cello',
      'Double Bass',
      'Guitar',
      'Harp',
      'Lute',
      'Mandolin',
      'Nyckelharpa',
      'Phonofiddle',
      'Sitar',
      'Ukulele',
      'Viola',
      'Violin',
      'Zither'
    ]
  },
  {
    id: 'wind',
    name: 'Wind Instruments',
    allLabel: 'All Wind Instruments',
    families: [
      'Alboka',
      'Clarinet',
      'Didgeridoo',
      'Flute',
      'Harmonica',
      'Jaw Harp',
      'Kazoo',
      'Kubing',
      'Lur',
      'Nose Flute',
      'Oboe',
      'Recorder',
      'Saxophone',
      'Shawm',
      'Triton Shell',
      'Vuvuzela',
      'Whistle',
      'Xun'
    ]
  },
  {
    id: 'percussion',
    name: 'Percussion Instruments',
    allLabel: 'All Percussion Instruments',
    families: [
      'Drum Set',
      'Hand Drums',
      'Mallet Percussion',
      'Metal Percussion',
      'Cowbell',
      'Shakers',
      'Misc. Percussion'
    ]
  },
  {
    id: 'keyboard',
    name: 'Keyboard Instruments',
    allLabel: 'All Keyboard Instruments',
    families: [
      'Accordion',
      'Celesta',
      'Clavichord',
      'Harpsichord',
      'Melodica',
      'Organ',
      'Piano'
    ]
  },
  {
    id: 'electronic',
    name: 'Electronic Instruments',
    allLabel: 'All Electronic Instruments',
    families: [
      'Electronic Keyboard',
      'Sampler',
      'Synthesizer'
    ]
  }
]

export interface InstrumentGroupList {
  id: string
  name: string
  items: string[]
}

export const CREW_INSTRUMENT_ROLE_GROUPS: InstrumentGroupList[] = INSTRUMENT_GROUP_SCHEMA.map((group) => ({
  id: group.id,
  name: group.name,
  items: [group.allLabel, ...group.families]
}))

export const AUDITION_INSTRUMENT_GROUPS: InstrumentGroupList[] = [
  ...INSTRUMENT_GROUP_SCHEMA.map((group) => ({
    id: group.id,
    name: group.name,
    items: [...group.families]
  })),
  {
    id: 'other',
    name: 'Other',
    items: ['Other']
  }
]

export interface Type5InstrumentOption {
  id: string
  label: string
}

export const TYPE5_INSTRUMENT_GROUP_OPTIONS: Type5InstrumentOption[] = [
  { id: 'strings', label: 'String Instruments' },
  { id: 'wind', label: 'Wind Instruments' },
  { id: 'percussion', label: 'Percussion Instruments' },
  // Keep legacy key used by existing stored selections.
  { id: 'keyboards', label: 'Keyboard Instruments' },
  { id: 'electronic', label: 'Electronic Instruments' }
]

export const TYPE5_MAIN_INSTRUMENT_FAMILY_OPTIONS: Type5InstrumentOption[] = [
  { id: 'guitar', label: 'Guitar & Variants' },
  { id: 'bass-guitar', label: 'Bass Guitar & Variants' },
  { id: 'violin', label: 'Violin / Viola / Cello / Double Bass' },
  { id: 'harp', label: 'Harps & Zithers' },
  { id: 'woodwinds', label: 'Woodwinds (Flute, Clarinet, Saxophone, etc.)' },
  { id: 'drum-kit', label: 'Drum Kit' },
  { id: 'hand-percussion', label: 'Hand Percussion & World Percussion' },
  { id: 'mallet-percussion', label: 'Mallet Percussion' },
  { id: 'piano', label: 'Piano & Classical Keyboards' },
  { id: 'organ', label: 'Organs & Harmoniums' },
  { id: 'synthesiser', label: 'Synthesiser / Electronic Keys' },
  { id: 'sampler', label: 'Sampler / Drum Machine / Sequencer' }
]
