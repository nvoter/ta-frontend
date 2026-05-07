export function getPositionsLabel(count: number) {
  const normalizedCount = Math.abs(count)
  const mod100 = normalizedCount % 100
  const mod10 = normalizedCount % 10

  if (mod100 >= 11 && mod100 <= 14) {
    return 'позиций (групп)'
  }

  if (mod10 === 1) {
    return 'позиция (группа)'
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return 'позиции (группы)'
  }

  return 'позиций (групп)'
}
