-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - INITIALIZATION
-- ============================================================================
-- This file sets up the basic database structure and extensions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('fan', 'artist', 'venue', 'service', 'pro');
CREATE TYPE gig_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro');
CREATE TYPE content_type AS ENUM ('track', 'album', 'playlist', 'post');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create database version table for migrations
CREATE TABLE IF NOT EXISTS db_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

INSERT INTO db_version (version, description) VALUES (1, 'Initial schema setup');
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
-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - MUSIC CONTENT
-- ============================================================================
-- Tracks, albums, playlists, charts, and music metadata

-- Music tracks
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isrc TEXT UNIQUE,
    title TEXT NOT NULL,
    artist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    album_id UUID,
    duration_seconds INTEGER,
    genre_id INTEGER,
    mood_id INTEGER,
    country_code TEXT,
    language_code TEXT,
    release_date DATE,
    explicit_content BOOLEAN DEFAULT FALSE,
    lyrics TEXT,
    audio_file_url TEXT,
    audio_file_key TEXT,
    waveform_data JSONB,
    metadata JSONB DEFAULT '{}',
    play_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    share_count BIGINT DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Albums
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upc TEXT UNIQUE,
    title TEXT NOT NULL,
    artist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cover_art_url TEXT,
    cover_art_key TEXT,
    release_date DATE,
    genre_id INTEGER,
    album_type TEXT DEFAULT 'album', -- album, ep, single, compilation
    total_tracks INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update tracks table to reference albums properly
ALTER TABLE tracks ADD CONSTRAINT fk_tracks_album
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL;

-- Playlists
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cover_art_url TEXT,
    cover_art_key TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_collaborative BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist tracks (many-to-many relationship)
CREATE TABLE playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(playlist_id, track_id)
);

-- Genres and moods
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES genres(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE moods (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charts
CREATE TABLE charts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    chart_type TEXT NOT NULL, -- gigrilla, national, genre, mood
    country_code TEXT,
    genre_id INTEGER REFERENCES genres(id),
    mood_id INTEGER REFERENCES moods(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chart_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chart_id UUID REFERENCES charts(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    previous_position INTEGER,
    peak_position INTEGER,
    weeks_on_chart INTEGER DEFAULT 1,
    points INTEGER DEFAULT 0,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(chart_id, track_id, entry_date)
);

-- User interactions with music
CREATE TABLE track_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, track_id)
);

CREATE TABLE album_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, album_id)
);

CREATE TABLE playlist_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, playlist_id)
);

-- Play history and listening stats
CREATE TABLE play_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_played INTEGER, -- seconds played
    source TEXT, -- 'web', 'mobile', 'api'
    device_info JSONB
);

-- Indexes for performance
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_album_id ON tracks(album_id);
CREATE INDEX idx_tracks_isrc ON tracks(isrc);
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_albums_upc ON albums(upc);
CREATE INDEX idx_playlists_creator_id ON playlists(creator_id);
CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);
CREATE INDEX idx_chart_entries_chart_id ON chart_entries(chart_id);
CREATE INDEX idx_chart_entries_track_id ON chart_entries(track_id);
CREATE INDEX idx_play_history_user_id ON play_history(user_id);
CREATE INDEX idx_play_history_track_id ON play_history(track_id);
-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - GIG MANAGEMENT
-- ============================================================================
-- Gigs, venues, bookings, tickets, and event management

-- Venues
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    venue_type_id INTEGER,
    venue_sub_types INTEGER[],
    address JSONB NOT NULL,
    contact_details JSONB,
    website TEXT,
    social_links JSONB,
    images JSONB DEFAULT '[]',
    capacity JSONB, -- {seating: int, standing: int, total: int}
    facilities JSONB DEFAULT '{}',
    opening_hours JSONB,
    age_restrictions JSONB,
    accessibility_info JSONB,
    parking_info JSONB,
    accommodation_info JSONB,
    catering_info JSONB,
    technical_specs JSONB,
    pricing_info JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue stages
CREATE TABLE venue_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capacity INTEGER,
    stage_type TEXT, -- indoor, outdoor_covered, outdoor_uncovered
    technical_specs JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gigs/Events
