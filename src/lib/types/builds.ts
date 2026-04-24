// Domain types for the v1.3 Build Creator + Hub.
// Hand-written (not generated) — Phase 64+ may switch to generated types.

// ---------------------------------------------------------------------------
// Rune tree
// ---------------------------------------------------------------------------

export interface RuneData {
  id: number
  key: string
  name: string
  icon: string
  iconUrl?: string
}

export interface RuneSlot {
  runes: RuneData[]
}

export interface RunePath {
  id: number
  key: string
  name: string
  icon: string
  iconUrl?: string
  slots: RuneSlot[]
}

export type RuneTree = RunePath[]

export interface RunePageInput {
  name: string
  primaryStyle: number
  keystone: number
  primaryMinors: [number, number, number]
  secondaryStyle: number
  secondaryMinors: [number, number]
  shards: [number, number, number]
}

// ---------------------------------------------------------------------------
// Skill order
// ---------------------------------------------------------------------------

export type SkillSlot = 'Q' | 'W' | 'E' | 'R'
export type MaxPriority = [SkillSlot, SkillSlot, SkillSlot]

// ---------------------------------------------------------------------------
// Summoner spells
// ---------------------------------------------------------------------------

export type SpellId = string

// ---------------------------------------------------------------------------

export type RoleId = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT'

export const ROLE_IDS: readonly RoleId[] = [
  'TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT',
] as const

export type BlockType =
  | 'starting'
  | 'early'
  | 'core'
  | 'situational'
  | 'full'
  | 'boots'

export const BLOCK_TYPES: readonly BlockType[] = [
  'starting', 'early', 'core', 'situational', 'full', 'boots',
] as const

export type MatchupDifficulty = 'easy' | 'even' | 'hard' | 'counter'

export const MATCHUP_DIFFICULTIES: readonly MatchupDifficulty[] = [
  'easy', 'even', 'hard', 'counter',
] as const

// ---------------------------------------------------------------------------
// Matchup note input
// ---------------------------------------------------------------------------

export interface MatchupNoteInput {
  enemyChampionId: string
  difficulty: MatchupDifficulty
  note?: string
  threats?: Array<{ kind: 'champion' | 'item'; id: string | number }>
}

// ---------------------------------------------------------------------------
// Conditional item swap input
// ---------------------------------------------------------------------------

export interface ConditionalSwapInput {
  conditionText: string
  fromItem: number
  toItem: number
}

// ---------------------------------------------------------------------------
// Warding / trinket
// ---------------------------------------------------------------------------

export type TrinketChoice = 'stealth-ward' | 'oracle-lens' | 'farsight'

export const TRINKET_CHOICES: readonly TrinketChoice[] = [
  'stealth-ward',
  'oracle-lens',
  'farsight',
] as const

// ---------------------------------------------------------------------------
// DB row shapes
// ---------------------------------------------------------------------------

export interface CustomBuildRow {
  id: string
  user_id: string
  champion_id: string
  name: string
  description_md: string
  roles: RoleId[]
  build_tags: string[]
  patch_tag: string
  last_validated_patch: string | null
  combos: string[]
  max_priority: string | null
  warding_note: string | null
  trinket: string | null
  spell1: string | null
  spell2: string | null
  spell_alt_note: string | null
  rune_page_id: string | null
  skill_order: number[] | null
  is_public: boolean
  opt_in_aggregate: boolean
  created_at: string
  updated_at: string
}

export interface BuildBlockItem {
  id: number
  powerSpike: boolean
}

export interface BuildBlockRow {
  build_id: string
  block_type: BlockType
  position: number
  items: BuildBlockItem[]
  power_spikes: number[]
  gold_total: number
}

export interface MatchupNoteRow {
  build_id: string
  enemy_champion_id: string
  difficulty: MatchupDifficulty
  note: string
  threats: Array<{ kind: 'champion' | 'item'; id: string | number }>
}

export interface ItemSwapRow {
  id: string
  build_id: string
  condition_text: string
  from_item: number
  to_item: number
  position: number
}

