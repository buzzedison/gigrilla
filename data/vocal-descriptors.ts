export interface VocalDescriptor {
  id: string
  label: string
  group: string
}

export const VOCALIST_TYPES = ['Lead', 'Backing', 'Harmony'] as const

export const VOCAL_SOUND_DESCRIPTORS: VocalDescriptor[] = [
  { id: 'ballad-voice', label: 'Ballad Voice', group: 'Sound-Based' },
  { id: 'breathy-voice', label: 'Breathy Voice', group: 'Sound-Based' },
  { id: 'bright-voice', label: 'Bright Voice', group: 'Sound-Based' },
  { id: 'classical-baritone', label: 'Classical Baritone Voice', group: 'Classical Voice Types' },
  { id: 'classical-bass', label: 'Classical Bass Voice', group: 'Classical Voice Types' },
  { id: 'classical-contralto', label: 'Classical Contralto Voice', group: 'Classical Voice Types' },
  { id: 'classical-countertenor', label: 'Classical Countertenor Voice', group: 'Classical Voice Types' },
  { id: 'classical-mezzo', label: 'Classical Mezzo-Soprano Voice', group: 'Classical Voice Types' },
  { id: 'classical-soprano', label: 'Classical Soprano Voice', group: 'Classical Voice Types' },
  { id: 'classical-tenor', label: 'Classical Tenor Voice', group: 'Classical Voice Types' },
  { id: 'coloratura', label: 'Coloratura Voice', group: 'Classical Voice Types' },
  { id: 'deep-bassy', label: 'Deep Bassy Voice', group: 'Sound-Based' },
  { id: 'dramatic-voice', label: 'Dramatic Voice', group: 'Sound-Based' },
  { id: 'edgy-voice', label: 'Edgy Voice', group: 'Sound-Based' },
  { id: 'emotional-voice', label: 'Emotional Voice', group: 'Sound-Based' },
  { id: 'ethereal-voice', label: 'Ethereal Voice', group: 'Sound-Based' },
  { id: 'gritty-voice', label: 'Gritty Voice', group: 'Sound-Based' },
  { id: 'haunting-voice', label: 'Haunting Voice', group: 'Sound-Based' },
  { id: 'high-pitched', label: 'High Pitched Voice', group: 'Sound-Based' },
  { id: 'husky-voice', label: 'Husky Voice', group: 'Sound-Based' },
  { id: 'lyric', label: 'Lyric Voice', group: 'Sound-Based' },
  { id: 'mellow-voice', label: 'Mellow Voice', group: 'Sound-Based' },
  { id: 'nasal', label: 'Nasal Voice', group: 'Sound-Based' },
  { id: 'powerful-voice', label: 'Powerful Voice', group: 'Sound-Based' },
  { id: 'raspy-voice', label: 'Raspy Voice', group: 'Sound-Based' },
  { id: 'resonant', label: 'Resonant Voice', group: 'Sound-Based' },
  { id: 'robust-voice', label: 'Robust Voice', group: 'Sound-Based' },
  { id: 'silky', label: 'Silky Voice', group: 'Sound-Based' },
  { id: 'smoky', label: 'Smoky Voice', group: 'Sound-Based' },
  { id: 'soft', label: 'Soft Voice', group: 'Sound-Based' },
  { id: 'soulful-voice', label: 'Soulful Voice', group: 'Sound-Based' },
  { id: 'velvety', label: 'Velvety Voice', group: 'Sound-Based' },
  { id: 'vibrato', label: 'Vibrato Voice', group: 'Sound-Based' },
  { id: 'warm', label: 'Warm Voice', group: 'Sound-Based' },
  { id: 'whimsical-voice', label: 'Whimsical Voice', group: 'Sound-Based' }
]

