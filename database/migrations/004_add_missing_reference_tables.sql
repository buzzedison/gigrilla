-- ============================================================================
-- MISSING REFERENCE TABLES FOR USER PROFILES
-- ============================================================================
-- This migration adds the missing artist_types, venue_types, and pro_types tables
-- that are referenced in user_profiles but were never created.

-- Artist types table
CREATE TABLE IF NOT EXISTS artist_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert artist type data
INSERT INTO artist_types (id, name, description) VALUES 
(1, 'Live Gig & Original Recording Artist', 'Artists who perform live and create original recordings'),
(2, 'Original Recording Artist', 'Artists focused on creating original recorded music'),
(3, 'Live Gig Artist (Cover/Tribute/Classical)', 'Artists who perform live covers, tributes, or classical music'),
(4, 'Vocalist for Hire', 'Professional vocalists available for hire'),
(5, 'Instrumentalist for Hire', 'Professional instrumentalists available for hire'),
(6, 'Songwriter for Hire', 'Professional songwriters available for hire'),
(7, 'Lyricist for Hire', 'Professional lyricists available for hire'),
(8, 'Composer for Hire', 'Professional composers available for hire')
ON CONFLICT (id) DO NOTHING;

-- Venue types table
CREATE TABLE IF NOT EXISTS venue_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert venue type data
INSERT INTO venue_types (id, name, description) VALUES 
(1, 'Public Live Gig Music Venue', 'Public venues that host live music events'),
(2, 'Private Live Gig Music Venue', 'Private venues available for live music events'),
(3, 'Dedicated Live Gig Music Venue', 'Venues specifically designed for live music'),
(4, 'Live Gig Music Festival', 'Festival organizers and festival venues'),
(5, 'Live Gig Music Promoter', 'Music promotion companies and individuals'),
(6, 'Fan\'s Live Music Gig (Public)', 'Public events organized by fans'),
(7, 'Fan\'s Live Music Gig (Private)', 'Private events organized by fans')
ON CONFLICT (id) DO NOTHING;

-- Professional types table
CREATE TABLE IF NOT EXISTS pro_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert professional type data
INSERT INTO pro_types (id, name, description) VALUES 
(1, 'Music Industry Professional', 'General music industry professional'),
(2, 'A&R Representative', 'Artist and Repertoire professionals'),
(3, 'Music Producer', 'Professional music producers'),
(4, 'Audio Engineer', 'Sound and audio engineering professionals'),
(5, 'Music Manager', 'Artist and band managers'),
(6, 'Music Promoter', 'Event and music promotion professionals'),
(7, 'Music Journalist', 'Music industry journalists and writers'),
(8, 'Music Educator', 'Music teachers and educational professionals'),
(9, 'Music Therapist', 'Music therapy professionals'),
(10, 'Music Lawyer', 'Legal professionals specializing in music')
ON CONFLICT (id) DO NOTHING;

-- Add foreign key constraints to user_profiles table
-- (These will be ignored if the constraints already exist)
DO $$ 
BEGIN
    -- Add artist_type_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_artist_type'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT fk_user_profiles_artist_type 
        FOREIGN KEY (artist_type_id) REFERENCES artist_types(id);
    END IF;

    -- Add venue_type_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_venue_type'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT fk_user_profiles_venue_type 
        FOREIGN KEY (venue_type_id) REFERENCES venue_types(id);
    END IF;

    -- Add pro_type_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_pro_type'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT fk_user_profiles_pro_type 
        FOREIGN KEY (pro_type_id) REFERENCES pro_types(id);
    END IF;

    -- Add service_type_id foreign key constraint (if service_types table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_types') 
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_service_type'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT fk_user_profiles_service_type 
        FOREIGN KEY (service_type_id) REFERENCES service_types(id);
    END IF;
END $$;

-- Add missing columns to user_profiles if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artist_types_active ON artist_types(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_venue_types_active ON venue_types(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pro_types_active ON pro_types(is_active) WHERE is_active = true;

-- Update database version
INSERT INTO db_version (version, description) 
VALUES (4, 'Added missing reference tables for artist_types, venue_types, and pro_types')
ON CONFLICT (version) DO NOTHING;
