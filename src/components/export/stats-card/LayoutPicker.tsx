'use client'

const LAYOUTS = [
  { key: 'hero',       title: 'Hero',       desc: 'Win rate, KDA, top champion, recent form' },
  { key: 'scoreboard', title: 'Scoreboard', desc: 'Last 5 matches with KDA, CS, result' },
  { key: 'timeline',   title: 'Timeline',   desc: '14-day daily activity bars + summary' },
] as const

export type LayoutKey = (typeof LAYOUTS)[number]['key']

export function LayoutPicker({
  value,
  onChange,
}: {
  value: LayoutKey
  onChange: (next: LayoutKey) => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Layout</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LAYOUTS.map(layout => {
          const selected = value === layout.key
          return (
            <button
              key={layout.key}
              type="button"
              onClick={() => onChange(layout.key)}
              className={`rounded-lg border bg-card px-4 py-3 text-left transition ${
                selected ? 'border-primary ring-2 ring-primary/40' : 'hover:border-muted-foreground/40'
              }`}
            >
              <p className="text-sm font-semibold">{layout.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{layout.desc}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
