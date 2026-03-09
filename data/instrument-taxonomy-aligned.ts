/**
 * ============================================================================
 * INSTRUMENT TAXONOMY - ALIGNED WITH NOTION "ARTIST TYPE 5" SOURCE
 * ============================================================================
 *
 * This file provides the complete instrument taxonomy matching the Notion specification.
 *
 * Structure:
 * - Instrument Group (e.g., "String Instruments")
 *   - "All [Group] Instruments" option (at top)
 *   - Main Instrument Family (e.g., "Banjo", "Guitar", "Violin")
 *     - Specific Instrument Variants (e.g., "5-String Banjo", "Flamenco Guitar")
 *   - "Other [Group] Instrument" option (at bottom, triggers manual follow-up)
 *
 * Usage:
 * - Instrumentalists (Type 5) select from this hierarchy
 * - Artist members/crew can also use this taxonomy
 * - Database stores selections as: "groupId:instrumentId:variantId" format
 */

export interface InstrumentVariant {
  id: string
  label: string
}

export interface InstrumentFamily {
  id: string
  label: string
  /** If undefined, this instrument has no variants and is selected directly */
  variants?: InstrumentVariant[]
}

export interface InstrumentGroup {
  id: string
  label: string
  /** Displayed at the top of the group - selects all instruments in this group */
  allOptionLabel: string
  /** Main instrument families within this group */
  families: InstrumentFamily[]
  /** Displayed at the bottom - triggers alert to ops for missing instruments */
  otherOptionLabel: string
}

/**
 * ============================================================================
 * COMPLETE INSTRUMENT TAXONOMY - ALIGNED WITH NOTION
 * ============================================================================
 */
