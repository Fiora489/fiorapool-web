'use client'

import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { ItemTile } from './ItemTile'
import type { EditorAction } from './reducer'
import type { BlockType } from '@/lib/types/builds'
import type { ItemRecord } from '@/lib/builds/items-catalogue'

// ---------------------------------------------------------------------------
// Filter chips
// ---------------------------------------------------------------------------

const FILTER_CHIPS = [
  'ALL', 'DMG', 'AP', 'TANK', 'BOOTS', 'LETHALITY',
  'CRIT', 'HEAL', 'SHIELD', 'MANA', 'CDR', 'LIFESTEAL',
  'ONHIT', 'MYTHIC',
] as const
type FilterChip = typeof FILTER_CHIPS[number]

// Maps our filter labels to DDragon tag names
const TAG_MAP: Record<FilterChip, string[]> = {
  ALL:       [],
  DMG:       ['Damage'],
  AP:        ['SpellDamage'],
  TANK:      ['Tank', 'Health', 'Armor', 'SpellBlock'],
  BOOTS:     ['Boots'],
  LETHALITY: ['Lethality'],
  CRIT:      ['CriticalStrike'],
  HEAL:      ['HealthRegen', 'Lifesteal'],
  SHIELD:    ['Shield'],
  MANA:      ['Mana'],
  CDR:       ['CooldownReduction', 'AbilityHaste'],
  LIFESTEAL: ['Lifesteal'],
  ONHIT:     ['OnHit', 'AttackSpeed'],
  MYTHIC:    ['Mythic'],
}

function matchesFilter(item: ItemRecord, filter: FilterChip): boolean {
  if (filter === 'ALL') return true
  const targets = TAG_MAP[filter]
  return targets.some(t => item.tags.some(tag => tag.toLowerCase().includes(t.toLowerCase())))
}

// ---------------------------------------------------------------------------
// Block label helpers
// ---------------------------------------------------------------------------

const BLOCK_LABELS: Record<BlockType, string> = {
  starting: 'Starting',
  early: 'Early Power',
  core: 'Core',
  situational: 'Situational',
  full: 'Full Build',
  boots: 'Boots',
}

// ---------------------------------------------------------------------------
// ItemDrawer
// ---------------------------------------------------------------------------

interface ItemDrawerProps {
  catalogue: Record<number, ItemRecord>
  activeBlock: BlockType
  dispatch: React.Dispatch<EditorAction>
}

export function ItemDrawer({ catalogue, activeBlock, dispatch }: ItemDrawerProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterChip>('ALL')

  // ⌘K / Ctrl+K shortcut to focus search
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const el = document.getElementById('item-drawer-search')
        if (el) (el as HTMLInputElement).focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const filtered = Object.values(catalogue).filter(item => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && matchesFilter(item, filter)
  })

  const addItem = useCallback(
    (itemId: number) => {
      dispatch({ type: 'ADD_ITEM', block: activeBlock, itemId })
    },
    [dispatch, activeBlock],
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div>
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Item Drawer
        </p>
        <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight">Browse items</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Adding to{' '}
          <span className="font-semibold text-primary">{BLOCK_LABELS[activeBlock]}</span>{' '}
          block →
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <Input
          id="item-drawer-search"
          type="search"
          placeholder="Search items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-[10px] pl-8 pr-16"
          aria-label="Search items"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50">
          ⌘K
        </kbd>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => setFilter(chip)}
            className={cn(
              'rounded-full border px-3 py-1 font-mono text-[10px] font-medium tracking-[0.06em] transition-all duration-150',
              filter === chip
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-muted text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            {filter} · {filtered.length} items
          </p>
          <p className="font-mono text-[10px] tracking-[0.08em] text-primary">
            ⚡ CLICK TO ADD
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2.5 max-h-[560px] overflow-y-auto pr-1">
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => addItem(item.id)}
              className={cn(
                'group flex flex-col items-center gap-2 rounded-[10px] border border-border bg-muted p-3',
                'transition-all duration-150',
                'hover:-translate-y-0.5 hover:border-primary hover:shadow-glow-sm hover:bg-muted/70',
              )}
              title={`${item.name} — ${item.gold}g`}
            >
              <ItemTile iconUrl={item.iconUrl} name={item.name} size={56} />
              <span className="text-center text-[12px] font-semibold leading-tight text-foreground line-clamp-2 min-h-[30px]">
                {item.name}
              </span>
              <span className="font-mono text-[11px] font-semibold tabular-nums text-primary">
                {item.gold.toLocaleString()}g
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No items match "{search}"
          </div>
        )}
      </div>
    </div>
  )
}
