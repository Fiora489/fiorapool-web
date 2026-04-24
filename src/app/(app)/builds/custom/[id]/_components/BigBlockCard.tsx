'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { computeFinalStats } from '@/lib/builds/stat-compute'
import { StatChips } from './StatChips'
import { ItemTile } from './ItemTile'
import type { BlockEditorState, EditorAction } from './reducer'
import type { BlockType } from '@/lib/types/builds'
import type { ItemRecord } from '@/lib/builds/items-catalogue'

const BLOCK_LABELS: Record<BlockType, string> = {
  starting: 'Starting',
  early: 'Early Power',
  core: 'Core',
  situational: 'Situational',
  full: 'Full Build',
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

interface BigBlockCardProps {
  blockType: BlockType
  block: BlockEditorState
  active: boolean
  catalogue: Record<number, ItemRecord>
  dispatch: React.Dispatch<EditorAction>
  onAddClick?: () => void
}

export function BigBlockCard({
  blockType,
  block,
  active,
  catalogue,
  dispatch,
  onAddClick,
}: BigBlockCardProps) {
  const items = block.items.map(bi => ({ bi, record: catalogue[bi.id] }))
  const hasSpike = block.items.some(bi => bi.powerSpike)
  const gold = block.items.reduce((s, bi) => s + (catalogue[bi.id]?.gold ?? 0), 0)

  const stats = useMemo(() => {
    const itemsWithStats = block.items
      .map(bi => catalogue[bi.id])
      .filter((r): r is ItemRecord => !!r)
    return computeFinalStats(itemsWithStats)
  }, [block.items, catalogue])

  return (
    <div
      onClick={() => dispatch({ type: 'SET_ACTIVE_BLOCK', block: blockType })}
      className={cn(
        'cursor-pointer rounded-xl border-[1.5px] p-5 transition-all duration-150',
        active
          ? 'border-primary bg-card shadow-glow-sm'
          : 'border-border bg-card hover:border-primary/30',
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className={cn(
              'font-sans text-[10px] font-medium uppercase tracking-[0.3em]',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {BLOCK_LABELS[blockType]}
          </p>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground/60">
            {BLOCK_MINUTES[blockType]}M · {block.items.length} ITEMS
          </p>
        </div>

        {hasSpike && (
          <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.1em] text-primary-foreground">
            ⚡ SPIKE
          </span>
        )}
      </div>

      {/* Item tiles row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {items.map(({ bi, record }, idx) =>
          record ? (
            <ItemTile
              key={`${bi.id}-${idx}`}
              iconUrl={record.iconUrl}
              name={record.name}
              size={44}
              powerSpike={bi.powerSpike}
              onRemove={() =>
                dispatch({ type: 'REMOVE_ITEM', block: blockType, index: idx })
              }
              onToggleSpike={() =>
                dispatch({ type: 'TOGGLE_SPIKE', block: blockType, index: idx })
              }
            />
          ) : null,
        )}

        {/* Add button */}
        <button
          onClick={e => {
            e.stopPropagation()
            dispatch({ type: 'SET_ACTIVE_BLOCK', block: blockType })
            onAddClick?.()
          }}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-lg border border-dashed text-lg',
            'transition-colors duration-150',
            active
              ? 'border-primary/60 text-primary hover:border-primary hover:bg-primary/10'
              : 'border-border text-muted-foreground/50 hover:border-primary/30 hover:text-primary/50',
          )}
          aria-label="Add item"
        >
          +
        </button>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-border/50" />

      {/* Gold + stats row */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
          {gold.toLocaleString()}
          <span className="ml-0.5 text-[11px] text-muted-foreground">g</span>
        </span>
        <StatChips stats={stats} dense />
      </div>
    </div>
  )
}
