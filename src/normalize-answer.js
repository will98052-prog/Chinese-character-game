export function normalizeAnswer(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\p{P}$+<=>^`|~]/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^(a|an|the)\s+/i, '')
    .trim()
}
