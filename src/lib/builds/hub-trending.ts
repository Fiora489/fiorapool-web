import 'server-only'

import { createClient } from '@/lib/supabase/server'

const MAX_QUERY_LENGTH = 200
const TRENDING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const TRENDING_SAMPLE_LIMIT = 1000 // rows fetched for in-memory rank

// ---------------------------------------------------------------------------
// logHubSearch — records an anonymous search query for trending analytics.
// Silently ignores queries shorter than 3 characters (enforced by DB CHECK).
// ---------------------------------------------------------------------------

export async function logHubSearch(queryText: string): Promise<void> {
  const trimmed = queryText?.trim() ?? ''
  if (trimmed.length < 3) return

  const supabase = await createClient()
  const { error } = await supabase.from('hub_search_log').insert({
    query_text: trimmed.toLowerCase().slice(0, MAX_QUERY_LENGTH),
  })

  if (error) {
    // Non-fatal — telemetry should never surface to the user
    console.error('[logHubSearch]', error)
  }
}

// ---------------------------------------------------------------------------
// getTrendingSearches — returns the top-N most-searched queries in the
// past 7 days, ranked by frequency in-memory.
// ---------------------------------------------------------------------------

export async function getTrendingSearches(limit = 10): Promise<string[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - TRENDING_WINDOW_MS).toISOString()

  const { data, error } = await supabase
    .from('hub_search_log')
    .select('query_text')
    .gte('searched_at', since)
    .limit(TRENDING_SAMPLE_LIMIT)

  if (error || !data) {
    console.error('[getTrendingSearches]', error)
    return []
  }

  // Rank by frequency
  const counts = new Map<string, number>()
  for (const row of data) {
    const t = row.query_text as string
    counts.set(t, (counts.get(t) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([text]) => text)
}
