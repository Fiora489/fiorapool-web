'use client'

import { cn } from '@/lib/utils'
import { KpiCard } from './KpiCard'
import { GoldTimeline } from './GoldTimeline'
import type { GoldPoint } from './GoldTimeline'
import { MatchupNotesList } from './MatchupNotesList'
import { computeBlockGold, computeBuildGold } from '@/lib/builds/gold-compute'
import type { EditorState, EditorAction } from './reducer'
import type { ItemsCatalogue } from '@/lib/builds/items-catalogue'
import type { RoleId, BlockType } from '@/lib/types/builds'
import { ROLE_IDS, BLOCK_TYPES } from '@/lib/types/builds'

const BLOCK_LABELS: Record<BlockType, string> = {
  starting: 'Start',
  early: 'Early',
  core: 'Core',
  situational: 'Situational',
  full: 'Full',
  boots: 'Boots',
}

// Approximate gold timing per block (minutes)
const BLOCK_MINUTES: Record<BlockType, string> = {
  starting: '0–2m',
  early: '5–8m',
  core: '12–15m',
  situational: '18–22m',
  full: '25–30m',
  boots: 'Flex',
}

interface RoleToggleProps {
  roles: RoleId[]
  onChange: (roles: RoleId[]) => void
}

function RolePicker({ roles, onChange }: RoleToggleProps) {
  function toggle(role: RoleId) {
    if (roles.includes(role)) {
      onChange(roles.filter(r => r !== role))
    } else {
      onChange([...roles, role])
    }
  }

  const ROLE_LABELS: Record<RoleId, string> = {
    TOP: 'Top',
    JUNGLE: 'Jgl',
    MID: 'Mid',
    ADC: 'Bot',
    SUPPORT: 'Sup',
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Roles
      </p>
      <div className="flex gap-2">
        {ROLE_IDS.map(role => {
          const active = roles.includes(role)
          return (
            <button
              key={role}
              onClick={() => toggle(role)}
              className={cn(
                'flex-1 rounded-lg border py-2 font-mono text-xs font-bold transition-all duration-150',
                active
                  ? 'border-primary bg-primary/10 text-primary shadow-glow-sm'
                  : 'border-border bg-muted text-muted-foreground/60 hover:border-primary/30',
              )}
            >
              {ROLE_LABELS[role]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface PageMetaProps {
  state: EditorState
  catalogue: ItemsCatalogue
  dispatch: React.Dispatch<EditorAction>
}

export function PageMeta({ state, catalogue, dispatch }: PageMetaProps) {
  // Compute gold per block for the timeline (exclude boots)
  const nonBootBlocks = BLOCK_TYPES.filter(bt => bt !== 'boots')
  let cumulative = 0
  const goldData: GoldPoint[] = nonBootBlocks.map(bt => {
    const blockItems = state.blocks[bt].items.map(bi => ({
      gold: catalogue[bi.id]?.gold ?? 0,
    }))
    const blockGold = computeBlockGold(blockItems)
    cumulative += blockGold
    return { label: BLOCK_LABELS[bt], gold: blockGold, cumulative }
  })

  // KPI values
  const totalItems = BLOCK_TYPES.reduce(
    (sum, bt) => sum + state.blocks[bt].items.length,
    0,
  )
  const totalGold = computeBuildGold(
    BLOCK_TYPES.map(bt => ({
      items: state.blocks[bt].items.map(bi => ({ gold: catalogue[bi.id]?.gold ?? 0 })),
    })),
  )
  const blocksWithItems = BLOCK_TYPES.filter(bt => state.blocks[bt].items.length > 0).length
  const bootCount = state.blocks.boots.items.length

  return (
    <div>
      {/* Section heading */}
      <div className="mb-5">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Meta
        </p>
        <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight">
          Roles · Gold · Matchup notes
        </h2>
      </div>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        <KpiCard
          label="Total Gold"
          value={totalGold.toLocaleString()}
          suffix="g"
          sub="All blocks incl. boots"
          tone="primary"
        />
        <KpiCard
          label="Item Count"
          value={totalItems}
          sub={`${bootCount} boot slot${bootCount !== 1 ? 's' : ''}`}
        />
        <KpiCard
          label="Blocks Filled"
          value={blocksWithItems}
          suffix={`/ ${BLOCK_TYPES.length}`}
        />
        <KpiCard
          label="Matchup Notes"
          value={state.matchupNotes.length}
          sub={
            state.matchupNotes.length > 0
              ? `${state.matchupNotes.filter(n => n.difficulty === 'hard' || n.difficulty === 'counter').length} hard/counter`
              : undefined
          }
        />
      </div>

      {/* Gold timeline */}
      <div className="mb-5">
        <GoldTimeline data={goldData} />
      </div>

      {/* Gold per block strip */}
      <div className="mb-5 rounded-xl border border-border bg-card p-4">
        <p className="mb-3 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Gold by Phase
        </p>
        <div className="grid grid-cols-6 gap-2">
          {BLOCK_TYPES.map(bt => {
            const blockItems = state.blocks[bt].items.map(bi => ({
              gold: catalogue[bi.id]?.gold ?? 0,
            }))
            const blockGold = computeBlockGold(blockItems)
            return (
              <div
                key={bt}
                className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/50 p-2"
              >
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
                  {BLOCK_LABELS[bt]}
                </span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {blockGold > 0 ? `${(blockGold / 1000).toFixed(1)}k` : '—'}
                </span>
                <span className="font-sans text-[8px] text-muted-foreground/40">
                  {BLOCK_MINUTES[bt]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Role picker */}
      <div className="mb-6">
        <RolePicker
          roles={state.roles}
          onChange={roles => dispatch({ type: 'SET_ROLES', roles })}
        />
      </div>

      {/* Matchup notes */}
      <MatchupNotesList notes={state.matchupNotes} dispatch={dispatch} />
    </div>
  )
}
