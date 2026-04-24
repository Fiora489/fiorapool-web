import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createHash, randomBytes } from 'crypto'
import type { DesktopApiKey } from '@/lib/types/builds'

/**
 * Generates a new desktop API key for the given user.
 * Key format: `fp_` + 64 hex chars = 67 chars total.
 * The raw key is returned ONCE — it cannot be retrieved again.
 */
export async function generateApiKey(
  userId: string,
  label: string,
): Promise<{ rawKey: string; keyData: DesktopApiKey }> {
  const raw = 'fp_' + randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(raw).digest('hex')
  // key_prefix = "fp_" + first 8 chars of the random portion = first 11 chars
  const keyPrefix = raw.slice(0, 11)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('desktop_api_keys')
    .insert({
      user_id: userId,
      label,
      key_hash: hash,
      key_prefix: keyPrefix,
    })
    .select('id, user_id, label, key_prefix, created_at, last_used_at')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to insert API key')
  }

  const keyData: DesktopApiKey = {
    id: data.id,
    userId: data.user_id,
    label: data.label,
    keyPrefix: data.key_prefix,
    createdAt: data.created_at,
    lastUsedAt: data.last_used_at,
  }

  return { rawKey: raw, keyData }
}

/**
 * Validates a raw API key and returns the userId if found, null otherwise.
 * Updates last_used_at on successful validation.
 */
export async function validateApiKey(rawKey: string): Promise<string | null> {
  const hash = createHash('sha256').update(rawKey).digest('hex')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('desktop_api_keys')
    .select('id, user_id')
    .eq('key_hash', hash)
    .maybeSingle()

  if (error || !data) return null

  // Update last_used_at (fire-and-forget — don't block auth on this)
  await supabase
    .from('desktop_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return data.user_id
}

/**
 * Lists all API keys for a user. Does NOT return key_hash.
 */
export async function listApiKeys(userId: string): Promise<DesktopApiKey[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('desktop_api_keys')
    .select('id, user_id, label, key_prefix, created_at, last_used_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    label: row.label,
    keyPrefix: row.key_prefix,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  }))
}

/**
 * Revokes an API key by id, verifying ownership.
 * Returns true if deleted, false if not found or not owned by userId.
 */
export async function revokeApiKey(id: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('desktop_api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')

  if (error) return false
  return Array.isArray(data) && data.length > 0
}
