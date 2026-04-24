import type { CorrelationStat, CorrelationCell } from '@/lib/correlation'

function cellColor(r: number): string {
  const abs = Math.abs(r)
  if (r > 0) {
    // green scale
    const alpha = Math.round(abs * 100)
    return `rgba(52, 211, 153, ${(alpha / 100).toFixed(2)})`
  }
  if (r < 0) {
    const alpha = Math.round(abs * 100)
    return `rgba(248, 113, 113, ${(alpha / 100).toFixed(2)})`
  }
  return 'transparent'
}

function textColor(r: number): string {
  return Math.abs(r) > 0.3 ? 'text-foreground' : 'text-muted-foreground'
}

export function CorrelationMatrix({
  stats,
  matrix,
  samples,
}: {
  stats: CorrelationStat[]
  matrix: CorrelationCell[]
  samples: number
}) {
  if (samples === 0) {
    return (
      <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
        Need matches with gold_diff_at_10 data to compute correlations.
      </div>
    )
  }

  const rBy = (x: string, y: string) => matrix.find(c => c.xId === x && c.yId === y)?.r ?? 0

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border bg-card p-4">
        <table className="text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2"></th>
              {stats.map(s => (
                <th key={s.id} className="px-2 py-2 text-center text-[11px] font-medium text-muted-foreground">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map(y => (
              <tr key={y.id}>
                <th className="px-2 py-2 text-right text-[11px] font-medium text-muted-foreground">{y.label}</th>
                {stats.map(x => {
                  const r = rBy(x.id, y.id)
                  return (
                    <td
                      key={x.id}
                      className={`h-12 w-12 text-center text-xs tabular-nums ${textColor(r)}`}
                      style={{ background: cellColor(r) }}
                      title={`${y.label} × ${x.label}: r = ${r}`}
                    >
                      {r.toFixed(2)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Pearson r based on {samples} matches. Green = positive correlation, red = negative, grey = none.
      </p>
    </div>
  )
}
