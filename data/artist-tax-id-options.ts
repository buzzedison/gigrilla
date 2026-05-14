export type ArtistTaxIdFieldKey =
  | 'generic_tax_id'
  | 'individual_tax_id'
  | 'business_tax_id'
  | 'vat_gst_sst_id'

export interface ArtistTaxIdField {
  key: ArtistTaxIdFieldKey
  label: string
  localName: string
  example: string
}

export interface ArtistTaxIdCountryProfile {
  countryName: string
  aliases?: string[]
  authority: string
  fields: ArtistTaxIdField[]
}

export const ARTIST_TAX_ID_FIELD_KEYS: ArtistTaxIdFieldKey[] = [
  'generic_tax_id',
  'individual_tax_id',
  'business_tax_id',
  'vat_gst_sst_id'
]

const DEFAULT_TAX_ID_FIELDS: ArtistTaxIdField[] = [
  {
    key: 'generic_tax_id',
    label: 'Generic/Tax ID',
    localName: 'Local Name',
    example: 'Local format'
  },
  {
    key: 'individual_tax_id',
    label: 'Individual Tax ID',
    localName: 'Local Name',
    example: 'Local format'
  },
  {
    key: 'business_tax_id',
    label: 'Business Tax ID',
    localName: 'Local Name',
    example: 'Local format'
  },
  {
    key: 'vat_gst_sst_id',
    label: 'VAT/GST/SST ID',
    localName: 'Local Name',
    example: 'Local format'
  }
]

const ARTIST_TAX_ID_COUNTRY_PROFILES: ArtistTaxIdCountryProfile[] = [
  {
    countryName: '\u00c5land Islands',
    aliases: ['Aland Islands'],
    authority: 'Finnish Tax Administration',
    fields: [
      {
        key: 'individual_tax_id',
        label: 'Individual Tax ID',
        localName: 'Personal Identity Code',
        example: '131052-308T'
      },
      {
        key: 'business_tax_id',
        label: 'Business Tax ID',
        localName: 'Business ID',
        example: '1234567-8'
      },
      {
        key: 'vat_gst_sst_id',
        label: 'VAT/GST/SST ID',
        localName: 'ALV Number',
        example: '1234567-8'
      }
    ]
  },
  {
    countryName: 'Albania',
    authority: 'General Directorate of Taxation',
    fields: [
      {
        key: 'generic_tax_id',
        label: 'Generic/Tax ID',
        localName: 'NIPT',
        example: 'J12345678N'
      },
      {
        key: 'vat_gst_sst_id',
        label: 'VAT/GST/SST ID',
        localName: 'VAT NIPT',
        example: 'J12345678N'
      }
    ]
  },
  {
    countryName: 'American Samoa',
    authority: 'Tax Office, American Samoa Government',
    fields: [
      {
        key: 'individual_tax_id',
        label: 'Individual Tax ID',
        localName: 'SSN/ITIN',
        example: '123-45-6789'
      },
      {
        key: 'business_tax_id',
        label: 'Business Tax ID',
        localName: 'EIN',
        example: '12-3456789'
      }
    ]
  }
]

const normalizeCountryName = (countryName: string) =>
  countryName
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const profileByCountryName = ARTIST_TAX_ID_COUNTRY_PROFILES.reduce((map, profile) => {
  map.set(normalizeCountryName(profile.countryName), profile)
  profile.aliases?.forEach((alias) => map.set(normalizeCountryName(alias), profile))
  return map
}, new Map<string, ArtistTaxIdCountryProfile>())

export const ARTIST_TAX_ID_COUNTRY_NAMES = ARTIST_TAX_ID_COUNTRY_PROFILES.map((profile) => profile.countryName)

export function getArtistTaxIdProfile(countryName?: string | null): ArtistTaxIdCountryProfile {
  const trimmedCountryName = countryName?.trim()
  const matchedProfile = trimmedCountryName
    ? profileByCountryName.get(normalizeCountryName(trimmedCountryName))
    : null

  if (matchedProfile) return matchedProfile

  return {
    countryName: trimmedCountryName || 'Selected country',
    authority: 'Local Tax Authority',
    fields: DEFAULT_TAX_ID_FIELDS
  }
}
