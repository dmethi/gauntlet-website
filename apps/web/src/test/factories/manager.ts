import type {
  ManagerAnalytics,
  ManagerProfile,
  PlayerLevelAnalytics,
  PlayerOverlapAnalytics,
} from '@/features/draft-analysis/types';

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
        concentration: {
          giniSpend: 0.4 + i * 0.05,
          top1_share: 0.2 + i * 0.03,
          top2_share: 0.35 + i * 0.03,
          top3_share: 0.5 + i * 0.02,
          top4_share: 0.6 + i * 0.02,
          top5_share: 0.7 + i * 0.02,
        },
      }),
    );
  },

  /**
   * Generate complete ManagerAnalytics with all sections
   *
   * @example
   * ```typescript
   * import { ManagerFactory } from '@/test';
   *
   * it('should render manager analytics', () => {
   *   const analytics = ManagerFactory.generateAnalytics();
   *   expect(analytics.profiles).toHaveLength(6);
   * });
   * ```
   */
  generateAnalytics: (overrides: Partial<ManagerAnalytics> = {}): ManagerAnalytics => {
    const profiles = ManagerFactory.generateMultiple(6);

    return {
      league_A_name: 'AFC',
      league_B_name: 'NFC',
      profiles,
      league_averages: {
        league_A: {
          pctQB: 0.15,
          pctRB: 0.35,
          pctWR: 0.3,
          pctTE: 0.1,
          pctDEF: 0.05,
          pctStarters: 0.85,
          pctBench: 0.15,
          giniSpend: 0.45,
          top1_share: 0.25,
          top2_share: 0.4,
          top3_share: 0.55,
          top4_share: 0.65,
          top5_share: 0.75,
        },
        league_B: {
          pctQB: 0.16,
          pctRB: 0.33,
          pctWR: 0.32,
          pctTE: 0.09,
          pctDEF: 0.05,
          pctStarters: 0.86,
          pctBench: 0.14,
          giniSpend: 0.43,
          top1_share: 0.23,
          top2_share: 0.38,
          top3_share: 0.53,
          top4_share: 0.63,
          top5_share: 0.73,
        },
      },
      cluster_summary: [
        {
          cluster_id: 1,
          cluster_label: 'Stars & Scrubs',
          tags: ['high-concentration', 'aggressive'],
          description: 'High concentration on top players',
          count: 2,
          avg_features: {
            pctQB: 0.15,
            pctRB: 0.35,
            pctWR: 0.3,
            pctTE: 0.1,
            pctDEF: 0.05,
            pctStarters: 0.85,
            pctBench: 0.15,
            giniSpend: 0.6,
            top1_share: 0.35,
            top2_share: 0.55,
            top3_share: 0.7,
            top4_share: 0.78,
            top5_share: 0.85,
          },
        },
        {
          cluster_id: 2,
          cluster_label: 'Balanced Build',
          tags: ['balanced', 'diversified'],
          description: 'Even distribution across roster',
          count: 2,
          avg_features: {
            pctQB: 0.15,
            pctRB: 0.35,
            pctWR: 0.3,
            pctTE: 0.1,
            pctDEF: 0.05,
            pctStarters: 0.85,
            pctBench: 0.15,
            giniSpend: 0.35,
            top1_share: 0.18,
            top2_share: 0.32,
            top3_share: 0.45,
            top4_share: 0.55,
            top5_share: 0.65,
          },
        },
      ],
      twins_summary: {
        high_similarity_pairs: 2,
        avg_similarity: 0.75,
        most_similar_pair: {
          manager_A: 'Manager 1',
          manager_B: 'Manager 2',
          similarity: 0.92,
        },
      },
      player_overlap_analytics: {
        avg_overlap_percentage: 0.25,
        copycat_threshold: 0.4,
        copycat_pairs: [],
        top_overlaps: [
          {
            manager_a: 'Manager 1',
            league_a: 'AFC',
            manager_b: 'Manager 2',
            league_b: 'NFC',
            shared_players: ['player_1', 'player_2'],
            total_unique_players: 30,
            overlap_percentage: 0.3,
            shared_player_names: ['Christian McCaffrey', 'Travis Kelce'],
            manager_a_only: ['player_3'],
            manager_b_only: ['player_4'],
          },
        ],
        maverick_managers: [],
      },
      player_level_analytics: {
        players: [],
        draft_picks: [
          {
            league: 'AFC',
            nom_index: 1,
            nom_quartile: 1,
            timestamp: new Date().toISOString(),
            manager: 'Manager 1',
            player_id: 'player_1',
            player_name: 'Christian McCaffrey',
            position: 'RB',
            price: 65,
            starter_flag: true,
            price_rank_league: 1,
            price_quantile_league: 0.95,
            z_by_pos: 2.5,
            tier: 1,
            aav: 13,
          },
        ],
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
      ...overrides,
    };
  },
};
