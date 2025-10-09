/**
 * Legacy Report Transformer
 *
 * Transforms old report format (raw data) to new WeeklyRecapReport format (narrative).
 * Supports backwards compatibility for reports generated before RECAP-019.
 */

import type { MatchupNarrativeSection, WeeklyRecapReport } from '../types';

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
  const now = new Date().toISOString();

  // Extract all matchups
  const allMatchups = leagues.flatMap(league =>
    league.matchups.map(m => ({
      league: league.leagueName,
      leagueId: league.leagueId,
      matchup: m,
    })),
  );

  // Calculate basic stats
  const allScores = allMatchups.flatMap(m => [m.matchup.pointsA, m.matchup.pointsB]);
  const totalPoints = allScores.reduce((sum, score) => sum + score, 0);
  const averageScore = allScores.length > 0 ? totalPoints / allScores.length : 0;
  const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
  const lowestScore = allScores.length > 0 ? Math.min(...allScores) : 0;

  // Build matchup narratives from raw data
  const matchupNarratives: MatchupNarrativeSection[] = allMatchups.map(
    ({ league, leagueId, matchup }) => {
      const team1Score = matchup.pointsA;
      const team2Score = matchup.pointsB;
      const winner = team1Score > team2Score ? 'team1' : 'team2';
      const margin = Math.abs(team1Score - team2Score);

      return {
        matchupId: `${league.toLowerCase()}-${week}-${matchup.matchupId}`,
        narrative: `${matchup.teamAName} faced off against ${matchup.teamBName}, with ${winner === 'team1' ? matchup.teamAName : matchup.teamBName} winning ${Math.max(team1Score, team2Score).toFixed(1)} - ${Math.min(team1Score, team2Score).toFixed(1)}. This legacy report has limited narrative details.`,
        boxScore: {
          team1: {
            teamName: matchup.teamAName,
            rosterId: 0,
            leagueId,
            score: team1Score,
            record: '0-0', // Legacy reports don't have record data
            topPerformers: [],
          },
          team2: {
            teamName: matchup.teamBName,
            rosterId: 0,
            leagueId,
            score: team2Score,
            record: '0-0', // Legacy reports don't have record data
            topPerformers: [],
          },
          finalScore: {
            team1: team1Score,
            team2: team2Score,
          },
          winner,
          margin,
        },
        generatedAt: now,
      };
    },
  );

  // Create transformed report
  const report: WeeklyRecapReport = {
    metadata: {
      season: parseInt(season, 10),
      week,
      generatedAt: lastUpdated,
      generationTime: 0,
      tokensUsed: 0,
      status: 'success',
      version: '1.0-legacy',
      errors: [],
    },
    sections: {
      leagueOverview: {
        narrative: `Week ${week} featured ${allMatchups.length} matchups across both conferences. This is a legacy report that has been automatically transformed for display in the new format.`,
        stats: {
          totalGames: allMatchups.length,
          totalPoints,
          averageScore,
          highestScore,
          lowestScore,
          blowouts: 0,
          closeGames: 0,
        },
        generatedAt: now,
      },
      matchupNarratives,
      hallOfFame: {
        narrative:
          'Hall of Fame data is not available for legacy reports. This report was generated before the Hall of Fame section was implemented.',
        highlights: {
          topTeamScore: {
            teamName: 'N/A',
            score: highestScore,
            leagueId: '',
            rosterId: 0,
          },
          biggestBlowout: {
            winner: 'N/A',
            loser: 'N/A',
            margin: 0,
            matchupId: '',
          },
          topPerformers: {
            QB: [],
            RB: [],
            WR: [],
            TE: [],
            K: [],
            DEF: [],
          },
        },
        generatedAt: now,
      },
      hallOfShame: {
        narrative:
          'Hall of Shame data is not available for legacy reports. This report was generated before the Hall of Shame section was implemented.',
        lowlights: {
          lowestTeamScore: {
            teamName: 'N/A',
            score: lowestScore,
            leagueId: '',
            rosterId: 0,
          },
          biggestBusts: [],
          badBeatLosses: [],
        },
        generatedAt: now,
      },
      powerRankings: {
        narrative:
          'Power Rankings are not available for legacy reports. This report was generated before the Power Rankings section was implemented.',
        rankings: [],
        generatedAt: now,
      },
      standings: {
        narrative:
          'Detailed standings are not available for legacy reports. This report was generated before the Standings section was implemented.',
        standings: {
          afc: [],
          nfc: [],
        },
        playoffPicture: {
          clinched: [],
          inHunt: [],
          eliminated: [],
        },
        generatedAt: now,
      },
      upcoming: {
        narrative: 'Upcoming matchups preview is not available for legacy reports.',
        matchups: [],
        generatedAt: now,
      },
      closing: {
        narrative: `Week ${week} of the ${season} season is complete. This is a legacy report that has been automatically transformed for display in the new format. For full narrative details, please view newer reports generated with the current system.`,
        generatedAt: now,
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
