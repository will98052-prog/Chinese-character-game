import vocab from './data/vocab.easy.json' assert { type: 'json' }
import { checkAnswer } from './src/check-answer.js'
import { selectNextPrompt } from './src/select-next-prompt.js'
import { createSessionStore } from './src/session-store.js'

const STORAGE_KEY = 'wordgame:v1'

export function evaluateSubmission(prompt, input) {
  if (!String(input ?? '').trim()) {
    return { kind: 'validation-error', message: 'Please enter an answer.' }
  }

  return checkAnswer(prompt, input)
    ? { kind: 'correct' }
    : { kind: 'incorrect', accepted: prompt.meanings[0] }
}

function getUiElements(doc) {
  const ids = [
    'prompt',
    'pinyin',
    'answerInput',
    'submitBtn',
    'nextBtn',
    'pinyinToggle',
    'feedback'
  ]

  const entries = ids.map((id) => [id, doc.getElementById(id)])
  if (entries.some(([, node]) => !node)) return null
  return Object.fromEntries(entries)
}

export function initializeApp(doc = document) {
  if (!doc || typeof doc.getElementById !== 'function') return null

  const ui = getUiElements(doc)
  if (!ui) return null

  const store = createSessionStore(STORAGE_KEY)
  let session = store.get()
  let currentPrompt = selectNextPrompt(vocab, null)

  function patchSession(partial) {
    session = store.patch(partial)
    return session
  }

  function renderPrompt() {
    if (!currentPrompt) {
      ui.prompt.textContent = 'No prompts available.'
      ui.pinyin.textContent = ''
      return
    }

    ui.prompt.textContent = currentPrompt.hanzi
    ui.pinyin.textContent = session.showPinyin ? currentPrompt.pinyin : ''
  }

  function renderPinyinToggle() {
    ui.pinyinToggle.textContent = session.showPinyin ? 'Hide Pinyin' : 'Show Pinyin'
  }

  function setFeedback(result) {
    ui.feedback.dataset.state = result.kind

    if (result.kind === 'correct') {
      ui.feedback.textContent = 'Correct.'
      return
    }

    if (result.kind === 'incorrect') {
      ui.feedback.textContent = `Incorrect. Accepted: ${result.accepted}`
      return
    }

    ui.feedback.textContent = result.message
  }

  function resetRound() {
    ui.answerInput.value = ''
    ui.feedback.textContent = ''
    delete ui.feedback.dataset.state
    ui.submitBtn.disabled = false
    ui.nextBtn.disabled = true
    ui.answerInput.focus()
  }

  function handleSubmit() {
    const result = evaluateSubmission(currentPrompt, ui.answerInput.value)
    setFeedback(result)

    if (result.kind === 'validation-error') {
      return
    }

    const isCorrect = result.kind === 'correct'
    patchSession({
      totalAnswered: session.totalAnswered + 1,
      correctCount: session.correctCount + (isCorrect ? 1 : 0),
      incorrectCount: session.incorrectCount + (isCorrect ? 0 : 1)
    })

    ui.submitBtn.disabled = true
    ui.nextBtn.disabled = false
  }

  function handleNext() {
    currentPrompt = selectNextPrompt(vocab, currentPrompt)
    renderPrompt()
    resetRound()
  }

  function handlePinyinToggle() {
    patchSession({ showPinyin: !session.showPinyin })
    renderPinyinToggle()
    renderPrompt()
  }

  ui.submitBtn.addEventListener('click', handleSubmit)
  ui.nextBtn.addEventListener('click', handleNext)
  ui.pinyinToggle.addEventListener('click', handlePinyinToggle)
  ui.answerInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    handleSubmit()
  })

  renderPrompt()
  renderPinyinToggle()
  resetRound()

  return {
    getCurrentPrompt() {
      return currentPrompt
    },
    getSession() {
      return session
    }
  }
}

if (typeof document !== 'undefined') {
  initializeApp(document)
}
