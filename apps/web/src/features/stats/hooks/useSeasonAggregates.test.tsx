import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSeasonAggregates } from './useSeasonAggregates';
import type { ReactNode } from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSeasonAggregates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch seasonal aggregates', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            data: {
              rosterWeekAggregates: [
                { rosterId: 1, week: 1, won: true, expectedWins: 0.7, luck: 0.3 },
              ],
              leagueWeekSummaries: [
                { week: 1, averagePoints: 100, medianPoints: 95 },
              ],
            },
          }),
      }),
    ) as any;

    const { result } = renderHook(() => useSeasonAggregates('123', '2025'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.ok).toBe(true);
    expect(result.current.data?.data.rosterWeekAggregates).toHaveLength(1);
  });

  it('should not fetch when disabled', () => {
    global.fetch = vi.fn();

    renderHook(() => useSeasonAggregates('123', '2025', { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not fetch when leagueId is missing', () => {
    global.fetch = vi.fn();

    renderHook(() => useSeasonAggregates(undefined, '2025'), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not fetch when season is missing', () => {
    global.fetch = vi.fn();

    renderHook(() => useSeasonAggregates('123', undefined), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      }),
    ) as any;

    const { result } = renderHook(() => useSeasonAggregates('123', '2025'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });
});

