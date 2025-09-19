-- Add essential columns needed for Full Fan upgrade
-- This migration adds the minimum required columns for the upgrade to work

-- Add essential columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username) WHERE username IS NOT NULL;

-- Note: account_type and date_of_birth should already exist from migration 006
-- If they don't exist, add them:
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'guest',
ADD COLUMN IF NOT EXISTS date_of_birth DATE;
