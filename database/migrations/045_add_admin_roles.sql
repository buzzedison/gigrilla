-- Migration: Add admin roles and release review functionality
-- Adds role management for super admins and tracks release review history

-- Add role to users (via user_profiles table)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- Add index for quick admin lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Create release review history table
CREATE TABLE IF NOT EXISTS music_release_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    release_id UUID NOT NULL REFERENCES music_releases(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Review details
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'request_changes', 'publish')),

    -- Feedback
    admin_notes TEXT,
    rejection_reason TEXT,
    changes_requested TEXT,

    -- Metadata
    reviewed_at TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_music_release_reviews_release ON music_release_reviews(release_id);
CREATE INDEX IF NOT EXISTS idx_music_release_reviews_reviewer ON music_release_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_music_release_reviews_action ON music_release_reviews(action);
CREATE INDEX IF NOT EXISTS idx_music_release_reviews_date ON music_release_reviews(reviewed_at);

-- Add columns to music_releases for tracking review
ALTER TABLE music_releases
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Function to get pending review count
CREATE OR REPLACE FUNCTION get_pending_review_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM music_releases WHERE status = 'pending_review');
END;
$$ LANGUAGE plpgsql;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    pending_count INTEGER,
    approved_this_week INTEGER,
    rejected_this_week INTEGER,
    published_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM music_releases WHERE status = 'pending_review'),
        (SELECT COUNT(*)::INTEGER FROM music_release_reviews
         WHERE action = 'approve'
         AND reviewed_at >= NOW() - INTERVAL '7 days'),
        (SELECT COUNT(*)::INTEGER FROM music_release_reviews
         WHERE action = 'reject'
         AND reviewed_at >= NOW() - INTERVAL '7 days'),
        (SELECT COUNT(*)::INTEGER FROM music_releases WHERE status = 'published');
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE music_release_reviews IS 'Audit trail for all release review actions by admins';
COMMENT ON COLUMN user_profiles.role IS 'User role: user (default), admin, or super_admin';
COMMENT ON FUNCTION get_pending_review_count IS 'Returns count of releases pending admin review';
COMMENT ON FUNCTION get_admin_dashboard_stats IS 'Returns key metrics for admin dashboard';
