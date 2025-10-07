import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useManagerSorting } from './useManagerSorting';
import type { ManagerProfile } from '../types';

describe('useManagerSorting', () => {
  const mockProfiles: ManagerProfile[] = [
    {
      manager: 'Manager A',
      league: 'AFC',
      team_total: 200,
      spend_shares: {
        pctQB: 0.15,
        pctRB: 0.3,
        pctWR: 0.35,
        pctTE: 0.1,
        pctDEF: 0.05,
        pctStarters: 0.7,
        pctBench: 0.3,
      },
      concentration: {
        top1_share: 0.3,
        top2_share: 0.5,
        top3_share: 0.6,
        top4_share: 0.7,
        top5_share: 0.8,
        giniSpend: 0.5,
      },
      pacing: {
        patienceQ1: 0.2,
        patienceQ2: 0.3,
        patienceQ3: 0.25,
        patienceQ4: 0.25,
        patience_score: 0.5,
        time_to_first_30: 10,
        last_starter_index: 50,
        avg_starter_nom_index: 40,
        avg_bench_nom_index: 80,
      },
      feature_vector: [0.5, 0.3, 0.2],
      cluster: {
        cluster_label: 'balanced',
        cluster_id: 1,
        description: 'Balanced spenders',
      },
      twins: [],
      outlier_flags: {
        extreme_top1: false,
        ultra_patient: false,
        speed_drafter: false,
        bench_heavy: false,
        position_hero: null,
      },
    },
    {
      manager: 'Manager B',
      league: 'NFC',
      team_total: 200,
      spend_shares: {
        pctQB: 0.1,
        pctRB: 0.4,
        pctWR: 0.3,
        pctTE: 0.1,
        pctDEF: 0.05,
        pctStarters: 0.8,
        pctBench: 0.2,
      },
      concentration: {
        top1_share: 0.4,
        top2_share: 0.6,
        top3_share: 0.7,
        top4_share: 0.8,
        top5_share: 0.9,
        giniSpend: 0.7,
      },
      pacing: {
        patienceQ1: 0.4,
        patienceQ2: 0.3,
        patienceQ3: 0.2,
        patienceQ4: 0.1,
        patience_score: 0.3,
        time_to_first_30: 5,
        last_starter_index: 40,
        avg_starter_nom_index: 30,
        avg_bench_nom_index: 90,
      },
      feature_vector: [0.7, 0.4, 0.3],
      cluster: {
        cluster_label: 'concentrated',
        cluster_id: 2,
        description: 'Concentrated spenders',
      },
      twins: [],
      outlier_flags: {
        extreme_top1: true,
        ultra_patient: false,
        speed_drafter: true,
        bench_heavy: false,
        position_hero: null,
      },
    },
    {
      manager: 'Manager C',
      league: 'AFC',
      team_total: 200,
      spend_shares: {
        pctQB: 0.12,
        pctRB: 0.35,
        pctWR: 0.33,
        pctTE: 0.1,
        pctDEF: 0.05,
        pctStarters: 0.75,
        pctBench: 0.25,
      },
      concentration: {
        top1_share: 0.25,
        top2_share: 0.45,
        top3_share: 0.55,
        top4_share: 0.65,
        top5_share: 0.75,
        giniSpend: 0.45,
      },
      pacing: {
        patienceQ1: 0.25,
        patienceQ2: 0.35,
        patienceQ3: 0.25,
        patienceQ4: 0.15,
        patience_score: 0.45,
        time_to_first_30: 8,
        last_starter_index: 45,
        avg_starter_nom_index: 35,
        avg_bench_nom_index: 85,
      },
      feature_vector: [0.45, 0.35, 0.25],
      cluster: {
        cluster_label: 'balanced',
        cluster_id: 1,
        description: 'Balanced spenders',
      },
      twins: [],
      outlier_flags: {
        extreme_top1: false,
        ultra_patient: false,
        speed_drafter: false,
        bench_heavy: false,
        position_hero: null,
      },
    },
  ];

  it('should sort profiles by default key (gini) descending', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles));
    expect(result.current.sortedProfiles[0].manager).toBe('Manager B'); // gini: 0.7
    expect(result.current.sortedProfiles[1].manager).toBe('Manager A'); // gini: 0.5
    expect(result.current.sortedProfiles[2].manager).toBe('Manager C'); // gini: 0.45
  });

  it('should handle sort direction toggle', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles));

    // First click: descending (default)
    act(() => {
      result.current.handleSort('gini');
    });

    expect(result.current.sortConfig?.direction).toBe('desc');
    expect(result.current.sortedProfiles[0].manager).toBe('Manager B');

    // Second click: ascending
    act(() => {
      result.current.handleSort('gini');
    });

    expect(result.current.sortConfig?.direction).toBe('asc');
    expect(result.current.sortedProfiles[0].manager).toBe('Manager C'); // lowest gini
  });

  it('should sort by manager name alphabetically', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles));

    act(() => {
      result.current.handleSort('manager');
    });

    // Descending (Z to A)
    expect(result.current.sortedProfiles[0].manager).toBe('Manager C');
    expect(result.current.sortedProfiles[1].manager).toBe('Manager B');
    expect(result.current.sortedProfiles[2].manager).toBe('Manager A');

    act(() => {
      result.current.handleSort('manager');
    });

    // Ascending (A to Z)
    expect(result.current.sortedProfiles[0].manager).toBe('Manager A');
    expect(result.current.sortedProfiles[1].manager).toBe('Manager B');
    expect(result.current.sortedProfiles[2].manager).toBe('Manager C');
  });

  it('should sort by league', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles));

    act(() => {
      result.current.handleSort('league');
    });

    // Descending (NFC before AFC alphabetically)
    expect(result.current.sortedProfiles[0].league).toBe('NFC');

    act(() => {
      result.current.handleSort('league');
    });

    // Ascending (AFC before NFC)
    expect(result.current.sortedProfiles[0].league).toBe('AFC');
  });

  it('should sort by top1_share', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles));

    act(() => {
      result.current.handleSort('top1');
    });

    expect(result.current.sortedProfiles[0].concentration.top1_share).toBe(0.4); // Manager B
    expect(result.current.sortedProfiles[2].concentration.top1_share).toBe(0.25); // Manager C
  });

  it('should sort by top2_share', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles));

    act(() => {
      result.current.handleSort('top2');
    });

    expect(result.current.sortedProfiles[0].concentration.top2_share).toBe(0.6); // Manager B
  });

  it('should sort by top3_share', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles));

    act(() => {
      result.current.handleSort('top3');
    });

    expect(result.current.sortedProfiles[0].concentration.top3_share).toBe(0.7); // Manager B
  });

  it('should sort by top4_share', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles));

    act(() => {
      result.current.handleSort('top4');
    });

    expect(result.current.sortedProfiles[0].concentration.top4_share).toBe(0.8); // Manager B
  });

  it('should sort by top5_share', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles));

    act(() => {
      result.current.handleSort('top5');
    });

    expect(result.current.sortedProfiles[0].concentration.top5_share).toBe(0.9); // Manager B
  });

  it('should handle empty profiles array', () => {
    const { result } = renderHook(() => useManagerSorting([]));

    expect(result.current.sortedProfiles).toHaveLength(0);
  });

  it('should maintain sort when profiles change but keep sort config', () => {
    const { result, rerender } = renderHook(({ profiles }) => useManagerSorting(profiles), {
      initialProps: { profiles: mockProfiles },
    });

    act(() => {
      result.current.handleSort('manager');
    });

    expect(result.current.sortedProfiles[0].manager).toBe('Manager C');

    // Update with new profiles (same structure)
    const newProfiles = [...mockProfiles].reverse();
    rerender({ profiles: newProfiles });

    // Should maintain the sort
    expect(result.current.sortedProfiles[0].manager).toBe('Manager C');
  });

  it('should allow changing sort key', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles));

    // Sort by gini
    act(() => {
      result.current.handleSort('gini');
    });

    expect(result.current.sortConfig?.key).toBe('gini');
    expect(result.current.sortedProfiles[0].manager).toBe('Manager B');

    // Change to manager
    act(() => {
      result.current.handleSort('manager');
    });

    expect(result.current.sortConfig?.key).toBe('manager');
    expect(result.current.sortedProfiles[0].manager).toBe('Manager C');
  });

  it('should accept custom default sort key', () => {
    const { result } = renderHook(() => useManagerSorting(mockProfiles, 'custom'));

    expect(result.current.sortBy).toBe('custom');
  });
});
