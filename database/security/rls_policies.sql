-- ============================================================================
-- GIGRILLA DATABASE - ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- This file implements comprehensive RLS policies for all tables
-- Run this AFTER the main schema to secure your database

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Core Tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Music Content Tables
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_entries ENABLE ROW LEVEL SECURITY;

-- Gig Management Tables
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_reviews ENABLE ROW LEVEL SECURITY;

-- Service Tables
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_packages ENABLE ROW LEVEL SECURITY;

-- Social Features Tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Commerce Tables
ALTER TABLE merchandise ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Analytics Tables (Admin only)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- DDEX Tables
ALTER TABLE ddex_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddex_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddex_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddex_release_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddex_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddex_work_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddex_file_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddex_usage_events ENABLE ROW LEVEL SECURITY;

-- Support Tables
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = $1 AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns content
CREATE OR REPLACE FUNCTION owns_content(user_id UUID, content_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_id = content_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CORE USER POLICIES
-- ============================================================================

-- Users: Can read own profile, admins can read all
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id OR is_admin(auth.uid()));

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User Preferences: Own data only
CREATE POLICY "user_preferences_all_own" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- User Profiles: Public read, own write
CREATE POLICY "user_profiles_select_all" ON user_profiles
  FOR SELECT USING (is_public = true OR auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_delete_own" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- User Sessions: Own sessions only
CREATE POLICY "user_sessions_all_own" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- MUSIC CONTENT POLICIES
-- ============================================================================

-- Tracks: Public read, artist write
CREATE POLICY "tracks_select_public" ON tracks
  FOR SELECT USING (is_public = true OR auth.uid() = artist_id OR is_admin(auth.uid()));

CREATE POLICY "tracks_insert_own" ON tracks
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "tracks_update_own" ON tracks
  FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "tracks_delete_own" ON tracks
  FOR DELETE USING (auth.uid() = artist_id OR is_admin(auth.uid()));

-- Albums: Public read, artist write
CREATE POLICY "albums_select_public" ON albums
  FOR SELECT USING (is_public = true OR auth.uid() = artist_id OR is_admin(auth.uid()));

CREATE POLICY "albums_insert_own" ON albums
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "albums_update_own" ON albums
  FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "albums_delete_own" ON albums
  FOR DELETE USING (auth.uid() = artist_id OR is_admin(auth.uid()));

-- Playlists: Public read if public, owner full access
CREATE POLICY "playlists_select_public" ON playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "playlists_insert_own" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "playlists_update_own" ON playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "playlists_delete_own" ON playlists
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Playlist Tracks: Based on playlist ownership
CREATE POLICY "playlist_tracks_select" ON playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    ) OR is_admin(auth.uid())
  );

CREATE POLICY "playlist_tracks_insert" ON playlist_tracks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "playlist_tracks_delete" ON playlist_tracks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND playlists.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- Likes: Own likes only
CREATE POLICY "track_likes_all_own" ON track_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "album_likes_all_own" ON album_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "playlist_likes_all_own" ON playlist_likes
  FOR ALL USING (auth.uid() = user_id);

-- Play History: Own history only
CREATE POLICY "play_history_all_own" ON play_history
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- GIG MANAGEMENT POLICIES
-- ============================================================================

-- Venues: Public read, owner write
CREATE POLICY "venues_select_public" ON venues
  FOR SELECT USING (is_active = true OR auth.uid() = owner_id OR is_admin(auth.uid()));

CREATE POLICY "venues_insert_own" ON venues
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "venues_update_own" ON venues
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "venues_delete_own" ON venues
  FOR DELETE USING (auth.uid() = owner_id OR is_admin(auth.uid()));

-- Venue Stages: Based on venue ownership
CREATE POLICY "venue_stages_select" ON venue_stages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = venue_stages.venue_id 
      AND (venues.is_active = true OR venues.owner_id = auth.uid())
    ) OR is_admin(auth.uid())
  );

CREATE POLICY "venue_stages_modify" ON venue_stages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = venue_stages.venue_id 
      AND venues.owner_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- Gigs: Public read if published, organizer write
CREATE POLICY "gigs_select_public" ON gigs
  FOR SELECT USING (
    status IN ('published', 'completed') OR 
    auth.uid() = organizer_id OR 
    is_admin(auth.uid())
  );

