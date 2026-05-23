-- HANGOUTS — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run

-- =====================================================
-- 1. WAITLIST (day-one priority)
-- =====================================================
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  phone text,
  source text default 'landing',
  referred_by uuid references public.waitlist(id),
  created_at timestamptz default now()
);

create index if not exists idx_waitlist_email on public.waitlist(email);
create index if not exists idx_waitlist_created on public.waitlist(created_at desc);

-- Allow anon inserts (waitlist is public signup), block reads from public
alter table public.waitlist enable row level security;
create policy "anon can insert waitlist" on public.waitlist for insert to anon with check (true);
-- (No select policy = no public reads. Use service role from server.)

-- =====================================================
-- 2. CORE PRODUCT TABLES (ready for v1 build)
-- =====================================================

-- USERS — synced from Supabase auth.users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  phone text unique,
  name text,
  emoji text default '🦊',
  push_token text,
  google_calendar_token jsonb,
  timezone text default 'Australia/Sydney',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SQUADS — your groups
create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text default '👥',
  created_by uuid references public.users(id),
  sms_number text, -- assigned Twilio number, optional
  open_mode boolean default false, -- v3 discoverability
  created_at timestamptz default now()
);

-- SQUAD_MEMBERS — many-to-many
create table if not exists public.squad_members (
  squad_id uuid references public.squads(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text default 'member', -- 'organiser' | 'member'
  joined_at timestamptz default now(),
  primary key (squad_id, user_id)
);

-- HANGOUTS — proposed/confirmed events
create table if not exists public.hangouts (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid references public.squads(id) on delete cascade,
  organiser_id uuid references public.users(id),
  title text not null,
  emoji text,
  description text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  cost_per_person numeric(10, 2),
  bring text,
  status text default 'proposed', -- proposed | confirmed | happened | cancelled
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_hangouts_squad on public.hangouts(squad_id);
create index if not exists idx_hangouts_starts on public.hangouts(starts_at);

-- RSVPS — per-user response to a hangout
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  hangout_id uuid references public.hangouts(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  status text default 'pending', -- pending | in | maybe | out
  response_method text, -- app | sms | email | calendar
  responded_at timestamptz,
  created_at timestamptz default now(),
  unique (hangout_id, user_id)
);

create index if not exists idx_rsvps_hangout on public.rsvps(hangout_id);
create index if not exists idx_rsvps_user on public.rsvps(user_id);

-- NUDGES — every message the agent sends
create table if not exists public.nudges (
  id uuid primary key default gen_random_uuid(),
  hangout_id uuid references public.hangouts(id) on delete cascade,
  user_id uuid references public.users(id),
  channel text, -- push | sms
  tone_level int default 1, -- 1=gentle → 5=spicy
  message text,
  sent_at timestamptz default now(),
  responded_at timestamptz,
  response_latency_seconds int
);

create index if not exists idx_nudges_user on public.nudges(user_id);
create index if not exists idx_nudges_hangout on public.nudges(hangout_id);

-- EXPENSES (v2 scaffold for the Bali problem)
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  hangout_id uuid references public.hangouts(id) on delete cascade,
  fronted_by uuid references public.users(id),
  total_amount numeric(10, 2),
  currency text default 'AUD',
  description text,
  created_at timestamptz default now()
);

create table if not exists public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references public.expenses(id) on delete cascade,
  user_id uuid references public.users(id),
  amount_owed numeric(10, 2),
  paid boolean default false,
  paid_at timestamptz,
  stripe_payment_intent_id text
);

-- =====================================================
-- 3. SQUAD STATS — materialised view
-- =====================================================
create or replace view public.squad_stats as
select
  sm.squad_id,
  sm.user_id,
  u.name,
  u.emoji,
  -- Reply rate: responded RSVPs / total RSVPs
  coalesce(
    round(100.0 * count(r.id) filter (where r.responded_at is not null) /
    nullif(count(r.id), 0), 0),
    0
  )::int as reply_rate,
  -- Pay rate: paid splits / total splits  
  coalesce(
    round(100.0 * count(es.id) filter (where es.paid) /
    nullif(count(es.id), 0), 0),
    100
  )::int as pay_rate,
  count(r.id) as total_hangouts
from public.squad_members sm
join public.users u on u.id = sm.user_id
left join public.hangouts h on h.squad_id = sm.squad_id
left join public.rsvps r on r.hangout_id = h.id and r.user_id = sm.user_id
left join public.expenses e on e.hangout_id = h.id
left join public.expense_splits es on es.expense_id = e.id and es.user_id = sm.user_id
group by sm.squad_id, sm.user_id, u.name, u.emoji;

-- Done. Test with:
-- select * from waitlist;
-- select * from squad_stats where squad_id = '...';
