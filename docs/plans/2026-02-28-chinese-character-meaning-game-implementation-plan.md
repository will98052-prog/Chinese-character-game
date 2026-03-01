# Chinese Character Meaning Game Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static, client-only Chinese character meaning quiz app with manual `Next`, normalized exact answer matching, optional pinyin toggle, and persisted session stats.

**Architecture:** Use a lightweight vanilla HTML/CSS/JS app where UI and wiring live in `app.js`, while quiz logic is split into small pure modules in `src/` for testability. Keep vocabulary in `data/vocab.easy.json` and persist stats/preferences via `localStorage`. Use unit tests for core logic and a short manual QA pass for UI flow.

**Tech Stack:** HTML, CSS, Vanilla JavaScript (ES modules), Node.js, Vitest

---

Execution discipline for implementation:

- Follow @superpowers/test-driven-development task-by-task.
- Verify before claiming completion with @superpowers/verification-before-completion.
- If bugs appear, switch to @superpowers/systematic-debugging before patching.

### Task 1: Initialize project for testable vanilla JS

**Files:**
- Create: `package.json`
- Create: `vitest.config.js`
- Create: `tests/smoke/project-smoke.test.js`

**Step 1: Write the failing smoke test**

```js
import { describe, it, expect } from 'vitest'

describe('project smoke', () => {
  it('runs tests', () => {
    expect(true).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/smoke/project-smoke.test.js`
Expected: FAIL with "missing script: test" or missing Vitest dependency.

**Step 3: Write minimal implementation**

```json
{
  "name": "wordgame",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^2.1.9"
  }
}
```

```js
export default {
  test: {
    environment: 'node'
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm install && npm test -- --run tests/smoke/project-smoke.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json vitest.config.js tests/smoke/project-smoke.test.js package-lock.json
git commit -m "chore: initialize test harness for vanilla app"
```

### Task 2: Add vocabulary dataset (easy tier)

**Files:**
- Create: `data/vocab.easy.json`
- Test: `tests/unit/vocab-shape.test.js`

**Step 1: Write the failing data-shape test**

```js
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/vocab-shape.test.js`
Expected: FAIL because `data/vocab.easy.json` does not exist.

**Step 3: Write minimal implementation**

```json
[
  { "id": "ni-001", "hanzi": "你", "pinyin": "ni3", "meanings": ["you"], "difficulty": "easy" }
]
```

Then expand to 50-100 beginner entries.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/vocab-shape.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add data/vocab.easy.json tests/unit/vocab-shape.test.js
git commit -m "feat: add easy vocabulary dataset with schema coverage"
```

### Task 3: Implement answer normalization

**Files:**
- Create: `src/normalize-answer.js`
- Test: `tests/unit/normalize-answer.test.js`

**Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import { normalizeAnswer } from '../../src/normalize-answer.js'

describe('normalizeAnswer', () => {
  it('normalizes case, spaces, punctuation, and leading articles', () => {
    expect(normalizeAnswer('  The,   You!! ')).toBe('you')
    expect(normalizeAnswer('an apple')).toBe('apple')
    expect(normalizeAnswer('A   teacher')).toBe('teacher')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/normalize-answer.test.js`
Expected: FAIL with module not found for `src/normalize-answer.js`.

**Step 3: Write minimal implementation**

```js
export function normalizeAnswer(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\p{P}$+<=>^`|~]/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^(a|an|the)\s+/i, '')
    .trim()
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/normalize-answer.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/normalize-answer.js tests/unit/normalize-answer.test.js
git commit -m "feat: add normalized exact-answer preprocessing"
```

### Task 4: Implement answer checking logic

**Files:**
- Create: `src/check-answer.js`
- Test: `tests/unit/check-answer.test.js`

**Step 1: Write the failing test**

```js
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/check-answer.test.js`
Expected: FAIL with module not found.

**Step 3: Write minimal implementation**

```js
import { normalizeAnswer } from './normalize-answer.js'

