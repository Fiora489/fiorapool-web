// Build duplicate detection via weighted per-block Jaccard similarity.
import { BLOCK_TYPES, type BlockType } from '@/lib/types/builds'

/** How much each block type contributes to the similarity score. */
const BLOCK_WEIGHTS: Record<BlockType, number> = {
  core:        5,
  early:       4,
  starting:    3,
  boots:       2,
  situational: 1,
  full:        1,
}

type BuildBlocks = Partial<Record<BlockType, { items: Array<{ id: number }> }>>

function toSet(block: { items: Array<{ id: number }> } | undefined): Set<number> {
  return new Set((block?.items ?? []).map(i => i.id))
}

/**
 * Computes a weighted Jaccard similarity score between two builds.
 *
 * For each block type the Jaccard index is computed over item-ID sets, then
 * multiplied by the block's weight. The final score is the weighted sum of
 * intersections divided by the weighted sum of unions.
 *
 * Returns a value in [0, 1]. Both-empty builds return 1.0 (identical).
 */
export function scoreSimilarity(buildA: BuildBlocks, buildB: BuildBlocks): number {
  let weightedIntersection = 0
  let weightedUnion = 0

  for (const blockType of BLOCK_TYPES) {
    const setA = toSet(buildA[blockType])
    const setB = toSet(buildB[blockType])

    if (setA.size === 0 && setB.size === 0) continue

    const weight = BLOCK_WEIGHTS[blockType]

    let intersection = 0
    for (const id of setA) {
      if (setB.has(id)) intersection++
    }
    const union = new Set([...setA, ...setB]).size

    weightedIntersection += weight * intersection
    weightedUnion += weight * union
  }

  if (weightedUnion === 0) return 1
  return weightedIntersection / weightedUnion
}

export interface DupeMatch {
  buildId: string
  similarity: number
}

/**
 * Compares `candidate` against every build in `ownedBuilds`.
 * Returns matches at or above `threshold` (default 0.9), sorted by
 * descending similarity.
 */
export function detectDupes(
  candidate: BuildBlocks,
  ownedBuilds: Array<{ id: string; blocks: BuildBlocks }>,
  threshold = 0.9,
): DupeMatch[] {
  return ownedBuilds
    .map(b => ({ buildId: b.id, similarity: scoreSimilarity(candidate, b.blocks) }))
    .filter(m => m.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
}
