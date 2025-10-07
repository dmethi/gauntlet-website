import { describe, it, expect } from 'vitest';
import { formatNumber, formatDelta, formatCompact } from './numbers';

describe('formatNumber', () => {
  it('formats with default 1 decimal', () => {
    expect(formatNumber(123.456)).toBe('123.5');
  });

  it('formats with custom decimals', () => {
    expect(formatNumber(123.456, 2)).toBe('123.46');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0.0');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-45.67)).toBe('-45.7');
  });
});

describe('formatDelta', () => {
  it('adds + sign for positive', () => {
    expect(formatDelta(10.5)).toBe('+10.5');
  });

  it('keeps - sign for negative', () => {
    expect(formatDelta(-5.2)).toBe('-5.2');
  });

  it('handles zero', () => {
    expect(formatDelta(0)).toBe('0.0');
  });

  it('formats with custom decimals', () => {
    expect(formatDelta(12.345, 2)).toBe('+12.35');
  });

  it('handles small positive values', () => {
    expect(formatDelta(0.1)).toBe('+0.1');
  });
});

describe('formatCompact', () => {
  it('formats billions', () => {
    expect(formatCompact(1_500_000_000)).toBe('1.5B');
  });

  it('formats millions', () => {
    expect(formatCompact(2_300_000)).toBe('2.3M');
  });

  it('formats thousands', () => {
    expect(formatCompact(45_600)).toBe('45.6K');
  });

  it('formats small numbers', () => {
    expect(formatCompact(123)).toBe('123');
  });

  it('handles exact billion', () => {
    expect(formatCompact(1_000_000_000)).toBe('1.0B');
  });

  it('handles exact million', () => {
    expect(formatCompact(1_000_000)).toBe('1.0M');
  });

  it('handles exact thousand', () => {
    expect(formatCompact(1_000)).toBe('1.0K');
  });

  it('handles zero', () => {
    expect(formatCompact(0)).toBe('0');
  });
});
