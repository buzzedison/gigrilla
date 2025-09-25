-- 017_drop_legacy_preferred_genres.sql
-- Removes the deprecated preferred_genres columns now that canonical ids are in use

drop index if exists idx_fan_profiles_preferred_genres;

alter table if exists public.fan_profiles
  drop column if exists preferred_genres;

alter table if exists public.user_profiles
  drop column if exists preferred_genres;

