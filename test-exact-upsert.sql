-- Test the exact upsert that's timing out
INSERT INTO user_profiles (
  user_id,
  profile_type,
  contact_details,
  location_details,
  date_of_birth,
  account_type
) VALUES (
  '046de1a8-dd02-46d5-9641-9947bd262c9f',
  'fan',
  '{"phoneNumber": "0245600275", "paymentDetails": null}'::jsonb,
  '{"address": "yes"}'::jsonb,
  '2025-09-28',
  'full'
)
ON CONFLICT (user_id, profile_type) 
DO UPDATE SET
  contact_details = EXCLUDED.contact_details,
  location_details = EXCLUDED.location_details,
  date_of_birth = EXCLUDED.date_of_birth,
  account_type = EXCLUDED.account_type,
  updated_at = NOW();
