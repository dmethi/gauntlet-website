/**
 * Historical Data Storage
 *
 * ONLY for time-series data that Sleeper API doesn't provide
 * All other data should be fetched from Sleeper API directly
 *
 * Models:
 * - LiveWinProbSample: Win probability changes during games
 * - MatchupOddsHistory: Matchup odds over time
 * - LeagueOddsHistory: League-wide odds snapshots
 */

// Import from the historical-only generated client
import {
  type LeagueOddsHistory,
  type LiveWinProbSample,
  type MatchupOddsHistory,
  PrismaClient,
} from '../generated/prisma-historical';

const prisma = new PrismaClient();

// ============================================================================
// WRITE OPERATIONS (used by GitHub Actions background jobs)
// ============================================================================

/**
 * Save a live win probability sample to the database
 *
 * Used by: comprehensive-live-snapshot.ts (every 10 min during games)
 *
 * @param data - Snapshot data including scores, projections, and win probabilities
 * @param data.leagueId - Sleeper league ID
 * @param data.week - NFL week number
 * @param data.matchupId - Matchup ID within the league (1-6)
 * @param data.rosterAId - First team's roster ID
 * @param data.rosterBId - Second team's roster ID
 * @param data.timestamp - Sample timestamp (defaults to now)
 * @param data.gameProgress - Game progress fraction (0.0 = start, 1.0 = complete)
 * @param data.winProbA - Team A win probability (0.0-1.0)
 * @param data.winProbB - Team B win probability (0.0-1.0)
 * @param data.projectedFinalA - Team A projected final score
 * @param data.projectedFinalB - Team B projected final score
 * @param data.currentScoreA - Team A current score
 * @param data.currentScoreB - Team B current score
 * @param data.spread - Point spread (negative = Team A favored)
 * @param data.total - Combined projected total points
 * @returns Promise resolving to created LiveWinProbSample record
 *
 * @example
 * ```typescript
 * await saveLiveWinProbSample({
 *   leagueId: '1263744209295245312',
 *   week: 4,
 *   matchupId: 1,
 *   rosterAId: 1,
 *   rosterBId: 2,
 *   gameProgress: 0.5,
 *   winProbA: 0.65,
 *   winProbB: 0.35,
 *   projectedFinalA: 125.5,
 *   projectedFinalB: 108.2,
 *   currentScoreA: 85.0,
 *   currentScoreB: 72.5,
 *   spread: -3.5,
 *   total: 233.7,
 * });
 * ```
 */
export const saveLiveWinProbSample = async (data: {
  leagueId: string;
  week: number;
  matchupId: number;
  rosterAId: number;
  rosterBId: number;
  timestamp?: Date;
  gameProgress: number;
  winProbA: number;
  winProbB: number;
  projectedFinalA: number;
  projectedFinalB: number;
  currentScoreA: number;
  currentScoreB: number;
  spread: number;
  total: number;
}): Promise<LiveWinProbSample> => {
  return prisma.liveWinProbSample.create({
    data: {
      ...data,
      timestamp: data.timestamp || new Date(),
    },
  });
};

/**
 * Save matchup odds history snapshot to the database
 *
 * Used by: Background jobs that track odds changes over time
 *
 * @param data - Matchup odds data including win percentages and betting lines
 * @param data.leagueId - Sleeper league ID
 * @param data.week - NFL week number
 * @param data.matchupId - Matchup ID within the league (1-6)
 * @param data.team1WinPct - Team 1 win probability (0.0-1.0)
 * @param data.team2WinPct - Team 2 win probability (0.0-1.0)
 * @param data.spread - Point spread (negative = Team 1 favored)
 * @param data.total - Combined projected total points
 * @param data.team1MoneyLine - Team 1 moneyline odds (American format)
 * @param data.team2MoneyLine - Team 2 moneyline odds (American format)
 * @param data.gameProgress - Game progress fraction (0.0-1.0)
 * @param data.isLive - Whether matchup is currently live (defaults to false)
 * @param data.triggeredBy - Source that triggered this snapshot (e.g., 'cron-10min')
 * @param data.computeTimeMs - Simulation compute time in milliseconds
 * @param data.team1Score - Team 1 current score (if live)
 * @param data.team2Score - Team 2 current score (if live)
 * @returns Promise resolving to created MatchupOddsHistory record
 *
 * @example
 * ```typescript
 * await saveMatchupOddsHistory({
 *   leagueId: '1263744209295245312',
 *   week: 4,
 *   matchupId: 1,
 *   team1WinPct: 0.72,
 *   team2WinPct: 0.28,
 *   spread: -5.5,
 *   total: 240.3,
 *   team1MoneyLine: -250,
 *   team2MoneyLine: +210,
 *   gameProgress: 0.35,
 *   isLive: true,
 *   triggeredBy: 'cron-10min',
 *   computeTimeMs: 4523,
 *   team1Score: 68.4,
 *   team2Score: 52.1,
 * });
 * ```
 */
