import type {
  BuildBlockDiff,
  BuildBlockRow,
  BuildDiff,
  BlockType,
  CustomBuildFull,
  DiffStatus,
} from '@/lib/types/builds'

// All possible block types in canonical order
const ALL_BLOCK_TYPES: BlockType[] = [
  'starting',
  'early',
  'core',
  'situational',
  'full',
  'boots',
]

export function diffBlocks(
  blocksA: BuildBlockRow[],
  blocksB: BuildBlockRow[],
): BuildBlockDiff[] {
  // Collect all block types that appear in either A or B
  const typesInA = new Set(blocksA.map((b) => b.block_type))
  const typesInB = new Set(blocksB.map((b) => b.block_type))
  const allTypes = ALL_BLOCK_TYPES.filter(
    (t) => typesInA.has(t) || typesInB.has(t),
  )

  return allTypes.map((blockType) => {
    const blockA = blocksA.find((b) => b.block_type === blockType)
    const blockB = blocksB.find((b) => b.block_type === blockType)

    const idsA = new Set((blockA?.items ?? []).map((i) => i.id))
    const idsB = new Set((blockB?.items ?? []).map((i) => i.id))

    const added = [...idsB].filter((id) => !idsA.has(id))
    const removed = [...idsA].filter((id) => !idsB.has(id))

    let status: DiffStatus
    if (added.length === 0 && removed.length === 0) {
      status = 'unchanged'
    } else if (!blockA || idsA.size === 0) {
      status = 'added'
    } else if (!blockB || idsB.size === 0) {
      status = 'removed'
    } else {
      status = 'changed'
    }

    return { blockType, status, added, removed }
  })
}

export function diffBuilds(
  buildA: CustomBuildFull,
  buildB: CustomBuildFull,
): BuildDiff {
  const blocks = diffBlocks(buildA.blocks, buildB.blocks)

  const runePageChanged =
    buildA.runePage?.id !== buildB.runePage?.id ||
    buildA.runePage?.keystone !== buildB.runePage?.keystone

  const spellsChanged =
    buildA.build.spell1 !== buildB.build.spell1 ||
    buildA.build.spell2 !== buildB.build.spell2

  const sortedTagsA = [...(buildA.build.build_tags ?? [])].sort()
  const sortedTagsB = [...(buildB.build.build_tags ?? [])].sort()
  const tagsChanged =
    JSON.stringify(sortedTagsA) !== JSON.stringify(sortedTagsB)

  return {
    buildAId: buildA.build.id,
    buildBId: buildB.build.id,
    blocks,
    runePageChanged,
    spellsChanged,
    tagsChanged,
  }
}
