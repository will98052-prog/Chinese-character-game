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
