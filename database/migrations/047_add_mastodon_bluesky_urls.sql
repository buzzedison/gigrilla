-- ============================================================================
-- 047_add_mastodon_bluesky_urls.sql
-- Adds Mastodon and Bluesky social media URL columns to user_profiles
-- ============================================================================

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS mastodon_url TEXT,
ADD COLUMN IF NOT EXISTS bluesky_url  TEXT;

COMMENT ON COLUMN public.user_profiles.mastodon_url IS 'Artist Mastodon profile URL (e.g. https://mastodon.social/@artist)';
COMMENT ON COLUMN public.user_profiles.bluesky_url  IS 'Artist Bluesky profile URL (e.g. https://bsky.app/profile/artist.bsky.social)';

-- Record migration version
INSERT INTO db_version (version, description)
VALUES (47, 'Added mastodon_url and bluesky_url columns to user_profiles')
ON CONFLICT (version) DO NOTHING;
