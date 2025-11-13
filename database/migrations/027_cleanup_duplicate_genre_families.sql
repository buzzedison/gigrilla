-- 027_cleanup_duplicate_genre_families.sql
-- Remove duplicate and old genre families that conflict with the canonical taxonomy

BEGIN;

-- Delete old/duplicate genre families that have been replaced
-- Keep only the canonical ones from migration 026

DELETE FROM public.genre_families WHERE id IN (
  'dance-edm',              -- replaced by dance-edm-music
  'classical',              -- replaced by classical-music
  'folk-world',             -- replaced by folk-roots-music
  'industrial-gothic',      -- replaced by industrial-gothic-music
  'jamaican',               -- replaced by reggae-dancehall-music
  'pop-rock',               -- split into pop-music and rock-music
  'rap-hip-hop',            -- replaced by hip-hop-rap-music
  'rhythm-music',           -- replaced by rhythm-blues-rnb-r-b-music
  'blues-jazz'              -- replaced by the-blues-jazz-music
);

-- Also clean up any orphaned genre_types that reference deleted families
DELETE FROM public.genre_types WHERE family_id IN (
  'dance-edm',
  'classical',
  'folk-world',
  'industrial-gothic',
  'jamaican',
  'pop-rock',
  'rap-hip-hop',
  'rhythm-music',
  'blues-jazz'
);

COMMIT;
