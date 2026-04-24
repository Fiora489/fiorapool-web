import type { ComebackTraits as ComebackTraitsType } from '@/lib/comeback-dna'

function formatMinutes(m: number): string {
  if (m <= 0) return '—'
  const whole = Math.floor(m)
  const secs = Math.round((m - whole) * 60).toString().padStart(2, '0')
  return `${whole}:${secs}`
}

export function ComebackTraits({ traits, hasData }: { traits: ComebackTraitsType; hasData: boolean }) {
  if (!hasData) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Comeback Traits</h2>
        <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
          Win some games from behind to populate this section.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Comeback Traits</h2>
      <p className="text-xs text-muted-foreground">Patterns across your comeback wins.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card label="Avg Duration" value={formatMinutes(traits.avgComebackDuration)} sublabel="mm:ss" />
        <Card
          label="Avg Deficit"
          value={traits.avgMomentumSwing > 0 ? `-${traits.avgMomentumSwing.toLocaleString()}` : '—'}
          sublabel="gold at 10"
          valueClass="text-rose-400"
        />
        <Card
          label="CS Recovery"
          value={traits.avgCsRecovery !== 0 ? `${traits.avgCsRecovery > 0 ? '+' : ''}${traits.avgCsRecovery}` : '—'}
          sublabel="cs diff Δ (10→20)"
          valueClass={traits.avgCsRecovery >= 3 ? 'text-emerald-400' : traits.avgCsRecovery <= -3 ? 'text-rose-400' : ''}
        />
      </div>
    </section>
  )
}

function Card({ label, value, sublabel, valueClass = '' }: { label: string; value: string; sublabel?: string; valueClass?: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="mt-1 text-[10px] text-muted-foreground/70">{sublabel}</p>}
    </div>
  )
}
