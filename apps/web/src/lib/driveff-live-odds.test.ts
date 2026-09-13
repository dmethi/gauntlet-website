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

  it('surfaces driveFF HTTP failures', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getDriveFFLiveOdds('league/id', 1, 2)).rejects.toThrow(/returned 503/);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://driveff.com/api/v1/live-odds/league%2Fid/1/2',
      expect.any(Object),
    );
  });

  it.each([
    null,
    { schemaVersion: 1, provider: 'other', samples: [] },
    {
      schemaVersion: 1,
      provider: 'sleeper',
      samples: [{ timestamp: 'now', rosterAId: '1', rosterBId: '2', winProbA: 'bad' }],
    },
  ])('rejects malformed feed variant %#', async payload => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(payload))),
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

  it('never projects a lower-tail outcome below points already scored', () => {
    const players = [{ standardDeviation: 10 }] as DriveFFPlayerDistribution[];

    expect(getTeamScoreDistribution(105, players, 101).p10).toBe(101);
  });

  it('converts probabilities to American moneylines', () => {
    expect(toAmericanMoneyline(0.6)).toBe(-150);
    expect(toAmericanMoneyline(0.4)).toBe(150);
    expect(toAmericanMoneyline(0.5)).toBe(100);
    expect(toAmericanMoneyline(0)).toBe(999_900);
    expect(toAmericanMoneyline(1)).toBe(-999_900);
  });
});
