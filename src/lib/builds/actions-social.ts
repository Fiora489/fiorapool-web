'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types/builds'

function unauthenticated(): ActionResult<never> {
  return { ok: false, error: 'Not authenticated' }
}

export async function bookmarkBuild(buildId: string): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  // Upsert — ignoreDuplicates means no row returned on conflict
  const { error: upsertError } = await supabase
    .from('build_bookmarks')
    .upsert(
      { user_id: user.id, build_id: buildId },
      { onConflict: 'user_id,build_id', ignoreDuplicates: true },
    )

  if (upsertError) return { ok: false, error: upsertError.message }

  // Fetch the row (whether newly inserted or already existed)
  const { data: existing, error: fetchError } = await supabase
    .from('build_bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .eq('build_id', buildId)
    .single()

  if (fetchError || !existing) return { ok: false, error: 'Failed to bookmark' }
  return { ok: true, data: { id: existing.id } }
}

export async function unbookmarkBuild(buildId: string): Promise<ActionResult<undefined>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  const { error } = await supabase
    .from('build_bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('build_id', buildId)

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: undefined }
}

export async function createCollection(
  name: string,
  description?: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  const trimmed = name.trim()
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { ok: false, error: 'Name must be between 1 and 100 characters', field: 'name' }
  }

  const { data, error } = await supabase
    .from('build_collections')
    .insert({
      user_id: user.id,
      name: trimmed,
      description: description?.trim() ?? '',
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: { id: data.id } }
}

export async function updateCollection(
  id: string,
  name: string,
  description?: string,
): Promise<ActionResult<undefined>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  const trimmed = name.trim()
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { ok: false, error: 'Name must be between 1 and 100 characters', field: 'name' }
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('build_collections')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) return { ok: false, error: 'Collection not found' }

  const { error } = await supabase
    .from('build_collections')
    .update({
      name: trimmed,
      description: description?.trim() ?? '',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: undefined }
}

export async function deleteCollection(id: string): Promise<ActionResult<undefined>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  // Verify ownership
  const { data: existing } = await supabase
    .from('build_collections')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) return { ok: false, error: 'Collection not found' }

  const { error } = await supabase
    .from('build_collections')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: undefined }
}

export async function addToCollection(
  collectionId: string,
  buildId: string,
): Promise<ActionResult<undefined>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  // Verify user owns the collection
  const { data: collection } = await supabase
    .from('build_collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!collection) return { ok: false, error: 'Collection not found' }

  // Get max position
  const { data: posRows } = await supabase
    .from('build_collection_items')
    .select('position')
    .eq('collection_id', collectionId)
    .order('position', { ascending: false })
    .limit(1)

  const maxPosition = posRows && posRows.length > 0 ? posRows[0].position : -1
  const nextPosition = maxPosition + 1

  const { error } = await supabase
    .from('build_collection_items')
    .insert({
      collection_id: collectionId,
      build_id: buildId,
      position: nextPosition,
    })

  if (error) {
    // unique constraint violation — already in collection
    if (error.code === '23505') return { ok: false, error: 'Build already in collection' }
    return { ok: false, error: error.message }
  }

  return { ok: true, data: undefined }
}

export async function removeFromCollection(
  collectionId: string,
  buildId: string,
): Promise<ActionResult<undefined>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  // Verify user owns the collection
  const { data: collection } = await supabase
    .from('build_collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!collection) return { ok: false, error: 'Collection not found' }

  const { error } = await supabase
    .from('build_collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('build_id', buildId)

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: undefined }
}
