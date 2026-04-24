import { describe, expect, it } from 'vitest'
import { lintBuild, type LintBuild } from './lint'

const baseBuild: LintBuild = {
  blocks: {
    boots:       { items: [{ id: 3009 }] },
    core:        { items: [{ id: 3031 }] },
    full:        { items: [{ id: 3031 }, { id: 3072 }, { id: 3074 }, { id: 3071 }, { id: 3078 }, { id: 3033 }] },
    situational: { items: [{ id: 6609 }] },
  },
  buildTags: [],
  runePage: { keystoneId: 8021 },
  isPublic: false,
  isApScalerChampion: false,
  apMatchupCount: 0,
}

describe('lintBuild', () => {
  it('returns no warnings for a clean build', () => {
    expect(lintBuild(baseBuild)).toHaveLength(0)
  })

  // ---------------------------------------------------------------------------
  // no-mr-vs-ap
  // ---------------------------------------------------------------------------

  describe('no-mr-vs-ap', () => {
    it('fires when tagged anti-ap with no MR item', () => {
      const build: LintBuild = {
        ...baseBuild,
        buildTags: ['anti-ap'],
        blocks: { boots: { items: [{ id: 3009 }] }, core: { items: [{ id: 3031 }] } },
      }
      const w = lintBuild(build).find(w => w.ruleId === 'no-mr-vs-ap')
      expect(w).toBeDefined()
      expect(w!.severity).toBe('warn')
    })

    it('does not fire when tagged anti-ap but has an MR item', () => {
      const build: LintBuild = {
        ...baseBuild,
        buildTags: ['anti-ap'],
        blocks: { boots: { items: [{ id: 3009 }] }, core: { items: [{ id: 3065 }] } },
      }
      expect(lintBuild(build).find(w => w.ruleId === 'no-mr-vs-ap')).toBeUndefined()
    })

    it('fires when apMatchupCount >= 2 with no MR item', () => {
      const build: LintBuild = {
        ...baseBuild,
        apMatchupCount: 2,
        blocks: { boots: { items: [{ id: 3009 }] } },
      }
      expect(lintBuild(build).find(w => w.ruleId === 'no-mr-vs-ap')).toBeDefined()
    })

    it('does not fire when neither anti-ap tag nor AP matchups', () => {
      const build: LintBuild = { ...baseBuild, blocks: { boots: { items: [{ id: 3009 }] } } }
      expect(lintBuild(build).find(w => w.ruleId === 'no-mr-vs-ap')).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // missing-keystone
  // ---------------------------------------------------------------------------

  describe('missing-keystone', () => {
    it('fires when rune page has no keystone', () => {
      const build: LintBuild = { ...baseBuild, runePage: { keystoneId: null } }
      const w = lintBuild(build).find(w => w.ruleId === 'missing-keystone')
      expect(w).toBeDefined()
      expect(w!.severity).toBe('error')
    })

    it('does not fire when no rune page is linked', () => {
      const build: LintBuild = { ...baseBuild, runePage: null }
      expect(lintBuild(build).find(w => w.ruleId === 'missing-keystone')).toBeUndefined()
    })

    it('does not fire when keystone is set', () => {
      expect(lintBuild(baseBuild).find(w => w.ruleId === 'missing-keystone')).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // too-many-ad-for-ap-scaler
  // ---------------------------------------------------------------------------

  describe('too-many-ad-for-ap-scaler', () => {
    it('fires when AP scaler has >= 3 AD items', () => {
      // baseBuild core (3031) + full (3031, 3072, 3074, 3071, 3078, 3033) → many AD items
      const build: LintBuild = { ...baseBuild, isApScalerChampion: true }
      expect(lintBuild(build).find(w => w.ruleId === 'too-many-ad-for-ap-scaler')).toBeDefined()
    })

    it('does not fire for a non-AP scaler champion', () => {
      expect(lintBuild(baseBuild).find(w => w.ruleId === 'too-many-ad-for-ap-scaler')).toBeUndefined()
    })

    it('does not fire when AP scaler has < 3 AD items', () => {
      const build: LintBuild = {
        ...baseBuild,
        isApScalerChampion: true,
        blocks: {
          boots:  { items: [{ id: 3009 }] },
          core:   { items: [{ id: 3089 }] },  // Rabadon — not AD
          full:   { items: [{ id: 3089 }, { id: 3135 }, { id: 3031 }] },  // 1 AD item
          situational: { items: [] },
        },
      }
      expect(lintBuild(build).find(w => w.ruleId === 'too-many-ad-for-ap-scaler')).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // boots-count
  // ---------------------------------------------------------------------------

  describe('boots-count', () => {
    it('fires when boots block is missing', () => {
      const build: LintBuild = { ...baseBuild, blocks: { core: { items: [{ id: 3031 }] } } }
      expect(lintBuild(build).find(w => w.ruleId === 'boots-count')).toBeDefined()
    })

    it('fires when boots block has 0 items', () => {
      const build: LintBuild = { ...baseBuild, blocks: { ...baseBuild.blocks, boots: { items: [] } } }
      expect(lintBuild(build).find(w => w.ruleId === 'boots-count')).toBeDefined()
    })

    it('fires when boots block has 2 items', () => {
      const build: LintBuild = {
        ...baseBuild,
        blocks: { ...baseBuild.blocks, boots: { items: [{ id: 3009 }, { id: 3111 }] } },
      }
      expect(lintBuild(build).find(w => w.ruleId === 'boots-count')).toBeDefined()
    })

    it('does not fire with exactly 1 boots item', () => {
      expect(lintBuild(baseBuild).find(w => w.ruleId === 'boots-count')).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // final-build-size
  // ---------------------------------------------------------------------------

  describe('final-build-size', () => {
    it('fires when full block has more than 6 items', () => {
      const build: LintBuild = {
        ...baseBuild,
        blocks: {
          ...baseBuild.blocks,
          full: { items: [1, 2, 3, 4, 5, 6, 7].map(id => ({ id })) },
        },
      }
      expect(lintBuild(build).find(w => w.ruleId === 'final-build-size')).toBeDefined()
    })

    it('does not fire with exactly 6 items', () => {
      expect(lintBuild(baseBuild).find(w => w.ruleId === 'final-build-size')).toBeUndefined()
    })

    it('does not fire when full block is absent', () => {
      const build: LintBuild = { ...baseBuild, blocks: { boots: { items: [{ id: 3009 }] } } }
      expect(lintBuild(build).find(w => w.ruleId === 'final-build-size')).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // situational-empty
  // ---------------------------------------------------------------------------

  describe('situational-empty', () => {
    it('fires info for a public build with no situational items', () => {
      const build: LintBuild = {
        ...baseBuild,
        isPublic: true,
        blocks: { ...baseBuild.blocks, situational: { items: [] } },
      }
      const w = lintBuild(build).find(w => w.ruleId === 'situational-empty')
      expect(w).toBeDefined()
      expect(w!.severity).toBe('info')
    })

    it('does not fire for a private build with no situational items', () => {
      const build: LintBuild = {
        ...baseBuild,
        isPublic: false,
        blocks: { ...baseBuild.blocks, situational: { items: [] } },
      }
      expect(lintBuild(build).find(w => w.ruleId === 'situational-empty')).toBeUndefined()
    })

    it('does not fire for a public build that has situational items', () => {
      const build: LintBuild = { ...baseBuild, isPublic: true }
      expect(lintBuild(build).find(w => w.ruleId === 'situational-empty')).toBeUndefined()
    })
  })
})
