-- 030_add_onboarding_completed.sql
-- Add onboarding_completed flag to track when users finish the signup wizard

BEGIN;

-- Add onboarding_completed column to fan_profiles
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add onboarding_completed_at timestamp
ALTER TABLE public.fan_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for querying completed profiles
CREATE INDEX IF NOT EXISTS idx_fan_profiles_onboarding_completed 
  ON public.fan_profiles(onboarding_completed) 
  WHERE onboarding_completed = TRUE;

-- Backfill existing profiles that have music preferences as completed
UPDATE public.fan_profiles
SET 
  onboarding_completed = TRUE,
  onboarding_completed_at = COALESCE(updated_at, created_at, NOW())
WHERE 
  onboarding_completed IS NULL OR onboarding_completed = FALSE
  AND (
    (music_preferences IS NOT NULL AND music_preferences::text != '{}'::text)
    OR (preferred_genre_ids IS NOT NULL AND array_length(preferred_genre_ids, 1) > 0)
  );

COMMIT;