CREATE TABLE gigs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES venue_stages(id) ON DELETE SET NULL,
    artist_ids UUID[] NOT NULL, -- Array of artist user IDs
    gig_status gig_status DEFAULT 'draft',
    event_type TEXT DEFAULT 'concert', -- concert, festival, private, open_mic
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    timezone TEXT DEFAULT 'UTC',
    ticket_price JSONB, -- {min: decimal, max: decimal, currency: text}
    age_restriction TEXT,
    genre_ids INTEGER[],
    mood_ids INTEGER[],
    images JSONB DEFAULT '[]',
    technical_requirements JSONB,
    accommodation_needed BOOLEAN DEFAULT FALSE,
    merchandise_available BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gig bookings (Artist-Venue agreements)
CREATE TABLE gig_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    booking_status booking_status DEFAULT 'pending',
    booking_fee DECIMAL(10,2),
    currency TEXT DEFAULT 'GBP',
    payment_terms TEXT,
    contract_details JSONB,
    technical_requirements JSONB,
    accommodation_details JSONB,
    merchandise_split JSONB,
    performance_times JSONB,
    special_requests TEXT,
    booked_by UUID REFERENCES users(id), -- Who made the booking
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT
);

-- Tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL, -- early_bird, standard, vip, etc.
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    quantity_available INTEGER,
    quantity_sold INTEGER DEFAULT 0,
    sale_start TIMESTAMP WITH TIME ZONE,
    sale_end TIMESTAMP WITH TIME ZONE,
    max_per_customer INTEGER DEFAULT 10,
    benefits JSONB, -- What the ticket includes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket purchases
CREATE TABLE ticket_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_status payment_status DEFAULT 'pending',
    payment_id TEXT,
    ticket_codes TEXT[], -- Array of unique ticket codes
    attendee_details JSONB,
    refund_requested BOOLEAN DEFAULT FALSE,
    refund_amount DECIMAL(10,2),
    refund_date TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT
);

-- Gig attendance tracking
CREATE TABLE gig_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ticket_purchase_id UUID REFERENCES ticket_purchases(id) ON DELETE SET NULL,
    checkin_time TIMESTAMP WITH TIME ZONE,
    checkout_time TIMESTAMP WITH TIME ZONE,
    attendance_status TEXT DEFAULT 'registered', -- registered, checked_in, attended, no_show
    feedback_rating INTEGER,
    feedback_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fan-organized private gigs
CREATE TABLE fan_gigs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    venue_type TEXT, -- own_venue, public_venue, private_venue
    custom_venue_details JSONB,
    artist_ids UUID[],
    event_date TIMESTAMP WITH TIME ZONE,
    guest_list JSONB DEFAULT '[]',
    budget_details JSONB,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gig reviews and ratings
CREATE TABLE gig_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    categories JSONB, -- {venue: 4, artist: 5, sound: 3, etc.}
    is_verified BOOLEAN DEFAULT FALSE, -- Verified purchase
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_venues_owner_id ON venues(owner_id);
CREATE INDEX idx_venues_slug ON venues(slug);
CREATE INDEX idx_gigs_organizer_id ON gigs(organizer_id);
CREATE INDEX idx_gigs_venue_id ON gigs(venue_id);
CREATE INDEX idx_gigs_start_datetime ON gigs(start_datetime);
CREATE INDEX idx_gigs_status ON gigs(gig_status);
CREATE INDEX idx_gig_bookings_gig_id ON gig_bookings(gig_id);
CREATE INDEX idx_gig_bookings_artist_id ON gig_bookings(artist_id);
CREATE INDEX idx_gig_bookings_venue_id ON gig_bookings(venue_id);
CREATE INDEX idx_tickets_gig_id ON tickets(gig_id);
CREATE INDEX idx_ticket_purchases_buyer_id ON ticket_purchases(buyer_id);
CREATE INDEX idx_ticket_purchases_gig_id ON ticket_purchases(gig_id);
CREATE INDEX idx_gig_attendance_gig_id ON gig_attendance(gig_id);
CREATE INDEX idx_gig_attendance_user_id ON gig_attendance(user_id);
CREATE INDEX idx_gig_reviews_gig_id ON gig_reviews(gig_id);
CREATE INDEX idx_gig_reviews_reviewer_id ON gig_reviews(reviewer_id);
-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - INDUSTRY SERVICES
-- ============================================================================
-- Service providers, bookings, and professional services

