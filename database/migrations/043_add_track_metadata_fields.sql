-- Migration: Add additional metadata fields to music_tracks table
-- Adds ISWC, ISNI, IPI/CAE, lyrics, and child-safe content fields

-- Add ISWC (International Standard Musical Work Code) fields
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS iswc TEXT,
ADD COLUMN IF NOT EXISTS iswc_confirmed BOOLEAN DEFAULT FALSE;

-- Add ISNI (International Standard Name Identifier) fields
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS isni TEXT,
ADD COLUMN IF NOT EXISTS isni_confirmed BOOLEAN DEFAULT FALSE;

-- Add IPI/CAE (Interested Parties Number) fields
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS ipi_cae TEXT,
ADD COLUMN IF NOT EXISTS ipi_cae_confirmed BOOLEAN DEFAULT FALSE;

-- Add child-safe content field
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS child_safe_content TEXT CHECK (child_safe_content IN ('yes-original', 'yes-radio-edit', 'no-adult-themes')) DEFAULT NULL;

-- Add lyrics fields
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS lyrics TEXT,
ADD COLUMN IF NOT EXISTS lyrics_file_url TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_music_tracks_iswc ON music_tracks(iswc) WHERE iswc IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_music_tracks_isni ON music_tracks(isni) WHERE isni IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_music_tracks_child_safe ON music_tracks(child_safe_content) WHERE child_safe_content IS NOT NULL;

-- Add comments
COMMENT ON COLUMN music_tracks.iswc IS 'International Standard Musical Work Code - identifies the underlying composition';
COMMENT ON COLUMN music_tracks.isni IS 'International Standard Name Identifier - unique ID for creators';
COMMENT ON COLUMN music_tracks.ipi_cae IS 'Interested Parties Number - for songwriters, lyricists, composers, and publishers';
COMMENT ON COLUMN music_tracks.child_safe_content IS 'Whether track is suitable for children: yes-original, yes-radio-edit, or no-adult-themes';
COMMENT ON COLUMN music_tracks.lyrics IS 'Full lyrics text for the track';
COMMENT ON COLUMN music_tracks.lyrics_file_url IS 'URL to uploaded lyrics file if provided';
