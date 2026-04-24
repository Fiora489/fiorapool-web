import type {
  BlockType,
  BLOCK_TYPES,
  BuildBlockItem,
  CustomBuildFull,
  MatchupDifficulty,
  MatchupNoteInput,
  RoleId,
  RunePageInput,
  RunePageRow,
  SkillSlot,
  SpellId,
  MaxPriority,
} from '@/lib/types/builds'
import { BLOCK_TYPES as BLOCK_ORDER } from '@/lib/types/builds'

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface BlockEditorState {
  items: BuildBlockItem[]
  position: number
}

export interface EditorState {
  buildId: string
  name: string
  championId: string
  patch: string
  roles: RoleId[]
  blocks: Record<BlockType, BlockEditorState>
  runePage: RunePageInput | null
  skillOrder: SkillSlot[]
  maxPriority: MaxPriority | null
  spell1: SpellId | null
  spell2: SpellId | null
  matchupNotes: MatchupNoteInput[]
  /** Which block the item drawer is currently targeting */
  activeBlock: BlockType
  isDirty: boolean
  lastSavedAt: string | null
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type EditorAction =
  | { type: 'SET_ACTIVE_BLOCK'; block: BlockType }
  | { type: 'ADD_ITEM'; block: BlockType; itemId: number }
  | { type: 'REMOVE_ITEM'; block: BlockType; index: number }
  | { type: 'TOGGLE_SPIKE'; block: BlockType; index: number }
  | { type: 'REORDER_ITEMS'; block: BlockType; from: number; to: number }
  | { type: 'SET_RUNE_PAGE'; page: RunePageInput }
  | { type: 'SET_SKILL_ORDER'; order: SkillSlot[] }
  | { type: 'SET_MAX_PRIORITY'; priority: MaxPriority }
  | { type: 'SET_SPELLS'; spell1: SpellId; spell2: SpellId }
  | { type: 'SET_ROLES'; roles: RoleId[] }
  | { type: 'UPSERT_MATCHUP'; note: MatchupNoteInput }
  | { type: 'REMOVE_MATCHUP'; enemyChampionId: string }
  | { type: 'SET_NAME'; name: string }
  | { type: 'MARK_SAVED'; at: string }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_ACTIVE_BLOCK':
      return { ...state, activeBlock: action.block }

    case 'ADD_ITEM': {
      const block = state.blocks[action.block]
      return {
        ...state,
        isDirty: true,
        blocks: {
          ...state.blocks,
          [action.block]: {
            ...block,
            items: [...block.items, { id: action.itemId, powerSpike: false }],
          },
        },
      }
    }

    case 'REMOVE_ITEM': {
      const block = state.blocks[action.block]
      const newItems = block.items.filter((_, i) => i !== action.index)
      return {
        ...state,
        isDirty: true,
        blocks: {
          ...state.blocks,
          [action.block]: { ...block, items: newItems },
        },
      }
    }

    case 'TOGGLE_SPIKE': {
      const block = state.blocks[action.block]
      const newItems = block.items.map((item, i) =>
        i === action.index ? { ...item, powerSpike: !item.powerSpike } : item,
      )
      return {
        ...state,
        isDirty: true,
        blocks: {
          ...state.blocks,
          [action.block]: { ...block, items: newItems },
        },
      }
    }

    case 'REORDER_ITEMS': {
      const block = state.blocks[action.block]
      const items = [...block.items]
      const [removed] = items.splice(action.from, 1)
      items.splice(action.to, 0, removed)
      return {
        ...state,
        isDirty: true,
        blocks: {
          ...state.blocks,
          [action.block]: { ...block, items },
        },
      }
    }

    case 'SET_RUNE_PAGE':
      return { ...state, isDirty: true, runePage: action.page }

    case 'SET_SKILL_ORDER':
      return { ...state, isDirty: true, skillOrder: action.order }

    case 'SET_MAX_PRIORITY':
      return { ...state, isDirty: true, maxPriority: action.priority }

    case 'SET_SPELLS':
      return { ...state, isDirty: true, spell1: action.spell1, spell2: action.spell2 }

    case 'SET_ROLES':
      return { ...state, isDirty: true, roles: action.roles }

    case 'UPSERT_MATCHUP': {
      const existing = state.matchupNotes.findIndex(
        n => n.enemyChampionId === action.note.enemyChampionId,
      )
      const notes =
        existing >= 0
          ? state.matchupNotes.map((n, i) => (i === existing ? action.note : n))
          : [...state.matchupNotes, action.note]
      return { ...state, isDirty: true, matchupNotes: notes }
    }

    case 'REMOVE_MATCHUP':
      return {
        ...state,
        isDirty: true,
        matchupNotes: state.matchupNotes.filter(
          n => n.enemyChampionId !== action.enemyChampionId,
        ),
      }

    case 'SET_NAME':
      return { ...state, isDirty: true, name: action.name }

    case 'MARK_SAVED':
      return { ...state, isDirty: false, lastSavedAt: action.at }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Init helper
// ---------------------------------------------------------------------------

function runeRowToInput(row: RunePageRow): RunePageInput {
  return {
    name: row.name,
    primaryStyle: row.primary_style,
    keystone: row.keystone,
    primaryMinors: row.primary_minors,
    secondaryStyle: row.secondary_style,
    secondaryMinors: row.secondary_minors,
    shards: row.shards,
  }
}

const BLOCK_MINUTES: Record<BlockType, number> = {
  starting: 0,
  early: 6,
  core: 18,
  situational: 28,
  full: 38,
  boots: 8,
}

export function buildInitialState(full: CustomBuildFull): EditorState {
  const { build, blocks, matchupNotes, runePage } = full

  const blockRecord = {} as Record<BlockType, BlockEditorState>
  for (const [i, bt] of BLOCK_ORDER.entries()) {
    const row = blocks.find(b => b.block_type === bt)
    blockRecord[bt] = {
      items: row?.items ?? [],
      position: row?.position ?? i,
    }
  }

  const skillSlots = (build.skill_order as unknown as SkillSlot[] | null) ?? []
  const maxPriorityRaw = build.max_priority
  const maxPriority: MaxPriority | null = maxPriorityRaw
    ? (maxPriorityRaw.split('>').map(s => s.trim()) as MaxPriority)
    : null

  return {
    buildId: build.id,
    name: build.name,
    championId: build.champion_id,
    patch: build.patch_tag,
    roles: build.roles,
    blocks: blockRecord,
    runePage: runePage ? runeRowToInput(runePage) : null,
    skillOrder: skillSlots,
    maxPriority,
    spell1: build.spell1,
    spell2: build.spell2,
    matchupNotes: matchupNotes.map(mn => ({
      enemyChampionId: mn.enemy_champion_id,
      difficulty: mn.difficulty as MatchupDifficulty,
      note: mn.note,
      threats: mn.threats,
    })),
    activeBlock: 'core',
    isDirty: false,
    lastSavedAt: build.updated_at,
  }
}
