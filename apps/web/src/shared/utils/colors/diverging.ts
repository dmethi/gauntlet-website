import { RDYLGN } from '@/app/stats/constants/RDYLGN';
import { mixHex } from './helpers';

/**
 * Get diverging background color from normalized value
 * Uses red-yellow-green color scale for diverging data visualization
 *
 * @param normalized - Normalized value between -1 and 1 (where -1 = red, 0 = yellow, 1 = green)
 * @returns Hex color string
 *
 * @example
 * ```typescript
 * const redColor = getDivergingBg(-1);   // Returns red
 * const yellowColor = getDivergingBg(0); // Returns yellow
 * const greenColor = getDivergingBg(1);  // Returns green
 * ```
 */
export const getDivergingBg = (normalized: number): string => {
  const t = Math.max(-1, Math.min(1, normalized));
  const u = (t + 1) / 2;
  const n = RDYLGN.length - 1;
  const idx = Math.max(0, Math.min(n - 1, Math.floor(u * n)));
  const frac = u * n - idx;
  const from = RDYLGN[idx];
  const to = RDYLGN[idx + 1] ?? RDYLGN[idx];
  return mixHex(from, to, frac);
};
