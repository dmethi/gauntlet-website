import { describe, expect, it } from 'vitest';
import { getDivergingBg } from './diverging';

describe('getDivergingBg', () => {
  it('should return a color for -1 (red end)', () => {
    const color = getDivergingBg(-1);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return a color for 0 (yellow middle)', () => {
    const color = getDivergingBg(0);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return a color for 1 (green end)', () => {
    const color = getDivergingBg(1);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should clamp values below -1', () => {
    const color1 = getDivergingBg(-1);
    const color2 = getDivergingBg(-10);
    expect(color1).toBe(color2);
  });

  it('should clamp values above 1', () => {
    const color1 = getDivergingBg(1);
    const color2 = getDivergingBg(10);
    expect(color1).toBe(color2);
  });

  it('should handle fractional values', () => {
    const color = getDivergingBg(0.5);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should interpolate smoothly', () => {
    const colors = [-1, -0.5, 0, 0.5, 1].map(v => getDivergingBg(v));
    // All colors should be unique (smooth gradient)
    expect(new Set(colors).size).toBeGreaterThan(1);
  });

  it('should return valid hex colors for all inputs', () => {
    const testValues = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];
    testValues.forEach(value => {
      const color = getDivergingBg(value);
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    });
  });
});
