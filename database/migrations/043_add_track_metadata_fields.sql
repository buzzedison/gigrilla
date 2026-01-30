-- Migration: Add comprehensive track metadata fields to music_tracks table
-- Adds all fields needed for comprehensive track upload and management

-- Add ISWC (International Standard Musical Work Code) fields
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS iswc TEXT,
ADD COLUMN IF NOT EXISTS iswc_confirmed BOOLEAN DEFAULT FALSE;

-- Add Musical Work Title
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS musical_work_title TEXT,
ADD COLUMN IF NOT EXISTS musical_work_title_confirmed BOOLEAN DEFAULT FALSE;

-- Add Master Recording Date
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS master_recording_date TEXT; -- Month & Year format

-- Add Talent fields (stored as JSONB arrays)
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS primary_artists JSONB DEFAULT '[]', -- Array of {id, name, isni, confirmed}
ADD COLUMN IF NOT EXISTS session_artists JSONB DEFAULT '[]', -- Array of {id, name, isni, roles[], confirmed}
ADD COLUMN IF NOT EXISTS creators JSONB DEFAULT '[]', -- Array of {id, name, isni, ipiCae, roles[], confirmed}
ADD COLUMN IF NOT EXISTS producers JSONB DEFAULT '[]'; -- Array of {id, name, isni, ipiCae, roles[], confirmed}

-- Add Rights fields
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS cover_rights TEXT CHECK (cover_rights IN ('no-original', 'yes-licensed', 'yes-compulsory')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cover_license_url TEXT,
ADD COLUMN IF NOT EXISTS remix_rights TEXT CHECK (remix_rights IN ('no-original', 'yes-authorized', 'yes-unauthorized')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS remix_authorization_url TEXT,
ADD COLUMN IF NOT EXISTS samples_rights TEXT CHECK (samples_rights IN ('no-original', 'yes-cleared', 'yes-uncleared')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS samples_clearance_url TEXT;

-- Add Tags fields
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS primary_genre JSONB DEFAULT NULL, -- {familyId, mainGenres: [{id, subGenres: []}]}
ADD COLUMN IF NOT EXISTS secondary_genre JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS primary_mood TEXT,
ADD COLUMN IF NOT EXISTS secondary_moods JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS primary_language TEXT,
ADD COLUMN IF NOT EXISTS secondary_language TEXT;

-- Update explicit_content to support new values
ALTER TABLE music_tracks 
ALTER COLUMN explicit_content TYPE TEXT,
ALTER COLUMN explicit_content DROP DEFAULT;

-- Add child-safe content field
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS child_safe_content TEXT CHECK (child_safe_content IN ('yes-original', 'yes-radio-edit', 'no-adult-themes')) DEFAULT NULL;

-- Add lyrics fields
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS lyrics TEXT,
ADD COLUMN IF NOT EXISTS lyrics_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lyrics_file_url TEXT;

-- Add additional upload fields
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS dolby_atmos_file_url TEXT,
ADD COLUMN IF NOT EXISTS preview_start_time INTEGER DEFAULT 0, -- Seconds for 30sFP
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_url_confirmed BOOLEAN DEFAULT FALSE;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_music_tracks_iswc ON music_tracks(iswc) WHERE iswc IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_music_tracks_child_safe ON music_tracks(child_safe_content) WHERE child_safe_content IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_music_tracks_primary_mood ON music_tracks(primary_mood) WHERE primary_mood IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_music_tracks_primary_language ON music_tracks(primary_language) WHERE primary_language IS NOT NULL;

-- Add comments
COMMENT ON COLUMN music_tracks.iswc IS 'International Standard Musical Work Code - identifies the underlying composition';
COMMENT ON COLUMN music_tracks.musical_work_title IS 'Title of the underlying musical work/composition';
COMMENT ON COLUMN music_tracks.master_recording_date IS 'Date of master recording (month & year format)';
COMMENT ON COLUMN music_tracks.primary_artists IS 'Primary performing artists on the track';
COMMENT ON COLUMN music_tracks.session_artists IS 'Session musicians/vocalists who contributed';
COMMENT ON COLUMN music_tracks.creators IS 'Songwriting team (composers, lyricists, songwriters)';
COMMENT ON COLUMN music_tracks.producers IS 'Production team (producers, engineers, arrangers)';
COMMENT ON COLUMN music_tracks.cover_rights IS 'Whether this is a cover version and licensing status';
COMMENT ON COLUMN music_tracks.remix_rights IS 'Whether this is a remix and authorization status';
COMMENT ON COLUMN music_tracks.samples_rights IS 'Whether samples are used and clearance status';
COMMENT ON COLUMN music_tracks.primary_genre IS 'Primary genre selection with family, main genres, and sub-genres';
COMMENT ON COLUMN music_tracks.secondary_genre IS 'Secondary genre selection';
COMMENT ON COLUMN music_tracks.primary_mood IS 'Primary mood tag for discovery';
COMMENT ON COLUMN music_tracks.secondary_moods IS 'Array of secondary mood tags';
COMMENT ON COLUMN music_tracks.primary_language IS 'Primary language of lyrics';
COMMENT ON COLUMN music_tracks.secondary_language IS 'Secondary language of lyrics';
COMMENT ON COLUMN music_tracks.explicit_content IS 'Explicit content classification: no-clean-original, no-clean-radio-edit, yes-explicit';
COMMENT ON COLUMN music_tracks.child_safe_content IS 'Whether track is suitable for children: yes-original, yes-radio-edit, or no-adult-themes';
COMMENT ON COLUMN music_tracks.lyrics IS 'Full lyrics text for the track';
COMMENT ON COLUMN music_tracks.lyrics_confirmed IS 'Whether lyrics have been confirmed';
COMMENT ON COLUMN music_tracks.dolby_atmos_file_url IS 'URL to Dolby Atmos/spatial audio file';
COMMENT ON COLUMN music_tracks.preview_start_time IS 'Start time in seconds for 30-second freeplay preview';
COMMENT ON COLUMN music_tracks.video_url IS 'YouTube URL for music video';
COMMENT ON COLUMN music_tracks.video_url_confirmed IS 'Whether video URL has been confirmed';
