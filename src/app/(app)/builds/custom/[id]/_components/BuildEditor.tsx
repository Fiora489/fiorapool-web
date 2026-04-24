'use client'

import { useReducer, useRef, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { editorReducer, buildInitialState } from './reducer'
import type { EditorState } from './reducer'
import type { EditorPage } from './EditorChrome'
import { EditorChrome } from './EditorChrome'
import { PageItems } from './PageItems'
import { PageTech } from './PageTech'
import { PageSkills } from './PageSkills'
import { PageMeta } from './PageMeta'
import { createAutosaver } from '@/lib/builds/autosave'
import type { Autosaver, AutosaveState } from '@/lib/builds/autosave'
import { saveBuildDraft } from '@/lib/builds/actions'
import type {
  CustomBuildFull,
  BuildMutationInput,
} from '@/lib/types/builds'
import { BLOCK_TYPES } from '@/lib/types/builds'
import type { ItemsCatalogue } from '@/lib/builds/items-catalogue'
import type { RuneTree } from '@/lib/types/builds'
import type { SummonerSpells } from '@/lib/builds/summoner-spells'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_PAGES: EditorPage[] = ['items', 'tech', 'skills', 'meta']

function stateToMutation(state: EditorState): BuildMutationInput {
  const blocks: BuildMutationInput['blocks'] = {}
  for (const bt of BLOCK_TYPES) {
    const blk = state.blocks[bt]
    blocks[bt] = { items: blk.items, position: blk.position }
  }
  return {
    meta: { name: state.name, championId: state.championId, roles: state.roles },
    blocks,
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BuildEditorProps {
  full: CustomBuildFull
  catalogue: ItemsCatalogue
  runeTree: RuneTree
  summonerSpells: SummonerSpells
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BuildEditor({ full, catalogue, runeTree, summonerSpells }: BuildEditorProps) {
  const [state, dispatch] = useReducer(editorReducer, full, buildInitialState)
  const [saveState, setSaveState] = useState<AutosaveState>('idle')

  // Autosaver lives in a ref so it persists without triggering re-renders.
  const autosaverRef = useRef<Autosaver<BuildMutationInput> | null>(null)

  // Capture buildId at mount — it is the route param and never changes.
  const buildId = state.buildId

  // Create the autosaver once.
  useEffect(() => {
    autosaverRef.current = createAutosaver<BuildMutationInput>({
      delayMs: 1500,
      save: async (payload) => {
        setSaveState('saving')
        try {
          const result = await saveBuildDraft(buildId, payload)
          if (result.ok) {
            setSaveState('saved')
            dispatch({ type: 'MARK_SAVED', at: new Date().toISOString() })
          } else {
            setSaveState('error')
          }
        } catch {
          setSaveState('error')
        }
      },
    })

    // Flush any pending save on unmount.
    return () => {
      autosaverRef.current?.flush()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push to autosaver whenever editor state becomes dirty.
  useEffect(() => {
    if (!state.isDirty) return
    setSaveState('pending')
    autosaverRef.current?.push(stateToMutation(state))
  }, [state])

  // Warn before unload if there are unsaved changes.
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (state.isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [state.isDirty])

  // ---------------------------------------------------------------------------
  // Page routing via URL search param `?page=items|tech|skills|meta`
  // ---------------------------------------------------------------------------

  const searchParams = useSearchParams()
  const router = useRouter()

  const rawPage = searchParams.get('page')
  const activePage: EditorPage =
    rawPage !== null && VALID_PAGES.includes(rawPage as EditorPage)
      ? (rawPage as EditorPage)
      : 'items'

  function handlePageChange(p: EditorPage) {
    router.replace(`?page=${p}`, { scroll: false })
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <EditorChrome
      page={activePage}
      onPageChange={handlePageChange}
      championId={state.championId}
      buildName={state.name}
      saveState={saveState}
    >
      {activePage === 'items' && (
        <PageItems state={state} catalogue={catalogue} dispatch={dispatch} />
      )}
      {activePage === 'tech' && (
        <PageTech state={state} runeTree={runeTree} dispatch={dispatch} />
      )}
      {activePage === 'skills' && (
        <PageSkills state={state} summonerSpells={summonerSpells} dispatch={dispatch} />
      )}
      {activePage === 'meta' && (
        <PageMeta state={state} catalogue={catalogue} dispatch={dispatch} />
      )}
    </EditorChrome>
  )
}
