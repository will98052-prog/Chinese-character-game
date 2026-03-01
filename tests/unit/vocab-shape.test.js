import { describe, it, expect } from 'vitest'
import vocab from '../../data/vocab.easy.json' assert { type: 'json' }

describe('vocab shape', () => {
  it('contains at least 50 easy items with required fields', () => {
    expect(vocab.length).toBeGreaterThanOrEqual(50)
    for (const item of vocab) {
      expect(item.id).toBeTypeOf('string')
      expect(item.hanzi).toBeTypeOf('string')
      expect(Array.isArray(item.meanings)).toBe(true)
      expect(item.meanings.length).toBeGreaterThan(0)
      expect(item.difficulty).toBe('easy')
    }
  })
})
