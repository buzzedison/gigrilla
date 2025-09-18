-- Check what values are allowed for the profile_type enum
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%profile%'
ORDER BY e.enumsortorder;
