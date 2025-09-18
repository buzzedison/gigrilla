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

