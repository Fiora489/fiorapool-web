---
phase: 66-build-creator-ui
plan: deferred
type: ui-consolidation
depends_on: [54-01, 55-01, 56-01, 57-01, 62-01, 63-01, 64-01, 65-01]
scope: full UI build
status: DEFERRED — to be planned after phases 53-65 ship
---

# Phase 66 — Build Creator UI (DEFERRED)

**This phase is intentionally unplanned.** The plan will be written after the domain logic in Phases 54–57 (editor) + Phase 62 (visual renderer) + Phase 63 (patch lifecycle) + Phase 65 (desktop pairing) has shipped, so the UI design can be grounded in the real, working contract rather than speculation.

## What this phase will cover (scope placeholder)

- `/builds/custom/new` + `/builds/custom/[id]/edit` — full editor shell
- Champion picker, role multi-select
- 6 item blocks with drag-to-reorder, item picker dialog, power-spike markers
- Live stat panel + gold sum UI
- Rune page editor + `/builds/runes` library screens
- Summoner spell picker + alternative note
- 18-slot skill order grid + max priority + combos editor
- Matchup multi-select + per-matchup card + threat list + conditional swap builder
- Build tags input, warding dropdown, markdown description editor, patch stamp buttons
- Lint panel, dupe detection dialog, undo/redo controls, template manager
- Download-PNG button (calls Phase 62 endpoint)
- Pre-game mode route `/builds/custom/[id]/pre-game`
- Patch-bump screen `/builds/patch-bump`
- Mobile-first UX (long-press drag, swipe reorder, touch targets ≥ 44 px)
- Autosave indicator + save-state toasts
- Integration with v1.2 Prism design system (MagicCard, ShimmerButton, TextAnimate, champion-reactive theming)

## Out of scope (for this UI phase)

- Public Build Hub surfaces — see Phase 67
- Any schema or domain-logic changes — those land in Phases 53–65

## Planning trigger

Write the full 66-01-PLAN.md when:
1. Phases 54–57 + 62 + 63 + 65 are all marked Complete in STATE.md
2. The API contract surfaces (types + server actions) are stable and tested
3. User approval to proceed to Creator UI build
