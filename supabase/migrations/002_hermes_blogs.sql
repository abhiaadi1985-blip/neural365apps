-- Add columns to support the new Hermes long-form blog and demo pipeline,
-- as well as the editorial review queue.

alter table pulse_items
add column status text not null default 'draft' check (status in ('draft', 'media_pending', 'live')),
add column content_md text,
add column demo_scenario_md text;

-- Allow admins to insert and update pulse items
create policy "pulse_items: admin all"
  on pulse_items for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
