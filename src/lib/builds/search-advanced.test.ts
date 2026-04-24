import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { parseSearchQuery, toTsquery } from './search-advanced'
import type { ParsedQuery } from './search-advanced'

// ---------------------------------------------------------------------------
// parseSearchQuery
// ---------------------------------------------------------------------------

describe('parseSearchQuery', () => {
  it('parses plain words as positives', () => {
    const q = parseSearchQuery('bruiser split')
    expect(q.positives).toEqual(['bruiser', 'split'])
    expect(q.negatives).toEqual([])
    expect(q.phrases).toEqual([])
    expect(q.isEmpty).toBe(false)
  })

  it('parses quoted phrase into phrases[]', () => {
    const q = parseSearchQuery('"split push"')
    expect(q.phrases).toEqual(['split push'])
    expect(q.positives).toEqual([])
  })

  it('parses -word into negatives[]', () => {
    const q = parseSearchQuery('bruiser -tanky')
    expect(q.positives).toEqual(['bruiser'])
    expect(q.negatives).toEqual(['tanky'])
  })

  it('parses +word the same as a plain word', () => {
    const q = parseSearchQuery('+flash')
    expect(q.positives).toContain('flash')
    expect(q.negatives).toEqual([])
  })

  it('handles a complex mixed query', () => {
    const q = parseSearchQuery('bruiser -tanky "split push" +flash')
    expect(q.positives).toContain('bruiser')
    expect(q.positives).toContain('flash')
    expect(q.negatives).toEqual(['tanky'])
    expect(q.phrases).toEqual(['split push'])
  })

  it('returns isEmpty=true for whitespace-only input', () => {
    expect(parseSearchQuery('   ').isEmpty).toBe(true)
  })

  it('returns isEmpty=true for empty string', () => {
    expect(parseSearchQuery('').isEmpty).toBe(true)
  })

  it('lowercases all terms', () => {
    const q = parseSearchQuery('Fiora BRUISER -TANKY "Split Push"')
    expect(q.positives).toContain('fiora')
    expect(q.positives).toContain('bruiser')
    expect(q.negatives).toEqual(['tanky'])
    expect(q.phrases).toEqual(['split push'])
  })

  it('drops single-character tokens', () => {
    const q = parseSearchQuery('a big build')
    expect(q.positives).not.toContain('a')
    expect(q.positives).toContain('big')
    expect(q.positives).toContain('build')
  })

  it('populates tokens with all positive terms (for client highlight)', () => {
    const q = parseSearchQuery('"split push" bruiser')
    expect(q.tokens).toContain('split')
    expect(q.tokens).toContain('push')
    expect(q.tokens).toContain('bruiser')
  })

  it('deduplicates tokens', () => {
    const q = parseSearchQuery('flash flash')
    expect(q.tokens.filter(t => t === 'flash').length).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// toTsquery
// ---------------------------------------------------------------------------

describe('toTsquery', () => {
  function parse(raw: string): ParsedQuery {
    return parseSearchQuery(raw)
  }

  it('converts positives to AND-joined terms', () => {
    const tsq = toTsquery(parse('bruiser split'))
    expect(tsq).toBe('bruiser & split')
  })

  it('wraps phrase words with <-> adjacency operator', () => {
    const tsq = toTsquery(parse('"split push"'))
    expect(tsq).toBe('split <-> push')
  })

  it('prefixes negations with !', () => {
    const tsq = toTsquery(parse('bruiser -tanky'))
    expect(tsq).toContain('!tanky')
    expect(tsq).toContain('bruiser')
  })

  it('handles complex mixed query', () => {
    const tsq = toTsquery(parse('bruiser -tanky "split push"'))
    expect(tsq).toContain('bruiser')
    expect(tsq).toContain('!tanky')
    expect(tsq).toContain('split <-> push')
  })

  it('returns empty string for an empty ParsedQuery', () => {
    expect(toTsquery(parse(''))).toBe('')
  })

  it('strips tsquery special characters from tokens', () => {
    const q = parseSearchQuery('foo&bar')
    const tsq = toTsquery(q)
    expect(tsq).not.toContain('&')
  })
})
