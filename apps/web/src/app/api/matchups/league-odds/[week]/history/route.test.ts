import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getLeagueOddsHistory = vi.fn();

vi.mock('@gauntlet/server', () => ({ getLeagueOddsHistory }));

describe('league odds history API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLeagueOddsHistory.mockResolvedValue([
      {
        id: 'snapshot-1',
        season: 2026,
        week: 1,
        createdAt: new Date('2026-09-10T17:00:00.000Z'),
        highestScorerOdds: [],
      },
    ]);
  });

  it('returns season-scoped race snapshots in chronological order', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new NextRequest('https://gauntlet.test/api/matchups/league-odds/1/history?season=2026'),
      { params: Promise.resolve({ week: '1' }) },
    );

    expect(response.status).toBe(200);
    expect(getLeagueOddsHistory).toHaveBeenCalledWith(2026, 1);
    await expect(response.json()).resolves.toEqual({
      season: 2026,
      week: 1,
      snapshots: [
        expect.objectContaining({
          id: 'snapshot-1',
          capturedAt: '2026-09-10T17:00:00.000Z',
        }),
      ],
    });
  });
});
