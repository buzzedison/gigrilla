-- Fix RLS policies properly for upsert operations
-- Upsert needs SELECT, INSERT, and UPDATE permissions

-- Drop all existing policies
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON user_profiles;

-- Create comprehensive policies that work with upsert
CREATE POLICY "user_profiles_all_own" ON user_profiles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify the policy
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';
