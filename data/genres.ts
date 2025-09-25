export interface GenreSubType {
  id: string
  name: string
}

export interface GenreType {
  id: string
  name: string
  subs?: GenreSubType[]
}

export interface GenreFamily {
  id: string
  name: string
  types: GenreType[]
}

export const GENRE_FAMILIES: GenreFamily[] = [
  {
    id: 'industrial-gothic',
    name: 'Industrial / Gothic',
    types: [
      {
        id: 'industrial-gothic',
        name: 'Industrial / Gothic',
        subs: [
          { id: 'avant-garde-industrial', name: 'Avant-Garde Industrial' },
          { id: 'dark-ambient-industrial', name: 'Dark Ambient / Dark Industrial (Hybrid: Industrial / Gothic + Downtempo / Ambient)' },
          { id: 'darkwave-coldwave', name: 'Darkwave / Coldwave' },
          { id: 'electro-industrial', name: 'Electro Industrial / Aggrepo' },
          { id: 'electronic-body-music', name: 'Electronic Body Music (EBM)' },
          { id: 'futurepop', name: 'Futurepop' },
          { id: 'gothic', name: 'Gothic' },
          { id: 'gothic-rock-death-rock', name: 'Gothic Rock / Death Rock' },
          { id: 'industrial', name: 'Industrial' },
          { id: 'industrial-rock-metal', name: 'Industrial Rock / Metal' },
          { id: 'krautrock', name: 'Krautrock' },
          { id: 'minimal-wave-synth-revival', name: 'Minimal Wave / Synth / Industrial Revival (Hybrid: Industrial / Gothic + Downtempo / Ambient)' },
          { id: 'noise-music', name: 'Noise Music' },
          { id: 'stoner-sludge-metal', name: 'Stoner / Sludge Metal' },
          { id: 'symphonic-gothic-metal', name: 'Symphonic / Gothic Metal' },
          { id: 'thrash-metal', name: 'Thrash Metal' }
        ]
      },
      {
        id: 'metal-punk',
        name: 'Metal / Punk',
        subs: [
          { id: 'heavy-metal', name: 'Heavy Metal' },
          { id: 'hardcore-punk', name: 'Hardcore Punk' },
          { id: 'punk-new-wave', name: 'Punk / New Wave' },
          { id: 'rock-n-roll-skiffle', name: "Rock 'n' Roll / Skiffle Revival" },
          { id: 'glam-shock-rock', name: 'Glam / Glitter / Shock Rock' },
          { id: 'garage-metal', name: 'Garage Metal (NWOBHM)' },
          { id: 'post-hardcore-emo', name: 'Post-Hardcore Emo / Screamo' },
          { id: 'metal-punk-hybrids', name: 'Metal / Punk Hybrids (Crossover Thrash, Math Rock / Mathcore, Grindcore, Synthcore / Crunkcore)' },
          { id: 'extreme-metal', name: 'Extreme Metal' }
        ]
      }
    ]
  },
  {
    id: 'pop-rock',
    name: 'Pop & Rock Music',
    types: [
      {
        id: 'rock',
        name: 'Rock',
        subs: [
          { id: 'american-english-folk-revival', name: 'American & English Folk Revival' },
          { id: 'classic-rock', name: 'Classic Rock' },
          { id: 'alternative-rock-indie-2nd-wave', name: 'Alternative Rock / Indie 2nd Wave' },
          { id: 'dance-punk-nu-rave', name: 'Dance-Punk / Nu Rave' },
          { id: 'garage-rock', name: 'Garage Rock' },
          { id: 'folk-rock', name: 'Folk Rock' },
          { id: 'britpop', name: 'Britpop (Hybrid: Alternative / Indie + Pop)' },
          { id: 'emo-rock', name: 'Emo Rock' },
          { id: 'alt-indie-pop-hybrids', name: 'Alternative Rock / Indie Hybrids (Dance-Punk, Post-Britpop, etc.)' },
          { id: 'new-wave-no-wave', name: 'New Wave / No Wave' },
          { id: 'rockabilly-surf', name: 'Rockabilly / Rock ’n’ Roll / Surf Rock' },
          { id: 'glam-shock-rock', name: 'Glam / Glitter / Shock Rock' },
          { id: 'grunge', name: 'Grunge' },
          { id: 'post-rock-post-prog', name: 'Post-Rock / New Prog / Post-Prog Rock' },
          { id: 'shoegaze-dream-pop-hybrid', name: 'Shoegaze / Dream Pop (Hybrid: Alternative / Indie + Pop)' },
          { id: 'noise-rock', name: 'Noise Rock / Math Rock' },
          { id: 'post-punk-revival', name: 'Post-Punk Revival / Garage Rock Revival / Nu Rawk' },
          { id: 'psychedelia', name: 'Psychedelia / Psychedelic / Acid Rock' },
          { id: 'electroclash-indietronica', name: 'Electroclash / Indietronica / Chillwave' },
          { id: 'shoegaze-dream-pop', name: 'Shoegaze / Dream Pop' },
          { id: 'post-britpop', name: 'Post-Britpop (Hybrid: Pop + Contemporary Rock)' },
          { id: 'shoegaze-pop', name: 'Shoegaze / Dream Pop (Hybrid: Pop + Alternative / Indie)' },
          { id: 'singer-songwriter', name: 'Singer-Songwriter' },
          { id: 'soft-rock', name: 'Soft Rock / Adult Contemporary' },
          { id: 'synthpop-new-romantics', name: 'Synthpop / New Romantics (Hybrid: Pop + Punk / New Wave)' }
        ]
      },
      {
        id: 'pop',
        name: 'Pop',
        subs: [
          { id: 'brill-building-pop', name: 'Brill Building Pop / Crooners' },
          { id: 'bubblegum-pop', name: 'Bubblegum / Teenybop' },
          { id: 'c-pop', name: 'C-Pop' },
          { id: 'country-pop-country-rock', name: 'Country Pop / Country Rock' },
          { id: 'dance-pop', name: 'Dance Pop' },
          { id: 'disco-post-disco', name: 'Disco / Post-Disco' },
          { id: 'electropop', name: 'Electropop' },
          { id: 'britpop-hybrid', name: 'Britpop (Hybrid: Pop + Alternative / Indie)' },
          { id: 'dance-punk-pop', name: 'Dance-Punk / Nu Rave (Hybrid: Pop + Alternative / Indie)' },
          { id: 'pop-rock-crossover', name: 'Pop Rock / Power Pop / Soft Rock' },
          { id: 'post-britpop-pop', name: 'Post-Britpop (Hybrid: Pop + Contemporary Rock)' },
          { id: 'shoegaze-pop-hybrid', name: 'Shoegaze / Dream Pop (Hybrid: Pop + Alternative / Indie)' },
          { id: 'synthpop-new-romantics-pop', name: 'Synthpop / New Romantics (Hybrid: Pop + Punk / New Wave)' },
          { id: 'j-pop', name: 'J-Pop' },
          { id: 'k-pop', name: 'K-Pop' },
          { id: 'latin-pop', name: 'Latin Pop' }
        ]
      }
    ]
  },
  {
    id: 'rhythm-music',
    name: 'Rhythm Music',
    types: [
      {
        id: 'country',
        name: 'Country',
        subs: [
          { id: 'americana-alt-country', name: 'Americana / Alternative Country' },
          { id: 'bakersfield', name: 'Bakersfield' },
          { id: 'bluegrass', name: 'Bluegrass' },
          { id: 'classic-country', name: 'Classic Country / Hillbilly' },
          { id: 'country-pop-country-rock', name: 'Country Pop / Country Rock (Hybrid: Pop + Country)' },
          { id: 'honky-tonk', name: 'Honky Tonk / Hardcore Country' },
          { id: 'neotraditional-country', name: 'Neotraditional / Contemporary Country' },
          { id: 'outlaw-country', name: 'Progressive / Outlaw Country' },
          { id: 'urban-country', name: 'Urban Country' },
          { id: 'western-swing', name: 'Western Swing' }
        ]
      },
      {
        id: 'rhythm-n-blues',
        name: "Rhythm 'n' Blues",
        subs: [
          { id: 'boogie-electrofunk', name: 'Boogie / Electrofunk' },
          { id: 'deep-nu-funk', name: 'Deep / Nu Funk / Rare Groove' },
          { id: 'disco', name: 'Disco' },
          { id: 'doo-wop', name: 'Doo Wop' },
          { id: 'early-funk-p-funk', name: 'Early Funk / P-Funk' },
          { id: 'early-rhythm-n-blues', name: "Early Rhythm 'n' Blues" },
          { id: 'go-go-bounce-beat', name: 'Go-Go / Bounce Beat' },
          { id: 'modern-soul', name: 'Modern Soul / Neo Soul / Nu Soul' },
          { id: 'motown-detroit-chicago-soul', name: 'Motown / Detroit / Chicago Soul' },
          { id: 'urban-rnb', name: 'Urban Soul / Urban Pop / Urban R&B' }
        ]
      },
      {
        id: 'soul',
        name: 'Soul',
        subs: [
          { id: 'modern-gospel', name: 'Modern Gospel' },
          { id: 'ragtime-stride', name: 'Ragtime / Stride' },
          { id: 'spirituals-worksongs', name: 'Spirituals / Worksongs' },
          { id: 'urban-rnb-soul', name: 'Urban Soul / Urban Pop / Urban R&B' }
        ]
      }
    ]
  },
  {
    id: 'blues-jazz',
    name: 'The Blues & Jazz',
    types: [
      {
        id: 'blues',
        name: 'Blues',
        subs: [
          { id: 'blues-rock', name: 'Blues Rock / British Blues' },
          { id: 'boogie-woogie-piano-blues', name: 'Boogie Woogie / Piano Blues' },
          { id: 'chicago-city-urban-blues', name: 'Chicago City / Urban Blues' },
          { id: 'country-folk-delta-blues', name: 'Country / Folk / Delta Blues' },
          { id: 'electric-texas-blues', name: 'Electric Texas Blues' },
          { id: 'hill-country-trance-blues', name: 'Hill Country / Trance Blues' },
          { id: 'jump-blues', name: 'Jump Blues' },
          { id: 'louisiana-swamp-blues', name: 'Louisiana / Swamp Blues' },
          { id: 'soul-blues', name: 'Soul Blues / Nu Southern Soul' },
          { id: 'texas-blues-rock', name: 'Texas Blues Rock / Modern Electric Blues' }
        ]
      },
      {
        id: 'jazz',
        name: 'Jazz',
        subs: [
          { id: 'acid-jazz', name: 'Acid Jazz / Jazzdance' },
          { id: 'avant-garde-free-jazz', name: 'Avant-Garde / Free Jazz' },
          { id: 'bebop', name: 'Bebop' },
          { id: 'chicago-jazz', name: 'Chicago Jazz' },
          { id: 'fusion-jazz-rock', name: 'Fusion / Jazz Rock' },
          { id: 'latin-jazz', name: 'Latin Jazz' },
          { id: 'modern-jazz', name: 'Progressive / 3rd Stream / Modal Jazz' },
          { id: 'smooth-jazz', name: 'Smooth Jazz' },
          { id: 'soul-jazz', name: 'Soul Jazz / Jazz Funk' },
          { id: 'swing-big-band', name: 'Swing / Big Band' },
          { id: 'west-coast-cool-jazz', name: 'West Coast / Cool Jazz' }
        ]
      }
    ]
  },
  {
    id: 'jamaican',
    name: 'Jamaican',
    types: [
      {
        id: 'jamaican-core',
        name: 'Jamaican Music',
        subs: [
          { id: 'dancehall', name: 'Dancehall' },
          { id: 'dub', name: 'Dub' },
          { id: 'lovers-rock', name: 'Lovers Rock / UK Reggae' },
          { id: 'reggaeton-latin-rap', name: 'Reggaetón & Latin Rap (Hybrid: Jamaican + Rap / Hip-Hop)' },
          { id: 'roots-reggae', name: 'Roots Reggae' },
          { id: 'ska', name: 'Ska' },
          { id: 'ska-revival', name: 'Ska Revival / Ska Punk / Skacore' }
        ]
      }
    ]
  },
  {
    id: 'rap-hip-hop',
    name: 'Rap / Hip-Hop',
    types: [
      {
        id: 'rap-hip-hop-core',
        name: 'Rap / Hip-Hop',
        subs: [
          { id: 'dirty-south', name: 'Dirty South Rap / Crunk / Snap' },
          { id: 'east-coast-gangsta', name: 'East Coast Gangsta Rap' },
          { id: 'electro-hip-hop', name: 'Electro (Hybrid: Rap / Hip-Hop + Breakbeat)' },
          { id: 'golden-age-rap', name: 'Golden Age / Hardcore Rap' },
          { id: 'hip-hop', name: 'Hip-Hop' },
          { id: 'jazz-rap', name: 'Jazz Rap / Native Tongue' },
          { id: 'miami-bass-bounce', name: 'Miami Bass & Bounce' },
          { id: 'old-skool-rap', name: 'Old Skool Rap' },
          { id: 'progressive-rap', name: 'Progressive / Nu Skool Rap' },
          { id: 'rap-rock-funk-metal', name: 'Rap Rock / Funk Metal' },
          { id: 'trap', name: 'Trap' },
          { id: 'trapstep-edm-trap', name: 'Trapstep / EDM Trap' }
        ]
      }
    ]
  },
  {
    id: 'dance-edm',
    name: 'Dance & EDM',
    types: [
      {
        id: 'breakbeat',
        name: 'Breakbeat Dance Music',
        subs: [
          { id: 'baseline-uk-funky', name: 'Baseline / UK Funky' },
          { id: 'broken-beats', name: 'Broken Beats' },
          { id: 'chemical-breaks-big-beat', name: 'Chemical Breaks / Big Beat' },
          { id: 'digital-hardcore-breakcore', name: 'Digital Hardcore / Breakcore' },
          { id: 'future-bass-future-garage', name: 'Future Bass / Future Garage' },
          { id: 'glitch-hop-wonky', name: 'Glitch Hop & Wonky' },
          { id: 'urban-breaks-rap-rnb', name: 'Urban Breaks / Rap R&B' },
          { id: 'uk-garage-speed-2-step', name: 'UK Garage / Speed / 2-Step (Hybrid: Breakbeat + Drum ‘n’ Bass)' },
          { id: 'uk-garage-speed-2-step-alt', name: 'UK Garage / Speed / 2-Step (Hybrid: Drum ‘n’ Bass + Breakbeat)' }
        ]
      },
      {
        id: 'drum-n-bass',
        name: "Drum 'n' Bass / Jungle",
        subs: [
          { id: 'baseline-uk-funky-hybrid', name: 'Baseline / UK Funky (Hybrid: Breakbeat + Drum ‘n’ Bass)' },
          { id: 'darkcore-darkstep', name: 'Darkcore / Darkstep (Hybrid: Drum ‘n’ Bass + Hardcore)' },
          { id: 'digital-hardcore-dnb', name: 'Digital Hardcore / Breakcore (Hybrid: Drum ‘n’ Bass + Hardcore)' },
          { id: 'drum-n-bass-core', name: "Drum 'n' Bass" },
          { id: 'future-bass-garage-dnb', name: 'Future Bass / Future Garage (Hybrid: Drum ‘n’ Bass + Breakbeat)' },
          { id: 'grime-breakbeat-garage', name: 'Grime / Breakbeat Garage (Hybrid: Drum ‘n’ Bass + Breakbeat)' },
          { id: 'intelligent-ambient-dnb', name: 'Intelligent / Ambient Drum ‘n’ Bass / Jazzstep' },
          { id: 'jump-up', name: 'Jump Up' },
          { id: 'liquid-funk', name: 'Liquid Funk' },
          { id: 'neurofunk', name: 'Neurofunk' },
          { id: 'old-skool-jungle', name: 'Old Skool Jungle / Old Skool Drum ‘n’ Bass' }
        ]
      },
      {
        id: 'hardcore',
        name: 'Hardcore',
        subs: [
          { id: 'baseline-uk-funky-hardcore', name: 'Baseline / UK Funky (Hybrid: Drum ‘n’ Bass + Hardcore)' },
          { id: 'breakbeat-hardcore-piano-house', name: 'Breakbeat Hardcore / Piano House Rave' },
          { id: 'darkcore-hardcore-hybrid', name: 'Darkcore / Darkstep (Hybrid: Hardcore + Drum ‘n’ Bass)' },
          { id: 'early-gabber', name: 'Early Gabber' },
          { id: 'happy-hardcore-bouncy-techno', name: 'Happy Hardcore / Bouncy Techno' },
          { id: 'hardcore-techno-rave', name: 'Hardcore Techno / Rave (Hybrid: Techno + Hardcore)' },
          { id: 'hardstyle-jumpstyle', name: 'Hardstyle / Jumpstyle' },
          { id: 'nu-style-gabber', name: 'Nu Style Gabber / Mainstream / J-Core' },
          { id: 'speedcore-terrorcore-frenchcore', name: 'Speedcore / Terrorcore / Frenchcore' },
          { id: 'uk-hardcore-freeform', name: 'UK Hardcore / Freeform / Trancecore / Acidcore' }
        ]
      },
      {
        id: 'techno',
        name: 'Techno',
        subs: [
          { id: 'ambient-techno', name: 'Ambient Techno / Intelligent Dance Music' },
          { id: 'detroit-techno', name: 'Detroit Techno' },
          { id: 'free-tekno-hardtek', name: 'Free Tekno / Hardtek' },
          { id: 'industrial-techno-early-schranz', name: 'Industrial Techno / Early Schranz' },
          { id: 'minimal-techno', name: 'Minimal Techno' },
          { id: 'tech-house-hybrid', name: 'Tech House (Hybrid: House + Techno)' }
        ]
      },
      {
        id: 'house',
        name: 'House',
        subs: [
          { id: 'acid-house', name: 'Acid House' },
          { id: 'deep-house', name: 'Deep House' },
          { id: 'dutch-electro-house', name: 'Dutch / Electro House' },
          { id: 'electro-house', name: 'Electro House' },
          { id: 'fidget-house-complextro', name: 'Fidget House / Complextro' },
          { id: 'french-funky-house', name: 'French / Funky House' },
          { id: 'ghetto-house-ghettotech-juke', name: 'Ghetto House / GhettoTech / Juke (Hybrid: Techno + House)' },
          { id: 'ibiza-dream-house-trance', name: 'Ibiza / Dream House-Trance (Hybrid: Trance + House)' },
          { id: 'microhouse-minimal-house', name: 'Microhouse / Minimal House' },
          { id: 'progressive-house', name: 'Progressive House' },
          { id: 'tech-house', name: 'Tech House (Hybrid: House + Techno)' }
        ]
      },
      {
        id: 'trance',
        name: 'Trance',
        subs: [
          { id: 'acid-trance', name: 'Classic / Acid Trance' },
          { id: 'goa-psytrance', name: 'Goa Trance / Psytrance' },
          { id: 'ibiza-dream-trance', name: 'Ibiza / Dream House-Trance (Hybrid: House + Trance)' },
          { id: 'tech-trance', name: 'Tech Trance' },
          { id: 'uplifting-epic-trance', name: 'Uplifting / Epic Trance' }
        ]
      }
    ]
  },
  {
    id: 'downtempo-ambient',
    name: 'Downtempo / Ambient',
    types: [
      {
        id: 'downtempo',
        name: 'Downtempo / Ambient',
        subs: [
          { id: 'ambient', name: 'Ambient' },
          { id: 'ambient-breaks-illbient', name: 'Ambient Breaks / Illbient' },
          { id: 'ambient-house-chill-out', name: 'Ambient House / Chill-Out' },
          { id: 'dark-ambient-industrial', name: 'Dark Ambient / Dark Industrial (Hybrid: Ambient + Industrial / Gothic)' },
          { id: 'digital-minimalism-lowercase', name: 'Digital Minimalism / Lowercase' },
          { id: 'downtempo-core', name: 'Downtempo' },
          { id: 'lounge-exotica', name: 'Lounge / Exotica / Space Age Pop' },
          { id: 'musique-concrete', name: 'Musique Concrète' },
          { id: 'new-age', name: 'New Age' },
          { id: 'synthwave-vaporwave', name: 'Synthwave / Vaporwave' }
        ]
      }
    ]
  },
  {
    id: 'classical',
    name: 'Classical',
    types: [
      {
        id: 'classical-periods',
        name: 'Classical Periods',
        subs: [
          { id: 'baroque', name: 'Baroque' },
          { id: 'classical-era', name: 'Classical Era' },
          { id: 'romantic', name: 'Romantic' },
          { id: 'modern-classical', name: 'Modern Classical / Contemporary Classical' }
        ]
      }
    ]
  },
  {
    id: 'folk-world',
    name: 'Folk & World',
    types: [
      {
        id: 'folk',
        name: 'Folk / World',
        subs: [
          { id: 'traditional-folk', name: 'Traditional Folk' },
          { id: 'world-fusion', name: 'World Fusion / Ethnic Fusion' },
          { id: 'roots-folk', name: 'Roots Folk' },
          { id: 'celtic-folk', name: 'Celtic Folk' }
        ]
      }
    ]
  }
]

