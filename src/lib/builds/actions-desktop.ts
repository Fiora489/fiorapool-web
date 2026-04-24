'use server'

import { createClient } from '@/lib/supabase/server'
import { generateApiKey, revokeApiKey, listApiKeys } from '@/lib/builds/desktop-sync'
import type { ActionResult, DesktopApiKey } from '@/lib/types/builds'

function unauthenticated(): ActionResult<never> {
  return { ok: false, error: 'Not authenticated' }
}

/**
 * Generates a new desktop API key for the authenticated user.
 * The raw key is returned ONCE — the user must copy it immediately.
 */
export async function generateDesktopApiKey(
  label: string,
): Promise<ActionResult<{ rawKey: string; id: string }>> {
  const trimmed = label.trim()
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { ok: false, error: 'Label must be between 1 and 100 characters', field: 'label' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  try {
    const { rawKey, keyData } = await generateApiKey(user.id, trimmed)
    return { ok: true, data: { rawKey, id: keyData.id } }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to generate key' }
  }
}

/**
 * Revokes a desktop API key owned by the authenticated user.
 */
export async function revokeDesktopApiKey(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  const deleted = await revokeApiKey(id, user.id)
  if (!deleted) return { ok: false, error: 'Key not found or already revoked' }
  return { ok: true, data: undefined }
}

/**
 * Lists all desktop API keys for the authenticated user (no key_hash returned).
 */
export async function listDesktopApiKeys(): Promise<ActionResult<DesktopApiKey[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  const keys = await listApiKeys(user.id)
  return { ok: true, data: keys }
}