export function checkAnswer(prompt, input) {
  const normalizedInput = normalizeAnswer(input)
  if (!normalizedInput) return false
  const accepted = new Set((prompt.meanings || []).map((m) => normalizeAnswer(m)))
  return accepted.has(normalizedInput)
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/check-answer.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/check-answer.js tests/unit/check-answer.test.js
git commit -m "feat: add answer evaluation against accepted meanings"
```

### Task 5: Implement prompt selection without immediate repeats

**Files:**
- Create: `src/select-next-prompt.js`
- Test: `tests/unit/select-next-prompt.test.js`

**Step 1: Write the failing test**

```js
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/select-next-prompt.test.js`
Expected: FAIL with module not found.

**Step 3: Write minimal implementation**

```js
export function selectNextPrompt(items, currentItem) {
  if (!Array.isArray(items) || items.length === 0) return null
  if (items.length === 1) return items[0]

  const filtered = items.filter((item) => item.id !== currentItem?.id)
  const pool = filtered.length > 0 ? filtered : items
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/select-next-prompt.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/select-next-prompt.js tests/unit/select-next-prompt.test.js
git commit -m "feat: add prompt selection with repeat avoidance"
```

### Task 6: Implement persisted session store

**Files:**
- Create: `src/session-store.js`
- Test: `tests/unit/session-store.test.js`

**Step 1: Write the failing test**

```js
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/session-store.test.js`
Expected: FAIL (missing module and/or missing browser-like env for `localStorage`).

**Step 3: Write minimal implementation**

Set `vitest.config.js` test environment to `jsdom`, then add:

```js
const DEFAULT_STATE = {
  totalAnswered: 0,
  correctCount: 0,
  incorrectCount: 0,
  showPinyin: false
}

export function createSessionStore(key) {
  function get() {
    try {
      return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(key) || '{}') }
    } catch {
      return { ...DEFAULT_STATE }
    }
  }

  function patch(partial) {
    const next = { ...get(), ...partial }
    localStorage.setItem(key, JSON.stringify(next))
    return next
  }

  return { get, patch }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/session-store.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/session-store.js tests/unit/session-store.test.js vitest.config.js
git commit -m "feat: add localStorage-backed session state"
```

### Task 7: Build static UI shell and responsive styling

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Test: `tests/smoke/dom-ids.test.js`

**Step 1: Write the failing DOM-structure test**

```js
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/smoke/dom-ids.test.js`
Expected: FAIL because `index.html` is missing.

**Step 3: Write minimal implementation**

```html
<main id="app">
  <h1 id="prompt"></h1>
  <p id="pinyin"></p>
  <label for="answerInput">English meaning</label>
  <input id="answerInput" type="text" />
  <button id="submitBtn" type="button">Submit</button>
  <button id="nextBtn" type="button" disabled>Next</button>
  <button id="pinyinToggle" type="button">Show Pinyin</button>
  <p id="feedback" aria-live="polite"></p>
</main>
```

Add responsive mobile-first styling in `styles.css` for readable prompt, large tap targets, and clear feedback states.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/smoke/dom-ids.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add index.html styles.css tests/smoke/dom-ids.test.js
git commit -m "feat: add accessible quiz UI shell and responsive styles"
```

### Task 8: Wire app flow in `app.js` (submit, judge, manual next)

**Files:**
- Create: `app.js`
- Modify: `index.html`
- Test: `tests/unit/app-flow.test.js`

**Step 1: Write the failing flow test**

```js
import { describe, it, expect } from 'vitest'
import { evaluateSubmission } from '../../app.js'

describe('app flow helpers', () => {
  it('returns validation error for empty input', () => {
    const result = evaluateSubmission({ meanings: ['you'] }, '   ')
    expect(result.kind).toBe('validation-error')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/app-flow.test.js`
Expected: FAIL with missing exported helper from `app.js`.

**Step 3: Write minimal implementation**

```js
import vocab from './data/vocab.easy.json' assert { type: 'json' }
import { checkAnswer } from './src/check-answer.js'
import { selectNextPrompt } from './src/select-next-prompt.js'
import { createSessionStore } from './src/session-store.js'

export function evaluateSubmission(prompt, input) {
  if (!String(input ?? '').trim()) {
    return { kind: 'validation-error', message: 'Please enter an answer.' }
  }
  return checkAnswer(prompt, input)
    ? { kind: 'correct' }
    : { kind: 'incorrect', accepted: prompt.meanings[0] }
}
```

Then wire DOM events:

- Enter or `Submit` triggers judge.
- `Next` remains disabled until judged.
- On judged result, update store and feedback.
- On `Next`, select new prompt and reset UI state.
- Pinyin toggle updates persisted `showPinyin` preference.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/app-flow.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add app.js index.html tests/unit/app-flow.test.js
git commit -m "feat: implement quiz loop with manual next and persisted preferences"
```

### Task 9: Align product docs with locked decisions

**Files:**
- Modify: `PDD.md`
- Test: `tests/smoke/pdd-locks.test.js`

**Step 1: Write the failing doc-lock test**

```js
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/smoke/pdd-locks.test.js`
Expected: FAIL until text is added or clarified.

**Step 3: Write minimal implementation**

Update `PDD.md` sections 6-8 to explicitly encode:

- Stack locked to vanilla HTML/CSS/JS
- Manual `Next` interaction
- Pinyin toggle preference persistence
- Normalized exact matching policy
- Stats persistence in `localStorage`

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/smoke/pdd-locks.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add PDD.md tests/smoke/pdd-locks.test.js
git commit -m "docs: lock v1 behavior decisions in product design doc"
```

### Task 10: Final verification and release-ready checkpoint

**Files:**
- Modify (if needed): `README.md`

**Step 1: Write the failing verification checklist entry**

```md
- [ ] Unit tests pass
- [ ] App serves and runs locally
- [ ] 20-cycle manual QA completed
- [ ] Mobile viewport sanity checked
```

**Step 2: Run full verification to expose gaps**

Run: `npm test`
Expected: FAIL if any earlier task regressed.

**Step 3: Write minimal implementation to close gaps**

Fix only failing tests/flows (no feature creep), then add run instructions:

```md
## Run

npm install
npm test
npx serve .
```

**Step 4: Run verification to confirm pass**

Run:

- `npm test`
- `npx serve .` (manual smoke in browser: submit, feedback, next, stats persistence)

Expected: All tests PASS; manual flow behaves as specified.

**Step 5: Commit**

```bash
git add README.md
git commit -m "chore: add runbook and finalize v1 verification"
```
