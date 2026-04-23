# FioraPool Web

## What This Is

Browser-based League of Legends companion app bringing full feature parity with the desktop version to any browser, with mobile as the primary target. Covers analytics, AI coaching, badge/XP progression, build engine, rich visualisations, rival tracking, and export — all powered by Riot API and Claude. Solo developer (Bjarke), personal dogfood use first, potentially public later.

## Core Value

League players get the full FioraPool feature set in any browser on mobile, without being tied to the desktop app.

## Current State

| Attribute | Value |
|-----------|-------|
| Type | Application |
| Version | 0.0.0 |
| Status | Initializing |
| Last Updated | 2026-04-17 |

## Requirements

### Core Features

- Match history browsing with full stats, KDA, items, timeline (Riot match-v5, server-side)
- Analytics hub — ARAM, team comp classifier, objectives, clutch factor, opponent quality
- Progression system — app XP, levels, streak, 740 badges (60 chain + 680 mastery), consistency score, prestige titles
- AI post-game coaching — Claude deep analysis with macro / micro / draft tabs; conversational coach; daily brief
- Build engine — champion lookup, recommended builds + runes, matchup-specific adjustments, Claude matchup tips
- Advanced visualisations — Sankey, radar chart, calendar heatmap, correlation matrix
- Export & sharing — stats card PNG (Hero / Scoreboard / Timeline layouts), badge showcase PNG
- Social features — rival tracking, weekly XP race, season leaderboard

### Validated (Shipped)
- Phase 1: Foundation — Auth (magic link), Riot account linking, summoner profile page, edge middleware, `/api/summoner/[puuid]` route. Schema: summoner_profiles, app_progress, app_settings with RLS.

### Active (In Progress)
None yet.

### Planned (Next)
- Phase 2: Match History — Riot match-v5 integration, match list page (paginated, mobile-first), per-match stats, Supabase caching

### Out of Scope

- LCU API / in-client champion select overlay — requires local desktop bridge, deferred to future Tauri/Electron companion
- Pro build scraper (OP.gg / U.gg) — pending ToS clarification; Data Dragon only until resolved
- Community hub (Phase 17) — deferred to final phase, approach TBD (GitHub repo vs Supabase table)

## Target Users

**Primary:** Bjarke (solo developer and primary user)
- League of Legends player on PC and mobile
- Wants coaching, analytics, and progression in one place
- Has used the desktop FioraPool; needs mobile access

**Secondary:** Potentially public once polished — League players who want Claude-powered coaching without a desktop app

## Context

**Business Context:**
No external stakeholders. Personal dogfood project. Production Riot API key requires Riot developer program approval — currently using dev key (100 req/2min).

**Technical Context:**
Desktop FioraPool has 30 live features + 70 planned. This web version is a fresh codebase — no migration from desktop. Supabase project may already exist (to confirm). Riot API and Claude API calls are server-side only, never exposed to the browser.

## Constraints

### Technical Constraints

- Riot API key: server-side env var only — never reaches the browser
- Claude API key: server-side env var only — never reaches the browser
- Supabase RLS: row-level security enforced at DB level on all tables
- Rate limiting: ≤10 Claude AI reviews per user per day
- Riot match-v5 payload stored as JSONB — avoids migration hell as schema evolves
- Dev API key: 100 req/2min (production key requires Riot approval)
- LCU API (champion select): not achievable from a hosted web app — deferred

### Business Constraints

- Solo developer — no team coordination overhead, but also no parallel capacity
- No timeline — quality over speed, ship when phases are done
- Riot production API key approval timeline unknown

### Compliance Constraints

- No payment info stored — low compliance burden
- PII limited to Riot IDs and match data — standard GDPR handling sufficient

## Key Decisions

| Decision | Rationale | Date | Status |
|----------|-----------|------|--------|
| App Router over Pages Router | RSC reduces client bundle for data-heavy analytics pages | 2026-04-17 | Active |
| shadcn/ui + Magic UI over custom components | Speed to ship > bespoke design; Magic UI covers League aesthetic without building animation primitives | 2026-04-17 | Active |
| Recharts over D3 | Handles all required chart types with React-native components; D3 overkill for solo project | 2026-04-17 | Active |
| Route Handlers over tRPC | No overhead for solo project; plain REST is readable and debuggable | 2026-04-17 | Active |
| Riot API server-side only | API key security non-negotiable; no client-side Riot calls ever | 2026-04-17 | Active |
| LCU API deferred | Requires local desktop bridge process; not achievable from hosted web app | 2026-04-17 | Active |
| JSONB for match raw_data | Riot match-v5 payload is large and evolves patch-to-patch | 2026-04-17 | Active |
| Dark mode default | League players expect dark UI; light mode is optional not primary | 2026-04-17 | Active |

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| TypeScript strict | Zero `any` errors | - | Not started |
| Accessibility | WCAG AA | - | Not started |
| Performance | LCP < 2.5s on mobile | - | Not started |
| Security | No API keys in client bundle | - | Not started |
| AI cost control | ≤10 Claude reviews/user/day | - | Not started |

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 14+ App Router | RSC, server actions, Vercel integration |
| Language | TypeScript | Full-stack type safety, strict mode |
| UI primitives | shadcn/ui + Tailwind CSS | Composable, accessible component base |
| UI animation | Magic UI | Shimmer, sparkle, gradient text, animated cards — League aesthetic |
| Charts | Recharts | Sankey, radar, heatmap, correlation matrix, line, bar |
| Backend | Next.js Route Handlers | Collocated with frontend, no extra infra |
| Database | Supabase (Postgres) | RLS, real-time subscriptions, Auth included |
| Auth | Supabase Auth | JWT, native to stack |
| Deployment | Vercel | Zero-config Next.js, automatic preview deploys |
| External APIs | Riot API (match-v5, summoner-v4), Riot Data Dragon, Claude API | All server-side only |

## Links

| Resource | URL |
|----------|-----|
| Repository | TBD (this directory) |
| Production | TBD (Vercel) |
| Supabase | TBD |

---
*PROJECT.md — Updated when requirements or context change*
*Last updated: 2026-04-17*
