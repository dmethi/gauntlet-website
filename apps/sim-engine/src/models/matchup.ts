import {
  buildSamplingContext,
  samplePlayerScoreFromContext,
  simulatePlayerScore,
} from './variance';
import type {
  Lineup,
  LineupPlayer,
  MatchupResult,
  MatchupSimulationResult,
  Metrics,
} from '@gauntlet/types';
import { Result, err, ok } from '../lib/result';
import { logger } from '../lib/logger';
import { validateGameProgress, validateIterations, validateLineupPlayers } from '../lib/validation';

// Re-export for backwards compatibility
export type { LineupPlayer, Lineup, MatchupResult, MatchupSimulationResult };

/**
 * Type-safe error for simulation failures.
 */
export class SimulationError extends Error {
  constructor(
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'SimulationError';
  }
}

/**
 * Simulate a single matchup between two lineups
 * @internal Reserved for future use
 */
const _simulateMatchup = async (
  team1: Lineup,
  team2: Lineup,
  gameProgress: number = 0
): Promise<MatchupResult> => {
  // Validate no duplicate players
  const team1Players = new Set([
    team1.qb.id,
    team1.rb1.id,
    team1.rb2.id,
    team1.wr1.id,
    team1.wr2.id,
    team1.wr3.id,
    team1.te.id,
    team1.flex.id,
  ]);
  const team2Players = new Set([
    team2.qb.id,
    team2.rb1.id,
    team2.rb2.id,
    team2.wr1.id,
    team2.wr2.id,
    team2.wr3.id,
    team2.te.id,
    team2.flex.id,
  ]);

  if (team1Players.size !== 8 || team2Players.size !== 8) {
    throw new Error('Duplicate players detected in lineup');
  }

  // Simulate each player
  const [team1Scores, team2Scores] = await Promise.all([
    Promise.all([
      simulatePlayerScore(team1.qb.id, team1.qb.position, team1.qb.projection, gameProgress),
      simulatePlayerScore(team1.rb1.id, team1.rb1.position, team1.rb1.projection, gameProgress),
      simulatePlayerScore(team1.rb2.id, team1.rb2.position, team1.rb2.projection, gameProgress),
      simulatePlayerScore(team1.wr1.id, team1.wr1.position, team1.wr1.projection, gameProgress),
      simulatePlayerScore(team1.wr2.id, team1.wr2.position, team1.wr2.projection, gameProgress),
      simulatePlayerScore(team1.wr3.id, team1.wr3.position, team1.wr3.projection, gameProgress),
      simulatePlayerScore(team1.te.id, team1.te.position, team1.te.projection, gameProgress),
      simulatePlayerScore(team1.flex.id, team1.flex.position, team1.flex.projection, gameProgress),
    ]),
    Promise.all([
      simulatePlayerScore(team2.qb.id, team2.qb.position, team2.qb.projection, gameProgress),
      simulatePlayerScore(team2.rb1.id, team2.rb1.position, team2.rb1.projection, gameProgress),
      simulatePlayerScore(team2.rb2.id, team2.rb2.position, team2.rb2.projection, gameProgress),
      simulatePlayerScore(team2.wr1.id, team2.wr1.position, team2.wr1.projection, gameProgress),
      simulatePlayerScore(team2.wr2.id, team2.wr2.position, team2.wr2.projection, gameProgress),
      simulatePlayerScore(team2.wr3.id, team2.wr3.position, team2.wr3.projection, gameProgress),
      simulatePlayerScore(team2.te.id, team2.te.position, team2.te.projection, gameProgress),
      simulatePlayerScore(team2.flex.id, team2.flex.position, team2.flex.projection, gameProgress),
    ]),
  ]);

  const team1Total = team1Scores.reduce((sum, score) => sum + score, 0);
  const team2Total = team2Scores.reduce((sum, score) => sum + score, 0);

  return {
    team1Score: team1Total,
    team2Score: team2Total,
    winner: team1Total > team2Total ? 1 : 2,
    margin: Math.abs(team1Total - team2Total),
  };
};

/**
 * Convert win probability to American odds
 */
const probToMoneyLine = (probability: number): number => {
  if (probability > 0.5) {
    return -Math.round((probability / (1 - probability)) * 100);
  } else {
    return Math.round(((1 - probability) / probability) * 100);
  }
};

/**
 * Calculate betting lines from simulation results
 */
