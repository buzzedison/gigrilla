-- 048_add_fan_profile_missing_columns.sql
-- Adds columns that were referenced in code but never formally migrated

BEGIN;

-- is_public: controls whether the fan profile is publicly visible
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- bio: short biography text for the fan profile
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- privacy_settings: JSONB holding per-field privacy flags
-- (name_private, location_private, is_public, etc.)
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}'::jsonb;

-- Index for public profile lookups
CREATE INDEX IF NOT EXISTS idx_fan_profiles_is_public
  ON public.fan_profiles(is_public)
  WHERE is_public = TRUE;

COMMIT;
