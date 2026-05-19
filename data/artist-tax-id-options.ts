// AUTO-GENERATED from FINAL SIMPLE WEB-READY Tax IDs for Gigrilla and its Members.xlsx
// 249 countries. Do not edit manually — regenerate from the source spreadsheet.

export type ArtistTaxIdFieldKey =
  | 'generic_tax_id'
  | 'individual_tax_id'
  | 'business_tax_id'
  | 'partnership_tax_id'
  | 'vat_gst_sst_id'

export interface ArtistTaxIdField {
  key: ArtistTaxIdFieldKey
  label: string
  localName: string
  example: string
}

export interface ArtistTaxIdCountryProfile {
  countryName: string
  countryCode: string
  aliases?: string[]
  authority: string
  isUnverifiable?: boolean
  /** Fields to show for a corporate entity (Incorporated Co / Partnership) */
  corporateFields: ArtistTaxIdField[]
  /** Fields to show for an individual / sole trader / partnership */
  individualFields: ArtistTaxIdField[]
  /** Backwards-compatible: all unique fields across both entity types */
  fields: ArtistTaxIdField[]
}

export const ARTIST_TAX_ID_FIELD_KEYS: ArtistTaxIdFieldKey[] = [
  'generic_tax_id',
  'individual_tax_id',
  'business_tax_id',
  'partnership_tax_id',
  'vat_gst_sst_id',
]

const DEFAULT_TAX_ID_FIELDS: ArtistTaxIdField[] = [
  { key: 'generic_tax_id',     label: 'Generic/Tax ID',     localName: 'Tax ID',           example: 'Local format' },
  { key: 'individual_tax_id',  label: 'Individual Tax ID',  localName: 'Personal Tax ID',  example: 'Local format' },
  { key: 'business_tax_id',    label: 'Business Tax ID',    localName: 'Business ID',      example: 'Local format' },
  { key: 'vat_gst_sst_id',     label: 'VAT/GST/SST ID',     localName: 'VAT Number',       example: 'Local format' },
]

