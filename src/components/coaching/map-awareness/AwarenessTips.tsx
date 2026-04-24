export function AwarenessTips({ tips }: { tips: string[] }) {
  if (tips.length === 0) return null
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tips</h2>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li
            key={i}
            className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-sm"
          >
            <span className="mr-2 text-purple-400">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
