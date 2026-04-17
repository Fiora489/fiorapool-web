# Roadmap: FioraPool Web

## Overview

FioraPool Web builds from a working authenticated shell through analytics and progression, into AI coaching and deep insight, then engagement features, and finally production-grade polish. Each milestone ships a usable slice. Phase 1 is playable on mobile; Phase 17 is Obsidian-integrated and PWA-ready.

## Milestones

| Version | Name | Phases | Status | Completed |
|---------|------|--------|--------|-----------|
| v0.1 | Foundation | 1–2 | 📋 Planned | - |
| v0.2 | Core Product | 3–5 | 📋 Planned | - |
| v0.3 | Deep Analytics | 6–8 | 📋 Planned | - |
| v0.4 | AI Suite | 9–11 | 📋 Planned | - |
| v0.5 | Engagement & Polish | 12–14 | 📋 Planned | - |
| v1.0 | Production Ready | 15–17 | 📋 Planned | - |

## 📋 Active Milestone: v0.1 Foundation

**Goal:** Working authenticated app — log in, link Riot account, browse match history on mobile.
**Status:** Not started
**Progress:** [░░░░░░░░░░] 0%

## Phases

| Phase | Name | Plans | Status | Completed |
|-------|------|-------|--------|-----------|
| 1 | Foundation | TBD | Not started | - |
| 2 | Match History | TBD | Not started | - |
| 3 | Core Analytics | TBD | Not started | - |
| 4 | Progression Core | TBD | Not started | - |
| 5 | Social & Rivals | TBD | Not started | - |
| 6 | Export & Sharing | TBD | Not started | - |
| 7 | Deep Coaching Analytics | TBD | Not started | - |
| 8 | Advanced Visualisations | TBD | Not started | - |
| 9 | AI Post-Game Analysis | TBD | Not started | - |
| 10 | Build Engine | TBD | Not started | - |
| 11 | AI Coaching | TBD | Not started | - |
| 12 | Progression Extensions | TBD | Not started | - |
| 13 | Session Discipline | TBD | Not started | - |
| 14 | Theming | TBD | Not started | - |
| 15 | Accessibility | TBD | Not started | - |
| 16 | Platform | TBD | Not started | - |
| 17 | Integrations | TBD | Not started | - |

## Phase Details

### Phase 1: Foundation

**Goal:** Working authenticated app with Riot identity — log in, link Riot account, see summoner profile with level.
**Depends on:** Nothing (first phase)
**Research:** Likely (Supabase Auth setup, Riot account linking flow, PUUID validation)

**Scope:**
- Supabase project setup + initial schema migration
- Next.js app scaffold (App Router, TypeScript, Tailwind, shadcn/ui, Magic UI)
- Supabase Auth (email + magic link)
- Riot account linking (PUUID + Riot ID input + validation)
- Summoner profile page (level, region, last synced)
- `/api/summoner/link` and `/api/summoner/[puuid]` route handlers

**Plans:**
- [ ] 01-01: Project scaffold + Supabase schema
- [ ] 01-02: Auth flow + summoner profile page
- [ ] 01-03: Riot account linking + `/api/summoner` routes

### Phase 2: Match History

**Goal:** Recent games load on mobile with KDA, CS, items, win/loss — match data cached in Supabase.
**Depends on:** Phase 1 (authenticated app, summoner profile)
**Research:** Likely (Riot match-v5 API structure, caching strategy, JSONB schema)

**Scope:**
- Riot match-v5 integration (server-side)
- Match list page (paginated, mobile-first)
- Per-match stats page (KDA, CS, items, timeline)
- Post-game summary component
- Match caching in Supabase (cached_at, invalidation logic)
- `/api/matches` and `/api/matches/[matchId]` route handlers

**Plans:**
- [ ] 02-01: Match-v5 integration + caching schema
- [ ] 02-02: Match list + per-match detail pages
- [ ] 02-03: Post-game summary + mobile polish

### Phase 3: Core Analytics

**Goal:** Analytics pages populate with real match data — ARAM, team comp, objectives, clutch factor.
**Depends on:** Phase 2 (match data cached in Supabase)
**Research:** Likely (team comp classifier algorithm, clutch factor metric definition)

**Scope:**
- ARAM analytics
- 6-archetype team composition classifier
- Void grubs & objectives tracker
- Clutch factor metric
- Opponent quality tracker
- `/api/analytics/[type]` route handler

