-- Debug script to check user_profiles table structure and data

-- 1. Check if the new columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('account_type', 'date_of_birth', 'display_name')
ORDER BY column_name;

-- 2. Check current user_profiles structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 3. Check current user_profiles data
SELECT 
  user_id,
  profile_type,
  contact_details,
  location_details,
  COALESCE(account_type, 'NULL') as account_type,
  COALESCE(date_of_birth::text, 'NULL') as date_of_birth,
  created_at
FROM user_profiles 
WHERE profile_type = 'fan'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check database version
SELECT version, description, applied_at 
FROM db_version 
ORDER BY version DESC 
LIMIT 5;

