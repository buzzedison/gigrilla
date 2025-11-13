-- 028_cleanup_corrupt_subtypes.sql
-- Remove corrupt/invalid genre subtypes data

BEGIN;

-- Delete entries with empty IDs
DELETE FROM public.genre_subtypes WHERE id IS NULL OR id = '';

-- Delete suspicious entries (form fields, UI text, etc.)
DELETE FROM public.genre_subtypes WHERE 
  name LIKE '%[_]%' OR
  name LIKE '%___%' OR
  name LIKE '%Control Panel%' OR
  name LIKE '%Per-Gig%' OR
  name LIKE '%Rights Holder%' OR
  LENGTH(name) > 200;

-- Clean up any remaining invalid entries for world-south-america-other-traditional
-- Keep only legitimate music sub-genres
DELETE FROM public.genre_subtypes 
WHERE type_id = 'world-south-america-other-traditional' 
AND (
  id NOT LIKE 'world-south-america-other-traditional-%' OR
  name LIKE '%[%]%' OR
  name LIKE '%£%' OR
  name LIKE '%Profile%'
);

COMMIT;
