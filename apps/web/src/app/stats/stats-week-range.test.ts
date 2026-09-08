import { describe, expect, it } from 'vitest';
import { resolveStatsWeekRange } from './stats-week-range';

describe('resolveStatsWeekRange', () => {
  it('uses Week 1 as a stable empty-state range before scoring starts', () => {
    expect(
      resolveStatsWeekRange({
        currentWeek: 1,
        configuredRange: { from: 1, to: 1 },
        scoredWeeks: [],
      }),
    ).toEqual({ from: 1, to: 1 });
  });

  it('includes the current week once it has scoring data', () => {
    expect(
      resolveStatsWeekRange({
        currentWeek: 3,
        configuredRange: { from: 1, to: 3 },
        scoredWeeks: [1, 2, 3],
      }),
    ).toEqual({ from: 1, to: 3 });
  });
});
