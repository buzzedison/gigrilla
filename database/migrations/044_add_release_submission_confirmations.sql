-- Migration: Add submission Ts&Cs and digital signature columns to music_releases
-- Release cannot go to pending_review without these confirmations and signature.

-- I Agree To (Ts&Cs)
ALTER TABLE music_releases
  ADD COLUMN IF NOT EXISTS agree_terms_of_use BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS agree_distribution_policy BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS agree_privacy_policy BOOLEAN DEFAULT FALSE;

-- I Confirm That
ALTER TABLE music_releases
  ADD COLUMN IF NOT EXISTS confirm_details_true BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirm_legal_liability BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirm_no_other_artist_name BOOLEAN DEFAULT FALSE;

-- I Am (authority: owner or appointed representative)
ALTER TABLE music_releases
  ADD COLUMN IF NOT EXISTS signatory_role TEXT CHECK (signatory_role IN ('owner', 'representative'));

-- Digital signature (full legal name + email)
ALTER TABLE music_releases
  ADD COLUMN IF NOT EXISTS signatory_first_name TEXT,
  ADD COLUMN IF NOT EXISTS signatory_middle_names TEXT,
  ADD COLUMN IF NOT EXISTS signatory_last_name TEXT,
  ADD COLUMN IF NOT EXISTS signatory_email TEXT;

COMMENT ON COLUMN music_releases.agree_terms_of_use IS 'User agreed to Gigrilla Terms of Use';
COMMENT ON COLUMN music_releases.agree_distribution_policy IS 'User agreed to Gigrilla Distribution Policy';
COMMENT ON COLUMN music_releases.agree_privacy_policy IS 'User agreed to Gigrilla Privacy Policy';
COMMENT ON COLUMN music_releases.signatory_role IS 'owner = Owner Of The Master Recording; representative = Appointed & Authorised Representative';