export const INSTRUMENT_TAXONOMY_NOTION_ALIGNED: InstrumentGroup[] = [
  // ────────────────────────────────────────────────────────────────────────
  // STRING INSTRUMENTS
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'string',
    label: 'String Instruments',
    allOptionLabel: 'All String Instruments',
    otherOptionLabel: 'Other String Instrument',
    families: [
      {
        id: 'banjo',
        label: 'Banjo',
        variants: [
          { id: '4-string-banjo', label: '4-String Banjo' },
          { id: '5-string-banjo', label: '5-String Banjo' },
          { id: '6-string-banjo', label: '6-String Banjo' },
          { id: 'banjo-ukulele', label: 'Banjo Ukulele' },
          { id: 'bass-banjo', label: 'Bass Banjo' },
          { id: 'bluegrass-banjo', label: 'Bluegrass Banjo' },
          { id: 'cello-banjo', label: 'Cello Banjo' },
          { id: 'clawhammer-banjo', label: 'Clawhammer Banjo' },
          { id: 'electric-banjo', label: 'Electric Banjo' },
          { id: 'fretless-banjo', label: 'Fretless Banjo' },
          { id: 'guitar-banjo', label: 'Guitar Banjo' },
          { id: 'long-neck-banjo', label: 'Long Neck Banjo' },
          { id: 'minstrel-banjo', label: 'Minstrel Banjo' },
          { id: 'piccolo-banjo', label: 'Piccolo Banjo' },
          { id: 'tenor-banjo', label: 'Tenor Banjo' },
          { id: 'tiple-banjo', label: 'Tiple Banjo' },
          { id: 'zither-banjo', label: 'Zither Banjo' },
        ]
      },
      {
        id: 'bass-guitar',
        label: 'Bass Guitar',
        variants: [
          { id: '5-string-bass', label: '5-String Bass Guitar' },
          { id: '6-string-bass', label: '6-String Bass Guitar' },
          { id: '8-string-bass', label: '8-String Bass Guitar' },
          { id: '12-string-bass', label: '12-String Bass Guitar' },
          { id: 'acoustic-bass', label: 'Acoustic Bass Guitar' },
          { id: 'acoustic-electric-bass', label: 'Acoustic-Electric Bass Guitar' },
          { id: 'baritone-bass', label: 'Baritone Bass Guitar' },
          { id: 'electric-bass', label: 'Electric Bass Guitar' },
          { id: 'electric-upright-bass', label: 'Electric Upright Bass' },
          { id: 'extended-range-bass', label: 'Extended-Range Bass Guitar' },
          { id: 'fretless-bass', label: 'Fretless Bass Guitar' },
          { id: 'hollow-body-bass', label: 'Hollow-Body Bass Guitar' },
          { id: 'micro-bass', label: 'Micro Bass (U-Bass)' },
          { id: 'multi-scale-bass', label: 'Multi-Scale (Fanned-Fret) Bass Guitar' },
          { id: 'piccolo-bass', label: 'Piccolo Bass Guitar' },
          { id: 'semi-hollow-bass', label: 'Semi-Hollow Bass Guitar' },
          { id: 'short-scale-bass', label: 'Short-Scale Bass Guitar' },
          { id: 'standard-bass', label: 'Standard Bass Guitar' },
          { id: 'tenor-bass', label: 'Tenor Bass Guitar' },
        ]
      },
      {
        id: 'cello',
        label: 'Cello',
        variants: [
          { id: 'cello-piccolo', label: 'Cello Piccolo' },
          { id: 'contrabass-cello', label: 'Contrabass Cello' },
          { id: 'damore-cello', label: "D'Amore Cello" },
          { id: 'electric-cello', label: 'Electric Cello' },
          { id: 'grande-cello', label: 'Grande Cello' },
          { id: 'octobass', label: 'Octobass' },
          { id: 'quintone', label: 'Quintone' },
          { id: 'semi-acoustic-cello', label: 'Semi-Acoustic Cello' },
          { id: 'tenor-violoncello', label: 'Tenor Violoncello' },
          { id: 'violina-di-bordone', label: 'Violina di Bordone' },
          { id: 'violoncello-piccolo', label: 'Violoncello Piccolo' },
        ]
      },
      {
        id: 'double-bass',
        label: 'Double Bass',
        variants: [
          { id: '5-string-double-bass', label: '5-String Double Bass' },
          { id: 'acoustic-double-bass', label: 'Acoustic Double Bass' },
          { id: 'contrabass', label: 'Contrabass' },
          { id: 'contrabass-viol', label: 'Contrabass Viol' },
          { id: 'double-bass-violin', label: 'Double Bass Violin' },
          { id: 'electric-double-bass', label: 'Electric Double Bass' },
          { id: 'g-violone', label: 'G Violone' },
          { id: 'great-bass-viol', label: 'Great Bass Viol' },
          { id: 'piccolo-double-bass', label: 'Piccolo Double Bass' },
          { id: 'quartbass-viol', label: 'Quartbass Viol' },
          { id: 'semi-acoustic-double-bass', label: 'Semi-Acoustic Double Bass' },
          { id: 'sub-bass-viol', label: 'Sub-Bass Viol' },
          { id: 'subcontrabass', label: 'Subcontrabass' },
          { id: 'subcontrabass-viol', label: 'Subcontrabass Viol' },
          { id: 'triplo-violone', label: 'Triplo Violone' },
          { id: 'violone', label: 'Violone' },
        ]
      },
      {
        id: 'guitar',
        label: 'Guitar',
        variants: [
          { id: '10-string-guitar', label: '10-String Guitar' },
          { id: '11-string-guitar', label: '11-String Guitar' },
          { id: '12-string-guitar', label: '12-String Guitar' },
          { id: '5-string-guitar', label: '5-String Guitar' },
          { id: '6-string-guitar', label: '6-String Guitar' },
          { id: 'acoustic-bass-guitar', label: 'Acoustic Bass Guitar' },
          { id: 'acoustic-guitar', label: 'Acoustic Guitar' },
          { id: 'archtop-guitar', label: 'Archtop Guitar' },
          { id: 'baritone-guitar', label: 'Baritone Guitar' },
          { id: 'baroque-guitar', label: 'Baroque Guitar' },
          { id: 'bajo-quinto', label: 'Bajo Quinto' },
          { id: 'bajo-sexto', label: 'Bajo Sexto' },
          { id: 'bass-guitar', label: 'Bass Guitar' },
          { id: 'brazilian-viola', label: 'Brazilian Viola' },
          { id: 'chitarra-battente', label: 'Chitarra Battente' },
          { id: 'classical-guitar', label: 'Classical Guitar' },
          { id: 'contrabass-guitar', label: 'Contrabass Guitar' },
          { id: 'electric-bass-guitar', label: 'Electric Bass Guitar' },
          { id: 'electric-guitar', label: 'Electric Guitar' },
          { id: 'flamenco-guitar', label: 'Flamenco Guitar' },
          { id: 'fretless-bass-guitar', label: 'Fretless Bass Guitar' },
          { id: 'guitalele', label: 'Guitalele' },
          { id: 'guitarron-mexican', label: 'Guitarrón (Mexican)' },
          { id: 'guitarron-chileno', label: 'Guitarrón Chileno' },
          { id: 'harp-guitar', label: 'Harp Guitar' },
          { id: 'jazz-guitar', label: 'Jazz Guitar' },
          { id: 'lap-steel-guitar', label: 'Lap Steel Guitar' },
          { id: 'lute-guitar', label: 'Lute Guitar (Guitare-Luth)' },
          { id: 'lyre-guitar', label: 'Lyre Guitar' },
          { id: 'multi-neck-guitar', label: 'Multi-Neck Guitar' },
          { id: 'octave-guitar', label: 'Octave Guitar' },
          { id: 'portuguese-guitar', label: 'Portuguese Guitar' },
          { id: 'resonator-guitar', label: 'Resonator Guitar (Dobro)' },
          { id: 'russian-guitar', label: 'Russian Guitar' },
          { id: 'selmer-guitar', label: 'Selmer Guitar' },
          { id: 'slide-guitar', label: 'Slide Guitar' },
          { id: 'steel-guitar', label: 'Steel Guitar' },
          { id: 'tenor-guitar', label: 'Tenor Guitar' },
          { id: 'terz-guitar', label: 'Terz Guitar' },
          { id: 'twelve-string-bass-guitar', label: 'Twelve-String Bass Guitar' },
          { id: 'ukulele-guitar', label: 'Ukulele Guitar' },
          { id: 'viola-caipira', label: 'Viola Caipira' },
          { id: 'weissenborn-guitar', label: 'Weissenborn Guitar' },
        ]
      },
      {
        id: 'harp',
        label: 'Harp',
        variants: [
          { id: 'aeolian-harp', label: 'Æolian Harp' },
          { id: 'african-bow-harp', label: 'African Bow Harp' },
          { id: 'angular-harp', label: 'Angular Harp' },
          { id: 'arpa-criolla', label: 'Arpa Criolla' },
          { id: 'arpa-llanera', label: 'Arpa Llanera' },
          { id: 'arpa-paraguaya', label: 'Arpa Paraguaya' },
          { id: 'arpa-veracruzana', label: 'Arpa Veracruzana' },
          { id: 'autoharp', label: 'Autoharp' },
          { id: 'baroque-harp', label: 'Baroque Harp' },
          { id: 'celtic-harp', label: 'Celtic Harp' },
          { id: 'clarsach', label: 'Clàrsach' },
          { id: 'concert-harp', label: 'Concert Harp' },
          { id: 'cross-strung-harp', label: 'Cross-Strung Harp' },
          { id: 'davidic-harp', label: 'Davidic Harp' },
          { id: 'double-harp', label: 'Double Harp' },
          { id: 'electric-harp', label: 'Electric Harp' },
          { id: 'folk-harp', label: 'Folk Harp' },
          { id: 'gothic-harp', label: 'Gothic Harp' },
          { id: 'harp-lute', label: 'Harp Lute' },
          { id: 'harpsichord-harp', label: 'Harpsichord Harp' },
          { id: 'harp-zither', label: 'Harp Zither' },
          { id: 'jaw-harp', label: 'Jaw Harp' },
          { id: 'kora', label: 'Kora' },
          { id: 'lap-harp', label: 'Lap Harp' },
          { id: 'laser-harp', label: 'Laser Harp' },
          { id: 'lever-harp', label: 'Lever Harp' },
          { id: 'lyre-harp', label: 'Lyre Harp' },
          { id: 'medieval-harp', label: 'Medieval Harp' },
          { id: 'multi-course-harp', label: 'Multi-Course Harp' },
          { id: 'paraguayan-harp', label: 'Paraguayan Harp' },
          { id: 'pedal-harp', label: 'Pedal Harp' },
          { id: 'psaltery', label: 'Psaltery' },
          { id: 'pythagorean-harp', label: 'Pythagorean Harp' },
          { id: 'saung-gauk', label: 'Saung-Gauk' },
          { id: 'triple-harp', label: 'Triple Harp' },
          { id: 'troubadour-harp', label: 'Troubadour Harp' },
          { id: 'veritable-double-harp', label: 'Veritable Double Harp' },
          { id: 'wire-strung-harp', label: 'Wire-Strung Harp' },
        ]
      },
      {
        id: 'lute',
        label: 'Lute',
        variants: [
          { id: 'archlute', label: 'Archlute' },
          { id: 'baglama', label: 'Baglama' },
          { id: 'bandola', label: 'Bandola' },
          { id: 'bandurria', label: 'Bandurria' },
          { id: 'barbat', label: 'Barbat' },
          { id: 'biwa', label: 'Biwa' },
          { id: 'bouzouki', label: 'Bouzouki' },
          { id: 'chitarra-italiana', label: 'Chitarra Italiana' },
          { id: 'citole', label: 'Citole' },
          { id: 'colascione', label: 'Colascione' },
          { id: 'dombra', label: 'Dombra' },
          { id: 'domra', label: 'Domra' },
          { id: 'dotara', label: 'Dotara' },
          { id: 'gittern', label: 'Gittern' },
          { id: 'kithara', label: 'Kithara' },
          { id: 'kobza', label: 'Kobza' },
          { id: 'kwitra', label: 'Kwitra' },
          { id: 'laouto', label: 'Laouto' },
          { id: 'laud', label: 'Laud' },
          { id: 'lavta', label: 'Lavta' },
          { id: 'liuto', label: 'Liuto' },
          { id: 'mandura', label: 'Mandura' },
          { id: 'oud', label: 'Oud' },
          { id: 'pandura', label: 'Pandura' },
          { id: 'rabab', label: 'Rabab' },
          { id: 'rebec', label: 'Rebec' },
          { id: 'renaissance-lute', label: 'Renaissance Lute' },
          { id: 'russian-domra', label: 'Russian Domra' },
          { id: 'saz', label: 'Saz' },
          { id: 'sitole', label: 'Sitole' },
          { id: 'swarmandal', label: 'Swarmandal' },
          { id: 'tanbur', label: 'Tanbur' },
          { id: 'teorbo', label: 'Teorbo' },
          { id: 'theorbo-lute', label: 'Theorbo Lute' },
          { id: 'tiorbino', label: 'Tiorbino' },
          { id: 'torban', label: 'Torban' },
          { id: 'tzouras', label: 'Tzouras' },
          { id: 'vihuela', label: 'Vihuela' },
        ]
      },
      {
        id: 'mandolin',
        label: 'Mandolin',
        variants: [
          { id: 'banjolin', label: 'Banjolin' },
          { id: 'baritone-mandolin', label: 'Baritone Mandolin' },
          { id: 'bass-mandolin', label: 'Bass Mandolin' },
          { id: 'electric-mandolin', label: 'Electric Mandolin' },
          { id: 'flatback-mandolin', label: 'Flatback Mandolin' },
          { id: 'gibson-mandolin', label: 'Gibson Mandolin' },
          { id: 'mandobass', label: 'Mandobass' },
          { id: 'mandocello', label: 'Mandocello' },
          { id: 'mandola', label: 'Mandola' },
          { id: 'mandolin', label: 'Mandolin' },
          { id: 'mandolin-banjo', label: 'Mandolin Banjo' },
          { id: 'mandoline', label: 'Mandoline' },
          { id: 'mandolino', label: 'Mandolino' },
          { id: 'mandolone', label: 'Mandolone' },
          { id: 'mandora', label: 'Mandora' },
          { id: 'mandore', label: 'Mandore' },
          { id: 'octave-mandolin', label: 'Octave Mandolin' },
          { id: 'portuguese-mandolin', label: 'Portuguese Mandolin' },
          { id: 'resonator-mandolin', label: 'Resonator Mandolin' },
          { id: 'soprano-mandolin', label: 'Soprano Mandolin' },
          { id: 'tenor-mandolin', label: 'Tenor Mandolin' },
          { id: 'terz-mandolin', label: 'Terz Mandolin' },
        ]
      },
      { id: 'nyckelharpa', label: 'Nyckelharpa' },
      { id: 'phonofiddle', label: 'Phonofiddle' },
      {
        id: 'sitar',
        label: 'Sitar',
        variants: [
          { id: 'bass-sitar', label: 'Bass Sitar' },
          { id: 'chikari', label: 'Chikari' },
          { id: 'dilruba', label: 'Dilruba' },
          { id: 'electric-sitar', label: 'Electric Sitar' },
          { id: 'gandhar-pancham-sitar', label: 'Gandhar Pancham Sitar' },
          { id: 'kacapi', label: 'Kacapi' },
          { id: 'kachapi', label: 'Kachapi' },
          { id: 'mohan-veena', label: 'Mohan Veena' },
          { id: 'rudra-veena', label: 'Rudra Veena' },
          { id: 'saraswati-veena', label: 'Saraswati Veena' },
          { id: 'sitar', label: 'Sitar' },
          { id: 'surbahar', label: 'Surbahar' },
          { id: 'surmandal', label: 'Surmandal' },
          { id: 'tar-shehnai', label: 'Tar Shehnai' },
          { id: 'taus', label: 'Taus' },
          { id: 'tambura-tanpura', label: 'Tambura (Tanpura)' },
          { id: 'vichitra-veena', label: 'Vichitra Veena' },
        ]
      },
      { id: 'ukulele', label: 'Ukulele' },
      {
        id: 'viola',
        label: 'Viola',
        variants: [
          { id: 'alto-viola', label: 'Alto Viola' },
          { id: 'baritone-viola', label: 'Baritone Viola' },
          { id: 'contrabass-viola', label: 'Contrabass Viola' },
          { id: 'electric-viola', label: 'Electric Viola' },
          { id: 'lirone', label: 'Lirone' },
          { id: 'mezzo-viola', label: 'Mezzo Viola' },
          { id: 'quinton', label: 'Quinton' },
          { id: 'semi-acoustic-viola', label: 'Semi-Acoustic Viola' },
          { id: 'tenor-viola', label: 'Tenor Viola' },
          { id: 'tenor-viola-pomposa', label: 'Tenor Viola Pomposa' },
          { id: 'viola-bastarda', label: 'Viola Bastarda' },
          { id: 'viola-contrabbasso', label: 'Viola Contrabbasso' },
          { id: 'viola-damore', label: "Viola d'Amore" },
          { id: 'viola-da-braccio', label: 'Viola da Braccio' },
          { id: 'viola-da-gamba', label: 'Viola da Gamba' },
          { id: 'viola-da-terza', label: 'Viola da Terza' },
          { id: 'viola-di-bordone', label: 'Viola di Bordone' },
          { id: 'viola-di-fiume', label: 'Viola di Fiume' },
          { id: 'viola-pomposa', label: 'Viola Pomposa' },
          { id: 'violone-di-viola', label: 'Violone di Viola' },
          { id: 'violotta', label: 'Violotta' },
        ]
      },
      {
        id: 'violin',
        label: 'Violin',
        variants: [
          { id: '5-string-violin', label: '5-String Violin' },
          { id: 'acoustic-violin', label: 'Acoustic Violin' },
          { id: 'alto-violin', label: 'Alto Violin' },
          { id: 'baritone-violin', label: 'Baritone Violin' },
          { id: 'bass-violin', label: 'Bass Violin' },
          { id: 'chin-cello', label: 'Chin Cello' },
          { id: 'contrabass-violin', label: 'Contrabass Violin' },
          { id: 'damore-violin', label: "D'Amore Violin" },
          { id: 'diskant-viol', label: 'Diskant Viol' },
          { id: 'electric-violin', label: 'Electric Violin' },
          { id: 'fiddle-fiddola', label: 'Fiddle (Fiddola)' },
          { id: 'hardanger-fiddle', label: 'Hardanger Fiddle (Hardingfele)' },
          { id: 'kit-violin', label: 'Kit Violin (Pochette)' },
          { id: 'lira-da-braccio', label: 'Lira da Braccio' },
          { id: 'lira-da-gamba', label: 'Lira da Gamba' },
          { id: 'mezzo-violin', label: 'Mezzo Violin' },
          { id: 'octave-violin', label: 'Octave Violin' },
          { id: 'pardessus-de-viole', label: 'Pardessus de Viole' },
          { id: 'renaissance-violin', label: 'Renaissance Violin' },
          { id: 'semi-acoustic-violin', label: 'Semi-Acoustic Violin' },
          { id: 'soprano-violin', label: 'Soprano Violin' },
          { id: 'stroh-violin', label: 'Stroh Violin' },
          { id: 'tenor-violin', label: 'Tenor Violin' },
          { id: 'treble-violin', label: 'Treble Violin' },
          { id: 'violetta', label: 'Violetta' },
          { id: 'violino-piccolo', label: 'Violino Piccolo' },
          { id: 'violin-alta', label: 'Violin Alta' },
          { id: 'violin-octet', label: 'Violin Octet' },
          { id: 'violon-de-poitou', label: 'Violon de Poitou' },
          { id: 'violoncello-da-spalla', label: 'Violoncello da Spalla' },
          { id: 'wiener-violine', label: 'Wiener Violine (Viennese Violin)' },
          { id: 'violectra', label: 'Violectra (Electric Violin +C)' },
          { id: 'sultana-violin', label: 'Sultana Violin' },
        ]
      },
      {
        id: 'zither',
        label: 'Zither',
        variants: [
          { id: 'alpine-zither', label: 'Alpine Zither' },
          { id: 'appenzeller-zither', label: 'Appenzeller Zither' },
          { id: 'autoharp', label: 'Autoharp' },
          { id: 'bolivian-charango-zither', label: 'Bolivian Charango Zither' },
          { id: 'cantorum', label: 'Cantorum' },
          { id: 'chord-zither', label: 'Chord Zither' },
          { id: 'concert-zither', label: 'Concert Zither' },
          { id: 'cumbus', label: 'Cumbus' },
          { id: 'dulcimer', label: 'Dulcimer' },
          { id: 'dulcimer-hammered', label: 'Dulcimer (Hammered)' },
          { id: 'dulcimer-mountain', label: 'Dulcimer (Mountain)' },
          { id: 'electric-zither', label: 'Electric Zither' },
          { id: 'harp-zither', label: 'Harp Zither' },
          { id: 'kantele', label: 'Kantele' },
          { id: 'korean-gayageum', label: 'Korean Gayageum' },
          { id: 'langspil', label: 'Langspil' },
          { id: 'lap-harp', label: 'Lap Harp' },
          { id: 'lithophone-zither', label: 'Lithophone Zither' },
          { id: 'marovany', label: 'Marovany' },
          { id: 'psaltery', label: 'Psaltery' },
          { id: 'qanun', label: 'Qanun' },
          { id: 'santoor', label: 'Santoor' },
          { id: 'scheitholt', label: 'Scheitholt' },
          { id: 'schrammel-guitar', label: 'Schrammel Guitar' },
          { id: 'swedish-hummel', label: 'Swedish Hummel' },
          { id: 'tambura', label: 'Tambura' },
          { id: 'tamburitza', label: 'Tamburitza' },
          { id: 'tenor-zither', label: 'Tenor Zither' },
          { id: 'texas-longhorn-zither', label: 'Texas Longhorn Zither' },
          { id: 'turkish-kanun', label: 'Turkish Kanun' },
          { id: 'vietnamese-dan-tranh', label: 'Vietnamese Dan Tranh' },
          { id: 'vietnamese-trung', label: "Vietnamese T'rung" },
          { id: 'whippoorwill-dulcimer', label: 'Whippoorwill Dulcimer' },
          { id: 'zheng', label: 'Zheng' },
        ]
      },
    ]
  },

  // ────────────────────────────────────────────────────────────────────────
  // WIND INSTRUMENTS
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'wind',
    label: 'Wind Instruments',
    allOptionLabel: 'All Wind Instruments',
    otherOptionLabel: 'Other Wind Instrument',
    families: [
      { id: 'alboka', label: 'Alboka' },
      {
        id: 'clarinet',
        label: 'Clarinet',
        variants: [
          { id: 'bass-clarinet', label: 'Bass Clarinet' },
          { id: 'bb-clarinet', label: 'Bb Clarinet' },
          { id: 'chalumeau', label: 'Chalumeau' },
          { id: 'contrabass-clarinet', label: 'Contrabass Clarinet' },
        ]
      },
      { id: 'didgeridoo', label: 'Didgeridoo' },
      {
        id: 'flute',
        label: 'Flute',
        variants: [
          { id: 'alto-flute', label: 'Alto Flute' },
          { id: 'bamboo-flute', label: 'Bamboo Flute' },
          { id: 'bass-flute', label: 'Bass Flute' },
          { id: 'irish-flute', label: 'Irish Flute' },
          { id: 'pan-flute', label: 'Pan Flute' },
          { id: 'piccolo-flute', label: 'Piccolo Flute' },
          { id: 'transverse-flute', label: 'Transverse Flute' },
        ]
      },
      { id: 'harmonica', label: 'Harmonica' },
      { id: 'jaw-harp', label: 'Jaw Harp' },
      { id: 'kazoo', label: 'Kazoo' },
      { id: 'kubing', label: 'Kubing' },
      { id: 'lur', label: 'Lur' },
      { id: 'nose-flute', label: 'Nose Flute' },
      {
        id: 'oboe',
        label: 'Oboe',
        variants: [
          { id: 'english-horn', label: 'English Horn' },
          { id: 'heckelphone', label: 'Heckelphone' },
          { id: 'pan-pipes', label: 'Pan Pipes' },
        ]
      },
      {
        id: 'recorder',
        label: 'Recorder',
        variants: [
          { id: 'fife', label: 'Fife' },
          { id: 'flageolet', label: 'Flageolet' },
        ]
      },
      {
        id: 'saxophone',
        label: 'Saxophone',
        variants: [
          { id: 'alto-saxophone', label: 'Alto Saxophone' },
          { id: 'baritone-saxophone', label: 'Baritone Saxophone' },
          { id: 'soprano-saxophone', label: 'Soprano Saxophone' },
          { id: 'sopranino-saxophone', label: 'Sopranino Saxophone' },
          { id: 'tenor-saxophone', label: 'Tenor Saxophone' },
        ]
      },
      {
        id: 'shawm',
        label: 'Shawm',
        variants: [
          { id: 'cornamuse', label: 'Cornamuse' },
          { id: 'crumhorn', label: 'Crumhorn' },
        ]
      },
      { id: 'triton-shell', label: 'Triton Shell' },
      { id: 'vuvuzela', label: 'Vuvuzela' },
      {
        id: 'whistle',
        label: 'Whistle',
        variants: [
          { id: 'pennywhistle', label: 'Pennywhistle' },
          { id: 'tin-whistle', label: 'Tin Whistle' },
        ]
      },
      { id: 'xun', label: 'Xun' },
    ]
  },

  // ────────────────────────────────────────────────────────────────────────
  // PERCUSSION INSTRUMENTS
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'percussion',
    label: 'Percussion Instruments',
    allOptionLabel: 'All Percussion Instruments',
    otherOptionLabel: 'Other Percussion Instrument',
    families: [
      {
        id: 'drum-set-kit',
        label: 'Drum Set/Kit',
        variants: [
          { id: 'bass-drum', label: 'Bass Drum' },
          { id: 'cymbals', label: 'Cymbals (Ride, Crash, Splash)' },
          { id: 'snare-drum', label: 'Snare Drum' },
          { id: 'toms', label: 'Toms (Tom-Toms)' },
        ]
      },
      {
        id: 'hand-drums',
        label: 'Hand Drums',
        variants: [
          { id: 'bodhran', label: 'Bodhrán' },
          { id: 'bongos', label: 'Bongos' },
          { id: 'cajon', label: 'Cajón' },
          { id: 'congas', label: 'Congas' },
          { id: 'darbuka', label: 'Darbuka' },
          { id: 'djembe', label: 'Djembe' },
          { id: 'doumbek', label: 'Doumbek' },
          { id: 'frame-drum', label: 'Frame Drum' },
          { id: 'tabla', label: 'Tabla' },
          { id: 'talking-drum', label: 'Talking Drum' },
        ]
      },
      {
        id: 'mallet-percussion',
        label: 'Mallet Percussion',
        variants: [
          { id: 'glockenspiel', label: 'Glockenspiel' },
          { id: 'marimba', label: 'Marimba' },
          { id: 'vibraphone', label: 'Vibraphone' },
          { id: 'xylophone', label: 'Xylophone' },
        ]
      },
      {
        id: 'metal-percussion',
        label: 'Metal Percussion',
        variants: [
          { id: 'cowbell', label: 'Cowbell' },
          { id: 'cymbals-orchestral', label: 'Cymbals (Orchestral)' },
          { id: 'gong', label: 'Gong' },
          { id: 'triangle', label: 'Triangle' },
          { id: 'wind-chimes', label: 'Wind Chimes' },
        ]
      },
      {
        id: 'shakers',
        label: 'Shakers',
        variants: [
          { id: 'caxixi', label: 'Caxixi' },
          { id: 'ganza', label: 'Ganzá' },
          { id: 'maracas', label: 'Maracas' },
        ]
      },
      {
        id: 'misc-percussion',
        label: 'Miscellaneous Percussion',
        variants: [
          { id: 'claves', label: 'Claves' },
          { id: 'musical-saw', label: 'Musical Saw' },
          { id: 'tambourine', label: 'Tambourine' },
          { id: 'woodblock', label: 'Woodblock' },
        ]
      },
    ]
  },

  // ────────────────────────────────────────────────────────────────────────
  // KEYBOARD INSTRUMENTS
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'keyboard',
    label: 'Keyboard Instruments',
    allOptionLabel: 'All Keyboard Instruments',
    otherOptionLabel: 'Other Keyboard Instrument',
    families: [
      {
        id: 'accordion',
        label: 'Accordion',
        variants: [
          { id: 'bandoneon', label: 'Bandoneon' },
        ]
      },
      { id: 'celesta', label: 'Celesta' },
      {
        id: 'clavichord',
        label: 'Clavichord',
        variants: [
          { id: 'claviharps', label: 'Claviharps' },
          { id: 'clavinet', label: 'Clavinet' },
        ]
      },
      {
        id: 'harpsichord',
        label: 'Harpsichord',
        variants: [
          { id: 'spinet', label: 'Spinet' },
          { id: 'virginals', label: 'Virginals' },
        ]
      },
      { id: 'melodica', label: 'Melodica' },
      {
        id: 'organ',
        label: 'Organ',
        variants: [
          { id: 'drawbar-organ', label: 'Drawbar Organ' },
          { id: 'electric-organ', label: 'Electric Organ' },
          { id: 'harmonium', label: 'Harmonium' },
          { id: 'hammond-organ', label: 'Hammond Organ' },
          { id: 'pipe-organ', label: 'Pipe Organ' },
          { id: 'reed-organ', label: 'Reed Organ' },
        ]
      },
      { id: 'piano', label: 'Piano' },
    ]
  },

  // ────────────────────────────────────────────────────────────────────────
  // ELECTRONIC INSTRUMENTS
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'electronic',
    label: 'Electronic Instruments',
    allOptionLabel: 'All Electronic Instruments',
    otherOptionLabel: 'Other Electronic Instrument',
    families: [
      {
        id: 'electronic-keyboard',
        label: 'Electronic Keyboard',
        variants: [
          { id: 'keytar', label: 'Keytar' },
          { id: 'midi-controller', label: 'MIDI Controller' },
          { id: 'microtonal-keyboard', label: 'Microtonal Keyboard' },
        ]
      },
      {
        id: 'sampler',
        label: 'Sampler',
        variants: [
          { id: 'mellotron', label: 'Mellotron' },
          { id: 'optigan', label: 'Optigan' },
          { id: 'synclavier', label: 'Synclavier' },
        ]
      },
      {
        id: 'synthesizer',
        label: 'Synthesizer',
        variants: [
          { id: 'analog-synthesizer', label: 'Analog Synthesizer' },
          { id: 'moog-synthesizer', label: 'Moog Synthesizer' },
          { id: 'modular-synthesizer', label: 'Modular Synthesizer' },
          { id: 'synth-bass', label: 'Synth Bass' },
          { id: 'continuum-fingerboard', label: 'Continuum Fingerboard' },
          { id: 'drum-machine', label: 'Drum Machine' },
          { id: 'electronic-drum-pads', label: 'Electronic Drum Pads' },
          { id: 'laser-harp', label: 'Laser Harp' },
          { id: 'ondes-martenot', label: 'Ondes Martenot' },
          { id: 'otamatone', label: 'Otamatone' },
          { id: 'sequencer', label: 'Sequencer' },
          { id: 'theremin', label: 'Theremin' },
          { id: 'turntables', label: 'Turntables' },
          { id: 'vocoder', label: 'Vocoder' },
        ]
      },
    ]
  },
]

