-- Migration: Create GTIN cache and analytics tables
-- This provides database caching for GTIN lookups and tracks usage analytics

-- Create GTIN cache table for storing lookup results
CREATE TABLE IF NOT EXISTS gtin_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gtin TEXT NOT NULL UNIQUE,
    gtin_type TEXT CHECK (gtin_type IN ('upc', 'ean')) NOT NULL,

    -- Cached release data from MusicBrainz
    release_title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    release_date TEXT,
    country TEXT,
    release_type TEXT CHECK (release_type IN ('single', 'ep', 'album')),
    track_count INTEGER,
    musicbrainz_id TEXT,

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

-- Create index for fast GTIN lookups
CREATE INDEX IF NOT EXISTS idx_gtin_cache_gtin ON gtin_cache(gtin);
CREATE INDEX IF NOT EXISTS idx_gtin_cache_lookup_count ON gtin_cache(lookup_count DESC);
CREATE INDEX IF NOT EXISTS idx_gtin_cache_last_lookup ON gtin_cache(last_lookup_at DESC);

-- Create GTIN lookup analytics table
CREATE TABLE IF NOT EXISTS gtin_lookup_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gtin TEXT NOT NULL,
    gtin_type TEXT CHECK (gtin_type IN ('upc', 'ean')) NOT NULL,

    -- Lookup result
    lookup_successful BOOLEAN NOT NULL,
    cache_hit BOOLEAN DEFAULT FALSE,
    error_message TEXT,

    -- User context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,

    -- Timing
    response_time_ms INTEGER,
    looked_up_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_gtin_analytics_gtin ON gtin_lookup_analytics(gtin);
CREATE INDEX IF NOT EXISTS idx_gtin_analytics_user ON gtin_lookup_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_gtin_analytics_date ON gtin_lookup_analytics(looked_up_at DESC);
CREATE INDEX IF NOT EXISTS idx_gtin_analytics_success ON gtin_lookup_analytics(lookup_successful);

-- Create function to update cache timestamp and count
CREATE OR REPLACE FUNCTION update_gtin_cache_stats()
RETURNS TRIGGER AS $$
BEGIN
    NEW.cache_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cache updates
CREATE TRIGGER trigger_update_gtin_cache_stats
    BEFORE UPDATE ON gtin_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_gtin_cache_stats();

-- Create function to auto-expire old cache entries (optional maintenance)
-- This can be called periodically to remove stale cache entries
CREATE OR REPLACE FUNCTION cleanup_stale_gtin_cache(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM gtin_cache
    WHERE last_lookup_at < NOW() - (days_old || ' days')::INTERVAL
    AND lookup_count < 5; -- Only delete if rarely used

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE gtin_cache IS 'Caches GTIN lookup results from external APIs to improve performance and reduce API calls';
COMMENT ON TABLE gtin_lookup_analytics IS 'Tracks all GTIN lookup attempts for analytics and monitoring';
COMMENT ON COLUMN gtin_cache.lookup_count IS 'Number of times this GTIN has been looked up';
COMMENT ON COLUMN gtin_cache.last_verified_at IS 'Last time the cached data was verified against the source';
COMMENT ON FUNCTION cleanup_stale_gtin_cache IS 'Removes cache entries older than specified days with low usage count';
