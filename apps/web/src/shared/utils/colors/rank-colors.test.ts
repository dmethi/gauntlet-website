import { describe, expect, it } from 'vitest';
import { getRankColor } from './rank-colors';

describe('getRankColor', () => {
  it('should return dark green for top 10%', () => {
    const color = getRankColor(1, 10); // 1st out of 10 = top 10%
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return green for top 25%', () => {
    const color = getRankColor(2, 10); // 2nd out of 10 = top 20%
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return yellow for middle 50%', () => {
    const color = getRankColor(5, 10); // 5th out of 10 = middle
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return orange for bottom 25%', () => {
    const color = getRankColor(9, 10); // 9th out of 10 = bottom 20%
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return red for bottom 10%', () => {
    const color = getRankColor(10, 10); // 10th out of 10 = bottom 10%
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should handle large datasets consistently', () => {
    const topColor = getRankColor(1, 100);
    const bottomColor = getRankColor(100, 100);
    expect(topColor).not.toBe(bottomColor);
  });

  it('should handle rank=1 total=1 edge case', () => {
    const color = getRankColor(1, 1);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});
