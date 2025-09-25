create extension if not exists "pgcrypto";

create table if not exists public.artist_member_invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  name text,
  email text not null,
  role text,
  status text not null default 'pending',
  invitation_token text not null,
  invited_at timestamptz not null default now(),
  responded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists artist_member_invitations_user_idx on public.artist_member_invitations (user_id);
create index if not exists artist_member_invitations_profile_idx on public.artist_member_invitations (artist_profile_id);
create index if not exists artist_member_invitations_status_idx on public.artist_member_invitations (status);

alter table public.artist_member_invitations
  add constraint artist_member_invitations_status_check
    check (status in ('pending', 'sent', 'accepted', 'declined', 'revoked'));

alter table public.artist_member_invitations enable row level security;

create policy "Artist member invitations are visible to owner"
  on public.artist_member_invitations
  for select
  using (user_id = auth.uid());

create policy "Artists can insert their own member invitations"
  on public.artist_member_invitations
  for insert
  with check (user_id = auth.uid());

create policy "Artists can update their own member invitations"
  on public.artist_member_invitations
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Artists can delete their own member invitations"
  on public.artist_member_invitations
  for delete
  using (user_id = auth.uid());

insert into db_version (version, description)
values (20, 'Create artist member invitations table')
on conflict (version) do nothing;

