# FioraPool Web

> Browser-based League of Legends companion app — full feature parity with the desktop version, mobile-first, powered by Riot API + Claude.

**Type:** Application
**Stack:** Next.js 14+ App Router · TypeScript · Supabase · Vercel
**Skill Loadout:** ui-ux-pro-max, paul:audit, frontend-design, claude-api
**Quality Gates:** TypeScript strict (zero `any`), WCAG AA, LCP < 2.5s mobile, no keys in client bundle, ≤10 Claude reviews/user/day

---

## Overview

FioraPool is a full-featured League of Legends companion (30 live features, 70 planned) currently running as a desktop app. This web version brings the entire feature set — analytics, AI coaching, badge progression, build engine, and rich visualisations — to any browser, with mobile as the primary target.

Solo developer (Bjarke). Personal dogfood use first, potentially public later. No existing tool combines Claude-powered coaching, a deep badge/progression system, and rich analytics in a single browser app.

---

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14+ App Router | RSC, server actions, Vercel integration |
| Language | TypeScript | Full-stack type safety |
| UI | shadcn/ui + Magic UI + Tailwind CSS | Composable primitives + animated/polished League-aesthetic components |
| Charts | Recharts | React-native, handles Sankey, radar, heatmap, correlation matrix |
| Backend | Next.js Route Handlers | Sufficient for solo, collocated, no extra infra |
| Database | Supabase (Postgres) | RLS, real-time, Auth included |
| Auth | Supabase Auth | JWT, native to stack |
| Deploy | Vercel | Zero-config Next.js, automatic preview deploys |

**Security invariants:** Riot API key and Claude API key are server-side env vars only — never reach the browser. Dark mode default.

---

## Architecture

### Data Model

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| User | id, email | Supabase Auth |
| SummonerProfile | user_id, puuid, riot_id, region, summoner_level, last_synced | One per user |
| AppProgress | user_id, xp, level, streak, prestige_title, consistency_score | Gamification state |
| Badge | user_id, badge_id, chain_id, earned_at, type | 60 chain + 680 mastery badges, stored as badge_id strings |
| Match | puuid, match_id, region, game_mode, timestamp, raw_data (JSONB), cached_at | raw_data = full match-v5 payload |
| MatchStats | match_id, puuid, kills, deaths, assists, cs, vision, damage, items (JSONB) | Computed from raw_data |
| AIReview | match_id, user_id, review_text, macro_analysis, micro_analysis, draft_analysis | Nullable, created on request |
| Session | user_id, started_at, ended_at, xp_earned, activity_type | |
| Rival | user_id, rival_puuid, rival_riot_id, tracked_since | |
| AppSettings | user_id, theme, accent_champion, colour_blind_mode, ui_scale, accessibility_prefs (JSONB) | |

RLS enabled on all tables. JSONB for match payloads avoids migration hell as Riot's schema evolves.

### API Surface

| Route | Methods | Auth | Purpose |
|-------|---------|------|---------|
| `/api/summoner/link` | POST | required | Link Riot account via PUUID/Riot ID |
| `/api/summoner/[puuid]` | GET | required | Fetch + sync summoner profile |
| `/api/matches` | GET | required | Paginated match history (cached) |
| `/api/matches/[matchId]` | GET | required | Single match detail + stats |
| `/api/matches/[matchId]/review` | POST | required | Claude AI review (rate-limited) |
| `/api/analytics/[type]` | GET | required | ARAM, team comp, objectives, clutch, etc. |
| `/api/progress` | GET, PATCH | required | XP, level, streak, prestige |
| `/api/badges` | GET | required | Earned badges + chains |
| `/api/builds/[champion]` | GET | required | Build + rune recommendations |
| `/api/champions/[id]` | GET | public | Champion data (Data Dragon, cached) |
| `/api/rivals` | GET, POST, DELETE | required | Rival tracking |
| `/api/settings` | GET, PATCH | required | Theme, accessibility, preferences |

### External Integrations

| Integration | Auth | Purpose |
|------------|------|---------|
| Riot API (match-v5, summoner-v4, spectator-v5) | API key (env var) | Match data, summoner profile |
| Riot Data Dragon | None | Champion assets, item icons, abilities |
| Claude API | API key (env var) | Post-game review, coaching, conversational coach |
| Supabase | Anon key (public) + service role (server) | Auth, DB, real-time |
| Obsidian (Phase 17) | Vault path | Match notes, daily note inject |
| Community Hub (Phase 17) | GitHub token | Build/guide sharing |

---

## UI/UX

### Key Views