-- Service categories and types (based on your taxonomy)
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE service_types (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES service_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(category_id, name)
);

CREATE TABLE service_sub_types (
    id SERIAL PRIMARY KEY,
    service_type_id INTEGER REFERENCES service_types(id),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(service_type_id, name)
);

-- Service providers (links to user_profiles where profile_type = 'service')
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_type_id INTEGER REFERENCES service_types(id),
    service_sub_types INTEGER[],
    company_name TEXT,
    description TEXT,
    logo_url TEXT,
    logo_key TEXT,
    website TEXT,
    contact_details JSONB,
    service_area JSONB, -- geographic coverage
    certifications TEXT[],
    insurance_info JSONB,
    portfolio JSONB DEFAULT '[]',
    pricing_model JSONB, -- hourly, daily, project-based, retainer
    availability_schedule JSONB,
    response_time_hours INTEGER,
    completed_projects INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id)
);

-- Service bookings
CREATE TABLE service_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_type_id INTEGER REFERENCES service_types(id),
    title TEXT NOT NULL,
    description TEXT,
    booking_status booking_status DEFAULT 'pending',
    project_timeline JSONB,
    budget_range JSONB,
    requirements JSONB,
    deliverables JSONB,
    milestones JSONB,
    payment_terms JSONB,
    contract_details JSONB,
    attachments JSONB DEFAULT '[]',
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    feedback_rating INTEGER,
    feedback_comment TEXT
);

-- Service quotes (before booking)
CREATE TABLE service_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_type_id INTEGER REFERENCES service_types(id),
    title TEXT NOT NULL,
    description TEXT,
    estimated_duration TEXT,
    estimated_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'GBP',
    breakdown JSONB,
    validity_days INTEGER DEFAULT 30,
    quote_status TEXT DEFAULT 'sent', -- sent, accepted, rejected, expired
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT
);

-- Industry professionals (links to user_profiles where profile_type = 'pro')
CREATE TABLE industry_professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pro_type_id INTEGER,
    pro_sub_types INTEGER[],
    company_name TEXT,
    job_title TEXT,
    years_experience INTEGER,
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    monthly_retainer DECIMAL(10,2),
    availability_status TEXT DEFAULT 'available',
    preferred_genres INTEGER[],
    specializations TEXT[],
    certifications TEXT[],
    portfolio JSONB DEFAULT '[]',
    client_testimonials JSONB DEFAULT '[]',
    availability_schedule JSONB,
    response_time_hours INTEGER,
    completed_projects INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id)
);

-- Professional bookings
CREATE TABLE professional_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES industry_professionals(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pro_type_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    booking_status booking_status DEFAULT 'pending',
    project_timeline JSONB,
    compensation JSONB, -- hourly, daily, retainer details
    requirements JSONB,
    deliverables JSONB,
    contract_details JSONB,
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    feedback_rating INTEGER,
    feedback_comment TEXT
);

-- Professional quotes
CREATE TABLE professional_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES industry_professionals(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pro_type_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    estimated_duration TEXT,
    estimated_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'GBP',
    quote_status TEXT DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT
);

