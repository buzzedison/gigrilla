export interface PRO {
  name: string
  country: string
  region: string
  /** What rights this PRO represents */
  covers: 'Songwriters & Composers' | 'Performers & Recording Artists' | 'Both'
  url: string
  /** Brief note shown under the name */
  note?: string
}

/**
 * Global list of Performance Rights Organisations (PROs) and
 * Collective Management Organisations (CMOs).
 *
 * Joining a PRO issues an IPI/CAE number for songwriters, lyricists, and composers.
 * Performer-only PROs (e.g. PPL) do NOT issue IPI numbers.
 */
export const PRO_CMO_LIST: PRO[] = [
  // ── United Kingdom & Ireland ───────────────────────────────────────────────
  {
    name: 'PRS for Music',
    country: 'United Kingdom',
    region: 'UK & Ireland',
    covers: 'Songwriters & Composers',
    url: 'https://www.prsformusic.com/',
    note: 'Issues IPI numbers to songwriters, composers & lyricists'
  },
  {
    name: 'PPL',
    country: 'United Kingdom',
    region: 'UK & Ireland',
    covers: 'Performers & Recording Artists',
    url: 'https://www.ppluk.com/',
    note: 'For performers & recording artists — does not issue IPI'
  },
  {
    name: 'IMRO',
    country: 'Ireland',
    region: 'UK & Ireland',
    covers: 'Songwriters & Composers',
    url: 'https://www.imro.ie/',
    note: 'Irish Music Rights Organisation'
  },
  // ── North America ──────────────────────────────────────────────────────────
  {
    name: 'ASCAP',
    country: 'United States',
    region: 'North America',
    covers: 'Songwriters & Composers',
    url: 'https://www.ascap.com/',
    note: 'American Society of Composers, Authors & Publishers'
  },
  {
    name: 'BMI',
    country: 'United States',
    region: 'North America',
    covers: 'Songwriters & Composers',
    url: 'https://www.bmi.com/',
    note: 'Broadcast Music, Inc.'
  },
  {
    name: 'SESAC',
    country: 'United States',
    region: 'North America',
    covers: 'Songwriters & Composers',
    url: 'https://www.sesac.com/',
    note: 'Invite-only or application-based'
  },
  {
    name: 'GMR',
    country: 'United States',
    region: 'North America',
    covers: 'Songwriters & Composers',
    url: 'https://globalmusicrights.com/',
    note: 'Global Music Rights — invite-only'
  },
  {
    name: 'SOCAN',
    country: 'Canada',
    region: 'North America',
    covers: 'Songwriters & Composers',
    url: 'https://www.socan.com/',
    note: 'Society of Composers, Authors & Music Publishers of Canada'
  },
  // ── Europe ─────────────────────────────────────────────────────────────────
  {
    name: 'GEMA',
    country: 'Germany',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.gema.de/',
    note: 'Germany'
  },
  {
    name: 'SACEM',
    country: 'France',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.sacem.fr/',
    note: 'France'
  },
  {
    name: 'STIM',
    country: 'Sweden',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.stim.se/',
    note: 'Sweden'
  },
  {
    name: 'TONO',
    country: 'Norway',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.tono.no/',
    note: 'Norway'
  },
  {
    name: 'KODA',
    country: 'Denmark',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://koda.dk/',
    note: 'Denmark'
  },
  {
    name: 'Teosto',
    country: 'Finland',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.teosto.fi/',
    note: 'Finland'
  },
  {
    name: 'Buma/Stemra',
    country: 'Netherlands',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.bumastemra.nl/',
    note: 'Netherlands'
  },
  {
    name: 'SABAM',
    country: 'Belgium',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.sabam.be/',
    note: 'Belgium'
  },
  {
    name: 'SGAE',
    country: 'Spain',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.sgae.es/',
    note: 'Spain'
  },
  {
    name: 'SPA',
    country: 'Portugal',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.spautores.pt/',
    note: 'Portugal — Sociedade Portuguesa de Autores'
  },
  {
    name: 'SIAE',
    country: 'Italy',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.siae.it/',
    note: 'Italy — Società Italiana degli Autori ed Editori'
  },
  {
    name: 'SUISA',
    country: 'Switzerland',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.suisa.ch/',
    note: 'Switzerland'
  },
  {
    name: 'AKM',
    country: 'Austria',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.akm.at/',
    note: 'Austria'
  },
  {
    name: 'OSA',
    country: 'Czech Republic',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.osa.cz/',
    note: 'Czech Republic'
  },
  {
    name: 'ZAiKS',
    country: 'Poland',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.zaiks.org.pl/',
    note: 'Poland'
  },
  {
    name: 'AEPI',
    country: 'Greece',
    region: 'Europe',
    covers: 'Songwriters & Composers',
    url: 'https://www.aepi.gr/',
    note: 'Greece'
  },
  // ── Asia-Pacific ───────────────────────────────────────────────────────────
  {
    name: 'APRA AMCOS',
    country: 'Australia & New Zealand',
    region: 'Asia-Pacific',
    covers: 'Songwriters & Composers',
    url: 'https://www.apraamcos.com.au/',
    note: 'Australia & New Zealand'
  },
  {
    name: 'JASRAC',
    country: 'Japan',
    region: 'Asia-Pacific',
    covers: 'Songwriters & Composers',
    url: 'https://www.jasrac.or.jp/',
    note: 'Japan — Japanese Society for Rights of Authors, Composers & Publishers'
  },
  {
    name: 'KOMCA',
    country: 'South Korea',
    region: 'Asia-Pacific',
    covers: 'Songwriters & Composers',
    url: 'https://www.komca.or.kr/',
    note: 'South Korea — Korean Music Copyright Association'
  },
  {
    name: 'MCSC',
    country: 'China',
    region: 'Asia-Pacific',
    covers: 'Songwriters & Composers',
    url: 'https://www.mcsc.com.cn/',
    note: 'China — Music Copyright Society of China'
  },
  {
    name: 'IPRS',
    country: 'India',
    region: 'Asia-Pacific',
    covers: 'Songwriters & Composers',
    url: 'https://www.iprs.org/',
    note: 'India — Indian Performing Right Society'
  },
  // ── Latin America ──────────────────────────────────────────────────────────
  {
    name: 'ECAD',
    country: 'Brazil',
    region: 'Latin America',
    covers: 'Songwriters & Composers',
    url: 'https://www.ecad.org.br/',
    note: 'Brazil'
  },
  {
    name: 'SACM',
    country: 'Mexico',
    region: 'Latin America',
    covers: 'Songwriters & Composers',
    url: 'https://www.sacm.org.mx/',
    note: 'Mexico — Sociedad de Autores y Compositores de Música'
  },
  {
    name: 'SADAIC',
    country: 'Argentina',
    region: 'Latin America',
    covers: 'Songwriters & Composers',
    url: 'https://www.sadaic.org.ar/',
    note: 'Argentina'
  },
  // ── Africa & Middle East ───────────────────────────────────────────────────
  {
    name: 'SAMRO',
    country: 'South Africa',
    region: 'Africa & Middle East',
    covers: 'Songwriters & Composers',
    url: 'https://www.samro.org.za/',
    note: 'South Africa — Southern African Music Rights Organisation'
  },
]

/** Unique regions in display order */
export const PRO_REGIONS = [
  'UK & Ireland',
  'North America',
  'Europe',
  'Asia-Pacific',
  'Latin America',
  'Africa & Middle East',
] as const

export type PRORegion = typeof PRO_REGIONS[number]

/** Filter PROs to only those that issue IPI numbers (i.e. for songwriters/composers) */
export const IPI_ISSUING_PROS = PRO_CMO_LIST.filter(
  p => p.covers === 'Songwriters & Composers'
)
