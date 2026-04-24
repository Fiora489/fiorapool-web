-- Phase 53: Build Creator Foundation
-- Creates 10 tables + RLS for the v1.3 Ultimate Build Creator + Hub milestone.

-- 1. Rune pages (created first — custom_builds FK to this)
create table public.custom_rune_pages (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  primary_style     smallint not null,
  keystone          integer not null,
  primary_minors    integer[] not null,
  secondary_style   smallint not null,
  secondary_minors  integer[] not null,
  shards            smallint[] not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint custom_rune_pages_primary_minors_len check (array_length(primary_minors, 1) = 3),
  constraint custom_rune_pages_secondary_minors_len check (array_length(secondary_minors, 1) = 2),
  constraint custom_rune_pages_shards_len check (array_length(shards, 1) = 3)
);

create index custom_rune_pages_user_idx on public.custom_rune_pages (user_id, updated_at desc);

-- 2. Core custom_builds row
create table public.custom_builds (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  champion_id            text not null,
  name                   text not null,
  description_md         text not null default '',
  roles                  text[] not null default '{}',
  build_tags             text[] not null default '{}',
  patch_tag              text not null,
  last_validated_patch   text,
  combos                 text[] not null default '{}',
  max_priority           text,
  warding_note           text,
  trinket                text,
  spell1                 text,
  spell2                 text,
  spell_alt_note         text,
  rune_page_id           uuid references public.custom_rune_pages(id) on delete set null,
  skill_order            smallint[],
  is_public              boolean not null default false,
  opt_in_aggregate       boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint custom_builds_name_not_empty check (char_length(trim(name)) > 0),
  constraint custom_builds_skill_order_len check (
    skill_order is null or array_length(skill_order, 1) = 18
  )
);

create index custom_builds_user_updated_idx
  on public.custom_builds (user_id, updated_at desc);
create index custom_builds_public_champion_idx
  on public.custom_builds (champion_id, is_public)
  where is_public = true;
create index custom_builds_public_patch_idx
  on public.custom_builds (patch_tag)
  where is_public = true;

-- 3. Item blocks (one row per block type per build)
create table public.custom_build_blocks (
  build_id     uuid not null references public.custom_builds(id) on delete cascade,
  block_type   text not null,
  position     smallint not null default 0,
  items        jsonb not null default '[]'::jsonb,
  power_spikes smallint[] not null default '{}',
  gold_total   integer not null default 0,
  primary key (build_id, block_type),
  constraint custom_build_blocks_type_check check (
    block_type in ('starting','early','core','situational','full','boots')
  )
);

-- 4. Matchup notes (one per enemy champion per build)
create table public.custom_matchup_notes (
  build_id            uuid not null references public.custom_builds(id) on delete cascade,
  enemy_champion_id   text not null,
  difficulty          text not null default 'even',
  note                text not null default '',
  threats             jsonb not null default '[]'::jsonb,
  primary key (build_id, enemy_champion_id),
  constraint custom_matchup_notes_difficulty_check check (
    difficulty in ('easy','even','hard','counter')
  )
);

-- 5. Conditional item swaps
create table public.custom_item_swaps (
  id              uuid primary key default gen_random_uuid(),
  build_id        uuid not null references public.custom_builds(id) on delete cascade,
  condition_text  text not null,
  from_item       integer not null,
  to_item         integer not null,
  position        smallint not null default 0,
  created_at      timestamptz not null default now(),
  constraint custom_item_swaps_distinct check (from_item <> to_item)
);

create index custom_item_swaps_build_idx on public.custom_item_swaps (build_id, position);

-- 6. Bookmarks
create table public.build_bookmarks (
  user_id     uuid not null references auth.users(id) on delete cascade,
  build_id    uuid not null references public.custom_builds(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, build_id)
);

create index build_bookmarks_build_idx on public.build_bookmarks (build_id);

-- 7. Collections
create table public.build_collections (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  description  text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint build_collections_name_not_empty check (char_length(trim(name)) > 0)
);

create index build_collections_user_idx on public.build_collections (user_id, updated_at desc);

-- 8. Collection <-> build join
create table public.build_collection_items (
  collection_id  uuid not null references public.build_collections(id) on delete cascade,
  build_id       uuid not null references public.custom_builds(id) on delete cascade,
  position       smallint not null default 0,
  added_at       timestamptz not null default now(),
  primary key (collection_id, build_id)
);

create index build_collection_items_collection_idx
  on public.build_collection_items (collection_id, position);

