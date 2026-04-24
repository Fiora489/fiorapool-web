// Pure validators and key builders — safe on server or client; no 'server-only' import.

import {
  BLOCK_TYPES,
  ROLE_IDS,
  type BlockType,
  type BuildBlockItem,
  type RoleId,
} from '@/lib/types/builds'

export class BuildValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message)
    this.name = 'BuildValidationError'
  }
}

export interface ValidateBuildMetaInput {
  name: string
  championId: string
  roles: string[]
  patchTag: string
}

export function validateBuildMeta(input: ValidateBuildMetaInput): void {
  const name = input.name?.trim() ?? ''
  if (name.length === 0) {
    throw new BuildValidationError('name', 'Name is required')
  }
  if (name.length > 80) {
    throw new BuildValidationError('name', 'Name must be 80 characters or fewer')
  }

  if (!input.championId || input.championId.trim().length === 0) {
    throw new BuildValidationError('championId', 'Champion is required')
  }

  if (!Array.isArray(input.roles) || input.roles.length === 0) {
    throw new BuildValidationError('roles', 'At least one role is required')
  }
  for (const role of input.roles) {
    if (!ROLE_IDS.includes(role as RoleId)) {
      throw new BuildValidationError('roles', `Invalid role: ${role}`)
    }
  }

  if (!input.patchTag || !/^\d+\.\d+(\.\d+)?$/.test(input.patchTag)) {
    throw new BuildValidationError('patchTag', 'Patch tag must look like 15.2 or 15.2.1')
  }
}

// Stable key across reorderings within a block. Used by the Phase 57 dupe detector.
export function canonicalBuildKey(
  blocks: Partial<Record<BlockType, { items: BuildBlockItem[] }>>,
): string {
  const parts: string[] = []
  for (const blockType of BLOCK_TYPES) {
    const block = blocks[blockType]
    const itemIds = (block?.items ?? [])
      .map((it) => it.id)
      .slice()
      .sort((a, b) => a - b)
      .join(',')
    parts.push(`${blockType}:${itemIds}`)
  }
  return parts.join('|')
}
