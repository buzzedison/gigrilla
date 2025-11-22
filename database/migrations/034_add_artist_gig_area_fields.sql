-- Migration 034: Add artist gig area and fee fields for local and wider gig settings

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS local_gig_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS local_gig_timescale INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS wider_gig_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS wider_gig_timescale INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS wider_fixed_logistics_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS wider_negotiated_logistics BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS local_gig_area JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS wider_gig_area JSONB DEFAULT '{}';

-- Add constraints to ensure valid fee values
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_local_gig_fee_check
  CHECK (local_gig_fee >= 0);

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_wider_gig_fee_check
  CHECK (wider_gig_fee >= 0);

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_wider_fixed_logistics_fee_check
  CHECK (wider_fixed_logistics_fee >= 0);

-- Add constraints for valid timescales (15-minute increments from 15 to 60 minutes)
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_local_gig_timescale_check
  CHECK (local_gig_timescale >= 15 AND local_gig_timescale <= 60 AND local_gig_timescale % 15 = 0);

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_wider_gig_timescale_check
  CHECK (wider_gig_timescale >= 15 AND wider_gig_timescale <= 60 AND wider_gig_timescale % 15 = 0);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS user_profiles_local_gig_fee_idx ON public.user_profiles(local_gig_fee);
CREATE INDEX IF NOT EXISTS user_profiles_wider_gig_fee_idx ON public.user_profiles(wider_gig_fee);

INSERT INTO db_version (version, description)
VALUES (34, 'Add artist gig area and fee fields for local and wider gig settings')
ON CONFLICT (version) DO NOTHING;
