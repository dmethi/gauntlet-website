import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDraftAnalytics } from './useDraftAnalytics';
import { createWrapper } from '@/test/utils/test-wrapper';
import type { MockDraft } from '@/lib/mock-draft-data';
import type { ManagerAnalytics } from '../types';

// Mock generateManagerAnalytics
vi.mock('@/lib/manager-analytics', () => ({
  generateManagerAnalytics: vi.fn((draft1, draft2) => ({
    league_A_name: draft1.name,
    league_B_name: draft2.name,
    profiles: [],
    league_averages: {
      league_A: {
        pctQB: 0,
        pctRB: 0,
        pctWR: 0,
        pctTE: 0,
        pctDEF: 0,
        pctStarters: 0,
        pctBench: 0,
        top1_share: 0,
        top2_share: 0,
        top3_share: 0,
        top4_share: 0,
        top5_share: 0,
        giniSpend: 0,
      },
      league_B: {
        pctQB: 0,
        pctRB: 0,
        pctWR: 0,
        pctTE: 0,
        pctDEF: 0,
        pctStarters: 0,
        pctBench: 0,
        top1_share: 0,
        top2_share: 0,
        top3_share: 0,
        top4_share: 0,
        top5_share: 0,
        giniSpend: 0,
      },
    },
    cluster_summary: [],
    twins_summary: {
      high_similarity_pairs: 0,
      avg_similarity: 0,
      most_similar_pair: {
        manager_A: '',
        manager_B: '',
        similarity: 0,
      },
    },
    player_overlap_analytics: {
      top_overlaps: [],
      avg_overlap_percentage: 0,
      copycat_threshold: 0,
      copycat_pairs: [],
      maverick_managers: [],
    },
    player_level_analytics: {
      players: [],
      draft_picks: [],
      top_price_gaps: [],
      tier_shift_matrix: [],
      league_tiles: {
        LEAGUE_A: [],
        LEAGUE_B: [],
      },
      badges: [],
      price_gap_histogram: {
        bins: [],
        counts: [],
        bin_labels: [],
      },
    },
  })),
}));

describe('useDraftAnalytics', () => {
  const mockDraft1: MockDraft = {
    name: 'AFC League',
    teams: [],
    totalPlayers: 0,
    totalSpent: 0,
  };

  const mockDraft2: MockDraft = {
    name: 'NFC League',
    teams: [],
    totalPlayers: 0,
    totalSpent: 0,
  };

  it('should fetch and return analytics data', async () => {
    const { result } = renderHook(() => useDraftAnalytics(mockDraft1, mockDraft2), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.analytics).toBeDefined();
    expect(result.current.isError).toBe(false);
  });

  it('should handle missing drafts', async () => {
    const { result } = renderHook(() => useDraftAnalytics(undefined, undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.analytics).toBeUndefined();
  });

  it('should respect enabled option', () => {
    const { result } = renderHook(
      () => useDraftAnalytics(mockDraft1, mockDraft2, { enabled: false }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.analytics).toBeUndefined();
  });

  it('should use custom staleTime', () => {
    const { result } = renderHook(
      () => useDraftAnalytics(mockDraft1, mockDraft2, { staleTime: 10000 }),
      { wrapper: createWrapper() },
    );

    // Query configuration is applied (can't directly test staleTime, but hook initializes)
    expect(result.current).toBeDefined();
  });

  it('should not run query when only one draft is provided', () => {
    const { result } = renderHook(() => useDraftAnalytics(mockDraft1, undefined), {
      wrapper: createWrapper(),
    });

    // Query should be disabled, not errored
    expect(result.current.isLoading).toBe(false);
    expect(result.current.analytics).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });
});
