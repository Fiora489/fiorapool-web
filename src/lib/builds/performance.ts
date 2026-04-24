import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { scoreSimilarity } from '@/lib/builds/dupe'
import type { BuildStats, AggregateStats, BlockType, BuildBlockItem } from '@/lib/types/builds'

// ---------------------------------------------------------------------------
// getBuildStats
// ---------------------------------------------------------------------------

/**
 * Returns personal win/loss stats for a build belonging to a specific user.
 * Returns zeros with lastTaggedAt: null when no match tags exist yet.
 */
export async function getBuildStats(
  buildId: string,
  userId: string,
): Promise<BuildStats> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('build_match_tags')
    .select('won, detected_at')
    .eq('build_id', buildId)
    .eq('user_id', userId)

  if (error || !data || data.length === 0) {
    return {
      buildId,
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      lastTaggedAt: null,
    }
  }

  const totalGames = data.length
  const wins = data.filter(r => r.won).length
  const losses = totalGames - wins
  const winRate = totalGames > 0 ? wins / totalGames : 0

  // Find the most recent detected_at
  const lastTaggedAt = data.reduce<string | null>((latest, r) => {
    if (!r.detected_at) return latest
    if (!latest) return r.detected_at
    return r.detected_at > latest ? r.detected_at : latest
  }, null)

  return { buildId, totalGames, wins, losses, winRate, lastTaggedAt }
}

// ---------------------------------------------------------------------------
// getAggregateStats
// ---------------------------------------------------------------------------

/**
 * Returns community-wide win rate stats for a build, only counting
 * contributions from users who have opted in via is_public + opt_in_aggregate.
 */
export async function getAggregateStats(buildId: string): Promise<AggregateStats> {
  const supabase = await createClient()

  // Join to custom_builds to enforce opt-in filter
  const { data, error } = await supabase
    .from('build_match_tags')
    .select('won, user_id, custom_builds!inner(is_public, opt_in_aggregate)')
    .eq('build_id', buildId)
    .eq('custom_builds.is_public', true)
    .eq('custom_builds.opt_in_aggregate', true)

  if (error || !data || data.length === 0) {
    return { buildId, totalGames: 0, winRate: 0, contributorCount: 0 }
  }

  const totalGames = data.length
  const wins = data.filter(r => r.won).length
  const winRate = totalGames > 0 ? wins / totalGames : 0
  const contributorCount = new Set(data.map(r => r.user_id)).size

  return { buildId, totalGames, winRate, contributorCount }
}

// ---------------------------------------------------------------------------
// autoTagBuildForMatch — internal helpers
// ---------------------------------------------------------------------------

type BlockMap = Partial<Record<BlockType, { items: Array<{ id: number }> }>>

/** Converts a flat item-ID array (from match JSONB) into the BlockMap shape used by scoreSimilarity. */
export function matchItemsToBlockMap(itemIds: number[]): BlockMap {
  // Match items are typically final/full build items — map to 'core' block for comparison.
  return {
    core: { items: itemIds.filter(id => id > 0).map(id => ({ id })) },
  }
}

/** Converts BuildBlockItem rows (grouped by block_type) into a BlockMap. */
export function buildBlocksToBlockMap(
  blocks: Array<{ block_type: BlockType; items: BuildBlockItem[] }>,
): BlockMap {
  const map: BlockMap = {}
  for (const b of blocks) {
    map[b.block_type] = { items: b.items.map(i => ({ id: i.id })) }
  }
  return map
}

// ---------------------------------------------------------------------------
// autoTagBuildForMatch
// ---------------------------------------------------------------------------

const SIMILARITY_THRESHOLD = 0.8

/**
 * For a given match + user, finds all of the user's custom builds whose items
 * are similar enough (≥ 0.8 weighted Jaccard) to the items used in the match,
 * then inserts build_match_tags rows and returns the tagged build IDs.
 *
 * Returns an empty array if match data is unavailable or no builds match.
 */
export async function autoTagBuildForMatch(
  matchId: string,
  userId: string,
): Promise<string[]> {
  const supabase = await createClient()

  // 1. Fetch the match row — user_id is stored directly, items in items_json
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, champion_id, items_json, win, user_id')
    .eq('id', matchId)
    .eq('user_id', userId)
    .maybeSingle()

  if (matchError || !match) return []

  // 2. Extract item IDs from items_json
  // items_json may be an array of item-ID numbers or objects with an `id` field
  const rawItems = match.items_json
  const rawItemIds: number[] = []

  if (Array.isArray(rawItems)) {
    for (const entry of rawItems) {
      if (typeof entry === 'number' && entry > 0) {
        rawItemIds.push(entry)
      } else if (
        entry !== null &&
        typeof entry === 'object' &&
        !Array.isArray(entry) &&
        typeof (entry as Record<string, unknown>)['id'] === 'number'
      ) {
        const id = (entry as Record<string, unknown>)['id'] as number
        if (id > 0) rawItemIds.push(id)
      }
    }
  }

  if (rawItemIds.length === 0) return []

  const matchWon = match.win
  // champion_id in matches is a number; in custom_builds it's stored as a string
  const championIdStr = String(match.champion_id)

  // 3. Fetch user's custom builds for the same champion
  const { data: userBuilds, error: buildsError } = await supabase
    .from('custom_builds')
    .select('id')
    .eq('user_id', userId)
    .eq('champion_id', championIdStr)

  if (buildsError || !userBuilds || userBuilds.length === 0) return []

  const buildIds = userBuilds.map(b => b.id)

  // 4. Fetch build blocks for those builds
  const { data: allBlocks, error: blocksError } = await supabase
    .from('custom_build_blocks')
    .select('build_id, block_type, items')
    .in('build_id', buildIds)

  if (blocksError || !allBlocks) return []

  // 5. Group blocks by build
  const blocksByBuild = new Map<string, Array<{ block_type: BlockType; items: BuildBlockItem[] }>>()
  for (const b of allBlocks) {
    const existing = blocksByBuild.get(b.build_id) ?? []
    existing.push({
      block_type: b.block_type as BlockType,
      items: b.items as BuildBlockItem[],
    })
    blocksByBuild.set(b.build_id, existing)
  }

  // 6. Score each build against match items
  const matchBlockMap = matchItemsToBlockMap(rawItemIds)
  const taggedBuildIds: string[] = []

  for (const buildId of buildIds) {
    const blocks = blocksByBuild.get(buildId) ?? []
    const buildBlockMap = buildBlocksToBlockMap(blocks)
    const score = scoreSimilarity(matchBlockMap, buildBlockMap)
    if (score >= SIMILARITY_THRESHOLD) {
      taggedBuildIds.push(buildId)
    }
  }

  if (taggedBuildIds.length === 0) return []

  // 7. Upsert build_match_tags to avoid duplicates on replay
  const rows = taggedBuildIds.map(buildId => ({
    build_id: buildId,
    match_id: matchId,
    user_id: userId,
    won: matchWon,
    detected_at: new Date().toISOString(),
  }))

  const { error: insertError } = await supabase
    .from('build_match_tags')
    .upsert(rows, { onConflict: 'build_id,match_id,user_id' })

  if (insertError) {
    console.error('[autoTagBuildForMatch] upsert failed', insertError)
    return []
  }

  return taggedBuildIds
}
