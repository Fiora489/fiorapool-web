---
milestone: v1.3
name: Ultimate Build Creator + Hub
phases: 53-67
status: planning
created: 2026-04-24
depends_on: [v1.2-prism]
strategy: backend-logic-first; two consolidated UI phases at the end (66 Creator UI, 67 Hub UI) are deferred for later planning
---

# v1.3 — Ultimate Build Creator + Public Build Hub

## Goal

Deliver the most complete browser-based LoL build creator on the web — richer than Mobalytics, OP.gg, or the in-client itemset editor — with a public Build Hub where every build created in FioraPool (web or desktop) is browsable, forkable, and performance-tracked from real match data.

## Success Criteria

1. A user can open `/builds/custom/new` on mobile, build an item set with runes, summoner spells, skill order, matchup notes, conditional swaps, warding tips, and build tags — end-to-end in one session.
2. A user can publish a build; it appears in `/builds/hub` immediately, filterable by champion / role / patch / rank / tag.
3. When the user plays a match whose items match a saved build ≥80%, that match is auto-tagged and the build's WR updates without any manual action.
4. A build one patch out of date shows a visible "stale" banner on its card.
5. Creating, publishing, and forking builds awards XP and can unlock build-related badges.
6. The schema and web API are desktop-ready: the desktop client (later) reads/writes builds through versioned endpoints with API-key auth.

## Feature Inventory (full scope)

### Editor — item composition
- Six item blocks (Starting / Early / Core / Situational / Full Build / Boots)
- Drag-to-reorder inside blocks
- Data-Dragon-backed item picker with search + tag filter
- Power-spike markers per item
- Per-block gold total + full-build gold total
- Auto-calculated final stats (AD, AP, HP, armor, MR, haste, crit, movespeed)
- Conditional item swaps (rule-based: "if enemy ≥2 AP, swap X→Y")
- Warding & trinket recommendation dropdown

### Editor — runes
- Primary tree + keystone + 3 minor slots
- Secondary tree + 2 minor slots
- 3 stat shards (offense / flex / defense)
- Rune Page Library at `/builds/runes` — pages saved standalone and referenced by N builds

### Editor — spells & skills
- 2 summoner spells + alternative note ("swap to Ghost vs X")
- Skill-order 1-18 grid
- Max priority header (Q > E > W)
- Combo list (free-form strings: "Q → W → Auto → E")

### Editor — matchup & meta
- Champion picker (required)
- Role multi-select (TOP / JUNGLE / MID / ADC / SUPPORT)
- Matchup multi-select with per-matchup difficulty (easy / even / hard / counter)
- Per-matchup note + threat list (champs / items to watch)
- Build tags (free-form: `lethality`, `tank-killer`, `poke`, `1v9`)
- Build description / laning notes (markdown)
- Patch tag — auto-stamped on create
- "Last validated on patch X" button — user refreshes staleness clock
- Item block templates — save/reuse a starting block across builds

### Editor — quality & UX
- Build lint warnings (no-MR-vs-AP, missing keystone, too-many-same-damage-type)
- Autosave drafts (5s debounce)
- Undo/redo stack (≥20 steps)
- Dupe detection on save (warn if ≥90% similar to an existing owned build)
- Mobile-first touch UX (long-press drag, swipe-to-reorder, tap-to-add)

### Build Hub — public browsing
- `/builds/hub` — filterable grid with baseline facets (champion, role, patch, tag)
- Build detail page at `/builds/hub/[id]` — public, unauth-friendly
- Creator profile page at `/creators/[username]` — all builds by that user
- Aggregate community WR (opt-in) from match auto-tagging

### Extended Filter & Search (Phase 59)
- Full-text search across name / description / tags / combos / warding note (Postgres `tsvector` + `pg_trgm` for typo tolerance)
- Facet filters (multi-select with AND/OR):
  - Item contains (one or more item ids)
  - Keystone rune
  - Summoner spells pair
  - Has matchup notes against X champion
  - Difficulty rating
  - Rank filter (Diamond+ only, Platinum+, etc.)
  - Champion pool (your champs only)
  - Publication freshness (this patch / last 2 patches / any)
  - Has personal WR vs community WR delta
- Sort: newest / most bookmarked / highest community WR / highest personal WR / highest activity this week / fresh-on-this-patch
- Saved search presets — named queries stored per user
- Trending searches (top queries last 7d, rebuilt nightly)
- Autocomplete on search box (champions, items, tags)
- "Builds similar to this one" on build detail pages (cosine similarity over item vectors)
- URL-as-state — every filter/sort permalinkable, shareable, bookmarkable

### Build Hub — personal shelf
- Bookmark/star other users' builds → `/builds/bookmarked`
- Collections / playlists → `/builds/collections` + detail view

### Performance tracking
- Post-match worker: compare match items path to every build the user owns with that champion; tag match if ≥80% overlap
- Personal build WR on each build card
- Aggregate WR rolls up across all users who played a public build (opt-in)
- Personal build performance history per build

### Patch lifecycle
- Staleness banner — "Built on 14.9 · current 15.2 · may be outdated"
- `/builds/patch-bump` — one screen lists all your builds with items changed this patch; bulk update / dismiss / refresh-last-validated

### Visual / export
- Visual build card PNG (reuses ImageResponse infra from v1.1)
- **Export to League folder** happens on the desktop app (web-side only publishes to DB; desktop reads and writes the .json itemset into the Riot install dir)

### Pre-game
- Pre-game mode at `/builds/custom/[id]/pre-game` — full-screen phone-in-hand view of build + matchup notes + threats + combos + skill order
- (LATER) Champ-select autodetect via spectator-v5 — desktop pushes "player locked X" event; phone surfaces that champ's builds

