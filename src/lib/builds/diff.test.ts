import { describe, expect, it } from 'vitest'
import { diffBlocks, diffBuilds } from './diff'
import type {
  BuildBlockRow,
  CustomBuildFull,
  RunePageRow,
} from '@/lib/types/builds'

// ---------------------------------------------------------------------------
// Minimal fixture helpers
// ---------------------------------------------------------------------------

function makeBlock(
  buildId: string,
  blockType: BuildBlockRow['block_type'],
  itemIds: number[],
): BuildBlockRow {
  return {
    build_id: buildId,
    block_type: blockType,
    position: 0,
    items: itemIds.map((id) => ({ id, powerSpike: false })),
    power_spikes: [],
    gold_total: 0,
  }
}

function makeRunePage(id: string, keystone: number): RunePageRow {
  return {
    id,
    user_id: 'user1',
    name: 'page',
    primary_style: 8000,
    keystone,
    primary_minors: [8009, 8014, 8017],
    secondary_style: 8200,
    secondary_minors: [8233, 8237],
    shards: [5008, 5008, 5001],
    created_at: '',
    updated_at: '',
  }
}

function makeBuild(
  id: string,
  overrides: Partial<{
    blocks: BuildBlockRow[]
    spell1: string
    spell2: string
    tags: string[]
    runePage: RunePageRow | null
  }> = {},
): CustomBuildFull {
  return {
    build: {
      id,
      user_id: 'user1',
      champion_id: 'Fiora',
      name: 'Test Build',
      description_md: '',
      roles: ['TOP'],
      build_tags: overrides.tags ?? [],
      patch_tag: '14.10',
      last_validated_patch: null,
      combos: [],
      max_priority: null,
      warding_note: null,
      trinket: null,
      spell1: overrides.spell1 ?? 'Flash',
      spell2: overrides.spell2 ?? 'Ignite',
      spell_alt_note: null,
      rune_page_id: overrides.runePage?.id ?? null,
      skill_order: null,
      is_public: true,
      opt_in_aggregate: false,
      created_at: '',
      updated_at: '',
    },
    blocks: overrides.blocks ?? [],
    matchupNotes: [],
    itemSwaps: [],
    runePage: overrides.runePage !== undefined ? overrides.runePage : null,
  }
}

// ---------------------------------------------------------------------------
// diffBlocks tests
// ---------------------------------------------------------------------------

describe('diffBlocks', () => {
  it('identical blocks → all unchanged', () => {
    const blocks = [makeBlock('a', 'core', [1001, 1002, 1003])]
    const result = diffBlocks(blocks, blocks)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      blockType: 'core',
      status: 'unchanged',
      added: [],
      removed: [],
    })
  })

  it('one item added to core block → status changed, added contains item ID', () => {
    const blocksA = [makeBlock('a', 'core', [1001, 1002])]
    const blocksB = [makeBlock('b', 'core', [1001, 1002, 3001])]
    const result = diffBlocks(blocksA, blocksB)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      blockType: 'core',
      status: 'changed',
      added: [3001],
      removed: [],
    })
  })

  it('one item removed from boots block → status changed, removed contains item ID', () => {
    const blocksA = [makeBlock('a', 'boots', [3006, 3111])]
    const blocksB = [makeBlock('b', 'boots', [3006])]
    const result = diffBlocks(blocksA, blocksB)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      blockType: 'boots',
      status: 'changed',
      added: [],
      removed: [3111],
    })
  })

  it('block present in A but not in B → status removed', () => {
    const blocksA = [makeBlock('a', 'situational', [1001])]
    const blocksB: BuildBlockRow[] = []
    const result = diffBlocks(blocksA, blocksB)
    const sit = result.find((r) => r.blockType === 'situational')
    expect(sit?.status).toBe('removed')
    expect(sit?.removed).toContain(1001)
  })

  it('block present in B but not in A → status added', () => {
    const blocksA: BuildBlockRow[] = []
    const blocksB = [makeBlock('b', 'early', [2015])]
    const result = diffBlocks(blocksA, blocksB)
    const early = result.find((r) => r.blockType === 'early')
    expect(early?.status).toBe('added')
    expect(early?.added).toContain(2015)
  })

  it('item order does not matter — same IDs → unchanged', () => {
    const blocksA = [makeBlock('a', 'full', [10, 20, 30])]
    const blocksB = [makeBlock('b', 'full', [30, 10, 20])]
    const result = diffBlocks(blocksA, blocksB)
    expect(result[0].status).toBe('unchanged')
  })
})

// ---------------------------------------------------------------------------
// diffBuilds tests
// ---------------------------------------------------------------------------

describe('diffBuilds', () => {
  it('identical builds → no changes anywhere', () => {
    const rp = makeRunePage('rp1', 8000)
    const build = makeBuild('a', {
      blocks: [makeBlock('a', 'core', [1001])],
      runePage: rp,
      tags: ['poke', 'split'],
    })
    const result = diffBuilds(build, build)
    expect(result.runePageChanged).toBe(false)
    expect(result.spellsChanged).toBe(false)
    expect(result.tagsChanged).toBe(false)
    expect(result.blocks.every((b) => b.status === 'unchanged')).toBe(true)
  })

  it('rune page ID differs → runePageChanged true', () => {
    const buildA = makeBuild('a', { runePage: makeRunePage('rp1', 8000) })
    const buildB = makeBuild('b', { runePage: makeRunePage('rp2', 8000) })
    const result = diffBuilds(buildA, buildB)
    expect(result.runePageChanged).toBe(true)
  })

  it('same rune page ID and keystone → runePageChanged false', () => {
    const rp = makeRunePage('rp1', 8000)
    const buildA = makeBuild('a', { runePage: rp })
    const buildB = makeBuild('b', { runePage: { ...rp } })
    const result = diffBuilds(buildA, buildB)
    expect(result.runePageChanged).toBe(false)
  })

  it('spell1 differs → spellsChanged true', () => {
    const buildA = makeBuild('a', { spell1: 'Flash', spell2: 'Ignite' })
    const buildB = makeBuild('b', { spell1: 'Teleport', spell2: 'Ignite' })
    const result = diffBuilds(buildA, buildB)
    expect(result.spellsChanged).toBe(true)
  })

  it('tags differ → tagsChanged true', () => {
    const buildA = makeBuild('a', { tags: ['poke'] })
    const buildB = makeBuild('b', { tags: ['poke', 'split'] })
    const result = diffBuilds(buildA, buildB)
    expect(result.tagsChanged).toBe(true)
  })

  it('same tags but different order → tagsChanged false', () => {
    const buildA = makeBuild('a', { tags: ['split', 'poke', 'tank'] })
    const buildB = makeBuild('b', { tags: ['poke', 'tank', 'split'] })
    const result = diffBuilds(buildA, buildB)
    expect(result.tagsChanged).toBe(false)
  })

  it('buildAId and buildBId are set correctly in result', () => {
    const buildA = makeBuild('build-aaa')
    const buildB = makeBuild('build-bbb')
    const result = diffBuilds(buildA, buildB)
    expect(result.buildAId).toBe('build-aaa')
    expect(result.buildBId).toBe('build-bbb')
  })
})
