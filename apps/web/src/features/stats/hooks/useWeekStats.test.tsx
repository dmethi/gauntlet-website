import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWeekStats } from './useWeekStats';
import type { ReactNode } from 'react';

// Mock getCurrentWeek
vi.mock('@gauntlet/lib', () => ({
  getCurrentWeek: () => 5,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useWeekStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch week stats', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            data: [{ rosterId: 1, points: 100 }],
            meta: {},
          }),
      }),
    ) as any;

    const { result } = renderHook(() => useWeekStats('123', '2025', { week: 3 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.ok).toBe(true);
    expect(result.current.data?.data).toHaveLength(1);
  });

  it('should use current week when week not provided', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            data: [],
            meta: {},
          }),
      }),
    ) as any;

    renderHook(() => useWeekStats('123', '2025'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/weeks/5'));
    });
  });

  it('should not fetch when disabled', () => {
    global.fetch = vi.fn();

    renderHook(() => useWeekStats('123', '2025', { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not fetch when leagueId is missing', () => {
    global.fetch = vi.fn();

    renderHook(() => useWeekStats('', '2025'), {
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

    const { result } = renderHook(() => useWeekStats('123', '2025', { week: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });
});

