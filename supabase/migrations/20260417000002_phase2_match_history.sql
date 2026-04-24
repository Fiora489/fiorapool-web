-- Phase 2: Match History
-- Tables: matches, match_stats

-- ─────────────────────────────────────────────
-- MATCHES (cached Riot match-v5 payloads)
-- ─────────────────────────────────────────────
create table public.matches (
  id          uuid primary key default uuid_generate_v4(),
  match_id    text not null,          -- Riot match ID e.g. "EUW1_7654321"
  puuid       text not null,          -- linked summoner PUUID
  region      text not null,
  game_mode   text,                   -- e.g. "ARAM", "CLASSIC"
  game_type   text,                   -- e.g. "MATCHED_GAME"
  timestamp   timestamptz not null,
  raw_data    jsonb not null,         -- full match-v5 payload
  cached_at   timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique(match_id, puuid)
);

-- ─────────────────────────────────────────────
-- MATCH STATS (computed per-player stats)
-- ─────────────────────────────────────────────
create table public.match_stats (
  id              uuid primary key default uuid_generate_v4(),
  match_id        text not null,
  puuid           text not null,
  champion_id     integer,
  champion_name   text,
  kills           integer not null default 0,
  deaths          integer not null default 0,
  assists         integer not null default 0,
  cs              integer not null default 0,           -- creep score
  vision_score    integer not null default 0,
  damage_dealt    integer not null default 0,
  gold_earned     integer not null default 0,
  win             boolean not null default false,
  items           jsonb not null default '[]'::jsonb,  -- item IDs array
  full_stats      jsonb not null default '{}'::jsonb,  -- full participant stats from Riot
  created_at      timestamptz not null default now(),
  unique(match_id, puuid),
  foreign key (match_id, puuid) references public.matches(match_id, puuid) on delete cascade
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
create index matches_puuid_timestamp_idx on public.matches(puuid, timestamp desc);
create index matches_game_mode_idx       on public.matches(game_mode);
create index match_stats_champion_idx    on public.match_stats(champion_name);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.matches     enable row level security;
alter table public.match_stats enable row level security;

-- Users access only their own matches (matched via their PUUID stored in summoner_profiles)
create policy "matches: own puuid only"
  on public.matches for all
  using (
    puuid in (
      select puuid from public.summoner_profiles where user_id = auth.uid()
    )
  )
  with check (
    puuid in (
      select puuid from public.summoner_profiles where user_id = auth.uid()
    )
  );

create policy "match_stats: own puuid only"
  on public.match_stats for all
  using (
    puuid in (
      select puuid from public.summoner_profiles where user_id = auth.uid()
    )
  )
  with check (
    puuid in (
      select puuid from public.summoner_profiles where user_id = auth.uid()
    )
  );
