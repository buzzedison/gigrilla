-- Fix RLS policies for user_profiles to allow users to update their own profiles

-- First, let's see what policies currently exist
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- The issue is likely that users can't UPDATE their own profiles
-- Let's check if the update policy exists and is correct

-- Drop and recreate the user_profiles policies to ensure they work correctly
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;

-- Allow users to insert their own profiles
CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profiles
CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles' 
  AND cmd IN ('INSERT', 'UPDATE');
