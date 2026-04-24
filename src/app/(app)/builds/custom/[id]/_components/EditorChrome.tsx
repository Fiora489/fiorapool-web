'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { AutosaveState } from '@/lib/builds/autosave'

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

export type EditorPage = 'items' | 'tech' | 'skills' | 'meta'

const PAGES: Array<{ id: EditorPage; label: string; step: string }> = [
  { id: 'items',  label: 'Items & Path',    step: 'Step 1 of 4' },
  { id: 'tech',   label: 'Runes',           step: 'Step 2 of 4' },
  { id: 'skills', label: 'Skills & Spells', step: 'Step 3 of 4' },
  { id: 'meta',   label: 'Matchup & Meta',  step: 'Step 4 of 4' },
]

const PAGE_GUIDES: Record<EditorPage, { heading: string; blurb: string }> = {
  items:  { heading: 'Pick your items and build path',    blurb: 'Click a block to make it active, then add items from the drawer. Right-click an item to mark a power spike.' },
  tech:   { heading: 'Set your rune pages',              blurb: 'Pick a keystone, lock primary + secondary paths, and tune stat shards for this matchup.' },
  skills: { heading: 'Skill order, spells, and combos',  blurb: 'Lock your Q/W/E/R priority, pin summoner spells, and script the sequences that win trades.' },
  meta:   { heading: 'Matchups, meta and build review',  blurb: 'Rank lane matchups, write notes, and double-check the gold curve before publishing.' },
}

// ---------------------------------------------------------------------------
// SaveIndicator
// ---------------------------------------------------------------------------

function SaveIndicator({ state }: { state: AutosaveState }) {
  if (state === 'idle') return null
  return (
    <span
      className={cn(
        'font-mono text-[10px] tracking-[0.08em] transition-colors duration-150',
        state === 'saving'  && 'text-primary animate-pulse',
        state === 'saved'   && 'text-emerald-400',
        state === 'error'   && 'text-red-400',
        state === 'pending' && 'text-muted-foreground',
      )}
    >
      {state === 'saving'  ? 'SAVING…'   : null}
      {state === 'saved'   ? '✓ SAVED'   : null}
      {state === 'error'   ? '✗ ERROR'   : null}
      {state === 'pending' ? 'UNSAVED'   : null}
    </span>
  )
}

// ---------------------------------------------------------------------------
// CheckIcon (simple inline SVG to avoid a dep)
// ---------------------------------------------------------------------------

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// EditorChrome
// ---------------------------------------------------------------------------

interface EditorChromeProps {
  page: EditorPage
  onPageChange: (page: EditorPage) => void
  championId: string
  buildName: string
  saveState: AutosaveState
  children: React.ReactNode
}

export function EditorChrome({
  page,
  onPageChange,
  championId,
  buildName,
  saveState,
  children,
}: EditorChromeProps) {
  const pageIdx = PAGES.findIndex(p => p.id === page)
  const prev = PAGES[pageIdx - 1]
  const next = PAGES[pageIdx + 1]
  const guide = PAGE_GUIDES[page]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top header ────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card px-10 py-5">
        <div className="flex items-center justify-between gap-5">
          {/* Left: back link + champion chip + build name */}
          <div className="flex items-center gap-4">
            <Link
              href="/builds/custom"
              className="text-[11px] text-muted-foreground/70 hover:text-muted-foreground transition-colors"
            >
              ← My Builds
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5">
              <div className="h-5 w-5 rounded-full bg-primary/20 ring-1 ring-primary/50 flex items-center justify-center text-[9px] font-bold text-primary">
                {championId.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold capitalize">{championId}</span>
            </div>
            <span className="hidden text-sm font-medium text-muted-foreground sm:block truncate max-w-xs">
              {buildName}
            </span>
          </div>

          {/* Right: save indicator + guide */}
          <div className="flex items-center gap-6">
            <SaveIndicator state={saveState} />
            <div className="text-right hidden lg:block">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                {PAGES[pageIdx]?.step}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5 max-w-xs">{guide.blurb}</p>
            </div>
          </div>
        </div>

        {/* ── Tab nav ───────────────────────────────────────────────── */}
        <nav className="mt-8 flex gap-1" aria-label="Build editor pages">
          {PAGES.map((p, i) => {
            const active = p.id === page
            const done = i < pageIdx
            return (
              <button
                key={p.id}
                onClick={() => onPageChange(p.id)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-all duration-150',
                  active
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full text-[9px]',
                    active && 'text-primary',
                    done  && 'text-emerald-400',
                    !active && !done && 'text-muted-foreground/50',
                  )}
                >
                  {done ? <CheckIcon /> : <span className="font-mono text-[9px]">{i + 1}</span>}
                </span>
                {p.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── Page body ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1280px] px-10 py-7 pb-10">
        {children}
      </div>

      {/* ── Footer nav ────────────────────────────────────────────── */}
      <div className="sticky bottom-0 border-t border-border bg-card px-10 py-5 shadow-[0_-12px_30px_-15px_rgba(0,0,0,0.2)]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5">
          {/* Prev */}
          <div className="min-w-[200px]">
            {prev ? (
              <button
                onClick={() => onPageChange(prev.id)}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-muted/70"
              >
                <span className="text-muted-foreground">←</span>
                <div className="text-left">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                    Back
                  </p>
                  <p className="text-sm font-semibold">{prev.label}</p>
                </div>
              </button>
            ) : null}
          </div>

          {/* Center guide */}
          <div className="text-center">
            <p className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground/50">
              {PAGES[pageIdx]?.step}
            </p>
          </div>

          {/* Next */}
          <div className="min-w-[200px] flex justify-end">
            {next ? (
              <button
                onClick={() => onPageChange(next.id)}
                className="flex items-center gap-3 rounded-xl border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-primary transition-all duration-150 hover:bg-primary/20 hover:border-primary"
              >
                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/60">
                    Next
                  </p>
                  <p className="text-sm font-semibold">{next.label}</p>
                </div>
                <span>→</span>
              </button>
            ) : (
              <button
                className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
              >
                Finish Review ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
