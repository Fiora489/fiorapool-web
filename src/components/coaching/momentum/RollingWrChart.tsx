import type { RollingPoint } from '@/lib/momentum'

const W = 600
const H = 160
const PAD_LEFT = 32
const PAD_RIGHT = 12
const PAD_TOP = 12
const PAD_BOTTOM = 24

export function RollingWrChart({ points }: { points: RollingPoint[] }) {
  if (points.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rolling 5-Game Win Rate</h2>
        <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
          Need at least 5 games to compute rolling win rate.
        </div>
      </section>
    )
  }

  const plotW = W - PAD_LEFT - PAD_RIGHT
  const plotH = H - PAD_TOP - PAD_BOTTOM
  const stepX = points.length > 1 ? plotW / (points.length - 1) : 0

  const toX = (i: number) => PAD_LEFT + i * stepX
  const toY = (wr: number) => PAD_TOP + plotH * (1 - wr / 100)

  const polylinePoints = points.map((p, i) => `${toX(i)},${toY(p.winRate)}`).join(' ')

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rolling 5-Game Win Rate</h2>
      <div className="overflow-hidden rounded-lg border bg-card p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Rolling 5-game win rate over last 20 games">
          {/* Y-axis gridlines at 0, 50, 100 */}
          {[0, 50, 100].map(v => (
            <g key={v}>
              <line
                x1={PAD_LEFT} y1={toY(v)} x2={W - PAD_RIGHT} y2={toY(v)}
                stroke="currentColor" strokeOpacity="0.15" strokeDasharray="3,3"
              />
              <text x={PAD_LEFT - 6} y={toY(v) + 3} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.6">
                {v}%
              </text>
            </g>
          ))}

          {/* Polyline */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="rgb(168, 85, 247)"  /* purple-500 */
            strokeWidth="2"
          />

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={toX(i)}
              cy={toY(p.winRate)}
              r="3"
              fill={p.winRate >= 50 ? 'rgb(52, 211, 153)' : 'rgb(248, 113, 113)'}
            >
              <title>{p.label}: {p.winRate}% WR</title>
            </circle>
          ))}

          {/* X-axis baseline */}
          <line x1={PAD_LEFT} y1={H - PAD_BOTTOM} x2={W - PAD_RIGHT} y2={H - PAD_BOTTOM} stroke="currentColor" strokeOpacity="0.3" />
          <text x={PAD_LEFT} y={H - 4} fontSize="10" fill="currentColor" opacity="0.6">oldest</text>
          <text x={W - PAD_RIGHT} y={H - 4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.6">newest</text>
        </svg>
      </div>
    </section>
  )
}
