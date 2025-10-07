/**
 * Color utility helper functions
 * Provides hex to RGB conversion and color mixing utilities
 */

/**
 * Convert hex color to RGB components
 *
 * @param hex - Hex color string (e.g., "#ff0000")
 * @returns RGB components as an object
 *
 * @example
 * ```typescript
 * const rgb = hexToRgb("#ff0000");
 * // { r: 255, g: 0, b: 0 }
 * ```
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

/**
 * Mix two hex colors with linear interpolation
 *
 * @param hex1 - First hex color
 * @param hex2 - Second hex color
 * @param t - Interpolation factor (0-1, where 0 = hex1, 1 = hex2)
 * @returns Mixed hex color
 *
 * @example
 * ```typescript
 * const mixed = mixHex("#ff0000", "#0000ff", 0.5);
 * // Returns purple: "#7f007f"
 * ```
 */
export const mixHex = (hex1: string, hex2: string, t: number): string => {
  const { r: r1, g: g1, b: b1 } = hexToRgb(hex1);
  const { r: r2, g: g2, b: b2 } = hexToRgb(hex2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
