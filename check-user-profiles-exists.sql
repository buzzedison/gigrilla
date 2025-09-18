-- Check if user_profiles table exists and see its structure
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- If it exists, show its columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

