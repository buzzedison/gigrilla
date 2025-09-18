-- Test user_profiles access and RLS policies
-- Replace 'YOUR_USER_ID' with the actual user ID from the logs

-- 1. Check if user can read their own profile
SELECT * FROM user_profiles 
WHERE user_id = '91d35ed6-bb8a-4016-aa98-e3682c698b6d' 
  AND profile_type = 'fan';

-- 2. Check RLS policies on user_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 3. Test if we can insert a basic profile (this should work)
INSERT INTO user_profiles (user_id, profile_type, account_type) 
VALUES ('91d35ed6-bb8a-4016-aa98-e3682c698b6d', 'fan', 'guest')
ON CONFLICT (user_id, profile_type) 
DO UPDATE SET account_type = EXCLUDED.account_type;

-- 4. Check if the profile exists now
SELECT user_id, profile_type, account_type, date_of_birth, contact_details, location_details
FROM user_profiles 
WHERE user_id = '91d35ed6-bb8a-4016-aa98-e3682c698b6d' 
  AND profile_type = 'fan';
