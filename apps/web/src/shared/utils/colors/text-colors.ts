import { hexToRgb } from './helpers';

/**
 * Get the higher-contrast foreground for a background color.
 *
 * @param backgroundColor - Background hex color
 * @returns Hex color string ("#111827" or "#ffffff")
 *
 * @example
 * ```typescript
 * const textColor = getTextColor("#ffff00"); // "#111827" (dark text for yellow)
 * ```
 */
export const getTextColor = (backgroundColor: string): string => getTextColorForBg(backgroundColor);

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
  const relativeLuminance = ([red, green, blue]: number[]): number => {
    const srgb = [red, green, blue].map(value => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };
  const backgroundLuminance = relativeLuminance([r, g, b]);
  const darkLuminance = relativeLuminance([17, 24, 39]);
  const darkContrast = (backgroundLuminance + 0.05) / (darkLuminance + 0.05);
  const lightContrast = 1.05 / (backgroundLuminance + 0.05);

  return darkContrast >= lightContrast ? '#111827' : '#ffffff';
};
