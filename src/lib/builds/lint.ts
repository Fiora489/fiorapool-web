// Build lint rule engine — pure, no server-only.
import { BLOCK_TYPES, type BlockType } from '@/lib/types/builds'

export type LintSeverity = 'info' | 'warn' | 'error'

export interface LintWarning {
  ruleId: string
  severity: LintSeverity
  message: string
}

/** Shape the caller assembles from a full build before running lint. */
export interface LintBuild {
  blocks: Partial<Record<BlockType, { items: Array<{ id: number }> }>>
  buildTags: string[]
  /** Linked rune page. null = no rune page assigned. */
  runePage: { keystoneId: number | null } | null
  isPublic: boolean
  /** True when the champion's primary scaling is AP (from DDragon tags). */
  isApScalerChampion: boolean
  /**
   * Number of matchup notes whose enemy champion is a known AP caster.
   * Caller must compute this from champion data; defaults to 0 if not available.
   */
  apMatchupCount: number
}

interface LintRule {
  id: string
  severity: LintSeverity
  check(build: LintBuild): string | null // non-null = warning fires
}

// ---------------------------------------------------------------------------
// Item ID sets (representative — not exhaustive; good enough for lint)
// ---------------------------------------------------------------------------

const MR_ITEM_IDS = new Set([
  3001,   // Abyssal Mask
  3065,   // Spirit Visage
  3068,   // Force of Nature
  3102,   // Banshee's Veil
  3139,   // Mercurial Scimitar
  3156,   // Maw of Malmortius
  3194,   // Adaptive Helm
  223053, // Kaenic Rookern
])

const AD_ITEM_IDS = new Set([
  3031,  // Infinity Edge
  3033,  // Mortal Reminder
  3036,  // Lord Dominik's Regards
  3071,  // Black Cleaver
  3072,  // Bloodthirster
  3074,  // Ravenous Hydra
  3078,  // Trinity Force
  6609,  // Galeforce
  6631,  // Stridebreaker
  6672,  // Kraken Slayer
])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function allItems(build: LintBuild): Array<{ id: number }> {
  return BLOCK_TYPES.flatMap(bt => build.blocks[bt]?.items ?? [])
}

function hasMrItem(build: LintBuild): boolean {
  return allItems(build).some(i => MR_ITEM_IDS.has(i.id))
}

function adItemCount(build: LintBuild): number {
  return allItems(build).filter(i => AD_ITEM_IDS.has(i.id)).length
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const RULES: LintRule[] = [
  {
    id: 'no-mr-vs-ap',
    severity: 'warn',
    check(build) {
      const needsMr =
        build.buildTags.includes('anti-ap') || build.apMatchupCount >= 2
      if (needsMr && !hasMrItem(build)) {
        return 'Build has AP-threat matchups but no MR item'
      }
      return null
    },
  },
  {
    id: 'missing-keystone',
    severity: 'error',
    check(build) {
      if (build.runePage !== null && !build.runePage.keystoneId) {
        return 'Rune page is assigned but has no keystone selected'
      }
      return null
    },
  },
  {
    id: 'too-many-ad-for-ap-scaler',
    severity: 'warn',
    check(build) {
      if (!build.isApScalerChampion) return null
      const count = adItemCount(build)
      if (count >= 3) {
        return `Build has ${count} AD items for an AP-scaling champion`
      }
      return null
    },
  },
  {
    id: 'boots-count',
    severity: 'warn',
    check(build) {
      const n = build.blocks.boots?.items.length ?? 0
      if (n !== 1) {
        return `Boots block should have exactly 1 item (has ${n})`
      }
      return null
    },
  },
  {
    id: 'final-build-size',
    severity: 'warn',
    check(build) {
      const n = build.blocks.full?.items.length ?? 0
      if (n > 6) {
        return `Final build block has ${n} items (max 6)`
      }
      return null
    },
  },
  {
    id: 'situational-empty',
    severity: 'info',
    check(build) {
      if (build.isPublic && (build.blocks.situational?.items.length ?? 0) === 0) {
        return 'Public build has no situational item options'
      }
      return null
    },
  },
]

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/** Run all lint rules against a build and return any triggered warnings. */
export function lintBuild(build: LintBuild): LintWarning[] {
  const warnings: LintWarning[] = []
  for (const rule of RULES) {
    const msg = rule.check(build)
    if (msg !== null) {
      warnings.push({ ruleId: rule.id, severity: rule.severity, message: msg })
    }
  }
  return warnings
}