const calculateBettingLines = (
  results: MatchupResult[],
  team1Scores: number[],
  team2Scores: number[]
): {
  spread: number;
  total: number;
  team1MoneyLine: number;
  team2MoneyLine: number;
} => {
  // Sort margins for median
  const margins = results.map(r => (r.winner === 1 ? r.margin : -r.margin)).sort((a, b) => a - b);

  // Get median margin
  const medianMargin = margins[Math.floor(margins.length / 2)];

  // Round spread to nearest 0.5
  const spread = Math.round(medianMargin * 2) / 2;

  // Calculate over/under from median team scores
  const medianTotal =
    team1Scores[Math.floor(team1Scores.length / 2)] +
    team2Scores[Math.floor(team2Scores.length / 2)];

  // Round total to nearest 0.5
  const total = Math.round(medianTotal * 2) / 2;

  // Calculate money lines from win percentage
  const team1Wins = results.filter(r => r.winner === 1).length;
  const team1WinPct = team1Wins / results.length;

  return {
    spread,
    total,
    team1MoneyLine: probToMoneyLine(team1WinPct),
    team2MoneyLine: probToMoneyLine(1 - team1WinPct),
  };
};

/**
 * Simulate a matchup between two teams using Monte Carlo sampling.
 *
 * Performs 10,000+ iterations sampling from historical player and position variance
 * distributions to generate win probabilities, score distributions, and implied betting odds.
 *
 * Supports three game states:
 * - Pre-game: Uses full projections with variance
 * - Live game: Combines actual scores + simulated remaining projections
 * - Post-game: Uses actual scores + minimal remaining projection
 *
 * ⚠️ This function throws exceptions on error.
 * For type-safe error handling, use {@link simulateMatchupProbabilitySafe}
 *
 * @param team1Players - Array of LineupPlayer objects for team 1 (typically 8-9 players)
 * @param team2Players - Array of LineupPlayer objects for team 2 (typically 8-9 players)
 * @param iterations - Number of Monte Carlo iterations to run (default: 10000, min 100 for testing)
 * @param gameProgress - Game completion percentage from 0 (start) to 1 (end)
 * @param liveNflTeams - Optional Set of NFL team codes currently playing live games
 * @param metrics - Optional Metrics instance for tracking performance
 *
 * @returns Promise<MatchupSimulationResult> containing:
 *   - team1WinPct/team2WinPct: Win probabilities (sum to 1.0)
 *   - medianMargin: Expected point differential
 *   - team1Scores/team2Scores: Score distributions (mean, median, p10, p90)
 *   - impliedOdds: Betting lines (spread, total, moneyline)
 *
 * @throws {Error} If validation fails or simulation errors occur
 *
 * @see simulateMatchupProbabilitySafe for Result-based error handling
 *
 * @example
 * // Pre-game simulation
 * const result = await simulateMatchupProbabilityFromPlayers(
 *   [{ id: '1', position: 'QB', projection: 24.5 }, ...],
 *   [{ id: '2', position: 'QB', projection: 22.3 }, ...],
 *   10000,
 *   0
 * );
 * console.log(`Team 1 Win%: ${(result.team1WinPct * 100).toFixed(1)}%`);
 *
 * @example
 * // Live game simulation with actual scores
 * const result = await simulateMatchupProbabilityFromPlayers(
 *   [{ id: '1', position: 'QB', projection: 24.5, currentScore: 18.2, nflTeam: 'KC' }, ...],
 *   [{ id: '2', position: 'QB', projection: 22.3, currentScore: 12.4, nflTeam: 'BUF' }, ...],
 *   10000,
 *   0.65, // 65% game complete
 *   new Set(['KC', 'BUF'])
 * );
 * console.log(`Updated Win%: ${(result.team1WinPct * 100).toFixed(1)}%`);
 *
 * @example
 * // With metrics collection
 * import { simulateMatchupProbabilityFromPlayers, createMetrics } from '@gauntlet/sim-engine';
 *
 * const metrics = createMetrics();
 * const result = await simulateMatchupProbabilityFromPlayers(
 *   team1Players,
 *   team2Players,
 *   10000,
 *   0,
 *   undefined,
 *   metrics
 * );
 *
 * const summary = metrics.getSummary();
 * console.log('Simulation took:', summary.timers['simulation.matchup.duration']);
 * console.log('Cache hit rate:', summary.counters['variance.position_distribution.cache_hit']);
 */
