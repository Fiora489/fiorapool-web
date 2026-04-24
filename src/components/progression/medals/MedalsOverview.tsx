export function MedalsOverview({
  earned,
  total,
  byTier,
}: {
  earned: number
  total: number
  byTier: { bronze: number; silver: number; gold: number }
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Total Earned" value={`${earned}/${total}`} />
        <TierCard label="Bronze" value={byTier.bronze} dotClass="bg-amber-700" />
        <TierCard label="Silver" value={byTier.silver} dotClass="bg-zinc-300" />
        <TierCard label="Gold"   value={byTier.gold}   dotClass="bg-amber-400" />
      </div>
    </section>
  )
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function TierCard({ label, value, dotClass }: { label: string; value: number; dotClass: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <div className="flex items-center justify-center gap-2">
        <span className={`h-3 w-3 rounded-full ${dotClass}`} />
        <p className="text-xl font-bold">{value}</p>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