const ARTIST_TAX_ID_COUNTRY_PROFILES: ArtistTaxIdCountryProfile[] = [
  {
    countryName: 'Afghanistan',
    countryCode: 'AF',
    isUnverifiable: true,
    authority: 'Afghanistan Revenue Department',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Åland Islands',
    countryCode: 'AX',
    authority: 'Finnish Tax Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Identity Code', example: '131052-308T' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business ID', example: '1234567-8' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'ALV Number', example: '1234567-8' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Identity Code', example: '131052-308T' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'ALV Number', example: '1234567-8' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Identity Code', example: '131052-308T' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business ID', example: '1234567-8' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'ALV Number', example: '1234567-8' }
    ],
  },
  {
    countryName: 'Albania',
    countryCode: 'AL',
    authority: 'General Directorate of Taxation',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIPT', example: 'J12345678N' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIPT', example: 'J12345678N' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIPT', example: 'J12345678N' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIPT', example: 'J12345678N' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIPT', example: 'J12345678N' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIPT', example: 'J12345678N' }
    ],
  },
  {
    countryName: 'Algeria',
    countryCode: 'DZ',
    authority: 'Directorate General of Taxes',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789012345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '123456789012345' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789012345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '123456789012345' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789012345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '123456789012345' }
    ],
  },
  {
    countryName: 'American Samoa',
    countryCode: 'AS',
    authority: 'Tax Office, American Samoa Government',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' }
    ],
  },
  {
    countryName: 'Andorra',
    countryCode: 'AD',
    authority: 'Tax and Borders Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NRT', example: 'A-123456-Z' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NRT', example: 'A-123456-Z' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NRT', example: 'A-123456-Z' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NRT', example: 'A-123456-Z' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NRT', example: 'A-123456-Z' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NRT', example: 'A-123456-Z' }
    ],
  },
  {
    countryName: 'Angola',
    countryCode: 'AO',
    authority: 'General Tax Administration',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '5123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '5123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '5123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '5123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '5123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '5123456789' }
    ],
  },
  {
    countryName: 'Anguilla',
    countryCode: 'AI',
    authority: 'Inland Revenue Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '2234567890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '2234567890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '2234567890' }
    ],
  },
  {
    countryName: 'Antarctica',
    countryCode: 'AQ',
    isUnverifiable: true,
    authority: 'N/A',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Antigua and Barbuda',
    countryCode: 'AG',
    authority: 'Inland Revenue Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345678' }
    ],
  },
  {
    countryName: 'Argentina',
    countryCode: 'AR',
    authority: 'Agencia de Recaudación y Control Aduanero (ARCA), provincial tax agencies',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CUIT/CUIL', example: '20-12345678-3' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business CUIT', example: '30-12345678-1' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Business CUIT', example: '30-12345678-1' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CUIT/CUIL', example: '20-12345678-3' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Business CUIT', example: '30-12345678-1' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CUIT/CUIL', example: '20-12345678-3' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business CUIT', example: '30-12345678-1' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Business CUIT', example: '30-12345678-1' }
    ],
  },
  {
    countryName: 'Armenia',
    countryCode: 'AM',
    authority: 'State Revenue Committee',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '02538904' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '02538904' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '02538904' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '02538904' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '02538904' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '02538904' }
    ],
  },
  {
    countryName: 'Aruba',
    countryCode: 'AW',
    authority: 'Department of Taxes',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678' }
    ],
  },
  {
    countryName: 'Australia',
    countryCode: 'AU',
    authority: 'Australian Taxation Office, state and territory revenue offices',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'ABN', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST ABN', example: '12345678901' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST ABN', example: '12345678901' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'ABN', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST ABN', example: '12345678901' }
    ],
  },
  {
    countryName: 'Austria',
    countryCode: 'AT',
    authority: 'Federal Ministry of Finance',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Steuernummer', example: '12-345/6789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'UID', example: 'ATU12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Steuernummer', example: '12-345/6789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'UID', example: 'ATU12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Steuernummer', example: '12-345/6789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'UID', example: 'ATU12345678' }
    ],
  },
  {
    countryName: 'Azerbaijan',
    countryCode: 'AZ',
    authority: 'State Tax Service under the Ministry of Economy of the Republic of Azerbaijan',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '0123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '0123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '0123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '0123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '0123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '0123456789' }
    ],
  },
  {
    countryName: 'Bahamas',
    countryCode: 'BS',
    authority: 'Department of Inland Revenue',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123.456.789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123.456.789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123.456.789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123.456.789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123.456.789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123.456.789' }
    ],
  },
  {
    countryName: 'Bahrain',
    countryCode: 'BH',
    authority: 'National Bureau for Revenue',
    corporateFields: [
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123 456 789 012 345' }
    ],
    individualFields: [
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123 456 789 012 345' }
    ],
    fields: [
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123 456 789 012 345' }
    ],
  },
  {
    countryName: 'Bangladesh',
    countryCode: 'BD',
    authority: 'National Board of Revenue',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'BIN', example: '123456789-0123' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'BIN', example: '123456789-0123' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'BIN', example: '123456789-0123' }
    ],
  },
  {
    countryName: 'Barbados',
    countryCode: 'BB',
    authority: 'Barbados Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1 123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1 123 456 789 012' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1 123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1 123 456 789 012' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1 123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1 123 456 789 012' }
    ],
  },
  {
    countryName: 'Belarus',
    countryCode: 'BY',
    authority: 'Ministry for Taxes and Duties of the Republic of Belarus',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
  },
  {
    countryName: 'Belgium',
    countryCode: 'BE',
    authority: 'Federal Public Service Finance, regional tax administrations',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National Number', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Enterprise Number', example: '0123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'BE0123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National Number', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'BE0123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National Number', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Enterprise Number', example: '0123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'BE0123456789' }
    ],
  },
  {
    countryName: 'Belize',
    countryCode: 'BZ',
    authority: 'Belize Tax Service Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '123456' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '123456' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '123456' }
    ],
  },
  {
    countryName: 'Benin',
    countryCode: 'BJ',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IFU', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IFU', example: '1 234 567 890 123' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IFU', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IFU', example: '1 234 567 890 123' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IFU', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IFU', example: '1 234 567 890 123' }
    ],
  },
  {
    countryName: 'Bermuda',
    countryCode: 'BM',
    authority: 'Office of the Tax Commissioner',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Bhutan',
    countryCode: 'BT',
    authority: 'Department of Revenue and Customs',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CID', example: '22334455667' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '22334455667' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'BST TIN', example: '22334455667' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CID', example: '22334455667' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'BST TIN', example: '22334455667' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CID', example: '22334455667' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '22334455667' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'BST TIN', example: '22334455667' }
    ],
  },
  {
    countryName: 'Bolivia',
    countryCode: 'BO',
    authority: 'National Tax Service (Servicio de Impuestos Nacionales)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIT', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIT', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIT', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIT', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIT', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIT', example: '123456789' }
    ],
  },
  {
    countryName: 'Bonaire, Sint Eustatius and Saba',
    countryCode: 'BQ',
    authority: 'Tax and Customs Administration Caribbean Netherlands',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'BSN', example: '1234.12.123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'CRIB', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'ABB', example: '312.345.678' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'BSN', example: '1234.12.123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'ABB', example: '312.345.678' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'BSN', example: '1234.12.123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'CRIB', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'ABB', example: '312.345.678' }
    ],
  },
  {
    countryName: 'Bosnia and Herzegovina',
    countryCode: 'BA',
    authority: 'Indirect Taxation Authority, Tax Administration of the Federation of Bosnia and Herzegovina, Tax Administration of Republika Srpska, Brčko District Tax Administration',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123 456 789 012' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123 456 789 012' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123 456 789 012' }
    ],
  },
  {
    countryName: 'Botswana',
    countryCode: 'BW',
    authority: 'Botswana Unified Revenue Service',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual TIN', example: 'I123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Corporate TIN', example: 'C01234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'C012345678901' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual TIN', example: 'I123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'C012345678901' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual TIN', example: 'I123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Corporate TIN', example: 'C01234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'C012345678901' }
    ],
  },
  {
    countryName: 'Bouvet Island',
    countryCode: 'BV',
    isUnverifiable: true,
    authority: 'N/A',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Brazil',
    countryCode: 'BR',
    authority: 'Receita Federal do Brasil, state finance secretariats, municipal finance secretariats',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CPF', example: '123.456.789-01' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'CNPJ', example: '12.345.678/0001-22, 12.ABC.345/01DE-35' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'CBS, IBS // IPI, ICMS, ISS', example: '12.345.678/0001-22, 12.ABC.345/01DE-35' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CPF', example: '123.456.789-01' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'CBS, IBS // IPI, ICMS, ISS', example: '12.345.678/0001-22, 12.ABC.345/01DE-35' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CPF', example: '123.456.789-01' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'CNPJ', example: '12.345.678/0001-22, 12.ABC.345/01DE-35' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'CBS, IBS // IPI, ICMS, ISS', example: '12.345.678/0001-22, 12.ABC.345/01DE-35' }
    ],
  },
  {
    countryName: 'British Indian Ocean Territory',
    countryCode: 'IO',
    isUnverifiable: true,
    authority: 'N/A',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Brunei',
    countryCode: 'BN',
    authority: 'Revenue Division, Ministry of Finance and Economy',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NRIC', example: '00-123456' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'ROCBN (RC/RFC)', example: 'RC2001234, RFC000123' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NRIC', example: '00-123456' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NRIC', example: '00-123456' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'ROCBN (RC/RFC)', example: 'RC2001234, RFC000123' }
    ],
  },
  {
    countryName: 'Bulgaria',
    countryCode: 'BG',
    authority: 'National Revenue Agency',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'EGN/LNCH', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'UIC', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'BG0123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'EGN/LNCH', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'BG0123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'EGN/LNCH', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'UIC', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'BG0123456789' }
    ],
  },
  {
    countryName: 'Burkina Faso',
    countryCode: 'BF',
    authority: 'Directorate General of Taxes',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IFU', example: '12345678A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IFU', example: '12345678A' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IFU', example: '12345678A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IFU', example: '12345678A' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IFU', example: '12345678A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IFU', example: '12345678A' }
    ],
  },
  {
    countryName: 'Burundi',
    countryCode: 'BI',
    authority: 'Office Burundais des Recettes',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN/NIF', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA TIN/NIF', example: '1234567890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN/NIF', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA TIN/NIF', example: '1234567890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN/NIF', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA TIN/NIF', example: '1234567890' }
    ],
  },
  {
    countryName: 'Cabo Verde',
    countryCode: 'CV',
    authority: 'Tax and Customs Authority of Cabo Verde',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '213456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '213456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '213456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '213456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '213456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '213456789' }
    ],
  },
  {
    countryName: 'Cambodia',
    countryCode: 'KH',
    authority: 'General Department of Taxation',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1001-123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1001-123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1001-123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1001-123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1001-123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1001-123456789' }
    ],
  },
  {
    countryName: 'Cameroon',
    countryCode: 'CM',
    authority: 'Directorate General of Taxation',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIU', example: 'M123456789000L' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIU', example: 'M123456789000L' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIU', example: 'M123456789000L' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIU', example: 'M123456789000L' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIU', example: 'M123456789000L' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIU', example: 'M123456789000L' }
    ],
  },
  {
    countryName: 'Canada',
    countryCode: 'CA',
    authority: 'Canada Revenue Agency, Revenu Québec, provincial and territorial revenue authorities',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SIN/ITN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'BN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST/HST Number, QST Number, PST Number, RST Number', example: '123456789RT0001; 1234567890TQ1234; PST-1234-5678; 123456-7; 1234567' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SIN/ITN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST/HST Number, QST Number, PST Number, RST Number', example: '123456789RT0001; 1234567890TQ1234; PST-1234-5678; 123456-7; 1234567' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SIN/ITN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'BN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST/HST Number, QST Number, PST Number, RST Number', example: '123456789RT0001; 1234567890TQ1234; PST-1234-5678; 123456-7; 1234567' }
    ],
  },
  {
    countryName: 'Cayman Islands',
    countryCode: 'KY',
    authority: 'Cayman Islands Customs & Border Control Service, Tax Information Authority',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Central African Republic',
    countryCode: 'CF',
    authority: 'Direction Générale des Impôts et des Domaines',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '99-999/9999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '99-999/9999' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '99-999/9999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '99-999/9999' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '99-999/9999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '99-999/9999' }
    ],
  },
  {
    countryName: 'Chad',
    countryCode: 'TD',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '1234567Z' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '1234567Z' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '1234567Z' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '1234567Z' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '1234567Z' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '1234567Z' }
    ],
  },
  {
    countryName: 'Chile',
    countryCode: 'CL',
    authority: 'Servicio de Impuestos Internos',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RUT', example: '12.345.678-K' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUT', example: '12.345.678-K' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RUT', example: '12.345.678-K' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUT', example: '12.345.678-K' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RUT', example: '12.345.678-K' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUT', example: '12.345.678-K' }
    ],
  },
  {
    countryName: 'China',
    countryCode: 'CN',
    authority: 'State Taxation Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Resident ID Number', example: '123 456 789 012 345 678' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Unified Social Credit Code', example: '91350211M000100Y43' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TIN', example: '91350211M000100Y43' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Resident ID Number', example: '123 456 789 012 345 678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TIN', example: '91350211M000100Y43' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Resident ID Number', example: '123 456 789 012 345 678' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Unified Social Credit Code', example: '91350211M000100Y43' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TIN', example: '91350211M000100Y43' }
    ],
  },
  {
    countryName: 'Christmas Island',
    countryCode: 'CX',
    authority: 'Australian Taxation Office',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'ABN', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: '12345678901' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: '12345678901' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'ABN', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: '12345678901' }
    ],
  },
  {
    countryName: 'Cocos (Keeling) Islands',
    countryCode: 'CC',
    authority: 'Australian Taxation Office',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'ABN', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: '12345678901' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: '12345678901' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'ABN', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: '12345678901' }
    ],
  },
  {
    countryName: 'Colombia',
    countryCode: 'CO',
    authority: 'Dirección de Impuestos y Aduanas Nacionales (DIAN)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Cédula', example: '123456789-0 / 1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIT', example: '123.456.789-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIT', example: '123.456.789-0' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Cédula', example: '123456789-0 / 1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIT', example: '123.456.789-0' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Cédula', example: '123456789-0 / 1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIT', example: '123.456.789-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIT', example: '123.456.789-0' }
    ],
  },
  {
    countryName: 'Comoros',
    countryCode: 'KM',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PIN', example: 'UnknownFormat' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIF', example: 'UnknownFormat' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA', example: 'UnknownFormat' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PIN', example: 'UnknownFormat' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA', example: 'UnknownFormat' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PIN', example: 'UnknownFormat' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIF', example: 'UnknownFormat' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA', example: 'UnknownFormat' }
    ],
  },
  {
    countryName: 'Cook Islands',
    countryCode: 'CK',
    authority: 'Revenue Management Division, Ministry of Finance and Economic Management',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN/RMD', example: '12345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN/RMD', example: '12345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN/RMD', example: '12345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345' }
    ],
  },
  {
    countryName: 'Costa Rica',
    countryCode: 'CR',
    authority: 'Ministerio de Hacienda',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'ID Number', example: '1-2345-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NITE', example: '1-234-567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NITE', example: '1-234-567890' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'ID Number', example: '1-2345-6789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NITE', example: '1-234-567890' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'ID Number', example: '1-2345-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NITE', example: '1-234-567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NITE', example: '1-234-567890' }
    ],
  },
  {
    countryName: 'Côte d\'Ivoire',
    countryCode: 'CI',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IDU', example: 'CIYYYY1234567A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: '1234567A' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IDU', example: 'CIYYYY1234567A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: '1234567A' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IDU', example: 'CIYYYY1234567A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: '1234567A' }
    ],
  },
  {
    countryName: 'Croatia',
    countryCode: 'HR',
    authority: 'Tax Administration, Ministry of Finance',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'OIB', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'HR12345678901' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'OIB', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'HR12345678901' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'OIB', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'HR12345678901' }
    ],
  },
  {
    countryName: 'Cuba',
    countryCode: 'CU',
    authority: 'Oficina Nacional de Administración Tributaria (ONAT)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CI', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIT', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIT', example: '12345678901' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CI', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIT', example: '12345678901' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CI', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIT', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIT', example: '12345678901' }
    ],
  },
  {
    countryName: 'Curaçao',
    countryCode: 'CW',
    authority: 'Tax and Customs Administration Curaçao',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Persoonsnummer/TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Persoonsnummer/TIN', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Persoonsnummer/TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Persoonsnummer/TIN', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Persoonsnummer/TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Persoonsnummer/TIN', example: '123456789' }
    ],
  },
  {
    countryName: 'Cyprus',
    countryCode: 'CY',
    authority: 'Tax Department, Ministry of Finance',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIC', example: '12345678L' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'CY12345678Z' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIC', example: '12345678L' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'CY12345678Z' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIC', example: '12345678L' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'CY12345678Z' }
    ],
  },
  {
    countryName: 'Czechia',
    countryCode: 'CZ',
    authority: 'Financial Administration of the Czech Republic',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Rodné číslo', example: '123456/7890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'DIČ', example: 'CZ1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'DIČ', example: 'CZ1234567890' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Rodné číslo', example: '123456/7890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'DIČ', example: 'CZ1234567890' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Rodné číslo', example: '123456/7890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'DIČ', example: 'CZ1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'DIČ', example: 'CZ1234567890' }
    ],
  },
  {
    countryName: 'Democratic Republic of the Congo',
    countryCode: 'CD',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TIN/NIF', example: 'A123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIF', example: 'A1234567R' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA NIF', example: 'A1234567R' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TIN/NIF', example: 'A123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA NIF', example: 'A1234567R' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TIN/NIF', example: 'A123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIF', example: 'A1234567R' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA NIF', example: 'A1234567R' }
    ],
  },
  {
    countryName: 'Denmark',
    countryCode: 'DK',
    authority: 'Danish Tax Agency',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CPR Number', example: '123456-7890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'CVR Number', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT CVR', example: 'DK12345678' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CPR Number', example: '123456-7890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT CVR', example: 'DK12345678' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CPR Number', example: '123456-7890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'CVR Number', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT CVR', example: 'DK12345678' }
    ],
  },
  {
    countryName: 'Djibouti',
    countryCode: 'DJ',
    authority: 'Direction des Impôts',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN/NIF', example: '1234567892' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business TIN/NIF', example: '1234567891' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: '1234567891' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN/NIF', example: '1234567892' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: '1234567891' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN/NIF', example: '1234567892' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business TIN/NIF', example: '1234567891' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: '1234567891' }
    ],
  },
  {
    countryName: 'Dominica',
    countryCode: 'DM',
    authority: 'Inland Revenue Division',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567' }
    ],
  },
  {
    countryName: 'Dominican Republic',
    countryCode: 'DO',
    authority: 'Dirección General de Impuestos Internos (DGII)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Cédula/RNC', example: '001-1234567-8 / 123-4567890-1' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RNC', example: '123-4567890-1' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RNC', example: '123-4567890-1' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Cédula/RNC', example: '001-1234567-8 / 123-4567890-1' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RNC', example: '123-4567890-1' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Cédula/RNC', example: '001-1234567-8 / 123-4567890-1' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RNC', example: '123-4567890-1' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RNC', example: '123-4567890-1' }
    ],
  },
  {
    countryName: 'Ecuador',
    countryCode: 'EC',
    authority: 'Servicio de Rentas Internas (SRI)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Cédula', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RUC', example: '1 234 567 890 001' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RUC', example: '1 234 567 890 001' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Cédula', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RUC', example: '1 234 567 890 001' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Cédula', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RUC', example: '1 234 567 890 001' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RUC', example: '1 234 567 890 001' }
    ],
  },
  {
    countryName: 'Egypt',
    countryCode: 'EG',
    authority: 'Egyptian Tax Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
  },
  {
    countryName: 'El Salvador',
    countryCode: 'SV',
    authority: 'Ministry of Finance, Dirección General de Impuestos Internos',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIT', example: '1234-567890-123-4' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIT', example: '1234-567890-123-4' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIT', example: '1234-567890-123-4' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIT', example: '1234-567890-123-4' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIT', example: '1234-567890-123-4' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIT', example: '1234-567890-123-4' }
    ],
  },
  {
    countryName: 'Equatorial Guinea',
    countryCode: 'GQ',
    authority: 'Dirección General de Impuestos y Contribuciones',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN/NIF', example: 'XXXXXXXXXXXXXXXX (alphanumeric up to 16 characters long)' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IVA/VAT Number', example: '123, 1' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN/NIF', example: 'XXXXXXXXXXXXXXXX (alphanumeric up to 16 characters long)' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IVA/VAT Number', example: '123, 1' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN/NIF', example: 'XXXXXXXXXXXXXXXX (alphanumeric up to 16 characters long)' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IVA/VAT Number', example: '123, 1' }
    ],
  },
  {
    countryName: 'Eritrea',
    countryCode: 'ER',
    authority: 'Inland Revenue Department',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: '187654321-0' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business TIN', example: '287654321-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: '287654321-0' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: '187654321-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: '287654321-0' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: '187654321-0' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business TIN', example: '287654321-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: '287654321-0' }
    ],
  },
  {
    countryName: 'Estonia',
    countryCode: 'EE',
    authority: 'Estonian Tax and Customs Board',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Identification Code', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Registry Code', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'KMKR', example: 'EE123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Identification Code', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'KMKR', example: 'EE123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Identification Code', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Registry Code', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'KMKR', example: 'EE123456789' }
    ],
  },
  {
    countryName: 'Eswatini',
    countryCode: 'SZ',
    authority: 'Eswatini Revenue Service',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-456-789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123-456-789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-456-789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123-456-789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-456-789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123-456-789' }
    ],
  },
  {
    countryName: 'Ethiopia',
    countryCode: 'ET',
    authority: 'Ministry of Revenue',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567890' }
    ],
  },
  {
    countryName: 'Falkland Islands',
    countryCode: 'FK',
    authority: 'Falkland Islands Government Tax Office',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: 'XXXXXXXXXXXXXXXX (alphanumeric up to 16 characters long)' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: 'XXXXXXXXXXXXXXXX (alphanumeric up to 16 characters long)' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: 'XXXXXXXXXXXXXXXX (alphanumeric up to 16 characters long)' }
    ],
  },
  {
    countryName: 'Faroe Islands',
    countryCode: 'FO',
    authority: 'TAKS',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'P-tal', example: 'DDMMYY-XXX' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'V-tal', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'MVG V-tal', example: '123456' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'P-tal', example: 'DDMMYY-XXX' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'MVG V-tal', example: '123456' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'P-tal', example: 'DDMMYY-XXX' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'V-tal', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'MVG V-tal', example: '123456' }
    ],
  },
  {
    countryName: 'Fiji',
    countryCode: 'FJ',
    authority: 'Fiji Revenue and Customs Service',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '291-456-7830' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '291-456-7830' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '291-456-7830' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '291-456-7830' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '291-456-7830' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '291-456-7830' }
    ],
  },
  {
    countryName: 'Finland',
    countryCode: 'FI',
    authority: 'Finnish Tax Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Identity Code', example: '131052-308T' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business ID', example: '1234567-8' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'ALV Number', example: '1234567-8' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Identity Code', example: '131052-308T' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'ALV Number', example: '1234567-8' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Identity Code', example: '131052-308T' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business ID', example: '1234567-8' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'ALV Number', example: '1234567-8' }
    ],
  },
  {
    countryName: 'France',
    countryCode: 'FR',
    authority: 'Direction générale des Finances publiques (DGFiP)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
  },
  {
    countryName: 'French Guiana',
    countryCode: 'GF',
    authority: 'Direction générale des Finances publiques (DGFiP)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
  },
  {
    countryName: 'French Polynesia',
    countryCode: 'PF',
    authority: 'Direction des impôts et des contributions publiques',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: 'SYYMMLLOOOKKK KK' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'T123456, E123456, I991234' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: 'SYYMMLLOOOKKK KK' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'T123456, E123456, I991234' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: 'SYYMMLLOOOKKK KK' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'T123456, E123456, I991234' }
    ],
  },
  {
    countryName: 'French Southern Territories',
    countryCode: 'TF',
    isUnverifiable: true,
    authority: 'DGFiP',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Gabon',
    countryCode: 'GA',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '1234567890123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '1234567 0' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '1234567890123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '1234567 0' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '1234567890123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '1234567 0' }
    ],
  },
  {
    countryName: 'Gambia',
    countryCode: 'GM',
    authority: 'Gambia Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567890' }
    ],
  },
  {
    countryName: 'Georgia',
    countryCode: 'GE',
    authority: 'Revenue Service of Georgia',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Number', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Number', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Number', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
  },
  {
    countryName: 'Germany',
    countryCode: 'DE',
    authority: 'Federal Central Tax Office (BZSt), state tax authorities, municipal tax offices',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Steuer-ID', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Steuernummer', example: '12/345/67890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'USt-IdNr.', example: 'DE123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Steuer-ID', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'USt-IdNr.', example: 'DE123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Steuer-ID', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Steuernummer', example: '12/345/67890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'USt-IdNr.', example: 'DE123456789' }
    ],
  },
  {
    countryName: 'Ghana',
    countryCode: 'GH',
    authority: 'Ghana Revenue Authority',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Ghanacard PIN', example: 'GHA-123456789-1' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: 'C0045678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'C0045678901' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Ghanacard PIN', example: 'GHA-123456789-1' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'C0045678901' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Ghanacard PIN', example: 'GHA-123456789-1' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: 'C0045678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'C0045678901' }
    ],
  },
  {
    countryName: 'Gibraltar',
    countryCode: 'GI',
    authority: 'Income Tax Office',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Taxpayer Reference Number', example: '55555, 666666' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Taxpayer Reference Number', example: '55555, 666666' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Taxpayer Reference Number', example: '55555, 666666' }
    ],
  },
  {
    countryName: 'Greece',
    countryCode: 'GR',
    authority: 'Independent Authority for Public Revenue (AADE/IAPR)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'AFM', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'EL123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'AFM', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'EL123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'AFM', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'EL123456789' }
    ],
  },
  {
    countryName: 'Greenland',
    countryCode: 'GL',
    authority: 'Greenland Tax Agency',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CPR Number', example: 'DDMMYY-1234' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'GER Number', example: '12345678' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CPR Number', example: 'DDMMYY-1234' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CPR Number', example: 'DDMMYY-1234' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'GER Number', example: '12345678' }
    ],
  },
  {
    countryName: 'Grenada',
    countryCode: 'GD',
    authority: 'Inland Revenue Division',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456' }
    ],
  },
  {
    countryName: 'Guadeloupe',
    countryCode: 'GP',
    authority: 'Direction générale des Finances publiques (DGFiP)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
  },
  {
    countryName: 'Guam',
    countryCode: 'GU',
    authority: 'Guam Department of Revenue and Taxation',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' }
    ],
  },
  {
    countryName: 'Guatemala',
    countryCode: 'GT',
    authority: 'Superintendencia de Administración Tributaria (SAT)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'CUI/NIT', example: '1234 56789 0101' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'CUI/NIT', example: '1234 56789 0101' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'CUI/NIT', example: '1234 56789 0101' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'CUI/NIT', example: '1234 56789 0101' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'CUI/NIT', example: '1234 56789 0101' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'CUI/NIT', example: '1234 56789 0101' }
    ],
  },
  {
    countryName: 'Guernsey',
    countryCode: 'GG',
    authority: 'Guernsey Revenue Service',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SIN0', example: 'GY123456' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TRN', example: '1X123456' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SIN0', example: 'GY123456' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SIN0', example: 'GY123456' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TRN', example: '1X123456' }
    ],
  },
  {
    countryName: 'Guinea',
    countryCode: 'GN',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIF', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIF', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIF', example: '123456789' }
    ],
  },
  {
    countryName: 'Guinea-Bissau',
    countryCode: 'GW',
    authority: 'Direcção Geral das Contribuições e Impostos (DGCI)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIF', example: '999999999' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIF', example: '999999999' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIF', example: '999999999' }
    ],
  },
  {
    countryName: 'Guyana',
    countryCode: 'GY',
    authority: 'Guyana Revenue Authority',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NIS', example: 'A-1234567, B-1234567' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NIS', example: 'A-1234567, B-1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NIS', example: 'A-1234567, B-1234567' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
  },
  {
    countryName: 'Haiti',
    countryCode: 'HT',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NINU', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIF', example: '123-456-789-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '123-456-789-0' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NINU', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '123-456-789-0' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NINU', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIF', example: '123-456-789-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '123-456-789-0' }
    ],
  },
  {
    countryName: 'Heard Island and McDonald Islands',
    countryCode: 'HM',
    isUnverifiable: true,
    authority: 'N/A',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Holy See',
    countryCode: 'VA',
    authority: 'Directorate for the Economy, Governorate of Vatican City State',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Honduras',
    countryCode: 'HN',
    authority: 'Revenue Administration Service (SAR)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RTN', example: 'AA BB CC YYYY NNNN' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RTN', example: 'AA BB CC YYYY NNNN' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RTN', example: 'AA BB CC YYYY NNNN' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RTN', example: 'AA BB CC YYYY NNNN' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RTN', example: 'AA BB CC YYYY NNNN' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RTN', example: 'AA BB CC YYYY NNNN' }
    ],
  },
  {
    countryName: 'Hong Kong',
    countryCode: 'HK',
    authority: 'Inland Revenue Department',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'HKID', example: 'A123456(7)' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'BRN', example: '12345678' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'HKID', example: 'A123456(7)' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'HKID', example: 'A123456(7)' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'BRN', example: '12345678' }
    ],
  },
  {
    countryName: 'Hungary',
    countryCode: 'HU',
    authority: 'National Tax and Customs Administration (NAV)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Tax ID', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Tax Number', example: '12345678-1-23' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'HU12345678' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Tax ID', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'HU12345678' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Tax ID', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Tax Number', example: '12345678-1-23' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'HU12345678' }
    ],
  },
  {
    countryName: 'Iceland',
    countryCode: 'IS',
    authority: 'Iceland Revenue and Customs (Skatturinn)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Kennitala', example: '123456-7890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VSK Number', example: '123456' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Kennitala', example: '123456-7890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VSK Number', example: '123456' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Kennitala', example: '123456-7890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VSK Number', example: '123456' }
    ],
  },
  {
    countryName: 'India',
    countryCode: 'IN',
    authority: 'Income Tax Department (CBDT), Central Board of Indirect Taxes and Customs, state GST departments',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PAN', example: 'AFZPK7190K' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GSTIN', example: '22AAAAA0000A1Z5' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PAN', example: 'AFZPK7190K' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GSTIN', example: '22AAAAA0000A1Z5' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PAN', example: 'AFZPK7190K' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GSTIN', example: '22AAAAA0000A1Z5' }
    ],
  },
  {
    countryName: 'Indonesia',
    countryCode: 'ID',
    authority: 'Directorate General of Taxes',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NPWP', example: '01.234.567.8-901.000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PKP Number', example: '01.234.567.8-901.000' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NPWP', example: '01.234.567.8-901.000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PKP Number', example: '01.234.567.8-901.000' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NPWP', example: '01.234.567.8-901.000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PKP Number', example: '01.234.567.8-901.000' }
    ],
  },
  {
    countryName: 'Iran',
    countryCode: 'IR',
    authority: 'Iranian National Tax Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Economic Code', example: '411 111 111 111' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Economic Code', example: '411 111 111 111' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Economic Code', example: '411 111 111 111' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Economic Code', example: '411 111 111 111' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Economic Code', example: '411 111 111 111' }
    ],
  },
  {
    countryName: 'Iraq',
    countryCode: 'IQ',
    authority: 'General Commission for Taxes',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'INID', example: '123456789012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '4444, 55555' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'INID', example: '123456789012' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'INID', example: '123456789012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '4444, 55555' }
    ],
  },
  {
    countryName: 'Ireland',
    countryCode: 'IE',
    authority: 'Revenue Commissioners',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PPS Number', example: '1234567AB' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Tax Reference Number', example: '1234567AB' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'IE1234567AB' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PPS Number', example: '1234567AB' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'IE1234567AB' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PPS Number', example: '1234567AB' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Tax Reference Number', example: '1234567AB' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'IE1234567AB' }
    ],
  },
  {
    countryName: 'Isle of Man',
    countryCode: 'IM',
    authority: 'Isle of Man Income Tax Division, Customs and Excise Division',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual Tax Reference Number', example: 'H111111-11' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Corporate Tax Reference Number', example: 'C333333-33' },
      { key: 'partnership_tax_id', label: 'Partnership Tax ID', localName: 'Partnership Tax Reference Number', example: 'X555555-55' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'GB 00x xxxx xx' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual Tax Reference Number', example: 'H111111-11' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'GB 00x xxxx xx' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual Tax Reference Number', example: 'H111111-11' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Corporate Tax Reference Number', example: 'C333333-33' },
      { key: 'partnership_tax_id', label: 'Partnership Tax ID', localName: 'Partnership Tax Reference Number', example: 'X555555-55' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'GB 00x xxxx xx' }
    ],
  },
  {
    countryName: 'Israel',
    countryCode: 'IL',
    authority: 'Israel Tax Authority',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'ID Number', example: '123456782' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Tax File Number', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '000012345' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'ID Number', example: '123456782' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '000012345' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'ID Number', example: '123456782' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Tax File Number', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '000012345' }
    ],
  },
  {
    countryName: 'Italy',
    countryCode: 'IT',
    authority: 'Agenzia delle Entrate, Agenzia delle Dogane e dei Monopoli',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Codice Fiscale', example: 'RSSMRA80A01H501U' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Partita IVA', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Partita IVA', example: 'IT12345678901' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Codice Fiscale', example: 'RSSMRA80A01H501U' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Partita IVA', example: 'IT12345678901' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Codice Fiscale', example: 'RSSMRA80A01H501U' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Partita IVA', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Partita IVA', example: 'IT12345678901' }
    ],
  },
  {
    countryName: 'Jamaica',
    countryCode: 'JM',
    authority: 'Tax Administration Jamaica',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TRN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TRN', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TRN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TRN', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TRN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TRN', example: '123456789' }
    ],
  },
  {
    countryName: 'Japan',
    countryCode: 'JP',
    authority: 'National Tax Agency, prefectural and municipal tax offices',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'My Number', example: '123 456 789 012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Corporate Number', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'JCT Number', example: 'T1234567890123' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'My Number', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'JCT Number', example: 'T1234567890123' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'My Number', example: '123 456 789 012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Corporate Number', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'JCT Number', example: 'T1234567890123' }
    ],
  },
  {
    countryName: 'Jersey',
    countryCode: 'JE',
    authority: 'Revenue Jersey, Jersey Customs and Immigration Service',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '100-100-1000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: '1234567' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '100-100-1000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: '1234567' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '100-100-1000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: '1234567' }
    ],
  },
  {
    countryName: 'Jordan',
    countryCode: 'JO',
    authority: 'Income and Sales Tax Department',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Corporate TIN', example: '123456789012345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Corporate TIN', example: '123456789012345' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Corporate TIN', example: '123456789012345' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Corporate TIN', example: '123456789012345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Corporate TIN', example: '123456789012345' }
    ],
  },
  {
    countryName: 'Kazakhstan',
    countryCode: 'KZ',
    authority: 'State Revenue Committee of the Ministry of Finance',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'IIN', example: '123 456 789 012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'BIN', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT BIN', example: '123 456 789 012' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'IIN', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT BIN', example: '123 456 789 012' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'IIN', example: '123 456 789 012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'BIN', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT BIN', example: '123 456 789 012' }
    ],
  },
  {
    countryName: 'Kenya',
    countryCode: 'KE',
    authority: 'Kenya Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PIN', example: 'P000111111A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PIN', example: 'P000111111A' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PIN', example: 'P000111111A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PIN', example: 'P000111111A' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PIN', example: 'P000111111A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PIN', example: 'P000111111A' }
    ],
  },
  {
    countryName: 'Kiribati',
    countryCode: 'KI',
    authority: 'Tax Division, Ministry of Finance and Economic Development',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: 'xx. xxx. xxx/xxxx-xx' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: 'xx. xxx. xxx/xxxx-xx' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: 'xx. xxx. xxx/xxxx-xx' }
    ],
  },
  {
    countryName: 'Kuwait',
    countryCode: 'KW',
    authority: 'Ministry of Finance, Tax Department',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Civil ID', example: '123 456 789 012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '123456' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Civil ID', example: '123 456 789 012' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Civil ID', example: '123 456 789 012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '123456' }
    ],
  },
  {
    countryName: 'Kyrgyzstan',
    countryCode: 'KG',
    authority: 'State Tax Service',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PIN', example: '12 345 678 901 234' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '12 345 678 901 234' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12 345 678 901 234' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PIN', example: '12 345 678 901 234' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12 345 678 901 234' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PIN', example: '12 345 678 901 234' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '12 345 678 901 234' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12 345 678 901 234' }
    ],
  },
  {
    countryName: 'Laos',
    countryCode: 'LA',
    authority: 'Tax Department, Ministry of Finance',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789-000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789-000' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789-000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789-000' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789-000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789-000' }
    ],
  },
  {
    countryName: 'Latvia',
    countryCode: 'LV',
    authority: 'State Revenue Service',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Code', example: '010203-12345' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Registration Number', example: '40001234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PVN Number', example: 'LV40001234567' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Code', example: '010203-12345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PVN Number', example: 'LV40001234567' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Code', example: '010203-12345' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Registration Number', example: '40001234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PVN Number', example: 'LV40001234567' }
    ],
  },
  {
    countryName: 'Lebanon',
    countryCode: 'LB',
    authority: 'Ministry of Finance, Revenue Directorate',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123456789-601' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123456789-601' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123456789-601' }
    ],
  },
  {
    countryName: 'Lesotho',
    countryCode: 'LS',
    authority: 'Lesotho Revenue Authority',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: '123456789012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '50012345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '50012345' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: '123456789012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '50012345' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: '123456789012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '50012345' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '50012345' }
    ],
  },
  {
    countryName: 'Liberia',
    countryCode: 'LR',
    authority: 'Liberia Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '987654321' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST/VAT TIN', example: '987654321' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '987654321' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST/VAT TIN', example: '987654321' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '987654321' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST/VAT TIN', example: '987654321' }
    ],
  },
  {
    countryName: 'Libya',
    countryCode: 'LY',
    authority: 'Libyan Tax Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' }
    ],
  },
  {
    countryName: 'Liechtenstein',
    countryCode: 'LI',
    authority: 'Liechtenstein Tax Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'AHV Number', example: '123 456 789 012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'UID', example: 'CHE123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '12345' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'AHV Number', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '12345' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'AHV Number', example: '123 456 789 012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'UID', example: 'CHE123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '12345' }
    ],
  },
  {
    countryName: 'Lithuania',
    countryCode: 'LT',
    authority: 'State Tax Inspectorate under the Ministry of Finance',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Code', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Legal Entity Code', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PVM Code', example: 'LT123456789123' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Code', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PVM Code', example: 'LT123456789123' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal Code', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Legal Entity Code', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PVM Code', example: 'LT123456789123' }
    ],
  },
  {
    countryName: 'Luxembourg',
    countryCode: 'LU',
    authority: 'Luxembourg Inland Revenue, Registration Duties, Estates and VAT Authority, Customs and Excise Agency',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Matricule', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'LU12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Matricule', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'LU12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Matricule', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'LU12345678' }
    ],
  },
  {
    countryName: 'Macao',
    countryCode: 'MO',
    authority: 'Financial Services Bureau',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'BIR', example: '1234567(8)' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Taxpayer Number', example: '8123456(7)' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'BIR', example: '1234567(8)' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'BIR', example: '1234567(8)' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Taxpayer Number', example: '8123456(7)' }
    ],
  },
  {
    countryName: 'Madagascar',
    countryCode: 'MG',
    authority: 'General Directorate of Taxes',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '1234567890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '1234567890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '1234567890' }
    ],
  },
  {
    countryName: 'Malawi',
    countryCode: 'MW',
    authority: 'Malawi Revenue Authority',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NID', example: '123456789012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TPIN', example: '88888888' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TPIN', example: '88888888' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NID', example: '123456789012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TPIN', example: '88888888' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NID', example: '123456789012' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TPIN', example: '88888888' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TPIN', example: '88888888' }
    ],
  },
  {
    countryName: 'Malaysia',
    countryCode: 'MY',
    authority: 'Inland Revenue Board of Malaysia, Royal Malaysian Customs Department',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: 'IG115002000' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business TIN', example: 'C20880050010' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'SST TIN', example: 'A12-3456-78912345' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: 'IG115002000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'SST TIN', example: 'A12-3456-78912345' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: 'IG115002000' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business TIN', example: 'C20880050010' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'SST TIN', example: 'A12-3456-78912345' }
    ],
  },
  {
    countryName: 'Maldives',
    countryCode: 'MV',
    authority: 'Maldives Inland Revenue Authority',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NID', example: '1555550' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '2555550ABC' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '2123456GST789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NID', example: '1555550' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '2123456GST789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NID', example: '1555550' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '2555550ABC' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '2123456GST789' }
    ],
  },
  {
    countryName: 'Mali',
    countryCode: 'ML',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '999999999A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA NIF', example: '999999999A' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '999999999A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA NIF', example: '999999999A' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '999999999A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA NIF', example: '999999999A' }
    ],
  },
  {
    countryName: 'Malta',
    countryCode: 'MT',
    authority: 'Malta Tax and Customs Administration',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '0000999A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'MT12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '0000999A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'MT12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '0000999A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'MT12345678' }
    ],
  },
  {
    countryName: 'Marshall Islands',
    countryCode: 'MH',
    authority: 'Division of Revenue and Taxation, Ministry of Finance',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN', example: '04-XXXXXX' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '08612-04' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN', example: '04-XXXXXX' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN', example: '04-XXXXXX' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '08612-04' }
    ],
  },
  {
    countryName: 'Martinique',
    countryCode: 'MQ',
    authority: 'Direction générale des Finances publiques (DGFiP)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
  },
  {
    countryName: 'Mauritania',
    countryCode: 'MR',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NIF', example: '12345678' }
    ],
  },
  {
    countryName: 'Mauritius',
    countryCode: 'MU',
    authority: 'Mauritius Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TAN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TAN', example: '12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TAN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TAN', example: '12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TAN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TAN', example: '12345678' }
    ],
  },
  {
    countryName: 'Mayotte',
    countryCode: 'YT',
    authority: 'Direction générale des Finances publiques (DGFiP)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
  },
  {
    countryName: 'Mexico',
    countryCode: 'MX',
    authority: 'Servicio de Administración Tributaria (SAT), state finance secretariats',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RFC', example: 'ABCD010203AB9' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RFC', example: 'ABC010203AB9' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RFC', example: 'ABCD010203AB9' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RFC', example: 'ABC010203AB9' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RFC', example: 'ABCD010203AB9' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RFC', example: 'ABC010203AB9' }
    ],
  },
  {
    countryName: 'Micronesia',
    countryCode: 'FM',
    authority: 'Division of Customs and Tax Administration, Department of Finance and Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN', example: 'AAA-GG-SSSS' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '123456' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN', example: 'AAA-GG-SSSS' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN', example: 'AAA-GG-SSSS' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '123456' }
    ],
  },
  {
    countryName: 'Moldova',
    countryCode: 'MD',
    authority: 'State Tax Service',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'IDNP', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'IDNO', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '1234567' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'IDNP', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '1234567' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'IDNP', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'IDNO', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '1234567' }
    ],
  },
  {
    countryName: 'Monaco',
    countryCode: 'MC',
    authority: 'Department of Tax Services',
    corporateFields: [
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIS', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    individualFields: [
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    fields: [
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIS', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
  },
  {
    countryName: 'Mongolia',
    countryCode: 'MN',
    authority: 'General Department of Taxation',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567' }
    ],
  },
  {
    countryName: 'Montenegro',
    countryCode: 'ME',
    authority: 'Tax Administration of Montenegro',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'JMBG', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'PIB', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PIB', example: '12345678' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'JMBG', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PIB', example: '12345678' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'JMBG', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'PIB', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PIB', example: '12345678' }
    ],
  },
  {
    countryName: 'Montserrat',
    countryCode: 'MS',
    authority: 'Inland Revenue Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'SSN', example: '666666' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'SSN', example: '666666' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'SSN', example: '666666' }
    ],
  },
  {
    countryName: 'Morocco',
    countryCode: 'MA',
    authority: 'General Tax Administration',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IF', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IF', example: '12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IF', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IF', example: '12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IF', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IF', example: '12345678' }
    ],
  },
  {
    countryName: 'Mozambique',
    countryCode: 'MZ',
    authority: 'Mozambique Tax Authority (Autoridade Tributária de Moçambique)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NUIT', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NUIT', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NUIT', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NUIT', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NUIT', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NUIT', example: '123456789' }
    ],
  },
  {
    countryName: 'Myanmar',
    countryCode: 'MM',
    authority: 'Internal Revenue Department',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NRC', example: '12/BAHANA(N)002332' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Commercial Tax TIN', example: '123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NRC', example: '12/BAHANA(N)002332' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Commercial Tax TIN', example: '123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NRC', example: '12/BAHANA(N)002332' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Commercial Tax TIN', example: '123456789' }
    ],
  },
  {
    countryName: 'Namibia',
    countryCode: 'NA',
    authority: 'Namibia Revenue Agency (NamRA)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234 5678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234 5678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234 5678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234 5678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234 5678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234 5678' }
    ],
  },
  {
    countryName: 'Nauru',
    countryCode: 'NR',
    authority: 'Nauru Revenue Office',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123 456 789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123 456 789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123 456 789' }
    ],
  },
  {
    countryName: 'Nepal',
    countryCode: 'NP',
    authority: 'Inland Revenue Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PAN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PAN', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PAN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PAN', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PAN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PAN', example: '123456789' }
    ],
  },
  {
    countryName: 'Netherlands',
    countryCode: 'NL',
    authority: 'Netherlands Tax and Customs Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'BSN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RSIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'BTW-id', example: 'NL123456789B12' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'BSN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'BTW-id', example: 'NL123456789B12' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'BSN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RSIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'BTW-id', example: 'NL123456789B12' }
    ],
  },
  {
    countryName: 'New Caledonia',
    countryCode: 'NC',
    authority: 'Direction des Services Fiscaux',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RIDET', example: '123456.001' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TGC RIDET', example: '123456.001' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TGC RIDET', example: '123456.001' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RIDET', example: '123456.001' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TGC RIDET', example: '123456.001' }
    ],
  },
  {
    countryName: 'New Zealand',
    countryCode: 'NZ',
    authority: 'Inland Revenue',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IRD Number', example: '123-456-789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST IRD', example: '123-456-789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IRD Number', example: '123-456-789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST IRD', example: '123-456-789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IRD Number', example: '123-456-789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST IRD', example: '123-456-789' }
    ],
  },
  {
    countryName: 'Nicaragua',
    countryCode: 'NI',
    authority: 'Dirección General de Ingresos (DGI)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RUC', example: 'J1234567890123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUC', example: 'J1234567890123' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RUC', example: 'J1234567890123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUC', example: 'J1234567890123' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RUC', example: 'J1234567890123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUC', example: 'J1234567890123' }
    ],
  },
  {
    countryName: 'Niger',
    countryCode: 'NE',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '4444, 55555' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IFU/TVA Number', example: '123456789ABC' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '4444, 55555' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IFU/TVA Number', example: '123456789ABC' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '4444, 55555' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IFU/TVA Number', example: '123456789ABC' }
    ],
  },
  {
    countryName: 'Nigeria',
    countryCode: 'NG',
    authority: 'Federal Inland Revenue Service, State Internal Revenue Services',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678-0001' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345678-0001' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678-0001' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345678-0001' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678-0001' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345678-0001' }
    ],
  },
  {
    countryName: 'Niue',
    countryCode: 'NU',
    authority: 'Revenue Management Division, Ministry of Finance',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '88-888-888, 999-999-999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NCR/IRD TIN', example: '88-888-888, 999-999-999' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '88-888-888, 999-999-999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NCR/IRD TIN', example: '88-888-888, 999-999-999' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '88-888-888, 999-999-999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NCR/IRD TIN', example: '88-888-888, 999-999-999' }
    ],
  },
  {
    countryName: 'Norfolk Island',
    countryCode: 'NF',
    authority: 'Australian Taxation Office',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'ABN', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST ABN', example: '12345678901' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST ABN', example: '12345678901' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TFN', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'ABN', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST ABN', example: '12345678901' }
    ],
  },
  {
    countryName: 'North Korea',
    countryCode: 'KP',
    isUnverifiable: true,
    authority: 'Ministry of Finance',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'North Macedonia',
    countryCode: 'MK',
    authority: 'Public Revenue Office',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'EMBG', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EDB', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'MK1234567890123' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'EMBG', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'MK1234567890123' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'EMBG', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EDB', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'MK1234567890123' }
    ],
  },
  {
    countryName: 'Northern Mariana Islands',
    countryCode: 'MP',
    authority: 'Division of Revenue and Taxation',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' }
    ],
  },
  {
    countryName: 'Norway',
    countryCode: 'NO',
    authority: 'Norwegian Tax Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Fødselsnummer', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Organisation Number', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'MVA Number', example: '123456789MVA' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Fødselsnummer', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'MVA Number', example: '123456789MVA' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Fødselsnummer', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Organisation Number', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'MVA Number', example: '123456789MVA' }
    ],
  },
  {
    countryName: 'Oman',
    countryCode: 'OM',
    authority: 'Tax Authority',
    corporateFields: [
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'OM1234567890' }
    ],
    individualFields: [
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'OM1234567890' }
    ],
    fields: [
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'OM1234567890' }
    ],
  },
  {
    countryName: 'Pakistan',
    countryCode: 'PK',
    authority: 'Federal Board of Revenue, provincial revenue authorities',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CNIC', example: '12345-1234567-1' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NTN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'STRN', example: '1234567, 12345-1234567-1' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CNIC', example: '12345-1234567-1' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'STRN', example: '1234567, 12345-1234567-1' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CNIC', example: '12345-1234567-1' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NTN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'STRN', example: '1234567, 12345-1234567-1' }
    ],
  },
  {
    countryName: 'Palau',
    countryCode: 'PW',
    authority: 'Bureau of Revenue and Taxation',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PGST TIN', example: '123456' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PGST TIN', example: '123456' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'PGST TIN', example: '123456' }
    ],
  },
  {
    countryName: 'Palestine',
    countryCode: 'PS',
    authority: 'Ministry of Finance',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PS-TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PS-TIN', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PS-TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PS-TIN', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'PS-TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PS-TIN', example: '123456789' }
    ],
  },
  {
    countryName: 'Panama',
    countryCode: 'PA',
    authority: 'Dirección General de Ingresos (DGI)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal RUC', example: '8-100-678 DV: 90' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business RUC', example: '155986022-2-2019 DV: 12' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUC', example: '8-100-678 DV: 90, 155986022-2-2019 DV: 12' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal RUC', example: '8-100-678 DV: 90' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUC', example: '8-100-678 DV: 90, 155986022-2-2019 DV: 12' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal RUC', example: '8-100-678 DV: 90' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business RUC', example: '155986022-2-2019 DV: 12' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUC', example: '8-100-678 DV: 90, 155986022-2-2019 DV: 12' }
    ],
  },
  {
    countryName: 'Papua New Guinea',
    countryCode: 'PG',
    authority: 'Internal Revenue Commission',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: 'XX-XXXXXX-X' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: 'XX-XXXXXX-X' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: 'XX-XXXXXX-X' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: 'XX-XXXXXX-X' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: 'XX-XXXXXX-X' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: 'XX-XXXXXX-X' }
    ],
  },
  {
    countryName: 'Paraguay',
    countryCode: 'PY',
    authority: 'Dirección Nacional de Ingresos Tributarios (DNIT)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RUC', example: '666666-X, 7777777-X, 88888888-X, 999999999-X' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RUC/IVA Number', example: '800XXXXX-X' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RUC', example: '666666-X, 7777777-X, 88888888-X, 999999999-X' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RUC/IVA Number', example: '800XXXXX-X' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'RUC', example: '666666-X, 7777777-X, 88888888-X, 999999999-X' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'RUC/IVA Number', example: '800XXXXX-X' }
    ],
  },
  {
    countryName: 'Peru',
    countryCode: 'PE',
    authority: 'Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'DNI', example: '12345678' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RUC', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUC', example: '12345678901' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'DNI', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUC', example: '12345678901' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'DNI', example: '12345678' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RUC', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUC', example: '12345678901' }
    ],
  },
  {
    countryName: 'Philippines',
    countryCode: 'PH',
    authority: 'Bureau of Internal Revenue, Bureau of Customs',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-456-789-000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123-456-789-000' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-456-789-000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123-456-789-000' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-456-789-000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123-456-789-000' }
    ],
  },
  {
    countryName: 'Pitcairn',
    countryCode: 'PN',
    authority: 'Pitcairn Islands Office',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Poland',
    countryCode: 'PL',
    authority: 'National Revenue Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PESEL/NIP', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIP', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'PL1234567890' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PESEL/NIP', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'PL1234567890' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PESEL/NIP', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIP', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'PL1234567890' }
    ],
  },
  {
    countryName: 'Portugal',
    countryCode: 'PT',
    authority: 'Tax and Customs Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'PT123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'PT123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'PT123456789' }
    ],
  },
  {
    countryName: 'Puerto Rico',
    countryCode: 'PR',
    authority: 'Puerto Rico Department of Treasury (Departamento de Hacienda)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN', example: '123-45-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IVU Number', example: '7777777-4444' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN', example: '123-45-6789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IVU Number', example: '7777777-4444' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN', example: '123-45-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IVU Number', example: '7777777-4444' }
    ],
  },
  {
    countryName: 'Qatar',
    countryCode: 'QA',
    authority: 'General Tax Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-456-7890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-456-7890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-456-7890' }
    ],
  },
  {
    countryName: 'Republic of the Congo',
    countryCode: 'CG',
    authority: 'Direction Générale des Impôts et des Domaines',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIU', example: '12345678901234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIU TVA', example: '12345678901234567' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIU', example: '12345678901234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIU TVA', example: '12345678901234567' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIU', example: '12345678901234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIU TVA', example: '12345678901234567' }
    ],
  },
  {
    countryName: 'Réunion',
    countryCode: 'RE',
    authority: 'Direction générale des Finances publiques (DGFiP)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
  },
  {
    countryName: 'Romania',
    countryCode: 'RO',
    authority: 'National Agency for Fiscal Administration (ANAF)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CNP', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'CIF', example: '1234567891' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'RO1234567891' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CNP', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'RO1234567891' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'CNP', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'CIF', example: '1234567891' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'RO1234567891' }
    ],
  },
  {
    countryName: 'Russia',
    countryCode: 'RU',
    authority: 'Federal Tax Service',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual INN', example: 'NNNNXXXXXXCC' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business INN', example: 'NNNNXXXXXC' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'KPP', example: 'NNNN00XXX' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual INN', example: 'NNNNXXXXXXCC' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'KPP', example: 'NNNN00XXX' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual INN', example: 'NNNNXXXXXXCC' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business INN', example: 'NNNNXXXXXC' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'KPP', example: 'NNNN00XXX' }
    ],
  },
  {
    countryName: 'Rwanda',
    countryCode: 'RW',
    authority: 'Rwanda Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
  },
  {
    countryName: 'Saint Barthélemy',
    countryCode: 'BL',
    authority: 'Collectivité de Saint-Barthélemy',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'SIREN', example: '999 999 999' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'SIREN', example: '999 999 999' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'SIREN', example: '999 999 999' }
    ],
  },
  {
    countryName: 'Saint Helena, Ascension and Tristan da Cunha',
    countryCode: 'SH',
    authority: 'St Helena Revenue Office',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890123456' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890123456' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890123456' }
    ],
  },
  {
    countryName: 'Saint Kitts and Nevis',
    countryCode: 'KN',
    authority: 'Inland Revenue Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Base TIN', example: '55555' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '555551' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Base TIN', example: '55555' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '555551' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Base TIN', example: '55555' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '555551' }
    ],
  },
  {
    countryName: 'Saint Lucia',
    countryCode: 'LC',
    authority: 'Inland Revenue Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' }
    ],
  },
  {
    countryName: 'Saint Martin (French part)',
    countryCode: 'MF',
    authority: 'Collectivité de Saint-Martin, Direction générale des Finances publiques (DGFiP)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
  },
  {
    countryName: 'Saint Pierre and Miquelon',
    countryCode: 'PM',
    authority: 'Direction générale des Finances publiques (DGFiP)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Numéro fiscal', example: '12 34 56 789 012 34' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'SIREN', example: '123 456 789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA Number', example: 'FRAB123456789' }
    ],
  },
  {
    countryName: 'Saint Vincent and the Grenadines',
    countryCode: 'VC',
    authority: 'Inland Revenue Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345601' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345601' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345601' }
    ],
  },
  {
    countryName: 'Samoa',
    countryCode: 'WS',
    authority: 'Ministry for Revenue',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAGST TIN', example: '999999999' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAGST TIN', example: '999999999' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAGST TIN', example: '999999999' }
    ],
  },
  {
    countryName: 'San Marino',
    countryCode: 'SM',
    authority: 'Tax Office, Department of Finance',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSI Number', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'COE', example: 'SM12345' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSI Number', example: '123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSI Number', example: '123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'COE', example: 'SM12345' }
    ],
  },
  {
    countryName: 'Sao Tome and Principe',
    countryCode: 'ST',
    authority: 'Tax Directorate',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIF IVA', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIF IVA', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NIF', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'NIF IVA', example: '123456789' }
    ],
  },
  {
    countryName: 'Saudi Arabia',
    countryCode: 'SA',
    authority: 'Zakat, Tax and Customs Authority (ZATCA)',
    corporateFields: [
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '3123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT VRN', example: '333 456 789 012 345' }
    ],
    individualFields: [
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT VRN', example: '333 456 789 012 345' }
    ],
    fields: [
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '3123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT VRN', example: '333 456 789 012 345' }
    ],
  },
  {
    countryName: 'Senegal',
    countryCode: 'SN',
    authority: 'Direction générale des Impôts et des Domaines (DGID)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NINEA', example: '12345672A2' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NINEA', example: '12345672A2' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NINEA', example: '12345672A2' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NINEA', example: '12345672A2' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'NINEA', example: '12345672A2' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT NINEA', example: '12345672A2' }
    ],
  },
  {
    countryName: 'Serbia',
    countryCode: 'RS',
    authority: 'Tax Administration, Ministry of Finance',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'JMBG', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'PIB', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PIB', example: '123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'JMBG', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PIB', example: '123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'JMBG', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'PIB', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT PIB', example: '123456789' }
    ],
  },
  {
    countryName: 'Seychelles',
    countryCode: 'SC',
    authority: 'Seychelles Revenue Commission',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567' }
    ],
  },
  {
    countryName: 'Sierra Leone',
    countryCode: 'SL',
    authority: 'National Revenue Authority',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual TIN', example: '1234567-9' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business TIN', example: '12345678-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '1234567-9, 12345678-0' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual TIN', example: '1234567-9' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '1234567-9, 12345678-0' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual TIN', example: '1234567-9' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business TIN', example: '12345678-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '1234567-9, 12345678-0' }
    ],
  },
  {
    countryName: 'Singapore',
    countryCode: 'SG',
    authority: 'Inland Revenue Authority of Singapore',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NRIC/FIN', example: 'S1234567D' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'UEN', example: '12345678A, 202412345Z, T24LL1234G' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: 'YYYYnnnnnX, nnnnnnnnX, MnnnnnnnnX, MRnnnnnnnnA' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NRIC/FIN', example: 'S1234567D' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: 'YYYYnnnnnX, nnnnnnnnX, MnnnnnnnnX, MRnnnnnnnnA' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NRIC/FIN', example: 'S1234567D' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'UEN', example: '12345678A, 202412345Z, T24LL1234G' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST Number', example: 'YYYYnnnnnX, nnnnnnnnX, MnnnnnnnnX, MRnnnnnnnnA' }
    ],
  },
  {
    countryName: 'Sint Maarten (Dutch part)',
    countryCode: 'SX',
    authority: 'Tax Administration, Government of Sint Maarten',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'CRIB Number', example: '123.456.789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'CRIB/BBO Number', example: '123.456.789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'CRIB Number', example: '123.456.789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'CRIB/BBO Number', example: '123.456.789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'CRIB Number', example: '123.456.789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'CRIB/BBO Number', example: '123.456.789' }
    ],
  },
  {
    countryName: 'Slovakia',
    countryCode: 'SK',
    authority: 'Financial Administration of the Slovak Republic',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Rodné číslo', example: '123456/7890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'DIČ', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IČ DPH', example: 'SK1234567890' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Rodné číslo', example: '123456/7890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IČ DPH', example: 'SK1234567890' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Rodné číslo', example: '123456/7890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'DIČ', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IČ DPH', example: 'SK1234567890' }
    ],
  },
  {
    countryName: 'Slovenia',
    countryCode: 'SI',
    authority: 'Financial Administration of the Republic of Slovenia',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'SI12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'SI12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'SI12345678' }
    ],
  },
  {
    countryName: 'Solomon Islands',
    countryCode: 'SB',
    authority: 'Inland Revenue Division',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '7777777, 88888888, 999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: '7777777, 88888888, 999999999' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '7777777, 88888888, 999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: '7777777, 88888888, 999999999' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '7777777, 88888888, 999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: '7777777, 88888888, 999999999' }
    ],
  },
  {
    countryName: 'Somalia',
    countryCode: 'SO',
    authority: 'Inland Revenue Department, Ministry of Finance of the Federal Republic of Somalia',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Tirsi Aqoonsi', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: 'C123456789R, C1234567890R, C12345678901R' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: 'C123456789R, C1234567890R, C12345678901R' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Tirsi Aqoonsi', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: 'C123456789R, C1234567890R, C12345678901R' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Tirsi Aqoonsi', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: 'C123456789R, C1234567890R, C12345678901R' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: 'C123456789R, C1234567890R, C12345678901R' }
    ],
  },
  {
    countryName: 'South Africa',
    countryCode: 'ZA',
    authority: 'South African Revenue Service',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Income Tax Number', example: '0123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '4123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Income Tax Number', example: '0123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '4123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Income Tax Number', example: '0123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '4123456789' }
    ],
  },
  {
    countryName: 'South Georgia and the South Sandwich Islands',
    countryCode: 'GS',
    isUnverifiable: true,
    authority: 'N/A',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'South Korea',
    countryCode: 'KR',
    authority: 'National Tax Service',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Resident Registration Number', example: '123456-1234567' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'BRN', example: '123-45-67890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT BRN', example: '123-45-67890' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Resident Registration Number', example: '123456-1234567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT BRN', example: '123-45-67890' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Resident Registration Number', example: '123456-1234567' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'BRN', example: '123-45-67890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT BRN', example: '123-45-67890' }
    ],
  },
  {
    countryName: 'South Sudan',
    countryCode: 'SS',
    authority: 'South Sudan Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-345-567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: '123-345-567' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-345-567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: '123-345-567' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123-345-567' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: '123-345-567' }
    ],
  },
  {
    countryName: 'Spain',
    countryCode: 'ES',
    authority: 'Agencia Tributaria, regional and foral tax authorities',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NIF/NIE', example: '12345678Z / X1234567L' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIF/CIF', example: 'A1234567X' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IVA Number', example: 'ESA1234567Z' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NIF/NIE', example: '12345678Z / X1234567L' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IVA Number', example: 'ESA1234567Z' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NIF/NIE', example: '12345678Z / X1234567L' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'NIF/CIF', example: 'A1234567X' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'IVA Number', example: 'ESA1234567Z' }
    ],
  },
  {
    countryName: 'Sri Lanka',
    countryCode: 'LK',
    authority: 'Inland Revenue Department',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NIC', example: 'YYYY DDD NNNNN, 853400937V' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: 'YYYY DDD NNNNN, 853400937V' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123456789-7000' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NIC', example: 'YYYY DDD NNNNN, 853400937V' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123456789-7000' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NIC', example: 'YYYY DDD NNNNN, 853400937V' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: 'YYYY DDD NNNNN, 853400937V' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123456789-7000' }
    ],
  },
  {
    countryName: 'Sudan',
    countryCode: 'SD',
    authority: 'Sudan Tax Chamber',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: 'XXXX-YYMMDD-123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business TIN', example: 'XXX-YYMMDD-123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: 'XXX-YYMMDD-123, XXXX-YYMMDD-123' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: 'XXXX-YYMMDD-123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: 'XXX-YYMMDD-123, XXXX-YYMMDD-123' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personal TIN', example: 'XXXX-YYMMDD-123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business TIN', example: 'XXX-YYMMDD-123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax TIN', example: 'XXX-YYMMDD-123, XXXX-YYMMDD-123' }
    ],
  },
  {
    countryName: 'Suriname',
    countryCode: 'SR',
    authority: 'Tax Department, Ministry of Finance and Planning',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'FIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT FIN', example: '1234567890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'FIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT FIN', example: '1234567890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'FIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT FIN', example: '1234567890' }
    ],
  },
  {
    countryName: 'Svalbard and Jan Mayen',
    countryCode: 'SJ',
    authority: 'Norwegian Tax Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Fødselsnummer', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Organisation Number', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'MVA Number', example: '123456789MVA' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Fødselsnummer', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'MVA Number', example: '123456789MVA' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Fødselsnummer', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Organisation Number', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'MVA Number', example: '123456789MVA' }
    ],
  },
  {
    countryName: 'Sweden',
    countryCode: 'SE',
    authority: 'Swedish Tax Agency',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personnummer', example: '123456-7890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Organisationsnummer', example: '123456-7890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'SE123456789001' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personnummer', example: '123456-7890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'SE123456789001' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Personnummer', example: '123456-7890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Organisationsnummer', example: '123456-7890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'SE123456789001' }
    ],
  },
  {
    countryName: 'Switzerland',
    countryCode: 'CH',
    authority: 'Swiss Federal Tax Administration, cantonal and communal tax administrations',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'AHV Number', example: '756.1234.5678.97' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'UID', example: 'CHE-123.456.789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'CHE-123.456.789 MWST' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'AHV Number', example: '756.1234.5678.97' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'CHE-123.456.789 MWST' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'AHV Number', example: '756.1234.5678.97' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'UID', example: 'CHE-123.456.789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'CHE-123.456.789 MWST' }
    ],
  },
  {
    countryName: 'Syria',
    countryCode: 'SY',
    authority: 'General Commission for Taxes and Fees',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'National Number', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax Number', example: '12345678901' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'National Number', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax Number', example: '12345678901' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'National Number', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Sales Tax Number', example: '12345678901' }
    ],
  },
  {
    countryName: 'Taiwan',
    countryCode: 'TW',
    authority: 'Ministry of Finance, National Taxation Bureaus, local tax bureaus',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: 'A123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Uniform Business Number', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT UBN', example: '12345678' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: 'A123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT UBN', example: '12345678' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: 'A123456789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Uniform Business Number', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT UBN', example: '12345678' }
    ],
  },
  {
    countryName: 'Tajikistan',
    countryCode: 'TJ',
    authority: 'Tax Committee under the Government of the Republic of Tajikistan',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456789' }
    ],
  },
  {
    countryName: 'Tanzania',
    countryCode: 'TZ',
    authority: 'Tanzania Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345678A' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345678A' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '12345678A' }
    ],
  },
  {
    countryName: 'Thailand',
    countryCode: 'TH',
    authority: 'Revenue Department, Excise Department, Customs Department',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1 234 567 890 123' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1 234 567 890 123' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'National ID Number', example: '1 234 567 890 123' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'TIN', example: '1 234 567 890 123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1 234 567 890 123' }
    ],
  },
  {
    countryName: 'Timor-Leste',
    countryCode: 'TL',
    authority: 'Autoridade Tributária Timor-Leste (ATTL)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567' }
    ],
  },
  {
    countryName: 'Togo',
    countryCode: 'TG',
    authority: 'Office Togolais des Recettes (OTR)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIF', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA TIF', example: '1234567890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIF', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA TIF', example: '1234567890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIF', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA TIF', example: '1234567890' }
    ],
  },
  {
    countryName: 'Tokelau',
    countryCode: 'TK',
    authority: 'Government of Tokelau, Department of Finance',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IRD Number', example: '123-456-789' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IRD Number', example: '123-456-789' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IRD Number', example: '123-456-789' }
    ],
  },
  {
    countryName: 'Tonga',
    countryCode: 'TO',
    authority: 'Ministry of Revenue and Customs',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Consumption Tax TIN', example: '123456' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Consumption Tax TIN', example: '123456' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Consumption Tax TIN', example: '123456' }
    ],
  },
  {
    countryName: 'Trinidad and Tobago',
    countryCode: 'TT',
    authority: 'Inland Revenue Division',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual BIR Number', example: '123456789-0' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business BIR Number', example: '512345678-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT BIR Number', example: '512345678-0' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual BIR Number', example: '123456789-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT BIR Number', example: '512345678-0' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual BIR Number', example: '123456789-0' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business BIR Number', example: '512345678-0' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT BIR Number', example: '512345678-0' }
    ],
  },
  {
    countryName: 'Tunisia',
    countryCode: 'TN',
    authority: 'Direction Générale des Impôts',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual IF/TIN', example: '1234567A' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business IF/TIN', example: '5432167A/XXX/000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IF/TIN', example: '5432167A/XXX/000' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual IF/TIN', example: '1234567A' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IF/TIN', example: '5432167A/XXX/000' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual IF/TIN', example: '1234567A' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business IF/TIN', example: '5432167A/XXX/000' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT IF/TIN', example: '5432167A/XXX/000' }
    ],
  },
  {
    countryName: 'Türkiye',
    countryCode: 'TR',
    authority: 'Revenue Administration',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TCKN', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'VKN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '1234567890' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TCKN', example: '12345678901' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '1234567890' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'TCKN', example: '12345678901' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'VKN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '1234567890' }
    ],
  },
  {
    countryName: 'Turkmenistan',
    countryCode: 'TM',
    authority: 'Tax Department of the Ministry of Finance and Economy of Turkmenistan',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'HSB/TIN', example: '123456789012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT HSB/TIN', example: '123456789012' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'HSB/TIN', example: '123456789012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT HSB/TIN', example: '123456789012' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'HSB/TIN', example: '123456789012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT HSB/TIN', example: '123456789012' }
    ],
  },
  {
    countryName: 'Turks and Caicos Islands',
    countryCode: 'TC',
    authority: 'Revenue Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TCI NIB', example: 'AB123456C' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TCI NIB', example: 'AB123456C' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TCI NIB', example: 'AB123456C' }
    ],
  },
  {
    countryName: 'Tuvalu',
    countryCode: 'TV',
    authority: 'Inland Revenue and Customs Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TCT Number', example: '55555' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TCT Number', example: '55555' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '999999999' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TCT Number', example: '55555' }
    ],
  },
  {
    countryName: 'Uganda',
    countryCode: 'UG',
    authority: 'Uganda Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1014751879' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1014751879' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1014751879' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1014751879' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1014751879' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1014751879' }
    ],
  },
  {
    countryName: 'Ukraine',
    countryCode: 'UA',
    authority: 'State Tax Service of Ukraine, State Customs Service of Ukraine',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'RNTRC', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EDRPOU', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123 456 789 012' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'RNTRC', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123 456 789 012' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'RNTRC', example: '1234567890' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EDRPOU', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123 456 789 012' }
    ],
  },
  {
    countryName: 'United Arab Emirates',
    countryCode: 'AE',
    authority: 'Federal Tax Authority, emirate-level finance and tax authorities',
    corporateFields: [
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Corporate Tax Registration Number', example: '100 2345 6789 0123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TRN', example: '123 456 789 012 345' }
    ],
    individualFields: [
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TRN', example: '123 456 789 012 345' }
    ],
    fields: [
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Corporate Tax Registration Number', example: '100 2345 6789 0123' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TRN', example: '123 456 789 012 345' }
    ],
  },
  {
    countryName: 'United Kingdom',
    countryCode: 'GB',
    authority: 'HM Revenue & Customs, Welsh Revenue Authority, Revenue Scotland',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NINO', example: 'AB123456C' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'UTR', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'GB123456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NINO', example: 'AB123456C' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'GB123456789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'NINO', example: 'AB123456C' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'UTR', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: 'GB123456789' }
    ],
  },
  {
    countryName: 'United States',
    countryCode: 'US',
    authority: 'Internal Revenue Service, state departments of revenue and taxation',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789, 912-34-5678' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789, 912-34-5678' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789, 912-34-5678' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' }
    ],
  },
  {
    countryName: 'United States Minor Outlying Islands',
    countryCode: 'UM',
    isUnverifiable: true,
    authority: 'N/A',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Uruguay',
    countryCode: 'UY',
    authority: 'Dirección General Impositiva',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Identity Card', example: '12345678' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RUT', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUT', example: '123 456 789 012' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Identity Card', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUT', example: '123 456 789 012' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Identity Card', example: '12345678' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'RUT', example: '123 456 789 012' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT RUT', example: '123 456 789 012' }
    ],
  },
  {
    countryName: 'Uzbekistan',
    countryCode: 'UZ',
    authority: 'Tax Committee of the Republic of Uzbekistan',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PINFL', example: '12 345 678 901 234' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'STIR', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123 456 789 012' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PINFL', example: '12 345 678 901 234' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123 456 789 012' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'PINFL', example: '12 345 678 901 234' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'STIR', example: '123456789' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Number', example: '123 456 789 012' }
    ],
  },
  {
    countryName: 'Vanuatu',
    countryCode: 'VU',
    authority: 'Customs and Inland Revenue Department',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456, 1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456, 1234567890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456, 1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456, 1234567890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '123456, 1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '123456, 1234567890' }
    ],
  },
  {
    countryName: 'Venezuela',
    countryCode: 'VE',
    authority: 'Servicio Nacional Integrado de Administración Aduanera y Tributaria (SENIAT)',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual RIF', example: 'V-12345678-9' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business RIF', example: 'J-12345678-9' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Business RIF', example: 'J-12345678-9' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual RIF', example: 'V-12345678-9' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Business RIF', example: 'J-12345678-9' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'Individual RIF', example: 'V-12345678-9' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'Business RIF', example: 'J-12345678-9' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'Business RIF', example: 'J-12345678-9' }
    ],
  },
  {
    countryName: 'Vietnam',
    countryCode: 'VN',
    authority: 'General Department of Taxation',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Tax Code', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Tax Code', example: '1234567890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Tax Code', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Tax Code', example: '1234567890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'Tax Code', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT Tax Code', example: '1234567890' }
    ],
  },
  {
    countryName: 'Virgin Islands, British',
    countryCode: 'VG',
    authority: 'Inland Revenue Department',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Virgin Islands, U.S.',
    countryCode: 'VI',
    authority: 'Virgin Islands Bureau of Internal Revenue',
    corporateFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' }
    ],
    individualFields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' }
    ],
    fields: [
      { key: 'individual_tax_id', label: 'Individual Tax ID', localName: 'SSN/ITIN', example: '123-45-6789' },
      { key: 'business_tax_id', label: 'Business Tax ID', localName: 'EIN', example: '12-3456789' }
    ],
  },
  {
    countryName: 'Wallis and Futuna',
    countryCode: 'WF',
    authority: 'Direction générale des Finances publiques (DGFiP)',
    corporateFields: [],
    individualFields: [],
    fields: [],
  },
  {
    countryName: 'Western Sahara',
    countryCode: 'EH',
    authority: 'General Tax Administration (Morocco-administered areas)',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IF/TIN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA IF/TIN', example: '12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IF/TIN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA IF/TIN', example: '12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'IF/TIN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'TVA IF/TIN', example: '12345678' }
    ],
  },
  {
    countryName: 'Yemen',
    countryCode: 'YE',
    authority: 'Yemen Tax Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '12345678' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '12345678' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '12345678' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'GST TIN', example: '12345678' }
    ],
  },
  {
    countryName: 'Zambia',
    countryCode: 'ZM',
    authority: 'Zambia Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TPIN', example: '1004751879' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TPIN', example: '1004751879' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TPIN', example: '1004751879' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TPIN', example: '1004751879' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TPIN', example: '1004751879' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TPIN', example: '1004751879' }
    ],
  },
  {
    countryName: 'Zimbabwe',
    countryCode: 'ZW',
    authority: 'Zimbabwe Revenue Authority',
    corporateFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567890' }
    ],
    individualFields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567890' }
    ],
    fields: [
      { key: 'generic_tax_id', label: 'Generic/Tax ID', localName: 'TIN', example: '1234567890' },
      { key: 'vat_gst_sst_id', label: 'VAT/GST/SST ID', localName: 'VAT TIN', example: '1234567890' }
    ],
  },
]

