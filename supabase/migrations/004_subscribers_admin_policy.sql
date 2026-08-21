-- neural365 COMMUNITY — Migration 004: Allow Admin to Read Subscribers & Subscriptions
-- Run this in the Supabase SQL editor

-- Allow admins to read all subscribers in the dashboard
drop policy if exists "subscribers: admin select" on subscribers;
create policy "subscribers: admin select"
  on subscribers for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Allow admins to view all subscriptions in the dashboard
drop policy if exists "subscriptions: admin select" on subscriptions;
create policy "subscriptions: admin select"
  on subscriptions for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