CREATE POLICY "gigs_insert_own" ON gigs
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "gigs_update_own" ON gigs
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "gigs_delete_own" ON gigs
  FOR DELETE USING (auth.uid() = organizer_id OR is_admin(auth.uid()));

-- Gig Bookings: Participants and admins
CREATE POLICY "gig_bookings_select" ON gig_bookings
  FOR SELECT USING (
    auth.uid() = artist_id OR 
    EXISTS (
      SELECT 1 FROM gigs 
      WHERE gigs.id = gig_bookings.gig_id 
      AND gigs.organizer_id = auth.uid()
    ) OR 
    is_admin(auth.uid())
  );

CREATE POLICY "gig_bookings_insert" ON gig_bookings
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "gig_bookings_update" ON gig_bookings
  FOR UPDATE USING (
    auth.uid() = artist_id OR 
    EXISTS (
      SELECT 1 FROM gigs 
      WHERE gigs.id = gig_bookings.gig_id 
      AND gigs.organizer_id = auth.uid()
    )
  );

-- Tickets: Public read, venue owner manage
CREATE POLICY "tickets_select_public" ON tickets
  FOR SELECT USING (
    is_active = true OR 
    EXISTS (
      SELECT 1 FROM gigs 
      WHERE gigs.id = tickets.gig_id 
      AND gigs.organizer_id = auth.uid()
    ) OR 
    is_admin(auth.uid())
  );

CREATE POLICY "tickets_modify" ON tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gigs 
      WHERE gigs.id = tickets.gig_id 
      AND gigs.organizer_id = auth.uid()
    ) OR 
    is_admin(auth.uid())
  );

-- Ticket Purchases: Own purchases
CREATE POLICY "ticket_purchases_select" ON ticket_purchases
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN gigs g ON g.id = t.gig_id
      WHERE t.id = ticket_purchases.ticket_id 
      AND g.organizer_id = auth.uid()
    ) OR 
    is_admin(auth.uid())
  );

CREATE POLICY "ticket_purchases_insert" ON ticket_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SOCIAL FEATURES POLICIES
-- ============================================================================

-- Posts: Public read if public, author write
CREATE POLICY "posts_select_public" ON posts
  FOR SELECT USING (
    is_public = true OR 
    auth.uid() = author_id OR 
    is_admin(auth.uid())
  );

CREATE POLICY "posts_insert_own" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "posts_delete_own" ON posts
  FOR DELETE USING (auth.uid() = author_id OR is_admin(auth.uid()));

-- Post Likes: Own likes
CREATE POLICY "post_likes_all_own" ON post_likes
  FOR ALL USING (auth.uid() = user_id);

-- Post Comments: Public read if post is public, author write
CREATE POLICY "post_comments_select" ON post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_comments.post_id 
      AND (posts.is_public = true OR posts.author_id = auth.uid())
    ) OR 
    auth.uid() = author_id OR 
    is_admin(auth.uid())
  );

CREATE POLICY "post_comments_insert" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "post_comments_update_own" ON post_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "post_comments_delete" ON post_comments
  FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_comments.post_id 
      AND posts.author_id = auth.uid()
    ) OR 
    is_admin(auth.uid())
  );

-- User Follows: Own follows
CREATE POLICY "user_follows_select" ON user_follows
  FOR SELECT USING (
    auth.uid() = follower_id OR 
    auth.uid() = following_id OR 
    is_admin(auth.uid())
  );

CREATE POLICY "user_follows_insert" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "user_follows_delete" ON user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Messages: Conversation participants only
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_participants.conversation_id = messages.conversation_id 
      AND conversation_participants.user_id = auth.uid()
    ) OR 
    is_admin(auth.uid())
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_participants.conversation_id = messages.conversation_id 
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Notifications: Own notifications
CREATE POLICY "notifications_all_own" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- COMMERCE POLICIES
-- ============================================================================

-- Merchandise: Public read, seller write
CREATE POLICY "merchandise_select_public" ON merchandise
  FOR SELECT USING (
    is_active = true OR 
    auth.uid() = seller_id OR 
    is_admin(auth.uid())
  );

CREATE POLICY "merchandise_insert_own" ON merchandise
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "merchandise_update_own" ON merchandise
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "merchandise_delete_own" ON merchandise
  FOR DELETE USING (auth.uid() = seller_id OR is_admin(auth.uid()));

