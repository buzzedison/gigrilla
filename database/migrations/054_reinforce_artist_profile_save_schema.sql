-- ============================================================================
-- 054_reinforce_artist_profile_save_schema.sql
-- Ensures Artist Basics / Artist Profile saves have the columns and conflict
-- target required by app/api/artist-profile/route.ts.
--
-- This is intentionally idempotent because several of these columns were added
-- across older migrations, but deployed databases can drift behind the code.
-- ============================================================================

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS stage_name TEXT,
ADD COLUMN IF NOT EXISTS artist_entity_isni TEXT,
ADD COLUMN IF NOT EXISTS established_date DATE,
ADD COLUMN IF NOT EXISTS performing_members INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS base_location TEXT,
ADD COLUMN IF NOT EXISTS base_location_lat DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS base_location_lon DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS hometown_city TEXT,
ADD COLUMN IF NOT EXISTS hometown_state TEXT,
ADD COLUMN IF NOT EXISTS hometown_country TEXT,
ADD COLUMN IF NOT EXISTS gigs_performed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS threads_url TEXT,
ADD COLUMN IF NOT EXISTS x_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS snapchat_url TEXT,
ADD COLUMN IF NOT EXISTS mastodon_url TEXT,
ADD COLUMN IF NOT EXISTS bluesky_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_artist_entity_isni
ON public.user_profiles(artist_entity_isni)
WHERE artist_entity_isni IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_location_coords
ON public.user_profiles(base_location_lat, base_location_lon)
WHERE base_location_lat IS NOT NULL AND base_location_lon IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_attribute user_id_col
      ON user_id_col.attrelid = c.conrelid
      AND user_id_col.attname = 'user_id'
    JOIN pg_attribute profile_type_col
      ON profile_type_col.attrelid = c.conrelid
      AND profile_type_col.attname = 'profile_type'
    WHERE c.conrelid = 'public.user_profiles'::regclass
      AND c.contype = 'u'
      AND array_length(c.conkey, 1) = 2
      AND c.conkey @> ARRAY[user_id_col.attnum, profile_type_col.attnum]::smallint[]
  ) THEN
    ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_profile_type_unique
    UNIQUE (user_id, profile_type);
  END IF;
END $$;

COMMENT ON COLUMN public.user_profiles.artist_entity_isni IS
'ISNI for the artist entity/stage identity, not the individual performer ISNI unless the Artist has one member.';

COMMENT ON COLUMN public.user_profiles.performing_members IS
'Number of performing members in the artist group/band.';

COMMENT ON COLUMN public.user_profiles.base_location_lat IS
'Latitude coordinate for gig distance calculations.';

COMMENT ON COLUMN public.user_profiles.base_location_lon IS
'Longitude coordinate for gig distance calculations.';

INSERT INTO db_version (version, description)
VALUES (54, 'Reinforced artist profile save schema and user/profile unique constraint')
ON CONFLICT (version) DO NOTHING;
