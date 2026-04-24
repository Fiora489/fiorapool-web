export function VisionOverview({
  avgVisionScore,
  avgVisionPerMin,
  avgWardsPlaced,
  avgWardRatio,
}: {
  avgVisionScore: number
  avgVisionPerMin: number
  avgWardsPlaced: number
  avgWardRatio: number
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Vision Score" value={avgVisionScore} />
        <Card label="Vision / min" value={avgVisionPerMin} />
        <Card label="Wards Placed" value={avgWardsPlaced} />
        <Card label="Ward Ratio" value={`${avgWardRatio}%`} sublabel="placed vs killed" />
      </div>
    </section>
  )
}

function Card({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="mt-1 text-[10px] text-muted-foreground/70">{sublabel}</p>}
    </div>
  )
}
