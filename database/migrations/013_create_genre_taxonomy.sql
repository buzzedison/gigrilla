-- 013_create_genre_taxonomy.sql
-- Creates canonical genre tables and id-based preference columns

create table if not exists public.genre_families (
  id text primary key,
  name text not null
);

create table if not exists public.genre_types (
  id text primary key,
  family_id text not null references public.genre_families(id) on delete cascade,
  name text not null
);

create table if not exists public.genre_subtypes (
  id text primary key,
  type_id text not null references public.genre_types(id) on delete cascade,
  name text not null
);

alter table public.fan_profiles
  add column if not exists preferred_genre_ids text[] default array[]::text[];

alter table public.user_profiles
  add column if not exists preferred_genre_ids text[] default array[]::text[];

create index if not exists fan_profiles_preferred_genre_ids_idx
  on public.fan_profiles using gin (preferred_genre_ids);

create index if not exists user_profiles_preferred_genre_ids_idx
  on public.user_profiles using gin (preferred_genre_ids);

