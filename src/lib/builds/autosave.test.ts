import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAutosaver } from './autosave'

describe('createAutosaver', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts idle', () => {
    const saver = createAutosaver({ delayMs: 1000, save: vi.fn() })
    expect(saver.state).toBe('idle')
  })

  it('goes pending after push', () => {
    const saver = createAutosaver({
      delayMs: 1000,
      save: vi.fn().mockResolvedValue(undefined),
    })
    saver.push('data')
    expect(saver.state).toBe('pending')
  })

  it('debounces: calls save only once for rapid pushes', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const saver = createAutosaver({ delayMs: 1000, save })
    saver.push('a')
    saver.push('b')
    saver.push('c')
    await vi.runAllTimersAsync()
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith('c')
  })

  it('cancels pending timer on new push and resets debounce', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const saver = createAutosaver({ delayMs: 1000, save })
    saver.push('first')
    await vi.advanceTimersByTimeAsync(500) // timer not fired yet
    expect(save).not.toHaveBeenCalled()
    saver.push('second') // resets timer
    await vi.advanceTimersByTimeAsync(500) // 500ms into new 1000ms window
    expect(save).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(500) // now timer fires
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith('second')
  })

  it('transitions to saved after successful save', async () => {
    const saver = createAutosaver({
      delayMs: 100,
      save: vi.fn().mockResolvedValue(undefined),
    })
    saver.push('data')
    await vi.runAllTimersAsync()
    expect(saver.state).toBe('saved')
  })

  it('transitions to error when save rejects', async () => {
    const saver = createAutosaver({
      delayMs: 100,
      save: vi.fn().mockRejectedValue(new Error('network error')),
    })
    saver.push('data')
    await vi.runAllTimersAsync()
    expect(saver.state).toBe('error')
  })

  it('flush saves immediately without waiting for debounce', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const saver = createAutosaver({ delayMs: 5000, save })
    saver.push('urgent')
    await saver.flush()
    expect(save).toHaveBeenCalledWith('urgent')
    expect(saver.state).toBe('saved')
  })

  it('flush is a no-op when idle', async () => {
    const save = vi.fn()
    const saver = createAutosaver({ delayMs: 1000, save })
    await saver.flush()
    expect(save).not.toHaveBeenCalled()
    expect(saver.state).toBe('idle')
  })
})
