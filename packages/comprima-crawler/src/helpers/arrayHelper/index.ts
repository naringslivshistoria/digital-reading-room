export const getSubRange = (lower: number, upper: number, size: number): number[] => {
  if (lower + size > upper || lower === upper) {
    return [...Array(upper + 1 - lower).keys()].map(i => i + lower)
  } else {
    return [...Array(size).keys()].map(i => i + lower)
  }
}