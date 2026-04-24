'use client'

import { cn } from '@/lib/utils'
import { ItemTile } from './ItemTile'
import type { BlockEditorState, EditorAction } from './reducer'
import type { ItemRecord } from '@/lib/builds/items-catalogue'

interface BootsRailProps {
  block: BlockEditorState
  active: boolean
  catalogue: Record<number, ItemRecord>
  dispatch: React.Dispatch<EditorAction>
}

const BOOTS_LABELS = ['vs AD heavy', 'vs AP/CC']

export function BootsRail({ block, active, catalogue, dispatch }: BootsRailProps) {
  return (
    <div
      onClick={() => dispatch({ type: 'SET_ACTIVE_BLOCK', block: 'boots' })}
      className={cn(
        'mt-5 flex cursor-pointer items-center gap-5 rounded-xl border border-dashed p-4 transition-all duration-150',
        active ? 'border-primary shadow-glow-sm bg-card' : 'border-primary/30 bg-card/50 hover:border-primary/50',
      )}
    >
      {/* Icon + label */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-2xl" role="img" aria-label="Boots">👟</span>
        <div>
          <p
            className={cn(
              'font-sans text-[10px] font-medium uppercase tracking-[0.3em]',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            Boots
          </p>
          <p className="font-mono text-[9px] text-muted-foreground/50 tracking-[0.08em]">
            PARALLEL TRACK
          </p>
        </div>
      </div>

      {/* Boot slots */}
      <div className="flex items-center gap-3 flex-1 flex-wrap">
        {Array.from({ length: 2 }).map((_, idx) => {
          const bi = block.items[idx]
          const record = bi ? catalogue[bi.id] : null
          const label = BOOTS_LABELS[idx] ?? ''
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              {record ? (
                <ItemTile
                  iconUrl={record.iconUrl}
                  name={record.name}
                  size={44}
                  powerSpike={bi.powerSpike}
                  onRemove={() => dispatch({ type: 'REMOVE_ITEM', block: 'boots', index: idx })}
                  onToggleSpike={() => dispatch({ type: 'TOGGLE_SPIKE', block: 'boots', index: idx })}
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground/30 text-lg">
                  +
                </div>
              )}
              <span className="font-mono text-[9px] text-muted-foreground/50 text-center whitespace-nowrap">
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Gold */}
      {block.items.length > 0 && (
        <span className="shrink-0 font-mono text-[12px] font-semibold tabular-nums text-foreground">
          {block.items.reduce((s, bi) => s + (catalogue[bi.id]?.gold ?? 0), 0).toLocaleString()}
          <span className="ml-0.5 text-[10px] text-muted-foreground">g</span>
        </span>
      )}
    </div>
  )
}
