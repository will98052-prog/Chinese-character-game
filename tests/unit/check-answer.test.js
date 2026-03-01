import { describe, it, expect } from 'vitest'
import { checkAnswer } from '../../src/check-answer.js'

describe('checkAnswer', () => {
  const prompt = { meanings: ['hello', 'hi'] }

  it('returns true when normalized input matches one accepted meaning', () => {
    expect(checkAnswer(prompt, '  HELLO ')).toBe(true)
  })

  it('returns false for non-matching input', () => {
    expect(checkAnswer(prompt, 'goodbye')).toBe(false)
  })
})
