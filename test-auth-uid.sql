-- Test what auth.uid() returns and compare with the user_id we're trying to upsert
SELECT 
  auth.uid() as current_auth_uid,
  '046de1a8-dd02-46d5-9641-9947bd262c9f'::uuid as trying_to_upsert_user_id,
  (auth.uid() = '046de1a8-dd02-46d5-9641-9947bd262c9f'::uuid) as ids_match;
