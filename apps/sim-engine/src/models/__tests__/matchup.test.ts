import { describe, it, expect } from 'vitest';
import {
  simulateMatchupProbabilityFromPlayers,
  simulateMatchupProbability,
  simulateMatchupProbabilitySafe,
} from '../matchup';
import { createMetrics } from '../../lib/metrics';
import { isOk, isErr } from '../../lib/result';
import { ValidationError } from '../../lib/validation';
import type { LineupPlayer, Lineup } from '@gauntlet/types';

describe('simulateMatchupProbabilityFromPlayers', () => {
  const mockTeam1Players: LineupPlayer[] = [
    { id: '1', position: 'QB', projection: 24.5 },
    { id: '2', position: 'RB', projection: 15.2 },
    { id: '3', position: 'RB', projection: 12.8 },
    { id: '4', position: 'WR', projection: 14.3 },
    { id: '5', position: 'WR', projection: 11.7 },
    { id: '6', position: 'WR', projection: 9.2 },
    { id: '7', position: 'TE', projection: 8.5 },
    { id: '8', position: 'K', projection: 7.8 },
  ];

  const mockTeam2Players: LineupPlayer[] = [
    { id: '11', position: 'QB', projection: 22.3 },
    { id: '12', position: 'RB', projection: 14.1 },
    { id: '13', position: 'RB', projection: 11.9 },
    { id: '14', position: 'WR', projection: 13.5 },
    { id: '15', position: 'WR', projection: 10.8 },
    { id: '16', position: 'WR', projection: 8.9 },
    { id: '17', position: 'TE', projection: 7.2 },
    { id: '18', position: 'K', projection: 7.5 },
  ];

  it('should return win probabilities that sum to 1.0', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      100 // Small iterations for test speed
    );

    expect(result.team1WinPct + result.team2WinPct).toBeCloseTo(1.0, 2);
  });

  it('should return higher win probability for team with higher projections', async () => {
    const higherTeam: LineupPlayer[] = mockTeam1Players.map(p => ({
      ...p,
      projection: p.projection * 1.5,
    }));

    const result = await simulateMatchupProbabilityFromPlayers(higherTeam, mockTeam2Players, 200);

    expect(result.team1WinPct).toBeGreaterThan(0.7); // Should win >70%
  });

  it('should return balanced probabilities for equal projections', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam1Players.map(p => ({ ...p, id: `${p.id}_copy` })),
      200
    );

    expect(result.team1WinPct).toBeGreaterThan(0.4);
    expect(result.team1WinPct).toBeLessThan(0.6);
  });

  it('should include score distributions with p10, median, p90', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      100
    );

    expect(result.team1Scores.p10).toBeLessThan(result.team1Scores.median);
    expect(result.team1Scores.median).toBeLessThan(result.team1Scores.p90);
    expect(result.team1Scores.mean).toBeGreaterThan(0);
  });

  it('should include implied betting odds', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      100
    );

    expect(result.impliedOdds.spread).toBeDefined();
    expect(result.impliedOdds.total).toBeGreaterThan(0);
    expect(result.impliedOdds.team1MoneyLine).toBeDefined();
    expect(result.impliedOdds.team2MoneyLine).toBeDefined();
  });

  it('should handle live game with currentScore', async () => {
    const liveTeam1 = mockTeam1Players.map(p => ({
      ...p,
      currentScore: p.projection * 0.6, // 60% of projection already scored
      nflTeam: 'KC',
    }));
    const liveTeam2 = mockTeam2Players.map(p => ({
      ...p,
      currentScore: p.projection * 0.4, // 40% of projection already scored
      nflTeam: 'BUF',
    }));

    const result = await simulateMatchupProbabilityFromPlayers(
      liveTeam1,
      liveTeam2,
      100,
      0.65, // 65% game complete
      new Set(['KC', 'BUF'])
    );

    expect(result.team1WinPct).toBeGreaterThan(0.7); // Team 1 ahead
  });

  it('should reduce variance for live games with high game progress', async () => {
    // Test with live players that have current scores
    const liveTeam1Early = mockTeam1Players.map(p => ({
      ...p,
      currentScore: 0, // Early game, no score yet
      nflTeam: 'KC',
    }));
    const liveTeam2Early = mockTeam2Players.map(p => ({
      ...p,
      currentScore: 0,
      nflTeam: 'BUF',
    }));

    const liveTeam1Late = mockTeam1Players.map(p => ({
      ...p,
      currentScore: p.projection * 0.9, // 90% of projection scored
      nflTeam: 'KC',
    }));
    const liveTeam2Late = mockTeam2Players.map(p => ({
      ...p,
      currentScore: p.projection * 0.9,
      nflTeam: 'BUF',
    }));

    const earlyResult = await simulateMatchupProbabilityFromPlayers(
      liveTeam1Early,
      liveTeam2Early,
      200,
      0.1, // 10% game progress
      new Set(['KC', 'BUF'])
    );

    const lateResult = await simulateMatchupProbabilityFromPlayers(
      liveTeam1Late,
      liveTeam2Late,
      200,
      0.9, // 90% game progress
      new Set(['KC', 'BUF'])
    );

    // Late game should have much narrower score range
    const earlyRange = earlyResult.team1Scores.p90 - earlyResult.team1Scores.p10;
    const lateRange = lateResult.team1Scores.p90 - lateResult.team1Scores.p10;

    // Late game range should be significantly smaller
    expect(lateRange).toBeLessThan(earlyRange);
  });

  it('should handle minimum iteration count', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      10 // Minimum iterations
    );

    expect(result.team1WinPct).toBeGreaterThanOrEqual(0);
    expect(result.team1WinPct).toBeLessThanOrEqual(1);
  });

  it('should handle zero projections', async () => {
    const zeroTeam: LineupPlayer[] = mockTeam1Players.map(p => ({
      ...p,
      projection: 0,
    }));

    const result = await simulateMatchupProbabilityFromPlayers(zeroTeam, mockTeam2Players, 50);

    expect(result.team1WinPct).toBeLessThan(0.1); // Should almost never win
    expect(result.team1Scores.mean).toBeLessThan(5); // Very low expected score
  });

  it('should handle very high projections', async () => {
    const highTeam: LineupPlayer[] = mockTeam1Players.map(p => ({
      ...p,
      projection: p.projection * 3, // 3x projections (stays under 150)
    }));

    const result = await simulateMatchupProbabilityFromPlayers(highTeam, mockTeam2Players, 50);

    expect(result.team1WinPct).toBeGreaterThan(0.95); // Should almost always win
    expect(result.team1Scores.mean).toBeGreaterThan(200); // Very high expected score
  });

  it('should calculate median margin accurately', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      200
    );

    // Median margin should be reasonable for teams with similar projections
    expect(Math.abs(result.medianMargin)).toBeLessThan(20);
  });

  it('should calculate moneyline odds correctly for heavy favorite', async () => {
    const heavyFavorite: LineupPlayer[] = mockTeam1Players.map(p => ({
      ...p,
      projection: p.projection * 2,
    }));

    const result = await simulateMatchupProbabilityFromPlayers(
      heavyFavorite,
      mockTeam2Players,
      200
    );

    // Heavy favorite should have negative moneyline
    expect(result.impliedOdds.team1MoneyLine).toBeLessThan(0);
    // Underdog should have positive moneyline
    expect(result.impliedOdds.team2MoneyLine).toBeGreaterThan(0);
  });

  it('should round spread to half-point increments', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      100
    );

    // Spread should be a multiple of 0.5
    expect(result.impliedOdds.spread % 0.5).toBe(0);
  });

  it('should complete 1000 iterations in reasonable time', async () => {
    const startTime = Date.now();

    await simulateMatchupProbabilityFromPlayers(mockTeam1Players, mockTeam2Players, 1000);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Should complete in <5 seconds
  });

  it('should handle post-game scenario with actual scores', async () => {
    const postGameTeam1 = mockTeam1Players.map(p => ({
      ...p,
      currentScore: p.projection * 1.1, // Slightly exceeded projection
      nflTeam: 'KC',
    }));
    const postGameTeam2 = mockTeam2Players.map(p => ({
      ...p,
      currentScore: p.projection * 0.9, // Slightly under projection
      nflTeam: 'BUF',
    }));

    const result = await simulateMatchupProbabilityFromPlayers(
      postGameTeam1,
      postGameTeam2,
      100,
      0.95, // 95% complete (essentially post-game)
      new Set() // Empty set means games are over
    );

    // With actual scores locked in, Team 1 should be heavily favored
    expect(result.team1WinPct).toBeGreaterThan(0.85);
  });
});

