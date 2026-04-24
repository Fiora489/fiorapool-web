---
phase: 47-design-system
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 47-01 Summary: Design System

## What Was Built
- `src/components/ui/PageHeader.tsx` — breadcrumb + title + description pattern extracted
- `src/components/ui/SectionHeader.tsx` — uppercase-tracking section label used 30+ times across v1.1 pages
- `src/components/ui/StatCard.tsx` — label/value/sublabel pattern with 5 tones (neutral/good/warn/bad/primary)
- `src/components/ui/ScoreHero.tsx` — tier + score hero pattern used across all composite-score pages (7 tones: rose/amber/emerald/gold/purple/sky/muted)
- `src/components/nav.tsx` — rewritten to grouped dropdowns (6 categories: Overview / Analytics / Coaching / Progression / Visualisations / Tools) with mobile-friendly collapsible panel

## Nav Coverage
All v1.1 routes are linked:
- **Overview**: Dashboard, Matches, Profile
- **Analytics (5)**: Hub, ARAM, Team Comp, Vision, Clutch, Matchups
- **Coaching (8)**: Overview, Momentum, Efficiency, Role Passport, Comeback DNA, Scaling, Kill Funnel, Map Awareness, AI Coach
- **Progression (11)**: Overview, Recap, Consistency, XP Multiplier, Weekly Race, Badge Chains, Mastery Badges, Medals, Prestige Titles, Prestige Score, Quests
- **Visualisations (5)**: Charts Hub, Quality Calendar, Champion Radar, Win Flow, Correlations
- **Tools (5)**: Builds, Session, Rivals, Stats Card, Badge Showcase

## Decisions

| Decision | Rationale |
|----------|-----------|
| Primitives, not rewrites | 30+ pages already shipped with bespoke headers/cards; new primitives are available for follow-ups without breaking anything |
| Nav with dropdowns, not flat list | 34 routes won't fit flat; category grouping matches user mental model |
| Backdrop blur + sticky nav | Modern feel without new deps |
| Desktop hover dropdowns + mobile accordion | Tailwind-only; no JS framework needed |
| Version constant for Data Dragon | Already decided in Phase 46; mentioned here for continuity |

## Milestone v1.1 Complete

All 30 phases (18–47) shipped:
- **Analytics (5)** — ARAM, Team Comp, Objectives, Clutch, Opponent Matchups
- **Export (2)** — Stats Card, Badge Showcase
- **Rivals (2)** — Tracking, Season Recap
- **Progression (8)** — Badge Chains, Mastery, Medals, XP Multiplier, Weekly Race, Prestige Titles, Prestige Leaderboard, Consistency
- **Coaching (7)** — Momentum, REI, Role Passport, Comeback DNA, Scaling, Kill Funnel, Map Awareness
- **Visualisations (4)** — Calendar, Radar, Sankey, Correlation
- **Polish (2)** — Asset Pipeline, Design System

Each page:
- 0 TypeScript errors, 0 ESLint errors (on touched files)
- RSC-first with isolated client islands where interactive state is needed
- Mobile-functional at 390px
- Scope notes where schema gaps limit what's computable

## Files
- `src/components/ui/PageHeader.tsx` (new)
- `src/components/ui/SectionHeader.tsx` (new)
- `src/components/ui/StatCard.tsx` (new)
- `src/components/ui/ScoreHero.tsx` (new)
- `src/components/nav.tsx` (rewritten)