/**
 * Flatten the taxonomy into a simple list for Type 5 selection dropdowns
 * Returns options in the format expected by the artist type selector
 */
export function getType5InstrumentOptions(): Array<{ id: string; label: string; group?: string }> {
  const options: Array<{ id: string; label: string; group?: string }> = []

  INSTRUMENT_TAXONOMY_NOTION_ALIGNED.forEach(group => {
    // Add "All [Group]" option first
    options.push({
      id: `all-${group.id}`,
      label: group.allOptionLabel,
      group: group.label
    })

    // Add all instrument families
    group.families.forEach(family => {
      options.push({
        id: family.id,
        label: family.label,
        group: group.label
      })
    })

    // Add "Other" option last
    options.push({
      id: `other-${group.id}`,
      label: group.otherOptionLabel,
      group: group.label
    })
  })

  return options
}

/**
 * Check if a selection is an "Other" option that requires follow-up
 */
export function isOtherInstrumentSelection(selectionId: string): boolean {
  return selectionId.startsWith('other-')
}

/**
 * Check if a selection is an "All [Group]" option
 */
export function isAllInstrumentsSelection(selectionId: string): boolean {
  return selectionId.startsWith('all-')
}

/**
 * Get instrument variants for a specific family
 */
export function getInstrumentVariantsForFamily(familyId: string): InstrumentVariant[] | undefined {
  for (const group of INSTRUMENT_TAXONOMY_NOTION_ALIGNED) {
    const family = group.families.find(f => f.id === familyId)
    if (family) {
      return family.variants
    }
  }
  return undefined
}
