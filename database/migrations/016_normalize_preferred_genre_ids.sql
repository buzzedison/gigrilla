-- 016_normalize_preferred_genre_ids.sql
-- Converts legacy preferred_genres strings into canonical id paths for preferred_genre_ids

with mapping as (
  select key, canonical from (
    select regexp_replace(lower(name), '[^a-z0-9]+', '', 'g') as key,
           id as canonical
    from public.genre_families

    union all

    select regexp_replace(lower(t.name), '[^a-z0-9]+', '', 'g') as key,
           f.id || ':' || t.id as canonical
    from public.genre_types t
    join public.genre_families f on f.id = t.family_id

    union all

    select regexp_replace(lower(s.name), '[^a-z0-9]+', '', 'g') as key,
           f.id || ':' || t.id || ':' || s.id as canonical
    from public.genre_subtypes s
    join public.genre_types t on t.id = s.type_id
    join public.genre_families f on f.id = t.family_id
  ) as combined
),
fan_updates as (
  select f.id,
         coalesce(array_agg(distinct m.canonical) filter (where m.canonical is not null), array[]::text[]) as canonical_array
  from public.fan_profiles f
  cross join lateral unnest(coalesce(f.preferred_genres, array[]::text[])) as legacy(value)
  left join mapping m on regexp_replace(lower(value), '[^a-z0-9]+', '', 'g') = m.key
  where coalesce(array_length(f.preferred_genres, 1), 0) > 0
  group by f.id
)
update public.fan_profiles f
set preferred_genre_ids = fu.canonical_array
from fan_updates fu
where f.id = fu.id;

update public.user_profiles u
set preferred_genre_ids = (
  select coalesce(array_agg(distinct m.canonical) filter (where m.canonical is not null), array[]::text[])
  from unnest(coalesce(u.preferred_genres::text[], array[]::text[])) as legacy(value)
  left join mapping m on regexp_replace(lower(value), '[^a-z0-9]+', '', 'g') = m.key
)
where coalesce(array_length(u.preferred_genres, 1), 0) > 0;

