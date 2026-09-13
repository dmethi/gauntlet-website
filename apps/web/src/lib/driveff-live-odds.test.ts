import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type DriveFFPlayerDistribution,
  getDriveFFLiveOdds,
  getTeamScoreDistribution,
  toAmericanMoneyline,
} from './driveff-live-odds';

describe('driveFF live odds adapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('fetches the versioned matchup feed without caching', async () => {
    vi.stubEnv('DRIVEFF_API_BASE_URL', 'https://example.test/');
    const payload = {
      schemaVersion: 1,
      provider: 'sleeper',
      leagueId: '123',
      week: 1,
      matchupId: '2',
      samples: [
        {
          timestamp: '2026-09-13T17:48:07.277Z',
          gameProgress: 0.25,
          winProbA: 0.6,
          winProbB: 0.4,
          projectedFinalA: 120,
          projectedFinalB: 110,
          currentScoreA: 40,
          currentScoreB: 35,
          spread: 10,
          total: 230,
          rosterAId: '1',
          rosterBId: '2',
        },
      ],
      latest: null,
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getDriveFFLiveOdds('123', 1, 2)).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/api/v1/live-odds/123/1/2',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('rejects an incompatible response instead of silently rendering bad odds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ samples: [] }))),
    );
    await expect(getDriveFFLiveOdds('123', 1, 2)).rejects.toThrow(/invalid payload/);
  });

  it('derives team score ranges from player marginal variances', () => {
    const players = [
      { standardDeviation: 3 },
      { standardDeviation: 4 },
    ] as DriveFFPlayerDistribution[];

    expect(getTeamScoreDistribution(100, players)).toEqual({
      mean: 100,
      median: 100,
      p10: 100 - 1.2815515655446004 * 5,
      p90: 100 + 1.2815515655446004 * 5,
    });
  });

  it('converts probabilities to American moneylines', () => {
    expect(toAmericanMoneyline(0.6)).toBe(-150);
    expect(toAmericanMoneyline(0.4)).toBe(150);
  });
});
