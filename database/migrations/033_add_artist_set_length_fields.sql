-- Migration 033: Add artist set length fields for gig ability settings

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS minimum_set_length INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS maximum_set_length INTEGER DEFAULT 120;

-- Add constraints to ensure valid set lengths
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_minimum_set_length_check
  CHECK (minimum_set_length >= 15 AND minimum_set_length <= 180 AND minimum_set_length % 15 = 0);

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_maximum_set_length_check
  CHECK (maximum_set_length >= 15 AND maximum_set_length <= 180 AND maximum_set_length % 15 = 0);

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_set_length_order_check
  CHECK (maximum_set_length >= minimum_set_length);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS user_profiles_minimum_set_length_idx ON public.user_profiles(minimum_set_length);
CREATE INDEX IF NOT EXISTS user_profiles_maximum_set_length_idx ON public.user_profiles(maximum_set_length);

INSERT INTO db_version (version, description)
VALUES (33, 'Add artist set length fields for gig ability settings')
ON CONFLICT (version) DO NOTHING;
