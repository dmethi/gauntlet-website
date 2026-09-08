import { describe, expect, it } from 'vitest';
import { buildScoringCurve, type PreviewWindow } from './weekly-preview';

const schedule: PreviewWindow[] = [
  { id: 'early', label: 'Sun 1:00 PM', startsAt: '2026-09-13T17:00:00Z', games: [] },
  { id: 'late', label: 'Sun 4:25 PM', startsAt: '2026-09-13T20:25:00Z', games: [] },
];

describe('buildScoringCurve', () => {
  it('builds a cumulative timeline that finishes at the Sleeper projection anchor', () => {
    expect(
      buildScoringCurve({
        schedule,
        players: [
          { projection: 12, windowId: 'early' },
          { projection: 8, windowId: 'late' },
          { projection: 3, windowId: null },
        ],
      }),
    ).toEqual([
      { windowId: 'kickoff', label: 'Kickoff', projectedPoints: 0 },
      { windowId: 'early', label: 'Sun 1:00 PM', projectedPoints: 12 },
      { windowId: 'late', label: 'Sun 4:25 PM', projectedPoints: 20 },
      { windowId: 'tbd', label: 'TBD', projectedPoints: 23 },
    ]);
  });
});