export const VOCAL_GENRE_DESCRIPTORS: VocalDescriptor[] = [
  { id: 'a-cappella', label: 'A Cappella Voice', group: 'Genre-Based' },
  { id: 'alternative-voice', label: 'Alternative Voice', group: 'Genre-Based' },
  { id: 'arabic-voice', label: 'Arabic Voice', group: 'Genre-Based' },
  { id: 'blues-voice', label: 'Blues Voice', group: 'Genre-Based' },
  { id: 'bhangra-voice', label: 'Bhangra Voice', group: 'Genre-Based' },
  { id: 'bossa-nova-voice', label: 'Bossa Nova Voice', group: 'Genre-Based' },
  { id: 'choral-voice', label: 'Choral Voice', group: 'Genre-Based' },
  { id: 'classical-crossover', label: 'Classical Crossover Voice', group: 'Genre-Based' },
  { id: 'country-voice', label: 'Country Voice', group: 'Genre-Based' },
  { id: 'electronic-voice', label: 'Electronic Voice', group: 'Genre-Based' },
  { id: 'enka-voice', label: 'Enka Voice', group: 'Genre-Based' },
  { id: 'fado-voice', label: 'Fado Voice', group: 'Genre-Based' },
  { id: 'flamenco-voice', label: 'Flamenco Voice', group: 'Genre-Based' },
  { id: 'folk-voice', label: 'Folk Voice', group: 'Genre-Based' },
  { id: 'gospel-voice', label: 'Gospel Voice', group: 'Genre-Based' },
  { id: 'gregorian-voice', label: 'Gregorian Chant Voice', group: 'Genre-Based' },
  { id: 'hip-hop-voice', label: 'Hip-Hop Voice', group: 'Genre-Based' },
  { id: 'hindustani-classical-voice', label: 'Hindustani Classical Voice', group: 'Genre-Based' },
  { id: 'indie-voice', label: 'Indie Voice', group: 'Genre-Based' },
  { id: 'jazz-voice', label: 'Jazz Voice', group: 'Genre-Based' },
  { id: 'k-pop-voice', label: 'K-Pop Voice', group: 'Genre-Based' },
  { id: 'kabuki-voice', label: 'Kabuki Voice', group: 'Genre-Based' },
  { id: 'latin-voice', label: 'Latin Voice', group: 'Genre-Based' },
  { id: 'metal-voice', label: 'Metal Voice', group: 'Genre-Based' },
  { id: 'musical-theatre-voice', label: 'Musical Theatre Voice', group: 'Genre-Based' },
  { id: 'opera-voice', label: 'Opera Voice', group: 'Genre-Based' },
  { id: 'pop-voice', label: 'Pop Voice', group: 'Genre-Based' },
  { id: 'punk-voice', label: 'Punk Voice', group: 'Genre-Based' },
  { id: 'qawwali-voice', label: 'Qawwali Voice', group: 'Genre-Based' },
  { id: 'rnb-voice', label: 'R&B Voice', group: 'Genre-Based' },
  { id: 'reggae-voice', label: 'Reggae Voice', group: 'Genre-Based' },
  { id: 'rock-voice', label: 'Rock Voice', group: 'Genre-Based' },
  { id: 'samba-voice', label: 'Samba Voice', group: 'Genre-Based' },
  { id: 'soul-voice', label: 'Soul Voice', group: 'Genre-Based' },
  { id: 'taarab-voice', label: 'Taarab Voice', group: 'Genre-Based' },
  { id: 'throat-singing', label: 'Throat Singing Voice', group: 'Genre-Based' },
  { id: 'yodel-voice', label: 'Yodel Voice', group: 'Genre-Based' }
]

export const VOCAL_SOUND_DESCRIPTOR_LABELS_WITH_ANY = ['Any', ...VOCAL_SOUND_DESCRIPTORS.map((item) => item.label)] as const
export const VOCAL_GENRE_DESCRIPTOR_LABELS_WITH_ANY = ['Any', ...VOCAL_GENRE_DESCRIPTORS.map((item) => item.label)] as const

const ensureUniqueLabels = (collection: VocalDescriptor[], name: string) => {
  const labels = collection.map((item) => item.label)
  const unique = new Set(labels)
  if (unique.size !== labels.length) {
    throw new Error(`${name} contains duplicate labels. Keep labels unique to avoid selector drift.`)
  }
}

if (process.env.NODE_ENV !== 'production') {
  ensureUniqueLabels(VOCAL_SOUND_DESCRIPTORS, 'VOCAL_SOUND_DESCRIPTORS')
  ensureUniqueLabels(VOCAL_GENRE_DESCRIPTORS, 'VOCAL_GENRE_DESCRIPTORS')
}
