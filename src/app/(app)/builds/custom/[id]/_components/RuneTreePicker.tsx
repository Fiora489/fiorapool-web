'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { RunePageInput } from '@/lib/types/builds'
import type { RuneTree } from '@/lib/types/builds'

// ---------------------------------------------------------------------------
// Shard metadata — stable IDs per DDragon
// ---------------------------------------------------------------------------

interface ShardDef {
  id: number
  glyph: string
  label: string
}

const SHARDS: [ShardDef, ShardDef, ShardDef][] = [
  [
    { id: 5008, glyph: '◆', label: 'Adaptive Force' },
    { id: 5005, glyph: '⇝', label: 'Attack Speed'  },
    { id: 5007, glyph: '◎', label: 'Ability Haste'  },
  ],
  [
    { id: 5008, glyph: '◆', label: 'Adaptive Force' },
    { id: 5002, glyph: '▲', label: 'Armor'          },
    { id: 5003, glyph: '◇', label: 'Magic Resist'   },
  ],
  [
    { id: 5001, glyph: '♥', label: 'Health'         },
    { id: 5002, glyph: '▲', label: 'Armor'          },
    { id: 5003, glyph: '◇', label: 'Magic Resist'   },
  ],
]
const SHARD_LABELS = ['Offense', 'Flex', 'Defense']

// ---------------------------------------------------------------------------
// RuneSlot (single rune button)
// ---------------------------------------------------------------------------

interface RuneSlotProps {
  rune: { id: number; name: string; iconUrl?: string }
  selected: boolean
  disabled?: boolean
  onClick: () => void
  size?: 'lg' | 'md' | 'sm'
}

