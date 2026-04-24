'use client'

import { RuneTreePicker } from './RuneTreePicker'
import type { EditorState, EditorAction } from './reducer'
import type { RuneTree, RunePageInput } from '@/lib/types/builds'

const DEFAULT_PAGE: RunePageInput = {
  name: 'New Rune Page',
  primaryStyle: 0,
  keystone: 0,
  primaryMinors: [0, 0, 0],
  secondaryStyle: 0,
  secondaryMinors: [0, 0],
  shards: [5008, 5008, 5001],
}

interface PageTechProps {
  state: EditorState
  runeTree: RuneTree
  dispatch: React.Dispatch<EditorAction>
}

export function PageTech({ state, runeTree, dispatch }: PageTechProps) {
  const page = state.runePage ?? DEFAULT_PAGE

  function handleChange(updated: RunePageInput) {
    dispatch({ type: 'SET_RUNE_PAGE', page: updated })
  }

  return (
    <div>
      {/* Section heading */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Runes
          </p>
          <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight">
            Primary path · Secondary path · Stat shards
          </h2>
        </div>
      </div>

      <RuneTreePicker tree={runeTree} page={page} onChange={handleChange} />

      {/* Matchup-aware rune notes placeholder */}
      {page.keystone !== 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Rune Notes
          </p>
          <p className="text-sm text-muted-foreground/70 italic">
            Add rune notes in the Matchup &amp; Meta tab for this specific matchup.
          </p>
        </div>
      )}
    </div>
  )
}
