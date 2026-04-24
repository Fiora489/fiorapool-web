-- Phase 9: AI match reviews (cache + rate limit)

create table public.match_reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  game_id     bigint not null,
  overview    text,
  macro       text,
  micro       text,
  draft       text,
  created_at  timestamptz not null default now(),
  unique(user_id, game_id)
);

alter table public.match_reviews enable row level security;

create policy "match_reviews: own row only"
  on public.match_reviews
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
