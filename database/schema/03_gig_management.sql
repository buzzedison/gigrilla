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

