/**
 * Tests for Draft Analysis Calculation Utilities
 *
 * Comprehensive test coverage for all calculation functions extracted from manager-analytics.ts
 */

import { describe, expect, it } from 'vitest';
import {
  calculateGini,
  calculatePlayerLevelAnalytics,
  calculatePlayerOverlap,
  cosineSimilarity,
  inferStarters,
  kMeansCluster,
} from './calculations';
import type { MockDraft } from '@/lib/draft-generator';

// ============================================================================
// Test Data Helpers
// ============================================================================

const createMockPlayer = (id: string, name: string, position: string, aav: number) => ({
  id,
  name,
  position,
  aav,
});

const createMockPick = (player: any, actualPrice: number) => ({
  player,
  actualPrice,
});

const createMockTeam = (teamName: string, picks: any[]) => ({
  teamName,
  picks,
  totalSpent: picks.reduce((sum, p) => sum + p.actualPrice, 0),
});

const createMockDraft = (name: string, teams: any[]): MockDraft => ({
  name,
  teams: teams as any,
  totalBudget: 0,
  playersPerTeam: 0,
});

// ============================================================================
// inferStarters Tests
// ============================================================================

describe('inferStarters', () => {
  it('should correctly identify starters based on positional requirements', () => {
    const picks = [
      createMockPick(createMockPlayer('qb1', 'QB1', 'QB', 100), 50),
      createMockPick(createMockPlayer('rb1', 'RB1', 'RB', 90), 45),
      createMockPick(createMockPlayer('rb2', 'RB2', 'RB', 85), 40),
      createMockPick(createMockPlayer('wr1', 'WR1', 'WR', 80), 35),
      createMockPick(createMockPlayer('wr2', 'WR2', 'WR', 75), 30),
      createMockPick(createMockPlayer('te1', 'TE1', 'TE', 70), 25),
      createMockPick(createMockPlayer('def1', 'DEF1', 'DEF', 60), 20),
      createMockPick(createMockPlayer('wr3', 'WR3', 'WR', 55), 15), // FLEX
      createMockPick(createMockPlayer('rb3', 'RB3', 'RB', 50), 10), // FLEX
      createMockPick(createMockPlayer('wr4', 'WR4', 'WR', 30), 5), // Bench
    ];

    const { starters, bench } = inferStarters(picks);

    expect(starters).toHaveLength(9); // 1 QB, 2 RB, 2 WR, 1 TE, 1 DEF, 2 FLEX
    expect(bench).toHaveLength(1);
    expect(bench[0].player.name).toBe('WR4');
  });

  it('should handle empty team picks', () => {
    const { starters, bench } = inferStarters([]);
    expect(starters).toHaveLength(0);
    expect(bench).toHaveLength(0);
  });

  it('should prioritize higher-priced players for starters', () => {
    const picks = [
      createMockPick(createMockPlayer('rb1', 'RB1', 'RB', 100), 10), // Lower price - bench
      createMockPick(createMockPlayer('rb2', 'RB2', 'RB', 100), 50), // Higher price - starter
      createMockPick(createMockPlayer('rb3', 'RB3', 'RB', 100), 30), // Mid price - starter
      createMockPick(createMockPlayer('qb1', 'QB1', 'QB', 100), 40),
      createMockPick(createMockPlayer('wr1', 'WR1', 'WR', 100), 35),
      createMockPick(createMockPlayer('wr2', 'WR2', 'WR', 100), 25),
      createMockPick(createMockPlayer('wr3', 'WR3', 'WR', 100), 18), // FLEX
      createMockPick(createMockPlayer('te1', 'TE1', 'TE', 100), 20),
      createMockPick(createMockPlayer('te2', 'TE2', 'TE', 100), 12), // FLEX
      createMockPick(createMockPlayer('def1', 'DEF1', 'DEF', 100), 15),
    ];

    const { starters, bench } = inferStarters(picks);

    // Should have 9 starters (1 QB, 2 RB, 2 WR, 1 TE, 1 DEF, 2 FLEX)
    expect(starters).toHaveLength(9);
    // RB1 (10) should be on bench
    expect(bench).toHaveLength(1);
    expect(bench[0].player.name).toBe('RB1');

    // Verify the two most expensive RBs are in starter slots
    const rbStarters = starters.filter(s => s.player.position === 'RB');
    expect(rbStarters.length).toBeGreaterThanOrEqual(2);
    expect(rbStarters.some(s => s.actualPrice === 50)).toBe(true);
    expect(rbStarters.some(s => s.actualPrice === 30)).toBe(true);
  });
});

// ============================================================================
// calculateGini Tests
// ============================================================================

