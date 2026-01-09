-- Migration: Create ISRC (International Standard Recording Code) tables
-- ISRC uniquely identifies sound recordings and music videos

-- Create music tracks table (extends music_releases)
CREATE TABLE IF NOT EXISTS music_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    release_id UUID NOT NULL REFERENCES music_releases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Track information
    track_number INTEGER NOT NULL,
    track_title TEXT NOT NULL,
    track_title_confirmed BOOLEAN DEFAULT FALSE,
    track_version TEXT, -- e.g., 'remix', 'acoustic', 'live'

    -- ISRC code
    isrc TEXT,
    isrc_confirmed BOOLEAN DEFAULT FALSE,
    isrc_source TEXT CHECK (isrc_source IN ('api', 'manual', 'generated')) DEFAULT 'manual',

    -- Track metadata
    duration_seconds INTEGER, -- Track length in seconds
    explicit_content BOOLEAN DEFAULT FALSE,

    -- Featured artists
    featured_artists JSONB DEFAULT '[]', -- Array of {name, role}

    -- Writers/Composers
    writers JSONB DEFAULT '[]', -- Array of {name, role, share_percentage}

    -- Audio file
    audio_file_url TEXT,
    audio_file_size INTEGER,
    audio_format TEXT, -- e.g., 'mp3', 'wav', 'flac'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique track numbers per release
    UNIQUE(release_id, track_number)
);

-- Create indexes for tracks
CREATE INDEX IF NOT EXISTS idx_music_tracks_release ON music_tracks(release_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_user ON music_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_isrc ON music_tracks(isrc);
CREATE INDEX IF NOT EXISTS idx_music_tracks_track_number ON music_tracks(release_id, track_number);

-- Create ISRC cache table
CREATE TABLE IF NOT EXISTS isrc_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    isrc TEXT NOT NULL UNIQUE,

    -- Cached recording data
    track_title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    duration_seconds INTEGER,
    recording_date TEXT,

    -- ISRC breakdown
    country_code TEXT, -- First 2 chars
    registrant_code TEXT, -- Next 3 chars
    year_code TEXT, -- Next 2 chars
    designation_code TEXT, -- Last 5 chars

    -- Cache metadata
    source TEXT DEFAULT 'musicbrainz',
    is_valid BOOLEAN DEFAULT TRUE,
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    cache_created_at TIMESTAMPTZ DEFAULT NOW(),
    cache_updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Performance optimization
    lookup_count INTEGER DEFAULT 0,
    last_lookup_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for ISRC cache
CREATE INDEX IF NOT EXISTS idx_isrc_cache_isrc ON isrc_cache(isrc);
CREATE INDEX IF NOT EXISTS idx_isrc_cache_lookup_count ON isrc_cache(lookup_count DESC);
CREATE INDEX IF NOT EXISTS idx_isrc_cache_country_code ON isrc_cache(country_code);

-- Create ISRC lookup analytics table
CREATE TABLE IF NOT EXISTS isrc_lookup_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    isrc TEXT NOT NULL,

    -- Lookup result
    lookup_successful BOOLEAN NOT NULL,
    cache_hit BOOLEAN DEFAULT FALSE,
    error_message TEXT,

    -- User context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    track_id UUID REFERENCES music_tracks(id) ON DELETE SET NULL,
    ip_address TEXT,

    -- Timing
    response_time_ms INTEGER,
    looked_up_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for ISRC analytics
CREATE INDEX IF NOT EXISTS idx_isrc_analytics_isrc ON isrc_lookup_analytics(isrc);
CREATE INDEX IF NOT EXISTS idx_isrc_analytics_user ON isrc_lookup_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_isrc_analytics_date ON isrc_lookup_analytics(looked_up_at DESC);

-- Create trigger for track updates
CREATE OR REPLACE FUNCTION update_music_track_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_music_track_timestamp
    BEFORE UPDATE ON music_tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_music_track_timestamp();

-- Create trigger for ISRC cache updates
CREATE OR REPLACE FUNCTION update_isrc_cache_stats()
RETURNS TRIGGER AS $$
BEGIN
    NEW.cache_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_isrc_cache_stats
    BEFORE UPDATE ON isrc_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_isrc_cache_stats();

-- Function to generate track listing for a release
CREATE OR REPLACE FUNCTION get_release_tracks(release_uuid UUID)
RETURNS TABLE (
    track_id UUID,
    track_number INTEGER,
    track_title TEXT,
    isrc TEXT,
    duration_seconds INTEGER,
    featured_artists JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.track_number,
        t.track_title,
        t.isrc,
        t.duration_seconds,
        t.featured_artists
    FROM music_tracks t
    WHERE t.release_id = release_uuid
    ORDER BY t.track_number ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to validate ISRC format
CREATE OR REPLACE FUNCTION validate_isrc_format(isrc_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- ISRC format: CC-XXX-YY-NNNNN (12 characters without hyphens)
    -- CC: 2 letter country code
    -- XXX: 3 alphanumeric registrant code
    -- YY: 2 digit year
    -- NNNNN: 5 digit designation code

    -- Remove hyphens and check length
    IF LENGTH(REPLACE(isrc_code, '-', '')) != 12 THEN
        RETURN FALSE;
    END IF;

    -- Check format with regex (with or without hyphens)
    RETURN isrc_code ~* '^[A-Z]{2}-?[A-Z0-9]{3}-?[0-9]{2}-?[0-9]{5}$';
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE music_tracks IS 'Individual tracks within music releases, each with its own ISRC code';
COMMENT ON TABLE isrc_cache IS 'Caches ISRC lookup results to improve performance';
COMMENT ON TABLE isrc_lookup_analytics IS 'Tracks ISRC lookup attempts for analytics';
COMMENT ON COLUMN music_tracks.isrc IS 'International Standard Recording Code - uniquely identifies this recording';
COMMENT ON COLUMN music_tracks.writers IS 'Array of songwriter/composer information with role and share percentage';
COMMENT ON FUNCTION validate_isrc_format IS 'Validates ISRC code format according to ISO 3901 standard';
