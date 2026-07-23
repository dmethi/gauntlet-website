/**
 * Team Score Sampler
 *
 * Samples team scores from historical distributions for playoff seeding simulations.
 * Uses team's weekly scoring history to build a distribution and sample from it.
 */

import { browserSleeperClient as sleeperClient } from '@/lib/sleeper/browser-client';
import { LEAGUE_IDS } from '@/lib/constants';
import type { TeamScoringDistribution } from '../types';

/**
 * Calculate mean of an array of numbers
 */
const calculateMean = (values: readonly number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Calculate standard deviation of an array of numbers
 */
const calculateStdDev = (values: readonly number[], mean: number): number => {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (values.length - 1);
  return Math.sqrt(variance);
};

/**
 * Fetch historical weekly scores for all teams in a league
 */
export const fetchTeamScoringHistory = async (
  leagueId: string,
  throughWeek: number,
): Promise<Map<number, number[]>> => {
  const teamScores = new Map<number, number[]>();

  // Fetch matchups for each week
  const weekPromises = Array.from({ length: throughWeek }, (_, i) =>
    sleeperClient.fetchMatchups(leagueId, i + 1),
  );

  const allMatchups = await Promise.all(weekPromises);

  // Process each week's matchups
  allMatchups.forEach((weekMatchups, weekIndex) => {
    if (!weekMatchups || weekMatchups.length === 0) return;

    weekMatchups.forEach(matchup => {
      const rosterId = matchup.roster_id;
      const points = matchup.points || 0;

      // Skip weeks with 0 points (bye week or not played)
      if (points === 0) return;

      if (!teamScores.has(rosterId)) {
        teamScores.set(rosterId, []);
      }
      teamScores.get(rosterId)!.push(points);
    });
  });

  return teamScores;
};

/**
 * Build scoring distributions for all teams in a league
 */
export const buildTeamScoringDistributions = async (
  leagueId: string,
  throughWeek: number,
): Promise<Map<number, TeamScoringDistribution>> => {
  const teamScores = await fetchTeamScoringHistory(leagueId, throughWeek);
  const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);
  const distributions = new Map<number, TeamScoringDistribution>();

  for (const roster of rosters) {
    const rosterId = roster.roster_id;
    const scores = teamScores.get(rosterId) || [];
    const mean = calculateMean(scores);
    const stdDev = calculateStdDev(scores, mean);

    const teamName =
      roster.owner?.metadata?.team_name || roster.owner?.display_name || `Team ${rosterId}`;

    distributions.set(rosterId, {
      rosterId,
      teamName,
      weeklyScores: scores,
      mean,
      stdDev,
      min: scores.length > 0 ? Math.min(...scores) : 0,
      max: scores.length > 0 ? Math.max(...scores) : 0,
    });
  }

  return distributions;
};

/**
 * Sample a single team score from their historical distribution
 * Uses a normal distribution based on mean and standard deviation
 */
export const sampleTeamScore = (distribution: TeamScoringDistribution): number => {
  // Box-Muller transform for normal distribution sampling
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  // Sample from normal distribution with team's mean and stdDev
  let score = distribution.mean + z * distribution.stdDev;

  // Clamp to reasonable bounds (no negative scores, cap at realistic max)
  score = Math.max(50, Math.min(score, 250));

  return score;
};

/**
 * Sample scores for all teams in a simulation iteration
 */
export const sampleAllTeamScores = (
  distributions: Map<number, TeamScoringDistribution>,
): Map<number, number> => {
  const scores = new Map<number, number>();

  for (const [rosterId, distribution] of distributions) {
    scores.set(rosterId, sampleTeamScore(distribution));
  }

  return scores;
};

/**
 * Get scoring distributions for both leagues
 */
export const fetchBothLeagueDistributions = async (
  throughWeek: number,
): Promise<{
  afc: Map<number, TeamScoringDistribution>;
  nfc: Map<number, TeamScoringDistribution>;
}> => {
  const [afcDistributions, nfcDistributions] = await Promise.all([
    buildTeamScoringDistributions(LEAGUE_IDS.AFC, throughWeek),
    buildTeamScoringDistributions(LEAGUE_IDS.NFC, throughWeek),
  ]);

  return {
    afc: afcDistributions,
    nfc: nfcDistributions,
  };
};
