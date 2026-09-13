import { describe, expect, it } from 'vitest';
import { resolveCompletedWeeks } from './season-weeks';

const league = {
  season: '2026',
  status: 'in_season',
  settings: { playoff_week_start: 15 },
};

describe('resolveCompletedWeeks', () => {
  it('returns zero completed weeks before the Week 1 games are final', () => {
    expect(
      resolveCompletedWeeks(
        league as never,
        {
          season: '2026',
          league_season: '2026',
          week: 1,
        } as never,
      ),
    ).toBe(0);
  });

  it('can still include the current week for live score displays', () => {
    expect(
      resolveCompletedWeeks(
        league as never,
        { season: '2026', league_season: '2026', week: 1 } as never,
        { includeCurrentWeek: true },
      ),
    ).toBe(1);
  });
});
