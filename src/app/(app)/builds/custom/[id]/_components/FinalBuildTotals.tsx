import { useMemo } from 'react'
import { computeFinalStats } from '@/lib/builds/stat-compute'
import { computeBlockGold, computeBuildGold } from '@/lib/builds/gold-compute'
import { StatChips } from './StatChips'
import type { BlockEditorState } from './reducer'
import type { BlockType } from '@/lib/types/builds'
import type { ItemRecord } from '@/lib/builds/items-catalogue'

interface FinalBuildTotalsProps {
  blocks: Record<BlockType, BlockEditorState>
  catalogue: Record<number, ItemRecord>
}

const BLOCK_ORDER: BlockType[] = ['starting', 'early', 'core', 'situational', 'full', 'boots']

const BLOCK_LABELS: Record<BlockType, string> = {
  starting: 'Starting',
  early: 'Early',
  core: 'Core',
  situational: 'Situational',
  full: 'Full',
  boots: 'Boots',
}

const BLOCK_MINUTES: Record<BlockType, number> = {
  starting: 0,
  early: 6,
  core: 18,
  situational: 28,
  full: 38,
  boots: 8,
}

export function FinalBuildTotals({ blocks, catalogue }: FinalBuildTotalsProps) {
  const { stats, totalGold, perBlock } = useMemo(() => {
    // Boots: count only the first pick to avoid double-counting the parallel track
    const core = BLOCK_ORDER.filter(bt => bt !== 'boots').flatMap(bt =>
      blocks[bt].items.map(item => catalogue[item.id]).filter(Boolean),
    )
    const bootsItems = blocks.boots.items
    const bootsPick = bootsItems.length > 0 ? [catalogue[bootsItems[0].id]].filter(Boolean) : []

    const stats = computeFinalStats([...core, ...bootsPick])

    const totalGold = BLOCK_ORDER.reduce((sum, bt) => {
      return sum + blocks[bt].items.reduce((s, item) => s + (catalogue[item.id]?.gold ?? 0), 0)
    }, 0)

    const perBlock = BLOCK_ORDER.map(bt => ({
      id: bt,
      label: BLOCK_LABELS[bt],
      minute: BLOCK_MINUTES[bt],
      gold: blocks[bt].items.reduce((s, item) => s + (catalogue[item.id]?.gold ?? 0), 0),
      count: blocks[bt].items.length,
    }))

    return { stats, totalGold, perBlock }
  }, [blocks, catalogue])

  return (
    <div className="mb-4 rounded-xl border-[1.5px] border-primary bg-gradient-to-b from-card to-background p-4 shadow-glow-sm">
      {/* Header row */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Final Build
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground/60">
            Aggregated totals (boots: first pick only)
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground/60 uppercase">
            Total Gold
          </p>
          <p className="font-mono text-[22px] font-bold tabular-nums text-primary leading-none mt-0.5">
            {totalGold.toLocaleString()}
            <span className="ml-0.5 text-sm font-normal text-primary/70">g</span>
          </p>
        </div>
      </div>

      {/* Stat chips */}
      <StatChips stats={stats} dense className="mb-3" />

      {/* Per-block gold strip */}
      <div className="grid grid-cols-6 gap-1.5 mt-3 border-t border-border/50 pt-3">
        {perBlock.map(b => (
          <div
            key={b.id}
            className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/60 px-1 py-2 text-center"
          >
            <span className="font-mono text-[9px] tracking-[0.08em] text-muted-foreground/60 uppercase">
              {b.minute}m
            </span>
            <span className="font-sans text-[10px] font-semibold text-foreground">
              {b.label}
            </span>
            <span className="font-mono text-[10px] font-bold tabular-nums text-primary">
              {b.gold.toLocaleString()}g
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/50">
              {b.count} {b.count === 1 ? 'item' : 'items'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
