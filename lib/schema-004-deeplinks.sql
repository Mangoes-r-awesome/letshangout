-- HANGOUTS — Migration 004: deep links + cross-channel confirms
-- Run AFTER schema-003-v1.sql. Idempotent.

-- =====================================================
-- 1. Short codes on hangouts for /h/XXXX deep links
-- =====================================================
alter table public.hangouts add column if not exists short_code text;
create unique index if not exists idx_hangouts_short_code on public.hangouts(short_code);

-- Backfill existing rows with random codes (avoiding lookalikes 0/O, 1/I/l)
update public.hangouts
set short_code = (
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', floor(random() * 31)::int + 1, 1), '')
  from generate_series(1, 4)
)
where short_code is null;

-- Make NOT NULL going forward
alter table public.hangouts alter column short_code set not null;

-- Verify with: select id, title, short_code from hangouts limit 5;
