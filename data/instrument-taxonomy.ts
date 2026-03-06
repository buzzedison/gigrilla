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

// ─── 3-Tier Taxonomy ──────────────────────────────────────────────────────────
// Group → Instrument → Sub-instrument
// Used by the artist profile instrument picker in the dashboard.
// All existing INSTRUMENT_GROUP_SCHEMA exports are preserved for backward compat.

export interface SubInstrument {
  id: string
  label: string
}

export interface Instrument3 {
  id: string
  label: string
  /** Optional: specific variants / playing styles / configurations */
  variants?: SubInstrument[]
}

export interface InstrumentGroup3 {
  id: string
  name: string
  icon: string   // emoji
  instruments: Instrument3[]
}

export const INSTRUMENT_TAXONOMY_3TIER: InstrumentGroup3[] = [
  // ── Vocals ──────────────────────────────────────────────────────────────────
  {
    id: 'vocals',
    name: 'Vocals',
    icon: '🎤',
    instruments: [
      {
        id: 'lead-vocals',
        label: 'Lead Vocals',
        variants: [
          { id: 'contemporary-lead', label: 'Contemporary / Pop Lead Vocals' },
          { id: 'classical-operatic', label: 'Classical / Operatic Lead Vocals' },
          { id: 'gospel-soul-lead', label: 'Gospel / Soul Lead Vocals' },
          { id: 'musical-theatre', label: 'Musical Theatre Vocals' },
          { id: 'jazz-vocals', label: 'Jazz Vocals' },
          { id: 'folk-vocals', label: 'Folk / Traditional Vocals' },
        ]
      },
      {
        id: 'backing-vocals',
        label: 'Backing Vocals',
        variants: [
          { id: 'harmony-bgv', label: 'Harmony / BGV' },
          { id: 'session-backing', label: 'Session Backing Vocals' },
          { id: 'gospel-choir', label: 'Gospel / Choir Backing' },
        ]
      },
      { id: 'rap-mc', label: 'Rap / MC' },
      { id: 'beatbox', label: 'Beatboxing' },
      { id: 'spoken-word', label: 'Spoken Word / Poetry' },
    ]
  },

  // ── String Instruments ───────────────────────────────────────────────────────
  {
    id: 'strings',
    name: 'String Instruments',
    icon: '🎸',
    instruments: [
      {
        id: 'guitar',
        label: 'Guitar',
        variants: [
          { id: 'acoustic-guitar', label: 'Acoustic Guitar' },
          { id: 'electric-guitar', label: 'Electric Guitar' },
          { id: 'classical-nylon-guitar', label: 'Classical / Nylon Guitar' },
          { id: '12-string-guitar', label: '12-String Guitar' },
          { id: 'resonator-guitar', label: 'Resonator / Dobro Guitar' },
          { id: 'lap-steel-guitar', label: 'Lap Steel Guitar' },
          { id: 'baritone-guitar', label: 'Baritone Guitar' },
        ]
      },
      {
        id: 'bass-guitar',
        label: 'Bass Guitar',
        variants: [
          { id: 'electric-bass', label: 'Electric Bass Guitar' },
          { id: 'acoustic-bass', label: 'Acoustic Bass Guitar' },
          { id: 'fretless-bass', label: 'Fretless Bass' },
          { id: '5-string-bass', label: '5-String Bass' },
          { id: '6-string-bass', label: '6-String Bass' },
        ]
      },
      {
        id: 'violin',
        label: 'Violin',
        variants: [
          { id: 'classical-violin', label: 'Classical Violin' },
          { id: 'fiddle-folk', label: 'Fiddle (Folk / Celtic / Country)' },
          { id: 'electric-violin', label: 'Electric Violin' },
        ]
      },
      { id: 'viola', label: 'Viola' },
      {
        id: 'cello',
        label: 'Cello',
        variants: [
          { id: 'classical-cello', label: 'Classical Cello' },
          { id: 'electric-cello', label: 'Electric Cello' },
        ]
      },
      {
        id: 'double-bass',
        label: 'Double Bass',
        variants: [
          { id: 'orchestral-double-bass', label: 'Orchestral Double Bass' },
          { id: 'jazz-upright-bass', label: 'Jazz / Upright Bass' },
        ]
      },
      {
        id: 'banjo',
        label: 'Banjo',
        variants: [
          { id: '5-string-banjo', label: '5-String Banjo (Bluegrass)' },
          { id: '4-string-banjo', label: '4-String / Plectrum Banjo' },
          { id: 'irish-tenor-banjo', label: 'Irish Tenor Banjo' },
        ]
      },
      {
        id: 'mandolin',
        label: 'Mandolin',
        variants: [
          { id: 'bluegrass-mandolin', label: 'Bluegrass Mandolin (F-Style)' },
          { id: 'classical-mandolin', label: 'Classical / Italian Mandolin (A-Style)' },
          { id: 'octave-mandolin', label: 'Octave Mandolin / Mandola' },
        ]
      },
      {
        id: 'ukulele',
        label: 'Ukulele',
        variants: [
          { id: 'soprano-uke', label: 'Soprano Ukulele' },
          { id: 'concert-uke', label: 'Concert Ukulele' },
          { id: 'tenor-uke', label: 'Tenor Ukulele' },
          { id: 'baritone-uke', label: 'Baritone Ukulele' },
        ]
      },
      {
        id: 'harp',
        label: 'Harp',
        variants: [
          { id: 'concert-pedal-harp', label: 'Concert / Pedal Harp' },
          { id: 'celtic-folk-harp', label: 'Celtic / Folk Harp' },
          { id: 'electric-harp', label: 'Electric Harp' },
        ]
      },
      { id: 'sitar', label: 'Sitar' },
      { id: 'lute', label: 'Lute' },
      { id: 'nyckelharpa', label: 'Nyckelharpa' },
      { id: 'zither', label: 'Zither / Autoharp' },
      { id: 'other-strings', label: 'Other String Instrument' },
    ]
  },

  // ── Wind Instruments ─────────────────────────────────────────────────────────
  {
    id: 'wind',
    name: 'Wind Instruments',
    icon: '🎺',
    instruments: [
      {
        id: 'flute',
        label: 'Flute',
        variants: [
          { id: 'concert-flute', label: 'Concert Flute' },
          { id: 'piccolo', label: 'Piccolo' },
          { id: 'alto-flute', label: 'Alto Flute' },
          { id: 'bass-flute', label: 'Bass Flute' },
        ]
      },
      {
        id: 'clarinet',
        label: 'Clarinet',
        variants: [
          { id: 'bb-clarinet', label: 'Bb Clarinet' },
          { id: 'bass-clarinet', label: 'Bass Clarinet' },
          { id: 'eb-clarinet', label: 'Eb Clarinet' },
          { id: 'contrabass-clarinet', label: 'Contrabass Clarinet' },
        ]
      },
      {
        id: 'saxophone',
        label: 'Saxophone',
        variants: [
          { id: 'alto-sax', label: 'Alto Saxophone' },
          { id: 'tenor-sax', label: 'Tenor Saxophone' },
          { id: 'soprano-sax', label: 'Soprano Saxophone' },
          { id: 'baritone-sax', label: 'Baritone Saxophone' },
          { id: 'bass-sax', label: 'Bass Saxophone' },
        ]
      },
      {
        id: 'oboe',
        label: 'Oboe',
        variants: [
          { id: 'oboe-standard', label: 'Oboe' },
          { id: 'cor-anglais', label: 'Cor Anglais / English Horn' },
        ]
      },
      {
        id: 'bassoon',
        label: 'Bassoon',
        variants: [
          { id: 'bassoon-standard', label: 'Bassoon' },
          { id: 'contrabassoon', label: 'Contrabassoon' },
        ]
      },
      {
        id: 'trumpet',
        label: 'Trumpet',
        variants: [
          { id: 'bb-trumpet', label: 'Bb Trumpet' },
          { id: 'flugelhorn', label: 'Flugelhorn' },
          { id: 'piccolo-trumpet', label: 'Piccolo Trumpet' },
          { id: 'cornet', label: 'Cornet' },
        ]
      },
      {
        id: 'trombone',
        label: 'Trombone',
        variants: [
          { id: 'tenor-trombone', label: 'Tenor Trombone' },
          { id: 'bass-trombone', label: 'Bass Trombone' },
          { id: 'alto-trombone', label: 'Alto Trombone' },
        ]
      },
      { id: 'french-horn', label: 'French Horn' },
      {
        id: 'tuba',
        label: 'Tuba',
        variants: [
          { id: 'tuba-standard', label: 'Tuba' },
          { id: 'euphonium', label: 'Euphonium / Baritone Horn' },
        ]
      },
      {
        id: 'harmonica',
        label: 'Harmonica',
        variants: [
          { id: 'diatonic-harmonica', label: 'Diatonic / Blues Harp' },
          { id: 'chromatic-harmonica', label: 'Chromatic Harmonica' },
        ]
      },
      {
        id: 'bagpipes',
        label: 'Bagpipes',
        variants: [
          { id: 'highland-bagpipes', label: 'Scottish Highland Bagpipes' },
          { id: 'uilleann-pipes', label: 'Uilleann Pipes (Irish)' },
          { id: 'smallpipes', label: 'Northumbrian / Border Smallpipes' },
        ]
      },
      { id: 'recorder', label: 'Recorder' },
      { id: 'didgeridoo', label: 'Didgeridoo' },
      { id: 'other-wind', label: 'Other Wind Instrument' },
    ]
  },

  // ── Percussion ───────────────────────────────────────────────────────────────
  {
    id: 'percussion',
    name: 'Percussion',
    icon: '🥁',
    instruments: [
      {
        id: 'drum-kit',
        label: 'Drum Kit',
        variants: [
          { id: 'acoustic-drum-kit', label: 'Acoustic Drum Kit' },
          { id: 'electronic-drum-kit', label: 'Electronic Drum Kit' },
          { id: 'hybrid-drum-kit', label: 'Hybrid Drum Kit' },
          { id: 'jazz-brushes-kit', label: 'Jazz / Brushes Kit' },
        ]
      },
      {
        id: 'hand-percussion',
        label: 'Hand Percussion',
        variants: [
          { id: 'cajon', label: 'Cajón' },
          { id: 'djembe', label: 'Djembe' },
          { id: 'congas', label: 'Congas' },
          { id: 'bongos', label: 'Bongos' },
          { id: 'tabla', label: 'Tabla' },
          { id: 'frame-drum', label: 'Frame Drum / Bodhran' },
          { id: 'darbuka', label: 'Darbuka / Goblet Drum' },
        ]
      },
      {
        id: 'mallet-percussion',
        label: 'Mallet Percussion',
        variants: [
          { id: 'marimba', label: 'Marimba' },
          { id: 'xylophone', label: 'Xylophone' },
          { id: 'vibraphone', label: 'Vibraphone' },
          { id: 'glockenspiel', label: 'Glockenspiel' },
          { id: 'steel-pan', label: 'Steel Pan / Steel Drum' },
        ]
      },
      { id: 'timpani', label: 'Timpani' },
      { id: 'snare-drum', label: 'Snare Drum (Marching / Orchestral)' },
      { id: 'shakers-tambourine', label: 'Shakers, Tambourine & Auxiliary Percussion' },
      { id: 'other-percussion', label: 'Other Percussion' },
    ]
  },

  // ── Keyboard Instruments ─────────────────────────────────────────────────────
  {
    id: 'keyboard',
    name: 'Keyboard Instruments',
    icon: '🎹',
    instruments: [
      {
        id: 'piano',
        label: 'Piano',
        variants: [
          { id: 'grand-piano', label: 'Grand Piano' },
          { id: 'upright-piano', label: 'Upright / Studio Piano' },
          { id: 'electric-piano', label: 'Electric Piano (Rhodes / Wurlitzer)' },
          { id: 'digital-piano', label: 'Digital Piano' },
          { id: 'prepared-piano', label: 'Prepared Piano' },
        ]
      },
      {
        id: 'organ',
        label: 'Organ',
        variants: [
          { id: 'hammond-organ', label: 'Hammond / Tonewheel Organ' },
          { id: 'pipe-organ', label: 'Church / Pipe Organ' },
          { id: 'theatre-organ', label: 'Theatre Organ' },
          { id: 'reed-organ', label: 'Reed Organ / Harmonium' },
        ]
      },
      {
        id: 'accordion',
        label: 'Accordion / Concertina',
        variants: [
          { id: 'piano-accordion', label: 'Piano Accordion' },
          { id: 'button-accordion', label: 'Button Accordion / Diatonic' },
          { id: 'concertina', label: 'Concertina' },
          { id: 'bandoneon', label: 'Bandoneón' },
        ]
      },
      { id: 'harpsichord', label: 'Harpsichord' },
      { id: 'clavichord', label: 'Clavichord' },
      { id: 'celesta', label: 'Celesta' },
      { id: 'melodica', label: 'Melodica' },
    ]
  },

  // ── Electronic / Digital ─────────────────────────────────────────────────────
  {
    id: 'electronic',
    name: 'Electronic & Digital',
    icon: '🎛️',
    instruments: [
      {
        id: 'synthesizer',
        label: 'Synthesizer',
        variants: [
          { id: 'analogue-synth', label: 'Analogue Synthesizer' },
          { id: 'digital-synth', label: 'Digital / VA Synthesizer' },
          { id: 'modular-synth', label: 'Modular Synthesizer' },
          { id: 'software-synth', label: 'Software / VST Synthesizer' },
        ]
      },
      {
        id: 'electronic-keyboard',
        label: 'Electronic Keyboard / MIDI Controller',
        variants: [
          { id: 'stage-piano', label: 'Stage Piano / Workstation' },
          { id: 'midi-controller', label: 'MIDI Controller' },
          { id: 'keytar', label: 'Keytar' },
        ]
      },
      {
        id: 'drum-machine-sequencer',
        label: 'Drum Machine / Sequencer',
        variants: [
          { id: 'hardware-drum-machine', label: 'Hardware Drum Machine' },
          { id: 'groovebox', label: 'Groovebox' },
          { id: 'software-sequencer', label: 'Software / DAW Sequencer' },
        ]
      },
      {
        id: 'sampler',
        label: 'Sampler',
        variants: [
          { id: 'hardware-sampler', label: 'Hardware Sampler (MPC / SP)' },
          { id: 'software-sampler', label: 'Software Sampler / DAW' },
        ]
      },
      {
        id: 'dj-equipment',
        label: 'DJ Equipment',
        variants: [
          { id: 'turntables-vinyl', label: 'Turntables / Vinyl DJ' },
          { id: 'cdj-controller', label: 'CDJ / Digital Controller' },
        ]
      },
      { id: 'theremin', label: 'Theremin' },
      { id: 'other-electronic', label: 'Other Electronic Instrument' },
    ]
  },
]

/**
 * Flat list of all instruments (tier 2) for quick lookup / autocomplete.
 * Format: "Group — Instrument" e.g. "String Instruments — Guitar"
 */
export const ALL_INSTRUMENTS_FLAT: { groupId: string; groupName: string; instrumentId: string; label: string }[] =
  INSTRUMENT_TAXONOMY_3TIER.flatMap(group =>
    group.instruments.map(inst => ({
      groupId: group.id,
      groupName: group.name,
      instrumentId: inst.id,
      label: inst.label
    }))
  )

/**
 * Given a group id and instrument id, return available variants (tier 3).
 * Returns empty array if no variants exist.
 */
export function getInstrumentVariants(groupId: string, instrumentId: string): SubInstrument[] {
  const group = INSTRUMENT_TAXONOMY_3TIER.find(g => g.id === groupId)
  const instrument = group?.instruments.find(i => i.id === instrumentId)
  return instrument?.variants ?? []
}
