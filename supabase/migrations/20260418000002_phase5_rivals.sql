-- Phase 5: Social & Rivals

create table public.rivals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  puuid      text not null,
  riot_id    text not null,
  region     text not null,
  added_at   timestamptz not null default now(),
  unique(user_id, puuid)
);

alter table public.rivals enable row level security;

create policy "rivals: own row only"
  on public.rivals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
