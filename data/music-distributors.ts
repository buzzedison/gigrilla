export interface MusicDistributor {
  country: string
  name: string
  reach: 'Global' | 'Regional' | 'Local'
  url: string
  note?: string
}

const DISTRIBUTOR_SEEDS: MusicDistributor[] = [
  {
    country: 'Australia',
    name: 'Gyrostream',
    reach: 'Global',
    url: 'https://www.gyrostream.com',
    note: 'Australia-based digital distribution.'
  },
  {
    country: 'Australia',
    name: 'Xelon Digital',
    reach: 'Global',
    url: 'https://xelon.digital',
    note: 'Australia-origin distribution and label services.'
  },
  {
    country: 'Austria',
    name: 'Rebeat Digital',
    reach: 'Global',
    url: 'https://www.rebeat.com',
    note: 'Austria-origin digital distribution and label services.'
  },
  {
    country: 'Belgium',
    name: 'PIAS Group',
    reach: 'Global',
    url: 'https://www.pias.com',
    note: 'Independent music company including distribution; founded in Brussels.'
  },
  {
    country: 'Brazil',
    name: 'Tratore',
    reach: 'Regional',
    url: 'https://www.tratore.com.br',
    note: 'Brazilian distributor and aggregator.'
  },
  {
    country: 'Canada',
    name: 'LANDR Distribution',
    reach: 'Global',
    url: 'https://www.landr.com/distribution/',
    note: 'Distribution product by LANDR.'
  },
  {
    country: 'China',
    name: 'Kanjian',
    reach: 'Regional',
    url: 'https://en.kanjian.com',
    note: 'Asia-focused music services including licensing and distribution tooling.'
  },
  {
    country: 'Colombia',
    name: 'Disetti Music',
    reach: 'Regional',
    url: 'https://www.disetti.com',
    note: 'Curated distribution platform with LatAm focus.'
  },
  {
    country: 'Finland',
    name: 'Musicinfo',
    reach: 'Regional',
    url: 'https://musicinfo.io',
    note: 'China-focused digital distribution and promotion.'
  },
  {
    country: 'France',
    name: 'Alter K',
    reach: 'Global',
    url: 'https://www.alter-k.com',
    note: 'Independent distributor with worldwide digital distribution.'
  },
  {
    country: 'France',
    name: 'Believe',
    reach: 'Global',
    url: 'https://www.believe.com',
    note: 'Global digital music company including TuneCore.'
  },
  {
    country: 'France',
    name: 'IDOL',
    reach: 'Global',
    url: 'https://idol.io',
    note: 'France-origin label services and digital distribution.'
  },
  {
    country: 'France',
    name: 'Wiseband',
    reach: 'Global',
    url: 'https://www.wiseband.com',
    note: 'Artist-facing distribution and promo tools.'
  },
  {
    country: 'Germany',
    name: 'FEIYR',
    reach: 'Global',
    url: 'https://www.feiyr.com',
    note: 'Germany-based digital distribution to major DSPs.'
  },
  {
    country: 'Germany',
    name: 'Kontor New Media',
    reach: 'Global',
    url: 'https://kontornewmedia.com',
    note: 'Germany-based distributor and label services.'
  },
  {
    country: 'Germany',
    name: 'recordJet',
    reach: 'Global',
    url: 'https://www.recordjet.com',
    note: 'Berlin-based digital music distribution.'
  },
  {
    country: 'Germany',
    name: 'Repost by SoundCloud',
    reach: 'Global',
    url: 'https://repost.soundcloud.com',
    note: 'SoundCloud distribution and monetization service.'
  },
  {
    country: 'Germany',
    name: 'Zebralution',
    reach: 'Global',
    url: 'https://www.zebralution.com',
    note: 'Germany-origin digital distribution and label services.'
  },
  {
    country: 'Japan',
    name: 'TuneCore Japan',
    reach: 'Local',
    url: 'https://www.tunecore.co.jp',
    note: 'Japan-operated TuneCore service for the Japanese market.'
  },
  {
    country: 'Mexico',
    name: 'Indiefy',
    reach: 'Global',
    url: 'https://indiefy.net',
    note: 'Mexico-based distributor targeting independent artists.'
  },
  {
    country: 'Netherlands',
    name: 'FUGA',
    reach: 'Global',
    url: 'https://fuga.com',
    note: 'B2B distribution and technology platform.'
  },
  {
    country: 'Norway',
    name: 'Soundrop',
    reach: 'Global',
    url: 'https://soundrop.com',
    note: 'Distribution service with cover-song and royalty split features.'
  },
  {
    country: 'South Africa',
    name: 'Africori',
    reach: 'Regional',
    url: 'https://www.africori.com',
    note: 'Africa-focused distribution and label services.'
  },
  {
    country: 'South Korea',
    name: 'Fluxus (Distribution)',
    reach: 'Regional',
    url: 'https://www.fluxus.co.kr/services/distribution',
    note: 'Korea-based digital and physical distribution services.'
  },
  {
    country: 'South Korea',
    name: 'POVU Collective',
    reach: 'Regional',
    url: 'https://www.pvco.co',
    note: 'Distributor and publisher based in Seoul.'
  },
  {
    country: 'Spain',
    name: 'Altafonte',
    reach: 'Regional',
    url: 'https://altafonte.com',
    note: 'Strong in Iberia and Latin America while distributing globally.'
  },
  {
    country: 'Sweden',
    name: 'Amuse',
    reach: 'Global',
    url: 'https://www.amuse.io',
    note: 'App-first distributor originating in Sweden.'
  },
  {
    country: 'Sweden',
    name: 'Record Union',
    reach: 'Global',
    url: 'https://www.recordunion.com',
    note: 'Sweden-based DIY distribution.'
  },
  {
    country: 'Switzerland',
    name: 'iMusician',
    reach: 'Global',
    url: 'https://imusician.pro',
    note: 'Switzerland-origin distributor with worldwide store delivery.'
  },
  {
    country: 'United Arab Emirates',
    name: 'FreshTunes',
    reach: 'Global',
    url: 'https://freshtunes.com',
    note: 'Free distribution platform.'
  },
  {
    country: 'United Arab Emirates',
    name: 'Qanawat Music',
    reach: 'Regional',
    url: 'https://www.qanawatdigital.com',
    note: 'MENA-focused digital distribution and solutions.'
  },
  {
    country: 'United Kingdom',
    name: 'AWAL',
    reach: 'Global',
    url: 'https://www.awal.com',
    note: 'Label services and distribution for selected artists.'
  },
  {
    country: 'United Kingdom',
    name: 'Ditto Music',
    reach: 'Global',
    url: 'https://dittomusic.com',
    note: 'Online distribution headquartered in Liverpool.'
  },
  {
    country: 'United Kingdom',
    name: 'EmuBands',
    reach: 'Global',
    url: 'https://www.emubands.com',
    note: 'Scotland-based digital distribution.'
  },
  {
    country: 'United Kingdom',
    name: 'Horus Music',
    reach: 'Global',
    url: 'https://www.horusmusic.global',
    note: 'UK-origin distributor and label services.'
  },
  {
    country: 'United Kingdom',
    name: 'Kudos Distribution',
    reach: 'Local',
    url: 'https://kudosdistribution.co.uk',
    note: 'UK independent physical and digital distributor with curated roster.'
  },
  {
    country: 'United Kingdom',
    name: 'LabelWorx',
    reach: 'Global',
    url: 'https://labelworx.com',
    note: 'Electronic music-focused label services and distribution.'
  },
  {
    country: 'United Kingdom',
    name: 'RouteNote',
    reach: 'Global',
    url: 'https://routenote.com',
    note: 'DIY distribution with free and premium tiers.'
  },
  {
    country: 'United States',
    name: 'CD Baby',
    reach: 'Global',
    url: 'https://cdbaby.com',
    note: 'Digital and physical distribution; can provide UPCs if needed.'
  },
  {
    country: 'United States',
    name: 'DistroKid',
    reach: 'Global',
    url: 'https://distrokid.com',
    note: 'Digital distributor and aggregator that commonly assigns UPC/EANs.'
  },
  {
    country: 'United States',
    name: 'EMPIRE',
    reach: 'Global',
    url: 'https://www.empi.re',
    note: 'Independent label and distribution company.'
  },
  {
    country: 'United States',
    name: 'Ingrooves Music Group',
    reach: 'Global',
    url: 'https://www.ingrooves.com',
    note: 'Distribution, marketing, and label services.'
  },
  {
    country: 'United States',
    name: 'ONErpm',
    reach: 'Global',
    url: 'https://www.onerpm.com',
    note: 'Global distribution and label services.'
  },
  {
    country: 'United States',
    name: 'Stem',
    reach: 'Global',
    url: 'https://stem.is',
    note: 'Invite-only distribution and label services.'
  },
  {
    country: 'United States',
    name: 'Symphonic Distribution',
    reach: 'Global',
    url: 'https://symphonic.com',
    note: 'Digital distribution and label services.'
  },
  {
    country: 'United States',
    name: 'The Orchard',
    reach: 'Global',
    url: 'https://theorchard.com',
    note: 'Distribution and label services.'
  },
  {
    country: 'United States',
    name: 'TuneCore',
    reach: 'Global',
    url: 'https://www.tunecore.com',
    note: 'Digital distributor and aggregator.'
  },
  {
    country: 'United States',
    name: 'UnitedMasters',
    reach: 'Global',
    url: 'https://unitedmasters.com',
    note: 'Distribution for independent artists.'
  },
  {
    country: 'United States',
    name: 'Vydia',
    reach: 'Global',
    url: 'https://www.vydia.com',
    note: 'Distribution and rights management.'
  }
]

export const MUSIC_DISTRIBUTORS = DISTRIBUTOR_SEEDS.sort(
  (a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name)
)

export const MUSIC_DISTRIBUTOR_NAMES = [...new Set(MUSIC_DISTRIBUTORS.map(distributor => distributor.name))]
  .sort((a, b) => a.localeCompare(b))

export function findMusicDistributor(name: string) {
  const query = name.trim().toLowerCase()
  if (!query) return null
  return MUSIC_DISTRIBUTORS.find(distributor => distributor.name.toLowerCase() === query) ?? null
}
