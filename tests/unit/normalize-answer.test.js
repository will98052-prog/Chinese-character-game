import { describe, it, expect } from 'vitest'
import { normalizeAnswer } from '../../src/normalize-answer.js'

describe('normalizeAnswer', () => {
  it('normalizes case, spaces, punctuation, and leading articles', () => {
    expect(normalizeAnswer('  The,   You!! ')).toBe('you')
    expect(normalizeAnswer('an apple')).toBe('apple')
    expect(normalizeAnswer('A   teacher')).toBe('teacher')
  })
})