export const simulateMatchupProbabilityFromPlayers = async (
  team1Players: LineupPlayer[],
  team2Players: LineupPlayer[],
  iterations: number = 10000,
  gameProgress: number = 0,
  liveNflTeams?: Set<string>,
  metrics?: Metrics
): Promise<MatchupSimulationResult> => {
  // Validate inputs before expensive operations
  validateLineupPlayers(team1Players, 'team1Players');
  validateLineupPlayers(team2Players, 'team2Players');
  validateIterations(iterations);
  validateGameProgress(gameProgress);

  // Log validation success
  logger.debug(
    {
      event: 'simulation_validation_passed',
      team1Count: team1Players.length,
      team2Count: team2Players.length,
      iterations,
      gameProgress,
    },
    'Input validation passed'
  );

  const startTime = Date.now();

  // Track if this is a live game simulation
  const isLiveSimulation = liveNflTeams && liveNflTeams.size > 0;
  if (isLiveSimulation && metrics) {
    metrics.increment('simulation.live_game.count');
  }

  const results: MatchupResult[] = [];
  const team1Scores: number[] = [];
  const team2Scores: number[] = [];

  const playerIds = [...team1Players.map(p => p.id), ...team2Players.map(p => p.id)];
  const positions = [...team1Players.map(p => p.position), ...team2Players.map(p => p.position)];

  const ctx = await buildSamplingContext(playerIds, positions, metrics);

  for (let i = 0; i < iterations; i++) {
    let team1Total = 0;
    let team2Total = 0;

    for (const player of team1Players) {
      // Determine if this player's NFL team is currently playing live
      const playerIsLive = liveNflTeams && player.nflTeam && liveNflTeams.has(player.nflTeam);
      const hasActualStats = player.currentScore !== undefined && player.currentScore > 0;

      if (hasActualStats && playerIsLive) {
        // Live simulation: currentScore + simulate remaining projection
        const effectiveGameProgress = gameProgress;
        const remainingProjection = player.projection * (1 - effectiveGameProgress);
        const simulatedRemaining = samplePlayerScoreFromContext(
          ctx,
          player.id,
          player.position,
          remainingProjection,
          0 // No additional gameProgress reduction for remaining portion
        );
        team1Total += (player.currentScore as number) + simulatedRemaining;
      } else if (hasActualStats && !playerIsLive) {
        // Post-game simulation: currentScore + minimal remaining projection (game likely over)
        const postGameProgress = 0.95; // Treat as 95% complete
        const remainingProjection = player.projection * (1 - postGameProgress);
        const simulatedRemaining = samplePlayerScoreFromContext(
          ctx,
          player.id,
          player.position,
          remainingProjection,
          0
        );
        team1Total += (player.currentScore as number) + simulatedRemaining;
      } else {
        // Pre-game simulation: use full projection with appropriate progress
        const effectiveGameProgress = playerIsLive ? gameProgress : 0;
        team1Total += samplePlayerScoreFromContext(
          ctx,
          player.id,
          player.position,
          player.projection,
          effectiveGameProgress
        );
      }
    }
    for (const player of team2Players) {
      // Determine if this player's NFL team is currently playing live
      const playerIsLive = liveNflTeams && player.nflTeam && liveNflTeams.has(player.nflTeam);
      const hasActualStats = player.currentScore !== undefined && player.currentScore > 0;

      if (hasActualStats && playerIsLive) {
        // Live simulation: currentScore + simulate remaining projection
        const effectiveGameProgress = gameProgress;
        const remainingProjection = player.projection * (1 - effectiveGameProgress);
        const simulatedRemaining = samplePlayerScoreFromContext(
          ctx,
          player.id,
          player.position,
          remainingProjection,
          0 // No additional gameProgress reduction for remaining portion
        );
        team2Total += (player.currentScore as number) + simulatedRemaining;
      } else if (hasActualStats && !playerIsLive) {
        // Post-game simulation: currentScore + minimal remaining projection (game likely over)
        const postGameProgress = 0.95; // Treat as 95% complete
        const remainingProjection = player.projection * (1 - postGameProgress);
        const simulatedRemaining = samplePlayerScoreFromContext(
          ctx,
          player.id,
          player.position,
          remainingProjection,
          0
        );
        team2Total += (player.currentScore as number) + simulatedRemaining;
      } else {
        // Pre-game simulation: use full projection with appropriate progress
        const effectiveGameProgress = playerIsLive ? gameProgress : 0;
        team2Total += samplePlayerScoreFromContext(
          ctx,
          player.id,
          player.position,
          player.projection,
          effectiveGameProgress
        );
      }
    }

    const winner = team1Total > team2Total ? 1 : 2;
    const margin = Math.abs(team1Total - team2Total);

    results.push({ team1Score: team1Total, team2Score: team2Total, winner, margin });
    team1Scores.push(team1Total);
    team2Scores.push(team2Total);
  }

  // Sort scores for percentiles
  team1Scores.sort((a, b) => a - b);
  team2Scores.sort((a, b) => a - b);

  // Calculate win percentages
  const team1Wins = results.filter(r => r.winner === 1).length;
  const team1WinPct = team1Wins / iterations;
  const team2WinPct = 1 - team1WinPct;

  // Calculate median margin
  const margins = results.map(r => (r.winner === 1 ? r.margin : -r.margin)).sort((a, b) => a - b);
  const medianMargin = margins[Math.floor(margins.length / 2)];

  // Calculate betting lines
  const impliedOdds = calculateBettingLines(results, team1Scores, team2Scores);

  // Track simulation completion
  if (metrics) {
    metrics.recordDuration('simulation.matchup.duration', Date.now() - startTime);
    metrics.increment('simulation.matchup.iterations', iterations);
    metrics.increment('simulation.matchup.completed');
  }

  return {
    team1WinPct,
    team2WinPct,
    medianMargin,
    team1Scores: {
      mean: team1Scores.reduce((sum, s) => sum + s, 0) / iterations,
      median: team1Scores[Math.floor(iterations * 0.5)],
      p10: team1Scores[Math.floor(iterations * 0.1)],
      p90: team1Scores[Math.floor(iterations * 0.9)],
    },
    team2Scores: {
      mean: team2Scores.reduce((sum, s) => sum + s, 0) / iterations,
      median: team2Scores[Math.floor(iterations * 0.5)],
      p10: team2Scores[Math.floor(iterations * 0.1)],
      p90: team2Scores[Math.floor(iterations * 0.9)],
    },
    impliedOdds,
  };
};

