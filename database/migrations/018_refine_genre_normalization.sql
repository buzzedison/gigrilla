-- 018_refine_genre_normalization.sql
-- Restore canonical preferred_genre_ids and keep user_profiles in sync after dropping legacy column.

with mapping as (
  select id as key, id as canonical, 1 as level from public.genre_families

  union all

  select regexp_replace(lower(name), '[^a-z0-9]+', '', 'g') as key,
         id as canonical,
         1 as level
  from public.genre_families

  union all

  select f.id || ':' || t.id as key,
         f.id || ':' || t.id as canonical,
         2 as level
  from public.genre_types t
  join public.genre_families f on f.id = t.family_id

  union all

  select regexp_replace(lower(t.name), '[^a-z0-9]+', '', 'g') as key,
         f.id || ':' || t.id as canonical,
         2 as level
  from public.genre_types t
  join public.genre_families f on f.id = t.family_id

  union all

  select f.id || ':' || t.id || ':' || s.id as key,
         f.id || ':' || t.id || ':' || s.id as canonical,
         3 as level
  from public.genre_subtypes s
  join public.genre_types t on t.id = s.type_id
  join public.genre_families f on f.id = t.family_id

  union all

  select regexp_replace(lower(s.name), '[^a-z0-9]+', '', 'g') as key,
         f.id || ':' || t.id || ':' || s.id as canonical,
         3 as level
  from public.genre_subtypes s
  join public.genre_types t on t.id = s.type_id
  join public.genre_families f on f.id = t.family_id

  union all

  select key, canonical, level
  from (values
    ('rhythmandblues', 'rhythm-music:rhythm-n-blues', 2),
    ('rhythmnblues', 'rhythm-music:rhythm-n-blues', 2),
    ('rhythmblues', 'rhythm-music:rhythm-n-blues', 2)
  ) as aliases(key, canonical, level)
)
update public.user_profiles u
set preferred_genre_ids = (
  select coalesce(
           array_agg(distinct m.canonical) filter (where m.level >= 2),
           array_agg(distinct m.canonical) filter (where m.canonical is not null),
           array[]::text[]
         )
  from unnest(coalesce(u.preferred_genre_ids, array[]::text[])) as legacy(value)
  left join mapping m on regexp_replace(lower(value), '[^a-z0-9]+', '', 'g') = m.key
)
where coalesce(array_length(u.preferred_genre_ids, 1), 0) > 0;

update public.user_profiles up
set preferred_genre_ids = fp.preferred_genre_ids
from public.fan_profiles fp
where up.profile_type = 'fan'
  and up.user_id = fp.user_id
  and coalesce(array_length(fp.preferred_genre_ids, 1), 0) > 0;