const normalizeCountryName = (countryName: string) =>
  countryName.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const profileByCountryName = ARTIST_TAX_ID_COUNTRY_PROFILES.reduce((map, profile) => {
  map.set(normalizeCountryName(profile.countryName), profile)
  profile.aliases?.forEach((alias) => map.set(normalizeCountryName(alias), profile))
  return map
}, new Map<string, ArtistTaxIdCountryProfile>())

const profileByCountryCode = ARTIST_TAX_ID_COUNTRY_PROFILES.reduce((map, profile) => {
  if (profile.countryCode) map.set(profile.countryCode.toUpperCase(), profile)
  return map
}, new Map<string, ArtistTaxIdCountryProfile>())

export const ARTIST_TAX_ID_COUNTRY_NAMES = ARTIST_TAX_ID_COUNTRY_PROFILES.map((p) => p.countryName)

/** Look up a country profile by name or ISO 2-letter code. */
export function getArtistTaxIdProfile(countryNameOrCode?: string | null): ArtistTaxIdCountryProfile {
  const trimmed = countryNameOrCode?.trim()
  if (!trimmed) return { countryName: 'Selected country', countryCode: '', authority: 'Local Tax Authority', corporateFields: DEFAULT_TAX_ID_FIELDS, individualFields: DEFAULT_TAX_ID_FIELDS, fields: DEFAULT_TAX_ID_FIELDS }
  // Try 2-letter code first
  if (trimmed.length === 2) {
    const byCode = profileByCountryCode.get(trimmed.toUpperCase())
    if (byCode) return byCode
  }
  const byName = profileByCountryName.get(normalizeCountryName(trimmed))
  if (byName) return byName
  return { countryName: trimmed, countryCode: '', authority: 'Local Tax Authority', corporateFields: DEFAULT_TAX_ID_FIELDS, individualFields: DEFAULT_TAX_ID_FIELDS, fields: DEFAULT_TAX_ID_FIELDS }
}