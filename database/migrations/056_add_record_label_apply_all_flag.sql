-- ============================================================================
-- 056_add_record_label_apply_all_flag.sql
-- Adds release-level control for applying record label master-rights data to
-- every track in the release, matching the existing publisher apply-all flag.
-- ============================================================================

ALTER TABLE public.music_releases
ADD COLUMN IF NOT EXISTS apply_record_label_to_all_tracks BOOLEAN DEFAULT FALSE;

INSERT INTO db_version (version, description)
VALUES (56, 'Added apply-record-label-to-all-tracks flag for music releases')
ON CONFLICT (version) DO NOTHING;