describe('simulateMatchupProbability', () => {
  it('should accept Lineup objects', async () => {
    const lineup1: Lineup = {
      qb: { id: '1', position: 'QB', projection: 24 },
      rb1: { id: '2', position: 'RB', projection: 15 },
      rb2: { id: '3', position: 'RB', projection: 12 },
      wr1: { id: '4', position: 'WR', projection: 14 },
      wr2: { id: '5', position: 'WR', projection: 11 },
      wr3: { id: '6', position: 'WR', projection: 9 },
      te: { id: '7', position: 'TE', projection: 8 },
      flex: { id: '8', position: 'RB', projection: 10 },
    };

    const lineup2: Lineup = {
      qb: { id: '11', position: 'QB', projection: 22 },
      rb1: { id: '12', position: 'RB', projection: 14 },
      rb2: { id: '13', position: 'RB', projection: 11 },
      wr1: { id: '14', position: 'WR', projection: 13 },
      wr2: { id: '15', position: 'WR', projection: 10 },
      wr3: { id: '16', position: 'WR', projection: 8 },
      te: { id: '17', position: 'TE', projection: 7 },
      flex: { id: '18', position: 'WR', projection: 9 },
    };

    const result = await simulateMatchupProbability(lineup1, lineup2, 50);
    expect(result.team1WinPct).toBeDefined();
    expect(result.team2WinPct).toBeDefined();
  });

  it('should accept LineupPlayer arrays', async () => {
    const team1: LineupPlayer[] = [
      { id: '1', position: 'QB', projection: 24 },
      { id: '2', position: 'RB', projection: 15 },
    ];
    const team2: LineupPlayer[] = [
      { id: '3', position: 'QB', projection: 22 },
      { id: '4', position: 'RB', projection: 14 },
    ];

    const result = await simulateMatchupProbability(team1, team2, 50);
    expect(result.team1WinPct).toBeDefined();
    expect(result.team2WinPct).toBeDefined();
  });
});

