-- Temporarily disable RLS on user_profiles to test if that's the issue
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Test query to confirm RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';