**Plans:**
- [ ] 03-01: Analytics data layer + `/api/analytics` route
- [ ] 03-02: ARAM + team comp + objectives pages
- [ ] 03-03: Clutch factor + opponent quality pages

### Phase 4: Progression Core

**Goal:** Play games, earn XP, level up, unlock badges — core gamification loop live.
**Depends on:** Phase 2 (match data), Phase 3 (analytics for consistency score)
**Research:** Unlikely (internal XP system, badge schema already defined)

**Scope:**
- App XP system + app level
- Streak tracking
- Badge chains (60 badges / 10 chains) + champion mastery badges (680)
- Season medals
- XP multiplier visualiser
- Consistency score
- `/api/progress` and `/api/badges` route handlers

**Plans:**
- [ ] 04-01: XP + level + streak system
- [ ] 04-02: Badge system (chains + mastery)
- [ ] 04-03: Progress page + consistency score

### Phase 5: Social & Rivals

**Goal:** Add a rival, view their recent performance vs yours.
**Depends on:** Phase 4 (progression + prestige titles)
**Research:** Unlikely (rival tracking is CRUD + Riot API lookup)

**Scope:**
- Rival tracking (search + add summoner by Riot ID)
- Season recap
- Prestige titles
- Prestige leaderboard
- Weekly XP race
- `/api/rivals` route handler

**Plans:**
- [ ] 05-01: Rival tracking + `/api/rivals`
- [ ] 05-02: Leaderboard + weekly XP race + prestige titles

### Phase 6: Export & Sharing

**Goal:** Generate and download a stats card from a real match.
**Depends on:** Phase 2 (match data), Phase 4 (badges)
**Research:** Likely (PNG generation from React — canvas vs. Satori/html-to-image)

**Scope:**
- Stats card PNG generator (Hero / Scoreboard / Timeline layouts)
- Badge showcase PNG export

**Plans:**
- [ ] 06-01: PNG generation implementation (library selection + proof of concept)
- [ ] 06-02: Stats card layouts + badge showcase export

### Phase 7: Deep Coaching Analytics

**Goal:** Each metric populates correctly from match history data.
**Depends on:** Phase 2 (match data), Phase 3 (core analytics)
**Research:** Likely (metric definitions — momentum tracker, resource efficiency index)

**Scope:**
- Momentum tracker
- Resource efficiency index
- Role passport
- Comeback DNA
- Late-game scaling score
- Kill funnelling detection
- Map awareness score

**Plans:**
- [ ] 07-01: Metric computation layer (server-side)
- [ ] 07-02: Momentum + resource efficiency + role passport pages
- [ ] 07-03: Comeback DNA + scaling score + kill funnel + map awareness pages

### Phase 8: Advanced Visualisations

**Goal:** All four charts render correctly with real data on mobile.
**Depends on:** Phase 7 (deep coaching data)
**Research:** Likely (Recharts Sankey — may need recharts-sankey or visx)

**Scope:**
- Game quality calendar (heatmap)
- Champion radar chart
- Win condition flow (Sankey diagram)
- Stat correlation matrix

**Plans:**
- [ ] 08-01: Calendar heatmap + radar chart
- [ ] 08-02: Sankey diagram + correlation matrix

### Phase 9: AI Post-Game Analysis

**Goal:** Request AI review on a real match, get macro/micro/draft breakdown.
**Depends on:** Phase 2 (match data), Phase 7 (deep analytics for context)
**Research:** Likely (Claude prompt design, rate limiting implementation, peer cohort benchmarks)

**Scope:**
- Claude post-game deep analysis engine
- `/api/matches/[matchId]/review` route (rate-limited, ≤10/user/day)
- Match detail AI review tab (overview / macro / micro / draft)
- Coaching-first home hero rebuild
- Macro / micro / draft analyzers
- Peer cohort benchmarks

**Plans:**
- [ ] 09-01: Claude review route + rate limiting
- [ ] 09-02: AI review tab UI (macro / micro / draft)
- [ ] 09-03: Coaching-first home hero + peer benchmarks

### Phase 10: Build Engine

**Goal:** Search a champion, get current recommended build + matchup advice.
**Depends on:** Phase 1 (champion data from Data Dragon cached)
**Research:** Likely (pro build data source — OP.gg/U.gg ToS TBD; may fall back to Data Dragon only)

**Scope:**
- Champion knowledge lookup
- Build + rune suggestions
- Pro build scraper (if ToS permits) or meta build cache
- Matchup-specific build recommender
- Claude-driven matchup tips
- `/api/builds/[champion]` and `/api/champions/[id]` route handlers