describe('simulateMatchupProbabilitySafe', () => {
  const mockTeam1Players: LineupPlayer[] = [
    { id: '1', position: 'QB', projection: 24.5 },
    { id: '2', position: 'RB', projection: 15.2 },
    { id: '3', position: 'RB', projection: 12.8 },
    { id: '4', position: 'WR', projection: 14.3 },
    { id: '5', position: 'WR', projection: 11.7 },
    { id: '6', position: 'WR', projection: 9.2 },
    { id: '7', position: 'TE', projection: 8.5 },
    { id: '8', position: 'K', projection: 7.8 },
  ];

  const mockTeam2Players: LineupPlayer[] = [
    { id: '11', position: 'QB', projection: 22.3 },
    { id: '12', position: 'RB', projection: 14.1 },
    { id: '13', position: 'RB', projection: 11.9 },
    { id: '14', position: 'WR', projection: 13.5 },
    { id: '15', position: 'WR', projection: 10.8 },
    { id: '16', position: 'WR', projection: 8.9 },
    { id: '17', position: 'TE', projection: 7.2 },
    { id: '18', position: 'K', projection: 7.5 },
  ];

  it('should return Ok result on success', async () => {
    const result = await simulateMatchupProbabilitySafe(mockTeam1Players, mockTeam2Players, 100);

    expect(isOk(result)).toBe(true);
    if (result.ok) {
      expect(result.value.team1WinPct).toBeDefined();
      expect(result.value.team2WinPct).toBeDefined();
      expect(result.value.team1WinPct + result.value.team2WinPct).toBeCloseTo(1.0, 2);
    }
  });

  it('should return Err for invalid inputs (demonstrating safety)', async () => {
    // With invalid inputs like empty arrays, the function catches validation errors
    const result = await simulateMatchupProbabilitySafe([], [], 10);

    // The safe wrapper catches ValidationError and returns Err
    expect(isErr(result)).toBe(true);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toContain('failed');
    }
  });

  it('should allow functional composition', async () => {
    const result = await simulateMatchupProbabilitySafe(mockTeam1Players, mockTeam2Players, 100);

    // Functional style error handling
    const winPct = result.ok ? result.value.team1WinPct : 0.5;
    expect(winPct).toBeGreaterThanOrEqual(0);
    expect(winPct).toBeLessThanOrEqual(1);
  });

  it('should handle live game simulation safely', async () => {
    const liveTeam1 = mockTeam1Players.map(p => ({
      ...p,
      currentScore: p.projection * 0.65,
      nflTeam: 'KC',
    }));

    const result = await simulateMatchupProbabilitySafe(
      liveTeam1,
      mockTeam2Players,
      100,
      0.65,
      new Set(['KC'])
    );

    expect(isOk(result)).toBe(true);
    if (result.ok) {
      expect(result.value.team1WinPct).toBeGreaterThan(0.5);
    }
  });
});