describe('calculateGini', () => {
  it('should return 0 for equal distribution', () => {
    const prices = [10, 10, 10, 10, 10];
    const gini = calculateGini(prices);
    expect(gini).toBe(0);
  });

  it('should return high value for concentrated distribution', () => {
    const prices = [100, 1, 1, 1, 1];
    const gini = calculateGini(prices);
    expect(gini).toBeGreaterThan(0.7);
  });

  it('should return 0 for single price', () => {
    const gini = calculateGini([50]);
    expect(gini).toBe(0);
  });

  it('should return 0 for all zero prices', () => {
    const gini = calculateGini([0, 0, 0, 0]);
    expect(gini).toBe(0);
  });

  it('should calculate correct Gini for typical auction draft', () => {
    const prices = [60, 50, 40, 30, 20, 10, 10, 10, 5, 5];
    const gini = calculateGini(prices);
    expect(gini).toBeGreaterThan(0.3);
    expect(gini).toBeLessThan(0.5);
  });
});

// ============================================================================
// cosineSimilarity Tests
// ============================================================================

describe('cosineSimilarity', () => {
  it('should return 1 for identical vectors', () => {
    const vec1 = [1, 2, 3, 4];
    const vec2 = [1, 2, 3, 4];
    const similarity = cosineSimilarity(vec1, vec2);
    expect(similarity).toBe(1);
  });

  it('should return 1 for proportional vectors', () => {
    const vec1 = [1, 2, 3];
    const vec2 = [2, 4, 6];
    const similarity = cosineSimilarity(vec1, vec2);
    expect(similarity).toBeCloseTo(1, 5);
  });

  it('should return 0 for orthogonal vectors', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [0, 1, 0];
    const similarity = cosineSimilarity(vec1, vec2);
    expect(similarity).toBe(0);
  });

  it('should return 0 for different length vectors', () => {
    const vec1 = [1, 2, 3];
    const vec2 = [1, 2];
    const similarity = cosineSimilarity(vec1, vec2);
    expect(similarity).toBe(0);
  });

  it('should return 0 for zero vectors', () => {
    const vec1 = [0, 0, 0];
    const vec2 = [1, 2, 3];
    const similarity = cosineSimilarity(vec1, vec2);
    expect(similarity).toBe(0);
  });

  it('should calculate similarity for typical feature vectors', () => {
    const vec1 = [0.2, 0.3, 0.4, 0.1]; // Manager A strategy
    const vec2 = [0.25, 0.28, 0.38, 0.09]; // Similar manager B strategy
    const similarity = cosineSimilarity(vec1, vec2);
    expect(similarity).toBeGreaterThan(0.99); // Very similar
  });
});

// ============================================================================
// kMeansCluster Tests
// ============================================================================

describe('kMeansCluster', () => {
  it('should return empty results for empty data', () => {
    const { clusters, centroids } = kMeansCluster([], 3);
    expect(clusters).toHaveLength(0);
    expect(centroids).toHaveLength(0);
  });

  it('should assign all points to clusters', () => {
    const data = [
      [1, 2],
      [2, 3],
      [8, 9],
      [9, 10],
    ];
    const { clusters } = kMeansCluster(data, 2);

    expect(clusters).toHaveLength(4);
    expect(new Set(clusters).size).toBeLessThanOrEqual(2); // At most 2 unique clusters
  });

  it('should separate well-defined clusters', () => {
    const data = [
      [1, 1],
      [1.5, 2],
      [2, 1.5], // Cluster 1
      [10, 10],
      [10.5, 11],
      [11, 10.5], // Cluster 2
    ];
    const { clusters } = kMeansCluster(data, 2);

    // First 3 points should be in same cluster
    expect(clusters[0]).toBe(clusters[1]);
    expect(clusters[1]).toBe(clusters[2]);

    // Last 3 points should be in same cluster
    expect(clusters[3]).toBe(clusters[4]);
    expect(clusters[4]).toBe(clusters[5]);

    // Two groups should be in different clusters (use Set to check uniqueness)
    const uniqueClusters = new Set(clusters);
    expect(uniqueClusters.size).toBe(2); // Exactly 2 clusters formed
  });

  it('should create specified number of clusters', () => {
    const data = Array.from({ length: 20 }, (_, i) => [i, i * 2]);
    const { clusters, centroids } = kMeansCluster(data, 4);

    expect(centroids).toHaveLength(4);
    expect(new Set(clusters).size).toBeLessThanOrEqual(4);
  });
});

// ============================================================================
// calculatePlayerOverlap Tests
// ============================================================================

