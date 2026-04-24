// Framework-agnostic undo/redo history stack — pure, no deps.

export interface History<T> {
  /** Record a new state. No-op when identical to the current state. Clears the redo stack. */
  push(state: T): void
  /** Step back one state. Returns the state after moving, or undefined when already at the beginning. */
  undo(): T | undefined
  /** Step forward one state. Returns the state after moving, or undefined when already at the end. */
  redo(): T | undefined
  /** Returns the current state without moving. */
  peek(): T | undefined
  readonly canUndo: boolean
  readonly canRedo: boolean
}

export interface HistoryOptions<T> {
  /** Maximum number of states kept (including the current state). Default: 20. */
  limit?: number
  /** Custom equality predicate. Defaults to deep-equality via JSON.stringify. */
  equals?: (a: T, b: T) => boolean
}

/**
 * Creates a new immutable-snapshot undo/redo stack.
 *
 * @example
 * const h = createHistory<MyState>({ limit: 20 })
 * h.push(stateA)
 * h.push(stateB)
 * h.undo()  // → stateA
 */
export function createHistory<T>(options: HistoryOptions<T> = {}): History<T> {
  const limit = Math.max(1, options.limit ?? 20)
  const equals: (a: T, b: T) => boolean =
    options.equals ?? ((a, b) => JSON.stringify(a) === JSON.stringify(b))

  // All states in chronological order.
  // `cursor` points to the "current" position; everything after is redo history.
  const states: T[] = []
  let cursor = -1

  return {
    push(state: T) {
      // No-op when identical to current
      if (cursor >= 0 && equals(states[cursor], state)) return

      // Truncate future (redo) stack
      states.splice(cursor + 1)

      states.push(state)
      cursor = states.length - 1

      // Enforce limit: drop oldest state(s)
      while (states.length > limit) {
        states.shift()
        cursor--
      }
    },

    undo() {
      if (cursor <= 0) return undefined
      cursor--
      return states[cursor]
    },

    redo() {
      if (cursor >= states.length - 1) return undefined
      cursor++
      return states[cursor]
    },

    peek() {
      return cursor >= 0 ? states[cursor] : undefined
    },

    get canUndo() {
      return cursor > 0
    },

    get canRedo() {
      return cursor < states.length - 1
    },
  }
}
