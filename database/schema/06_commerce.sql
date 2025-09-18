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

