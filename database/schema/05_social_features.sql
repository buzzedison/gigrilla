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

