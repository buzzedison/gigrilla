-- ============================================================================
-- 012_add_artist_basic_fields.sql
-- Adds basic artist fields that are expected by the frontend
-- ============================================================================

-- Add basic artist fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS stage_name TEXT,
ADD COLUMN IF NOT EXISTS established_date DATE,
ADD COLUMN IF NOT EXISTS base_location TEXT,
ADD COLUMN IF NOT EXISTS members TEXT[], -- Array of member names
ADD COLUMN IF NOT EXISTS website TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_stage_name ON public.user_profiles(stage_name) WHERE stage_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_base_location ON public.user_profiles(base_location) WHERE base_location IS NOT NULL;

-- Record migration version
INSERT INTO db_version (version, description)
VALUES (12, 'Added basic artist fields: stage_name, established_date, base_location, members, website')
ON CONFLICT (version) DO NOTHING;
