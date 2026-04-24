import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { BlockType, HubBuildCard, RoleId } from '@/lib/types/builds'

// ---------------------------------------------------------------------------
// Pure: item-frequency vector
// ---------------------------------------------------------------------------

/** Maps item ID → occurrence count across all blocks of a build. */
export type ItemVector = Map<number, number>

/**
 * Build a frequency vector from a build's block map.
 * Items that appear in multiple blocks are counted once per appearance.
 */
export function buildVector(
  blocks: Partial<Record<BlockType, { items: Array<{ id: number }> }>>,
): ItemVector {
  const freq = new Map<number, number>()
  for (const block of Object.values(blocks)) {
    if (!block) continue
    for (const item of block.items) {
      freq.set(item.id, (freq.get(item.id) ?? 0) + 1)
    }
  }
  return freq
}

// ---------------------------------------------------------------------------
// Pure: cosine similarity
// ---------------------------------------------------------------------------

/**
 * Cosine similarity between two item-frequency vectors.
 * Returns a value in [0, 1]; returns 0 for zero vectors.
 */
export function cosineSimilarity(a: ItemVector, b: ItemVector): number {
  if (a.size === 0 || b.size === 0) return 0

  let dot = 0
  let magA = 0

  for (const [id, countA] of a) {
    dot += countA * (b.get(id) ?? 0)
    magA += countA * countA
  }

  let magB = 0
  for (const [, countB] of b) {
    magB += countB * countB
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

// ---------------------------------------------------------------------------
// Server: find similar public builds for a champion
// ---------------------------------------------------------------------------

export interface SimilarBuild {
  build: HubBuildCard
  similarity: number
}

/**
 * Find public builds for `championId` that are most similar to
 * `referenceBlocks` by cosine similarity over item-frequency vectors.
 *
 * Fetches up to 200 candidate builds from the DB and scores them locally.
 * Returns up to `limit` results sorted by descending similarity.
 */
export async function findSimilar(
  referenceBlocks: Partial<Record<BlockType, { items: Array<{ id: number }> }>>,
  championId: string,
  limit = 5,
): Promise<SimilarBuild[]> {
  const supabase = await createClient()

  // Fetch candidate build metadata
  const { data: buildData, error: buildError } = await supabase
    .from('custom_builds')
    .select(
      'id, champion_id, name, description_md, roles, build_tags, patch_tag, updated_at, created_at, user_id',
    )
    .eq('is_public', true)
    .eq('champion_id', championId)
    .limit(200)

  if (buildError || !buildData) {
    console.error('[findSimilar] builds', buildError)
    return []
  }

  const ids = buildData.map(r => r.id as string)
  if (ids.length === 0) return []

  // Fetch blocks for all candidates in a single round-trip
  const { data: blocksData, error: blocksError } = await supabase
    .from('custom_build_blocks')
    .select('build_id, block_type, items')
    .in('build_id', ids)

  if (blocksError) {
    console.error('[findSimilar] blocks', blocksError)
    return []
  }

  // Group blocks by build_id
  const blocksByBuild = new Map<
    string,
    Partial<Record<BlockType, { items: Array<{ id: number }> }>>
  >()
  for (const block of blocksData ?? []) {
    const bid = block.build_id as string
    if (!blocksByBuild.has(bid)) blocksByBuild.set(bid, {})
    const bt = block.block_type as BlockType
    const items = (block.items as Array<{ id: number }>) ?? []
    blocksByBuild.get(bid)![bt] = { items }
  }

  const refVec = buildVector(referenceBlocks)

  return buildData
    .map(row => {
      const blocks = blocksByBuild.get(row.id as string) ?? {}
      const similarity = cosineSimilarity(refVec, buildVector(blocks))
      const build: HubBuildCard = {
        id: row.id as string,
        championId: row.champion_id as string,
        name: row.name as string,
        description_md: row.description_md as string,
        roles: row.roles as RoleId[],
        buildTags: row.build_tags as string[],
        patchTag: row.patch_tag as string,
        updatedAt: row.updated_at as string,
        createdAt: row.created_at as string,
        authorId: row.user_id as string,
        bookmarkCount: 0,
      }
      return { build, similarity }
    })
    .filter(s => s.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

// ---------------------------------------------------------------------------
// Server: public similar-build endpoint (Phase 59 refinement)
// ---------------------------------------------------------------------------

export interface ListSimilarOptions {
  /** Minimum cosine similarity to include (default 0.1 — drops near-zero matches). */
  rankFloor?: number
  /** If provided, restrict to builds on this patch tag (defaults to source build's patch). */
  patchTag?: string | null
}

/**
 * Find public builds similar to `buildId` by cosine item-frequency similarity.
 *
 * Respects a rank floor (default 0.1) and optionally restricts results to a
 * specific patch. The source build itself is excluded from results.
 */
export async function listSimilarPublic(
  buildId: string,
  limit = 5,
  options: ListSimilarOptions = {},
): Promise<SimilarBuild[]> {
  const supabase = await createClient()

  // Fetch the reference build's metadata + blocks in parallel
  const [{ data: refBuild }, { data: refBlocks }] = await Promise.all([
    supabase
      .from('custom_builds')
      .select('champion_id, patch_tag')
      .eq('id', buildId)
      .eq('is_public', true)
      .maybeSingle(),
    supabase
      .from('custom_build_blocks')
      .select('block_type, items')
      .eq('build_id', buildId),
  ])

  if (!refBuild || !refBlocks?.length) return []

  // Map array rows to the block-map shape findSimilar expects
  const referenceBlocks: Partial<Record<BlockType, { items: Array<{ id: number }> }>> = {}
  for (const row of refBlocks) {
    referenceBlocks[row.block_type as BlockType] = {
      items: (row.items as Array<{ id: number }>) ?? [],
    }
  }

  // Over-fetch so we have candidates to filter
  const candidates = await findSimilar(
    referenceBlocks,
    refBuild.champion_id as string,
    limit * 4,
  )

  const rankFloor = options.rankFloor ?? 0.1
  const targetPatch =
    options.patchTag !== undefined ? options.patchTag : (refBuild.patch_tag as string | null)

  return candidates
    .filter(s => s.build.id !== buildId)
    .filter(s => s.similarity >= rankFloor)
    .filter(s => !targetPatch || s.build.patchTag === targetPatch)
    .slice(0, limit)
}
