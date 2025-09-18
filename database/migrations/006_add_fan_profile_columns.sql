-- =============================================================
-- 006_add_fan_profile_columns.sql
-- Adds missing fan-related columns to user_profiles
-- =============================================================

-- Add account_type and date_of_birth to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT CHECK (account_type IN ('guest','full')) DEFAULT 'guest',
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Optional: backfill account_type for fans with full details
UPDATE user_profiles
SET account_type = 'full'
WHERE profile_type = 'fan'
  AND account_type IS DISTINCT FROM 'full'
  AND contact_details IS NOT NULL
  AND location_details IS NOT NULL;

-- Record migration version
INSERT INTO db_version (version, description)
VALUES (6, 'Add fan-related columns (account_type, date_of_birth) to user_profiles')
ON CONFLICT (version) DO NOTHING;


