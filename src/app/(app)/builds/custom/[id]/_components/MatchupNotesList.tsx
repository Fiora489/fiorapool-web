'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { MatchupNoteInput, MatchupDifficulty } from '@/lib/types/builds'
import type { EditorAction } from './reducer'

const DIFFICULTY_CONFIG: Record<
  MatchupDifficulty,
  { label: string; color: string; bg: string }
> = {
  easy: {
    label: 'Easy',
    color: 'text-[oklch(0.72_0.18_155)]',
    bg: 'border-[oklch(0.72_0.18_155)] bg-[oklch(0.72_0.18_155/0.12)]',
  },
  even: {
    label: 'Even',
    color: 'text-muted-foreground',
    bg: 'border-border bg-muted/50',
  },
  hard: {
    label: 'Hard',
    color: 'text-[oklch(0.78_0.18_75)]',
    bg: 'border-[oklch(0.78_0.18_75)] bg-[oklch(0.78_0.18_75/0.12)]',
  },
  counter: {
    label: 'Counter',
    color: 'text-[oklch(0.68_0.22_22)]',
    bg: 'border-[oklch(0.68_0.22_22)] bg-[oklch(0.68_0.22_22/0.12)]',
  },
}

const DIFFICULTIES: MatchupDifficulty[] = ['easy', 'even', 'hard', 'counter']

interface AddMatchupFormProps {
  onAdd: (note: MatchupNoteInput) => void
}

function AddMatchupForm({ onAdd }: AddMatchupFormProps) {
  const [enemy, setEnemy] = useState('')
  const [difficulty, setDifficulty] = useState<MatchupDifficulty>('even')
  const [note, setNote] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = enemy.trim()
    if (!trimmed) return
    onAdd({ enemyChampionId: trimmed, difficulty, note: note.trim() || undefined })
    setEnemy('')
    setNote('')
    setDifficulty('even')
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Add Matchup Note
      </p>

      {/* Champion name input */}
      <input
        type="text"
        placeholder="Enemy champion name…"
        value={enemy}
        onChange={e => setEnemy(e.target.value)}
        className="mb-3 flex h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
      />

      {/* Difficulty picker */}
      <div className="mb-3 flex gap-2">
        {DIFFICULTIES.map(d => {
          const cfg = DIFFICULTY_CONFIG[d]
          const active = difficulty === d
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={cn(
                'flex-1 rounded-lg border py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide transition-all duration-150',
                active ? cfg.bg + ' ' + cfg.color : 'border-border bg-muted text-muted-foreground/60 hover:border-primary/30',
              )}
            >
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Note textarea */}
      <textarea
        placeholder="Notes (optional)…"
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={2}
        className="mb-3 w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
      />

      <button
        type="submit"
        disabled={!enemy.trim()}
        className={cn(
          'h-8 w-full rounded-lg font-mono text-xs font-semibold tracking-wider transition-all duration-150',
          enemy.trim()
            ? 'bg-primary text-primary-foreground hover:opacity-90'
            : 'cursor-not-allowed bg-muted text-muted-foreground/40',
        )}
      >
        Add Matchup
      </button>
    </form>
  )
}

interface MatchupNoteCardProps {
  note: MatchupNoteInput
  onRemove: () => void
}

function MatchupNoteCard({ note, onRemove }: MatchupNoteCardProps) {
  const cfg = DIFFICULTY_CONFIG[note.difficulty]
  return (
    <div className="group flex gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-border/80">
      {/* Difficulty pip */}
      <div
        className={cn(
          'mt-0.5 h-2 w-2 shrink-0 rounded-full',
          note.difficulty === 'easy' && 'bg-[oklch(0.72_0.18_155)]',
          note.difficulty === 'even' && 'bg-muted-foreground/50',
          note.difficulty === 'hard' && 'bg-[oklch(0.78_0.18_75)]',
          note.difficulty === 'counter' && 'bg-[oklch(0.68_0.22_22)]',
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold">{note.enemyChampionId}</span>
          <span className={cn('rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest border', cfg.bg, cfg.color)}>
            {cfg.label}
          </span>
        </div>
        {note.note && (
          <p className="mt-1 text-xs text-muted-foreground/70 leading-relaxed">{note.note}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 self-start rounded p-1 text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
        aria-label={`Remove matchup for ${note.enemyChampionId}`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

interface MatchupNotesListProps {
  notes: MatchupNoteInput[]
  dispatch: React.Dispatch<EditorAction>
}

export function MatchupNotesList({ notes, dispatch }: MatchupNotesListProps) {
  return (
    <div>
      {/* Section heading */}
      <div className="mb-4">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Matchup Notes
        </p>
        <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight">
          Difficulty · Threats · Notes
        </h2>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Notes list */}
        <div className="flex flex-col gap-2">
          {notes.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border">
              <p className="text-xs text-muted-foreground/50 italic">
                No matchup notes yet — add one to the right.
              </p>
            </div>
          ) : (
            <>
              {/* Summary chips */}
              <div className="mb-2 flex gap-2">
                {DIFFICULTIES.map(d => {
                  const count = notes.filter(n => n.difficulty === d).length
                  if (count === 0) return null
                  const cfg = DIFFICULTY_CONFIG[d]
                  return (
                    <div
                      key={d}
                      className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1', cfg.bg)}
                    >
                      <span className={cn('font-mono text-[9px] font-bold uppercase tracking-wider', cfg.color)}>
                        {cfg.label}
                      </span>
                      <span className={cn('font-mono text-[10px] font-bold', cfg.color)}>{count}</span>
                    </div>
                  )
                })}
              </div>
              {notes.map(note => (
                <MatchupNoteCard
                  key={note.enemyChampionId}
                  note={note}
                  onRemove={() =>
                    dispatch({ type: 'REMOVE_MATCHUP', enemyChampionId: note.enemyChampionId })
                  }
                />
              ))}
            </>
          )}
        </div>

        {/* Add form */}
        <AddMatchupForm
          onAdd={note =>
            dispatch({
              type: 'UPSERT_MATCHUP',
              note,
            })
          }
        />
      </div>
    </div>
  )
}
