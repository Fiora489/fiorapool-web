import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/ddragon', () => ({
  itemIconUrl: (id: number, patch: string) =>
    `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${id}.png`,
}))

import { getItemsCatalogue, getItem } from './items-catalogue'

const PATCH = '14.8.1'

const FIXTURE = {
  data: {
    '3031': {
      name: 'Infinity Edge',
      image: { full: '3031.png' },
      gold: { base: 700, purchasable: true, total: 3400, sell: 2380 },
      tags: ['Damage', 'CriticalStrike'],
      maps: { '11': true, '12': true },
      stats: { FlatCritChanceMod: 0.2, FlatPhysicalDamageMod: 70 },
      into: [],
      from: ['1038', '1037', '1018'],
    },
    '1038': {
      name: 'B.F. Sword',
      image: { full: '1038.png' },
      gold: { base: 1300, purchasable: true, total: 1300, sell: 910 },
      tags: ['Damage'],
      maps: { '11': true, '12': true },
      stats: { FlatPhysicalDamageMod: 40 },
      into: ['3031', '3072'],
      from: [],
    },
    '2003': {
      name: 'Health Potion',
      image: { full: '2003.png' },
      gold: { base: 50, purchasable: true, total: 50, sell: 20 },
      tags: ['Consumable', 'Healing'],
      maps: { '11': true, '12': true },
      stats: {},
    },
    '3340': {
      name: 'Stealth Ward',
      image: { full: '3340.png' },
      gold: { base: 0, purchasable: true, total: 0, sell: 0 },
      tags: ['Trinket', 'Vision'],
      maps: { '11': true, '12': true },
      stats: {},
    },
    '3901': {
      name: 'Shard of True Ice',
      image: { full: '3901.png' },
      gold: { base: 400, purchasable: true, total: 400, sell: 280 },
      tags: ['SpellDamage'],
      maps: { '11': false, '12': true },
      stats: { FlatMagicDamageMod: 25 },
    },
    '7000': {
      name: 'Sandshrike\'s Claw',
      image: { full: '7000.png' },
      gold: { base: 0, purchasable: false, total: 2900, sell: 0 },
      tags: ['Damage'],
      maps: { '11': true, '12': false },
      stats: { FlatPhysicalDamageMod: 55 },
    },
  },
}

function mockFetch(data: unknown): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  }))
}

beforeEach(() => mockFetch(FIXTURE))
afterEach(() => vi.unstubAllGlobals())

describe('getItemsCatalogue', () => {
  it('includes purchasable SR items with correct shape', async () => {
    const catalogue = await getItemsCatalogue(PATCH)
    expect(catalogue[3031]).toMatchObject({
      id: 3031,
      name: 'Infinity Edge',
      gold: 3400,
    })
  })

  it('excludes consumables', async () => {
    const catalogue = await getItemsCatalogue(PATCH)
    expect(catalogue[2003]).toBeUndefined()
  })

  it('excludes trinkets', async () => {
    const catalogue = await getItemsCatalogue(PATCH)
    expect(catalogue[3340]).toBeUndefined()
  })

  it('excludes items not on Summoner\'s Rift', async () => {
    const catalogue = await getItemsCatalogue(PATCH)
    expect(catalogue[3901]).toBeUndefined()
  })

  it('excludes unpurchasable items', async () => {
    const catalogue = await getItemsCatalogue(PATCH)
    expect(catalogue[7000]).toBeUndefined()
  })

  it('maps into[] and from[] strings to numbers', async () => {
    const catalogue = await getItemsCatalogue(PATCH)
    expect(catalogue[3031].from).toEqual([1038, 1037, 1018])
    expect(catalogue[1038].into).toContain(3031)
  })

  it('throws when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    await expect(getItemsCatalogue(PATCH)).rejects.toThrow('[items-catalogue]')
  })
})

describe('getItem', () => {
  it('returns the item record for a known id', async () => {
    const item = await getItem(PATCH, 3031)
    expect(item?.name).toBe('Infinity Edge')
  })

  it('returns null for a filtered-out item', async () => {
    expect(await getItem(PATCH, 2003)).toBeNull()
  })

  it('returns null for an unknown id', async () => {
    expect(await getItem(PATCH, 9999)).toBeNull()
  })
})
