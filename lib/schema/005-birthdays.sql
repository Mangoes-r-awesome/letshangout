-- HANGOUTS — Migration 005: birthdays
-- Run AFTER schema-004-deeplinks.sql. Idempotent.
--
-- Adds an optional birthday field to users. Collected during onboarding
-- (skippable) and surfaced as an "Upcoming birthdays" section on the
-- squad page (members with birthdays in the next 30 days).

alter table public.users add column if not exists birthday date;

-- Partial index speeds up the "upcoming birthdays" query without bloating
-- rows that never set one. The actual upcoming-N-days query computes the
-- next occurrence in app code (handles year-rollover cleanly).
create index if not exists idx_users_birthday on public.users(birthday) where birthday is not null;
