-- Phase 4: Progression — user badges table

create table public.user_badges (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  badge_id  text not null,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

alter table public.user_badges enable row level security;

create policy "user_badges: own row only"
  on public.user_badges
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
