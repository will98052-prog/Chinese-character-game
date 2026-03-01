import { describe, it, expect } from 'vitest'
import fs from 'node:fs'

describe('pdd locked decisions', () => {
  it('documents selected implementation constraints', () => {
    const pdd = fs.readFileSync('PDD.md', 'utf8')
    expect(pdd).toContain('vanilla HTML/CSS/JS')
    expect(pdd).toContain('manual Next')
    expect(pdd).toContain('localStorage')
    expect(pdd).toContain('normalized exact')
  })
})