/**
 * Simulate a matchup using Lineup objects or LineupPlayer arrays.
 *
 * Convenience wrapper around simulateMatchupProbabilityFromPlayers that accepts
 * either Lineup objects (with named positions) or LineupPlayer arrays.
 *
 * @param team1 - Lineup object or array of LineupPlayer for team 1
 * @param team2 - Lineup object or array of LineupPlayer for team 2
 * @param iterations - Number of Monte Carlo iterations (default: 10000)
 * @param gameProgress - Game completion percentage 0-1 (default: 0)
 *
 * @returns Promise<MatchupSimulationResult> with win probabilities and score distributions
 *
 * @example
 * // Using Lineup objects
 * const result = await simulateMatchupProbability(
 *   { qb: {...}, rb1: {...}, rb2: {...}, ... },
 *   { qb: {...}, rb1: {...}, rb2: {...}, ... },
 *   10000
 * );
 *
 * @example
 * // Using LineupPlayer arrays
 * const result = await simulateMatchupProbability(
 *   [qbPlayer, rb1Player, rb2Player, ...],
 *   [qbPlayer, rb1Player, rb2Player, ...],
 *   10000
 * );
 */
export const simulateMatchupProbability = async (
  team1: Lineup | LineupPlayer[],
  team2: Lineup | LineupPlayer[],
  iterations: number = 10000,
  gameProgress: number = 0
): Promise<MatchupSimulationResult> => {
  const team1Players: LineupPlayer[] = Array.isArray(team1) ? team1 : Object.values(team1);
  const team2Players: LineupPlayer[] = Array.isArray(team2) ? team2 : Object.values(team2);
  return simulateMatchupProbabilityFromPlayers(
    team1Players,
    team2Players,
    iterations,
    gameProgress
  );
};

/**
 * Safe version of simulateMatchupProbabilityFromPlayers.
 * Returns Result instead of throwing exceptions.
 *
 * @param team1Players - Array of LineupPlayer objects for team 1 (typically 8-9 players)
 * @param team2Players - Array of LineupPlayer objects for team 2 (typically 8-9 players)
 * @param iterations - Number of Monte Carlo iterations to run (default: 10000, min 100 for testing)
 * @param gameProgress - Game completion percentage from 0 (start) to 1 (end)
 * @param liveNflTeams - Optional Set of NFL team codes currently playing live games
 * @param metrics - Optional Metrics instance for tracking performance
 *
 * @returns Promise<Result<MatchupSimulationResult, SimulationError>>
 *
 * @example
 * const result = await simulateMatchupProbabilitySafe(...);
 * if (result.ok) {
 *   console.log('Win%:', result.value.team1WinPct);
 * } else {
 *   console.error('Simulation failed:', result.error.message);
 * }
 */
export const simulateMatchupProbabilitySafe = async (
  team1Players: LineupPlayer[],
  team2Players: LineupPlayer[],
  iterations: number = 10000,
  gameProgress: number = 0,
  liveNflTeams?: Set<string>,
  metrics?: Metrics
): Promise<Result<MatchupSimulationResult, SimulationError>> => {
  try {
    const result = await simulateMatchupProbabilityFromPlayers(
      team1Players,
      team2Players,
      iterations,
      gameProgress,
      liveNflTeams,
      metrics
    );
    return ok(result);
  } catch (error) {
    return err(new SimulationError('Matchup simulation failed', error));
  }
};
