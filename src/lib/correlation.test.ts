import { describe, it, expect } from 'vitest'
import { computeCorrelation } from './correlation'
import { makeMatchSeries } from './__fixtures__/matches'

describe('computeCorrelation', () => {
  it('empty returns 0 samples', () => {
    const r = computeCorrelation([])
    expect(r.samples).toBe(0)
    expect(r.matrix).toEqual([])
  })

  it('matrix diagonal always 1', () => {
    const r = computeCorrelation(makeMatchSeries(10))
    for (const cell of r.matrix) {
      if (cell.xId === cell.yId) {
        expect(cell.r).toBe(1)
      }
    }
  })

  it('matrix is symmetric (r(x,y) == r(y,x))', () => {
    const r = computeCorrelation(makeMatchSeries(10))
    const pair = (a: string, b: string) => r.matrix.find(c => c.xId === a && c.yId === b)?.r
    expect(pair('win', 'kda')).toBeCloseTo(pair('kda', 'win') ?? 0, 5)
  })

  it('6 stats → 36 cells', () => {
    const r = computeCorrelation(makeMatchSeries(10))
    expect(r.matrix.length).toBe(36)
  })

  it('returns 6 stat definitions', () => {
    const r = computeCorrelation(makeMatchSeries(10))
    expect(r.stats).toHaveLength(6)
  })
})
