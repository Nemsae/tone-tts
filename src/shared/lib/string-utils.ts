export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function splitWords(value: string): string[] {
  const normalized = normalizeText(value)
  if (normalized.length === 0) {
    return []
  }

  return normalized.split(' ')
}

export function levenshteinDistance(source: string, target: string): number {
  if (source === target) {
    return 0
  }

  if (source.length === 0) {
    return target.length
  }

  if (target.length === 0) {
    return source.length
  }

  const matrix = Array.from({ length: source.length + 1 }, () =>
    new Array<number>(target.length + 1).fill(0),
  )

  for (let sourceIndex = 0; sourceIndex <= source.length; sourceIndex += 1) {
    matrix[sourceIndex][0] = sourceIndex
  }

  for (let targetIndex = 0; targetIndex <= target.length; targetIndex += 1) {
    matrix[0][targetIndex] = targetIndex
  }

  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const substitutionCost = source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1
      matrix[sourceIndex][targetIndex] = Math.min(
        matrix[sourceIndex - 1][targetIndex] + 1,
        matrix[sourceIndex][targetIndex - 1] + 1,
        matrix[sourceIndex - 1][targetIndex - 1] + substitutionCost,
      )
    }
  }

  return matrix[source.length][target.length]
}

export function calculateSimilarity(target: string, input: string): number {
  const normalizedTarget = normalizeText(target)
  const normalizedInput = normalizeText(input)

  if (normalizedTarget.length === 0 && normalizedInput.length === 0) {
    return 100
  }

  if (normalizedTarget.length === 0 || normalizedInput.length === 0) {
    return 0
  }

  const distance = levenshteinDistance(normalizedTarget, normalizedInput)
  const longestLength = Math.max(normalizedTarget.length, normalizedInput.length)
  const rawScore = ((longestLength - distance) / longestLength) * 100

  return Math.max(0, Math.round(rawScore))
}
