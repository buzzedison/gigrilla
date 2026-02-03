-- Migration: Hybrid Approval System for Content Moderation
-- Adds moderation flags, platform settings, community moderator role, and automated verification

-- ============================================================================
-- 1. Add moderation flags to music_releases table
-- ============================================================================

ALTER TABLE music_releases
  ADD COLUMN IF NOT EXISTS do_not_recommend BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flagged_for_review BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_offensive BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
  ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS flagged_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS removed_by UUID REFERENCES auth.users(id);

-- Add indexes for moderation queries
CREATE INDEX IF NOT EXISTS idx_music_releases_flagged ON music_releases(flagged_for_review) WHERE flagged_for_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_music_releases_offensive ON music_releases(is_offensive) WHERE is_offensive = TRUE;
CREATE INDEX IF NOT EXISTS idx_music_releases_do_not_recommend ON music_releases(do_not_recommend) WHERE do_not_recommend = TRUE;

COMMENT ON COLUMN music_releases.do_not_recommend IS 'Mark low-quality content to exclude from recommendations';
COMMENT ON COLUMN music_releases.flagged_for_review IS 'Content flagged by moderators for team review';
COMMENT ON COLUMN music_releases.is_offensive IS 'Content marked as offensive or inappropriate';
COMMENT ON COLUMN music_releases.moderation_notes IS 'Internal notes from moderators about this release';

-- ============================================================================
-- 2. Extend user roles to include community_moderator
-- ============================================================================

-- Update the role constraint to include community_moderator
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('user', 'community_moderator', 'admin', 'super_admin'));

COMMENT ON COLUMN user_profiles.role IS 'User role: user (default), community_moderator, admin, or super_admin';

-- ============================================================================
-- 3. Create platform_settings table for approval mode toggle
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default approval mode setting
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES
  ('approval_mode', '{"mode": "auto", "beta_phase": true}'::JSONB, 'Content approval mode: auto (beta) or manual (post-launch)'),
  ('automated_verification_enabled', 'false'::JSONB, 'Enable automated verification against ISRC/ISWC/GTIN databases'),
  ('moderation_settings', '{"auto_flag_explicit": false, "require_isrc": false, "require_iswc": false}'::JSONB, 'Moderation and verification thresholds')
ON CONFLICT (setting_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);

COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings including approval mode toggle';

