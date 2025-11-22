-- First, let's test if we can create a simple table
CREATE TABLE IF NOT EXISTS test_table (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL
);

-- If that works, try the artist_photos table step by step
-- Drop the table first to start fresh
DROP TABLE IF EXISTS artist_photos;

-- Create the table with basic structure
CREATE TABLE artist_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    caption TEXT DEFAULT '',
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test the table was created
SELECT 'artist_photos table created' as status;

-- Check the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'artist_photos' 
ORDER BY ordinal_position;

-- Now add the foreign key constraint
ALTER TABLE artist_photos 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add the check constraint
ALTER TABLE artist_photos 
ADD CONSTRAINT chk_type 
CHECK (type IN ('logo', 'header', 'photo'));

-- Test everything is working
SELECT 'artist_photos table with constraints created' as status;