export const saveMatchupOddsHistory = async (data: {
  leagueId: string;
  week: number;
  matchupId: number;
  team1WinPct: number;
  team2WinPct: number;
  spread: number;
  total: number;
  team1MoneyLine: number;
  team2MoneyLine: number;
  gameProgress: number;
  isLive?: boolean;
  triggeredBy: string;
  computeTimeMs?: number;
  team1Score?: number;
  team2Score?: number;
}): Promise<MatchupOddsHistory> => {
  return prisma.matchupOddsHistory.create({
    data: {
      ...data,
      isLive: data.isLive ?? false,
    },
  });
};

/**
 * Save league-wide odds snapshot to the database
 *
 * Used by: Background jobs that track league-wide predictions and interesting matchups
 *
 * @param data - League-wide odds data including various prediction metrics
 * @param data.week - NFL week number
 * @param data.highestScorerOdds - Odds for which team will be highest scorer
 * @param data.lowestScorerOdds - Odds for which team will be lowest scorer
 * @param data.closestMatchup - Data about the closest matchup prediction
 * @param data.biggestBlowout - Data about the biggest predicted blowout
 * @param data.highestScoringMatchup - Data about highest scoring matchup prediction
 * @param data.lowestScoringMatchup - Data about lowest scoring matchup prediction
 * @param data.isLive - Whether data represents live games (defaults to false)
 * @param data.triggeredBy - Source that triggered this snapshot (e.g., 'cron-hourly')
 * @param data.computeTimeMs - Total compute time in milliseconds
 * @returns Promise resolving to created LeagueOddsHistory record
 *
 * @example
 * ```typescript
 * await saveLeagueOddsHistory({
 *   week: 4,
 *   highestScorerOdds: { rosterId: 3, probability: 0.18, projection: 145.2 },
 *   lowestScorerOdds: { rosterId: 8, probability: 0.22, projection: 82.5 },
 *   closestMatchup: { matchupId: 2, spreadMagnitude: 1.2, winProb: 0.52 },
 *   biggestBlowout: { matchupId: 5, spreadMagnitude: 24.5, winProb: 0.94 },
 *   highestScoringMatchup: { matchupId: 1, projectedTotal: 265.8 },
 *   lowestScoringMatchup: { matchupId: 4, projectedTotal: 198.3 },
 *   isLive: false,
 *   triggeredBy: 'cron-hourly',
 *   computeTimeMs: 8245,
 * });
 * ```
 */
export const saveLeagueOddsHistory = async (data: {
  week: number;
  highestScorerOdds: any;
  lowestScorerOdds: any;
  closestMatchup: any;
  biggestBlowout: any;
  highestScoringMatchup?: any;
  lowestScoringMatchup?: any;
  isLive?: boolean;
  triggeredBy: string;
  computeTimeMs?: number;
}): Promise<LeagueOddsHistory> => {
  return prisma.leagueOddsHistory.create({
    data: {
      ...data,
      highestScoringMatchup: data.highestScoringMatchup || [],
      lowestScoringMatchup: data.lowestScoringMatchup || [],
      isLive: data.isLive ?? false,
    },
  });
};

// ============================================================================
// READ OPERATIONS (used by web app for reports and charts)
// ============================================================================

/**
 * Get the most recent win probability sample for a matchup
 *
 * Used for: Deduplication logic to avoid saving identical snapshots
 *
 * @param leagueId - Sleeper league ID
 * @param week - NFL week number
 * @param matchupId - Matchup ID within the league (1-6)
 * @returns Promise resolving to most recent sample data or null if none exists
 *
 * @example
 * ```typescript
 * const lastSample = await getLastWinProbSample('1263744209295245312', 4, 1);
 * if (lastSample) {
 *   console.log('Last win prob A:', lastSample.winProbA);
 *   console.log('Last score A:', lastSample.currentScoreA);
 * }
 * ```
 */
