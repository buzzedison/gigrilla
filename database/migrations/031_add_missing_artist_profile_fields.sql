-- ============================================================================
-- 031_add_missing_artist_profile_fields.sql
-- Adds missing artist profile fields for onboarding
-- ============================================================================

-- Add missing social media fields
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS threads_url TEXT,
ADD COLUMN IF NOT EXISTS x_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS snapchat_url TEXT;

-- Add location coordinates for gig distance calculations
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS base_location_lat DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS base_location_lon DECIMAL(10, 7);

-- Add performing members count
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS performing_members INTEGER DEFAULT 1;

-- Add onboarding completion tracking
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_location_coords 
ON public.user_profiles(base_location_lat, base_location_lon) 
WHERE base_location_lat IS NOT NULL AND base_location_lon IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.threads_url IS 'Artist Threads.net profile URL';
COMMENT ON COLUMN public.user_profiles.x_url IS 'Artist X (formerly Twitter) profile URL';
COMMENT ON COLUMN public.user_profiles.tiktok_url IS 'Artist TikTok profile URL';
COMMENT ON COLUMN public.user_profiles.snapchat_url IS 'Artist Snapchat profile URL';
COMMENT ON COLUMN public.user_profiles.base_location_lat IS 'Latitude coordinate for gig distance calculations';
COMMENT ON COLUMN public.user_profiles.base_location_lon IS 'Longitude coordinate for gig distance calculations';
COMMENT ON COLUMN public.user_profiles.performing_members IS 'Number of performing members in the artist group/band';
COMMENT ON COLUMN public.user_profiles.onboarding_completed IS 'Indicates whether artist onboarding steps are completed';
COMMENT ON COLUMN public.user_profiles.onboarding_completed_at IS 'Timestamp when artist onboarding was completed';

-- Record migration version
INSERT INTO db_version (version, description)
VALUES (31, 'Added missing artist profile fields: social media URLs, location coordinates, performing members count')
ON CONFLICT (version) DO NOTHING;
