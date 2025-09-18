-- ============================================================================
-- USER GENRE PREFERENCES TABLE
-- ============================================================================
-- This migration adds the user_genre_preferences table that the fan dashboard
-- is trying to use for storing user music preferences.

-- Create user_genre_preferences table
CREATE TABLE IF NOT EXISTS user_genre_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    preference_weight DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0 weight
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, genre_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_genre_preferences_user_id ON user_genre_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_genre_preferences_genre_id ON user_genre_preferences(genre_id);

-- Update database version
INSERT INTO db_version (version, description) 
VALUES (5, 'Added user_genre_preferences table for fan music preferences')
ON CONFLICT (version) DO NOTHING;

