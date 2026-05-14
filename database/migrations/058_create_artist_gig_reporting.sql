-- Artist post-gig confirmations, member reviews, and negative gig reports.

CREATE TABLE IF NOT EXISTS public.artist_gig_reporting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.gig_bookings(id) ON DELETE CASCADE,
  gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL,
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('confirm', 'report')),
  target_member_type TEXT NOT NULL DEFAULT 'venue'
    CHECK (target_member_type IN ('venue', 'artist', 'fan', 'service', 'professional', 'other')),
  target_member_id UUID,
  rating INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  review_text TEXT,
  issue_types TEXT[] NOT NULL DEFAULT '{}',
  environment_details TEXT,
  attitude_details TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT artist_gig_reporting_review_length CHECK (review_text IS NULL OR char_length(review_text) <= 2000),
  CONSTRAINT artist_gig_reporting_environment_length CHECK (environment_details IS NULL OR char_length(environment_details) <= 2000),
  CONSTRAINT artist_gig_reporting_attitude_length CHECK (attitude_details IS NULL OR char_length(attitude_details) <= 2000),
  CONSTRAINT artist_gig_reporting_unique_action UNIQUE (booking_id, artist_id, action_type)
);

CREATE INDEX IF NOT EXISTS idx_artist_gig_reporting_artist_action
  ON public.artist_gig_reporting (artist_id, action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_artist_gig_reporting_booking
  ON public.artist_gig_reporting (booking_id);

CREATE INDEX IF NOT EXISTS idx_artist_gig_reporting_status
  ON public.artist_gig_reporting (status);

ALTER TABLE public.artist_gig_reporting ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS artist_gig_reporting_select_policy ON public.artist_gig_reporting;
CREATE POLICY artist_gig_reporting_select_policy ON public.artist_gig_reporting
  FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

DROP POLICY IF EXISTS artist_gig_reporting_insert_policy ON public.artist_gig_reporting;
CREATE POLICY artist_gig_reporting_insert_policy ON public.artist_gig_reporting
  FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = auth.uid());

DROP POLICY IF EXISTS artist_gig_reporting_update_policy ON public.artist_gig_reporting;
CREATE POLICY artist_gig_reporting_update_policy ON public.artist_gig_reporting
  FOR UPDATE
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());
