export interface PRO {
  name: string
  country: string
  region: string
  covers: 'Songwriters & Composers' | 'Performers & Recording Artists' | 'Both'
  url: string
  note?: string
  issuesIpi?: boolean
}
type PROSeed = Omit<PRO, 'region'>
const PRO_REGIONS = [
  'UK & Ireland',
  'North America',
  'Europe',
  'Asia-Pacific',
  'Latin America',
  'Africa & Middle East',
  'Global',
] as const
export { PRO_REGIONS }
export type PRORegion = typeof PRO_REGIONS[number]

function inferRegion(country: string): PRORegion {
  if (['United Kingdom', 'Ireland'].includes(country)) return 'UK & Ireland'
  if (['Canada', 'United States', 'Mexico', 'Belize'].includes(country)) return 'North America'
  if (['Albania', 'Andorra', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Croatia', 'Czechia', "Côte d'Ivoire", 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 'Greece', 'Holy See (Vatican City State)', 'Hungary', 'Iceland', 'Italy', 'Kazakhstan', 'Latvia', 'Lithuania', 'Luxembourg', 'Macedonia', 'Moldova, Republic of', 'Montenegro', 'Netherlands', 'New Caledonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russian Federation', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine'].includes(country)) return 'Europe'
  if (['Australia', 'China', 'Hong Kong', 'India', 'Indonesia', 'Japan', 'Korea, Republic of', 'Kyrgyzstan', 'Macao', 'Malaysia', 'Mongolia', 'Nepal', 'Philippines', 'Singapore', 'Taiwan, Chinese Taipei', 'Thailand', 'Viet Nam'].includes(country)) return 'Asia-Pacific'
  if (['Argentina', 'Barbados', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Dominican Republic', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'Jamaica', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Saint Lucia', 'Suriname', 'Trinidad and Tobago', 'Uruguay', 'Venezuela, Bolivarian Republic of'].includes(country)) return 'Latin America'
  if (['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Cabo Verde', 'Cameroon', 'Congo', 'Djibouti', 'Egypt', 'Ghana', 'Guinea', 'Israel', 'Kenya', 'Madagascar', 'Malawi', 'Mali', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Senegal', 'Seychelles', 'South Africa', 'Tanzania, United Republic of', 'Togo', 'Tunisia', 'Uganda', 'United Arab Emirates', 'Zambia', 'Zimbabwe'].includes(country)) return 'Africa & Middle East'
  return 'Global'
}

const PRO_SEEDS: PROSeed[] = [
  {
    country: 'Albania',
    name: 'ALBAUTOR',
    covers: 'Songwriters & Composers',
    url: 'https://www.albautor.net'
  },
  {
    country: 'Algeria',
    name: 'ONDA',
    covers: 'Songwriters & Composers',
    url: 'https://www.onda.dz'
  },
  {
    country: 'Andorra',
    name: 'SDADV',
    covers: 'Songwriters & Composers',
    url: 'https://www.sdadv.ad'
  },
  {
    country: 'Angola',
    name: 'UNAC-SA',
    covers: 'Songwriters & Composers',
    url: 'https://www.unacsa.ao/'
  },
  {
    country: 'Argentina',
    name: 'SADAIC',
    covers: 'Songwriters & Composers',
    url: 'https://www.sadaic.org.ar'
  },
  {
    country: 'Armenia',
    name: 'ARMAUTHOR NGO',
    covers: 'Songwriters & Composers',
    url: 'https://www.armauthor.am/en/'
  },
  {
    country: 'Australia',
    name: 'AMCOS',
    covers: 'Songwriters & Composers',
    url: 'https://apraamcos.com.au',
    note: 'Australasian mechanical rights society'
  },
  {
    country: 'Australia',
    name: 'APRA',
    covers: 'Songwriters & Composers',
    url: 'https://apraamcos.com.au',
    note: 'Australasian performing rights organisation'
  },
  {
    country: 'Austria',
    name: 'AKM',
    covers: 'Songwriters & Composers',
    url: 'https://www.akm.at'
  },
  {
    country: 'Azerbaijan',
    name: 'AAS',
    covers: 'Songwriters & Composers',
    url: 'https://www.authors.az'
  },
  {
    country: 'Barbados',
    name: 'COSCAP',
    covers: 'Songwriters & Composers',
    url: 'https://www.coscap.org'
  },
  {
    country: 'Belarus',
    name: 'NCIP',
    covers: 'Songwriters & Composers',
    url: 'https://www.ncip.by/'
  },
  {
    country: 'Belgium',
    name: 'SABAM',
    covers: 'Songwriters & Composers',
    url: 'https://www.sabam.be'
  },
  {
    country: 'Belize',
    name: 'BSCAP',
    covers: 'Songwriters & Composers',
    url: 'https://www.bscap.bz'
  },
  {
    country: 'Benin',
    name: 'BUBEDRA',
    covers: 'Songwriters & Composers',
    url: 'https://www.bubedra.org'
  },
  {
    country: 'Bolivia',
    name: 'SOBODAYCOM',
    covers: 'Songwriters & Composers',
    url: 'https://www.sobodaycom.org'
  },
  {
    country: 'Bosnia and Herzegovina',
    name: 'AMUS',
    covers: 'Songwriters & Composers',
    url: 'https://www.amus.ba'
  },
  {
    country: 'Botswana',
    name: 'COSBOTS',
    covers: 'Songwriters & Composers',
    url: 'https://cosbots.com/'
  },
  {
    country: 'Brazil',
    name: 'ABRAMUS',
    covers: 'Both',
    url: 'https://www.abramus.org.br'
  },
  {
    country: 'Brazil',
    name: 'AMAR',
    covers: 'Songwriters & Composers',
    url: 'https://www.amar.art.br'
  },
  {
    country: 'Brazil',
    name: 'ASSIM',
    covers: 'Songwriters & Composers',
    url: 'https://www.assim.org.br'
  },
  {
    country: 'Brazil',
    name: 'ECAD',
    covers: 'Both',
    url: 'https://www4.ecad.org.br/',
    note: 'Central collection office'
  },
  {
    country: 'Brazil',
    name: 'SBACEM',
    covers: 'Songwriters & Composers',
    url: 'https://www.sbacem.org.br'
  },
  {
    country: 'Brazil',
    name: 'SICAM',
    covers: 'Songwriters & Composers',
    url: 'https://www.sicam.org.br'
  },
  {
    country: 'Brazil',
    name: 'SOCINPRO',
    covers: 'Songwriters & Composers',
    url: 'https://www.socinpro.org.br'
  },
  {
    country: 'Brazil',
    name: 'UBC',
    covers: 'Songwriters & Composers',
    url: 'https://www.ubc.org.br'
  },
  {
    country: 'Bulgaria',
    name: 'MUSICAUTOR',
    covers: 'Songwriters & Composers',
    url: 'https://www.musicautor.org'
  },
  {
    country: 'Burkina Faso',
    name: 'BBDA',
    covers: 'Songwriters & Composers',
    url: 'https://www.bbda.bf'
  },
  {
    country: 'Cabo Verde',
    name: 'SCM-COOPERATIVA',
    covers: 'Songwriters & Composers',
    url: 'https://www.scm.cv/'
  },
  {
    country: 'Cameroon',
    name: 'CMC',
    covers: 'Songwriters & Composers',
    url: '',
    note: 'Physical application only — no official website'
  },
  {
    country: 'Canada',
    name: 'CMRRA',
    covers: 'Songwriters & Composers',
    url: 'https://www.cmrra.ca',
    note: 'Mechanical licensing collective'
  },
  {
    country: 'Canada',
    name: 'SOCAN',
    covers: 'Songwriters & Composers',
    url: 'https://www.socan.com'
  },
  {
    country: 'Canada',
    name: 'SODRAC',
    covers: 'Songwriters & Composers',
    url: 'https://www.sodrac.ca'
  },
  {
    country: 'Chile',
    name: 'SCD',
    covers: 'Songwriters & Composers',
    url: 'https://www.scd.cl'
  },
  {
    country: 'China',
    name: 'MCSC',
    covers: 'Songwriters & Composers',
    url: 'https://www.mcsc.com.cn'
  },
  {
    country: 'Colombia',
    name: 'ACINPRO',
    covers: 'Performers & Recording Artists',
    url: 'https://acinpro.org.co/',
    note: 'Neighbouring rights organisation',
    issuesIpi: false
  },
  {
    country: 'Colombia',
    name: 'SAYCO',
    covers: 'Songwriters & Composers',
    url: 'https://www.sayco.org'
  },
  {
    country: 'Congo',
    name: 'BCDA',
    covers: 'Songwriters & Composers',
    url: 'https://www.bcda-congo.org'
  },
  {
    country: 'Costa Rica',
    name: 'ACAM',
    covers: 'Songwriters & Composers',
    url: 'https://www.acam.cr'
  },
  {
    country: 'Croatia',
    name: 'HDS-ZAMP',
    covers: 'Songwriters & Composers',
    url: 'https://www.zamp.hr'
  },
  {
    country: 'Cuba',
    name: 'ACDAM',
    covers: 'Songwriters & Composers',
    url: 'https://www.acdam.cu'
  },
  {
    country: 'Czechia',
    name: 'OSA',
    covers: 'Songwriters & Composers',
    url: 'https://www.osa.cz/'
  },
  {
    country: "Côte d'Ivoire",
    name: 'BURIDA',
    covers: 'Songwriters & Composers',
    url: 'https://www.buridaci.com'
  },
  {
    country: 'Denmark',
    name: 'KODA',
    covers: 'Songwriters & Composers',
    url: 'https://www.koda.dk'
  },
  {
    country: 'Djibouti',
    name: 'ODDA',
    covers: 'Songwriters & Composers',
    url: '',
    note: 'Physical application only — no official website'
  },
  {
    country: 'Dominican Republic',
    name: 'SGACEDOM',
    covers: 'Songwriters & Composers',
    url: 'https://www.sgacedom.com'
  },
  {
    country: 'Ecuador',
    name: 'SAYCE',
    covers: 'Songwriters & Composers',
    url: 'https://www.sayce.com.ec'
  },
  {
    country: 'Egypt',
    name: 'SACERAU',
    covers: 'Songwriters & Composers',
    url: '',
    note: 'Physical application only — no official website'
  },
  {
    country: 'El Salvador',
    name: 'SACIM EGC',
    covers: 'Songwriters & Composers',
    url: 'https://www.sacim.org'
  },
  {
    country: 'Estonia',
    name: 'EAU',
    covers: 'Songwriters & Composers',
    url: 'https://www.eau.org'
  },
  {
    country: 'Finland',
    name: 'KOPIOSTO',
    covers: 'Both',
    url: 'https://www.kopiosto.fi/',
    note: 'Collective rights organisation'
  },
  {
    country: 'Finland',
    name: 'TEOSTO',
    covers: 'Songwriters & Composers',
    url: 'https://www.teosto.fi'
  },
  {
    country: 'France',
    name: 'SACEM',
    covers: 'Songwriters & Composers',
    url: 'https://www.sacem.fr'
  },
  {
    country: 'Georgia',
    name: 'GCA',
    covers: 'Songwriters & Composers',
    url: 'https://www.gca.ge'
  },
  {
    country: 'Germany',
    name: 'GEMA',
    covers: 'Songwriters & Composers',
    url: 'https://www.gema.de'
  },
  {
    country: 'Ghana',
    name: 'GHAMRO',
    covers: 'Songwriters & Composers',
    url: 'https://ghamroonline.org/'
  },
  {
    country: 'Greece',
    name: 'AUTODIA',
    covers: 'Songwriters & Composers',
    url: 'https://www.autodia.gr'
  },
  {
    country: 'Greece',
    name: 'EDEM',
    covers: 'Songwriters & Composers',
    url: 'https://www.edemrights.gr/'
  },
  {
    country: 'Greece',
    name: 'ORFIUM GREECE',
    covers: 'Both',
    url: 'https://orfium.com/',
    note: 'Rights administration platform',
    issuesIpi: false
  },
  {
    country: 'Guatemala',
    name: 'AEI-GUATEMALA',
    covers: 'Songwriters & Composers',
    url: 'https://www.aei-guatemala.org'
  },
  {
    country: 'Guinea',
    name: 'BGDA',
    covers: 'Songwriters & Composers',
    url: '',
    note: 'Physical application only — no official website'
  },
  {
    country: 'Holy See (Vatican City State)',
    name: 'UFFICIO GIURIDICO',
    covers: 'Songwriters & Composers',
    url: 'https://www.vaticanstate.va',
    note: 'Legal office entry from supplied list',
    issuesIpi: false
  },
  {
    country: 'Honduras',
    name: 'AACIMH',
    covers: 'Songwriters & Composers',
    url: 'https://www.aacimh.org.hn/'
  },
  {
    country: 'Hong Kong',
    name: 'CASH',
    covers: 'Songwriters & Composers',
    url: 'https://www.cash.org.hk'
  },
  {
    country: 'Hungary',
    name: 'ARTISJUS',
    covers: 'Songwriters & Composers',
    url: 'https://www.artisjus.hu'
  },
  {
    country: 'Iceland',
    name: 'STEF',
    covers: 'Songwriters & Composers',
    url: 'https://www.stef.is'
  },
  {
    country: 'India',
    name: 'IPRS',
    covers: 'Songwriters & Composers',
    url: 'https://www.iprs.org/'
  },
  {
    country: 'Indonesia',
    name: 'WAMI',
    covers: 'Songwriters & Composers',
    url: 'https://www.wami.id/'
  },
  {
    country: 'Ireland',
    name: 'IMRO',
    covers: 'Songwriters & Composers',
    url: 'https://www.imro.ie'
  },
  {
    country: 'Israel',
    name: 'ACUM',
    covers: 'Songwriters & Composers',
    url: 'https://www.acum.org.il'
  },
  {
    country: 'Italy',
    name: 'SIAE',
    covers: 'Songwriters & Composers',
    url: 'https://www.siae.it'
  },
  {
    country: 'Italy',
    name: 'SOUNDREEF',
    covers: 'Songwriters & Composers',
    url: 'https://www.soundreef.com/'
  },
  {
    country: 'Jamaica',
    name: 'JACAP',
    covers: 'Songwriters & Composers',
    url: 'https://www.jacapjamaica.com'
  },
  {
    country: 'Japan',
    name: 'JASRAC',
    covers: 'Songwriters & Composers',
    url: 'https://www.jasrac.or.jp/ejhp/index.htm'
  },
  {
    country: 'Japan',
    name: 'NEXTONE',
    covers: 'Songwriters & Composers',
    url: 'https://www.nex-tone.co.jp/en/'
  },
  {
    country: 'Kazakhstan',
    name: 'ABYROY',
    covers: 'Songwriters & Composers',
    url: 'https://www.abyroy.kz'
  },
  {
    country: 'Kazakhstan',
    name: 'KazAK',
    covers: 'Songwriters & Composers',
    url: 'https://kazak.kz'
  },
  {
    country: 'Kenya',
    name: 'MCSK',
    covers: 'Songwriters & Composers',
    url: 'https://mcsk.org/membership'
  },
  {
    country: 'Korea, Republic of',
    name: 'KOMCA',
    covers: 'Songwriters & Composers',
    url: 'https://www.komca.or.kr'
  },
  {
    country: 'Korea, Republic of',
    name: 'KOSCAP',
    covers: 'Songwriters & Composers',
    url: 'https://www.koscap.or.kr/'
  },
  {
    country: 'Kyrgyzstan',
    name: 'KYRGYZPATENT',
    covers: 'Songwriters & Composers',
    url: '',
    note: 'Physical application only — no official website'
  },
  {
    country: 'Latvia',
    name: 'AKKA/LAA',
    covers: 'Songwriters & Composers',
    url: 'https://www.akka-laa.lv'
  },
  {
    country: 'Lithuania',
    name: 'LATGA',
    covers: 'Songwriters & Composers',
    url: 'https://www.latga.lt'
  },
  {
    country: 'Luxembourg',
    name: 'SACEM LUXEMBOURG',
    covers: 'Songwriters & Composers',
    url: 'https://www.sacem.lu'
  },
  {
    country: 'Macao',
    name: 'MACA',
    covers: 'Songwriters & Composers',
    url: 'https://www.maca.org.mo'
  },
  {
    country: 'Macedonia',
    name: 'ZAMP MACEDONIA',
    covers: 'Songwriters & Composers',
    url: 'https://www.zamp.com.mk/'
  },
  {
    country: 'Madagascar',
    name: 'OMDA',
    covers: 'Songwriters & Composers',
    url: 'https://www.omda.mg'
  },
  {
    country: 'Malawi',
    name: 'COSOMA',
    covers: 'Songwriters & Composers',
    url: 'https://www.cosoma.mw'
  },
  {
    country: 'Malaysia',
    name: 'MACP',
    covers: 'Songwriters & Composers',
    url: 'https://www.macp.com.my'
  },
  {
    country: 'Mali',
    name: 'BUMDA',
    covers: 'Songwriters & Composers',
    url: 'https://www.bumda.ml'
  },
  {
    country: 'Mauritius',
    name: 'MASA',
    covers: 'Songwriters & Composers',
    url: 'https://masa.govmu.org'
  },
  {
    country: 'Mexico',
    name: 'ANDI',
    covers: 'Performers & Recording Artists',
    url: 'https://www.andi.org.mx/',
    note: 'Performers rights organisation',
    issuesIpi: false
  },
  {
    country: 'Mexico',
    name: 'EJE EJECUTANTES',
    covers: 'Performers & Recording Artists',
    url: 'https://www.ejecutantes.com/',
    note: 'Performers rights organisation',
    issuesIpi: false
  },
  {
    country: 'Mexico',
    name: 'SACM',
    covers: 'Songwriters & Composers',
    url: 'https://www.sacm.org.mx'
  },
  {
    country: 'Moldova, Republic of',
    name: 'ANCO',
    covers: 'Songwriters & Composers',
    url: 'https://copyright.md/'
  },
  {
    country: 'Mongolia',
    name: 'MOSCAP',
    covers: 'Songwriters & Composers',
    url: 'https://www.moscap.mn'
  },
  {
    country: 'Montenegro',
    name: 'PAM CG',
    covers: 'Songwriters & Composers',
    url: 'https://www.pam.org.me'
  },
  {
    country: 'Morocco',
    name: 'BMDA',
    covers: 'Songwriters & Composers',
    url: '',
    note: 'Physical application only — no official website'
  },
  {
    country: 'Mozambique',
    name: 'SOMAS',
    covers: 'Songwriters & Composers',
    url: '',
    note: 'Physical application only — no official website'
  },
  {
    country: 'Namibia',
    name: 'NASCAM',
    covers: 'Songwriters & Composers',
    url: 'https://www.nascam.org'
  },
  {
    country: 'Nepal',
    name: 'MRCSN',
    covers: 'Songwriters & Composers',
    url: 'https://www.mrcsn.org'
  },
  {
    country: 'Netherlands',
    name: 'BUMASTEMRA',
    covers: 'Songwriters & Composers',
    url: 'https://www.bumastemra.nl'
  },
  {
    country: 'New Caledonia',
    name: 'SACENC',
    covers: 'Songwriters & Composers',
    url: 'https://www.sacenc.nc'
  },
  {
    country: 'Nicaragua',
    name: 'NICAUTOR',
    covers: 'Songwriters & Composers',
    url: '',
    note: 'Physical application only — no official website'
  },
  {
    country: 'Niger',
    name: 'BNDA',
    covers: 'Songwriters & Composers',
    url: '',
    note: 'Physical application only — no official website'
  },
  {
    country: 'Nigeria',
    name: 'COSON',
    covers: 'Both',
    url: 'https://www.cosonng.com'
  },
  {
    country: 'Nigeria',
    name: 'MCSN',
    covers: 'Songwriters & Composers',
    url: 'https://www.mcsnnigeria.org'
  },
  {
    country: 'Norway',
    name: 'TONO',
    covers: 'Songwriters & Composers',
    url: 'https://www.tono.no'
  },
  {
    country: 'Panama',
    name: 'SPAC',
    covers: 'Songwriters & Composers',
    url: 'https://www.spac.org.pa'
  },
  {
    country: 'Paraguay',
    name: 'APA',
    covers: 'Songwriters & Composers',
    url: 'https://www.apa.org.py'
  },
  {
    country: 'Peru',
    name: 'APDAYC',
    covers: 'Songwriters & Composers',
    url: 'https://www.apdayc.org.pe'
  },
  {
    country: 'Philippines',
    name: 'FILSCAP',
    covers: 'Songwriters & Composers',
    url: 'https://www.filscap.com.ph'
  },
  {
    country: 'Poland',
    name: 'ZAIKS',
    covers: 'Songwriters & Composers',
    url: 'https://www.zaiks.org.pl/'
  },
  {
    country: 'Portugal',
    name: 'SPA',
    covers: 'Songwriters & Composers',
    url: 'https://www.spautores.pt'
  },
  {
    country: 'Romania',
    name: 'UCMR-ADA',
    covers: 'Songwriters & Composers',
    url: 'https://www.ucmr-ada.ro/'
  },
  {
    country: 'Russian Federation',
    name: 'RAO',
    covers: 'Songwriters & Composers',
    url: 'https://www.rao.ru'
  },
  {
    country: 'Russian Federation',
    name: 'RUR',
    covers: 'Both',
    url: 'https://rp-union.ru'
  },
  {
    country: 'Rwanda',
    name: 'RSAU',
    covers: 'Songwriters & Composers',
    url: 'https://rsau.rw'
  },
  {
    country: 'Saint Lucia',
    name: 'ECCO',
    covers: 'Songwriters & Composers',
    url: 'https://www.eccorights.org'
  },
  {
    country: 'Senegal',
    name: 'SODAV',
    covers: 'Songwriters & Composers',
    url: 'https://sodav.sn/membre/'
  },
  {
    country: 'Serbia',
    name: 'SOKOJ',
    covers: 'Songwriters & Composers',
    url: 'https://www.sokoj.rs'
  },
  {
    country: 'Seychelles',
    name: 'SACS',
    covers: 'Songwriters & Composers',
    url: '',
    note: 'Physical application only — no official website'
  },
  {
    country: 'Singapore',
    name: 'COMPASS',
    covers: 'Songwriters & Composers',
    url: 'https://www.compass.org.sg'
  },
  {
    country: 'Slovakia',
    name: 'SOZA',
    covers: 'Songwriters & Composers',
    url: 'https://www.soza.sk'
  },
  {
    country: 'Slovenia',
    name: 'SAZAS',
    covers: 'Songwriters & Composers',
    url: 'https://www.sazas.org'
  },
  {
    country: 'South Africa',
    name: 'CAPASSO',
    covers: 'Songwriters & Composers',
    url: 'https://www.capasso.co.za',
    note: 'Mechanical rights organisation'
  },
  {
    country: 'South Africa',
    name: 'SAMRO',
    covers: 'Songwriters & Composers',
    url: 'https://www.samro.org.za'
  },
  {
    country: 'Spain',
    name: 'EKKI',
    covers: 'Songwriters & Composers',
    url: 'https://www.ekki.eus/'
  },
  {
    country: 'Spain',
    name: 'SGAE',
    covers: 'Songwriters & Composers',
    url: 'https://www.sgae.es'
  },
  {
    country: 'Spain',
    name: 'UNISON',
    covers: 'Songwriters & Composers',
    url: 'https://www.unisonrights.es/'
  },
  {
    country: 'Suriname',
    name: 'SASUR',
    covers: 'Songwriters & Composers',
    url: 'https://www.sasur.org'
  },
  {
    country: 'Sweden',
    name: 'STIM',
    covers: 'Songwriters & Composers',
    url: 'https://www.stim.se'
  },
  {
    country: 'Switzerland',
    name: 'SUISA',
    covers: 'Songwriters & Composers',
    url: 'https://www.suisa.ch'
  },
  {
    country: 'Taiwan, Chinese Taipei',
    name: 'MÜST',
    covers: 'Songwriters & Composers',
    url: 'https://www.must.org.tw'
  },
  {
    country: 'Tanzania, United Republic of',
    name: 'COSOTA',
    covers: 'Songwriters & Composers',
    url: 'https://www.cosota.go.tz'
  },
  {
    country: 'Thailand',
    name: 'MCT',
    covers: 'Songwriters & Composers',
    url: 'https://www.mct.in.th'
  },
  {
    country: 'Togo',
    name: 'BUTODRA',
    covers: 'Songwriters & Composers',
    url: 'https://www.butodra.com'
  },
  {
    country: 'Trinidad and Tobago',
    name: 'ACCS',
    covers: 'Songwriters & Composers',
    url: 'https://accscaribbean.com'
  },
  {
    country: 'Trinidad and Tobago',
    name: 'COTT',
    covers: 'Songwriters & Composers',
    url: 'https://www.cott.org.tt'
  },
  {
    country: 'Tunisia',
    name: 'OTDAV',
    covers: 'Songwriters & Composers',
    url: 'https://www.otdav.tn'
  },
  {
    country: 'Turkey',
    name: 'MESAM',
    covers: 'Songwriters & Composers',
    url: 'https://www.mesam.org.tr'
  },
  {
    country: 'Turkey',
    name: 'MSG',
    covers: 'Songwriters & Composers',
    url: 'https://www.msg.org.tr'
  },
  {
    country: 'Uganda',
    name: 'UPRS',
    covers: 'Songwriters & Composers',
    url: 'https://www.uprs.biz'
  },
  {
    country: 'Ukraine',
    name: 'UACRR',
    covers: 'Songwriters & Composers',
    url: 'https://www.uacrr.org'
  },
  {
    country: 'United Arab Emirates',
    name: 'ESMAA',
    covers: 'Songwriters & Composers',
    url: 'https://esmaamusic.com/'
  },
  {
    country: 'United Kingdom',
    name: 'MCPS',
    covers: 'Songwriters & Composers',
    url: 'https://www.prsformusic.com/join',
    note: 'Mechanical rights society'
  },
  {
    country: 'United Kingdom',
    name: 'PRS',
    covers: 'Songwriters & Composers',
    url: 'https://www.prsformusic.com/join',
    note: 'PRS for Music'
  },
  {
    country: 'United States',
    name: 'ALLTRACK',
    covers: 'Songwriters & Composers',
    url: 'https://www.alltrack.com/',
    note: 'Rights administration platform',
    issuesIpi: false
  },
  {
    country: 'United States',
    name: 'AMRA',
    covers: 'Songwriters & Composers',
    url: 'https://www.amra.com',
    note: 'Rights administration platform',
    issuesIpi: false
  },
  {
    country: 'United States',
    name: 'ASCAP',
    covers: 'Songwriters & Composers',
    url: 'https://ome.ascap.com/'
  },
  {
    country: 'United States',
    name: 'BMI',
    covers: 'Songwriters & Composers',
    url: 'https://www.bmi.com/join'
  },
  {
    country: 'United States',
    name: 'GMR',
    covers: 'Songwriters & Composers',
    url: 'https://globalmusicrights.com/'
  },
  {
    country: 'United States',
    name: 'SESAC',
    covers: 'Songwriters & Composers',
    url: 'https://www.sesac.com'
  },
  {
    country: 'Uruguay',
    name: 'AGADU',
    covers: 'Songwriters & Composers',
    url: 'https://www.agadu.org'
  },
  {
    country: 'Venezuela, Bolivarian Republic of',
    name: 'SACVEN',
    covers: 'Songwriters & Composers',
    url: 'https://www.sacven.org'
  },
  {
    country: 'Viet Nam',
    name: 'VCPMC',
    covers: 'Songwriters & Composers',
    url: 'https://www.vcpmc.org'
  },
  {
    country: 'Zambia',
    name: 'ZAMCOPS',
    covers: 'Songwriters & Composers',
    url: 'https://www.zamcops.org/'
  },
  {
    country: 'Zimbabwe',
    name: 'ZIMURA',
    covers: 'Songwriters & Composers',
    url: 'https://www.zimura.co.zw'
  },
  {
    country: 'United Kingdom',
    name: 'PPL',
    covers: 'Performers & Recording Artists',
    url: 'https://www.ppluk.com/',
    note: 'For performers & recording artists — does not issue IPI',
    issuesIpi: false
  },
]

export const PRO_CMO_LIST: PRO[] = PRO_SEEDS
  .map(seed => ({ ...seed, region: inferRegion(seed.country) }))
  .sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name))

export const IPI_ISSUING_PROS = PRO_CMO_LIST.filter(
  p => p.issuesIpi !== false && p.covers !== 'Performers & Recording Artists'
)

export const PRO_CMO_NAMES = [...new Set(PRO_CMO_LIST.map(p => p.name))].sort((a, b) => a.localeCompare(b))
