export type Color = [number, number, number, number] | [number, number, number]

export function getColor(color: unknown, defaultColor: Color): Color {
  if (
    Array.isArray(color) &&
    (color.length === 3 || color.length === 4) &&
    color.every((c) => typeof c === "number")
  ) {
    return color as Color
  }
  return defaultColor
}

export function adjustBrightness(color: Color, factor: number): Color {
  const [r, g, b] = color
  const a = color.length === 4 ? color[3] : undefined

  const newR = Math.min(255, Math.max(0, Math.round(r * factor)))
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)))
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)))

  if (a !== undefined) {
    return [newR, newG, newB, a]
  }
  return [newR, newG, newB]
}