export interface RunePageRow {
  id: string
  user_id: string
  name: string
  primary_style: number
  keystone: number
  primary_minors: [number, number, number]
  secondary_style: number
  secondary_minors: [number, number]
  shards: [number, number, number]
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Composite / view shapes
// ---------------------------------------------------------------------------

// Compact projection used by the /builds/custom list page.
export interface BuildListItem {
  id: string
  championId: string
  name: string
  roles: RoleId[]
  isPublic: boolean
  patchTag: string
  updatedAt: string
}

// Full build with all joined children — what the editor + hub detail pages load.
export interface CustomBuildFull {
  build: CustomBuildRow
  blocks: BuildBlockRow[]
  matchupNotes: MatchupNoteRow[]
  itemSwaps: ItemSwapRow[]
  runePage: RunePageRow | null
}

// ---------------------------------------------------------------------------
// Mutation inputs
// ---------------------------------------------------------------------------

export interface CreateBuildInput {
  name: string
  championId: string
  roles: RoleId[]
  patchTag: string
}

export interface UpdateBuildMetaInput {
  name?: string
  description?: string
  tags?: string[]
  roles?: RoleId[]
  patchTag?: string
  lastValidatedPatch?: string | null
}

// Shape the editor passes to saveBuildDraft.
// goldTotal is pre-computed client-side via computeBlockGold + ItemsCatalogue.
export interface BuildMutationInput {
  meta: {
    name: string
    championId: string
    roles: RoleId[]
  }
  blocks?: Partial<Record<BlockType, {
    items: BuildBlockItem[]
    position: number
    goldTotal?: number
  }>>
}

// ---------------------------------------------------------------------------
// Hub query
// ---------------------------------------------------------------------------

export type HubSort = 'updated' | 'created' | 'bookmarks' | 'relevance'
export type HubFreshness = 'all' | 'current' | 'recent'

export const HUB_SORTS: readonly HubSort[] = [
  'updated', 'created', 'bookmarks', 'relevance',
] as const

export const HUB_FRESHNESS_OPTIONS: readonly HubFreshness[] = [
  'all', 'current', 'recent',
] as const

export interface HubQuery {
  q?: string                // free-text search term
  championId?: string
  roles?: RoleId[]
  tags?: string[]
  sort?: HubSort
  freshness?: HubFreshness
  patchTag?: string         // exact patch override (takes priority over freshness)
  page?: number             // 1-based
  pageSize?: number         // default 20, max 100
  // Phase 59 extended facets
  itemIds?: number[]        // builds containing any of these item IDs (any block)
  keystoneId?: number       // builds with this keystone rune
  spellPair?: [string, string] // builds using both these summoner spells
  hasMatchupAgainst?: string // builds with a matchup note for this enemy champion
}

export interface HubBuildCard {
  id: string
  championId: string
  name: string
  description_md: string
  roles: RoleId[]
  buildTags: string[]
  patchTag: string
  updatedAt: string
  createdAt: string
  authorId: string
  bookmarkCount: number // Phase 60 populates build_bookmarks; 0 until then
}

export interface HubFacets {
  topTags: Array<{ tag: string; count: number }>
  patches: string[]
}

export interface HubQueryResult {
  builds: HubBuildCard[]
  total: number
  page: number
  pageSize: number
  facets?: HubFacets
}

// ---------------------------------------------------------------------------
// Saved search
// ---------------------------------------------------------------------------

export interface SavedSearch {
  id: string
  name: string
  queryJson: HubQuery
  createdAt: string
}

// ---------------------------------------------------------------------------
// Hub extended filters (Phase 59 additions to HubQuery — merged here)
// ---------------------------------------------------------------------------

// itemIds, keystoneId, spellPair, hasMatchupAgainst added inline to HubQuery above.
// (HubQuery already exported; Phase 59 extends the serialization layer only.)

// ---------------------------------------------------------------------------
// Social layer (Phase 60)
// ---------------------------------------------------------------------------

export interface BuildBookmark {
  id: string
  userId: string
  buildId: string
  createdAt: string
}

export interface BuildCollection {
  id: string
  userId: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  buildCount?: number
}

export interface BuildCollectionItem {
  id: string
  collectionId: string
  buildId: string
  position: number
  addedAt: string
}

// ---------------------------------------------------------------------------
// Performance tracking (Phase 61)
// ---------------------------------------------------------------------------

export interface BuildStats {
  buildId: string
  totalGames: number
  wins: number
  losses: number
  winRate: number   // 0..1
  lastTaggedAt: string | null
}

export interface AggregateStats {
  buildId: string
  totalGames: number
  winRate: number
  contributorCount: number
}

// ---------------------------------------------------------------------------
// Visual diff (Phase 62)
// ---------------------------------------------------------------------------

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged'

export interface BuildBlockDiff {
  blockType: BlockType
  status: DiffStatus
  added: number[]   // item IDs present in B but not A
  removed: number[] // item IDs present in A but not B
}

export interface BuildDiff {
  buildAId: string
  buildBId: string
  blocks: BuildBlockDiff[]
  runePageChanged: boolean
  spellsChanged: boolean
  tagsChanged: boolean
}

// ---------------------------------------------------------------------------
// Patch lifecycle (Phase 63)
// ---------------------------------------------------------------------------

export interface StaleBuildEntry {
  id: string
  championId: string
  name: string
  patchTag: string
  lastValidatedPatch: string | null
  currentPatch: string
  patchesStale: number // how many patch versions behind
}

export interface PatchBumpReport {
  staleBuilds: StaleBuildEntry[]
  currentPatch: string
  generatedAt: string
}

// ---------------------------------------------------------------------------
// Gamification hooks (Phase 64)
// ---------------------------------------------------------------------------

export type BuildXpEventType = 'create' | 'publish' | 'first-to-patch' | 'forked'

export interface BuildXpEvent {
  type: BuildXpEventType
  buildId: string
  userId: string
  xpAmount: number
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Desktop sync (Phase 65)
// ---------------------------------------------------------------------------

export interface DesktopApiKey {
  id: string
  userId: string
  label: string
  keyPrefix: string  // first 8 chars of raw key — for display only
  createdAt: string
  lastUsedAt: string | null
}

// ---------------------------------------------------------------------------
// Action return shape (never-throw convention)
// ---------------------------------------------------------------------------

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string }
