import { describe, expect, it } from 'vitest';
import {
  deltaTextClass,
  gradeBadgeClass,
  gradeTier,
  leagueBadgeClass,
  tieredBadgeClass,
} from './stat-colors';

describe('stat-colors', () => {
  describe('deltaTextClass', () => {
    it('returns success for positive values', () => {
      expect(deltaTextClass(5)).toBe('text-success');
    });

    it('returns destructive for negative values', () => {
      expect(deltaTextClass(-5)).toBe('text-destructive');
    });

    it('returns muted for zero', () => {
      expect(deltaTextClass(0)).toBe('text-muted-foreground');
    });

    it('treats values within the neutral threshold as neutral', () => {
      expect(deltaTextClass(3, 5)).toBe('text-muted-foreground');
      expect(deltaTextClass(-3, 5)).toBe('text-muted-foreground');
      expect(deltaTextClass(6, 5)).toBe('text-success');
      expect(deltaTextClass(-6, 5)).toBe('text-destructive');
    });
  });

  describe('leagueBadgeClass', () => {
    it('returns the primary tint for AFC leagues', () => {
      expect(leagueBadgeClass('Gauntlet AFC')).toContain('text-primary');
    });

    it('returns the secondary tint for non-AFC leagues', () => {
      expect(leagueBadgeClass('Gauntlet NFC')).toContain('text-secondary');
    });
  });

  describe('tieredBadgeClass', () => {
    const thresholds = { low: 1, high: 3 };

    it('returns the neutral badge at or below the low threshold', () => {
      expect(tieredBadgeClass(1, thresholds)).toBe('bg-muted text-muted-foreground');
    });

    it('returns the secondary badge between thresholds', () => {
      expect(tieredBadgeClass(2, thresholds)).toBe('bg-secondary/20 text-secondary');
    });

    it('returns the destructive badge above the high threshold', () => {
      expect(tieredBadgeClass(4, thresholds)).toBe('bg-destructive/15 text-destructive');
    });
  });

  describe('gradeTier', () => {
    it.each([
      ['A+', 'excellent'],
      ['A', 'excellent'],
      ['B', 'good'],
      ['C', 'average'],
      ['D', 'poor'],
      ['F', 'poor'],
    ] as const)('classifies grade %s as %s', (letter, tier) => {
      expect(gradeTier(letter)).toBe(tier);
    });
  });

  describe('gradeBadgeClass', () => {
    it('uses success tint for excellent grades, not the same color as a bad grade', () => {
      const excellent = gradeBadgeClass('A+');
      const poor = gradeBadgeClass('F');
      expect(excellent).toContain('text-success');
      expect(poor).toContain('text-destructive');
      expect(excellent).not.toBe(poor);
    });
  });
});
