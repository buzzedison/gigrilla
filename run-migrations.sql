-- ============================================================================
-- RUN ALL PENDING MIGRATIONS
-- ============================================================================
-- This file runs all the database migrations to fix the upgrade issues

-- Run migration 004: Add missing reference tables
\i database/migrations/004_add_missing_reference_tables.sql

-- Run migration 005: Add user genre preferences
\i database/migrations/005_add_user_genre_preferences.sql

-- Verify tables were created
SELECT 'Migration Status:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_types') 
        THEN '✅ artist_types table exists'
        ELSE '❌ artist_types table missing'
    END as artist_types_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venue_types') 
        THEN '✅ venue_types table exists'
        ELSE '❌ venue_types table missing'
    END as venue_types_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pro_types') 
        THEN '✅ pro_types table exists'
        ELSE '❌ pro_types table missing'
    END as pro_types_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_genre_preferences') 
        THEN '✅ user_genre_preferences table exists'
        ELSE '❌ user_genre_preferences table missing'
    END as user_genre_preferences_status;

-- Show current database version
SELECT version, description, applied_at FROM db_version ORDER BY version DESC LIMIT 5;

