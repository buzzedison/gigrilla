-- Returns the current user's fan profile completion status
-- Required fields: username, date_of_birth, contact_details.phoneNumber, location_details.address
-- Optional fields can be added later (e.g., genres, is_published)

CREATE OR REPLACE FUNCTION public.get_fan_completion_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_username text;
  v_dob date;
  v_contact jsonb;
  v_location jsonb;
  v_account_type text;
  v_has_username boolean;
  v_has_dob boolean;
  v_has_phone boolean;
  v_has_address boolean;
  v_completed_count int := 0;
  v_required_count int := 4;
  v_completion_percent int := 0;
  v_is_complete boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'account_type', 'guest',
      'is_complete', false,
      'completion_percent', 0
    );
  END IF;

  SELECT username, date_of_birth, contact_details, location_details, account_type
  INTO v_username, v_dob, v_contact, v_location, v_account_type
  FROM public.user_profiles
  WHERE user_id = v_user_id AND profile_type = 'fan'
  LIMIT 1;

  v_has_username := coalesce(nullif(trim(coalesce(v_username, '')), '') IS NOT NULL, false);
  v_has_dob := v_dob IS NOT NULL;
  v_has_phone := coalesce((v_contact ->> 'phoneNumber') IS NOT NULL AND length(v_contact ->> 'phoneNumber') > 0, false);
  v_has_address := coalesce((v_location ->> 'address') IS NOT NULL AND length(v_location ->> 'address') > 0, false);

  v_completed_count := (v_has_username::int + v_has_dob::int + v_has_phone::int + v_has_address::int);
  v_completion_percent := (v_completed_count * 100) / v_required_count;
  v_is_complete := (v_account_type = 'full' AND v_completed_count = v_required_count);

  RETURN jsonb_build_object(
    'account_type', coalesce(v_account_type, 'guest'),
    'is_complete', v_is_complete,
    'completion_percent', v_completion_percent,
    'checks', jsonb_build_object(
      'has_username', v_has_username,
      'has_dob', v_has_dob,
      'has_phone', v_has_phone,
      'has_address', v_has_address
    )
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'account_type', 'guest',
    'is_complete', false,
    'completion_percent', 0
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_fan_completion_status() TO authenticated;


