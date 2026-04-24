-- Phase 12: Progression Extensions

-- Daily login tracking
create table public.daily_logins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  login_date date not null default current_date,
  xp_awarded integer not null default 0,
  unique(user_id, login_date)
);

alter table public.daily_logins enable row level security;
create policy "daily_logins: own row only"
  on public.daily_logins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Weekly quests (3 per week, auto-assigned)
create table public.weekly_quests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  week_start  date not null,           -- monday of the week
  quest_id    text not null,           -- e.g. "win_3"
  target      integer not null,
  progress    integer not null default 0,
  completed   boolean not null default false,
  xp_reward   integer not null default 0,
  unique(user_id, week_start, quest_id)
);

alter table public.weekly_quests enable row level security;
create policy "weekly_quests: own row only"
  on public.weekly_quests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
