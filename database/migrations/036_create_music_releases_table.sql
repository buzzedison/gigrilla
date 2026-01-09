-- Migration: Create music_releases table for storing artist music release data
-- This table stores all the release information from the Music Manager wizard

-- Create music_releases table
CREATE TABLE IF NOT EXISTS music_releases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Release identification
    upc TEXT,
    upc_confirmed BOOLEAN DEFAULT FALSE,
    ean TEXT,
    ean_confirmed BOOLEAN DEFAULT FALSE,
    release_title TEXT NOT NULL,
    release_title_confirmed BOOLEAN DEFAULT FALSE,
    release_title_source TEXT CHECK (release_title_source IN ('gtin', 'manual')) DEFAULT 'manual',
    
    -- Release type and format
    release_type TEXT CHECK (release_type IN ('single', 'ep', 'album')),
    track_count INTEGER DEFAULT 1,
    track_count_label TEXT,
    release_version TEXT DEFAULT 'original-studio',
    apply_version_to_all BOOLEAN DEFAULT FALSE,
    
    -- Geographical availability
    country_of_origin TEXT,
    available_home BOOLEAN DEFAULT FALSE,
    available_specific BOOLEAN DEFAULT FALSE,
    available_worldwide BOOLEAN DEFAULT FALSE,
    specific_territories TEXT[] DEFAULT '{}',
    territory_rights_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Go-live date
    go_live_option TEXT CHECK (go_live_option IN ('past', 'asap', 'future')),
    go_live_date DATE,
    
    -- Master rights
    master_rights_type TEXT CHECK (master_rights_type IN ('independent', 'label')),
    record_labels JSONB DEFAULT '[]',
    master_rights_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Publishing rights
    publishing_rights_type TEXT CHECK (publishing_rights_type IN ('independent', 'publisher')),
    publishers JSONB DEFAULT '[]',
    apply_publisher_to_all_tracks BOOLEAN DEFAULT FALSE,
    publishing_rights_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Distributor info
    distributor_name TEXT,
    distributor_confirmed BOOLEAN DEFAULT FALSE,
    distributor_contact_name TEXT,
    distributor_contact_email TEXT,
    
    -- Composition/songwriting
    wrote_composition BOOLEAN DEFAULT TRUE,
    
    -- PRO (Performing Rights Organisation)
    pro_name TEXT,
    pro_confirmed BOOLEAN DEFAULT FALSE,
    pro_contact_name TEXT,
    pro_contact_email TEXT,
    
    -- MCS (Mechanical Collection Society)
    mcs_name TEXT,
    mcs_confirmed BOOLEAN DEFAULT FALSE,
    mcs_contact_name TEXT,
    mcs_contact_email TEXT,
    
    -- Cover artwork
    cover_artwork_url TEXT,
    cover_caption TEXT,
    
    -- Status tracking
    status TEXT CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'rejected')) DEFAULT 'draft',
    current_step TEXT DEFAULT 'guide',
    upload_guide_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_music_releases_user_id ON music_releases(user_id);
CREATE INDEX idx_music_releases_status ON music_releases(status);
CREATE INDEX idx_music_releases_release_type ON music_releases(release_type);
CREATE INDEX idx_music_releases_created_at ON music_releases(created_at);
CREATE INDEX idx_music_releases_upc ON music_releases(upc) WHERE upc IS NOT NULL;

-- Create RLS (Row Level Security) policies
ALTER TABLE music_releases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own releases
CREATE POLICY "Users can view their own releases" ON music_releases
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own releases
CREATE POLICY "Users can insert their own releases" ON music_releases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own releases
CREATE POLICY "Users can update their own releases" ON music_releases
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own draft releases
CREATE POLICY "Users can delete their own draft releases" ON music_releases
    FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

-- Create storage bucket for release artwork if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'release-artwork',
    'release-artwork',
    true,
    10485760, -- 10MB in bytes (high-res artwork)
    ARRAY['image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage bucket
CREATE POLICY "Users can upload release artwork" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'release-artwork' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view release artwork" ON storage.objects
    FOR SELECT USING (bucket_id = 'release-artwork');

CREATE POLICY "Users can update their release artwork" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'release-artwork' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their release artwork" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'release-artwork' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Grant necessary permissions
GRANT ALL ON music_releases TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_music_releases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER trigger_music_releases_updated_at
    BEFORE UPDATE ON music_releases
    FOR EACH ROW
    EXECUTE FUNCTION update_music_releases_updated_at();
