import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('server-only', () => ({}))

import { validateRunePage, RuneValidationError } from './rune-tree'
import type { RuneTree, RunePageInput } from '@/lib/types/builds'

// ---------------------------------------------------------------------------
// Minimal fixture tree (Precision + Domination)
// ---------------------------------------------------------------------------

const FIXTURE_TREE: RuneTree = [
  {
    id: 8000,
    key: 'Precision',
    name: 'Precision',
    icon: 'perk-images/Styles/7201_Precision.png',
    slots: [
      { runes: [{ id: 8005, key: 'PressTheAttack', name: 'Press the Attack', icon: '' }, { id: 8021, key: 'FleetFootwork', name: 'Fleet Footwork', icon: '' }, { id: 8010, key: 'Conqueror', name: 'Conqueror', icon: '' }] },
      { runes: [{ id: 9101, key: 'Overheal', name: 'Overheal', icon: '' }, { id: 9111, key: 'Triumph', name: 'Triumph', icon: '' }, { id: 8009, key: 'PresenceOfMind', name: 'Presence of Mind', icon: '' }] },
      { runes: [{ id: 9104, key: 'LegendAlacrity', name: 'Legend: Alacrity', icon: '' }, { id: 9105, key: 'LegendTenacity', name: 'Legend: Tenacity', icon: '' }, { id: 9103, key: 'LegendBloodline', name: 'Legend: Bloodline', icon: '' }] },
      { runes: [{ id: 8014, key: 'CoupDeGrace', name: 'Coup de Grace', icon: '' }, { id: 8017, key: 'CutDown', name: 'Cut Down', icon: '' }, { id: 8299, key: 'LastStand', name: 'Last Stand', icon: '' }] },
    ],
  },
  {
    id: 8100,
    key: 'Domination',
    name: 'Domination',
    icon: 'perk-images/Styles/7200_Domination.png',
    slots: [
      { runes: [{ id: 8112, key: 'Electrocute', name: 'Electrocute', icon: '' }, { id: 8124, key: 'Predator', name: 'Predator', icon: '' }, { id: 8128, key: 'DarkHarvest', name: 'Dark Harvest', icon: '' }] },
      { runes: [{ id: 8126, key: 'TasteOfBlood', name: 'Taste of Blood', icon: '' }, { id: 8139, key: 'ZombieWard', name: 'Zombie Ward', icon: '' }, { id: 8143, key: 'GhostPoro', name: 'Ghost Poro', icon: '' }] },
      { runes: [{ id: 8137, key: 'EyeballCollection', name: 'Eyeball Collection', icon: '' }, { id: 8120, key: 'TreasureHunter', name: 'Treasure Hunter', icon: '' }, { id: 8138, key: 'ImmortalShieldbow', name: 'Ингибиторный', icon: '' }] },
      { runes: [{ id: 8135, key: 'RavenousHunter', name: 'Relentless Hunter', icon: '' }, { id: 8134, key: 'IngressHunter', name: 'Ingress Hunter', icon: '' }, { id: 8105, key: 'RelentlessHunter', name: 'Ravenous Hunter', icon: '' }] },
    ],
  },
]

const VALID_PAGE: RunePageInput = {
  name: 'Conqueror Fiora',
  primaryStyle: 8000,
  keystone: 8010,
  primaryMinors: [9111, 9104, 8014],
  secondaryStyle: 8100,
  secondaryMinors: [8126, 8137],
  shards: [5008, 5002, 5001],
}

describe('validateRunePage', () => {
  it('passes for a valid rune page', () => {
    expect(() => validateRunePage(VALID_PAGE, FIXTURE_TREE)).not.toThrow()
  })

  it('throws when primary style is unknown', () => {
    const page: RunePageInput = { ...VALID_PAGE, primaryStyle: 9999 }
    expect(() => validateRunePage(page, FIXTURE_TREE))
      .toThrowError(RuneValidationError)
  })

  it('throws when keystone does not belong to primary path', () => {
    // Use a Domination keystone (8112) with Precision primary (8000)
    const page: RunePageInput = { ...VALID_PAGE, keystone: 8112 }
    expect(() => validateRunePage(page, FIXTURE_TREE))
      .toThrowError(RuneValidationError)
  })

  it('throws when primary minor does not match its row', () => {
    // 9104 belongs to row 2, not row 1
    const page: RunePageInput = { ...VALID_PAGE, primaryMinors: [9104, 9104, 8014] }
    expect(() => validateRunePage(page, FIXTURE_TREE))
      .toThrowError(RuneValidationError)
  })

  it('throws when primary and secondary paths are the same', () => {
    const page: RunePageInput = { ...VALID_PAGE, secondaryStyle: 8000 }
    expect(() => validateRunePage(page, FIXTURE_TREE))
      .toThrowError(RuneValidationError)
  })

  it('throws when secondary minor is not in secondary path', () => {
    // 9101 is a Precision rune, not Domination
    const page: RunePageInput = { ...VALID_PAGE, secondaryMinors: [9101, 8137] }
    expect(() => validateRunePage(page, FIXTURE_TREE))
      .toThrowError(RuneValidationError)
  })

  it('throws when two secondary minors are from the same row', () => {
    // 8126 and 8139 are both in Domination slot[1]
    const page: RunePageInput = { ...VALID_PAGE, secondaryMinors: [8126, 8139] }
    expect(() => validateRunePage(page, FIXTURE_TREE))
      .toThrowError(RuneValidationError)
  })

  it('throws for an invalid shard id', () => {
    const page: RunePageInput = { ...VALID_PAGE, shards: [5008, 9999, 5001] }
    expect(() => validateRunePage(page, FIXTURE_TREE))
      .toThrowError(RuneValidationError)
  })

  it('exposes field name on error', () => {
    const page: RunePageInput = { ...VALID_PAGE, secondaryStyle: 8000 }
    try {
      validateRunePage(page, FIXTURE_TREE)
      expect.fail('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(RuneValidationError)
      expect((e as RuneValidationError).field).toBe('secondaryStyle')
    }
  })
})