-- Service reviews and ratings
CREATE TABLE service_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES service_bookings(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    categories JSONB, -- {quality: 5, communication: 4, timeliness: 5}
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional reviews and ratings
CREATE TABLE professional_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES professional_bookings(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES industry_professionals(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    categories JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service packages (predefined offerings)
CREATE TABLE service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    service_type_id INTEGER REFERENCES service_types(id),
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'GBP',
    duration_days INTEGER,
    deliverables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional packages
CREATE TABLE professional_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES industry_professionals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    pro_type_id INTEGER,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'GBP',
    duration_days INTEGER,
    deliverables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX idx_service_providers_type ON service_providers(service_type_id);
CREATE INDEX idx_service_bookings_provider ON service_bookings(service_provider_id);
CREATE INDEX idx_service_bookings_client ON service_bookings(client_id);
CREATE INDEX idx_service_quotes_provider ON service_quotes(service_provider_id);
CREATE INDEX idx_service_quotes_client ON service_quotes(client_id);
CREATE INDEX idx_industry_professionals_user_id ON industry_professionals(user_id);
CREATE INDEX idx_professional_bookings_pro ON professional_bookings(professional_id);
CREATE INDEX idx_professional_bookings_client ON professional_bookings(client_id);
CREATE INDEX idx_service_reviews_provider ON service_reviews(service_provider_id);
CREATE INDEX idx_professional_reviews_pro ON professional_reviews(professional_id);
-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - SOCIAL FEATURES
-- ============================================================================
-- Posts, messages, feeds, following, and social interactions

-- Posts (social media content)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type content_type DEFAULT 'post',
    title TEXT,
    content TEXT,
    media_urls TEXT[],
    media_keys TEXT[],
    media_metadata JSONB DEFAULT '[]',
    tags TEXT[],
    mentions UUID[], -- Array of mentioned user IDs
    location JSONB,
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT TRUE,
    allow_sharing BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[],
    media_keys TEXT[],
    mentions UUID[],
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment likes
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(comment_id, user_id)
);

-- Following relationships
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    follow_type TEXT DEFAULT 'user', -- user, artist, venue, service, pro
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(follower_id, following_id)
);

-- User subscriptions (for premium content)
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_type TEXT DEFAULT 'free', -- free, premium
    subscription_tier subscription_tier DEFAULT 'free',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(subscriber_id, target_id)
);

-- Messages and conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_type TEXT DEFAULT 'direct', -- direct, group
    title TEXT,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- admin, member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type TEXT DEFAULT 'text', -- text, image, file, audio
    content TEXT,
    media_url TEXT,
    media_key TEXT,
    media_metadata JSONB,
    reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message read status
CREATE TABLE message_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(message_id, user_id)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User feeds (personalized content streams)
CREATE TABLE user_feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- post, track, gig, etc.
    content_id UUID NOT NULL,
    relevance_score DECIMAL(3,2),
    feed_type TEXT DEFAULT 'following', -- following, discover, trending
    is_viewed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hashtags and trending topics
CREATE TABLE hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag TEXT UNIQUE NOT NULL,
    usage_count BIGINT DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post hashtags (many-to-many)
CREATE TABLE post_hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(post_id, hashtag_id)
);

-- Saved posts/bookmarks
CREATE TABLE saved_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, post_id)
);

-- Reported content
CREATE TABLE content_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- post, comment, message, user
    content_id UUID NOT NULL,
    report_type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, reviewed, resolved
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_content_type ON posts(content_type);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_author_id ON post_comments(author_id);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_user_subscriptions_subscriber ON user_subscriptions(subscriber_id);
CREATE INDEX idx_user_subscriptions_target ON user_subscriptions(target_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_user_feeds_user_id ON user_feeds(user_id);
CREATE INDEX idx_hashtags_usage_count ON hashtags(usage_count DESC);
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - COMMERCE
-- ============================================================================
-- Merchandise, subscriptions, payments, and financial transactions

-- Merchandise/products
CREATE TABLE merchandise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    product_type TEXT, -- physical, digital, ticket, experience
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    compare_at_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    sku TEXT UNIQUE,
    barcode TEXT,
    images JSONB DEFAULT '[]',
    image_keys TEXT[],
    variants JSONB DEFAULT '[]',
    inventory_quantity INTEGER DEFAULT 0,
    inventory_policy TEXT DEFAULT 'deny', -- deny, continue
    weight_grams INTEGER,
    dimensions JSONB,
    shipping_required BOOLEAN DEFAULT TRUE,
    taxable BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchandise associated with artists/venues
CREATE TABLE merchandise_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchandise_id UUID REFERENCES merchandise(id) ON DELETE CASCADE,
    linked_type TEXT NOT NULL, -- artist, venue, gig
    linked_id UUID NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(merchandise_id, linked_type, linked_id)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_email TEXT,
    customer_details JSONB,
    billing_address JSONB,
    shipping_address JSONB,
    order_status TEXT DEFAULT 'pending', -- pending, paid, fulfilled, shipped, delivered, cancelled, refunded
    payment_status payment_status DEFAULT 'pending',
    fulfillment_status TEXT DEFAULT 'unfulfilled',
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    payment_method TEXT,
    payment_id TEXT,
    shipping_method TEXT,
    tracking_number TEXT,
    notes TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    merchandise_id UUID REFERENCES merchandise(id) ON DELETE SET NULL,
    variant_id TEXT,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    product_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL, -- platform, artist, venue, pro
    target_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'GBP',
    billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
    status TEXT DEFAULT 'active', -- active, cancelled, expired, past_due
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription features
CREATE TABLE subscription_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier subscription_tier NOT NULL,
    feature_name TEXT NOT NULL,
    feature_description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tier, feature_name)
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_type TEXT NOT NULL, -- order, subscription, tip, donation
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    payment_method TEXT,
    payment_provider TEXT,
    payment_id TEXT UNIQUE,
    payment_status payment_status DEFAULT 'pending',
    payment_data JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    refunded_amount DECIMAL(10,2) DEFAULT 0,
    refund_reason TEXT,
    refund_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts (for artists, venues, service providers)
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    payout_type TEXT NOT NULL, -- sales, gigs, services, subscriptions
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    fee_amount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    payout_method TEXT,
    payout_provider TEXT,
    payout_id TEXT,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payout items (what the payout is for)
