-- Phase 13: Session Discipline

create table public.sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz,
  goal_type       text not null,   -- 'wins' | 'games' | 'lp'
  goal_target     integer not null,
  champion_lock   text,
  role_lock       text,
  starting_lp     integer,
  ending_lp       integer,
  games_at_start  integer not null default 0,
  wins_at_start   integer not null default 0,
  notes           text,
  active          boolean not null default true
);

alter table public.sessions enable row level security;
create policy "sessions: own row only"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
