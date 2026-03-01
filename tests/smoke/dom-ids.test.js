import { describe, it, expect } from 'vitest'
import fs from 'node:fs'

describe('html shell', () => {
  it('contains required app elements', () => {
    const html = fs.readFileSync('index.html', 'utf8')
    expect(html).toContain('id="prompt"')
    expect(html).toContain('id="answerInput"')
    expect(html).toContain('id="submitBtn"')
    expect(html).toContain('id="nextBtn"')
    expect(html).toContain('id="feedback"')
    expect(html).toContain('id="pinyinToggle"')
    expect(html).toContain('aria-live="polite"')
  })
})