### Gamification
- Creator XP events hooked into existing `app_progress` system
  - create build +50 XP
  - publish build +100 XP
  - first-to-patch (built within 24h of patch drop) +200 XP
  - build forked by another user +25 XP each
- New badges added to existing chain system
  - "Architect I–V": 1/10/50/100/250 builds created
  - "Influencer": 10 forks on a single build
  - "Patch Responder": 5 builds marked as current-patch within 24h of patch drop

### Utility
- Build diff at `/builds/diff?a=X&b=Y` — side-by-side structural diff

### Desktop sync (web-side API only — desktop client is future work)
- `GET /api/desktop/builds` — list user's builds (JSON)
- `GET /api/desktop/builds/[id]` — single build with full payload
- `POST /api/desktop/match-tags` — desktop pushes detected match plays
- API-key auth (separate from browser session) issued from `/builds/desktop-sync`

## Phase Breakdown

Strategy: domain logic + API first, then consolidated UI. UI phases (66 + 67) are intentionally deferred — they are planned *after* the logic shipping is done so UI design is grounded in working contracts.

| # | Name | Scope | Type |
|---|------|-------|------|
| 53 | Build Creator Foundation | Supabase tables, RLS, types, CRUD actions, minimal `/builds/custom` list | schema + light UI |
| 54 | Editor — Item Composition logic | Items catalogue, stat+gold compute, autosave utility, saveBuildDraft action | logic |
| 55 | Editor — Runes + Spells + Skills logic | Rune tree, spell catalogue, skill-order validator, combos, rune page CRUD actions | logic |
| 56 | Editor — Matchup + Meta logic | Matchup notes, conditional swaps, tags, warding, patch stamp, description sanitizer | logic |
| 57 | Editor — Polish logic | Lint engine, dupe detection, undo/redo stack, block templates | logic |
| 58 | Hub Query Infrastructure | FTS indexes, filter/sort query builder, similarity, saved searches | logic |
| 59 | **Extended Filter + Search** | Typo tolerance, boolean ops, search analytics, trending, facet pre-compute | logic |
| 60 | Hub Social Layer logic | Bookmarks, collections, creator profile data | logic |
| 61 | Performance Tracking | Match auto-tag worker + WR rollup views | logic + worker |
| 62 | Visual Renderer + Diff | `/api/share/build-card` (edge ImageResponse) + `computeBuildDiff` | API + logic |
| 63 | Patch Lifecycle | Patch snapshots, diff, staleness calculator, bump query | logic + worker |
| 64 | Gamification Hooks | XP events + 6 new badge chains + evaluators | logic |
| 65 | Desktop Sync API | `/api/desktop/*` endpoints + API-key auth + pairing page | API + small UI |
| **66** | **Build Creator UI** | Full editor surfaces (items/runes/spells/skills/matchup/polish/pre-game/patch-bump) | **UI — DEFERRED** |
| **67** | **Build Hub UI** | Full hub surfaces (browse/detail/filter/search/social/diff) | **UI — DEFERRED** |

## Out of Scope (this milestone)

- Forking (filter is in, fork is later — per user)
- Comments on builds
- Alternative build variants nested inside one build
- Changelog history per build
- Duplicate/clone within your own builds (fork supersedes this later)
- AI build review / AI suggester / URL-scrape import
- Thumbnail/cover uploads
- "Follow creator" feed
- Champ-select autodetect (needs spectator-v5 desktop bridge)
- Desktop client itself (this milestone ships the web + API; desktop work comes after)

## Data Model Sketch (detailed schema defined in Phase 53)

```
custom_builds (id, user_id, champion_id, name, description_md,
               roles[], build_tags[], patch_tag, last_validated_patch,
               combos[], max_priority, warding_note,
               spell1, spell2, spell_alt_note,
               rune_page_id (FK), skill_order (int[18]),
               is_public, opt_in_aggregate,
               created_at, updated_at)

custom_build_blocks (build_id, block_type, position,
                     items jsonb, power_spikes int[], gold_total)
  -- block_type: starting | early | core | situational | full | boots

custom_matchup_notes (build_id, enemy_champion_id,
                      difficulty, note, threats jsonb)

custom_item_swaps (build_id, condition_text, from_item, to_item)

custom_rune_pages (id, user_id, name, primary_style, keystone,
                   primary_minors int[3], secondary_style, secondary_minors int[2],
                   shards int[3])

build_bookmarks (user_id, build_id, created_at)

build_collections (id, user_id, name, description)
build_collection_items (collection_id, build_id, position)

build_item_block_templates (id, user_id, champion_id,
                             block_type, items jsonb)

build_match_tags (build_id, match_id, user_id, won boolean, detected_at)
  -- generated by post-match worker; powers personal + aggregate WR

build_fork_audit (future — hold for fork milestone)
```

All tables gated by RLS. Public reads on `custom_builds WHERE is_public = true` only.

## Verification Path (end-of-milestone checklist)

- Create a build end-to-end on mobile (≤ 3 min typical)
- Build appears in Hub within 1 reload
- Play a match with items matching build → build WR updates next visit without manual action
- Open a build from 3+ patches ago → staleness banner visible
- Filter Hub by champion pool → only your champions show
- Hit `/api/desktop/builds` with a valid API key → JSON list returns
- 126 + new tests pass; TypeScript 0 errors; ESLint 0 errors on touched files
- Lighthouse LCP on `/builds/hub` ≤ 2.5 s on throttled mobile
