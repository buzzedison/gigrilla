-- Migration: Create artist_audition_adverts table
-- Description: Stores audition and collaboration adverts for artist profiles
-- Author: System
-- Date: 2026-01-27

-- Create artist_audition_adverts table
CREATE TABLE IF NOT EXISTS artist_audition_adverts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

    -- Advert type and specifics
    advert_type VARCHAR(100) NOT NULL,
    instrument VARCHAR(100),
    vocalist_type VARCHAR(50),
    producer_type VARCHAR(100),
    lyricist_type VARCHAR(100),
    composer_type VARCHAR(100),
    collaboration_direction VARCHAR(50), -- 'Wanted' or 'Offered'

    -- Genre selection
    genre_selection VARCHAR(20) NOT NULL CHECK (genre_selection IN ('any', 'specific')),
    genres TEXT[], -- Array of genre strings, max 3

    -- Advert content
    headline VARCHAR(50) NOT NULL,
    description VARCHAR(160) NOT NULL,

    -- Fee and royalty options
    includes_fixed_fee BOOLEAN DEFAULT FALSE,
    includes_royalty_share BOOLEAN DEFAULT FALSE,

    -- Deadline settings
    deadline_type VARCHAR(20) NOT NULL CHECK (deadline_type IN ('asap', 'specific')),
    deadline_date DATE,

    -- Expiry settings
    expiry_date DATE NOT NULL,
    expiry_time TIME NOT NULL,

    -- Publishing tracking
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    edited_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on artist_profile_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_artist_audition_adverts_artist_profile_id
ON artist_audition_adverts(artist_profile_id);

-- Create index on expiry_date for efficient cleanup of expired adverts
CREATE INDEX IF NOT EXISTS idx_artist_audition_adverts_expiry_date
ON artist_audition_adverts(expiry_date);

-- Create index on advert_type for filtering
CREATE INDEX IF NOT EXISTS idx_artist_audition_adverts_advert_type
ON artist_audition_adverts(advert_type);

-- Add RLS (Row Level Security) policies
ALTER TABLE artist_audition_adverts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own adverts
CREATE POLICY artist_audition_adverts_select_policy ON artist_audition_adverts
    FOR SELECT
    USING (
        artist_profile_id IN (
            SELECT id FROM user_profiles
            WHERE user_id = auth.uid()
            AND profile_type = 'artist'
        )
    );

-- Policy: Users can insert their own adverts
CREATE POLICY artist_audition_adverts_insert_policy ON artist_audition_adverts
    FOR INSERT
    WITH CHECK (
        artist_profile_id IN (
            SELECT id FROM user_profiles
            WHERE user_id = auth.uid()
            AND profile_type = 'artist'
        )
    );

-- Policy: Users can update their own adverts
CREATE POLICY artist_audition_adverts_update_policy ON artist_audition_adverts
    FOR UPDATE
    USING (
        artist_profile_id IN (
            SELECT id FROM user_profiles
            WHERE user_id = auth.uid()
            AND profile_type = 'artist'
        )
    );

-- Policy: Users can delete their own adverts
CREATE POLICY artist_audition_adverts_delete_policy ON artist_audition_adverts
    FOR DELETE
    USING (
        artist_profile_id IN (
            SELECT id FROM user_profiles
            WHERE user_id = auth.uid()
            AND profile_type = 'artist'
        )
    );

-- Add comment to table
COMMENT ON TABLE artist_audition_adverts IS 'Stores audition and collaboration adverts for artist profiles';

-- Note: Consider adding a scheduled job to automatically archive or delete expired adverts
