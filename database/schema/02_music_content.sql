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
