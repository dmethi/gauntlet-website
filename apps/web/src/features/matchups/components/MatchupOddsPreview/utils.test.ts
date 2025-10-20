import { describe, expect, it } from 'vitest';
import {
  formatSpreadDisplay,
  formatTotalDisplay,
  formatWinProbability,
  getWinProbColor,
} from './utils';

describe('MatchupOddsPreview Utils', () => {
  describe('getWinProbColor', () => {
    it('returns green for high probability (>65%)', () => {
      expect(getWinProbColor(0.75)).toBe('text-green-600 dark:text-green-400');
      expect(getWinProbColor(0.66)).toBe('text-green-600 dark:text-green-400');
    });

    it('returns yellow for good probability (55-65%)', () => {
      expect(getWinProbColor(0.6)).toBe('text-yellow-600 dark:text-yellow-400');
      expect(getWinProbColor(0.56)).toBe('text-yellow-600 dark:text-yellow-400');
    });

    it('returns yellow for even matchup (45-55%)', () => {
      expect(getWinProbColor(0.5)).toBe('text-yellow-500 dark:text-yellow-500');
      expect(getWinProbColor(0.46)).toBe('text-yellow-500 dark:text-yellow-500');
    });

    it('returns orange for low probability (35-45%)', () => {
      expect(getWinProbColor(0.4)).toBe('text-orange-500 dark:text-orange-400');
      expect(getWinProbColor(0.36)).toBe('text-orange-500 dark:text-orange-400');
    });

    it('returns red for very low probability (<35%)', () => {
      expect(getWinProbColor(0.3)).toBe('text-red-500 dark:text-red-400');
      expect(getWinProbColor(0.1)).toBe('text-red-500 dark:text-red-400');
    });

    it('handles boundary values correctly', () => {
      // Boundaries are exclusive (>), so values equal to threshold fall into next category
      expect(getWinProbColor(0.65)).toBe('text-yellow-600 dark:text-yellow-400'); // =0.65, not > 0.65
      expect(getWinProbColor(0.66)).toBe('text-green-600 dark:text-green-400'); // >0.65
      expect(getWinProbColor(0.55)).toBe('text-yellow-500 dark:text-yellow-500'); // =0.55, not > 0.55
      expect(getWinProbColor(0.56)).toBe('text-yellow-600 dark:text-yellow-400'); // >0.55
      expect(getWinProbColor(0.45)).toBe('text-orange-500 dark:text-orange-400'); // =0.45, not > 0.45
      expect(getWinProbColor(0.46)).toBe('text-yellow-500 dark:text-yellow-500'); // >0.45
      expect(getWinProbColor(0.35)).toBe('text-red-500 dark:text-red-400'); // =0.35, not > 0.35
      expect(getWinProbColor(0.36)).toBe('text-orange-500 dark:text-orange-400'); // >0.35
    });
  });

  describe('formatWinProbability', () => {
    it('formats probabilities as percentages', () => {
      expect(formatWinProbability(0.753)).toBe('75%');
      expect(formatWinProbability(0.5)).toBe('50%');
      expect(formatWinProbability(0.247)).toBe('25%');
    });

    it('rounds to nearest integer', () => {
      expect(formatWinProbability(0.754)).toBe('75%');
      expect(formatWinProbability(0.755)).toBe('76%');
      expect(formatWinProbability(0.999)).toBe('100%');
    });

    it('handles edge cases', () => {
      expect(formatWinProbability(0)).toBe('0%');
      expect(formatWinProbability(1)).toBe('100%');
    });
  });

  describe('formatSpreadDisplay', () => {
    it('formats positive spread with team1 name', () => {
      expect(formatSpreadDisplay(3.5, 'Chiefs', 'Bills')).toBe('Chiefs 3.5');
      expect(formatSpreadDisplay(7, 'Chiefs', 'Bills')).toBe('Chiefs 7');
    });

    it('formats negative spread with team2 name', () => {
      expect(formatSpreadDisplay(-3.5, 'Chiefs', 'Bills')).toBe('Bills 3.5');
      expect(formatSpreadDisplay(-7, 'Chiefs', 'Bills')).toBe('Bills 7');
    });

    it('formats pick em as PK', () => {
      expect(formatSpreadDisplay(0, 'Chiefs', 'Bills')).toBe('PK');
      expect(formatSpreadDisplay(0.1, 'Chiefs', 'Bills')).toBe('PK');
      expect(formatSpreadDisplay(-0.1, 'Chiefs', 'Bills')).toBe('PK');
      expect(formatSpreadDisplay(0.4, 'Chiefs', 'Bills')).toBe('PK');
    });

    it('uses absolute value for spread display', () => {
      expect(formatSpreadDisplay(-5.5, 'Chiefs', 'Bills')).toBe('Bills 5.5');
      expect(formatSpreadDisplay(5.5, 'Chiefs', 'Bills')).toBe('Chiefs 5.5');
    });
  });

  describe('formatTotalDisplay', () => {
    it('formats whole number totals', () => {
      expect(formatTotalDisplay(45)).toBe('45');
      expect(formatTotalDisplay(50)).toBe('50');
    });

    it('formats decimal totals', () => {
      expect(formatTotalDisplay(45.5)).toBe('45.5');
      expect(formatTotalDisplay(48.5)).toBe('48.5');
    });

    it('handles edge cases', () => {
      expect(formatTotalDisplay(0)).toBe('0');
      expect(formatTotalDisplay(100.5)).toBe('100.5');
    });
  });
});
