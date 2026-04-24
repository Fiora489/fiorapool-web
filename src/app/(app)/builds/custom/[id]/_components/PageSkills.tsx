'use client'

import { SkillMatrix } from './SkillMatrix'
import { SummonerSpellPicker } from './SummonerSpellPicker'
import type { EditorState, EditorAction } from './reducer'
import type { SkillSlot, MaxPriority, SpellId } from '@/lib/types/builds'
import type { SpellRecord } from '@/lib/builds/summoner-spells'

interface PageSkillsProps {
  state: EditorState
  summonerSpells: Record<string, SpellRecord>
  dispatch: React.Dispatch<EditorAction>
}

export function PageSkills({ state, summonerSpells, dispatch }: PageSkillsProps) {
  return (
    <div>
      {/* Section heading */}
      <div className="mb-5">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Skills &amp; Spells
        </p>
        <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight">
          Skill order, spells &amp; combos
        </h2>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Left — skill matrix */}
        <SkillMatrix
          skillOrder={state.skillOrder}
          maxPriority={state.maxPriority}
          onChange={order => dispatch({ type: 'SET_SKILL_ORDER', order })}
          onMaxPriorityChange={priority => dispatch({ type: 'SET_MAX_PRIORITY', priority })}
        />

        {/* Right — summoner spells */}
        <div>
          <p className="mb-3 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Summoner Spells
          </p>
          <SummonerSpellPicker
            spells={summonerSpells}
            spell1={state.spell1}
            spell2={state.spell2}
            onChange={(s1, s2) => dispatch({ type: 'SET_SPELLS', spell1: s1, spell2: s2 })}
          />

          {/* Combos placeholder */}
          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Combos
            </p>
            <p className="text-xs text-muted-foreground/60 italic">
              Combo notation editor — coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
