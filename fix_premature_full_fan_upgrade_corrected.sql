-- Fix the premature full fan upgrade issue
-- This script fixes the upsert_fan_profile function and creates proper upgrade flow

-- ============================================================================
-- DROP AND RECREATE THE UPSERT FUNCTION WITH PROPER ACCOUNT TYPE HANDLING
-- ============================================================================

-- Drop the existing problematic function
DROP FUNCTION IF EXISTS public.upsert_fan_profile;

-- Drop any existing update_fan_profile functions with all possible signatures
DROP FUNCTION IF EXISTS public.update_fan_profile(UUID, TEXT, TEXT, TEXT, JSONB, JSONB, DATE);
DROP FUNCTION IF EXISTS public.update_fan_profile(UUID, TEXT, TEXT, TEXT, JSONB, JSONB);
DROP FUNCTION IF EXISTS public.update_fan_profile(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.update_fan_profile;

-- Create a new function that only updates profile info, NOT account type
CREATE OR REPLACE FUNCTION public.update_fan_profile(
    p_user_id UUID,
    p_username TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_location_details JSONB DEFAULT NULL,
    p_privacy_settings JSONB DEFAULT NULL,
    p_date_of_birth DATE DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Update the profile WITHOUT changing account_type
    UPDATE public.user_profiles SET
        username = COALESCE(p_username, username),
        display_name = COALESCE(p_display_name, display_name),
        bio = COALESCE(p_bio, bio),
        location_details = COALESCE(p_location_details, location_details),
        privacy_settings = COALESCE(p_privacy_settings, privacy_settings),
        date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
        updated_at = NOW()
    WHERE user_id = p_user_id AND profile_type = 'fan'
    RETURNING * INTO profile_record;

    -- If no profile exists, create one as 'guest' (not full_fan)
    IF profile_record IS NULL THEN
        INSERT INTO public.user_profiles (
            user_id,
            profile_type,
            username,
            display_name,
            bio,
            location_details,
            privacy_settings,
            date_of_birth,
            account_type,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            'fan',
            p_username,
            p_display_name,
            p_bio,
            p_location_details,
            p_privacy_settings,
            p_date_of_birth,
            'guest', -- Default to guest, NOT full_fan
            NOW(),
            NOW()
        )
        RETURNING * INTO profile_record;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'profile', row_to_json(profile_record)
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- Create a separate function specifically for upgrading to full fan
CREATE OR REPLACE FUNCTION public.upgrade_to_full_fan(
    p_user_id UUID,
    p_username TEXT,
    p_display_name TEXT,
    p_bio TEXT DEFAULT NULL,
    p_location_details JSONB DEFAULT NULL,
    p_privacy_settings JSONB DEFAULT NULL,
    p_date_of_birth DATE DEFAULT NULL,
    p_contact_details JSONB DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Validate required fields for full fan upgrade
    IF p_username IS NULL OR p_date_of_birth IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Username and date of birth are required for full fan upgrade'
        );
    END IF;

    -- Upsert the profile with full_fan status
    INSERT INTO public.user_profiles (
        user_id,
        profile_type,
        username,
        display_name,
        bio,
        location_details,
        privacy_settings,
        date_of_birth,
        contact_details,
        account_type,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        'fan',
        p_username,
        p_display_name,
        p_bio,
        p_location_details,
        p_privacy_settings,
        p_date_of_birth,
        p_contact_details,
        'full', -- Only this function sets full status
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id, profile_type) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
        location_details = COALESCE(EXCLUDED.location_details, user_profiles.location_details),
        privacy_settings = COALESCE(EXCLUDED.privacy_settings, user_profiles.privacy_settings),
        date_of_birth = EXCLUDED.date_of_birth,
        contact_details = COALESCE(EXCLUDED.contact_details, user_profiles.contact_details),
        account_type = 'full', -- Explicitly upgrade to full
        updated_at = NOW()
    RETURNING * INTO profile_record;

    RETURN jsonb_build_object(
        'success', true,
        'profile', row_to_json(profile_record)
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_fan_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.upgrade_to_full_fan TO authenticated;

-- ============================================================================
-- RESET ANY INCORRECTLY UPGRADED USERS BACK TO GUEST STATUS
-- ============================================================================

-- This is optional - only run if you want to reset users who were incorrectly upgraded
-- Comment out if you want to keep existing full_fan users

-- UPDATE public.user_profiles
-- SET account_type = 'guest'
-- WHERE profile_type = 'fan'
--   AND account_type = 'full_fan'
--   AND (username IS NULL OR date_of_birth IS NULL);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check the functions were created successfully
SELECT 'Functions created successfully' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'update_fan_profile' AND routine_schema = 'public'
) AND EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'upgrade_to_full_fan' AND routine_schema = 'public'
);

-- Check current user account types
SELECT
    account_type,
    COUNT(*) as user_count,
    COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as with_username,
    COUNT(CASE WHEN date_of_birth IS NOT NULL THEN 1 END) as with_dob
FROM public.user_profiles
WHERE profile_type = 'fan'
GROUP BY account_type
ORDER BY account_type;