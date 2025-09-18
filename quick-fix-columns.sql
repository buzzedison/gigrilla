-- Quick fix: Add missing columns to user_profiles
-- Run this in Supabase SQL Editor

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'guest',
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Check if columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('account_type', 'date_of_birth');

