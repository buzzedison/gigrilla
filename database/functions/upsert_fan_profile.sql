-- Upsert Full Fan profile via RPC (RLS enforced via SECURITY INVOKER)
-- Best practice: encapsulate complex writes in RPC to avoid PostgREST upsert edge-cases

CREATE OR REPLACE FUNCTION public.upsert_fan_profile(
  p_user_id uuid,
  p_contact_details jsonb,
  p_location_details jsonb,
  p_date_of_birth date,
  p_account_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Fail fast if there's a lock/contention rather than hanging
  PERFORM set_config('lock_timeout', '5s', true);
  PERFORM set_config('statement_timeout', '10s', true);

  INSERT INTO public.user_profiles (
    user_id,
    profile_type,
    contact_details,
    location_details,
    date_of_birth,
    account_type
  ) VALUES (
    p_user_id,
    'fan',
    p_contact_details,
    p_location_details,
    p_date_of_birth,
    p_account_type
  )
  ON CONFLICT (user_id, profile_type)
  DO UPDATE SET
    contact_details = EXCLUDED.contact_details,
    location_details = EXCLUDED.location_details,
    date_of_birth   = EXCLUDED.date_of_birth,
    account_type    = EXCLUDED.account_type,
    updated_at      = now();

  RETURN true;
END;
$$;

-- Allow authenticated users to execute
GRANT EXECUTE ON FUNCTION public.upsert_fan_profile(uuid, jsonb, jsonb, date, text) TO authenticated;


