---
phase: 67-build-hub-ui
plan: deferred
type: ui-consolidation
depends_on: [58-01, 59-01, 60-01, 61-01, 62-01, 64-01]
scope: full UI build
status: DEFERRED — to be planned after phases 53-65 ship
---

# Phase 67 — Build Hub UI (DEFERRED)

**This phase is intentionally unplanned.** The plan will be written after the Hub query infrastructure (Phase 58), extended filter/search (Phase 59), social layer (Phase 60), performance tracking (Phase 61), and visual renderer (Phase 62) have shipped. Design decisions will be informed by the real query contract + actual facet response shapes.

## What this phase will cover (scope placeholder)

- `/builds/hub` — public browse grid with sticky search bar + filter sidebar
- `/builds/hub/[id]` — public build detail page with social meta tags (uses Phase 62 build-card for `og:image`)
- Search bar with autocomplete (champions / items / tags)
- Filter sidebar: champion, role, patch, tag, keystone, spell pair, contains-item, matchup filters, difficulty, rank-floor, champion-pool toggle, freshness
- Sort dropdown: newest / most-bookmarked / aggregate-WR / activity-7d / fresh-on-patch
- Saved-searches drawer (list, load, rename, delete)
- Trending widget (searches + builds, 7d window)
- "Builds like this" rail on detail pages
- Bookmark button on every build card (optimistic)
- `/builds/bookmarked` — personal bookmark shelf
- `/builds/collections` + `/builds/collections/[id]` — collection grid + detail with reorder drag
- `/creators/[username]` — creator profile page
- Aggregate + personal WR badges on build cards (wired to Phase 61 helpers)
- Build diff page `/builds/diff?a=...&b=...` rendering Phase 62's `computeBuildDiff`
- URL-as-state: every filter + sort permalinkable, shareable, back-button-friendly
- Empty states, loading skeletons, error states per view
- Mobile-first: filter sidebar becomes bottom sheet; sticky search bar
- v1.2 Prism integration (MagicCard on build cards, SparklesText on high-WR builds, Marquee of trending on hub home)

## Out of scope (for this UI phase)

- The Creator editor surfaces — see Phase 66
- Any schema or domain-logic changes — those land in Phases 53–65

## Planning trigger

Write the full 67-01-PLAN.md when:
1. Phases 58–62 + 64 are all marked Complete in STATE.md
2. The Hub query contract (types + facets + URL-state helpers) is stable and tested
3. User approval to proceed to Hub UI build
