import { beforeEach, describe, it, expect } from 'vitest'
import { evaluateSubmission, initializeApp } from '../../app.js'

const APP_HTML = `
  <main id="app">
    <h1 id="prompt"></h1>
    <p id="pinyin"></p>
    <label for="answerInput">English meaning</label>
    <input id="answerInput" type="text" autocomplete="off" />
    <div class="actions">
      <button id="submitBtn" type="button">Submit</button>
      <button id="nextBtn" type="button" disabled>Next</button>
    </div>
    <button id="pinyinToggle" type="button">Show Pinyin</button>
    <p id="feedback" aria-live="polite"></p>
    <section id="statsStrip" aria-label="Session stats">
      <span>Answered: <strong id="statAnswered">0</strong></span>
      <span>Correct: <strong id="statCorrect">0</strong></span>
      <span>Incorrect: <strong id="statIncorrect">0</strong></span>
      <span>Accuracy: <strong id="statAccuracy">0%</strong></span>
    </section>
  </main>
`

function getStatText(id) {
  return document.getElementById(id)?.textContent
}

describe('app flow helpers', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = APP_HTML
  })

  it('returns validation error for empty input', () => {
    const result = evaluateSubmission({ meanings: ['you'] }, '   ')
    expect(result.kind).toBe('validation-error')
  })

  it('updates visible stats after judged answers and keeps them after reload', () => {
    const app = initializeApp(document)
    expect(app).not.toBeNull()

    expect(getStatText('statAnswered')).toBe('0')
    expect(getStatText('statCorrect')).toBe('0')
    expect(getStatText('statIncorrect')).toBe('0')
    expect(getStatText('statAccuracy')).toBe('0%')

    const answerInput = document.getElementById('answerInput')
    const submitBtn = document.getElementById('submitBtn')
    const nextBtn = document.getElementById('nextBtn')

    answerInput.value = app.getCurrentPrompt().meanings[0]
    submitBtn.click()

    expect(getStatText('statAnswered')).toBe('1')
    expect(getStatText('statCorrect')).toBe('1')
    expect(getStatText('statIncorrect')).toBe('0')
    expect(getStatText('statAccuracy')).toBe('100%')

    nextBtn.click()
    answerInput.value = '__wrong_answer__'
    submitBtn.click()

    expect(getStatText('statAnswered')).toBe('2')
    expect(getStatText('statCorrect')).toBe('1')
    expect(getStatText('statIncorrect')).toBe('1')
    expect(getStatText('statAccuracy')).toBe('50%')

    document.body.innerHTML = APP_HTML
    initializeApp(document)

    expect(getStatText('statAnswered')).toBe('2')
    expect(getStatText('statCorrect')).toBe('1')
    expect(getStatText('statIncorrect')).toBe('1')
    expect(getStatText('statAccuracy')).toBe('50%')
  })
})
