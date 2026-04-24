import type { RadarAxis } from '@/lib/champion-radar'

const SIZE = 360
const CENTER = SIZE / 2
const MAX_RADIUS = 140

function polarToXY(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

export function HexRadarChart({ axes }: { axes: RadarAxis[] }) {
  const step = 360 / axes.length

  // Grid rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1].map(pct => {
    const pts = axes
      .map((_, i) => polarToXY(i * step, MAX_RADIUS * pct))
      .map(p => `${p.x},${p.y}`)
      .join(' ')
    return { pts, pct }
  })

  // Data polygon
  const dataPoints = axes.map((a, i) => polarToXY(i * step, (a.value / 100) * MAX_RADIUS))
  const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  // Axis labels
  const labels = axes.map((a, i) => {
    const p = polarToXY(i * step, MAX_RADIUS + 22)
    return { ...a, x: p.x, y: p.y }
  })

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-md" role="img" aria-label="Champion radar chart">
        {/* Rings */}
        {rings.map(r => (
          <polygon
            key={r.pct}
            points={r.pts}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeWidth={1}
          />
        ))}
        {/* Axis lines */}
        {axes.map((_, i) => {
          const end = polarToXY(i * step, MAX_RADIUS)
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke="currentColor"
              strokeOpacity={0.12}
            />
          )
        })}
        {/* Data polygon */}
        <polygon
          points={dataPath}
          fill="rgb(168, 85, 247)"
          fillOpacity={0.35}
          stroke="rgb(168, 85, 247)"
          strokeWidth={2}
        />
        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="rgb(168, 85, 247)">
            <title>{axes[i].label}: {axes[i].rawLabel}</title>
          </circle>
        ))}
        {/* Labels */}
        {labels.map((l, i) => (
          <g key={i}>
            <text
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight={600}
              fill="currentColor"
            >
              {l.label}
            </text>
            <text
              x={l.x}
              y={l.y + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="currentColor"
              opacity={0.6}
            >
              {l.rawLabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
