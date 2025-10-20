import { describe, expect, it } from 'vitest';
import { mean, median, percentile, standardDeviation } from './medians';

describe('Statistical Functions', () => {
  describe('median', () => {
    it('calculates median for odd-length array', () => {
      expect(median([1, 2, 3, 4, 5])).toBe(3);
    });

    it('calculates median for even-length array', () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
    });

    it('handles single value', () => {
      expect(median([42])).toBe(42);
    });

    it('handles unsorted array', () => {
      expect(median([5, 1, 3, 2, 4])).toBe(3);
    });

    it('returns 0 for empty array', () => {
      expect(median([])).toBe(0);
    });

    it('handles negative numbers', () => {
      expect(median([-5, -1, 0, 1, 5])).toBe(0);
    });

    it('handles decimal values', () => {
      expect(median([1.5, 2.5, 3.5])).toBe(2.5);
    });

    it('handles two values', () => {
      expect(median([10, 20])).toBe(15);
    });

    it('maintains precision with large numbers', () => {
      expect(median([1000, 2000, 3000])).toBe(2000);
    });

    it('handles duplicate values', () => {
      expect(median([1, 2, 2, 3])).toBe(2);
    });
  });

  describe('mean', () => {
    it('calculates average correctly', () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3);
    });

    it('handles single value', () => {
      expect(mean([42])).toBe(42);
    });

    it('returns 0 for empty array', () => {
      expect(mean([])).toBe(0);
    });

    it('handles negative numbers', () => {
      expect(mean([-10, -5, 0, 5, 10])).toBe(0);
    });

    it('handles decimal values', () => {
      expect(mean([1.5, 2.5, 3.5])).toBe(2.5);
    });

    it('calculates fractional averages', () => {
      expect(mean([1, 2, 3])).toBeCloseTo(2);
    });

    it('handles large numbers', () => {
      expect(mean([1000, 2000, 3000])).toBe(2000);
    });

    it('handles very small numbers', () => {
      const result = mean([0.001, 0.002, 0.003]);
      expect(result).toBeCloseTo(0.002, 5);
    });

    it('handles all same values', () => {
      expect(mean([5, 5, 5, 5])).toBe(5);
    });

    it('handles two values', () => {
      expect(mean([10, 20])).toBe(15);
    });
  });

  describe('standardDeviation', () => {
    it('calculates standard deviation correctly', () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const result = standardDeviation(values);
      expect(result).toBeCloseTo(2, 0);
    });

    it('returns 0 for empty array', () => {
      expect(standardDeviation([])).toBe(0);
    });

    it('returns 0 for single value', () => {
      expect(standardDeviation([5])).toBe(0);
    });

    it('returns 0 for identical values', () => {
      expect(standardDeviation([5, 5, 5, 5])).toBe(0);
    });

    it('handles negative numbers', () => {
      const values = [-2, -1, 0, 1, 2];
      const result = standardDeviation(values);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(1.41, 1); // sqrt(2) ≈ 1.414
    });

    it('calculates for simple dataset', () => {
      const values = [1, 2, 3, 4, 5];
      const result = standardDeviation(values);
      expect(result).toBeCloseTo(1.41, 1);
    });

    it('handles decimal values', () => {
      const values = [1.5, 2.5, 3.5, 4.5];
      const result = standardDeviation(values);
      expect(result).toBeGreaterThan(0);
    });

    it('handles two values', () => {
      const result = standardDeviation([10, 20]);
      expect(result).toBe(5);
    });
  });

  describe('percentile', () => {
    it('calculates 50th percentile (median)', () => {
      const values = [1, 2, 3, 4, 5];
      expect(percentile(values, 50)).toBe(3);
    });

    it('calculates 25th percentile', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = percentile(values, 25);
      expect(result).toBeGreaterThanOrEqual(2);
      expect(result).toBeLessThanOrEqual(3);
    });

    it('calculates 75th percentile', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = percentile(values, 75);
      expect(result).toBeGreaterThanOrEqual(6);
      expect(result).toBeLessThanOrEqual(7);
    });

    it('calculates 0th percentile (minimum)', () => {
      const values = [1, 2, 3, 4, 5];
      expect(percentile(values, 0)).toBe(1);
    });

    it('calculates 100th percentile (maximum)', () => {
      const values = [1, 2, 3, 4, 5];
      expect(percentile(values, 100)).toBe(5);
    });

    it('handles unsorted array', () => {
      const values = [5, 1, 3, 2, 4];
      expect(percentile(values, 50)).toBe(3);
    });

    it('returns 0 for empty array', () => {
      expect(percentile([], 50)).toBe(0);
    });

    it('handles single value', () => {
      expect(percentile([42], 50)).toBe(42);
    });

    it('throws error for invalid percentile (negative)', () => {
      expect(() => percentile([1, 2, 3], -1)).toThrow('Percentile must be between 0 and 100');
    });

    it('throws error for invalid percentile (>100)', () => {
      expect(() => percentile([1, 2, 3], 101)).toThrow('Percentile must be between 0 and 100');
    });

    it('handles decimal percentiles', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = percentile(values, 33.3);
      expect(result).toBeGreaterThan(3);
      expect(result).toBeLessThan(5);
    });

    it('interpolates between values', () => {
      const values = [1, 2, 3, 4, 5];
      const result = percentile(values, 40);
      expect(result).toBeGreaterThan(2);
      expect(result).toBeLessThan(4);
    });

    it('handles negative numbers', () => {
      const values = [-5, -3, -1, 1, 3, 5];
      const result = percentile(values, 50);
      expect(result).toBe(0);
    });

    it('handles two values', () => {
      const values = [10, 20];
      expect(percentile(values, 50)).toBe(15);
    });

    it('handles large dataset', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1);
      expect(percentile(values, 90)).toBeGreaterThan(85);
    });
  });
});
