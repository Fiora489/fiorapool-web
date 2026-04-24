'use client'

import { cn } from '@/lib/utils'
import type { SkillSlot, MaxPriority } from '@/lib/types/builds'

const SKILLS: SkillSlot[] = ['Q', 'W', 'E', 'R']
const LEVELS = Array.from({ length: 18 }, (_, i) => i + 1)

// R is only allowed at levels 6, 11, 16
const R_ALLOWED = new Set([6, 11, 16])

const SKILL_COLORS: Record<SkillSlot, string> = {
  Q: 'oklch(0.70 0.18 230)',
  W: 'oklch(0.72 0.18 155)',
  E: 'oklch(0.78 0.18 75)',
  R: 'oklch(0.68 0.22 22)',
}

const SKILL_TAILWIND: Record<SkillSlot, string> = {
  Q: 'border-[oklch(0.70_0.18_230)] bg-[oklch(0.70_0.18_230/0.2)] text-[oklch(0.70_0.18_230)]',
  W: 'border-[oklch(0.72_0.18_155)] bg-[oklch(0.72_0.18_155/0.2)] text-[oklch(0.72_0.18_155)]',
  E: 'border-[oklch(0.78_0.18_75)]  bg-[oklch(0.78_0.18_75/0.2)]  text-[oklch(0.78_0.18_75)]',
  R: 'border-primary bg-primary/20 text-primary',
}

interface SkillMatrixProps {
  skillOrder: SkillSlot[]
  maxPriority: MaxPriority | null
  onChange: (order: SkillSlot[]) => void
  onMaxPriorityChange: (priority: MaxPriority) => void
}

export function SkillMatrix({
  skillOrder,
  maxPriority,
  onChange,
  onMaxPriorityChange,
}: SkillMatrixProps) {
  // Count points per skill
  const counts: Record<SkillSlot, number> = { Q: 0, W: 0, E: 0, R: 0 }
  for (const s of skillOrder) counts[s]++

  function handleCellClick(skill: SkillSlot, level: number) {
    const idx = level - 1
    // R only at allowed levels
    if (skill === 'R' && !R_ALLOWED.has(level)) return
    // Check point limits
    if (skill === 'R' && counts.R >= 3) return
    if (skill !== 'R' && counts[skill] >= 5) return
    // If the level already has a skill assigned, remove it
    if (skillOrder[idx] !== undefined) {
      const next = [...skillOrder]
      next.splice(idx, 1)
      onChange(next)
    } else {
      const next = [...skillOrder]
      next.splice(idx, 0, skill)
      onChange(next.slice(0, 18))
    }
  }

  function handleMaxPriorityClick(skill: SkillSlot) {
    if (skill === 'R') return
    const current = maxPriority ?? ['Q', 'W', 'E']
    const idx = current.indexOf(skill)
    if (idx === 0) return // already first
    const next = [...current] as MaxPriority
    next.splice(idx, 1)
    next.unshift(skill)
    onMaxPriorityChange(next)
  }

  return (
    <div>
      {/* Max priority row */}
      <div className="mb-4">
        <p className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Max Priority
        </p>
        <div className="flex items-center gap-2">
          {(['Q', 'W', 'E'] as SkillSlot[]).map((skill, i) => {
            const priority = maxPriority ?? ['Q', 'W', 'E']
            const rank = priority.indexOf(skill)
            return (
              <button
                key={skill}
                onClick={() => handleMaxPriorityClick(skill)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold transition-all duration-150',
                  rank === 0
                    ? SKILL_TAILWIND[skill]
                    : 'border-border bg-muted text-muted-foreground hover:border-primary/30',
                )}
              >
                <span className="text-[9px] text-muted-foreground/50">#{rank + 1}</span>
                {skill}
              </button>
            )
          })}
          <span className="text-sm text-muted-foreground/50 ml-2">max order</span>
        </div>
      </div>

      {/* Skill matrix */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card p-4">
        {/* Level header */}
        <div className="mb-2 grid" style={{ gridTemplateColumns: '40px repeat(18, 1fr)', gap: 4 }}>
          <div />
          {LEVELS.map(lvl => (
            <div
              key={lvl}
              className="text-center font-mono text-[9px] tracking-[0.05em] text-muted-foreground/60"
            >
              {lvl}
            </div>
          ))}
        </div>

        {/* Rows Q/W/E/R */}
        {SKILLS.map(skill => (
          <div
            key={skill}
            className="mb-1.5 grid items-center"
            style={{ gridTemplateColumns: '40px repeat(18, 1fr)', gap: 4 }}
          >
            {/* Skill label */}
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border-2 font-display text-[11px] font-bold',
                SKILL_TAILWIND[skill],
              )}
            >
              {skill}
            </div>

            {/* Level cells */}
            {LEVELS.map(level => {
              const idx = level - 1
              const assigned = skillOrder[idx]
              const active = assigned === skill
              const disabled = skill === 'R' && !R_ALLOWED.has(level)

              return (
                <button
                  key={level}
                  onClick={() => handleCellClick(skill, level)}
                  disabled={disabled}
                  className={cn(
                    'h-7 rounded-md border text-[10px] font-bold font-mono transition-all duration-150',
                    active
                      ? cn('border-2', SKILL_TAILWIND[skill], 'shadow-sm')
                      : disabled
                        ? 'border-dashed border-border/30 bg-transparent cursor-not-allowed opacity-30'
                        : 'border-border bg-muted/50 text-transparent hover:border-primary/30 hover:bg-primary/5',
                  )}
                  aria-label={active ? `${skill} at level ${level}` : `Set ${skill} at level ${level}`}
                  aria-pressed={active}
                >
                  {active ? skill : null}
                </button>
              )
            })}
          </div>
        ))}

        {/* Point count footer */}
        <div className="mt-3 flex items-center gap-4 border-t border-border/50 pt-3">
          {SKILLS.map(skill => (
            <div key={skill} className="flex items-center gap-1.5">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  skill === 'Q' && 'bg-[oklch(0.70_0.18_230)]',
                  skill === 'W' && 'bg-[oklch(0.72_0.18_155)]',
                  skill === 'E' && 'bg-[oklch(0.78_0.18_75)]',
                  skill === 'R' && 'bg-primary',
                )}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {skill}: {counts[skill]}/{skill === 'R' ? 3 : 5}
              </span>
            </div>
          ))}
          <span className="ml-auto font-mono text-[10px] text-muted-foreground/50">
            {skillOrder.length}/18 slots filled
          </span>
        </div>
      </div>
    </div>
  )
}
