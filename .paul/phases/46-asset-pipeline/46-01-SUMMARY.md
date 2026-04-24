---
phase: 46-asset-pipeline
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 46-01 Summary: Asset Pipeline

## What Was Built
- `src/lib/ddragon.ts` extended with:
  - `championSplashUrl(id)` — versionless splash CDN
  - `championLoadingUrl(id)` — loading-screen art
  - `itemIconUrl(id, version)`, `summonerSpellIconUrl(id, version)`
  - `championKeyFromName(name)` — maps display names → Data Dragon keys with override table for irregular names (Wukong → MonkeyKing, Kai'Sa → Kaisa, Dr. Mundo → DrMundo, etc.)
- `src/components/ui/ChampionIcon.tsx` — client component, rounded, onError-fallback to initials, 5 size variants
- `src/components/ui/ChampionSplash.tsx` — absolute-positioned splash-art background with opacity prop
- `src/components/ui/ItemIcon.tsx` — square item icon with fallback
- `DEFAULT_DDRAGON_VERSION = '14.9.1'` constant; components accept version prop for override

## Adoption Proof
- `src/app/(app)/visualisations/radar/ChampionPicker.tsx` — renders ChampionIcon next to picker
- `src/components/coaching/role-passport/RoleDetailCard.tsx` — champion lists render with icons

## Decisions
- Client component for icons (onError handling + lazy loading)
- Hard-coded default version (bump manually on patch refresh)
- Override map for ~20 known Data Dragon name quirks; automatic punctuation stripping for the rest
- Kept existing raw `<img>` usage (eslint-disabled `@next/next/no-img-element`) — Next/Image optimization not worth the complexity for external-CDN icons

## Deferred
- **Auto-version-fetch** — would add a revalidate-layer hook; acceptable tradeoff to keep components sync
- **Broader adoption** across all pages — foundation is ready; rollout belongs to Phase 47 design pass & future iterations

## Files
- `src/lib/ddragon.ts` (extended)
- `src/components/ui/ChampionIcon.tsx` (new)
- `src/components/ui/ChampionSplash.tsx` (new)
- `src/components/ui/ItemIcon.tsx` (new)
- `src/app/(app)/visualisations/radar/ChampionPicker.tsx` (updated)
- `src/components/coaching/role-passport/RoleDetailCard.tsx` (updated)
