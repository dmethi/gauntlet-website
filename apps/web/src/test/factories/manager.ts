import type { ManagerProfile } from '@/lib/manager-analytics';

/**
 * Factory for generating test manager analytics data
 */
export const ManagerFactory = {
  /**
   * Generate a test manager profile with default or custom values
   *
   * @example
   * ```typescript
   * import { ManagerFactory } from '@/test';
   *
   * it('should calculate manager concentration', () => {
   *   const profile = ManagerFactory.generateProfile({
   *     concentration: { giniSpend: 0.60 }
   *   });
   *   expect(profile.concentration.giniSpend).toBe(0.60);
   * });
   * ```
   */
  generateProfile: (overrides: Partial<ManagerProfile> = {}): ManagerProfile => ({
    manager: 'Test Manager',
    league: 'AFC',
    team_total: 200,
    spend_shares: {
      pctQB: 0.15,
      pctRB: 0.35,
      pctWR: 0.3,
      pctTE: 0.1,
      pctDEF: 0.05,
      pctStarters: 0.85,
      pctBench: 0.15,
    },
    concentration: {
      giniSpend: 0.45,
      top1_share: 0.25,
      top2_share: 0.4,
      top3_share: 0.55,
      top4_share: 0.65,
      top5_share: 0.75,
    },
    pacing: {
      patienceQ1: 0.2,
      patienceQ2: 0.3,
      patienceQ3: 0.25,
      patienceQ4: 0.25,
      patience_score: 0.65,
      time_to_first_30: 5,
      last_starter_index: 80,
      avg_starter_nom_index: 50,
      avg_bench_nom_index: 120,
    },
    feature_vector: [0.15, 0.35, 0.3, 0.1, 0.05, 0.45, 0.25],
    cluster: {
      cluster_label: 'Stars & Scrubs',
      cluster_id: 1,
      tags: ['high-concentration', 'aggressive'],
      description: 'High concentration strategy',
    },
    twins: [],
    outlier_flags: {
      extreme_top1: false,
      ultra_patient: false,
      speed_drafter: false,
      bench_heavy: false,
      position_hero: null,
    },
    ...overrides,
  }),

  /**
   * Generate multiple manager profiles
   *
   * @example
   * ```typescript
   * import { ManagerFactory } from '@/test';
   *
   * it('should compare multiple managers', () => {
   *   const profiles = ManagerFactory.generateMultiple(3);
   *   expect(profiles).toHaveLength(3);
   *   expect(profiles[0].league).toBe('AFC');
   *   expect(profiles[1].league).toBe('NFC');
   * });
   * ```
   */
  generateMultiple: (count: number): ManagerProfile[] => {
    return Array.from({ length: count }, (_, i) =>
      ManagerFactory.generateProfile({
        manager: `Manager ${i + 1}`,
        league: i % 2 === 0 ? 'AFC' : 'NFC',
      }),
    );
  },
};