-- ============================================================================
-- 4. Create user_bans table for managing banned users
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_bans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banned_by UUID NOT NULL REFERENCES auth.users(id),

    -- Ban details
    ban_reason TEXT NOT NULL,
    ban_type TEXT CHECK (ban_type IN ('temporary', 'permanent')) DEFAULT 'permanent',

    -- Timestamps
    banned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    unbanned_at TIMESTAMPTZ,
    unbanned_by UUID REFERENCES auth.users(id),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Notes
    admin_notes TEXT,
    unban_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_active ON user_bans(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_bans_expires ON user_bans(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE user_bans IS 'Tracks banned users and ban history';
COMMENT ON COLUMN user_bans.ban_type IS 'Type of ban: temporary (with expires_at) or permanent';

-- Function to check if user is currently banned
CREATE OR REPLACE FUNCTION is_user_banned(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_bans
        WHERE user_id = p_user_id
        AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Create verification_results table for automated checks
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    release_id UUID NOT NULL REFERENCES music_releases(id) ON DELETE CASCADE,
    track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,

    -- Verification type
    verification_type TEXT CHECK (verification_type IN ('isrc', 'iswc', 'gtin', 'pro', 'copyright')) NOT NULL,

    -- Results
    verified BOOLEAN NOT NULL,
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    verification_data JSONB, -- Store API response data

    -- Details
    error_message TEXT,
    warning_message TEXT,

    -- Metadata
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    api_provider TEXT, -- Which API was used (e.g., 'musicbrainz', 'isrc_registry')
    api_response_time_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_verification_results_release ON verification_results(release_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_track ON verification_results(track_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_type ON verification_results(verification_type);
CREATE INDEX IF NOT EXISTS idx_verification_results_verified ON verification_results(verified);

COMMENT ON TABLE verification_results IS 'Stores results of automated verification checks against music industry databases';
COMMENT ON COLUMN verification_results.confidence_score IS 'Confidence level of verification (0.00 = no match, 1.00 = perfect match)';

-- ============================================================================
-- 6. Create moderation_actions table for audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    release_id UUID REFERENCES music_releases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    moderator_id UUID NOT NULL REFERENCES auth.users(id),

    -- Action details
    action_type TEXT CHECK (action_type IN (
        'flag', 'unflag', 'mark_offensive', 'unmark_offensive',
        'do_not_recommend', 'allow_recommend', 'remove', 'restore',
        'ban_user', 'unban_user'
    )) NOT NULL,

    -- Context
    reason TEXT,
    moderator_notes TEXT,

    -- Metadata
    action_taken_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_release ON moderation_actions(release_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_user ON moderation_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator ON moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_type ON moderation_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_date ON moderation_actions(action_taken_at);

COMMENT ON TABLE moderation_actions IS 'Audit trail for all moderation actions taken by admins and community moderators';

-- ============================================================================
-- 7. Update admin dashboard stats function
-- ============================================================================

-- Drop existing function first to avoid signature conflicts
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    pending_count INTEGER,
    approved_this_week INTEGER,
    rejected_this_week INTEGER,
    published_count INTEGER,
    flagged_count INTEGER,
    offensive_count INTEGER,
    banned_users_count INTEGER,
    total_releases INTEGER,
    total_tracks INTEGER
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
        (SELECT COUNT(*)::INTEGER FROM music_releases WHERE status = 'published'),
        (SELECT COUNT(*)::INTEGER FROM music_releases WHERE flagged_for_review = TRUE),
        (SELECT COUNT(*)::INTEGER FROM music_releases WHERE is_offensive = TRUE),
        (SELECT COUNT(*)::INTEGER FROM user_bans WHERE is_active = TRUE),
        (SELECT COUNT(*)::INTEGER FROM music_releases),
        (SELECT COUNT(*)::INTEGER FROM music_tracks);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. Add RLS policies for community moderators
-- ============================================================================

-- Community moderators can view all releases (not just their own)
CREATE POLICY "Community moderators can view all releases" ON music_releases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('community_moderator', 'admin', 'super_admin')
        )
    );

-- Community moderators can update moderation flags (but not delete)
CREATE POLICY "Moderators can update moderation flags" ON music_releases
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('community_moderator', 'admin', 'super_admin')
        )
    );

-- Community moderators can insert moderation actions
CREATE POLICY "Moderators can log actions" ON moderation_actions
    FOR INSERT WITH CHECK (
        auth.uid() = moderator_id AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('community_moderator', 'admin', 'super_admin')
        )
    );

-- Community moderators can view moderation actions
CREATE POLICY "Moderators can view moderation actions" ON moderation_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('community_moderator', 'admin', 'super_admin')
        )
    );

-- Only admins can manage platform settings
CREATE POLICY "Admins can manage settings" ON platform_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Only admins can view and manage user bans
CREATE POLICY "Admins can manage bans" ON user_bans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Grant necessary permissions
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;

GRANT ALL ON platform_settings TO authenticated;
GRANT ALL ON user_bans TO authenticated;
GRANT ALL ON moderation_actions TO authenticated;
GRANT ALL ON verification_results TO authenticated;

-- ============================================================================
-- 9. Helper functions for moderation
-- ============================================================================

-- Function to get approval mode
CREATE OR REPLACE FUNCTION get_approval_mode()
RETURNS TEXT AS $$
DECLARE
    mode_value TEXT;
BEGIN
    SELECT setting_value->>'mode' INTO mode_value
    FROM platform_settings
    WHERE setting_key = 'approval_mode';

    RETURN COALESCE(mode_value, 'auto'); -- Default to auto for beta
END;
$$ LANGUAGE plpgsql;

-- Function to count user's releases by status
CREATE OR REPLACE FUNCTION get_user_release_stats(p_user_id UUID)
RETURNS TABLE (
    total_releases INTEGER,
    published_releases INTEGER,
    flagged_releases INTEGER,
    removed_releases INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_releases,
        COUNT(*) FILTER (WHERE status = 'published')::INTEGER AS published_releases,
        COUNT(*) FILTER (WHERE flagged_for_review = TRUE)::INTEGER AS flagged_releases,
        COUNT(*) FILTER (WHERE removed_at IS NOT NULL)::INTEGER AS removed_releases
    FROM music_releases
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_approval_mode IS 'Returns current approval mode: auto (beta) or manual (post-launch)';
COMMENT ON FUNCTION is_user_banned IS 'Checks if a user is currently under an active ban';
COMMENT ON FUNCTION get_user_release_stats IS 'Returns release statistics for a specific user';
