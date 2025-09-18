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

