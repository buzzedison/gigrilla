-- ============================================================================
-- Add missing columns to fan_profiles table
-- ============================================================================
-- Migration: 025_add_missing_fan_profiles_columns.sql
-- Description: Adds all missing columns needed by the fan profile API

-- Add avatar_url column
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add music_preferences as JSONB (stores genre_families, main_genres, sub_genres)
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS music_preferences JSONB DEFAULT '{}'::jsonb;

-- Add photo_gallery as TEXT[] (array of photo URLs)
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS photo_gallery TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add video_links as JSONB (array of objects with title and url)
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS video_links JSONB DEFAULT '[]'::jsonb;

-- Add username column if not exists
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Add display_name column if not exists
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add contact_details as JSONB if not exists
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS contact_details JSONB DEFAULT '{}'::jsonb;

-- Add location_details as JSONB if not exists
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS location_details JSONB DEFAULT '{}'::jsonb;

-- Add preferred_genre_ids as TEXT[] if not exists (from migration 013)
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS preferred_genre_ids TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add preferred_genres as TEXT[] if not exists (from migration 011)
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS preferred_genres TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add account_type if not exists
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'guest';

-- Add created_at if not exists
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at if not exists
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fan_profiles_avatar_url 
  ON public.fan_profiles(avatar_url) 
  WHERE avatar_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fan_profiles_username 
  ON public.fan_profiles(username) 
  WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fan_profiles_music_preferences 
  ON public.fan_profiles USING GIN (music_preferences);

CREATE INDEX IF NOT EXISTS idx_fan_profiles_photo_gallery 
  ON public.fan_profiles USING GIN (photo_gallery);

CREATE INDEX IF NOT EXISTS idx_fan_profiles_preferred_genre_ids 
  ON public.fan_profiles USING GIN (preferred_genre_ids);

CREATE INDEX IF NOT EXISTS idx_fan_profiles_preferred_genres 
  ON public.fan_profiles USING GIN (preferred_genres);