export const getLastWinProbSample = async (
  leagueId: string,
  week: number,
  matchupId: number
): Promise<{
  currentScoreA: number;
  currentScoreB: number;
  projectedFinalA: number;
  projectedFinalB: number;
  winProbA: number;
  winProbB: number;
  spread: number;
  total: number;
} | null> => {
  return prisma.liveWinProbSample.findFirst({
    where: { leagueId, week, matchupId },
    orderBy: { timestamp: 'desc' },
    select: {
      currentScoreA: true,
      currentScoreB: true,
      projectedFinalA: true,
      projectedFinalB: true,
      winProbA: true,
      winProbB: true,
      spread: true,
      total: true,
    },
  });
};

/**
 * Get win probability time-series for a specific matchup
 *
 * Used for: Charts showing win probability changes over time during games
 *
 * @param leagueId - Sleeper league ID
 * @param week - NFL week number
 * @param matchupId - Matchup ID within the league (1-6)
 * @returns Promise resolving to array of time-series samples ordered by timestamp
 *
 * @example
 * ```typescript
 * const timeSeries = await getMatchupWinProbTimeSeries('1263744209295245312', 4, 1);
 * timeSeries.forEach(sample => {
 *   console.log(`${sample.timestamp}: Team A ${sample.winProbA * 100}% win probability`);
 * });
 * ```
 */
export const getMatchupWinProbTimeSeries = async (
  leagueId: string,
  week: number,
  matchupId: number
): Promise<
  Array<{
    timestamp: Date;
    winProbA: number;
    winProbB: number;
    currentScoreA: number;
    currentScoreB: number;
    projectedFinalA: number;
    projectedFinalB: number;
    spread: number;
    gameProgress: number;
  }>
> => {
  return prisma.liveWinProbSample.findMany({
    where: { leagueId, week, matchupId },
    orderBy: { timestamp: 'asc' },
    select: {
      timestamp: true,
      winProbA: true,
      winProbB: true,
      currentScoreA: true,
      currentScoreB: true,
      projectedFinalA: true,
      projectedFinalB: true,
      spread: true,
      gameProgress: true,
    },
  });
};

/**
 * Get all win probability samples for a week across all matchups
 *
 * Used for: Weekly recap reports, excitement metrics, multi-matchup analysis
 *
 * @param leagueId - Sleeper league ID
 * @param week - NFL week number
 * @returns Promise resolving to array of all samples for the week, ordered by matchup and time
 *
 * @example
 * ```typescript
 * const weekSamples = await getWeekWinProbSamples('1263744209295245312', 4);
 * console.log(`Week 4 has ${weekSamples.length} total samples`);
 *
 * // Group by matchup
 * const byMatchup = weekSamples.reduce((acc, sample) => {
 *   acc[sample.matchupId] = acc[sample.matchupId] || [];
 *   acc[sample.matchupId].push(sample);
 *   return acc;
 * }, {});
 * ```
 */
export const getWeekWinProbSamples = async (
  leagueId: string,
  week: number
): Promise<LiveWinProbSample[]> => {
  return prisma.liveWinProbSample.findMany({
    where: { leagueId, week },
    orderBy: [{ matchupId: 'asc' }, { timestamp: 'asc' }],
  });
};

/**
 * Get excitement metrics for a matchup based on win probability volatility
 *
 * Used for: "Most exciting matchup" analysis and game drama quantification
 *
 * Calculates:
 * - Volatility score: Average win probability change between samples
 * - Max swing: Largest single win probability change
 * - Lead changes: Number of times the favored team switched
 * - Data quality: Assessment of sample size adequacy
 *
 * @param leagueId - Sleeper league ID
 * @param week - NFL week number
 * @param matchupId - Matchup ID within the league (1-6)
 * @returns Promise resolving to excitement metrics object or null if insufficient data
 *
 * @example
 * ```typescript
 * const metrics = await getMatchupExcitementMetrics('1263744209295245312', 4, 1);
 * if (metrics) {
 *   console.log(`Volatility score: ${metrics.volatilityScore.toFixed(1)}`);
 *   console.log(`Lead changes: ${metrics.leadChanges}`);
 *   console.log(`Max swing: ${metrics.maxSwing.toFixed(1)}%`);
 *   console.log(`Data quality: ${metrics.dataQuality}`);
 * }
 * ```
 */