**Plans:**
- [ ] 10-01: Champion data layer + Data Dragon integration
- [ ] 10-02: Build + rune recommendations + matchup recommender
- [ ] 10-03: Claude matchup tips integration

### Phase 11: AI Coaching

**Goal:** Ask the coach anything about your recent performance, get a real answer.
**Depends on:** Phase 9 (AI review data), Phase 7 (deep coaching data)
**Research:** Likely (conversational coach context management, behavioural telemetry schema)

**Scope:**
- Daily brief / coaching tip
- Constructive coaching tone renderer
- Behavioural success telemetry (weakness tracking)
- Personalized micro-lessons
- Conversational coach (open-ended Claude Q&A)

**Plans:**
- [ ] 11-01: Daily brief + coaching tip generation
- [ ] 11-02: Weakness telemetry + micro-lessons
- [ ] 11-03: Conversational coach UI + context management

### Phase 12: Progression Extensions

**Goal:** Complete a weekly quest, earn a battle-pass reward.
**Depends on:** Phase 4 (core progression), Phase 5 (social)
**Research:** Unlikely (internal gamification system extension)

**Scope:**
- Tilt / mental tracker
- Weekly quest system
- Streak reward system
- Seasonal battle-pass track
- Milestone achievements
- Skill-tree progression view
- Calendar / heatmap view
- Daily login reward

**Plans:**
- [ ] 12-01: Weekly quests + streak rewards + daily login
- [ ] 12-02: Battle-pass track + milestone achievements
- [ ] 12-03: Skill tree + calendar heatmap + tilt tracker

### Phase 13: Session Discipline

**Goal:** Set an LP goal, lock in a champion for the session, track progress.
**Depends on:** Phase 4 (progression), Phase 2 (match data for LP tracking)
**Research:** Unlikely (internal session planning — no new external APIs)

**Scope:**
- Session planner
- LP goal tracker
- Role / champion lock-in

**Plans:**
- [ ] 13-01: Session planner + LP goal tracker
- [ ] 13-02: Role / champion lock-in + session summary

### Phase 14: Theming

**Goal:** Switch to Fiora theme, verify accent colours propagate across all views.
**Depends on:** All UI phases complete (accurate test coverage)
**Research:** Unlikely (CSS custom properties + Tailwind config)

**Scope:**
- Per-champion accent themes (colour system per champion)
- Custom theme editor

**Plans:**
- [ ] 14-01: Champion accent colour system (CSS tokens + Tailwind)
- [ ] 14-02: Custom theme editor UI

### Phase 15: Accessibility

**Goal:** Navigate full app via keyboard only; verify with colour-blind simulation.
**Depends on:** All UI phases (full surface to audit)
**Research:** Unlikely (WCAG AA — established standards)

**Scope:**
- Full keyboard navigation (WCAG AA)
- Colour-blind palettes
- UI scaling slider
- Screen-reader pass (NVDA)

**Plans:**
- [ ] 15-01: Keyboard navigation audit + fixes
- [ ] 15-02: Colour-blind palettes + UI scaling + screen-reader pass

### Phase 16: Platform

**Goal:** Install as PWA on phone, verify offline mode, run Lighthouse audit (LCP < 2.5s).
**Depends on:** All phases (full app to optimize)
**Research:** Likely (service worker strategy, Vercel edge config, bundle analysis)

**Scope:**
- Cloud sync verification (Supabase)
- PWA manifest + offline mode (service worker for cached views)
- Performance budget (LCP < 2.5s, TTI < 3s)
- Nav consolidation audit
- Backward-compat tests

**Plans:**
- [ ] 16-01: PWA manifest + service worker + offline caching
- [ ] 16-02: Performance audit + bundle optimization (LCP < 2.5s)
- [ ] 16-03: Nav audit + backward-compat tests

### Phase 17: Integrations

**Goal:** Play a game, find a match note auto-injected into Obsidian daily note.
**Depends on:** Phase 2 (match data), Phase 4 (progression)
**Research:** Likely (Obsidian local REST API, GitHub API for community hub)

**Scope:**
- Obsidian integration (match notes injection, daily note, champion notes)
- Community hub browser (GitHub-backed build/guide sharing)

**Plans:**
- [ ] 17-01: Obsidian integration (match note + daily note inject)
- [ ] 17-02: Community hub browser (GitHub-backed)

---
*Roadmap created: 2026-04-17*
*Last updated: 2026-04-17*
