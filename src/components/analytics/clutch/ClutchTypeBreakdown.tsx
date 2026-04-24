import type { ClutchTypeCounts } from '@/lib/analytics'

const TYPE_META = [
  { key: 'comeback' as const,         label: 'Comeback',     caption: 'Won down 500+ gold at 10', tone: 'sky' },
  { key: 'longGame' as const,         label: 'Long Game',    caption: 'Won game past 28 minutes', tone: 'purple' },
  { key: 'laneLossRecovery' as const, label: 'Lane Loss',    caption: 'Won despite -10+ CS at 10', tone: 'amber' },
  { key: 'stomp' as const,            label: 'Stomp',        caption: 'Early win, +1.5k gold lead', tone: 'emerald' },
]

const TONE_CLASSES: Record<string, { card: string; text: string }> = {
  sky:     { card: 'border-sky-500/40 bg-sky-500/5',         text: 'text-sky-400' },
  purple:  { card: 'border-purple-500/40 bg-purple-500/5',   text: 'text-purple-400' },
  amber:   { card: 'border-amber-500/40 bg-amber-500/5',     text: 'text-amber-400' },
  emerald: { card: 'border-emerald-500/40 bg-emerald-500/5', text: 'text-emerald-400' },
}

export function ClutchTypeBreakdown({ counts }: { counts: ClutchTypeCounts }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Win Type Breakdown</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TYPE_META.map(meta => {
          const tone = TONE_CLASSES[meta.tone]
          return (
            <div key={meta.key} className={`rounded-lg border px-4 py-3 ${tone.card}`}>
              <p className={`text-xl font-bold ${tone.text}`}>{counts[meta.key]}</p>
              <p className="text-xs font-medium">{meta.label}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{meta.caption}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
