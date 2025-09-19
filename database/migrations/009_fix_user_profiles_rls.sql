-- Fix user_profiles RLS policies to support upsert operations
-- Replace existing policies with a single comprehensive policy

-- Drop existing policies
DROP POLICY IF EXISTS "user_profiles_select_all" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON public.user_profiles;

-- Create a simple policy that allows users to manage their own profiles
CREATE POLICY "user_profiles_own_access" ON public.user_profiles
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
