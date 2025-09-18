-- Direct query to check your profile (run as postgres/service_role)
SELECT user_id, profile_type, account_type, contact_details, location_details, created_at, updated_at
FROM public.user_profiles 
WHERE user_id IN (
  '046de1a8-dd02-46d5-9641-9947bd262c9f',
  '3041139c-1fe4-462c-8184-33d8d3d4f9e8'
)
ORDER BY updated_at DESC;