describe('calculatePlayerOverlap', () => {
  it('should calculate overlap between two drafts', () => {
    const team1 = createMockTeam('Team A', [
      createMockPick(createMockPlayer('p1', 'Player 1', 'RB', 100), 50),
      createMockPick(createMockPlayer('p2', 'Player 2', 'WR', 90), 45),
    ]);

    const team2 = createMockTeam('Team B', [
      createMockPick(createMockPlayer('p1', 'Player 1', 'RB', 100), 48), // Shared
      createMockPick(createMockPlayer('p3', 'Player 3', 'QB', 85), 40), // Unique
    ]);

    const draft1 = createMockDraft('AFC', [team1]);
    const draft2 = createMockDraft('NFC', [team2]);

    const analytics = calculatePlayerOverlap(draft1, draft2);

    expect(analytics.top_overlaps).toHaveLength(1); // 1 manager pair
    expect(analytics.top_overlaps[0].shared_players).toHaveLength(1); // 1 shared player
    expect(analytics.top_overlaps[0].shared_player_names).toContain('Player 1');
  });

  it('should identify copycat pairs with high overlap', () => {
    const sharedPlayers = Array.from({ length: 8 }, (_, i) =>
      createMockPlayer(`p${i}`, `Player ${i}`, 'RB', 100 - i * 5),
    );

    const team1 = createMockTeam(
      'Team A',
      sharedPlayers.map(p => createMockPick(p, 50)),
    );
    const team2 = createMockTeam(
      'Team B',
      sharedPlayers.map(p => createMockPick(p, 48)),
    );

    const draft1 = createMockDraft('AFC', [team1]);
    const draft2 = createMockDraft('NFC', [team2]);

    const analytics = calculatePlayerOverlap(draft1, draft2);

    expect(analytics.copycat_pairs).toHaveLength(1); // High overlap pair
    expect(analytics.copycat_pairs[0].overlap_percentage).toBeGreaterThan(40);
  });

  it('should calculate average overlap percentage', () => {
    const team1 = createMockTeam('Team A', [
      createMockPick(createMockPlayer('p1', 'Player 1', 'RB', 100), 50),
    ]);
    const team2 = createMockTeam('Team B', [
      createMockPick(createMockPlayer('p2', 'Player 2', 'WR', 90), 45),
    ]);

    const draft1 = createMockDraft('AFC', [team1]);
    const draft2 = createMockDraft('NFC', [team2]);

    const analytics = calculatePlayerOverlap(draft1, draft2);

    expect(analytics.avg_overlap_percentage).toBeGreaterThanOrEqual(0);
    expect(analytics.avg_overlap_percentage).toBeLessThanOrEqual(100);
  });

  it('should identify maverick managers with low overlap', () => {
    const commonPlayer = createMockPlayer('common', 'Common Player', 'RB', 100);
    const uniquePlayers = Array.from({ length: 10 }, (_, i) =>
      createMockPlayer(`unique${i}`, `Unique ${i}`, 'WR', 90 - i * 5),
    );

    const team1 = createMockTeam('Copycat', [
      createMockPick(commonPlayer, 50),
      ...uniquePlayers.slice(0, 2).map(p => createMockPick(p, 40)),
    ]);

    const team2 = createMockTeam('Maverick', [
      createMockPick(commonPlayer, 48),
      ...uniquePlayers.slice(2, 9).map(p => createMockPick(p, 35)),
    ]);

    const draft1 = createMockDraft('AFC', [team1]);
    const draft2 = createMockDraft('NFC', [team2]);

    const analytics = calculatePlayerOverlap(draft1, draft2);

    expect(analytics.maverick_managers).toHaveLength(2);
    expect(analytics.maverick_managers[0].unique_picks_percentage).toBeGreaterThan(0);
  });
});

// ============================================================================
// calculatePlayerLevelAnalytics Tests
// ============================================================================

