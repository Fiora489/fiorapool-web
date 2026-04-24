-- Phase 1: Foundation Schema
-- Tables: summoner_profiles, app_progress, app_settings
-- Auth users are managed by Supabase Auth (auth.users)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- SUMMONER PROFILES
-- ─────────────────────────────────────────────
create table public.summoner_profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  puuid       text not null,
  riot_id     text not null,  -- e.g. "Fiora489#EUW"
  region      text not null,  -- e.g. "euw1"
  summoner_level integer,
  last_synced timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id),
  unique(puuid)
);

-- ─────────────────────────────────────────────
-- APP PROGRESS
-- ─────────────────────────────────────────────
create table public.app_progress (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  xp                integer not null default 0,
  level             integer not null default 1,
  streak            integer not null default 0,
  prestige_title    text,
  consistency_score numeric(5,2) default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(user_id)
);

-- ─────────────────────────────────────────────
-- APP SETTINGS
-- ─────────────────────────────────────────────
create table public.app_settings (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  theme               text not null default 'dark',
  accent_champion     text,
  colour_blind_mode   boolean not null default false,
  ui_scale            numeric(3,2) not null default 1.0,
  accessibility_prefs jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(user_id)
);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger summoner_profiles_updated_at
  before update on public.summoner_profiles
  for each row execute function public.handle_updated_at();

create trigger app_progress_updated_at
  before update on public.app_progress
  for each row execute function public.handle_updated_at();

create trigger app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.summoner_profiles enable row level security;
alter table public.app_progress      enable row level security;
alter table public.app_settings      enable row level security;

-- summoner_profiles: users access only their own row
create policy "summoner_profiles: own row only"
  on public.summoner_profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- app_progress: users access only their own row
create policy "app_progress: own row only"
  on public.app_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- app_settings: users access only their own row
create policy "app_settings: own row only"
  on public.app_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
