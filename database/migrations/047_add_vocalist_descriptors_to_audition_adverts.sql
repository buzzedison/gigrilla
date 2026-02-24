-- Migration: Add vocalist descriptor fields to artist_audition_adverts
-- Description: Supports extra vocalist dropdowns for sound-based and genre-based descriptors
-- Date: 2026-02-24

ALTER TABLE public.artist_audition_adverts
ADD COLUMN IF NOT EXISTS vocalist_sound_descriptor VARCHAR(120);

ALTER TABLE public.artist_audition_adverts
ADD COLUMN IF NOT EXISTS vocalist_genre_descriptor VARCHAR(120);

COMMENT ON COLUMN public.artist_audition_adverts.vocalist_sound_descriptor
IS 'Optional sound-based vocalist descriptor selected by artist (e.g. Ballad Voice).';

COMMENT ON COLUMN public.artist_audition_adverts.vocalist_genre_descriptor
IS 'Optional genre-based vocalist descriptor selected by artist (e.g. Jazz Voice).';
