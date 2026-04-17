# FioraPool Web

> Browser-based League of Legends companion app — full feature parity with the desktop version, mobile-first, powered by Riot API + Claude.

**Created:** 2026-04-17
**Type:** Application
**Stack:** Next.js (App Router) + TypeScript + Supabase + Vercel
**Skill Loadout:** ui-ux-pro-max, paul:audit, frontend-design, claude-api
**Quality Gates:** test coverage, security scan, WCAG AA accessibility, LCP < 2.5s

---

## Problem Statement

FioraPool is a full-featured League of Legends companion app (30 live features, 70 planned) currently running as a desktop application. The desktop version is inaccessible on mobile. This web version brings the full feature set — analytics, progression, AI coaching, build engine, visualisations, and more — to any browser, with mobile as the primary target. Solo developer (Bjarke), personal dogfood use first, potentially public later.

Build vs buy: no existing tool combines Claude-powered coaching, a deep badge/progression system, and rich analytics in a single browser app.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend framework | Next.js 14+ App Router | RSC, server actions, excellent Vercel integration |
| Language | TypeScript | Type safety across full stack |
| UI library | shadcn/ui + Magic UI + Tailwind CSS | shadcn for composable primitives, Magic UI for animated/polished components matching League aesthetic |
| Charts | Recharts | React-native, composable, handles complex charts (Sankey, radar, correlation matrix) |
| Backend | Next.js Route Handlers | Sufficient for solo project, collocated with frontend, no extra infra |
| Database | Supabase (Postgres) | Already set up, RLS, real-time, Auth included |
| Auth | Supabase Auth | Native to stack, handles JWT, social logins possible |
| Deployment | Vercel | Zero-config for Next.js, automatic preview deploys |

### Notes
- Riot API calls are **server-side only** — API key never reaches the browser
- Claude API calls are **server-side only** — key never reaches the browser
- Dark mode default — League aesthetic, high-contrast dashboards
- LCU API (champion select, in-client overlay) is **deferred** — requires a local desktop bridge process, not achievable from a hosted web app

---

## Data Model

### Entities

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| User | id, email, created_at | Supabase Auth; has one SummonerProfile, AppProgress, AppSettings |
| SummonerProfile | user_id, puuid, riot_id, region, summoner_level, last_synced | Belongs to User; has many Matches |
| AppProgress | user_id, xp, level, streak, prestige_title, consistency_score | Belongs to User |
| Badge | user_id, badge_id, chain_id, earned_at, type (chain/mastery/season/medal) | Belongs to User |
| Match | puuid, match_id, region, game_mode, timestamp, raw_data (JSONB), cached_at | Linked to SummonerProfile |
| MatchStats | match_id, puuid, kills, deaths, assists, cs, vision, damage, items (JSONB), full_stats (JSONB) | Belongs to Match |
| AIReview | match_id, user_id, review_text, macro_analysis, micro_analysis, draft_analysis, created_at | Belongs to Match, nullable |
| Session | user_id, started_at, ended_at, xp_earned, activity_type | Belongs to User |
| Rival | user_id, rival_puuid, rival_riot_id, tracked_since | Belongs to User |
| AppSettings | user_id, theme, accent_champion, colour_blind_mode, ui_scale, accessibility_prefs (JSONB) | Belongs to User |

### Notes
- `raw_data` and `full_stats` stored as JSONB — Riot API match-v5 payload is large and evolves
- RLS enabled on all tables — users access only their own rows
- Match cache invalidation: re-fetch if `cached_at` > 1 hour old for recent matches
- Badge system: 60 chain badges (10 chains), 680 champion mastery badges — stored as badge_id strings, not rows per badge type

---

## API Surface

### Auth Strategy
Supabase Auth (JWT). Session managed client-side via `@supabase/ssr`. All Route Handlers validate session before touching data.

### Route Groups

| Group | Methods | Auth | Purpose |
|-------|---------|------|---------|
| `/api/summoner/link` | POST | required | Link Riot account via PUUID/Riot ID |
| `/api/summoner/[puuid]` | GET | required | Fetch + sync summoner profile from Riot API |
| `/api/matches` | GET | required | Paginated match history (cached) |
| `/api/matches/[matchId]` | GET | required | Single match detail + stats |
| `/api/matches/[matchId]/review` | POST | required | Request Claude AI review (rate-limited) |
| `/api/analytics/[type]` | GET | required | ARAM, team comp, objectives, clutch, etc. |
| `/api/progress` | GET, PATCH | required | App XP, level, streak, prestige |
| `/api/badges` | GET | required | User earned badges + chains |
| `/api/builds/[champion]` | GET | required | Build + rune recommendations |
| `/api/champions/[id]` | GET | public | Champion data (from Data Dragon, cached) |
| `/api/rivals` | GET, POST, DELETE | required | Rival tracking |
| `/api/settings` | GET, PATCH | required | Theme, accessibility, preferences |

