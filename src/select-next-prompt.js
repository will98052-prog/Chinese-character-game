export function selectNextPrompt(items, currentItem) {
  if (!Array.isArray(items) || items.length === 0) return null
  if (items.length === 1) return items[0]

  const filtered = items.filter((item) => item.id !== currentItem?.id)
  const pool = filtered.length > 0 ? filtered : items
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}
