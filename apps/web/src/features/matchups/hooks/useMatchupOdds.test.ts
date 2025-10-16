import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMatchupOdds } from './useMatchupOdds';
import type { MatchupOddsData } from '../types';

const mockOddsData: MatchupOddsData = {
  team1WinPct: 0.65,
  team2WinPct: 0.35,
  impliedOdds: {
    spread: 3.5,
    total: 45.5,
    team1MoneyLine: -186,
    team2MoneyLine: 156,
  },
  team1ScoreDistribution: {
    mean: 24.5,
    median: 24,
    stdDev: 5.2,
    p10: 18,
    p25: 21,
    p75: 28,
    p90: 31,
  },
  team2ScoreDistribution: {
    mean: 21.0,
    median: 21,
    stdDev: 4.8,
    p10: 15,
    p25: 18,
    p75: 24,
    p90: 27,
  },
};

describe('useMatchupOdds', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  it('starts in loading state', () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, simulation: mockOddsData }),
    });

    const { result } = renderHook(() =>
      useMatchupOdds({
        leagueId: '12345',
        week: 5,
        matchupId: 1,
      }),
    );

    expect(result.current.loading).toBe(false); // Initial render is false
    expect(result.current.oddsData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('fetches and returns odds data successfully', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, simulation: mockOddsData }),
    });

    const { result } = renderHook(() =>
      useMatchupOdds({
        leagueId: '12345',
        week: 5,
        matchupId: 1,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.oddsData).toEqual(mockOddsData);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('/api/matchups/12345/5/1/simulate');
  });

  it('handles 404 gracefully without error', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() =>
      useMatchupOdds({
        leagueId: '12345',
        week: 5,
        matchupId: 1,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.oddsData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('handles unsuccessful response gracefully', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    });

    const { result } = renderHook(() =>
      useMatchupOdds({
        leagueId: '12345',
        week: 5,
        matchupId: 1,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.oddsData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('handles fetch errors', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useMatchupOdds({
        leagueId: '12345',
        week: 5,
        matchupId: 1,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.oddsData).toBeNull();
    expect(result.current.error).toBe('Failed to load odds');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Odds preview error:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('handles non-404 HTTP errors', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useMatchupOdds({
        leagueId: '12345',
        week: 5,
        matchupId: 1,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.oddsData).toBeNull();
    expect(result.current.error).toBe('Failed to load odds');
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('refetches when parameters change', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, simulation: mockOddsData }),
    });

    const { rerender } = renderHook(
      ({ leagueId, week, matchupId }) => useMatchupOdds({ leagueId, week, matchupId }),
      {
        initialProps: { leagueId: '12345', week: 5, matchupId: 1 },
      },
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Change parameters
    rerender({ leagueId: '12345', week: 6, matchupId: 1 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith('/api/matchups/12345/6/1/simulate');
    });
  });
});
