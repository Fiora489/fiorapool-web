import 'server-only'

import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Trending searches
// ---------------------------------------------------------------------------

/**
 * Returns the top-N most-searched queries over the specified window,
 * read from the `trending_searches_view` materialised in the migration.
 */
export async function getTrendingSearches(
  window: '7d' | '30d' = '7d',
  limit = 10,
): Promise<string[]> {
  const supabase = await createClient()
  const orderCol = window === '30d' ? 'count_30d' : 'count_7d'

  const { data, error } = await supabase
    .from('trending_searches_view')
    .select('query_text')
    .order(orderCol, { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('[getTrendingSearches]', error)
    return []
  }

  return data.map(r => r.query_text as string)
}

// ---------------------------------------------------------------------------
// Trending builds
// ---------------------------------------------------------------------------

export interface TrendingBuild {
  id: string
  championId: string
  name: string
  bookmarkCount: number
}

/**
 * Returns up to `limit` trending builds ranked by bookmark count (Phase 60
 * `build_bookmark_counts` view). Falls back to recency when no bookmark data
 * exists (pre-Phase-60 state or empty dataset).
 *
 * Ranking formula: bookmark count DESC → updated_at DESC (for ties).
 */
export async function getTrendingBuilds(limit = 10): Promise<TrendingBuild[]> {
  const supabase = await createClient()

  // Step 1: fetch top bookmark counts
  const { data: bkData, error: bkErr } = await supabase
    .from('build_bookmark_counts')
    .select('build_id, count')
    .order('count', { ascending: false })
    .limit(limit * 3) // over-fetch; some builds may be private

  if (bkErr || !bkData?.length) {
    // Fallback: most recently updated public builds
    const { data: recent } = await supabase
      .from('custom_builds')
      .select('id, champion_id, name')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(limit)

    return (recent ?? []).map(r => ({
      id: r.id as string,
      championId: r.champion_id as string,
      name: r.name as string,
      bookmarkCount: 0,
    }))
  }

  // Step 2: hydrate build metadata for top bookmarked IDs
  const buildIds = bkData.map(r => r.build_id as string)
  const { data: builds } = await supabase
    .from('custom_builds')
    .select('id, champion_id, name')
    .in('id', buildIds)
    .eq('is_public', true)
    .limit(limit)

  const countMap = new Map(bkData.map(r => [r.build_id as string, Number(r.count)]))

  return (builds ?? [])
    .map(r => ({
      id: r.id as string,
      championId: r.champion_id as string,
      name: r.name as string,
      bookmarkCount: countMap.get(r.id as string) ?? 0,
    }))
    .sort((a, b) => b.bookmarkCount - a.bookmarkCount)
    .slice(0, limit)
}