-- Orders: Own orders and seller access
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN merchandise m ON m.id = oi.merchandise_id
      WHERE oi.order_id = orders.id 
      AND m.seller_id = auth.uid()
    ) OR 
    is_admin(auth.uid())
  );

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_own" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Shopping Carts: Own cart
CREATE POLICY "shopping_carts_all_own" ON shopping_carts
  FOR ALL USING (auth.uid() = user_id);

-- Payments: Own payments and seller access
CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = recipient_id OR 
    is_admin(auth.uid())
  );

-- ============================================================================
-- ADMIN AND SYSTEM POLICIES
-- ============================================================================

-- Admin Users: Admins only
CREATE POLICY "admin_users_admin_only" ON admin_users
  FOR ALL USING (is_admin(auth.uid()));

-- System Settings: Public read for public settings, admin write
CREATE POLICY "system_settings_select" ON system_settings
  FOR SELECT USING (is_public = true OR is_admin(auth.uid()));

CREATE POLICY "system_settings_modify_admin" ON system_settings
  FOR ALL USING (is_admin(auth.uid()));

-- Audit Log: Admin only
CREATE POLICY "audit_log_admin_only" ON audit_log
  FOR ALL USING (is_admin(auth.uid()));

-- Analytics: Admin only
CREATE POLICY "analytics_events_admin_only" ON analytics_events
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "analytics_summaries_admin_only" ON analytics_summaries
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "user_engagement_admin_only" ON user_engagement
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "performance_metrics_admin_only" ON performance_metrics
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "error_logs_admin_only" ON error_logs
  FOR ALL USING (is_admin(auth.uid()));

-- ============================================================================
-- DDEX POLICIES
-- ============================================================================

-- DDEX Parties: Own data and admin
CREATE POLICY "ddex_parties_select" ON ddex_parties
  FOR SELECT USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid())
  );

CREATE POLICY "ddex_parties_modify_own" ON ddex_parties
  FOR ALL USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid())
  );

-- DDEX Contributors: Own contributions
CREATE POLICY "ddex_contributors_select" ON ddex_contributors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ddex_parties 
      WHERE ddex_parties.id = ddex_contributors.party_id 
      AND ddex_parties.user_id = auth.uid()
    ) OR 
    is_admin(auth.uid())
  );

-- DDEX Releases: Based on ownership
CREATE POLICY "ddex_releases_select" ON ddex_releases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = ddex_releases.album_id 
      AND albums.artist_id = auth.uid()
    ) OR 
    is_admin(auth.uid())
  );

-- ============================================================================
-- SUPPORT POLICIES
-- ============================================================================

-- Support Tickets: Own tickets and admin
CREATE POLICY "support_tickets_select" ON support_tickets
  FOR SELECT USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid())
  );

CREATE POLICY "support_tickets_insert_own" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "support_tickets_update" ON support_tickets
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid())
  );

-- Ticket Messages: Ticket participants and admin
CREATE POLICY "ticket_messages_select" ON ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = ticket_messages.ticket_id 
      AND support_tickets.user_id = auth.uid()
    ) OR 
    is_admin(auth.uid())
  );

CREATE POLICY "ticket_messages_insert" ON ticket_messages
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND (
      EXISTS (
        SELECT 1 FROM support_tickets 
        WHERE support_tickets.id = ticket_messages.ticket_id 
        AND support_tickets.user_id = auth.uid()
      ) OR 
      is_admin(auth.uid())
    )
  );

-- ============================================================================
-- PUBLIC REFERENCE TABLES (No RLS needed)
-- ============================================================================

-- These tables contain reference data and should remain publicly readable
-- genres, moods, service_categories, service_types, service_sub_types, 
-- subscription_features, tax_rates, coupons, hashtags, ddex_role_codes

-- Disable RLS for reference tables
ALTER TABLE genres DISABLE ROW LEVEL SECURITY;
ALTER TABLE moods DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_sub_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_features DISABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags DISABLE ROW LEVEL SECURITY;
ALTER TABLE ddex_role_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE db_version DISABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends DISABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_flags DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_moderation DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on auth schema
GRANT USAGE ON SCHEMA auth TO authenticated, anon;
GRANT SELECT ON auth.users TO authenticated, anon;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION owns_content(UUID, UUID) TO authenticated, anon;
