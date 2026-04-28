-- Add separate Artist Entity ISNI for band/group/collective artist identities.
-- This is distinct from performer_isni, which is the natural-person/member ISNI.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS artist_entity_isni TEXT;

COMMENT ON COLUMN public.user_profiles.artist_entity_isni IS
'ISNI for the artist entity/stage identity, not the individual performer ISNI unless the Artist has one member.';

CREATE INDEX IF NOT EXISTS idx_user_profiles_artist_entity_isni
ON public.user_profiles(artist_entity_isni)
WHERE artist_entity_isni IS NOT NULL;
