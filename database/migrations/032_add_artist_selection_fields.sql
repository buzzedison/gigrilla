-- ============================================================================
-- 032_add_artist_selection_fields.sql
-- Adds artist selection fields for Types 4-8 (Vocalist, Instrumentalist, Songwriter, Lyricist, Composer)
-- ============================================================================

-- Add vocalist fields (Type 4)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS vocal_sound_types TEXT,
ADD COLUMN IF NOT EXISTS vocal_genre_styles TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT;

-- Add instrumentalist fields (Type 5)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS instrument_category TEXT,
ADD COLUMN IF NOT EXISTS instrument TEXT;

-- Add songwriter fields (Type 6)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS songwriter_option TEXT,
ADD COLUMN IF NOT EXISTS songwriter_genres TEXT;

-- Add lyricist fields (Type 7)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS lyricist_option TEXT,
ADD COLUMN IF NOT EXISTS lyricist_genres TEXT;

-- Add composer fields (Type 8)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS composer_option TEXT,
ADD COLUMN IF NOT EXISTS composer_genres TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.vocal_sound_types IS 'Artist vocal sound types (comma-separated) - Type 4 Vocalist';
COMMENT ON COLUMN public.user_profiles.vocal_genre_styles IS 'Artist vocal genre styles (comma-separated) - Type 4 Vocalist';
COMMENT ON COLUMN public.user_profiles.availability IS 'Artist availability options (comma-separated) - Types 4 & 5';
COMMENT ON COLUMN public.user_profiles.instrument_category IS 'Artist instrument category - Type 5 Instrumentalist';
COMMENT ON COLUMN public.user_profiles.instrument IS 'Artist specific instrument - Type 5 Instrumentalist';
COMMENT ON COLUMN public.user_profiles.songwriter_option IS 'Songwriter scope option - Type 6 Songwriter';
COMMENT ON COLUMN public.user_profiles.songwriter_genres IS 'Songwriter genres (comma-separated) - Type 6 Songwriter';
COMMENT ON COLUMN public.user_profiles.lyricist_option IS 'Lyricist scope option - Type 7 Lyricist';
COMMENT ON COLUMN public.user_profiles.lyricist_genres IS 'Lyricist genres (comma-separated) - Type 7 Lyricist';
COMMENT ON COLUMN public.user_profiles.composer_option IS 'Composer scope option - Type 8 Composer';
COMMENT ON COLUMN public.user_profiles.composer_genres IS 'Composer genres (comma-separated) - Type 8 Composer';

-- Record migration version
INSERT INTO db_version (version, description)
VALUES (32, 'Added artist selection fields for Types 4-8: vocal, instrumental, songwriter, lyricist, composer options')
ON CONFLICT (version) DO NOTHING;
