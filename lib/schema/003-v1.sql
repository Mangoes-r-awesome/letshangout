-- HANGOUTS — Migration 003: v1 spine
-- Run AFTER schema-002-auth.sql. Idempotent.

-- =====================================================
-- 1. User preferences
-- =====================================================
alter table public.users add column if not exists theme_preference text default 'dark';
alter table public.users add column if not exists has_completed_onboarding boolean default false;
alter table public.users add column if not exists push_subscription jsonb;

-- =====================================================
-- 2. Hangouts: extra fields for the full creation form
-- =====================================================
alter table public.hangouts add column if not exists cover_emoji text default '🍻';
alter table public.hangouts add column if not exists last_nudge_at timestamptz;

-- Make RSVPs auto-create for all squad members when a hangout is created
-- via a function we call from the API; no schema change needed for that.

-- =====================================================
-- 3. Nudges: track trigger source + tone
-- =====================================================
alter table public.nudges add column if not exists triggered_by text default 'manual';
alter table public.nudges add column if not exists triggered_by_user uuid references public.users(id);

-- =====================================================
-- 4. Partnership signups (the EatClub coming-soon flow)
-- =====================================================
create table if not exists public.partnership_signups (
  id uuid primary key default gen_random_uuid(),
  business_name text,
  contact_name text,
  email text not null,
  phone text,
  vendor_type text, -- 'restaurant' | 'experience' | 'venue' | 'other'
  message text,
  user_id uuid references public.users(id), -- if signed in
  created_at timestamptz default now()
);

create index if not exists idx_partnership_signups_email on public.partnership_signups(email);

alter table public.partnership_signups enable row level security;
drop policy if exists "anon can insert partnership" on public.partnership_signups;
create policy "anon can insert partnership" on public.partnership_signups
  for insert to anon, authenticated with check (true);

-- =====================================================
-- 5. Stats view — updated to be more efficient
-- =====================================================
drop view if exists public.squad_stats cascade;

create or replace view public.squad_stats as
select
  sm.squad_id,
  sm.user_id,
  u.name,
  u.emoji,
  coalesce(
    round(100.0 * count(r.id) filter (where r.status in ('in', 'maybe', 'out')) /
    nullif(count(r.id), 0), 0),
    0
  )::int as reply_rate,
  coalesce(
    round(100.0 * count(es.id) filter (where es.paid) /
    nullif(count(es.id), 0), 0),
    100
  )::int as pay_rate,
  count(r.id) filter (where r.status = 'in') as confirms,
  count(r.id) as total_rsvps
from public.squad_members sm
join public.users u on u.id = sm.user_id
left join public.hangouts h on h.squad_id = sm.squad_id
left join public.rsvps r on r.hangout_id = h.id and r.user_id = sm.user_id
left join public.expenses e on e.hangout_id = h.id
left join public.expense_splits es on es.expense_id = e.id and es.user_id = sm.user_id
group by sm.squad_id, sm.user_id, u.name, u.emoji;

-- View RLS inherits from underlying tables.

-- Done. Verify:
-- select column_name from information_schema.columns where table_name = 'users';
-- select * from squad_stats limit 5;
