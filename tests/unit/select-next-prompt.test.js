import { describe, it, expect } from 'vitest'
import { selectNextPrompt } from '../../src/select-next-prompt.js'

describe('selectNextPrompt', () => {
  it('avoids immediate repeats when pool size > 1', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const current = { id: 'a' }
    for (let i = 0; i < 30; i += 1) {
      const next = selectNextPrompt(items, current)
      expect(next.id).not.toBe('a')
    }
  })

  it('allows repeat when only one item exists', () => {
    const only = [{ id: 'solo' }]
    expect(selectNextPrompt(only, only[0]).id).toBe('solo')
  })
})
