-- Extend artist industry contact information fields on user_profiles

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS record_label_contact_name TEXT,
ADD COLUMN IF NOT EXISTS record_label_phone TEXT,
ADD COLUMN IF NOT EXISTS music_publisher_contact_name TEXT,
ADD COLUMN IF NOT EXISTS music_publisher_phone TEXT,
ADD COLUMN IF NOT EXISTS artist_manager_contact_name TEXT,
ADD COLUMN IF NOT EXISTS artist_manager_phone TEXT,
ADD COLUMN IF NOT EXISTS booking_agent_contact_name TEXT,
ADD COLUMN IF NOT EXISTS booking_agent_phone TEXT,
ADD COLUMN IF NOT EXISTS snapchat_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS spotify_url TEXT;

-- Update existing rows to ensure new columns default to NULL when absent
UPDATE public.user_profiles
SET
  record_label_contact_name = record_label_contact_name,
  record_label_phone = record_label_phone,
  music_publisher_contact_name = music_publisher_contact_name,
  music_publisher_phone = music_publisher_phone,
  artist_manager_contact_name = artist_manager_contact_name,
  artist_manager_phone = artist_manager_phone,
  booking_agent_contact_name = booking_agent_contact_name,
  booking_agent_phone = booking_agent_phone,
  snapchat_url = snapchat_url,
  tiktok_url = tiktok_url,
  instagram_url = instagram_url,
  spotify_url = spotify_url;

