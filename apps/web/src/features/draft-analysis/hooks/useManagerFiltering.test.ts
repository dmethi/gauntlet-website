import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useManagerFiltering } from './useManagerFiltering';
import type { ManagerProfile } from '../types';

describe('useManagerFiltering', () => {
  const mockProfiles: ManagerProfile[] = [
    {
      manager: 'Manager 1',
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
        top1_share: 0.25,
        top2_share: 0.45,
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
      manager: 'Manager 2',
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
        top1_share: 0.35,
        top2_share: 0.6,
        top3_share: 0.75,
        top4_share: 0.85,
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
      manager: 'Manager 3',
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
        top1_share: 0.28,
        top2_share: 0.5,
        top3_share: 0.65,
        top4_share: 0.75,
        top5_share: 0.85,
        giniSpend: 0.55,
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
      feature_vector: [0.55, 0.35, 0.25],
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

  it('should return all profiles when cluster is "all"', () => {
    const { result } = renderHook(() => useManagerFiltering(mockProfiles));
    expect(result.current.filteredProfiles).toHaveLength(3);
    expect(result.current.selectedCluster).toBe('all');
  });

  it('should filter profiles by cluster', () => {
    const { result } = renderHook(() => useManagerFiltering(mockProfiles));

    act(() => {
      result.current.setSelectedCluster('balanced');
    });

    expect(result.current.filteredProfiles).toHaveLength(2);
    expect(result.current.filteredProfiles[0].manager).toBe('Manager 1');
    expect(result.current.filteredProfiles[1].manager).toBe('Manager 3');
    expect(result.current.selectedCluster).toBe('balanced');
  });

  it('should update filtered profiles when cluster changes', () => {
    const { result } = renderHook(() => useManagerFiltering(mockProfiles));

    act(() => {
      result.current.setSelectedCluster('concentrated');
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].manager).toBe('Manager 2');
    expect(result.current.selectedCluster).toBe('concentrated');
  });

  it('should accept initial cluster option', () => {
    const { result } = renderHook(() => useManagerFiltering(mockProfiles, { cluster: 'balanced' }));

    expect(result.current.selectedCluster).toBe('balanced');
    expect(result.current.filteredProfiles).toHaveLength(2);
  });

  it('should return empty array when cluster has no matches', () => {
    const { result } = renderHook(() => useManagerFiltering(mockProfiles));

    act(() => {
      result.current.setSelectedCluster('nonexistent');
    });

    expect(result.current.filteredProfiles).toHaveLength(0);
  });

  it('should handle empty profiles array', () => {
    const { result } = renderHook(() => useManagerFiltering([]));

    expect(result.current.filteredProfiles).toHaveLength(0);
    expect(result.current.selectedCluster).toBe('all');
  });

  it('should allow switching back to "all" after filtering', () => {
    const { result } = renderHook(() => useManagerFiltering(mockProfiles));

    act(() => {
      result.current.setSelectedCluster('balanced');
    });

    expect(result.current.filteredProfiles).toHaveLength(2);

    act(() => {
      result.current.setSelectedCluster('all');
    });

    expect(result.current.filteredProfiles).toHaveLength(3);
  });
});
