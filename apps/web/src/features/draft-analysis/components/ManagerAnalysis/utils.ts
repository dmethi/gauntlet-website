/**
 * Utility functions for Manager Analysis component
 * Extracted from manager-analysis.tsx for reusability and testing
 */

import { dataVizColors } from '../../../../../../../brand/colors';

/**
 * Generates heatmap color based on value position within min-max range
 * @param value - Current value to color
 * @param max - Maximum value in dataset
 * @param min - Minimum value in dataset
 * @returns CSS color string from brand color palette
 */
export const getHeatmapColor = (value: number, max: number, min: number): string => {
  if (max === min) return dataVizColors.intensity[2];

  const normalized = (value - min) / (max - min);
  const intensity = Math.max(0, Math.min(1, normalized));

  const colorIndex = Math.floor(intensity * (dataVizColors.intensity.length - 1));
  return dataVizColors.intensity[colorIndex];
};

/**
 * Calculate relative luminance using WCAG formula
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns Relative luminance (0-1)
 */
const calculateLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Parse RGB values from CSS color string (supports rgb(), rgba(), and hex formats)
 * @param color - CSS color string
 * @returns Object with r, g, b values (0-255)
 */
const parseRgb = (color: string): { r: number; g: number; b: number } => {
  // Handle rgba() format
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
    };
  }

  // Handle rgb() format
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // Handle hex format
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const num = parseInt(
      hex.length === 3
        ? hex
            .split('')
            .map(c => c + c)
            .join('')
        : hex,
      16,
    );
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  return { r: 255, g: 255, b: 255 };
};

/**
 * Calculate contrast ratio between two luminance values using WCAG formula
 * @param L1 - First luminance value
 * @param L2 - Second luminance value
 * @returns Contrast ratio (1-21)
 */
const contrastRatio = (L1: number, L2: number): number => {
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Determines text color (white or empty string for default) based on background color
 * Uses WCAG contrast ratio calculation to ensure readability
 * @param backgroundColor - CSS background color string
 * @returns 'text-white' if white text is needed, '' for default text color
 */
export const getContrastingTextColor = (backgroundColor: string): string => {
  if (!backgroundColor || backgroundColor === 'transparent') {
    return '';
  }

  const rgb = parseRgb(backgroundColor);
  const bgLuminance = calculateLuminance(rgb.r, rgb.g, rgb.b);

  const whiteContrast = contrastRatio(1.0, bgLuminance);
  const blackContrast = contrastRatio(0.0, bgLuminance);

  return whiteContrast > blackContrast ? 'text-white' : '';
};

/**
 * Get badge variant for cluster label
 * @param clusterLabel - Cluster name
 * @returns Badge variant string
 */
export const getClusterBadgeVariant = (
  clusterLabel: string,
): 'destructive' | 'default' | 'secondary' | 'outline' => {
  switch (clusterLabel) {
    case 'Stars & Scrubs':
      return 'destructive';
    case 'Balanced Build':
      return 'default';
    case 'Patience Sniper':
      return 'secondary';
    case 'Hero RB':
    case 'Ground & Pound':
      return 'outline';
    case 'WR Elite':
    case 'Receiver Corps':
      return 'outline';
    case 'Premium QB':
      return 'secondary';
    case 'TE Premium':
      return 'outline';
    case 'Early Bird':
      return 'destructive';
    case 'Depth Builder':
      return 'secondary';
    default:
      return 'outline';
  }
};

/**
 * Calculate percentage formatting (e.g., 0.234 -> "23.4%")
 * @param value - Decimal value (0-1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};