function RuneSlot({ rune, selected, disabled, onClick, size = 'md' }: RuneSlotProps) {
  const dim = size === 'lg' ? 'h-14 w-14' : size === 'md' ? 'h-10 w-10' : 'h-8 w-8'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={rune.name}
      className={cn(
        'relative rounded-full border-2 transition-all duration-150 overflow-hidden',
        dim,
        selected
          ? 'border-primary shadow-glow-sm opacity-100'
          : 'border-border opacity-50 hover:opacity-80 hover:border-primary/40',
        disabled && 'cursor-not-allowed opacity-30',
      )}
    >
      {rune.iconUrl ? (
        <Image src={rune.iconUrl} alt={rune.name} fill className="object-cover p-0.5" unoptimized />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display text-xs font-bold text-muted-foreground">
          {rune.name.charAt(0)}
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Primary tree panel
// ---------------------------------------------------------------------------

interface PrimaryTreeProps {
  tree: RuneTree
  page: RunePageInput
  onChange: (patch: Partial<RunePageInput>) => void
}

function PrimaryTree({ tree, page, onChange }: PrimaryTreeProps) {
  const primary = tree.find(p => p.id === page.primaryStyle)

  if (!primary) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Select a primary path</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tree.map(path => (
            <button
              key={path.id}
              onClick={() => onChange({ primaryStyle: path.id, keystone: 0, primaryMinors: [0, 0, 0] })}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm hover:border-primary/50 transition-colors"
            >
              {path.iconUrl && (
                <Image src={path.iconUrl} alt={path.name} width={20} height={20} unoptimized />
              )}
              {path.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Path header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_var(--primary-glow)]" />
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
            {primary.name} · Primary
          </p>
        </div>
        {/* Path switcher */}
        <div className="flex gap-1">
          {tree.map(path => (
            <button
              key={path.id}
              onClick={() => onChange({ primaryStyle: path.id, keystone: 0, primaryMinors: [0, 0, 0] })}
              className={cn(
                'rounded-full p-1 transition-colors',
                path.id === primary.id ? 'opacity-100' : 'opacity-40 hover:opacity-70',
              )}
              title={path.name}
            >
              {path.iconUrl ? (
                <Image src={path.iconUrl} alt={path.name} width={18} height={18} unoptimized />
              ) : (
                <span className="block h-4 w-4 rounded-full bg-muted" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Keystone row (slot 0) */}
      <div className="mb-5">
        <p className="mb-2 font-mono text-[9px] tracking-[0.12em] text-muted-foreground/60 uppercase">
          Keystone
        </p>
        <div className="flex justify-around">
          {primary.slots[0]?.runes.map(rune => (
            <RuneSlot
              key={rune.id}
              rune={rune}
              selected={page.keystone === rune.id}
              size="lg"
              onClick={() => onChange({ keystone: rune.id })}
            />
          ))}
        </div>
      </div>

      {/* Minor rune rows (slots 1–3) */}
      {primary.slots.slice(1).map((slot, slotIdx) => (
        <div key={slotIdx} className="mb-4">
          <p className="mb-2 font-mono text-[9px] tracking-[0.12em] text-muted-foreground/60 uppercase">
            Slot {slotIdx + 2}
          </p>
          <div className="flex justify-around">
            {slot.runes.map(rune => {
              const selected = page.primaryMinors[slotIdx] === rune.id
              return (
                <RuneSlot
                  key={rune.id}
                  rune={rune}
                  selected={selected}
                  size="md"
                  onClick={() => {
                    const newMinors = [...page.primaryMinors] as [number, number, number]
                    newMinors[slotIdx] = rune.id
                    onChange({ primaryMinors: newMinors })
                  }}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Secondary tree panel
// ---------------------------------------------------------------------------

interface SecondaryTreeProps {
  tree: RuneTree
  page: RunePageInput
  onChange: (patch: Partial<RunePageInput>) => void
}

function SecondaryTree({ tree, page, onChange }: SecondaryTreeProps) {
  const secondary = tree.find(p => p.id === page.secondaryStyle)
  const primary   = tree.find(p => p.id === page.primaryStyle)

  // Eligible secondary paths exclude the primary
  const eligible = tree.filter(p => p.id !== page.primaryStyle)

  if (!secondary) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-3 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Secondary Path
        </p>
        <div className="flex flex-wrap gap-2">
          {eligible.map(path => (
            <button
              key={path.id}
              onClick={() => onChange({ secondaryStyle: path.id, secondaryMinors: [0, 0] })}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm hover:border-primary/50 transition-colors"
            >
              {path.iconUrl && (
                <Image src={path.iconUrl} alt={path.name} width={16} height={16} unoptimized />
              )}
              {path.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          {secondary.name} · Secondary
        </p>
        <div className="flex gap-1">
          {eligible.map(path => (
            <button
              key={path.id}
              onClick={() => onChange({ secondaryStyle: path.id, secondaryMinors: [0, 0] })}
              className={cn(
                'rounded-full p-1 transition-colors',
                path.id === secondary.id ? 'opacity-100' : 'opacity-40 hover:opacity-70',
              )}
              title={path.name}
            >
              {path.iconUrl ? (
                <Image src={path.iconUrl} alt={path.name} width={16} height={16} unoptimized />
              ) : (
                <span className="block h-4 w-4 rounded-full bg-muted" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2 of the 3 minor slots, user picks which */}
      {secondary.slots.slice(1).map((slot, slotIdx) => (
        <div key={slotIdx} className="mb-4">
          <p className="mb-2 font-mono text-[9px] tracking-[0.12em] text-muted-foreground/60 uppercase">
            Slot {slotIdx + 1}
          </p>
          <div className="flex justify-around">
            {slot.runes.map(rune => (
              <RuneSlot
                key={rune.id}
                rune={rune}
                selected={page.secondaryMinors[slotIdx] === rune.id}
                size="md"
                onClick={() => {
                  const newMinors = [...page.secondaryMinors] as [number, number]
                  newMinors[slotIdx] = rune.id
                  onChange({ secondaryMinors: newMinors })
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat shards panel
// ---------------------------------------------------------------------------

interface ShardsProps {
  shards: [number, number, number]
  onChange: (shards: [number, number, number]) => void
}

function StatShardsPanel({ shards, onChange }: ShardsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Stat Shards
        </p>
        <span className="font-mono text-[9px] tracking-[0.1em] text-muted-foreground/50">
          3 SLOTS
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {SHARDS.map((row, rowIdx) => (
          <div key={rowIdx}>
            <p className="mb-2 font-mono text-[9px] tracking-[0.12em] font-semibold text-muted-foreground/60 uppercase">
              {SHARD_LABELS[rowIdx]}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {row.map((shard, i) => {
                const selected = shards[rowIdx] === shard.id
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const next = [...shards] as [number, number, number]
                      next[rowIdx] = shard.id
                      onChange(next)
                    }}
                    title={shard.label}
                    className={cn(
                      'aspect-square rounded-full border-2 font-display text-sm font-bold transition-all duration-150',
                      'flex items-center justify-center',
                      selected
                        ? 'border-primary bg-primary/20 text-primary shadow-glow-sm'
                        : 'border-border bg-muted text-muted-foreground/50 opacity-50 hover:opacity-80',
                    )}
                  >
                    {shard.glyph}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RuneTreePicker — public export
// ---------------------------------------------------------------------------

interface RuneTreePickerProps {
  tree: RuneTree
  page: RunePageInput
  onChange: (page: RunePageInput) => void
}

export function RuneTreePicker({ tree, page, onChange }: RuneTreePickerProps) {
  const patch = (partial: Partial<RunePageInput>) =>
    onChange({ ...page, ...partial })

  return (
    <div className="grid grid-cols-[1.4fr_1fr_0.7fr] gap-4">
      <PrimaryTree   tree={tree} page={page} onChange={patch} />
      <SecondaryTree tree={tree} page={page} onChange={patch} />
      <StatShardsPanel
        shards={page.shards}
        onChange={shards => patch({ shards })}
      />
    </div>
  )
}
