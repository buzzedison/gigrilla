-- Migration: Extend artist_payment_details for Artist Banking compliance
-- Description: Adds official ID acknowledgements and legal entity fields for Artist Banking.
-- Date: 2026-04-29

ALTER TABLE public.artist_payment_details
ADD COLUMN IF NOT EXISTS official_ids_acknowledged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_flows_acknowledged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IS NULL OR entity_type IN ('Incorporated Company', 'Incorporated Partnership', 'Sole Trader', 'Partnership')),
ADD COLUMN IF NOT EXISTS artist_entity_legal_name TEXT,
ADD COLUMN IF NOT EXISTS main_contact_first_name TEXT,
ADD COLUMN IF NOT EXISTS main_contact_last_name TEXT,
ADD COLUMN IF NOT EXISTS main_contact_phone_country_code TEXT,
ADD COLUMN IF NOT EXISTS main_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS main_contact_email TEXT,
ADD COLUMN IF NOT EXISTS country_of_incorporation TEXT,
ADD COLUMN IF NOT EXISTS country_of_tax_residence TEXT,
ADD COLUMN IF NOT EXISTS generic_tax_id TEXT,
ADD COLUMN IF NOT EXISTS individual_tax_id TEXT,
ADD COLUMN IF NOT EXISTS business_tax_id TEXT,
ADD COLUMN IF NOT EXISTS vat_gst_sst_id TEXT,
ADD COLUMN IF NOT EXISTS company_registration_number TEXT,
ADD COLUMN IF NOT EXISTS company_formation_date DATE,
ADD COLUMN IF NOT EXISTS legal_entity_date_of_birth DATE;

COMMENT ON COLUMN public.artist_payment_details.official_ids_acknowledged IS 'Profile owner acknowledgement of the Official ID Numbers notice';
COMMENT ON COLUMN public.artist_payment_details.payment_flows_acknowledged IS 'Profile owner acknowledgement of the Payment Flows notice';
COMMENT ON COLUMN public.artist_payment_details.entity_type IS 'Artist legal entity type for compliance and payout reporting';
COMMENT ON COLUMN public.artist_payment_details.artist_entity_legal_name IS 'Legal payee name for the artist entity';
COMMENT ON COLUMN public.artist_payment_details.main_contact_first_name IS 'Main compliance/payments contact first name';
COMMENT ON COLUMN public.artist_payment_details.main_contact_last_name IS 'Main compliance/payments contact last name';
COMMENT ON COLUMN public.artist_payment_details.main_contact_phone_country_code IS 'Main compliance/payments contact phone country code';
COMMENT ON COLUMN public.artist_payment_details.main_contact_phone IS 'Main compliance/payments contact phone number';
COMMENT ON COLUMN public.artist_payment_details.main_contact_email IS 'Main compliance/payments contact email address';
COMMENT ON COLUMN public.artist_payment_details.country_of_incorporation IS 'Business country of incorporation for incorporated entities';
COMMENT ON COLUMN public.artist_payment_details.country_of_tax_residence IS 'Tax residence country for sole trader/partnership entities';
COMMENT ON COLUMN public.artist_payment_details.generic_tax_id IS 'Generic or local tax ID supplied for the artist entity';
COMMENT ON COLUMN public.artist_payment_details.individual_tax_id IS 'Individual taxpayer ID supplied for the artist entity';
COMMENT ON COLUMN public.artist_payment_details.business_tax_id IS 'Business taxpayer ID supplied for the artist entity';
COMMENT ON COLUMN public.artist_payment_details.vat_gst_sst_id IS 'VAT/GST/SST ID supplied for the artist entity';
COMMENT ON COLUMN public.artist_payment_details.company_registration_number IS 'Company registration number, if issued';
COMMENT ON COLUMN public.artist_payment_details.company_formation_date IS 'Company formation date for incorporated entities';
COMMENT ON COLUMN public.artist_payment_details.legal_entity_date_of_birth IS 'Date of birth for individual/sole trader compliance';

INSERT INTO db_version (version, description)
VALUES (53, 'Extended artist payment details for Artist Banking compliance and legal entity data')
ON CONFLICT (version) DO NOTHING;
