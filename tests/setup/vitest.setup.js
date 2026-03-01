if (typeof globalThis.localStorage?.clear !== 'function') {
  const store = new Map()
  const localStorageShim = {
    getItem(key) {
      const normalizedKey = String(key)
      return store.has(normalizedKey) ? store.get(normalizedKey) : null
    },
    setItem(key, value) {
      store.set(String(key), String(value))
    },
    removeItem(key) {
      store.delete(String(key))
    },
    clear() {
      store.clear()
    }
  }

  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageShim,
    configurable: true,
    writable: true
  })

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageShim,
      configurable: true,
      writable: true
    })
  }
}
