import { sleeperClient } from '@/lib/sleeper/unified-client';
import type { SleeperMatchup } from '@gauntlet/types';
import { LEAGUE_IDS } from '@/lib/constants';
import type { ReportTool } from './base';

/**
 * League Overview Tools
 * Tools for generating the opening section of weekly recap reports.
 */

interface LeagueDataArgs {
  week: number;
}

interface LeagueDataResult {
  season: string;
  week: number;
  leagues: Array<{
    id: string;
    name: string;
    totalRosters: number;
  }>;
  totalTeams: number;
}

interface WeekStatsArgs {
  week: number;
}

interface WeekStatsResult {
  totalPoints: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalMatchups: number;
  closeGames: number;
  blowouts: number;
  competitiveRatio: number;
}

/**
 * Fetches basic league information for both AFC and NFC leagues.
 */
export const fetchLeagueDataTool: ReportTool<LeagueDataArgs, LeagueDataResult> = {
  name: 'fetch_league_data',
  description: 'Fetches basic league information for the specified week',

  parameters: {
    type: 'object',
    properties: {
      week: {
        type: 'number',
        description: 'NFL week number (1-18)',
      },
    },
    required: ['week'],
  },

  execute: async (args: LeagueDataArgs): Promise<LeagueDataResult> => {
    // Fetch league info for both AFC and NFC
    const [afcLeague, nfcLeague] = await Promise.all([
      sleeperClient.fetchLeague(LEAGUE_IDS.AFC),
      sleeperClient.fetchLeague(LEAGUE_IDS.NFC),
    ]);

    return {
      season: afcLeague.season,
      week: args.week,
      leagues: [
        {
          id: LEAGUE_IDS.AFC,
          name: afcLeague.name,
          totalRosters: afcLeague.total_rosters,
        },
        {
          id: LEAGUE_IDS.NFC,
          name: nfcLeague.name,
          totalRosters: nfcLeague.total_rosters,
        },
      ],
      totalTeams: afcLeague.total_rosters + nfcLeague.total_rosters,
    };
  },
};

/**
 * Calculates aggregate statistics for the week across all matchups.
 * Processes AFC and NFC leagues separately, then combines results.
 */
export const calculateWeekSummaryStatsTool: ReportTool<WeekStatsArgs, WeekStatsResult> = {
  name: 'calculate_week_summary_stats',
  description: 'Calculates aggregate statistics for the week across all matchups',

  parameters: {
    type: 'object',
    properties: {
      week: {
        type: 'number',
        description: 'NFL week number (1-18)',
      },
    },
    required: ['week'],
  },

  execute: async (args: WeekStatsArgs): Promise<WeekStatsResult> => {
    // Fetch matchups for both leagues
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    // Extract all scores from both leagues
    const allScores = [...afcMatchups, ...nfcMatchups]
      .map(m => m.points)
      .filter((p): p is number => p !== null && p !== undefined);

    const totalPoints = allScores.reduce((sum, p) => sum + p, 0);
    const avgScore = totalPoints / allScores.length;
    const highestScore = Math.max(...allScores);
    const lowestScore = Math.min(...allScores);

    // Calculate matchup score differentials
    // Process each league separately to avoid multi-league ID conflicts
    const getMatchupDiffs = (matchups: SleeperMatchup[]): number[] => {
      const diffs: number[] = [];
      const processed = new Set<number>();

      matchups.forEach((matchup, idx) => {
        if (!matchup.matchup_id || processed.has(matchup.matchup_id)) {
          return;
        }

        const opponent = matchups.find(
          (m, i) =>
            i !== idx &&
            m.matchup_id === matchup.matchup_id &&
            m.points !== null &&
            matchup.points !== null,
        );

        if (opponent && matchup.points && opponent.points) {
          diffs.push(Math.abs(matchup.points - opponent.points));
          processed.add(matchup.matchup_id);
        }
      });

      return diffs;
    };

    const afcDiffs = getMatchupDiffs(afcMatchups);
    const nfcDiffs = getMatchupDiffs(nfcMatchups);
    const allDiffs = [...afcDiffs, ...nfcDiffs];

    const closeGames = allDiffs.filter(d => d <= 10).length;
    const blowouts = allDiffs.filter(d => d >= 30).length;

    return {
      totalPoints: Math.round(totalPoints * 100) / 100,
      averageScore: Math.round(avgScore * 100) / 100,
      highestScore: Math.round(highestScore * 100) / 100,
      lowestScore: Math.round(lowestScore * 100) / 100,
      totalMatchups: allDiffs.length,
      closeGames,
      blowouts,
      competitiveRatio: Math.round((closeGames / allDiffs.length) * 100),
    };
  },
};