-- 9. Item block templates (saveable per-champion starting/early/etc. presets)
create table public.build_item_block_templates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  champion_id  text not null,
  block_type   text not null,
  items        jsonb not null default '[]'::jsonb,
  name         text not null default '',
  created_at   timestamptz not null default now(),
  constraint build_item_block_templates_type_check check (
    block_type in ('starting','early','core','situational','full','boots')
  )
);

create index build_item_block_templates_user_champ_idx
  on public.build_item_block_templates (user_id, champion_id);

-- 10. Match tags (populated by Phase 61 worker)
create table public.build_match_tags (
  build_id     uuid not null references public.custom_builds(id) on delete cascade,
  match_id     text not null,
  user_id      uuid not null references auth.users(id) on delete cascade,
  won          boolean not null,
  detected_at  timestamptz not null default now(),
  primary key (build_id, match_id)
);

create index build_match_tags_user_build_idx
  on public.build_match_tags (user_id, build_id, detected_at desc);

-- ==========================================================================
-- RLS
-- ==========================================================================

alter table public.custom_rune_pages           enable row level security;
alter table public.custom_builds               enable row level security;
alter table public.custom_build_blocks         enable row level security;
alter table public.custom_matchup_notes        enable row level security;
alter table public.custom_item_swaps           enable row level security;
alter table public.build_bookmarks             enable row level security;
alter table public.build_collections           enable row level security;
alter table public.build_collection_items      enable row level security;
alter table public.build_item_block_templates  enable row level security;
alter table public.build_match_tags            enable row level security;

-- Rune pages: owner-only
create policy "custom_rune_pages: owner all"
  on public.custom_rune_pages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Builds: owner full; anyone can SELECT public rows
create policy "custom_builds: owner all"
  on public.custom_builds for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "custom_builds: public read"
  on public.custom_builds for select
  using (is_public = true);

-- Child-table reads: owner OR (build is public)
create policy "custom_build_blocks: owner rw, public read"
  on public.custom_build_blocks for all
  using (
    exists (
      select 1 from public.custom_builds b
      where b.id = custom_build_blocks.build_id
        and (b.user_id = auth.uid() or b.is_public = true)
    )
  )
  with check (
    exists (
      select 1 from public.custom_builds b
      where b.id = custom_build_blocks.build_id
        and b.user_id = auth.uid()
    )
  );

create policy "custom_matchup_notes: owner rw, public read"
  on public.custom_matchup_notes for all
  using (
    exists (
      select 1 from public.custom_builds b
      where b.id = custom_matchup_notes.build_id
        and (b.user_id = auth.uid() or b.is_public = true)
    )
  )
  with check (
    exists (
      select 1 from public.custom_builds b
      where b.id = custom_matchup_notes.build_id
        and b.user_id = auth.uid()
    )
  );

create policy "custom_item_swaps: owner rw, public read"
  on public.custom_item_swaps for all
  using (
    exists (
      select 1 from public.custom_builds b
      where b.id = custom_item_swaps.build_id
        and (b.user_id = auth.uid() or b.is_public = true)
    )
  )
  with check (
    exists (
      select 1 from public.custom_builds b
      where b.id = custom_item_swaps.build_id
        and b.user_id = auth.uid()
    )
  );

-- Bookmarks: owner-only
create policy "build_bookmarks: owner all"
  on public.build_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Collections: owner-only (public collections are a future feature)
create policy "build_collections: owner all"
  on public.build_collections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "build_collection_items: owner via collection"
  on public.build_collection_items for all
  using (
    exists (
      select 1 from public.build_collections c
      where c.id = build_collection_items.collection_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.build_collections c
      where c.id = build_collection_items.collection_id
        and c.user_id = auth.uid()
    )
  );

-- Block templates: owner-only
create policy "build_item_block_templates: owner all"
  on public.build_item_block_templates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Match tags: owner-only writes; reads allowed to build owner OR if build is public
create policy "build_match_tags: owner writes"
  on public.build_match_tags for insert
  with check (auth.uid() = user_id);

create policy "build_match_tags: owner delete"
  on public.build_match_tags for delete
  using (auth.uid() = user_id);

create policy "build_match_tags: owner or public build read"
  on public.build_match_tags for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.custom_builds b
      where b.id = build_match_tags.build_id
        and b.is_public = true
    )
  );

-- ==========================================================================
-- updated_at trigger for tables that need it
-- ==========================================================================

create or replace function public.tg_builds_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_custom_builds_updated_at
  before update on public.custom_builds
  for each row execute function public.tg_builds_set_updated_at();

create trigger trg_custom_rune_pages_updated_at
  before update on public.custom_rune_pages
  for each row execute function public.tg_builds_set_updated_at();

create trigger trg_build_collections_updated_at
  before update on public.build_collections
  for each row execute function public.tg_builds_set_updated_at();
