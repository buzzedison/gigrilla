-- ============================================================================
-- STORAGE BUCKET POLICIES
-- ============================================================================
-- RLS policies for Supabase Storage buckets
-- This allows authenticated users to upload and manage their own files

-- ============================================================================
-- CREATE STORAGE BUCKETS (if they don't exist)
-- ============================================================================

-- AVATARS BUCKET (Profile Pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket (anyone can read)
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- FAN-GALLERY BUCKET (Fan Gallery Photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fan-gallery',
  'fan-gallery',
  true, -- Public bucket (anyone can read)
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- AVATARS BUCKET (Profile Pictures)
-- ============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "avatars_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_select_public" ON storage.objects;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "avatars_upload_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own files
CREATE POLICY "avatars_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "avatars_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatar files
CREATE POLICY "avatars_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================================================
-- FAN-GALLERY BUCKET (Fan Gallery Photos)
-- ============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "fan_gallery_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "fan_gallery_update_own" ON storage.objects;
DROP POLICY IF EXISTS "fan_gallery_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "fan_gallery_select_public" ON storage.objects;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "fan_gallery_upload_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fan-gallery' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own files
CREATE POLICY "fan_gallery_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fan-gallery' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "fan_gallery_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'fan-gallery' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to fan gallery files
CREATE POLICY "fan_gallery_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'fan-gallery');