describe('calculatePlayerLevelAnalytics', () => {
  it('should analyze players across two leagues', () => {
    const player1 = createMockPlayer('p1', 'Player 1', 'RB', 100);
    const player2 = createMockPlayer('p2', 'Player 2', 'WR', 90);

    const team1 = createMockTeam('Team A', [createMockPick(player1, 50)]);
    const team2 = createMockTeam('Team B', [
      createMockPick(player1, 45),
      createMockPick(player2, 40),
    ]);

    const draft1 = createMockDraft('AFC', [team1]);
    const draft2 = createMockDraft('NFC', [team2]);

    const analytics = calculatePlayerLevelAnalytics(draft1, draft2);

    expect(analytics.players).toHaveLength(2); // 2 unique players
    expect(analytics.draft_picks).toHaveLength(3); // 3 total picks
  });

  it('should calculate price gaps correctly', () => {
    const player = createMockPlayer('p1', 'Player 1', 'RB', 100);

    const team1 = createMockTeam('Team A', [createMockPick(player, 50)]);
    const team2 = createMockTeam('Team B', [createMockPick(player, 40)]);

    const draft1 = createMockDraft('AFC', [team1]);
    const draft2 = createMockDraft('NFC', [team2]);

    const analytics = calculatePlayerLevelAnalytics(draft1, draft2);
    const playerAnalysis = analytics.players[0];

    expect(playerAnalysis.price_gap).toBe(10); // 50 - 40
    expect(playerAnalysis.price_gap_abs).toBe(10);
    expect(playerAnalysis.prices.LEAGUE_A).toBe(50);
    expect(playerAnalysis.prices.LEAGUE_B).toBe(40);
  });

  it('should generate tier assignments', () => {
    const players = Array.from({ length: 20 }, (_, i) =>
      createMockPlayer(`p${i}`, `Player ${i}`, 'RB', 100 - i * 5),
    );

    const team1 = createMockTeam(
      'Team A',
      players.slice(0, 10).map((p, i) => createMockPick(p, 50 - i * 5)),
    );
    const team2 = createMockTeam(
      'Team B',
      players.slice(10, 20).map((p, i) => createMockPick(p, 25 - i * 2)),
    );

    const draft1 = createMockDraft('AFC', [team1]);
    const draft2 = createMockDraft('NFC', [team2]);

    const analytics = calculatePlayerLevelAnalytics(draft1, draft2);

    // Check tier assignments exist and are valid (1-4)
    analytics.players.forEach(player => {
      if (player.tiers.LEAGUE_A !== null) {
        expect(player.tiers.LEAGUE_A).toBeGreaterThanOrEqual(1);
        expect(player.tiers.LEAGUE_A).toBeLessThanOrEqual(4);
      }
    });
  });

  it('should generate top price gaps', () => {
    const player1 = createMockPlayer('p1', 'Big Gap Player', 'RB', 100);
    const player2 = createMockPlayer('p2', 'Small Gap Player', 'WR', 90);

    const team1 = createMockTeam('Team A', [
      createMockPick(player1, 60),
      createMockPick(player2, 30),
    ]);
    const team2 = createMockTeam('Team B', [
      createMockPick(player1, 40),
      createMockPick(player2, 28),
    ]);

    const draft1 = createMockDraft('AFC', [team1]);
    const draft2 = createMockDraft('NFC', [team2]);

    const analytics = calculatePlayerLevelAnalytics(draft1, draft2);

    expect(analytics.top_price_gaps).toHaveLength(2);
    expect(analytics.top_price_gaps[0].name).toBe('Big Gap Player'); // Sorted by gap size
    expect(analytics.top_price_gaps[0].price_gap_abs).toBe(20);
  });

  it('should generate league summary tiles', () => {
    const players = Array.from({ length: 12 }, (_, i) =>
      createMockPlayer(`p${i}`, `Player ${i}`, 'RB', 100),
    );

    const team = createMockTeam(
      'Team',
      players.map((p, i) => createMockPick(p, 20)),
    );

    const draft1 = createMockDraft('AFC', [team]);
    const draft2 = createMockDraft('NFC', [team]);

    const analytics = calculatePlayerLevelAnalytics(draft1, draft2);

    expect(analytics.league_tiles.LEAGUE_A).toHaveLength(3); // Avg, Std Dev, Players count
    expect(analytics.league_tiles.LEAGUE_B).toHaveLength(3);
  });

  it('should create price gap histogram', () => {
    const player1 = createMockPlayer('p1', 'Player 1', 'RB', 100);
    const player2 = createMockPlayer('p2', 'Player 2', 'WR', 90);

    const team1 = createMockTeam('Team A', [
      createMockPick(player1, 50),
      createMockPick(player2, 30),
    ]);
    const team2 = createMockTeam('Team B', [
      createMockPick(player1, 45),
      createMockPick(player2, 28),
    ]);

    const draft1 = createMockDraft('AFC', [team1]);
    const draft2 = createMockDraft('NFC', [team2]);

    const analytics = calculatePlayerLevelAnalytics(draft1, draft2);

    expect(analytics.price_gap_histogram.bins).toHaveLength(15); // 15 bins
    expect(analytics.price_gap_histogram.counts).toHaveLength(15);
    expect(analytics.price_gap_histogram.bin_labels).toHaveLength(15);
    expect(analytics.price_gap_histogram.counts.reduce((sum, c) => sum + c, 0)).toBe(2); // 2 players
  });
});
