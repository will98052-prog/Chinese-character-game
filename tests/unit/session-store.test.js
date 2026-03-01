import { describe, it, expect, beforeEach } from 'vitest'
import { createSessionStore } from '../../src/session-store.js'

describe('session store', () => {
  beforeEach(() => localStorage.clear())

  it('initializes defaults and persists updates', () => {
    const store = createSessionStore('wordgame:v1')
    expect(store.get().totalAnswered).toBe(0)
    store.patch({ totalAnswered: 1, correctCount: 1 })
    expect(createSessionStore('wordgame:v1').get().totalAnswered).toBe(1)
  })
})