### Internal vs External
- **Public:** `/api/champions/[id]` (static Data Dragon data, no auth needed)
- **All others:** authenticated via Supabase session
- **External integrations:** Riot API (server-side), Claude API (server-side), Data Dragon CDN (champion assets)

---

## Deployment Strategy

### Local Development
```
next dev          # Next.js on :3000
supabase start    # Local Supabase stack (DB + Auth + Studio)
```
`.env.local` holds: `RIOT_API_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Production
- **Vercel** — automatic deploys on push to `main`, preview deploys on PRs
- **Supabase** — managed hosted instance, connection pooling via Supabase's built-in pooler
- **Env vars** — set in Vercel dashboard, never committed
- **CI** — Vercel's built-in CI is sufficient for solo; add GitHub Actions if test suite grows

---

## Security Considerations

- **Riot API key:** server-side env var only, called exclusively from Route Handlers — never reaches the browser
- **Claude API key:** same treatment as Riot key
- **Supabase RLS:** row-level security on all tables — enforced at DB level, not just app level
- **Rate limiting on AI routes:** `/api/matches/[matchId]/review` rate-limited per user (e.g. 10 reviews/day) to control Claude API costs
- **Input validation:** all Route Handler inputs validated before DB or external API calls (match IDs, PUUID format, champion IDs)
- **OWASP:** main risks are IDOR (mitigated by RLS + session checks) and API key leakage (mitigated by server-only calls)
- **No PII beyond Riot ID:** app stores Riot IDs and match data, no payment info, no sensitive personal data

---

## UI/UX Needs

### Design System
shadcn/ui (composable primitives) + Magic UI (animated components — shimmer, sparkle, gradient text, animated cards) + Tailwind CSS. Dark mode default. Per-champion accent colour themes unlocked in Phase 14.

### Key Views / Pages

| View | Purpose | Complexity |
|------|---------|------------|
| Home / Dashboard | Coaching-first hero, recent match, XP bar, daily brief | High |
| Profile | Summoner info, app level, prestige title, consistency score | Medium |
| Match History | Paginated list, filter by mode/champion/outcome | Medium |
| Match Detail | Full stats, KDA, items, timeline, AI review tab | High |
| Analytics Hub | ARAM, team comp, objectives, clutch factor, opponent quality | High |
| Badge Collection | All 740 badges, chains, mastery progress | High |
| Progression | XP, level, streak, leaderboard, weekly race | Medium |
| Champion Hub | Search, stats, abilities, builds, matchup tips | High |
| Build Engine | Champion → recommended build, runes, matchup adjustments | Medium |
| AI Coach | Post-game deep analysis, macro/micro/draft tabs, daily tip | High |
| Visualisations | Sankey, radar, calendar, correlation matrix | High |
| Session Planner | LP goal, session plan, role/champ lock-in | Medium |
| Settings | Theme, accessibility, account, Riot link | Low |

### Real-Time Requirements
- XP/badge updates after match sync: Supabase real-time subscriptions
- No WebSocket requirement beyond that — polling acceptable for match history

### Responsive Needs
Mobile-first. All views must be fully functional on a phone in portrait mode. Desktop gets wider layouts and expanded data density where appropriate.

---

## Integration Points

| Integration | Type | Purpose | Auth |
|------------|------|---------|------|
| Riot API (match-v5, summoner-v4, spectator-v5) | REST, server-side | Match data, summoner profile, live game | API key (env var) |
| Riot Data Dragon | CDN, public | Champion assets, item icons, ability data | None |
| Claude API (Anthropic) | REST, server-side | AI post-game review, coaching tips, conversational coach | API key (env var) |
| Supabase | SDK | Auth, database, real-time | Anon key (public) + service role (server) |
| Obsidian (Phase 17) | Local file / plugin | Match notes, daily note inject, champion notes | Vault path |
| Community Hub (Phase 17) | GitHub API | Build/guide sharing, community browser | GitHub token |

---

## Phase Breakdown

### Phase 1: Foundation
- **Build:** Supabase project setup, Next.js app scaffold, Supabase Auth (email + magic link), Riot account linking (PUUID + Riot ID), summoner profile page, summoner level display
- **Testable:** Log in, link Riot account, see summoner profile with level
- **Outcome:** Working authenticated app with Riot identity

### Phase 2: Match History
- **Build:** Riot match-v5 integration (server-side), match list page, per-match stats page, post-game summary, match caching in Supabase
- **Testable:** Recent games load with KDA, CS, items, win/loss on mobile
- **Outcome:** Core match history browsing works on phone

### Phase 3: Core Analytics
- **Build:** ARAM analytics, 6-archetype team composition classifier, void grubs & objectives tracker, clutch factor metric, opponent quality tracker
- **Testable:** Analytics pages populate with real match data
- **Outcome:** First layer of insight beyond raw stats

### Phase 4: Progression Core
- **Build:** App XP system, app level, streak tracking, badge chains (60 badges / 10 chains), champion mastery badges (680), season medals, XP multiplier visualiser, consistency score
- **Testable:** Play games, earn XP, level up, badges unlock
- **Outcome:** Core gamification loop is live

### Phase 5: Social & Rivals
- **Build:** Rival tracking (search + add summoner), season recap, prestige titles, prestige leaderboard, weekly XP race
- **Testable:** Add a rival, view their recent performance vs yours
- **Outcome:** Competitive layer added

### Phase 6: Export & Sharing
- **Build:** Stats card PNG generator (Hero / Scoreboard / Timeline layouts), badge showcase PNG export
- **Testable:** Generate and download a stats card from a real match
- **Outcome:** Shareable content for social media

### Phase 7: Deep Coaching Analytics
- **Build:** Momentum tracker, resource efficiency index, role passport, comeback DNA, late-game scaling score, kill funnelling detection, map awareness score
- **Testable:** Each metric populates correctly from match history data
- **Outcome:** Deep per-metric coaching data available

### Phase 8: Advanced Visualisations
- **Build:** Game quality calendar (heatmap), champion radar chart, win condition flow (Sankey), stat correlation matrix
- **Testable:** All four charts render correctly with real data on mobile
- **Outcome:** Visual analytics tier complete

### Phase 9: AI Post-Game Analysis
- **Build:** Claude post-game deep analysis engine, /post-game route with tabs (overview / macro / micro / draft), coaching-first home hero rebuild, macro analyzer, micro analyzer, draft analyzer, peer cohort benchmarks
- **Testable:** Request AI review on a real match, get macro/micro/draft breakdown
- **Outcome:** Claude coaching is live — flagship differentiator

### Phase 10: Build Engine
- **Build:** Champion knowledge lookup, build + rune suggestions, pro build scraper, meta build cache, matchup-specific build recommender, Claude-driven matchup tips
- **Testable:** Search a champion, get current recommended build + matchup advice
- **Outcome:** Pre-game preparation tools complete

### Phase 11: AI Coaching
- **Build:** Daily brief / coaching tip, constructive coaching tone renderer, behavioural success telemetry (weakness tracking), personalized micro-lessons, conversational coach (open-ended Claude Q&A)
- **Testable:** Ask the coach anything about your recent performance, get a real answer
- **Outcome:** Full Claude coaching suite live

### Phase 12: Progression Extensions
- **Build:** Tilt / mental tracker, weekly quest system, streak reward system, seasonal battle-pass track, milestone achievements, skill-tree progression view, calendar / heatmap view, daily login reward
- **Testable:** Complete a weekly quest, earn a battle-pass reward
- **Outcome:** Deep progression meta-game live

### Phase 13: Session Discipline
- **Build:** Session planner, LP goal tracker, role / champion lock-in
- **Testable:** Set an LP goal, lock in a champion for the session, track progress
- **Outcome:** Session structure and discipline tooling complete

### Phase 14: Theming
- **Build:** Per-champion accent themes (colour system per champion), custom theme editor
- **Testable:** Switch to Fiora theme, verify accent colours propagate across all views
- **Outcome:** Visual personalisation layer complete

### Phase 15: Accessibility
- **Build:** Full keyboard navigation (WCAG AA), colour-blind palettes, UI scaling slider, screen-reader pass (NVDA)
- **Testable:** Navigate full app via keyboard only; verify with colour-blind simulation
- **Outcome:** WCAG AA compliant

### Phase 16: Platform
- **Build:** Cloud sync verification (Supabase), PWA manifest + offline mode (service worker for cached views), performance budget (LCP < 2.5s, TTI < 3s), nav consolidation audit, backward-compat tests
- **Testable:** Install as PWA on phone, verify offline mode, run Lighthouse audit
- **Outcome:** Production-grade platform reliability

### Phase 17: Integrations
- **Build:** Obsidian integration (match notes injection, daily note, champion notes), community hub browser (GitHub-backed build/guide sharing)
- **Testable:** Play a game, find a match note auto-injected into Obsidian daily note
- **Outcome:** Vault and community integrations live

---

## Skill Loadout & Quality Gates

### Skills Used During Build

| Skill | When It Fires | Purpose |
|-------|--------------|---------|
| frontend-design | Phases 1, 9, 14 | Component quality, League aesthetic, Magic UI patterns |
| ui-ux-pro-max | All frontend phases | Design system consistency, mobile-first validation |
| claude-api | Phases 9, 11 | Claude API integration, prompt caching, cost optimisation |
| paul:audit | End of each milestone | Architecture review, scope creep check |

### Quality Gates

| Gate | Threshold | When |
|------|-----------|------|
| TypeScript strict | Zero `any` errors | Each phase |
| Accessibility | WCAG AA | Phases with new UI |
| Performance | LCP < 2.5s on mobile | Phase 16 + spot checks |
| Security | No keys in client bundle | Each phase |
| AI cost | ≤ 10 Claude reviews/user/day | Phase 9 onwards |

---

## Design Decisions

1. **App Router over Pages Router:** RSC reduces client bundle size for data-heavy analytics pages. Better for this app's complexity ceiling.
2. **shadcn/ui + Magic UI over pure custom:** Speed to ship > bespoke design at this stage. Magic UI covers the League aesthetic without building animation primitives from scratch.
3. **Recharts over D3:** D3 is overkill for solo dev. Recharts handles all required chart types (Sankey via recharts-sankey or visx, radar, line, bar, heatmap) with React-native components.
4. **Route Handlers over tRPC:** No tRPC overhead for a solo project. Plain REST is readable, debuggable, and sufficient.
5. **Riot API server-side only:** API key security is non-negotiable. No client-side Riot calls ever.
6. **LCU API deferred:** Champion select assistant and in-client overlay require a local desktop bridge. Parked until a companion Tauri/Electron app is warranted.
7. **JSONB for match raw_data:** Riot's match-v5 payload is large and evolves patch-to-patch. Storing raw JSON avoids migration hell while still allowing computed columns.
8. **Dark mode default:** League players expect dark UI. Light mode is optional, not primary.

---

## Open Questions

1. Riot API rate limits — standard dev key is 100 req/2min. Production key requires Riot approval. When to apply?
2. Claude API cost at scale — per-user daily review cap set at 10, but what's the budget ceiling per month?
3. Pro build scraper (Phase 10) — scraping OP.gg/U.gg may violate ToS. Use an approved data source or Data Dragon only?
4. PWA offline scope (Phase 16) — which views are worth caching offline? Match history only, or analytics too?
5. Community hub (Phase 17) — GitHub-backed sharing: public repo, or FioraPool-hosted Supabase table?

---

## Next Actions

- [ ] Scaffold Next.js app with App Router + TypeScript + Tailwind + shadcn/ui
- [ ] Install Magic UI
- [ ] Set up Supabase project (or confirm existing), run initial migration for Phase 1 schema
- [ ] Add Riot API key to env, write `/api/summoner/link` route handler
- [ ] Build summoner profile page (Phase 1 complete)

---

## References

- `04-projects/fiorapool-v5/planning/league-features-roadmap.md` — full feature roadmap (Tier 0/1/2)
- `04-projects/fiorapool-v5/planning/capability-spec-claude-league.md` — Claude capability specs per feature
- `05-knowledge/research/active/riot-api-licensing-2026.md` — Riot API ToS research (ADR pending)
- `05-knowledge/research/active/tauri-2x-production-patterns-2026.md` — Tauri patterns (future desktop bridge reference)
- [Riot Developer Portal](https://developer.riotgames.com/)
- [LCU API Docs (community)](https://hextechdocs.dev/)
- [Magic UI](https://magicui.design/)
- [shadcn/ui](https://ui.shadcn.com/)

---

*Last updated: 2026-04-17*
