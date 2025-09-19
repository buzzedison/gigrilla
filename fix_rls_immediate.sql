-- Fix RLS policies for user_profiles to resolve hanging upsert issue
-- Run this directly in your Supabase SQL editor

-- Drop all existing policies
DROP POLICY IF EXISTS "user_profiles_select_all" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_own_access" ON public.user_profiles;

-- Create a comprehensive policy that allows users to manage their own profiles
CREATE POLICY "user_profiles_all_operations" ON public.user_profiles
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;

-- Test the policy (this should work without hanging)
-- SELECT * FROM user_profiles WHERE user_id = auth.uid() LIMIT 1;
