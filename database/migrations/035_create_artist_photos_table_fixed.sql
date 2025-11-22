-- Create artist_photos table for storing artist profile photos, logos, and header images
CREATE TABLE IF NOT EXISTS artist_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT DEFAULT '',
    type TEXT NOT NULL CHECK (type IN ('logo', 'header', 'photo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artist_photos_user_id ON artist_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_photos_type ON artist_photos(type);
CREATE INDEX IF NOT EXISTS idx_artist_photos_created_at ON artist_photos(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE artist_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own photos
CREATE POLICY IF NOT EXISTS "Users can view their own photos" ON artist_photos
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own photos
CREATE POLICY IF NOT EXISTS "Users can insert their own photos" ON artist_photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own photos
CREATE POLICY IF NOT EXISTS "Users can update their own photos" ON artist_photos
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own photos
CREATE POLICY IF NOT EXISTS "Users can delete their own photos" ON artist_photos
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON artist_photos TO authenticated;
GRANT SELECT ON artist_photos TO anon; -- For public profile viewing

-- Create storage bucket for artist photos if it doesn't exist
-- Note: Run this separately if it fails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'artist-photos',
    'artist-photos',
    true,
    5242880, -- 5MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage bucket (simplified version)
CREATE POLICY IF NOT EXISTS "Users can upload their own photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'artist-photos' AND 
        (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
    );

CREATE POLICY IF NOT EXISTS "Users can view their own photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'artist-photos' AND 
        (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
    );

CREATE POLICY IF NOT EXISTS "Users can update their own photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'artist-photos' AND 
        (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
    );

CREATE POLICY IF NOT EXISTS "Users can delete their own photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'artist-photos' AND 
        (auth.uid()::text = split_part(name, '/', 1) OR name LIKE auth.uid()::text || '/%')
    );
