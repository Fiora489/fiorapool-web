'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  BuildValidationError,
  validateBuildMeta,
} from '@/lib/builds/server'
import {
  validateSpellPair,
  SpellValidationError,
} from '@/lib/builds/summoner-spells'
import {
  validateSkillOrder,
  parseMaxPriority,
  SkillValidationError,
} from '@/lib/builds/skill-order'
import { validateCombos, sanitizeCombos } from '@/lib/builds/combos'
import {
  validateMatchupNote,
  MatchupValidationError,
} from '@/lib/builds/matchup'
import {
  validateConditionalSwap,
  ConditionalValidationError,
} from '@/lib/builds/conditionals'
import { sanitizeTags, validateTagList, TagValidationError } from '@/lib/builds/tags'
import {
  validateTrinket,
  validateWardingNote,
  WardingValidationError,
} from '@/lib/builds/warding'
import { sanitizeDescription, validateDescription } from '@/lib/builds/description'
import { currentPatch } from '@/lib/builds/patch-stamp'
import { loadTemplateItems } from '@/lib/builds/block-templates'
import { getSavedSearches } from '@/lib/builds/saved-searches'
import { logHubSearch } from '@/lib/builds/hub-trending'
import { logSearch } from '@/lib/builds/search-analytics'
import type {
  ActionResult,
  BlockType,
  BuildBlockItem,
  BuildMutationInput,
  ConditionalSwapInput,
  CreateBuildInput,
  HubQuery,
  MatchupNoteInput,
  MaxPriority,
  RunePageInput,
  SavedSearch,
  SkillSlot,
  TrinketChoice,
  UpdateBuildMetaInput,
} from '@/lib/types/builds'
import type { Json, TablesUpdate } from '@/types/database'

// Shard IDs valid for structural validation (mirrors rune-tree.ts constant)
const VALID_SHARD_IDS = new Set([5001, 5002, 5003, 5005, 5007, 5008])

/** Returns true when the authenticated user owns the given build. */
async function ownsBuild(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  buildId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('custom_builds')
    .select('id')
    .eq('id', buildId)
    .eq('user_id', userId)
    .maybeSingle()
  return data !== null
}

const SKILL_TO_NUM: Record<SkillSlot, number> = { Q: 1, W: 2, E: 3, R: 4 }

type CustomBuildUpdate = TablesUpdate<'custom_builds'>

function unauthenticated(): ActionResult<never> {
  return { ok: false, error: 'You must be signed in' }
}

function validationToResult(err: unknown): ActionResult<never> {
  if (err instanceof BuildValidationError) {
    return { ok: false, error: err.message, field: err.field }
  }
  console.error('[builds/actions]', err)
  return { ok: false, error: 'Unexpected error' }
}

// ---------------------------------------------------------------------------
// createBuild
// ---------------------------------------------------------------------------

export async function createBuild(
  input: CreateBuildInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    validateBuildMeta(input)
  } catch (err) {
    return validationToResult(err)
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { data, error } = await supabase
    .from('custom_builds')
    .insert({
      user_id: userData.user.id,
      champion_id: input.championId,
      name: input.name.trim(),
      roles: input.roles,
      patch_tag: input.patchTag,
    })
    .select('id')
    .maybeSingle()

  if (error || !data) {
    console.error('[createBuild] insert failed', error)
    return { ok: false, error: 'Could not create build' }
  }

  revalidatePath('/builds/custom')
  return { ok: true, data: { id: data.id as string } }
}

// ---------------------------------------------------------------------------
// renameBuild
// ---------------------------------------------------------------------------

