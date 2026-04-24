import { describe, it, expect } from 'vitest'
import { computeSankey } from './sankey'
import { makeMatch } from './__fixtures__/matches'

describe('computeSankey', () => {
  it('3 layers of nodes (3 + 3 + 2)', () => {
    const r = computeSankey([makeMatch()])
    const byLayer = [0, 1, 2].map(l => r.nodes.filter(n => n.layer === l).length)
    expect(byLayer).toEqual([3, 3, 2])
  })

  it('flows aggregate per source→target pair', () => {
    const matches = [
      makeMatch({ gold_diff_at_10: 1000, game_duration_seconds: 20 * 60, win: true }),   // Ahead → Short → Win
      makeMatch({ gold_diff_at_10: 1000, game_duration_seconds: 20 * 60, win: true }),   // same pair
    ]
    const r = computeSankey(matches)
    const flow = r.flows.find(f => f.source === 'Ahead @10' && f.target === 'Short <25m')
    expect(flow?.value).toBe(2)
  })

  it('null gold_diff classified as Even @10', () => {
    const r = computeSankey([makeMatch({ gold_diff_at_10: null })])
    const even = r.nodes.find(n => n.id === 'Even @10')
    expect(even?.value).toBe(1)
  })

  it('total sums to match count', () => {
    const r = computeSankey([makeMatch(), makeMatch(), makeMatch()])
    expect(r.total).toBe(3)
  })
})
