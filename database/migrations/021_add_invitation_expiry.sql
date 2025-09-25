alter table public.artist_member_invitations
  add column if not exists invitation_token_expires_at timestamptz;

update public.artist_member_invitations
set invitation_token_expires_at = invited_at + interval '7 days'
where invitation_token_expires_at is null;

insert into db_version (version, description)
values (21, 'Add invitation token expiry column')
on conflict (version) do nothing;

