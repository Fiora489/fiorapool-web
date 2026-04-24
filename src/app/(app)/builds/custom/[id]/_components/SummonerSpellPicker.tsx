'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { SpellRecord } from '@/lib/builds/summoner-spells'
import type { SpellId } from '@/lib/types/builds'

interface SummonerSpellPickerProps {
  spells: Record<string, SpellRecord>
  spell1: SpellId | null
  spell2: SpellId | null
  onChange: (spell1: SpellId, spell2: SpellId) => void
}

const SLOT_LABELS = ['D', 'F'] as const

export function SummonerSpellPicker({
  spells,
  spell1,
  spell2,
  onChange,
}: SummonerSpellPickerProps) {
  const selected = [spell1, spell2]
  const spellList = Object.values(spells).sort((a, b) => a.name.localeCompare(b.name))

  function toggle(slotIdx: 0 | 1, spellId: SpellId) {
    const next = [...selected] as [SpellId | null, SpellId | null]
    // Deselect if already in either slot
    if (next[0] === spellId) next[0] = null
    else if (next[1] === spellId) next[1] = null
    else next[slotIdx] = spellId
    onChange(next[0] ?? '', next[1] ?? '')
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Selected spells */}
      <div className="mb-4 flex flex-col gap-3">
        {([0, 1] as const).map(slotIdx => {
          const spellId = selected[slotIdx]
          const record = spellId ? spells[spellId] : null
          return (
            <div
              key={slotIdx}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                record ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/50',
              )}
            >
              {record ? (
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-primary/40">
                  <Image
                    src={record.iconUrl}
                    alt={record.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground/30 text-lg">
                  ?
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">
                  {record ? record.name : 'Select spell'}
                </p>
                <p className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground/60">
                  SLOT {SLOT_LABELS[slotIdx]}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Spell grid */}
      <div>
        <p className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Available Spells
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {spellList.map(spell => {
            const inSlot0 = spell1 === spell.id
            const inSlot1 = spell2 === spell.id
            const isSelected = inSlot0 || inSlot1
            return (
              <button
                key={spell.id}
                onClick={() => toggle(inSlot0 ? 0 : 1, spell.id)}
                title={spell.name}
                className={cn(
                  'relative flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-all duration-150',
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-glow-sm'
                    : 'border-border bg-muted hover:border-primary/40',
                )}
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-md">
                  <Image
                    src={spell.iconUrl}
                    alt={spell.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="text-center font-sans text-[9px] leading-tight text-muted-foreground line-clamp-1">
                  {spell.name}
                </span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary font-mono text-[8px] font-bold text-primary-foreground">
                    {inSlot0 ? 'D' : 'F'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