export const getMatchupExcitementMetrics = async (
  leagueId: string,
  week: number,
  matchupId: number
): Promise<{
  volatilityScore: number;
  maxSwing: number;
  leadChanges: number;
  sampleCount: number;
  dataQuality: string;
} | null> => {
  const samples = await getMatchupWinProbTimeSeries(leagueId, week, matchupId);

  if (samples.length < 2) return null;

  // Calculate win prob volatility
  const winProbChanges = samples.slice(1).map((s, i) => Math.abs(s.winProbA - samples[i].winProbA));

  const avgChange = winProbChanges.reduce((a, b) => a + b, 0) / winProbChanges.length;
  const maxChange = Math.max(...winProbChanges);

  // Count lead changes
  const leadChanges = samples.filter((s, i) => {
    if (i === 0) return false;
    const prevLeader = samples[i - 1].winProbA > samples[i - 1].winProbB ? 'A' : 'B';
    const currLeader = s.winProbA > s.winProbB ? 'A' : 'B';
    return prevLeader !== currLeader;
  }).length;

  return {
    volatilityScore: avgChange * 100, // 0-50 scale
    maxSwing: maxChange * 100,
    leadChanges,
    sampleCount: samples.length,
    dataQuality: samples.length >= 10 ? 'good' : 'limited',
  };
};

/**
 * Get matchup odds history for analysis and visualization
 *
 * Used for: Showing how betting odds changed for a matchup over time
 *
 * @param leagueId - Sleeper league ID
 * @param week - NFL week number
 * @param matchupId - Matchup ID within the league (1-6)
 * @returns Promise resolving to array of odds snapshots ordered by creation time
 *
 * @example
 * ```typescript
 * const history = await getMatchupOddsHistory('1263744209295245312', 4, 1);
 * history.forEach(snapshot => {
 *   console.log(`${snapshot.createdAt}: Spread ${snapshot.spread}, Total ${snapshot.total}`);
 * });
 * ```
 */
export const getMatchupOddsHistory = async (
  leagueId: string,
  week: number,
  matchupId: number
): Promise<MatchupOddsHistory[]> => {
  return prisma.matchupOddsHistory.findMany({
    where: { leagueId, week, matchupId },
    orderBy: { createdAt: 'asc' },
  });
};

/**
 * Get league odds history for a week
 *
 * Used for: Weekly recap reports showing league-wide predictions over time
 *
 * @param week - NFL week number
 * @returns Promise resolving to array of league-wide odds snapshots ordered by creation time
 *
 * @example
 * ```typescript
 * const history = await getLeagueOddsHistory(4);
 * console.log(`Week 4 has ${history.length} league odds snapshots`);
 *
 * history.forEach(snapshot => {
 *   console.log(`${snapshot.createdAt}: Triggered by ${snapshot.triggeredBy}`);
 *   console.log('Closest matchup:', snapshot.closestMatchup);
 * });
 * ```
 */
export const getLeagueOddsHistory = async (week: number): Promise<LeagueOddsHistory[]> => {
  return prisma.leagueOddsHistory.findMany({
    where: { week },
    orderBy: { createdAt: 'asc' },
  });
};

/**
 * Get the most recent league odds snapshot for a week
 *
 * Used for: Current state of league-wide predictions and interesting matchups
 *
 * @param week - NFL week number
 * @returns Promise resolving to most recent league odds snapshot or null if none exists
 *
 * @example
 * ```typescript
 * const latest = await getLatestLeagueOdds(4);
 * if (latest) {
 *   console.log('Highest scorer odds:', latest.highestScorerOdds);
 *   console.log('Closest matchup:', latest.closestMatchup);
 *   console.log('Biggest blowout:', latest.biggestBlowout);
 * }
 * ```
 */
export const getLatestLeagueOdds = async (week: number): Promise<LeagueOddsHistory | null> => {
  return prisma.leagueOddsHistory.findFirst({
    where: { week },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Disconnect from the Prisma database client
 *
 * Used by: Scripts and jobs to cleanly close database connections before exit
 *
 * @returns Promise that resolves when disconnection is complete
 *
 * @example
 * ```typescript
 * import { saveLiveWinProbSample, disconnect } from './historical-data';
 *
 * async function main() {
 *   try {
 *     await saveLiveWinProbSample({ ... });
 *   } finally {
 *     await disconnect();
 *   }
 * }
 * ```
 */
export const disconnect = async (): Promise<void> => {
  await prisma.$disconnect();
};

// Export types for external use
export type {
  LiveWinProbSample,
  MatchupOddsHistory,
  LeagueOddsHistory,
} from '../generated/prisma-historical';
