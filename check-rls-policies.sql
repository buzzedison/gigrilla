-- Check RLS policies for user_profiles
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Test if the user can select their own profile (this should work)
SELECT user_id, profile_type, account_type 
FROM user_profiles 
WHERE user_id = '91d35ed6-bb8a-4016-aa98-e3682c698b6d';

-- The issue is likely that the user can't UPDATE their profile
-- Let's check what the current user context is
SELECT current_user, session_user;
