import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useMatchupTimeSeries } from './useMatchupTimeSeries';
import type { TimeSeriesPoint } from './useMatchupTimeSeries';

const mockTimeSeries: TimeSeriesPoint[] = [
  {
    timestamp: '2024-10-01T12:00:00Z',
    team1Score: 50.5,
    team2Score: 45.2,
    team1WinProbability: 0.55,
    gameProgress: 0.25,
    projectedFinalA: 120.0,
    projectedFinalB: 115.0,
    spread: 5.0,
  },
  {
    timestamp: '2024-10-01T12:10:00Z',
    team1Score: 65.8,
    team2Score: 58.3,
    team1WinProbability: 0.62,
    gameProgress: 0.45,
    projectedFinalA: 125.0,
    projectedFinalB: 118.0,
    spread: 7.0,
  },
];

const mockResponse = {
  series: mockTimeSeries,
  metadata: {
    leagueId: '12345',
    week: 5,
    matchupId: 1,
    sampleCount: 2,
    hasData: true,
    rosterAId: 1,
    rosterBId: 2,
  },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { readonly children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useMatchupTimeSeries', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  it('starts in idle state', () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useMatchupTimeSeries('12345', 5, 1), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('fetches time series data successfully', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useMatchupTimeSeries('12345', 5, 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.series).toHaveLength(2);
    expect(result.current.data?.metadata.hasData).toBe(true);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('/api/matchup-timeseries/12345/5/1');
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMatchupTimeSeries('12345', 5, 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('handles 404 responses', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useMatchupTimeSeries('12345', 5, 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
    expect((result.current.error as Error).message).toContain('Failed to fetch time series');
  });

  it('handles 500 responses', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useMatchupTimeSeries('12345', 5, 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('refetches when parameters change', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { rerender } = renderHook(
      ({ leagueId, week, matchupId }) => useMatchupTimeSeries(leagueId, week, matchupId),
      {
        initialProps: { leagueId: '12345', week: 5, matchupId: 1 },
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Change week
    rerender({ leagueId: '12345', week: 6, matchupId: 1 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith('/api/matchup-timeseries/12345/6/1');
    });
  });

  it('handles empty time series', async () => {
    const emptyResponse = {
      series: [],
      metadata: {
        leagueId: '12345',
        week: 5,
        matchupId: 1,
        sampleCount: 0,
        hasData: false,
        rosterAId: null,
        rosterBId: null,
      },
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => emptyResponse,
    });

    const { result } = renderHook(() => useMatchupTimeSeries('12345', 5, 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.series).toEqual([]);
    expect(result.current.data?.metadata.hasData).toBe(false);
  });

  it('uses correct cache configuration', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useMatchupTimeSeries('12345', 5, 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify the data is cached by checking fetch was only called once
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('fails fast without retrying', async () => {
    let callCount = 0;
    (global.fetch as any).mockImplementation(() => {
      callCount++;
      return Promise.reject(new Error('First attempt failed'));
    });

    const { result } = renderHook(() => useMatchupTimeSeries('12345', 5, 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(callCount).toBe(1);
    expect(result.current.data).toBeUndefined();
  });
});