describe('simulateMatchupProbabilityFromPlayers validation', () => {
  const mockTeam1Players: LineupPlayer[] = [
    { id: '1', position: 'QB', projection: 24.5 },
    { id: '2', position: 'RB', projection: 15.2 },
  ];

  const mockTeam2Players: LineupPlayer[] = [
    { id: '11', position: 'QB', projection: 22.3 },
    { id: '12', position: 'RB', projection: 14.1 },
  ];

  it('should throw ValidationError for invalid team1', async () => {
    const invalidTeam: LineupPlayer[] = [{ id: '1', position: 'INVALID' as any, projection: 24 }];

    await expect(
      simulateMatchupProbabilityFromPlayers(invalidTeam, mockTeam2Players, 100)
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for duplicate players', async () => {
    const duplicates: LineupPlayer[] = [
      { id: '1', position: 'QB', projection: 24 },
      { id: '1', position: 'RB', projection: 15 }, // Same ID!
    ];

    await expect(
      simulateMatchupProbabilityFromPlayers(duplicates, mockTeam2Players, 100)
    ).rejects.toThrow(ValidationError);
    await expect(
      simulateMatchupProbabilityFromPlayers(duplicates, mockTeam2Players, 100)
    ).rejects.toThrow('duplicate');
  });

  it('should throw ValidationError for invalid iterations', async () => {
    await expect(
      simulateMatchupProbabilityFromPlayers(mockTeam1Players, mockTeam2Players, -1)
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid gameProgress', async () => {
    await expect(
      simulateMatchupProbabilityFromPlayers(mockTeam1Players, mockTeam2Players, 100, 1.5)
    ).rejects.toThrow(ValidationError);
    await expect(
      simulateMatchupProbabilityFromPlayers(mockTeam1Players, mockTeam2Players, 100, -0.1)
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for empty team array', async () => {
    await expect(simulateMatchupProbabilityFromPlayers([], mockTeam2Players, 100)).rejects.toThrow(
      ValidationError
    );
  });

  it('should throw ValidationError for negative projection', async () => {
    const invalidTeam: LineupPlayer[] = [{ id: '1', position: 'QB', projection: -10 }];

    await expect(
      simulateMatchupProbabilityFromPlayers(invalidTeam, mockTeam2Players, 100)
    ).rejects.toThrow(ValidationError);
  });
});
