import { describe, expect, it } from 'vitest';
import { formatDecimal, formatPercentage } from './percentages';

describe('formatPercentage', () => {
  it('formats decimal to percentage with default 0 decimals', () => {
    expect(formatPercentage(0.5)).toBe('50%');
  });

  it('formats with custom decimals', () => {
    expect(formatPercentage(0.456, 1)).toBe('45.6%');
    expect(formatPercentage(0.456, 2)).toBe('45.60%');
  });

  it('handles 100%', () => {
    expect(formatPercentage(1.0)).toBe('100%');
  });

  it('handles 0%', () => {
    expect(formatPercentage(0)).toBe('0%');
  });

  it('handles values over 100%', () => {
    expect(formatPercentage(1.5)).toBe('150%');
  });

  it('handles small percentages', () => {
    expect(formatPercentage(0.05, 1)).toBe('5.0%');
  });
});

describe('formatDecimal', () => {
  it('formats with default 2 decimals', () => {
    expect(formatDecimal(3.14159)).toBe('3.14');
  });

  it('formats with custom decimals', () => {
    expect(formatDecimal(3.14159, 3)).toBe('3.142');
  });

  it('handles zero', () => {
    expect(formatDecimal(0)).toBe('0.00');
  });

  it('handles negative numbers', () => {
    expect(formatDecimal(-5.67)).toBe('-5.67');
  });

  it('pads with zeros when needed', () => {
    expect(formatDecimal(5, 2)).toBe('5.00');
  });
});
