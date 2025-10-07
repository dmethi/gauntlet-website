import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSuperlatives } from './useSuperlatives';
import type { ReactNode } from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSuperlatives', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch superlatives', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            data: [{ category: 'highest_score', value: 150 }],
            meta: {},
          }),
      }),
    ) as any;

    const { result } = renderHook(() => useSuperlatives('123', '2025'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.ok).toBe(true);
    expect(result.current.data?.data).toHaveLength(1);
  });

  it('should include query parameters', async () => {
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

    renderHook(
      () =>
        useSuperlatives('123', '2025', {
          category: 'highest_score',
          limit: 10,
          offset: 5,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=highest_score'),
      );
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('limit=10'));
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('offset=5'));
    });
  });

  it('should not fetch when disabled', () => {
    global.fetch = vi.fn();

    renderHook(() => useSuperlatives('123', '2025', { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not fetch when leagueId is missing', () => {
    global.fetch = vi.fn();

    renderHook(() => useSuperlatives('', '2025'), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not fetch when season is missing', () => {
    global.fetch = vi.fn();

    renderHook(() => useSuperlatives('123', ''), {
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

    const { result } = renderHook(() => useSuperlatives('123', '2025'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should handle empty query parameters', async () => {
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

    renderHook(() => useSuperlatives('123', '2025', {}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/superlatives'),
      );
      // Should not have query string
      expect(global.fetch).toHaveBeenCalledWith(expect.not.stringContaining('?'));
    });
  });
});

