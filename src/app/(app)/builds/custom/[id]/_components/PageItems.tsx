import { FinalBuildTotals } from './FinalBuildTotals'
import { BigBlockCard } from './BigBlockCard'
import { BootsRail } from './BootsRail'
import { ItemDrawer } from './ItemDrawer'
import type { EditorState, EditorAction } from './reducer'
import type { BlockType } from '@/lib/types/builds'
import type { ItemRecord } from '@/lib/builds/items-catalogue'

const MAIN_BLOCKS: BlockType[] = ['starting', 'early', 'core', 'situational', 'full']

interface PageItemsProps {
  state: EditorState
  catalogue: Record<number, ItemRecord>
  dispatch: React.Dispatch<EditorAction>
}

export function PageItems({ state, catalogue, dispatch }: PageItemsProps) {
  return (
    <div className="grid grid-cols-[1.1fr_1fr] gap-6">
      {/* ── Left column · Item Drawer ────────────────────────────── */}
      <ItemDrawer
        catalogue={catalogue}
        activeBlock={state.activeBlock}
        dispatch={dispatch}
      />

      {/* ── Right column · Build Blocks ──────────────────────────── */}
      <div className="flex flex-col gap-0">
        <div className="mb-4">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Your Build
          </p>
          <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight">
            Six blocks, one build
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Click a block to make it active, then add items from the drawer.
          </p>
        </div>

        <FinalBuildTotals blocks={state.blocks} catalogue={catalogue} />

        <div className="flex flex-col gap-3.5">
          {MAIN_BLOCKS.map(bt => (
            <BigBlockCard
              key={bt}
              blockType={bt}
              block={state.blocks[bt]}
              active={state.activeBlock === bt}
              catalogue={catalogue}
              dispatch={dispatch}
            />
          ))}
        </div>

        <BootsRail
          block={state.blocks.boots}
          active={state.activeBlock === 'boots'}
          catalogue={catalogue}
          dispatch={dispatch}
        />
      </div>
    </div>
  )
}
