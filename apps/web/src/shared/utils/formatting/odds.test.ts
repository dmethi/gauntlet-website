import { describe, it, expect } from 'vitest';
import { formatOdds, formatMoneyline } from './odds';

describe('formatOdds', () => {
  it('formats positive odds with + sign', () => {
    expect(formatOdds(150)).toBe('+150');
  });

  it('formats negative odds without extra sign', () => {
    expect(formatOdds(-200)).toBe('-200');
  });

  it('handles zero', () => {
    expect(formatOdds(0)).toBe('0');
  });

  it('handles small positive values', () => {
    expect(formatOdds(1)).toBe('+1');
  });

  it('handles large values', () => {
    expect(formatOdds(10000)).toBe('+10000');
    expect(formatOdds(-10000)).toBe('-10000');
  });
});

describe('formatMoneyline', () => {
  it('rounds and formats positive values', () => {
    expect(formatMoneyline(149.6)).toBe('+150');
  });

  it('rounds and formats negative values', () => {
    expect(formatMoneyline(-199.4)).toBe('-199');
  });

  it('handles exact integers', () => {
    expect(formatMoneyline(100)).toBe('+100');
  });

  it('handles zero', () => {
    expect(formatMoneyline(0)).toBe('0');
  });

  it('rounds down when appropriate', () => {
    expect(formatMoneyline(149.4)).toBe('+149');
  });
});
