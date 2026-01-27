-- ============================================================================
-- 036_add_artist_professional_ids.sql
-- Adds professional identification fields and session tracking for artists
-- ============================================================================

-- Add professional identification numbers
-- ISNI = International Standard Name Identifier (for all performers/creators)
-- IPI/CAE = Interested Parties Number (for songwriters/lyricists/composers/publishers)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS performer_isni TEXT,
ADD COLUMN IF NOT EXISTS creator_ipi_cae TEXT;

-- Add session gigs tracking for for-hire artists (Types 4 & 5)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS recording_session_gigs INTEGER DEFAULT 0;

-- Add songwriting collaborations tracking for creator types (Types 6, 7, 8)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS songwriting_collaborations INTEGER DEFAULT 0;

-- Add website URL for all artist types
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add member ISNI and IPI/CAE to artist_members table
ALTER TABLE public.artist_members
ADD COLUMN IF NOT EXISTS performer_isni TEXT,
ADD COLUMN IF NOT EXISTS creator_ipi_cae TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'pending', -- 'pending', 'invited', 'joined'
ADD COLUMN IF NOT EXISTS hometown_city TEXT,
ADD COLUMN IF NOT EXISTS hometown_state TEXT,
ADD COLUMN IF NOT EXISTS hometown_country TEXT,
ADD COLUMN IF NOT EXISTS is_public_real_name BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_public_dob BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_public_hometown BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.performer_isni IS 'International Standard Name Identifier for performers/creators';
COMMENT ON COLUMN public.user_profiles.creator_ipi_cae IS 'Interested Parties Number for songwriters/lyricists/composers (CISAC)';
COMMENT ON COLUMN public.user_profiles.recording_session_gigs IS 'Number of recording session gigs performed before joining (Types 4 & 5)';
COMMENT ON COLUMN public.user_profiles.songwriting_collaborations IS 'Number of songwriting collaborations before joining (Types 6, 7, 8)';
COMMENT ON COLUMN public.user_profiles.website IS 'Artist official website URL';

COMMENT ON COLUMN public.artist_members.performer_isni IS 'Member ISNI for performance identification';
COMMENT ON COLUMN public.artist_members.creator_ipi_cae IS 'Member IPI/CAE for creator royalty tracking';
COMMENT ON COLUMN public.artist_members.email IS 'Member email for invitations and profile matching';
COMMENT ON COLUMN public.artist_members.phone IS 'Member phone for invitations and profile matching';
COMMENT ON COLUMN public.artist_members.is_admin IS 'Whether member has admin rights for this artist profile';
COMMENT ON COLUMN public.artist_members.invitation_status IS 'Status of member invitation: pending, invited, or joined';
COMMENT ON COLUMN public.artist_members.is_public_real_name IS 'Whether member real name is public';
COMMENT ON COLUMN public.artist_members.is_public_dob IS 'Whether member date of birth is public';
COMMENT ON COLUMN public.artist_members.is_public_hometown IS 'Whether member hometown is public';

-- Create indexes for professional ID searches
CREATE INDEX IF NOT EXISTS idx_user_profiles_performer_isni
ON public.user_profiles(performer_isni)
WHERE performer_isni IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_creator_ipi_cae
ON public.user_profiles(creator_ipi_cae)
WHERE creator_ipi_cae IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_artist_members_invitation_status
ON public.artist_members(invitation_status);

-- Record migration version
INSERT INTO db_version (version, description)
VALUES (36, 'Added professional IDs (ISNI, IPI/CAE), session tracking, website URL, and extended artist member fields')
ON CONFLICT (version) DO NOTHING;
