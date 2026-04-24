// Framework-agnostic debounce-save utility.
// Phase 64 (Build Creator UI) wraps this in a React hook.

export type AutosaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

interface AutosaverOptions<T> {
  delayMs: number
  save: (payload: T) => Promise<void>
}

export interface Autosaver<T> {
  push(payload: T): void
  flush(): Promise<void>
  readonly state: AutosaveState
}

export function createAutosaver<T>(options: AutosaverOptions<T>): Autosaver<T> {
  const { delayMs, save } = options
  let _state: AutosaveState = 'idle'
  let timerId: ReturnType<typeof setTimeout> | null = null
  let queued: T | null = null

  function cancelTimer(): void {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  async function runSave(payload: T): Promise<void> {
    _state = 'saving'
    try {
      await save(payload)
      _state = 'saved'
    } catch {
      _state = 'error'
    }
  }

  return {
    push(payload: T): void {
      queued = payload
      _state = 'pending'
      cancelTimer()
      timerId = setTimeout(() => {
        timerId = null
        const p = queued as T
        queued = null
        void runSave(p)
      }, delayMs)
    },

    async flush(): Promise<void> {
      cancelTimer()
      if (queued !== null) {
        const p = queued
        queued = null
        await runSave(p)
      }
    },

    get state(): AutosaveState {
      return _state
    },
  }
}
