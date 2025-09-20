-- ============================================================================
-- RUN ALL PENDING MIGRATIONS
-- ============================================================================
-- This file runs all the database migrations to fix the upgrade issues

-- Run migration 004: Add missing reference tables
\i database/migrations/004_add_missing_reference_tables.sql

-- Run migration 005: Add user genre preferences
\i database/migrations/005_add_user_genre_preferences.sql

-- Run migration 006: Add fan profile columns
\i database/migrations/006_add_fan_profile_columns.sql

-- Run migration 007: Add comprehensive artist fields
\i database/migrations/007_add_comprehensive_artist_fields.sql

-- Run migration 008: Add essential fan columns
\i database/migrations/008_add_essential_fan_columns.sql

-- Run migration 009: Fix user profiles RLS
\i database/migrations/009_fix_user_profiles_rls.sql

-- Run migration 010: Add fan_profiles RLS policies
\i database/migrations/010_add_fan_profiles_rls_policies.sql
\i database/migrations/011_fix_user_genre_storage.sql
\i database/migrations/012_add_artist_basic_fields.sql

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

