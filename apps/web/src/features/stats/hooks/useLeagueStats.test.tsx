import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeagueStats } from './useLeagueStats';
import type { ReactNode } from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLeagueStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and compute team stats', async () => {
    global.fetch = vi.fn(url => {
      if (url === '/api/league/overview') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: '123',
              season: '2025',
              playoff_week_start: 15,
              rosters: [
                {
                  id: '1',
                  owner: {
                    displayName: 'Team 1',
                    username: 'team1',
                    metadata: { team_name: 'Team One' },
                  },
                  matchups: [{ week: 1, points: 100, projected: 95, result: 'W' }],
                },
              ],
            }),
        });
      } else if (url.includes('/api/rollups/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                rosterWeekAggregates: [
                  { rosterId: 1, week: 1, won: true, expectedWins: 0.7, luck: 0.3 },
                ],
                leagueWeekSummaries: [],
              },
            }),
        });
      }
      return Promise.reject(new Error('Not found'));
    }) as any;

    const { result } = renderHook(() => useLeagueStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teamStats).toHaveLength(1);
    expect(result.current.teamStats[0].name).toBe('Team One');
    expect(result.current.teamStats[0].wins).toBe(1);
  });

  it('should return empty stats when loading', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any;

    const { result } = renderHook(() => useLeagueStats(), {
      wrapper: createWrapper(),
    });

    expect(result.current.teamStats).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should calculate win percentage correctly', async () => {
    global.fetch = vi.fn(url => {
      if (url === '/api/league/overview') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: '123',
              season: '2025',
              playoff_week_start: 15,
              rosters: [
                {
                  id: '1',
                  owner: {
                    displayName: 'Team 1',
                    username: 'team1',
                    metadata: { team_name: 'Team 1' },
                  },
                  matchups: [
                    { week: 1, points: 100, projected: 95, result: 'W' },
                    { week: 2, points: 90, projected: 95, result: 'L' },
                  ],
                },
              ],
            }),
        });
      } else if (url.includes('/api/rollups/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                rosterWeekAggregates: [
                  { rosterId: 1, week: 1, won: true, expectedWins: 0.7, luck: 0.3 },
                  { rosterId: 1, week: 2, won: false, expectedWins: 0.6, luck: -0.6 },
                ],
                leagueWeekSummaries: [],
              },
            }),
        });
      }
      return Promise.reject(new Error('Not found'));
    }) as any;

    const { result } = renderHook(() => useLeagueStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teamStats[0].wins).toBe(1);
    expect(result.current.teamStats[0].losses).toBe(1);
    expect(result.current.teamStats[0].winPercentage).toBe(0.5);
  });

  it('should compute weekly averages', async () => {
    global.fetch = vi.fn(url => {
      if (url === '/api/league/overview') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: '123',
              season: '2025',
              playoff_week_start: 15,
              rosters: [
                {
                  id: '1',
                  owner: {
                    displayName: 'Team 1',
                    username: 'team1',
                    metadata: { team_name: 'Team 1' },
                  },
                  matchups: [
                    { week: 1, points: 100, projected: 95, result: 'W' },
                    { week: 1, points: 90, projected: 95, result: 'L' },
                  ],
                },
              ],
            }),
        });
      } else if (url.includes('/api/rollups/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                rosterWeekAggregates: [],
                leagueWeekSummaries: [],
              },
            }),
        });
      }
      return Promise.reject(new Error('Not found'));
    }) as any;

    const { result } = renderHook(() => useLeagueStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.weeklyAverages).toHaveLength(1);
    expect(result.current.weeklyAverages[0].week).toBe(1);
    expect(result.current.weeklyAverages[0].averagePoints).toBe(95);
  });

  it('should handle missing owner metadata', async () => {
    global.fetch = vi.fn(url => {
      if (url === '/api/league/overview') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: '123',
              season: '2025',
              playoff_week_start: 15,
              rosters: [
                {
                  id: '5',
                  owner: { displayName: 'User5', username: 'user5', metadata: {} },
                  matchups: [],
                },
              ],
            }),
        });
      } else if (url.includes('/api/rollups/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                rosterWeekAggregates: [],
                leagueWeekSummaries: [],
              },
            }),
        });
      }
      return Promise.reject(new Error('Not found'));
    }) as any;

    const { result } = renderHook(() => useLeagueStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teamStats[0].name).toBe('User5');
  });
});
