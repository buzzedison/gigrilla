-- Migration 023: Add primary roles on artist profile and invitation multi-role support

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS artist_primary_roles TEXT[] DEFAULT '{}';

ALTER TABLE public.artist_member_invitations
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.artist_members_active (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_profile_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  invitation_id uuid REFERENCES public.artist_member_invitations(id) ON DELETE SET NULL,
  name text,
  email text NOT NULL,
  roles text[] DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.artist_members_active ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS artist_members_active_profile_idx ON public.artist_members_active(artist_profile_id);

CREATE POLICY "Artist can view active members" ON public.artist_members_active
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = artist_profile_id
      AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Artist can manage active members" ON public.artist_members_active
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = artist_profile_id
      AND up.user_id = auth.uid()
    )
  );

INSERT INTO db_version (version, description)
VALUES (23, 'Add artist primary roles, invitation multi-role support, active members table')
ON CONFLICT (version) DO NOTHING;

