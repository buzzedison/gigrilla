-- RPC to get user account type (bypasses client RLS timeouts)
CREATE OR REPLACE FUNCTION public.get_user_account_type()
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  account_type_result text;
BEGIN
  -- Set timeouts to fail fast
  PERFORM set_config('statement_timeout', '3s', true);
  
  SELECT account_type INTO account_type_result
  FROM public.user_profiles
  WHERE user_id = auth.uid() 
    AND profile_type = 'fan'
  LIMIT 1;
  
  -- Return 'guest' if no profile found or account_type is null
  RETURN COALESCE(account_type_result, 'guest');
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return 'guest' on any error (timeout, no access, etc.)
    RETURN 'guest';
END;
$$;

-- Allow authenticated users to execute
GRANT EXECUTE ON FUNCTION public.get_user_account_type() TO authenticated;
