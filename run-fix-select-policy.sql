-- Fix the SELECT policy by removing the is_admin function that's causing the hang

DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;

-- Create a simpler SELECT policy without the is_admin function
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Verify the new policy
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles' 
  AND cmd = 'SELECT';
