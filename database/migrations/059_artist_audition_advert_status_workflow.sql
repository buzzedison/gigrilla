-- ============================================================================
-- Migration: 059_artist_audition_advert_status_workflow.sql
-- Description: Add real draft/published/unpublished/historic states for artist adverts
-- Date: 2026-05-19
-- ============================================================================

ALTER TABLE public.artist_audition_adverts
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published',
ADD COLUMN IF NOT EXISTS unpublished_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.artist_audition_adverts
DROP CONSTRAINT IF EXISTS artist_audition_adverts_status_check;

ALTER TABLE public.artist_audition_adverts
ADD CONSTRAINT artist_audition_adverts_status_check
CHECK (status IN ('draft', 'published', 'unpublished', 'historic'));

ALTER TABLE public.artist_audition_adverts
ALTER COLUMN advert_type DROP NOT NULL,
ALTER COLUMN genre_selection DROP NOT NULL,
ALTER COLUMN headline DROP NOT NULL,
ALTER COLUMN description DROP NOT NULL,
ALTER COLUMN deadline_type DROP NOT NULL,
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_time DROP NOT NULL,
ALTER COLUMN published_at DROP NOT NULL;

UPDATE public.artist_audition_adverts
SET status = CASE
  WHEN archived_at IS NOT NULL THEN 'historic'
  WHEN expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE THEN 'historic'
  ELSE COALESCE(status, 'published')
END;

CREATE INDEX IF NOT EXISTS idx_artist_audition_adverts_status
ON public.artist_audition_adverts(status);

CREATE INDEX IF NOT EXISTS idx_artist_audition_adverts_artist_status
ON public.artist_audition_adverts(artist_profile_id, status);

COMMENT ON COLUMN public.artist_audition_adverts.status
IS 'Advert lifecycle: draft, published, unpublished, historic.';

COMMENT ON COLUMN public.artist_audition_adverts.unpublished_at
IS 'When the artist removed this advert from public display without archiving it.';

COMMENT ON COLUMN public.artist_audition_adverts.archived_at
IS 'When the artist moved this advert into historic adverts.';

INSERT INTO db_version (version, description)
VALUES (59, 'Add lifecycle status workflow for artist audition and collaboration adverts')
ON CONFLICT (version) DO NOTHING;
