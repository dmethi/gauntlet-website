/**
 * Semantic color helpers for stat displays (deltas, league badges, tiered scores).
 *
 * Use these instead of hardcoding Tailwind palette classes (text-red-600, bg-blue-100, ...).
 * Raw palette classes don't have dark-mode variants in this codebase, so they render as
 * light-mode-only pastel chips against the dark "Modern War Room" theme. These helpers
 * resolve to CSS-variable-backed tokens (--success, --destructive, --primary, --secondary)
 * that already flip correctly between light and dark mode.
 *
 * See docs/solutions/patterns/critical-patterns.md for the full rationale.
 */

/**
 * Text color class for a signed numeric delta (excess spend, VORP, points vs. median, ...).
 * Values within `neutralThreshold` of zero are treated as neutral.
 */
export const deltaTextClass = (value: number, neutralThreshold = 0): string => {
  if (value > neutralThreshold) return 'text-success';
  if (value < -neutralThreshold) return 'text-destructive';
  return 'text-muted-foreground';
};

/**
 * Two-league (AFC/NFC) badge treatment. Reuses the brand's two primary hues
 * (crimson = primary, gold = secondary) as soft tints instead of introducing
 * off-brand blue/green.
 */
export const leagueBadgeClass = (league: string): string =>
  league.includes('AFC')
    ? 'bg-primary/10 text-primary border border-primary/20'
    : 'bg-secondary/15 text-secondary border border-secondary/30';

/**
 * Neutral pill treatment for non-directional tags (position, generic labels).
 */
export const neutralBadgeClass = 'bg-muted text-muted-foreground';

/**
 * Tiered intensity badge (e.g. competition level, risk level) across three bands.
 * `value` is compared against the two thresholds ascending.
 */
export const tieredBadgeClass = (
  value: number,
  { low, high }: { low: number; high: number },
): string => {
  if (value > high) return 'bg-destructive/15 text-destructive';
  if (value > low) return 'bg-secondary/20 text-secondary';
  return neutralBadgeClass;
};

/** Letter-grade tier used for grade badges (A+/A/B/C/D/F style scores). */
export type GradeTier = 'excellent' | 'good' | 'average' | 'poor';

export const gradeTier = (letter: string): GradeTier => {
  const first = letter.trim().charAt(0).toUpperCase();
  if (first === 'A') return 'excellent';
  if (first === 'B') return 'good';
  if (first === 'C') return 'average';
  return 'poor';
};

/**
 * Grade badge classes, scaled by tier rather than a single flat color.
 * A flat "always crimson" badge collides with red-for-negative used elsewhere
 * in the same tables (an A+ badge would look identical to a "bad" negative number).
 */
export const gradeBadgeClass = (letter: string): string => {
  switch (gradeTier(letter)) {
    case 'excellent':
      return 'bg-success/15 text-success border border-success/30';
    case 'good':
      return 'bg-secondary/15 text-secondary border border-secondary/30';
    case 'average':
      return 'bg-muted text-muted-foreground border border-border';
    case 'poor':
      return 'bg-destructive/15 text-destructive border border-destructive/30';
  }
};
