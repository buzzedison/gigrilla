-- Update fan profile without changing account type
-- This function is for general profile updates that shouldn't affect upgrade status

CREATE OR REPLACE FUNCTION public.update_fan_profile(
  p_user_id uuid,
  p_username text DEFAULT NULL,
  p_display_name text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_location_details jsonb DEFAULT NULL,
  p_privacy_settings jsonb DEFAULT NULL,
  p_date_of_birth date DEFAULT NULL,
  p_contact_details jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record RECORD;
BEGIN
  -- Set timeouts to prevent hanging
  PERFORM set_config('statement_timeout', '10s', true);

  -- Update user table if username/display_name provided
  IF p_username IS NOT NULL OR p_display_name IS NOT NULL THEN
    UPDATE users 
    SET 
      username = COALESCE(p_username, username),
      display_name = COALESCE(p_display_name, display_name),
      updated_at = NOW()
    WHERE id = p_user_id;
  END IF;

  -- Insert or update user_profiles (preserving existing account_type)
  INSERT INTO public.user_profiles (
    user_id,
    profile_type,
    username,
    display_name,
    bio,
    contact_details,
    location_details,
    privacy_settings,
    date_of_birth,
    account_type,
    updated_at
  ) VALUES (
    p_user_id,
    'fan',
    p_username,
    p_display_name,
    p_bio,
    p_contact_details,
    p_location_details,
    p_privacy_settings,
    p_date_of_birth,
    'guest', -- Default for new profiles
    NOW()
  )
  ON CONFLICT (user_id, profile_type)
  DO UPDATE SET
    username = CASE WHEN p_username IS NOT NULL THEN p_username ELSE user_profiles.username END,
    display_name = CASE WHEN p_display_name IS NOT NULL THEN p_display_name ELSE user_profiles.display_name END,
    bio = CASE WHEN p_bio IS NOT NULL THEN p_bio ELSE user_profiles.bio END,
    contact_details = CASE WHEN p_contact_details IS NOT NULL THEN p_contact_details ELSE user_profiles.contact_details END,
    location_details = CASE WHEN p_location_details IS NOT NULL THEN p_location_details ELSE user_profiles.location_details END,
    privacy_settings = CASE WHEN p_privacy_settings IS NOT NULL THEN p_privacy_settings ELSE user_profiles.privacy_settings END,
    date_of_birth = CASE WHEN p_date_of_birth IS NOT NULL THEN p_date_of_birth ELSE user_profiles.date_of_birth END,
    -- account_type is NOT updated here - it preserves existing value
    updated_at = NOW()
  RETURNING * INTO result_record;

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Profile updated successfully',
    'account_type', result_record.account_type,
    'profile_id', result_record.id
  );

EXCEPTION WHEN OTHERS THEN
  -- Return error response
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to update profile'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_fan_profile(uuid, text, text, text, jsonb, jsonb, date, jsonb) TO authenticated;


