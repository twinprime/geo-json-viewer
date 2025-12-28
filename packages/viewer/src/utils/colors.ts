export type Color = [number, number, number, number] | [number, number, number];

export function getColor(color: unknown, defaultColor: Color): Color {
  if (Array.isArray(color) && (color.length === 3 || color.length === 4) && color.every(c => typeof c === 'number')) {
    return color as Color;
  }
  return defaultColor;
}
