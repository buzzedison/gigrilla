-- ============================================================================
-- COMPLETE FIX FOR GIGRILLA SIGNUP ISSUES
-- ============================================================================
-- Run this in your Supabase SQL Editor to fix all signup issues

-- ============================================================================
-- STEP 1: ADD MISSING COLUMNS
-- ============================================================================

-- Add first_name and last_name to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add genres and is_public to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS genres TEXT[] DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- ============================================================================
-- STEP 2: FIX RLS POLICIES (CRITICAL FOR SIGNUP)
-- ============================================================================

-- Remove existing policy if it exists
DROP POLICY IF EXISTS "users_insert_own" ON users;

-- Create the INSERT policy that allows user signup
CREATE POLICY "users_insert_own" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Ensure user_profiles has proper INSERT policy
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;
CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 3: VERIFY THE FIXES
-- ============================================================================

-- Check that columns were added to users table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('id', 'email', 'first_name', 'last_name', 'user_role')
ORDER BY ordinal_position;

-- Check that columns were added to user_profiles table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN ('user_id', 'profile_type', 'genres', 'is_public')
ORDER BY ordinal_position;

-- Check RLS policies on users table
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual as condition
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- Check RLS policies on user_profiles table
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual as condition
FROM pg_policies 
WHERE tablename = 'user_profiles'
  AND cmd = 'INSERT'
ORDER BY policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'Gigrilla signup fix completed successfully!' as status;
