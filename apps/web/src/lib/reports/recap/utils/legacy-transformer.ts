/**
 * Legacy Report Transformer
 *
 * Transforms old report format (raw data) to new WeeklyRecapReport format (narrative).
 * Supports backwards compatibility for reports generated before RECAP-019.
 */

import type { WeeklyRecapReport } from '../types';

interface LegacyReport {
  season: string;
  week: number;
  lastUpdated: string;
  dataSource?: string;
  leagues?: Array<{
    leagueId: string;
    leagueName: string;
    matchups: Array<{
      matchupId: number;
      teamAName: string;
      teamBName: string;
      pointsA: number;
      pointsB: number;
      [key: string]: unknown;
    }>;
  }>;
  [key: string]: unknown;
}

/**
 * Transform legacy report format to new WeeklyRecapReport format.
 * Creates a basic narrative structure from raw data.
 */
export const transformLegacyReport = (legacy: LegacyReport): WeeklyRecapReport => {
  const { season, week, lastUpdated, leagues = [] } = legacy;

  // Extract all matchups
  const allMatchups = leagues.flatMap(league =>
    league.matchups.map(m => ({
      league: league.leagueName,
      matchup: m,
    })),
  );

  // Build matchup narratives from raw data
  const matchupNarratives = allMatchups.map(({ league, matchup }) => ({
    matchupId: `${league}-${matchup.matchupId}`,
    league,
    teams: {
      team1: matchup.teamAName,
      team2: matchup.teamBName,
    },
    score: {
      team1: matchup.pointsA,
      team2: matchup.pointsB,
    },
    winner: matchup.pointsA > matchup.pointsB ? matchup.teamAName : matchup.teamBName,
    narrative: {
      headline: `${matchup.teamAName} vs ${matchup.teamBName}`,
      summary: `${matchup.pointsA > matchup.pointsB ? matchup.teamAName : matchup.teamBName} defeated ${matchup.pointsA > matchup.pointsB ? matchup.teamBName : matchup.teamAName} with a final score of ${Math.max(matchup.pointsA, matchup.pointsB).toFixed(2)} - ${Math.min(matchup.pointsA, matchup.pointsB).toFixed(2)}.`,
      keyMoments: [],
      playerSpotlight: null,
    },
  }));

  // Create transformed report
  const report: WeeklyRecapReport = {
    metadata: {
      season: parseInt(season, 10),
      week,
      generatedAt: lastUpdated,
      status: 'success',
      version: '1.0-legacy',
      dataSource: 'legacy-migration',
      errors: [],
    },
    sections: {
      leagueOverview: {
        headline: `Week ${week} Overview`,
        summary: `Legacy report from Week ${week} of the ${season} season. This report was generated using the old format and has been automatically transformed for display.`,
        stats: {
          totalGames: allMatchups.length,
          avgScore: 0,
          highestScore: Math.max(
            ...allMatchups.map(m => Math.max(m.matchup.pointsA, m.matchup.pointsB)),
          ),
          lowestScore: Math.min(
            ...allMatchups.map(m => Math.min(m.matchup.pointsA, m.matchup.pointsB)),
          ),
          blowouts: 0,
          closeGames: 0,
        },
        narrative: `Week ${week} featured ${allMatchups.length} matchups across both conferences.`,
      },
      hallOfFame: {
        winners: [],
        narrative: 'Hall of Fame data not available for legacy reports.',
      },
      hallOfShame: {
        losers: [],
        narrative: 'Hall of Shame data not available for legacy reports.',
      },
      powerRankings: {
        commentary: 'Power Rankings not available for legacy reports.',
        tiers: [],
      },
      standings: {
        commentary: 'Detailed standings not available for legacy reports.',
        conferences: [],
      },
      matchupNarratives,
      closing: {
        weekRecap: `Week ${week} of the ${season} season is complete. This is a legacy report that has been automatically transformed for display in the new format.`,
        lookAhead: null,
        finalThoughts: 'This report was generated before the narrative system was implemented.',
      },
    },
  };

  return report;
};

/**
 * Check if a report is in legacy format
 */
export const isLegacyReport = (data: unknown): data is LegacyReport => {
  if (!data || typeof data !== 'object') return false;
  const report = data as Record<string, unknown>;
  // Legacy reports have 'leagues' array and no 'metadata' or 'sections'
  return (
    typeof report.season === 'string' &&
    typeof report.week === 'number' &&
    Array.isArray(report.leagues) &&
    !report.metadata &&
    !report.sections
  );
};
