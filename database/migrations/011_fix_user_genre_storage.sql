-- ============================================================================
-- FIX USER GENRE STORAGE
-- ============================================================================
-- Replace the complex user_genre_preferences table with a simpler approach
-- that stores genre names directly as an array in fan_profiles

-- First, let's add a preferred_genres column to fan_profiles if it doesn't exist
ALTER TABLE fan_profiles 
ADD COLUMN IF NOT EXISTS preferred_genres TEXT[] DEFAULT '{}';

-- Create an index for performance on genre searches
CREATE INDEX IF NOT EXISTS idx_fan_profiles_preferred_genres 
ON fan_profiles USING GIN (preferred_genres);

-- Update database version
INSERT INTO db_version (version, description) 
VALUES (11, 'Fixed user genre storage to use simple text array in fan_profiles')
ON CONFLICT (version) DO NOTHING;
