-- Direct test of the exact upsert that's failing
-- This will show us the exact error

-- Test the exact upsert operation that's timing out
INSERT INTO user_profiles (
  user_id,
  profile_type,
  contact_details,
  location_details,
  date_of_birth,
  account_type
) VALUES (
  '91d35ed6-bb8a-4016-aa98-e3682c698b6d',
  'fan',
  '{"phoneNumber": "0245600275", "paymentDetails": null}',
  '{"address": "career hub"}',
  '1984-09-17',
  'full'
)
ON CONFLICT (user_id, profile_type) 
DO UPDATE SET 
  contact_details = EXCLUDED.contact_details,
  location_details = EXCLUDED.location_details,
  date_of_birth = EXCLUDED.date_of_birth,
  account_type = EXCLUDED.account_type;

-- Check if it worked
SELECT * FROM user_profiles 
WHERE user_id = '91d35ed6-bb8a-4016-aa98-e3682c698b6d' 
  AND profile_type = 'fan';
