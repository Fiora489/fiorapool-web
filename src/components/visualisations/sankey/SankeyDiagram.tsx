import type { SankeyNode, SankeyFlow } from '@/lib/sankey'

const W = 800
const H = 420
const PAD_TOP = 20
const PAD_BOTTOM = 20
const NODE_W = 14

type LayoutNode = SankeyNode & { x: number; y0: number; y1: number }

function nodeColor(id: string): string {
  if (id === 'Win') return 'rgb(52, 211, 153)'  // emerald-400
  if (id === 'Loss') return 'rgb(248, 113, 113)' // rose-400
  if (id.startsWith('Ahead')) return 'rgb(52, 211, 153)'
  if (id.startsWith('Behind')) return 'rgb(248, 113, 113)'
  if (id.startsWith('Even')) return 'rgb(251, 191, 36)' // amber-400
  if (id === 'Short <25m') return 'rgb(250, 116, 158)' // pink-ish
  if (id === 'Long >35m') return 'rgb(168, 85, 247)'   // purple-500
  return 'rgb(156, 163, 175)' // zinc-400 for Mid
}

function layout(nodes: SankeyNode[]): LayoutNode[] {
  const layers = [0, 1, 2]
  const cols = layers.map(l => nodes.filter(n => n.layer === l))
  const plotH = H - PAD_TOP - PAD_BOTTOM

  const result: LayoutNode[] = []
  for (const l of layers) {
    const layerNodes = cols[l]
    const totalVal = layerNodes.reduce((s, n) => s + n.value, 0)
    if (totalVal === 0) {
      layerNodes.forEach(n => result.push({ ...n, x: columnX(l), y0: PAD_TOP, y1: PAD_TOP }))
      continue
    }
    const gap = 8
    const availH = plotH - gap * (layerNodes.length - 1)
    let y = PAD_TOP
    for (const n of layerNodes) {
      const h = (n.value / totalVal) * availH
      result.push({ ...n, x: columnX(l), y0: y, y1: y + h })
      y += h + gap
    }
  }
  return result
}

function columnX(layer: number): number {
  const leftPad = 40
  const rightPad = 40
  const plotW = W - leftPad - rightPad
  const step = plotW / 2  // 3 columns, 2 gaps
  return leftPad + layer * step - NODE_W / 2 + (layer === 2 ? 0 : 0)
}

export function SankeyDiagram({ nodes, flows, total }: { nodes: SankeyNode[]; flows: SankeyFlow[]; total: number }) {
  if (total === 0) {
    return (
      <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
        No match data to flow yet.
      </div>
    )
  }

  const laid = layout(nodes)
  const byId = new Map(laid.map(n => [n.id, n]))

  // For each node, track the y-offset used on its source-outflow and target-inflow sides
  type Cursor = { sourceY: number; targetY: number }
  const cursor = new Map<string, Cursor>()
  for (const n of laid) cursor.set(n.id, { sourceY: n.y0, targetY: n.y0 })

  const paths = flows
    .filter(f => byId.has(f.source) && byId.has(f.target))
    .map(f => {
      const s = byId.get(f.source)!
      const t = byId.get(f.target)!
      const sTotal = s.value || 1
      const tTotal = t.value || 1
      const h = (f.value / sTotal) * (s.y1 - s.y0)
      const h2 = (f.value / tTotal) * (t.y1 - t.y0)
      const sCur = cursor.get(f.source)!
      const tCur = cursor.get(f.target)!
      const y0 = sCur.sourceY
      const y1 = tCur.targetY
      sCur.sourceY += h
      tCur.targetY += h2
      // Cubic bezier between (x0, y0+h/2) and (x1, y1+h2/2) with width-bands
      const x0 = s.x + NODE_W
      const x1 = t.x
      const midX = (x0 + x1) / 2
      const topPath = `M${x0},${y0} C${midX},${y0} ${midX},${y1} ${x1},${y1}`
      const bottomPath = `L${x1},${y1 + h2} C${midX},${y1 + h2} ${midX},${y0 + h} ${x0},${y0 + h} Z`
      return {
        path: `${topPath} ${bottomPath}`,
        color: nodeColor(f.target),
        value: f.value,
        source: f.source,
        target: f.target,
      }
    })

  return (
    <div className="overflow-x-auto rounded-lg border bg-card p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="block min-w-[640px] w-full" role="img" aria-label="Win condition Sankey diagram">
        {/* Flows */}
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color} fillOpacity={0.3} stroke={p.color} strokeOpacity={0.4} strokeWidth={0.5}>
            <title>{p.source} → {p.target}: {p.value} games</title>
          </path>
        ))}
        {/* Nodes */}
        {laid.map(n => (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y0}
              width={NODE_W}
              height={Math.max(2, n.y1 - n.y0)}
              fill={nodeColor(n.id)}
              rx={2}
            />
            <text
              x={n.layer === 2 ? n.x - 6 : n.x + NODE_W + 6}
              y={(n.y0 + n.y1) / 2}
              textAnchor={n.layer === 2 ? 'end' : 'start'}
              dominantBaseline="middle"
              fontSize="11"
              fontWeight={600}
              fill="currentColor"
            >
              {n.label}
            </text>
            <text
              x={n.layer === 2 ? n.x - 6 : n.x + NODE_W + 6}
              y={(n.y0 + n.y1) / 2 + 12}
              textAnchor={n.layer === 2 ? 'end' : 'start'}
              dominantBaseline="middle"
              fontSize="10"
              fill="currentColor"
              opacity={0.6}
            >
              {n.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
