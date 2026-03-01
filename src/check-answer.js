import { normalizeAnswer } from './normalize-answer.js'

export function checkAnswer(prompt, input) {
  const normalizedInput = normalizeAnswer(input)
  if (!normalizedInput) return false
  const accepted = new Set((prompt.meanings || []).map((m) => normalizeAnswer(m)))
  return accepted.has(normalizedInput)
}
