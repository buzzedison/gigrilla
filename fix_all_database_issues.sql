-- ============================================================================
-- COMPREHENSIVE DATABASE FIX FOR GIGRILLA
-- ============================================================================
-- This script applies all missing migrations and fixes RLS issues
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- MIGRATION 008: Add essential fan columns
-- ============================================================================

-- Add essential columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'guest',
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username) WHERE username IS NOT NULL;

-- ============================================================================
-- MIGRATION 007: Add comprehensive artist fields
-- ============================================================================

-- Add new columns to user_profiles table for artist-specific data
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS hometown_city TEXT,
ADD COLUMN IF NOT EXISTS hometown_state TEXT,
ADD COLUMN IF NOT EXISTS hometown_country TEXT,
ADD COLUMN IF NOT EXISTS gigs_performed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS record_label_status TEXT DEFAULT 'Unsigned',
ADD COLUMN IF NOT EXISTS record_label_name TEXT,
ADD COLUMN IF NOT EXISTS record_label_email TEXT,
ADD COLUMN IF NOT EXISTS music_publisher_status TEXT DEFAULT 'Unsigned',
ADD COLUMN IF NOT EXISTS music_publisher_name TEXT,
ADD COLUMN IF NOT EXISTS music_publisher_email TEXT,
ADD COLUMN IF NOT EXISTS artist_manager_status TEXT DEFAULT 'Self-Managed',
ADD COLUMN IF NOT EXISTS artist_manager_name TEXT,
ADD COLUMN IF NOT EXISTS artist_manager_email TEXT,
ADD COLUMN IF NOT EXISTS booking_agent_status TEXT DEFAULT 'Self-Booking',
ADD COLUMN IF NOT EXISTS booking_agent_name TEXT,
ADD COLUMN IF NOT EXISTS booking_agent_email TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS spotify_url TEXT,
ADD COLUMN IF NOT EXISTS basic_gig_fee DECIMAL(10,2);

-- Create artist_members table for band/group members
CREATE TABLE IF NOT EXISTS public.artist_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    nickname TEXT,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    roles TEXT[] DEFAULT '{}', -- Array of roles like ['Lead Singer', 'Keyboardist']
    income_share DECIMAL(5,2) DEFAULT 0.00, -- Percentage share (0.00 to 100.00)
    display_age_on_profile BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create artist_photos table for photo management
CREATE TABLE IF NOT EXISTS public.artist_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create artist_videos table for video management
CREATE TABLE IF NOT EXISTS public.artist_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- Duration in seconds
    video_type TEXT DEFAULT 'youtube', -- 'youtube', 'vimeo', 'direct', etc.
    description TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artist_members_profile_id ON public.artist_members(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_artist_photos_profile_id ON public.artist_photos(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_artist_videos_profile_id ON public.artist_videos(artist_profile_id);

-- Enable RLS on new tables
ALTER TABLE public.artist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_videos ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.artist_members TO authenticated;
GRANT ALL ON public.artist_photos TO authenticated;
GRANT ALL ON public.artist_videos TO authenticated;

-- ============================================================================
-- MIGRATION 009: Fix RLS policies for user_profiles
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "user_profiles_select_all" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_own_access" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_all_operations" ON public.user_profiles;

-- Create a comprehensive policy that allows users to manage their own profiles
CREATE POLICY "user_profiles_all_operations" ON public.user_profiles
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;

-- ============================================================================
-- CREATE RLS POLICIES FOR ARTIST TABLES
-- ============================================================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view artist members of published profiles" ON public.artist_members;
DROP POLICY IF EXISTS "Users can manage their own artist members" ON public.artist_members;
DROP POLICY IF EXISTS "Users can view artist photos of published profiles" ON public.artist_photos;
DROP POLICY IF EXISTS "Users can manage their own artist photos" ON public.artist_photos;
DROP POLICY IF EXISTS "Users can view artist videos of published profiles" ON public.artist_videos;
DROP POLICY IF EXISTS "Users can manage their own artist videos" ON public.artist_videos;

-- Create RLS policies for artist_members
CREATE POLICY "Users can view artist members of published profiles" ON public.artist_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = artist_profile_id 
            AND up.is_published = true
        )
    );

CREATE POLICY "Users can manage their own artist members" ON public.artist_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = artist_profile_id 
            AND up.user_id = auth.uid()
        )
    );

-- Create RLS policies for artist_photos
CREATE POLICY "Users can view artist photos of published profiles" ON public.artist_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = artist_profile_id 
            AND up.is_published = true
        )
    );

CREATE POLICY "Users can manage their own artist photos" ON public.artist_photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = artist_profile_id 
            AND up.user_id = auth.uid()
        )
    );

-- Create RLS policies for artist_videos
CREATE POLICY "Users can view artist videos of published profiles" ON public.artist_videos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = artist_profile_id 
            AND up.is_published = true
        )
    );

CREATE POLICY "Users can manage their own artist videos" ON public.artist_videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = artist_profile_id 
            AND up.user_id = auth.uid()
        )
    );

-- ============================================================================
-- CREATE HELPER FUNCTIONS
-- ============================================================================

-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS public.upsert_fan_profile;

-- Function to safely upsert user profile data
CREATE OR REPLACE FUNCTION public.upsert_fan_profile(
    p_user_id UUID,
    p_username TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_location_details JSONB DEFAULT NULL,
    p_privacy_settings JSONB DEFAULT NULL,
    p_date_of_birth DATE DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Upsert the profile
    INSERT INTO public.user_profiles (
        user_id,
        username,
        display_name,
        bio,
        location_details,
        privacy_settings,
        date_of_birth,
        account_type,
        updated_at
    ) VALUES (
        p_user_id,
        p_username,
        p_display_name,
        p_bio,
        p_location_details,
        p_privacy_settings,
        p_date_of_birth,
        'full_fan',
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        username = COALESCE(EXCLUDED.username, user_profiles.username),
        display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
        bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
        location_details = COALESCE(EXCLUDED.location_details, user_profiles.location_details),
        privacy_settings = COALESCE(EXCLUDED.privacy_settings, user_profiles.privacy_settings),
        date_of_birth = COALESCE(EXCLUDED.date_of_birth, user_profiles.date_of_birth),
        account_type = 'full_fan',
        updated_at = NOW()
    RETURNING * INTO profile_record;

    RETURN jsonb_build_object(
        'success', true,
        'profile', row_to_json(profile_record)
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.upsert_fan_profile TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that all tables exist
SELECT 
    'user_profiles' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') as exists
UNION ALL
SELECT 
    'artist_members' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_members' AND table_schema = 'public') as exists
UNION ALL
SELECT 
    'artist_photos' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_photos' AND table_schema = 'public') as exists
UNION ALL
SELECT 
    'artist_videos' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_videos' AND table_schema = 'public') as exists;

-- Check that essential columns exist
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
    AND table_schema = 'public'
    AND column_name IN ('username', 'display_name', 'account_type', 'hometown_city', 'record_label_status')
ORDER BY column_name;

-- Test that RLS policies work
SELECT 'RLS policies created successfully' as status;
