-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - DDEX ENHANCEMENTS
-- ============================================================================
-- DDEX (Digital Data Exchange) compliance enhancements
-- Based on DDEX standards for music industry metadata exchange

-- ============================================================================
-- DDEX IDENTIFIERS & PARTY MANAGEMENT
-- ============================================================================

-- Enhanced contributor/party management with DDEX identifiers
CREATE TABLE ddex_parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- DDEX Party Identifiers
    party_id TEXT UNIQUE, -- Internal party ID
    isni TEXT, -- International Standard Name Identifier
    ipi TEXT, -- Interested Parties Information Number
    dpids TEXT[], -- Digital Party Identifiers (array for multiple)

    -- Party details
    party_name TEXT NOT NULL,
    party_type TEXT NOT NULL, -- Individual, Group, Organization
    nationality TEXT,
    residence_country TEXT,

    -- Contact information
    contact_details JSONB,

    -- DDEX metadata
    ddex_metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, party_name)
);

-- DDEX contributor roles and relationships
CREATE TABLE ddex_contributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    party_id UUID REFERENCES ddex_parties(id) ON DELETE CASCADE,

    -- DDEX role information
    contributor_role TEXT NOT NULL, -- MainArtist, Composer, Producer, etc.
    sequence_number INTEGER,
    instrument TEXT,
    instrument_type TEXT,

    -- Rights information
    rights_percentage DECIMAL(5,2), -- e.g., 25.00 for 25%
    rights_type TEXT DEFAULT 'performance', -- performance, mechanical, sync

    -- DDEX specific metadata
    ddex_metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(track_id, party_id, contributor_role)
);

-- ============================================================================
-- DDEX RELEASE MANAGEMENT
-- ============================================================================

-- Enhanced release information with DDEX compliance
CREATE TABLE ddex_releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,

    -- DDEX Release Identifiers
    upc TEXT UNIQUE,
    catalog_number TEXT,
    grid TEXT, -- Global Release Identifier
    icpn TEXT, -- International Copyright Protection Number

    -- Release details
    release_type TEXT NOT NULL, -- Album, Single, EP, etc.
    release_profile TEXT DEFAULT 'FrontLine', -- FrontLine, BackCatalogue, etc.

    -- Copyright information
    p_line TEXT, -- Phonographic copyright
    c_line TEXT, -- Copyright line
    original_release_date DATE,
    earliest_release_date DATE,

    -- Marketing and distribution
    marketing_label TEXT,
    distributor_id UUID REFERENCES users(id),

    -- DDEX metadata
    ddex_metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Release territories and rights
CREATE TABLE ddex_release_territories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES ddex_releases(id) ON DELETE CASCADE,

    -- Territory information
    territory_code TEXT NOT NULL, -- ISO 3166-1 alpha-2
    excluded_territory BOOLEAN DEFAULT FALSE,

    -- Rights by type
    performance_rights BOOLEAN DEFAULT TRUE,
    mechanical_rights BOOLEAN DEFAULT TRUE,
    synchronization_rights BOOLEAN DEFAULT TRUE,

    -- Date ranges
    start_date DATE,
    end_date DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DDEX TECHNICAL METADATA
-- ============================================================================

-- Enhanced technical specifications for tracks
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS ddex_technical_metadata JSONB DEFAULT '{
    "sampleRate": null,
    "bitDepth": null,
    "numberOfChannels": null,
    "duration": null,
    "lufs": null,
    "peakLevel": null,
    "codecType": null,
    "bitrate": null
}'::jsonb;

-- File delivery information
CREATE TABLE ddex_file_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,

    -- File information
    file_path TEXT,
    file_name TEXT,
    file_size_bytes BIGINT,
    md5_checksum TEXT,
    sha256_checksum TEXT,

    -- Delivery metadata
    delivery_type TEXT DEFAULT 'full', -- full, preview, stem
    use_type TEXT DEFAULT 'download', -- download, stream, preview

    -- Technical details
    codec_type TEXT,
    sample_rate INTEGER,
    bit_depth INTEGER,
    channels INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DDEX WORK MANAGEMENT (COMPOSITIONS)
-- ============================================================================

