-- Upgrade user to Full Fan status
-- This function specifically handles the full fan upgrade process
-- It sets account_type to 'full' and updates all profile information

CREATE OR REPLACE FUNCTION public.upgrade_to_full_fan(
  p_user_id uuid,
  p_username text,
  p_display_name text,
  p_bio text,
  p_location_details jsonb,
  p_privacy_settings jsonb,
  p_date_of_birth date,
  p_contact_details jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record RECORD;
BEGIN
  -- Set timeouts to prevent hanging
  PERFORM set_config('lock_timeout', '5s', true);
  PERFORM set_config('statement_timeout', '10s', true);

  -- First update user table if username/display_name provided
  IF p_username IS NOT NULL OR p_display_name IS NOT NULL THEN
    UPDATE users 
    SET 
      username = COALESCE(p_username, username),
      display_name = COALESCE(p_display_name, display_name),
      updated_at = NOW()
    WHERE id = p_user_id;
  END IF;

  -- Insert or update user_profiles with full fan status
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
    'full',
    NOW()
  )
  ON CONFLICT (user_id, profile_type)
  DO UPDATE SET
    username = COALESCE(EXCLUDED.username, user_profiles.username),
    display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
    bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
    contact_details = COALESCE(EXCLUDED.contact_details, user_profiles.contact_details),
    location_details = COALESCE(EXCLUDED.location_details, user_profiles.location_details),
    privacy_settings = COALESCE(EXCLUDED.privacy_settings, user_profiles.privacy_settings),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, user_profiles.date_of_birth),
    account_type = 'full', -- Always upgrade to full
    updated_at = NOW()
  RETURNING * INTO result_record;

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully upgraded to Full Fan',
    'account_type', 'full',
    'profile_id', result_record.id
  );

EXCEPTION WHEN OTHERS THEN
  -- Return error response
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to upgrade to Full Fan'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.upgrade_to_full_fan(uuid, text, text, text, jsonb, jsonb, date, jsonb) TO authenticated;


