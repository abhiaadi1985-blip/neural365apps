-- neural365 COMMUNITY — Migration 006: Subscribe Email RPC
-- Run this in the Supabase SQL editor

-- This function is called by /api/subscribe to insert or update a subscriber.
-- Uses upsert on email to handle re-subscriptions (e.g. topic changes).
-- Runs as SECURITY DEFINER so it bypasses RLS (the API route validates input).

create or replace function subscribe_email(p_email text, p_topics text[])
returns void as $$
begin
  insert into subscribers (email, subscribed_topics)
  values (p_email, p_topics)
  on conflict (email)
  do update set subscribed_topics = excluded.subscribed_topics;
end;
$$ language plpgsql security definer;