export async function renameBuild(
  id: string,
  name: string,
): Promise<ActionResult> {
  const trimmed = name.trim()
  if (trimmed.length === 0 || trimmed.length > 80) {
    return { ok: false, error: 'Name must be 1–80 characters', field: 'name' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .update({ name: trimmed })
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[renameBuild]', error)
    return { ok: false, error: 'Could not rename build' }
  }

  revalidatePath('/builds/custom')
  revalidatePath(`/builds/custom/${id}/edit`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// updateBuildMeta
// ---------------------------------------------------------------------------

export async function updateBuildMeta(
  id: string,
  input: UpdateBuildMetaInput,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const patch: CustomBuildUpdate = {}
  if (typeof input.name === 'string') {
    const trimmed = input.name.trim()
    if (trimmed.length === 0 || trimmed.length > 80) {
      return { ok: false, error: 'Name must be 1–80 characters', field: 'name' }
    }
    patch.name = trimmed
  }
  if (typeof input.description === 'string') patch.description_md = input.description
  if (Array.isArray(input.tags)) patch.build_tags = input.tags
  if (Array.isArray(input.roles)) {
    if (input.roles.length === 0) {
      return { ok: false, error: 'At least one role required', field: 'roles' }
    }
    patch.roles = input.roles
  }
  if (typeof input.patchTag === 'string') patch.patch_tag = input.patchTag
  if (input.lastValidatedPatch !== undefined) {
    patch.last_validated_patch = input.lastValidatedPatch
  }

  if (Object.keys(patch).length === 0) {
    return { ok: true, data: undefined }
  }

  const { error } = await supabase
    .from('custom_builds')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[updateBuildMeta]', error)
    return { ok: false, error: 'Could not update build' }
  }

  revalidatePath('/builds/custom')
  revalidatePath(`/builds/custom/${id}/edit`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// deleteBuild
// ---------------------------------------------------------------------------

export async function deleteBuild(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[deleteBuild]', error)
    return { ok: false, error: 'Could not delete build' }
  }

  revalidatePath('/builds/custom')
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// setBuildPublic
// ---------------------------------------------------------------------------

export async function setBuildPublic(
  id: string,
  isPublic: boolean,
  optInAggregate: boolean,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .update({
      is_public: isPublic,
      opt_in_aggregate: isPublic ? optInAggregate : false,
    })
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[setBuildPublic]', error)
    return { ok: false, error: 'Could not update visibility' }
  }

  revalidatePath('/builds/custom')
  revalidatePath(`/builds/custom/${id}/edit`)
  if (isPublic) revalidatePath(`/builds/hub/${id}`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// saveBuildDraft
// ---------------------------------------------------------------------------

export async function saveBuildDraft(
  id: string,
  input: BuildMutationInput,
): Promise<ActionResult<{ updatedAt: string }>> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { meta, blocks } = input

  // Inline validation (patchTag not part of draft save)
  const trimmedName = meta.name.trim()
  if (trimmedName.length === 0 || trimmedName.length > 80) {
    return { ok: false, error: 'Name must be 1–80 characters', field: 'name' }
  }
  if (!meta.championId) {
    return { ok: false, error: 'Champion required', field: 'championId' }
  }
  if (meta.roles.length === 0) {
    return { ok: false, error: 'At least one role required', field: 'roles' }
  }

  const { data: buildData, error: buildError } = await supabase
    .from('custom_builds')
    .update({
      name: trimmedName,
      champion_id: meta.championId,
      roles: meta.roles,
    })
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .select('updated_at')
    .maybeSingle()

  if (buildError || !buildData) {
    console.error('[saveBuildDraft] update build', buildError)
    return { ok: false, error: 'Could not save build' }
  }

  if (blocks) {
    const { error: deleteError } = await supabase
      .from('custom_build_blocks')
      .delete()
      .eq('build_id', id)

    if (deleteError) {
      console.error('[saveBuildDraft] delete blocks', deleteError)
      return { ok: false, error: 'Could not save blocks' }
    }

    const blockRows = (Object.entries(blocks) as [BlockType, NonNullable<BuildMutationInput['blocks']>[BlockType]][])
      .filter((entry): entry is [BlockType, NonNullable<typeof entry[1]>] => entry[1] !== undefined)
      .map(([blockType, block]) => ({
        build_id: id,
        block_type: blockType,
        position: block.position,
        items: block.items as unknown as Json,
        power_spikes: block.items.filter(i => i.powerSpike).map(i => i.id),
        gold_total: block.goldTotal ?? 0,
      }))

    if (blockRows.length > 0) {
      const { error: insertError } = await supabase
        .from('custom_build_blocks')
        .insert(blockRows)

      if (insertError) {
        console.error('[saveBuildDraft] insert blocks', insertError)
        return { ok: false, error: 'Could not save blocks' }
      }
    }
  }

  revalidatePath('/builds/custom')
  revalidatePath(`/builds/custom/${id}/edit`)
  return { ok: true, data: { updatedAt: buildData.updated_at as string } }
}

// ---------------------------------------------------------------------------
// Rune page CRUD
// ---------------------------------------------------------------------------

function validateRunePageStructural(input: RunePageInput): string | null {
  const name = input.name.trim()
  if (name.length === 0 || name.length > 50) return 'Name must be 1–50 characters'
  if (input.primaryStyle === input.secondaryStyle) return 'Primary and secondary paths must differ'
  for (const shard of input.shards) {
    if (!VALID_SHARD_IDS.has(shard)) return `Invalid shard id: ${shard}`
  }
  return null
}

export async function createRunePage(
  input: RunePageInput,
): Promise<ActionResult<{ id: string }>> {
  const err = validateRunePageStructural(input)
  if (err) return { ok: false, error: err }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { data, error } = await supabase
    .from('custom_rune_pages')
    .insert({
      user_id: userData.user.id,
      name: input.name.trim(),
      primary_style: input.primaryStyle,
      keystone: input.keystone,
      primary_minors: input.primaryMinors as number[],
      secondary_style: input.secondaryStyle,
      secondary_minors: input.secondaryMinors as number[],
      shards: input.shards as number[],
    })
    .select('id')
    .maybeSingle()

  if (error || !data) {
    console.error('[createRunePage]', error)
    return { ok: false, error: 'Could not create rune page' }
  }

  revalidatePath('/builds/runes')
  return { ok: true, data: { id: data.id as string } }
}

export async function updateRunePage(
  id: string,
  input: RunePageInput,
): Promise<ActionResult> {
  const err = validateRunePageStructural(input)
  if (err) return { ok: false, error: err }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_rune_pages')
    .update({
      name: input.name.trim(),
      primary_style: input.primaryStyle,
      keystone: input.keystone,
      primary_minors: input.primaryMinors as number[],
      secondary_style: input.secondaryStyle,
      secondary_minors: input.secondaryMinors as number[],
      shards: input.shards as number[],
    })
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[updateRunePage]', error)
    return { ok: false, error: 'Could not update rune page' }
  }

  revalidatePath('/builds/runes')
  return { ok: true, data: undefined }
}

export async function deleteRunePage(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_rune_pages')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[deleteRunePage]', error)
    return { ok: false, error: 'Could not delete rune page' }
  }

  revalidatePath('/builds/runes')
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Build rune page link
// ---------------------------------------------------------------------------

export async function setBuildRunePage(
  buildId: string,
  runePageId: string | null,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  if (runePageId !== null) {
    const { data: page } = await supabase
      .from('custom_rune_pages')
      .select('id')
      .eq('id', runePageId)
      .eq('user_id', userData.user.id)
      .maybeSingle()
    if (!page) return { ok: false, error: 'Rune page not found' }
  }

  const { error } = await supabase
    .from('custom_builds')
    .update({ rune_page_id: runePageId })
    .eq('id', buildId)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[setBuildRunePage]', error)
    return { ok: false, error: 'Could not link rune page' }
  }

  revalidatePath('/builds/custom')
  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Build summoner spells
// ---------------------------------------------------------------------------

export async function setBuildSpells(
  buildId: string,
  spell1: string,
  spell2: string,
  altNote?: string,
): Promise<ActionResult> {
  try {
    validateSpellPair(spell1, spell2)
  } catch (err) {
    if (err instanceof SpellValidationError) {
      return { ok: false, error: err.message, field: err.field }
    }
    return { ok: false, error: 'Invalid spell pair' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .update({
      spell1,
      spell2,
      spell_alt_note: altNote?.trim() ?? null,
    })
    .eq('id', buildId)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[setBuildSpells]', error)
    return { ok: false, error: 'Could not save spells' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Build skill order
// ---------------------------------------------------------------------------

export async function setBuildSkillOrder(
  buildId: string,
  order: SkillSlot[],
  maxPriority?: string,
): Promise<ActionResult> {
  try {
    validateSkillOrder(order)
  } catch (err) {
    if (err instanceof SkillValidationError) {
      return { ok: false, error: err.message, field: err.field }
    }
    return { ok: false, error: 'Invalid skill order' }
  }

  let parsedPriority: MaxPriority | null = null
  if (maxPriority) {
    try {
      parsedPriority = parseMaxPriority(maxPriority)
    } catch (err) {
      if (err instanceof SkillValidationError) {
        return { ok: false, error: err.message, field: err.field }
      }
      return { ok: false, error: 'Invalid max priority' }
    }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .update({
      skill_order: order.map(s => SKILL_TO_NUM[s]),
      max_priority: parsedPriority ? parsedPriority.join(' > ') : null,
    })
    .eq('id', buildId)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[setBuildSkillOrder]', error)
    return { ok: false, error: 'Could not save skill order' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Build combos
// ---------------------------------------------------------------------------

export async function setBuildCombos(
  buildId: string,
  combos: string[],
): Promise<ActionResult> {
  const clean = sanitizeCombos(combos)
  try {
    validateCombos(clean)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid combos' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .update({ combos: clean })
    .eq('id', buildId)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[setBuildCombos]', error)
    return { ok: false, error: 'Could not save combos' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Matchup notes
// ---------------------------------------------------------------------------

export async function upsertMatchupNote(
  buildId: string,
  input: MatchupNoteInput,
): Promise<ActionResult> {
  try {
    validateMatchupNote(input)
  } catch (err) {
    if (err instanceof MatchupValidationError) {
      return { ok: false, error: err.message, field: err.field }
    }
    return { ok: false, error: 'Invalid matchup note' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  if (!(await ownsBuild(supabase, buildId, userData.user.id))) {
    return { ok: false, error: 'Build not found' }
  }

  const { error } = await supabase
    .from('custom_matchup_notes')
    .upsert(
      {
        build_id: buildId,
        enemy_champion_id: input.enemyChampionId.trim(),
        difficulty: input.difficulty,
        note: input.note?.trim() ?? '',
        threats: (input.threats ?? []) as unknown as Json,
      },
      { onConflict: 'build_id,enemy_champion_id' },
    )

  if (error) {
    console.error('[upsertMatchupNote]', error)
    return { ok: false, error: 'Could not save matchup note' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

export async function deleteMatchupNote(
  buildId: string,
  enemyChampionId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  if (!(await ownsBuild(supabase, buildId, userData.user.id))) {
    return { ok: false, error: 'Build not found' }
  }

  const { error } = await supabase
    .from('custom_matchup_notes')
    .delete()
    .eq('build_id', buildId)
    .eq('enemy_champion_id', enemyChampionId)

  if (error) {
    console.error('[deleteMatchupNote]', error)
    return { ok: false, error: 'Could not delete matchup note' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Conditional item swaps
// ---------------------------------------------------------------------------

export async function addConditionalSwap(
  buildId: string,
  swap: ConditionalSwapInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    validateConditionalSwap(swap)
  } catch (err) {
    if (err instanceof ConditionalValidationError) {
      return { ok: false, error: err.message, field: err.field }
    }
    return { ok: false, error: 'Invalid conditional swap' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  if (!(await ownsBuild(supabase, buildId, userData.user.id))) {
    return { ok: false, error: 'Build not found' }
  }

  const { data: maxRow } = await supabase
    .from('custom_item_swaps')
    .select('position')
    .eq('build_id', buildId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextPosition = maxRow ? (maxRow.position as number) + 1 : 0

  const { data, error } = await supabase
    .from('custom_item_swaps')
    .insert({
      build_id: buildId,
      condition_text: swap.conditionText.trim(),
      from_item: swap.fromItem,
      to_item: swap.toItem,
      position: nextPosition,
    })
    .select('id')
    .maybeSingle()

  if (error || !data) {
    console.error('[addConditionalSwap]', error)
    return { ok: false, error: 'Could not add conditional swap' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: { id: data.id as string } }
}

export async function removeConditionalSwap(
  buildId: string,
  swapId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  if (!(await ownsBuild(supabase, buildId, userData.user.id))) {
    return { ok: false, error: 'Build not found' }
  }

  const { error } = await supabase
    .from('custom_item_swaps')
    .delete()
    .eq('id', swapId)
    .eq('build_id', buildId)

  if (error) {
    console.error('[removeConditionalSwap]', error)
    return { ok: false, error: 'Could not remove conditional swap' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

export async function reorderConditionalSwaps(
  buildId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  if (!(await ownsBuild(supabase, buildId, userData.user.id))) {
    return { ok: false, error: 'Build not found' }
  }

  for (const [index, id] of orderedIds.entries()) {
    const { error } = await supabase
      .from('custom_item_swaps')
      .update({ position: index })
      .eq('id', id)
      .eq('build_id', buildId)

    if (error) {
      console.error('[reorderConditionalSwaps]', error)
      return { ok: false, error: 'Could not reorder swaps' }
    }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Tags, warding, description, patch stamp
// ---------------------------------------------------------------------------

export async function setBuildTags(
  buildId: string,
  tags: string[],
): Promise<ActionResult> {
  const clean = sanitizeTags(tags)
  try {
    validateTagList(clean)
  } catch (err) {
    if (err instanceof TagValidationError) {
      return { ok: false, error: err.message, field: err.field }
    }
    return { ok: false, error: 'Invalid tags' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .update({ build_tags: clean })
    .eq('id', buildId)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[setBuildTags]', error)
    return { ok: false, error: 'Could not save tags' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

export async function setBuildWarding(
  buildId: string,
  note: string,
  trinket: TrinketChoice | null,
): Promise<ActionResult> {
  try {
    validateWardingNote(note)
    if (trinket !== null) validateTrinket(trinket)
  } catch (err) {
    if (err instanceof WardingValidationError) {
      return { ok: false, error: err.message, field: err.field }
    }
    return { ok: false, error: 'Invalid warding data' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .update({ warding_note: note.trim() || null, trinket })
    .eq('id', buildId)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[setBuildWarding]', error)
    return { ok: false, error: 'Could not save warding data' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

export async function setBuildDescription(
  buildId: string,
  markdown: string,
): Promise<ActionResult> {
  const clean = sanitizeDescription(markdown)
  try {
    validateDescription(clean)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid description' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .update({ description_md: clean })
    .eq('id', buildId)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[setBuildDescription]', error)
    return { ok: false, error: 'Could not save description' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

export async function stampLastValidated(
  buildId: string,
  patch?: string,
): Promise<ActionResult> {
  const resolvedPatch = patch ?? (await currentPatch())

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .update({ last_validated_patch: resolvedPatch })
    .eq('id', buildId)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[stampLastValidated]', error)
    return { ok: false, error: 'Could not stamp patch' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

export async function setBuildPatchTag(
  buildId: string,
  patch: string,
): Promise<ActionResult> {
  const trimmed = patch.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: 'Patch tag required', field: 'patchTag' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('custom_builds')
    .update({ patch_tag: trimmed })
    .eq('id', buildId)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[setBuildPatchTag]', error)
    return { ok: false, error: 'Could not update patch tag' }
  }

  revalidatePath('/builds/custom')
  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Block templates
// ---------------------------------------------------------------------------

export async function saveBlockTemplate(
  championId: string,
  blockType: BlockType,
  items: BuildBlockItem[],
  name = '',
): Promise<ActionResult<{ id: string }>> {
  if (!championId.trim()) {
    return { ok: false, error: 'Champion required', field: 'championId' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { data, error } = await supabase
    .from('build_item_block_templates')
    .insert({
      user_id: userData.user.id,
      champion_id: championId.trim(),
      block_type: blockType,
      items: items as unknown as Json,
      name: name.trim(),
    })
    .select('id')
    .maybeSingle()

  if (error || !data) {
    console.error('[saveBlockTemplate]', error)
    return { ok: false, error: 'Could not save template' }
  }

  return { ok: true, data: { id: data.id as string } }
}

export async function deleteBlockTemplate(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('build_item_block_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[deleteBlockTemplate]', error)
    return { ok: false, error: 'Could not delete template' }
  }

  return { ok: true, data: undefined }
}

export async function applyBlockTemplate(
  buildId: string,
  blockType: BlockType,
  templateId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  if (!(await ownsBuild(supabase, buildId, userData.user.id))) {
    return { ok: false, error: 'Build not found' }
  }

  const items = await loadTemplateItems(templateId, userData.user.id)
  if (!items) {
    return { ok: false, error: 'Template not found' }
  }

  const { error: deleteError } = await supabase
    .from('custom_build_blocks')
    .delete()
    .eq('build_id', buildId)
    .eq('block_type', blockType)

  if (deleteError) {
    console.error('[applyBlockTemplate] delete', deleteError)
    return { ok: false, error: 'Could not apply template' }
  }

  const { error: insertError } = await supabase
    .from('custom_build_blocks')
    .insert({
      build_id: buildId,
      block_type: blockType,
      position: 0,
      items: items as unknown as Json,
      power_spikes: items.filter(i => i.powerSpike).map(i => i.id),
      gold_total: 0,
    })

  if (insertError) {
    console.error('[applyBlockTemplate] insert', insertError)
    return { ok: false, error: 'Could not apply template' }
  }

  revalidatePath(`/builds/custom/${buildId}/edit`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Saved searches (Phase 58)
// ---------------------------------------------------------------------------

export async function saveSearch(
  name: string,
  queryJson: HubQuery,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Name is required', field: 'name' }
  if (trimmed.length > 100) return { ok: false, error: 'Name is too long', field: 'name' }

  const { data, error } = await supabase
    .from('saved_searches')
    .insert({
      user_id: userData.user.id,
      name: trimmed,
      query_json: queryJson as unknown as Json,
    })
    .select('id')
    .maybeSingle()

  if (error || !data) {
    console.error('[saveSearch]', error)
    return { ok: false, error: 'Could not save search' }
  }

  return { ok: true, data: { id: data.id as string } }
}

export async function listSavedSearches(): Promise<ActionResult<SavedSearch[]>> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const searches = await getSavedSearches(userData.user.id)
  return { ok: true, data: searches }
}

export async function deleteSavedSearch(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('[deleteSavedSearch]', error)
    return { ok: false, error: 'Could not delete saved search' }
  }

  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Hub search telemetry (Phase 59)
// ---------------------------------------------------------------------------

/** Records an anonymous hub search query for trending analytics. Never throws. */
export async function logHubSearchAction(queryText: string): Promise<ActionResult> {
  await logHubSearch(queryText)
  return { ok: true, data: undefined }
}

/**
 * Records a full search analytics event with user context and filter snapshot.
 * Respects telemetry_opt_out. Never throws.
 */
export async function logSearchAction(
  queryText: string,
  filtersJson?: import('@/types/database').Json,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  await logSearch({
    userId: userData.user?.id ?? null,
    queryText,
    filtersJson: filtersJson ?? {},
  })
  return { ok: true, data: undefined }
}
