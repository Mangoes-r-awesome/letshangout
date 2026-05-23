-- HANGOUTS — Migration 002: auth, invites, admin, RLS
-- Run AFTER lib/schema.sql (the v0 schema).
-- Idempotent: safe to re-run.

-- =====================================================
-- 1. Schema additions
-- =====================================================

-- Admin flag on users
alter table public.users add column if not exists is_admin boolean default false;

-- Invite code on squads (6-char, unique, human-readable)
alter table public.squads add column if not exists invite_code text;
create unique index if not exists idx_squads_invite_code on public.squads(invite_code);

-- Backfill any squads without a code (rare, but defensive)
update public.squads
set invite_code = upper(substring(md5(random()::text || id::text) from 1 for 6))
where invite_code is null;

-- Make it non-nullable going forward
alter table public.squads alter column invite_code set not null;

-- =====================================================
-- 2. Auto-create users row when auth.users gets a new row
-- =====================================================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, phone, email)
  values (new.id, new.phone, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- =====================================================
-- 3. Row-Level Security
-- =====================================================

-- Helper: bypasses RLS so squad_members policies don't recurse on themselves.
create or replace function public.is_squad_member(_squad uuid, _user uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.squad_members where squad_id = _squad and user_id = _user);
$$;

revoke all on function public.is_squad_member(uuid, uuid) from public;
grant execute on function public.is_squad_member(uuid, uuid) to authenticated, service_role;

-- USERS: people can read their own row + rows of squadmates. Edit only own.
alter table public.users enable row level security;

drop policy if exists "users read self" on public.users;
create policy "users read self" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users read squadmates" on public.users;
create policy "users read squadmates" on public.users
  for select using (
    exists (
      select 1 from public.squad_members sm
      where sm.user_id = public.users.id and public.is_squad_member(sm.squad_id)
    )
  );

drop policy if exists "users update self" on public.users;
create policy "users update self" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- SQUADS: members can read; only organisers can update; insert via server (service role)
alter table public.squads enable row level security;

drop policy if exists "squads read by members" on public.squads;
create policy "squads read by members" on public.squads
  for select using (public.is_squad_member(id));

drop policy if exists "squads update by organisers" on public.squads;
create policy "squads update by organisers" on public.squads
  for update using (
    exists (
      select 1 from public.squad_members
      where squad_id = squads.id and user_id = auth.uid() and role = 'organiser'
    )
  );

-- SQUAD_MEMBERS: members of a squad can see all members of that squad
alter table public.squad_members enable row level security;

drop policy if exists "squad_members read by squadmates" on public.squad_members;
create policy "squad_members read by squadmates" on public.squad_members
  for select using (public.is_squad_member(squad_id));

drop policy if exists "squad_members leave self" on public.squad_members;
create policy "squad_members leave self" on public.squad_members
  for delete using (user_id = auth.uid());

-- HANGOUTS, RSVPS, NUDGES: visible only to squad members
alter table public.hangouts enable row level security;

drop policy if exists "hangouts read by squad" on public.hangouts;
create policy "hangouts read by squad" on public.hangouts
  for select using (public.is_squad_member(squad_id));

alter table public.rsvps enable row level security;

drop policy if exists "rsvps read by squad" on public.rsvps;
create policy "rsvps read by squad" on public.rsvps
  for select using (
    exists (
      select 1 from public.hangouts h
      where h.id = rsvps.hangout_id and public.is_squad_member(h.squad_id)
    )
  );

drop policy if exists "rsvps update own" on public.rsvps;
create policy "rsvps update own" on public.rsvps
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.nudges enable row level security;

drop policy if exists "nudges read by squad" on public.nudges;
create policy "nudges read by squad" on public.nudges
  for select using (
    exists (
      select 1 from public.hangouts h
      where h.id = nudges.hangout_id and public.is_squad_member(h.squad_id)
    )
  );

-- =====================================================
-- 4. Bootstrap admins (run manually after first login)
-- =====================================================
-- Once you and Max have signed up via phone OTP, run this to grant admin:
--   update public.users set is_admin = true where phone in ('+61412345678', '+61498765432');