| View | Complexity |
|------|------------|
| Home / Dashboard — coaching-first hero, recent match, XP bar, daily brief | High |
| Profile — summoner info, app level, prestige title, consistency score | Medium |
| Match History — paginated, filter by mode/champion/outcome | Medium |
| Match Detail — full stats, KDA, items, timeline, AI review tab | High |
| Analytics Hub — ARAM, team comp, objectives, clutch factor, opponent quality | High |
| Badge Collection — 740 badges, chains, mastery progress | High |
| Progression — XP, level, streak, leaderboard, weekly race | Medium |
| Champion Hub — search, stats, abilities, builds, matchup tips | High |
| Build Engine — recommended build + runes, matchup adjustments | Medium |
| AI Coach — post-game deep analysis, macro/micro/draft tabs, daily tip | High |
| Visualisations — Sankey, radar, calendar heatmap, correlation matrix | High |
| Session Planner — LP goal, role/champion lock-in | Medium |
| Settings — theme, accessibility, account, Riot link | Low |

Mobile-first. All views fully functional in portrait on phone. Supabase real-time for XP/badge updates post-match.

---

## Deployment

**Local:**
```bash
next dev          # Next.js on :3000
supabase start    # Local Supabase (DB + Auth + Studio)
```
`.env.local`: `RIOT_API_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Production:** Vercel (auto-deploy on push to `main`) + Supabase managed instance. Env vars in Vercel dashboard, never committed.

---

## Implementation Phases

| Phase | Focus | Testable Outcome |
|-------|-------|-----------------|
| 1 | Foundation — Auth, Riot account linking, summoner profile | Log in, link Riot account, see summoner profile |
| 2 | Match History — match-v5 integration, list + detail, caching | Recent games load on mobile with KDA/items |
| 3 | Core Analytics — ARAM, team comp classifier, objectives, clutch factor | Analytics pages populate with real data |
| 4 | Progression Core — XP, levels, streak, 740 badges, consistency score | Play games, earn XP, unlock badges |
| 5 | Social & Rivals — rival tracking, prestige titles, weekly XP race | Add rival, compare performance |
| 6 | Export & Sharing — stats card PNG, badge showcase PNG | Download a stats card from a real match |
| 7 | Deep Coaching Analytics — momentum, resource efficiency, role passport, comeback DNA | Each metric populates from match data |
| 8 | Advanced Visualisations — calendar heatmap, radar, Sankey, correlation matrix | All four charts render on mobile |
| 9 | AI Post-Game Analysis — Claude deep analysis, macro/micro/draft tabs | AI review live on a real match |
| 10 | Build Engine — champion lookup, pro builds, matchup recommender | Search champion, get build + advice |
| 11 | AI Coaching — daily brief, behavioural telemetry, conversational coach | Ask coach anything, get real answer |
| 12 | Progression Extensions — tilt tracker, weekly quests, battle-pass, skill tree | Complete weekly quest, earn reward |
| 13 | Session Discipline — session planner, LP goal tracker, role/champ lock-in | Set LP goal, track progress |
| 14 | Theming — per-champion accent colour system, custom theme editor | Switch Fiora theme, verify propagation |
| 15 | Accessibility — WCAG AA keyboard nav, colour-blind palettes, screen-reader | Navigate full app via keyboard |
| 16 | Platform — PWA, offline mode, LCP < 2.5s, nav audit | Install as PWA, Lighthouse pass |
| 17 | Integrations — Obsidian match notes, community hub (GitHub-backed) | Match note auto-injected in Obsidian |

---

## Design Decisions

1. **App Router over Pages Router** — RSC reduces client bundle for data-heavy analytics pages.
2. **shadcn/ui + Magic UI over custom** — Speed to ship > bespoke design at this stage; Magic UI covers League aesthetic without building animation primitives.
3. **Recharts over D3** — Handles all required chart types with React-native components; D3 is overkill for a solo project.
4. **Route Handlers over tRPC** — No tRPC overhead; plain REST is readable and sufficient.
5. **Riot API server-side only** — API key security is non-negotiable; no client-side Riot calls ever.
6. **LCU API deferred** — Champion select assistant requires a local desktop bridge; parked until a companion Tauri/Electron app is warranted.
7. **JSONB for match raw_data** — Riot's match-v5 payload is large and evolves patch-to-patch; avoids migration hell while allowing computed columns.
8. **Dark mode default** — League players expect dark UI; light mode is optional.

---

## Open Questions

1. Riot API rate limits — dev key is 100 req/2min. Production key requires Riot approval. When to apply?
2. Claude API cost at scale — 10 reviews/user/day cap set, but what's the monthly budget ceiling?
3. Pro build scraper (Phase 10) — scraping OP.gg/U.gg may violate ToS. Use Data Dragon only or an approved source?
4. PWA offline scope (Phase 16) — which views are worth caching? Match history only, or analytics too?
5. Community hub (Phase 17) — public GitHub repo or FioraPool-hosted Supabase table?

---

## References

- `04-projects/fiorapool-v5/planning/league-features-roadmap.md` — full feature roadmap (Tier 0/1/2)
- `04-projects/fiorapool-v5/planning/capability-spec-claude-league.md` — Claude capability specs per feature
- `05-knowledge/research/active/riot-api-licensing-2026.md` — Riot API ToS research
- [Riot Developer Portal](https://developer.riotgames.com/)
- [Magic UI](https://magicui.design/)
- [shadcn/ui](https://ui.shadcn.com/)