CREATE TABLE payout_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID REFERENCES payouts(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- order, gig, service, subscription
    item_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons and discounts
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT,
    description TEXT,
    discount_type TEXT NOT NULL, -- percentage, fixed_amount
    discount_value DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    minimum_amount DECIMAL(10,2),
    maximum_discount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    applicable_products UUID[],
    applicable_categories TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax rates
CREATE TABLE tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rate DECIMAL(5,4) NOT NULL, -- e.g., 0.2000 for 20%
    country_code TEXT,
    region_code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping carts (temporary)
CREATE TABLE shopping_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT,
    items JSONB DEFAULT '[]',
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'GBP',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlists
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'My Wishlist',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    items JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_merchandise_seller_id ON merchandise(seller_id);
CREATE INDEX idx_merchandise_sku ON merchandise(sku);
CREATE INDEX idx_merchandise_category ON merchandise(category);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(ordered_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_target_id ON subscriptions(target_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payouts_recipient_id ON payouts(recipient_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_shopping_carts_user_id ON shopping_carts(user_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - ADMIN & ANALYTICS
-- ============================================================================
-- Administrative functions, analytics, and reporting

-- Admin users and roles
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'moderator',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id)
);

-- System settings and configuration
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB,
    setting_type TEXT DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for administrative actions
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content moderation
CREATE TABLE content_moderation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    moderation_action TEXT NOT NULL, -- approve, reject, flag, delete
    reason TEXT,
    notes TEXT,
    moderated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags for gradual rollouts
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage DECIMAL(5,2) DEFAULT 0, -- 0-100
    target_users UUID[],
    conditions JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User feature flag assignments
CREATE TABLE user_feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature_flag_id UUID REFERENCES feature_flags(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT FALSE,
    enabled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, feature_flag_id)
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_category TEXT,
    event_action TEXT,
    event_label TEXT,
    event_value INTEGER,
    page_path TEXT,
    page_title TEXT,
    referrer TEXT,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    custom_parameters JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily analytics summaries
CREATE TABLE analytics_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value BIGINT NOT NULL,
    dimensions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(date, metric_type, metric_name, dimensions)
);

-- User engagement metrics
CREATE TABLE user_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_value DECIMAL(10,2),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance monitoring
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,2),
    metric_unit TEXT,
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error logging
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_info JSONB,
    context JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'error',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API rate limiting
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier TEXT NOT NULL, -- IP, user_id, etc.
    limit_type TEXT NOT NULL, -- requests_per_minute, etc.
    current_count INTEGER DEFAULT 0,
    limit_value INTEGER NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    window_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(identifier, limit_type)
);

-- Email campaigns and templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    template_variables JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    recipient_criteria JSONB,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email sends tracking
CREATE TABLE email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced BOOLEAN DEFAULT FALSE,
    bounce_reason TEXT,
    unsubscribed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    status TEXT DEFAULT 'open', -- open, in_progress, waiting, resolved, closed
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket messages
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type TEXT DEFAULT 'message', -- message, note, system
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_summaries_date ON analytics_summaries(date);
CREATE INDEX idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_email_sends_campaign_id ON email_sends(campaign_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
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
