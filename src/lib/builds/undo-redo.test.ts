import { describe, expect, it } from 'vitest'
import { createHistory } from './undo-redo'

describe('createHistory', () => {
  // ---------------------------------------------------------------------------
  // Basic push / peek
  // ---------------------------------------------------------------------------

  it('peek returns undefined on an empty history', () => {
    const h = createHistory<number>()
    expect(h.peek()).toBeUndefined()
  })

  it('peek returns the most recent pushed state', () => {
    const h = createHistory<number>()
    h.push(1)
    h.push(2)
    expect(h.peek()).toBe(2)
  })

  // ---------------------------------------------------------------------------
  // canUndo / canRedo flags
  // ---------------------------------------------------------------------------

  it('canUndo is false on a fresh history', () => {
    const h = createHistory<number>()
    expect(h.canUndo).toBe(false)
  })

  it('canUndo is true after pushing 2 states', () => {
    const h = createHistory<number>()
    h.push(1)
    h.push(2)
    expect(h.canUndo).toBe(true)
  })

  it('canRedo is false when at the latest state', () => {
    const h = createHistory<number>()
    h.push(1)
    expect(h.canRedo).toBe(false)
  })

  // ---------------------------------------------------------------------------
  // undo
  // ---------------------------------------------------------------------------

  it('push 3, undo 2 → peek is state 1', () => {
    const h = createHistory<number>()
    h.push(10)
    h.push(20)
    h.push(30)
    h.undo()
    h.undo()
    expect(h.peek()).toBe(10)
  })

  it('undo returns undefined when at the beginning', () => {
    const h = createHistory<number>()
    h.push(1)
    expect(h.undo()).toBeUndefined()
  })

  it('undo restores canRedo', () => {
    const h = createHistory<number>()
    h.push(1)
    h.push(2)
    h.undo()
    expect(h.canRedo).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // redo
  // ---------------------------------------------------------------------------

  it('redo restores the undone state', () => {
    const h = createHistory<number>()
    h.push(1)
    h.push(2)
    h.undo()
    expect(h.redo()).toBe(2)
    expect(h.peek()).toBe(2)
  })

  it('redo returns undefined when at the latest state', () => {
    const h = createHistory<number>()
    h.push(1)
    expect(h.redo()).toBeUndefined()
  })

  // ---------------------------------------------------------------------------
  // push clears redo stack
  // ---------------------------------------------------------------------------

  it('push 3, undo 2, push new → redo stack cleared', () => {
    const h = createHistory<number>()
    h.push(10)
    h.push(20)
    h.push(30)
    h.undo()
    h.undo()
    h.push(99)
    expect(h.canRedo).toBe(false)
    expect(h.peek()).toBe(99)
  })

  // ---------------------------------------------------------------------------
  // limit enforcement
  // ---------------------------------------------------------------------------

  it('push > limit → oldest state is dropped', () => {
    const h = createHistory<number>({ limit: 3 })
    h.push(1)
    h.push(2)
    h.push(3)
    h.push(4)  // drops 1
    // undo twice → should land at 2 (not 1)
    h.undo()
    h.undo()
    expect(h.peek()).toBe(2)
    expect(h.canUndo).toBe(false)
  })

  // ---------------------------------------------------------------------------
  // Identical-state no-op
  // ---------------------------------------------------------------------------

  it('pushing the same state twice does not grow the undo stack', () => {
    const h = createHistory<number>()
    h.push(42)
    h.push(42)
    expect(h.canUndo).toBe(false)
  })

  it('uses a custom equality predicate', () => {
    const h = createHistory<{ v: number }>({
      equals: (a, b) => a.v === b.v,
    })
    h.push({ v: 1 })
    h.push({ v: 1 })  // same by custom predicate → no-op
    expect(h.canUndo).toBe(false)
    h.push({ v: 2 })
    expect(h.canUndo).toBe(true)
  })
})
