'use client'

const LAYOUTS = [
  { key: 'grid',      title: 'Grid',      desc: 'Top 12 earned badges in a 4×3 grid' },
  { key: 'highlight', title: 'Highlight', desc: 'Featured badge + 4 other earned' },
  { key: 'chains',    title: 'Chains',    desc: 'Progress across all 10 badge chains' },
] as const

export type BadgeLayoutKey = (typeof LAYOUTS)[number]['key']

export function BadgeLayoutPicker({
  value,
  onChange,
}: {
  value: BadgeLayoutKey
  onChange: (next: BadgeLayoutKey) => void
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
