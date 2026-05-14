-- Artist block-out dates for Gig Planner availability.

CREATE TABLE IF NOT EXISTS public.artist_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Unavailable',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT artist_unavailability_time_check CHECK (ends_at > starts_at),
  CONSTRAINT artist_unavailability_reason_length CHECK (char_length(reason) <= 80),
  CONSTRAINT artist_unavailability_note_length CHECK (note IS NULL OR char_length(note) <= 500)
);

CREATE INDEX IF NOT EXISTS idx_artist_unavailability_artist_starts
  ON public.artist_unavailability (artist_id, starts_at);

ALTER TABLE public.artist_unavailability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS artist_unavailability_select_policy ON public.artist_unavailability;
CREATE POLICY artist_unavailability_select_policy ON public.artist_unavailability
  FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

DROP POLICY IF EXISTS artist_unavailability_insert_policy ON public.artist_unavailability;
CREATE POLICY artist_unavailability_insert_policy ON public.artist_unavailability
  FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = auth.uid());

DROP POLICY IF EXISTS artist_unavailability_update_policy ON public.artist_unavailability;
CREATE POLICY artist_unavailability_update_policy ON public.artist_unavailability
  FOR UPDATE
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

DROP POLICY IF EXISTS artist_unavailability_delete_policy ON public.artist_unavailability;
CREATE POLICY artist_unavailability_delete_policy ON public.artist_unavailability
  FOR DELETE
  TO authenticated
  USING (artist_id = auth.uid());
