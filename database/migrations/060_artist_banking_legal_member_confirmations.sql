-- Migration 060: Persist Artist Banking legal member confirmations
-- Stores profile-owner/member confirmation state alongside Artist Banking compliance data.

ALTER TABLE public.artist_payment_details
  ADD COLUMN IF NOT EXISTS legal_member_confirmations JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.artist_payment_details
SET legal_member_confirmations = '{}'::jsonb
WHERE legal_member_confirmations IS NULL;

COMMENT ON COLUMN public.artist_payment_details.legal_member_confirmations IS
  'JSONB map of Artist Banking legal member confirmations keyed by legal member id, with confirmed_at and confirmed_by audit data';

INSERT INTO db_version (version, description)
VALUES (60, 'Persisted Artist Banking legal member confirmations')
ON CONFLICT (version) DO NOTHING;
