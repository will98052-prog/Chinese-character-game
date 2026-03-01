import { describe, it, expect } from 'vitest'
import { evaluateSubmission } from '../../app.js'

describe('app flow helpers', () => {
  it('returns validation error for empty input', () => {
    const result = evaluateSubmission({ meanings: ['you'] }, '   ')
    expect(result.kind).toBe('validation-error')
  })
})
