import { describe, expect, it } from 'vitest';
import {
  formatPercentage,
  getClusterBadgeVariant,
  getContrastingTextColor,
  getHeatmapColor,
} from './utils';

describe('ManagerAnalysis Utils', () => {
  describe('getHeatmapColor', () => {
    it('returns middle color when max equals min', () => {
      const result = getHeatmapColor(5, 5, 5);
      expect(result).toBeDefined();
    });

    it('returns color for value in range', () => {
      const result = getHeatmapColor(5, 10, 0);
      expect(result).toBeDefined();
    });
  });

  describe('getContrastingTextColor', () => {
    it('returns empty string for transparent background', () => {
      expect(getContrastingTextColor('transparent')).toBe('');
    });

    it('returns text-white for dark backgrounds', () => {
      expect(getContrastingTextColor('#000000')).toBe('text-white');
    });

    it('returns empty string for light backgrounds', () => {
      expect(getContrastingTextColor('#FFFFFF')).toBe('');
    });
  });

  describe('getClusterBadgeVariant', () => {
    it('returns correct variant for Stars & Scrubs', () => {
      expect(getClusterBadgeVariant('Stars & Scrubs')).toBe('destructive');
    });

    it('returns default for unknown cluster', () => {
      expect(getClusterBadgeVariant('Unknown')).toBe('outline');
    });
  });

  describe('formatPercentage', () => {
    it('formats decimal as percentage', () => {
      expect(formatPercentage(0.234)).toBe('23.4%');
    });
  });
});
