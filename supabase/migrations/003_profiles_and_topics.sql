-- neural365 COMMUNITY — Migration 003: Profiles & Subscriber Topics
-- Run this in the Supabase SQL editor

-- ─── Profiles table (linked to auth.users) ─────────────────────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'handson_user' check (role in ('admin', 'handson_user')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Users can read their own profile
create policy "profiles: owner read"
  on profiles for select using (id = (select auth.uid()));

-- Service role can do everything
create policy "profiles: service role all"
  on profiles for all using ((select auth.role()) = 'service_role');

-- ─── Auto-create profile on auth sign-up ────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'handson_user');
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists to allow re-running
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Add subscribed_topics to subscribers ───────────────────────────────────
alter table subscribers
  add column if not exists subscribed_topics text[] not null
  default array['d365-fo', 'dataverse-power-platform', 'copilot-ai-agents', 'industry-solutions'];
