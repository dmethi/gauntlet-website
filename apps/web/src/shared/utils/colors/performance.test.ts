import { describe, it, expect } from 'vitest';
import { getPerformanceColor } from './performance';

describe('getPerformanceColor', () => {
  it('should return neutral color for zero value', () => {
    const color = getPerformanceColor(0, true);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return green for positive value when isPositive=true', () => {
    const color = getPerformanceColor(10, true);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return red for positive value when isPositive=false', () => {
    const color = getPerformanceColor(10, false);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return red for negative value when isPositive=true', () => {
    const color = getPerformanceColor(-5, true);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return green for negative value when isPositive=false', () => {
    const color = getPerformanceColor(-5, false);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should handle large positive values', () => {
    const color = getPerformanceColor(1000, true);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should handle large negative values', () => {
    const color = getPerformanceColor(-1000, true);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});
