-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - CORE TABLES
-- ============================================================================
-- Users, profiles, authentication, and basic platform structure

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferred_currency TEXT DEFAULT 'GBP',
    user_role user_role NOT NULL DEFAULT 'fan',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles for different user types
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_type user_role NOT NULL,

    -- Artist profile fields
    artist_type_id INTEGER,
    artist_sub_types INTEGER[],

    -- Venue profile fields
    venue_type_id INTEGER,
    venue_sub_types INTEGER[],

    -- Music Service profile fields
    service_type_id INTEGER,
    service_sub_types INTEGER[],

    -- Industry Pro profile fields
    pro_type_id INTEGER,
    pro_sub_types INTEGER[],

    -- Common profile fields
    company_name TEXT,
    job_title TEXT,
    years_experience INTEGER,
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    monthly_retainer DECIMAL(10,2),
    availability_status TEXT DEFAULT 'available',
    preferred_genres INTEGER[],
    location_details JSONB,
    contact_details JSONB,
    social_links JSONB,
    verification_documents TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, profile_type)
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    privacy_settings JSONB DEFAULT '{}',
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'GBP',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id)
);

-- User sessions and activity tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(user_role);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_type ON user_profiles(profile_type);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
