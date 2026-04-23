export function sortStringsRu(values: string[]) {
  return [...values].sort((left, right) =>
    left.localeCompare(right, 'ru-RU', { sensitivity: 'base' }),
  )
}

export function sortOptionsByLabel<T extends { label: string }>(values: T[]) {
  return [...values].sort((left, right) =>
    left.label.localeCompare(right.label, 'ru-RU', { sensitivity: 'base' }),
  )
}
