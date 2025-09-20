-- URGENT: Fix RLS policy to allow user signup
-- Copy and paste this ENTIRE script into your Supabase SQL Editor and run it

-- Step 1: Add missing columns first
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Step 2: Fix the critical RLS policy issue
-- Remove existing policy if it exists and create the correct one
DROP POLICY IF EXISTS "users_insert_own" ON users;

-- Create the INSERT policy that allows signup
CREATE POLICY "users_insert_own" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Step 3: Verify the fix worked
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual as condition
FROM pg_policies 
WHERE tablename = 'users' 
  AND cmd = 'INSERT'
ORDER BY policyname;

-- Step 4: Test that columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('first_name', 'last_name')
ORDER BY column_name;







