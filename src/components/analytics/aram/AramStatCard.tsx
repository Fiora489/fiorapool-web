type Tone = 'neutral' | 'good' | 'warn' | 'bad'

export function AramStatCard({
  label,
  value,
  sublabel,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  sublabel?: string
  tone?: Tone
}) {
  const toneClass = {
    neutral: 'text-foreground',
    good:    'text-emerald-400',
    warn:    'text-amber-400',
    bad:     'text-rose-400',
  }[tone]

  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <p className={`text-xl font-bold ${toneClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="mt-1 text-[10px] text-muted-foreground/70">{sublabel}</p>}
    </div>
  )
}
