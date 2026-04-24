import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

vi.mock('crypto', () => ({
  randomBytes: vi.fn(() => Buffer.from('a'.repeat(32))),
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'mockhash'),
  })),
}))

import { createClient } from '@/lib/supabase/server'
import { generateApiKey, validateApiKey, listApiKeys, revokeApiKey } from './desktop-sync'

function makeSupabase(overrides: Record<string, unknown> = {}) {
  const base = {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  }
  return base
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('generateApiKey', () => {
  it('raw key starts with fp_', async () => {
    const row = {
      id: 'key-id-1',
      user_id: 'user-1',
      label: 'My Key',
      key_prefix: 'fp_aaaaaaaa',
      created_at: '2026-01-01T00:00:00Z',
      last_used_at: null,
    }
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: row, error: null })
    vi.mocked(createClient).mockResolvedValue(sb as never)

    const { rawKey } = await generateApiKey('user-1', 'My Key')
    expect(rawKey).toMatch(/^fp_/)
  })

  it('key prefix is 11 chars (fp_ + 8 random chars)', async () => {
    const row = {
      id: 'key-id-2',
      user_id: 'user-1',
      label: 'Test',
      key_prefix: 'fp_aaaaaaaa',
      created_at: '2026-01-01T00:00:00Z',
      last_used_at: null,
    }
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: row, error: null })
    vi.mocked(createClient).mockResolvedValue(sb as never)

    const { rawKey } = await generateApiKey('user-1', 'Test')
    // raw key is 'fp_' + 64 hex chars, prefix is raw.slice(0, 11)
    expect(rawKey.slice(0, 11)).toHaveLength(11)
    expect(rawKey.slice(0, 3)).toBe('fp_')
  })

  it('keyData maps DB row to DesktopApiKey shape', async () => {
    const row = {
      id: 'key-id-3',
      user_id: 'user-42',
      label: 'Desktop',
      key_prefix: 'fp_aaaaaaaa',
      created_at: '2026-04-01T12:00:00Z',
      last_used_at: null,
    }
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: row, error: null })
    vi.mocked(createClient).mockResolvedValue(sb as never)

    const { keyData } = await generateApiKey('user-42', 'Desktop')
    expect(keyData.userId).toBe('user-42')
    expect(keyData.lastUsedAt).toBeNull()
    expect(keyData.id).toBe('key-id-3')
  })
})

describe('validateApiKey', () => {
  it('returns null when no key found in DB', async () => {
    const sb = makeSupabase()
    sb.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    vi.mocked(createClient).mockResolvedValue(sb as never)

    const result = await validateApiKey('fp_notarealkey')
    expect(result).toBeNull()
  })

  it('returns userId when key is found and updates last_used_at', async () => {
    const sb = makeSupabase()
    // First call: maybeSingle for the hash lookup
    sb.maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'k1', user_id: 'u1' }, error: null })
    // The update chain needs to resolve too
    sb.eq = vi.fn().mockReturnThis()
    vi.mocked(createClient).mockResolvedValue(sb as never)

    const result = await validateApiKey('fp_validkey')
    expect(result).toBe('u1')
  })
})

describe('listApiKeys', () => {
  it('maps user_id to userId correctly', async () => {
    const rows = [
      {
        id: 'k1',
        user_id: 'user-99',
        label: 'Key One',
        key_prefix: 'fp_aabbccdd',
        created_at: '2026-01-01T00:00:00Z',
        last_used_at: '2026-02-01T00:00:00Z',
      },
    ]
    const sb = makeSupabase()
    // order() is the terminal call in listApiKeys
    sb.order = vi.fn().mockResolvedValue({ data: rows, error: null })
    vi.mocked(createClient).mockResolvedValue(sb as never)

    const keys = await listApiKeys('user-99')
    expect(keys).toHaveLength(1)
    expect(keys[0].userId).toBe('user-99')
    expect(keys[0].label).toBe('Key One')
    expect(keys[0].lastUsedAt).toBe('2026-02-01T00:00:00Z')
  })

  it('returns empty array on DB error', async () => {
    const sb = makeSupabase()
    sb.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } })
    vi.mocked(createClient).mockResolvedValue(sb as never)

    const keys = await listApiKeys('user-1')
    expect(keys).toEqual([])
  })
})

describe('revokeApiKey', () => {
  it('returns false when build not found (empty data array)', async () => {
    const sb = makeSupabase()
    // The delete chain terminal: select() resolves with empty array
    sb.select = vi.fn().mockResolvedValue({ data: [], error: null })
    vi.mocked(createClient).mockResolvedValue(sb as never)

    const result = await revokeApiKey('nonexistent-id', 'user-1')
    expect(result).toBe(false)
  })

  it('returns true when key is deleted', async () => {
    const sb = makeSupabase()
    sb.select = vi.fn().mockResolvedValue({ data: [{ id: 'k1' }], error: null })
    vi.mocked(createClient).mockResolvedValue(sb as never)

    const result = await revokeApiKey('k1', 'user-1')
    expect(result).toBe(true)
  })
})
