import { colors } from '@/lib/colors';
import { hexToRgb } from './helpers';

/**
 * Get text color (black or white) based on background color
 * Uses simple heuristic for specific color palette ranges
 *
 * @param backgroundColor - Background hex color
 * @returns Hex color string ("#000000" or "#ffffff")
 *
 * @example
 * ```typescript
 * const textColor = getTextColor("#ffff00"); // "#000000" (black for yellow)
 * ```
 */
export const getTextColor = (backgroundColor: string): string => {
  // Determine if text should be white or black based on background brightness
  // For yellow/orange colors, use black text. For green/red, use white text.
  const lightColors = [colors.rdylgn[3], colors.rdylgn[4], colors.rdylgn[5], colors.rdylgn[6]]; // orange and yellow range
  return lightColors.includes(backgroundColor) ? '#000000' : '#ffffff';
};

/**
 * Get accessible text color based on background luminance
 * Uses WCAG relative luminance formula for accurate contrast calculation
 *
 * @param hex - Background hex color
 * @returns Hex color string ("#111827" or "#ffffff")
 *
 * @example
 * ```typescript
 * const textColor = getTextColorForBg("#ffff00"); // "#111827" (dark for bright yellow)
 * const textColor2 = getTextColorForBg("#000000"); // "#ffffff" (white for black)
 * ```
 */
export const getTextColorForBg = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return L > 0.5 ? '#111827' : '#ffffff';
};
