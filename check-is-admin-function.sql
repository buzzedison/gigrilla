-- Check if the is_admin function exists and what it does
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'is_admin'
  AND routine_schema = 'public';

-- Also check if there are any functions with 'admin' in the name
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%admin%'
  AND routine_schema = 'public';
