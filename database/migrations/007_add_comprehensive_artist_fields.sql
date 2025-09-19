-- Add comprehensive artist profile fields to match the UI design
-- This migration adds all the fields needed for the detailed artist profile system

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

-- Grant permissions
GRANT ALL ON public.artist_members TO authenticated;
GRANT ALL ON public.artist_photos TO authenticated;
GRANT ALL ON public.artist_videos TO authenticated;
