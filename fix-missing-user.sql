-- Fix missing user record
-- This user exists in Supabase auth but not in our users table

-- First, let's check what's in auth.users for this user
SELECT id, email, created_at, email_confirmed_at, raw_user_meta_data
FROM auth.users 
WHERE id = '91d35ed6-bb8a-4016-aa98-e3682c698b6d';

-- Insert the missing user record (adjust the data based on what you see above)
INSERT INTO users (
  id, 
  email, 
  first_name, 
  last_name, 
  user_role,
  created_at
) 
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'first_name', 'Unknown') as first_name,
  COALESCE(raw_user_meta_data->>'last_name', 'User') as last_name,
  'fan' as user_role,
  created_at
FROM auth.users 
WHERE id = '91d35ed6-bb8a-4016-aa98-e3682c698b6d'
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT id, email, first_name, last_name, user_role 
FROM users 
WHERE id = '91d35ed6-bb8a-4016-aa98-e3682c698b6d';
