-- Migration: Add RLS policies for fan_profiles table
-- Created: 2025-01-20
-- Description: Enable RLS on fan_profiles table and add policies for secure access

-- Enable RLS on fan_profiles table
ALTER TABLE fan_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for fan_profiles table
-- Users can only access their own fan profile data
CREATE POLICY "fan_profiles_select_own" ON fan_profiles
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "fan_profiles_insert_own" ON fan_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fan_profiles_update_own" ON fan_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "fan_profiles_delete_own" ON fan_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated, anon;
