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
import { PrismaClient } from '../generated/prisma-historical';

const prisma = new PrismaClient();

// ============================================================================
// WRITE OPERATIONS (used by GitHub Actions background jobs)
// ============================================================================

/**
 * Save a live win probability sample
 * Used by: comprehensive-live-snapshot.ts (every 10 min during games)
 */
export async function saveLiveWinProbSample(data: {
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
}) {
  return prisma.liveWinProbSample.create({
    data: {
      ...data,
      timestamp: data.timestamp || new Date(),
    },
  });
}

/**
 * Save matchup odds history
 * Used by: Background jobs that track odds changes
 */
export async function saveMatchupOddsHistory(data: {
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
}) {
  return prisma.matchupOddsHistory.create({
    data: {
      ...data,
      isLive: data.isLive ?? false,
    },
  });
}

/**
 * Save league-wide odds snapshot
 * Used by: Background jobs that track league-wide predictions
 */
export async function saveLeagueOddsHistory(data: {
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
}) {
  return prisma.leagueOddsHistory.create({
    data: {
      ...data,
      highestScoringMatchup: data.highestScoringMatchup || [],
      lowestScoringMatchup: data.lowestScoringMatchup || [],
      isLive: data.isLive ?? false,
    },
  });
}

// ============================================================================
// READ OPERATIONS (used by web app for reports and charts)
// ============================================================================

/**
 * Get the most recent win probability sample for a matchup
 * Used for: Deduplication logic to avoid saving identical snapshots
 */
export async function getLastWinProbSample(leagueId: string, week: number, matchupId: number) {
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
}

/**
 * Get win probability time-series for a specific matchup
 * Used for: Charts showing win probability changes over time
 */
export async function getMatchupWinProbTimeSeries(
  leagueId: string,
  week: number,
  matchupId: number
) {
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
}

/**
 * Get all win probability samples for a week (across all matchups)
 * Used for: Weekly recap reports, excitement metrics
 */
export async function getWeekWinProbSamples(leagueId: string, week: number) {
  return prisma.liveWinProbSample.findMany({
    where: { leagueId, week },
    orderBy: [{ matchupId: 'asc' }, { timestamp: 'asc' }],
  });
}

/**
 * Get excitement metrics for a matchup (volatility of win prob over time)
 * Used for: "Most exciting matchup" analysis
 */
export async function getMatchupExcitementMetrics(
  leagueId: string,
  week: number,
  matchupId: number
) {
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
}

/**
 * Get matchup odds history for analysis
 * Used for: Showing how odds changed for a matchup
 */
export async function getMatchupOddsHistory(leagueId: string, week: number, matchupId: number) {
  return prisma.matchupOddsHistory.findMany({
    where: { leagueId, week, matchupId },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Get league odds history for a week
 * Used for: Weekly recap - showing league-wide predictions
 */
export async function getLeagueOddsHistory(week: number) {
  return prisma.leagueOddsHistory.findMany({
    where: { week },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Get latest league odds for a week
 * Used for: Current state of league-wide predictions
 */
export async function getLatestLeagueOdds(week: number) {
  return prisma.leagueOddsHistory.findFirst({
    where: { week },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Disconnect from database
 * Used by: Scripts to cleanly close connection
 */
export async function disconnect() {
  await prisma.$disconnect();
}

// Export types for external use
export type {
  LiveWinProbSample,
  MatchupOddsHistory,
  LeagueOddsHistory,
} from '../generated/prisma-historical';
