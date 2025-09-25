-- 015_backfill_preferred_genre_ids.sql
-- Backfill new preferred_genre_ids columns from legacy preferred_genres arrays

update public.fan_profiles
set preferred_genre_ids = (
  select coalesce(array_agg(elem::text), array[]::text[])
  from unnest(preferred_genres) as elem
)
where preferred_genres is not null
  and array_length(preferred_genres, 1) > 0;

update public.user_profiles
set preferred_genre_ids = (
  select coalesce(array_agg(elem::text), array[]::text[])
  from unnest(preferred_genres) as elem
)
where preferred_genres is not null
  and array_length(preferred_genres, 1) > 0;

