-- Check ALL RLS policies on user_profiles table
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
WHERE tablename = 'user_profiles'
ORDER BY cmd, policyname;

-- Also check if RLS is enabled on the table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';