-- Musical works/compositions
CREATE TABLE ddex_works (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Work identifiers
    iswc TEXT UNIQUE, -- International Standard Musical Work Code
    work_title TEXT NOT NULL,
    alternative_titles TEXT[],

    -- Work details
    genre TEXT,
    duration_seconds INTEGER,

    -- Copyright
    copyright_year INTEGER,
    copyright_holder TEXT,

    -- DDEX metadata
    ddex_metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work contributors (composers, lyricists, etc.)
CREATE TABLE ddex_work_contributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_id UUID REFERENCES ddex_works(id) ON DELETE CASCADE,
    party_id UUID REFERENCES ddex_parties(id) ON DELETE CASCADE,

    contributor_role TEXT NOT NULL, -- Composer, Lyricist, Arranger, etc.
    rights_percentage DECIMAL(5,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(work_id, party_id, contributor_role)
);

-- Link tracks to works
CREATE TABLE track_works (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    work_id UUID REFERENCES ddex_works(id) ON DELETE CASCADE,
    usage_type TEXT DEFAULT 'recording', -- recording, cover, remix, etc.

    UNIQUE(track_id, work_id)
);

-- ============================================================================
-- DDEX USAGE REPORTING
-- ============================================================================

-- Usage events for DSR (Digital Sales Reporting)
CREATE TABLE ddex_usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Event details
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- download, stream, preview
    commercial_model TEXT, -- free, ad_supported, subscription, purchase

    -- Location and timing
    territory_code TEXT,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_info JSONB,

    -- Service information
    service_id TEXT, -- DDEX service identifier
    dsp_name TEXT, -- Digital Service Provider name

    -- Financial information
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'GBP',

    -- DDEX compliance
    isrc TEXT,
    release_id TEXT,
    ddex_metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DDEX VALIDATION & COMPLIANCE
-- ============================================================================

-- DDEX role code reference table
CREATE TABLE ddex_role_codes (
    id SERIAL PRIMARY KEY,
    role_code TEXT UNIQUE NOT NULL,
    role_description TEXT,
    role_category TEXT, -- artist, producer, technical, etc.
    ddex_standard TEXT DEFAULT 'ERN', -- ERN, DSR, etc.
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert standard DDEX role codes
INSERT INTO ddex_role_codes (role_code, role_description, role_category, ddex_standard) VALUES
('MainArtist', 'Main performing artist', 'artist', 'ERN'),
('FeaturedArtist', 'Featured performing artist', 'artist', 'ERN'),
('Composer', 'Composer of the musical work', 'creator', 'ERN'),
('Lyricist', 'Writer of the lyrics', 'creator', 'ERN'),
('Producer', 'Music producer', 'producer', 'ERN'),
('ExecutiveProducer', 'Executive producer', 'producer', 'ERN'),
('Mixer', 'Audio mixer', 'technical', 'ERN'),
('MasteringEngineer', 'Mastering engineer', 'technical', 'ERN'),
('RecordingEngineer', 'Recording engineer', 'technical', 'ERN'),
('Arranger', 'Music arranger', 'creator', 'ERN'),
('Instrumentalist', 'Instrumental performer', 'artist', 'ERN'),
('Vocalist', 'Vocal performer', 'artist', 'ERN'),
('Conductor', 'Orchestra conductor', 'artist', 'ERN'),
('Orchestrator', 'Music orchestrator', 'creator', 'ERN'),
('Programmer', 'Music programmer', 'technical', 'ERN'),
('Remixer', 'Music remixer', 'producer', 'ERN');

-- ============================================================================
-- ENHANCED EXISTING TABLES FOR DDEX
-- ============================================================================

-- Add DDEX metadata to existing tables
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS ddex_metadata JSONB DEFAULT '{}';
ALTER TABLE albums ADD COLUMN IF NOT EXISTS ddex_metadata JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS ddex_party_id TEXT UNIQUE;

-- ============================================================================
-- INDEXES FOR DDEX PERFORMANCE
-- ============================================================================

CREATE INDEX idx_ddex_contributors_track_id ON ddex_contributors(track_id);
CREATE INDEX idx_ddex_contributors_party_id ON ddex_contributors(party_id);
CREATE INDEX idx_ddex_releases_album_id ON ddex_releases(album_id);
CREATE INDEX idx_ddex_releases_upc ON ddex_releases(upc);
CREATE INDEX idx_ddex_usage_events_track_id ON ddex_usage_events(track_id);
CREATE INDEX idx_ddex_usage_events_event_type ON ddex_usage_events(event_type);
CREATE INDEX idx_ddex_usage_events_timestamp ON ddex_usage_events(event_timestamp);
CREATE INDEX idx_ddex_work_contributors_work_id ON ddex_work_contributors(work_id);
CREATE INDEX idx_track_works_track_id ON track_works(track_id);
CREATE INDEX idx_track_works_work_id ON track_works(work_id);

