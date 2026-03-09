-- ============================================================================
-- Migration: 048_auditions_multiselect_support.sql
-- Description: Convert audition fields to support multi-select for improved UX
-- Date: 2026-03-09
-- ============================================================================
--
-- CONTEXT:
-- Current auditions use single-select dropdowns which create "forever dropdown"
-- usability issues. This migration converts relevant fields to TEXT[] arrays
-- to support multi-select chip-based UI similar to artist type selection.
--
-- CHANGES:
-- 1. instruments: VARCHAR(100) → TEXT[] (support multiple instruments)
-- 2. vocalist_types: VARCHAR(50) → TEXT[] (support Lead + Backing + Harmony)
-- 3. vocalist_sound_descriptors: VARCHAR(120) → TEXT[] (multiple sound descriptors)
-- 4. vocalist_genre_descriptors: VARCHAR(120) → TEXT[] (multiple genre descriptors)
--
-- ============================================================================

-- Step 1: Backup existing data into temporary columns
ALTER TABLE public.artist_audition_adverts
ADD COLUMN IF NOT EXISTS instrument_backup VARCHAR(100),
ADD COLUMN IF NOT EXISTS vocalist_type_backup VARCHAR(50),
ADD COLUMN IF NOT EXISTS vocalist_sound_descriptor_backup VARCHAR(120),
ADD COLUMN IF NOT EXISTS vocalist_genre_descriptor_backup VARCHAR(120);

-- Copy existing data to backup columns
UPDATE public.artist_audition_adverts
SET
  instrument_backup = instrument,
  vocalist_type_backup = vocalist_type,
  vocalist_sound_descriptor_backup = vocalist_sound_descriptor,
  vocalist_genre_descriptor_backup = vocalist_genre_descriptor;

-- Step 2: Drop existing columns
ALTER TABLE public.artist_audition_adverts
DROP COLUMN IF EXISTS instrument,
DROP COLUMN IF EXISTS vocalist_type,
DROP COLUMN IF EXISTS vocalist_sound_descriptor,
DROP COLUMN IF EXISTS vocalist_genre_descriptor;

-- Step 3: Create new array columns
ALTER TABLE public.artist_audition_adverts
ADD COLUMN instruments TEXT[],
ADD COLUMN vocalist_types TEXT[],
ADD COLUMN vocalist_sound_descriptors TEXT[],
ADD COLUMN vocalist_genre_descriptors TEXT[];

-- Step 4: Migrate data from backup to new array columns
-- Convert single values to single-element arrays
UPDATE public.artist_audition_adverts
SET
  instruments = CASE
    WHEN instrument_backup IS NOT NULL AND instrument_backup != ''
    THEN ARRAY[instrument_backup]::TEXT[]
    ELSE NULL
  END,
  vocalist_types = CASE
    WHEN vocalist_type_backup IS NOT NULL AND vocalist_type_backup != ''
    THEN ARRAY[vocalist_type_backup]::TEXT[]
    ELSE NULL
  END,
  vocalist_sound_descriptors = CASE
    WHEN vocalist_sound_descriptor_backup IS NOT NULL AND vocalist_sound_descriptor_backup != '' AND vocalist_sound_descriptor_backup != 'Any'
    THEN ARRAY[vocalist_sound_descriptor_backup]::TEXT[]
    ELSE NULL
  END,
  vocalist_genre_descriptors = CASE
    WHEN vocalist_genre_descriptor_backup IS NOT NULL AND vocalist_genre_descriptor_backup != '' AND vocalist_genre_descriptor_backup != 'Any'
    THEN ARRAY[vocalist_genre_descriptor_backup]::TEXT[]
    ELSE NULL
  END;

-- Step 5: Drop backup columns (optional, keep for safety)
-- Uncomment these lines after verifying migration success:
-- ALTER TABLE public.artist_audition_adverts
-- DROP COLUMN IF EXISTS instrument_backup,
-- DROP COLUMN IF EXISTS vocalist_type_backup,
-- DROP COLUMN IF EXISTS vocalist_sound_descriptor_backup,
-- DROP COLUMN IF EXISTS vocalist_genre_descriptor_backup;

-- Step 6: Add comments
COMMENT ON COLUMN public.artist_audition_adverts.instruments
IS 'Multiple instruments (e.g., [\"Guitar\", \"Bass Guitar\", \"Piano\"])';

COMMENT ON COLUMN public.artist_audition_adverts.vocalist_types
IS 'Multiple vocalist roles (e.g., [\"Lead\", \"Backing\"])';

COMMENT ON COLUMN public.artist_audition_adverts.vocalist_sound_descriptors
IS 'Multiple sound-based vocal descriptors (e.g., [\"Ballad Voice\", \"Powerful Voice\"])';

COMMENT ON COLUMN public.artist_audition_adverts.vocalist_genre_descriptors
IS 'Multiple genre-based vocal descriptors (e.g., [\"Jazz Voice\", \"Soul Voice\"])';

-- Step 7: Create indexes for array searches
CREATE INDEX IF NOT EXISTS idx_artist_audition_adverts_instruments_gin
ON public.artist_audition_adverts USING GIN (instruments);

CREATE INDEX IF NOT EXISTS idx_artist_audition_adverts_vocalist_types_gin
ON public.artist_audition_adverts USING GIN (vocalist_types);

-- Record migration
INSERT INTO db_version (version, description)
VALUES (48, 'Convert audition adverts to support multi-select for instruments and vocals')
ON CONFLICT (version) DO NOTHING;
