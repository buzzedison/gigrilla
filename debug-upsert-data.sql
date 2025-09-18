-- Debug the user_profiles table structure and check what columns exist
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if there are any unique constraints that might conflict
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'user_profiles' 
  AND tc.table_schema = 'public';
