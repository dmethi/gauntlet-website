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
    };
  },
};

/**
 * Notable matchup details for narrative highlights
 */
interface NotableMatchup {
  leagueName: string;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  margin: number;
  winnerName: string;
  description: string;
}

interface WeekHighlightsArgs {
  week: number;
}

interface WeekHighlightsResult {
  closestGame: NotableMatchup;
  biggestBlowout: NotableMatchup;
  highestScoringMatchup: NotableMatchup;
  lowestScoringMatchup: NotableMatchup;
}

/**
 * Fetches specific matchup highlights for narrative storytelling.
 * Returns the closest game, biggest blowout, and highest/lowest scoring matchups.
 */
export const fetchWeekHighlightsTool: ReportTool<WeekHighlightsArgs, WeekHighlightsResult> = {
  name: 'fetch_week_highlights',
  description:
    'Fetches notable matchup highlights including closest game, biggest blowout, highest and lowest scoring matchups',

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

  execute: async (args: WeekHighlightsArgs): Promise<WeekHighlightsResult> => {
    // Fetch matchups, rosters, and leagues for both AFC and NFC
    const [afcMatchups, afcLeague, afcRosters, nfcMatchups, nfcLeague, nfcRosters] =
      await Promise.all([
        sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
        sleeperClient.fetchLeague(LEAGUE_IDS.AFC),
        sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.AFC),
        sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
        sleeperClient.fetchLeague(LEAGUE_IDS.NFC),
        sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.NFC),
      ]);

    // Build roster ID to team name mapping
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buildTeamNameMap = (rosters: any[]): Map<number, string> => {
      const map = new Map<number, string>();
      rosters.forEach(roster => {
        // Use team name if available, otherwise use owner's display name
        const teamName =
          roster.metadata?.team_name || roster.owner?.display_name || `Team ${roster.roster_id}`;
        map.set(roster.roster_id, teamName);
      });
      return map;
    };

    const afcTeamNames = buildTeamNameMap(afcRosters);
    const nfcTeamNames = buildTeamNameMap(nfcRosters);

    // Process each league to get matchup pairs with team names
    const processLeagueMatchups = (
      matchups: SleeperMatchup[],
      leagueName: string,
      teamNames: Map<number, string>,
    ): Array<{
      leagueName: string;
      team1Name: string;
      team2Name: string;
      team1Score: number;
      team2Score: number;
      margin: number;
      totalScore: number;
      winnerName: string;
    }> => {
      const pairs: Array<{
        leagueName: string;
        team1Name: string;
        team2Name: string;
        team1Score: number;
        team2Score: number;
        margin: number;
        totalScore: number;
        winnerName: string;
      }> = [];
      const processed = new Set<number>();

      matchups.forEach(matchup => {
        if (!matchup.matchup_id || processed.has(matchup.matchup_id) || matchup.points === null) {
          return;
        }

        const opponent = matchups.find(
          m =>
            m.matchup_id === matchup.matchup_id &&
            m.roster_id !== matchup.roster_id &&
            m.points !== null,
        );

        if (opponent && opponent.points !== null) {
          const team1Name = teamNames.get(matchup.roster_id) || `Team ${matchup.roster_id}`;
          const team2Name = teamNames.get(opponent.roster_id) || `Team ${opponent.roster_id}`;
          const winnerName = matchup.points > opponent.points ? team1Name : team2Name;

          pairs.push({
            leagueName,
            team1Name,
            team2Name,
            team1Score: matchup.points,
            team2Score: opponent.points,
            margin: Math.abs(matchup.points - opponent.points),
            totalScore: matchup.points + opponent.points,
            winnerName,
          });
          processed.add(matchup.matchup_id);
        }
      });

      return pairs;
    };

    const afcPairs = processLeagueMatchups(afcMatchups, afcLeague.name, afcTeamNames);
    const nfcPairs = processLeagueMatchups(nfcMatchups, nfcLeague.name, nfcTeamNames);
    const allPairs = [...afcPairs, ...nfcPairs];

    // Find notable matchups
    const closestGame = allPairs.reduce((min, pair) => (pair.margin < min.margin ? pair : min));
    const biggestBlowout = allPairs.reduce((max, pair) => (pair.margin > max.margin ? pair : max));
    const highestScoringMatchup = allPairs.reduce((max, pair) =>
      pair.totalScore > max.totalScore ? pair : max,
    );
    const lowestScoringMatchup = allPairs.reduce((min, pair) =>
      pair.totalScore < min.totalScore ? pair : min,
    );

    return {
      closestGame: {
        leagueName: closestGame.leagueName,
        team1Name: closestGame.team1Name,
        team2Name: closestGame.team2Name,
        team1Score: Math.round(closestGame.team1Score * 100) / 100,
        team2Score: Math.round(closestGame.team2Score * 100) / 100,
        margin: Math.round(closestGame.margin * 100) / 100,
        winnerName: closestGame.winnerName,
        description: `${closestGame.team1Name} vs ${closestGame.team2Name}`,
      },
      biggestBlowout: {
        leagueName: biggestBlowout.leagueName,
        team1Name: biggestBlowout.team1Name,
        team2Name: biggestBlowout.team2Name,
        team1Score: Math.round(biggestBlowout.team1Score * 100) / 100,
        team2Score: Math.round(biggestBlowout.team2Score * 100) / 100,
        margin: Math.round(biggestBlowout.margin * 100) / 100,
        winnerName: biggestBlowout.winnerName,
        description: `${biggestBlowout.team1Name} vs ${biggestBlowout.team2Name}`,
      },
      highestScoringMatchup: {
        leagueName: highestScoringMatchup.leagueName,
        team1Name: highestScoringMatchup.team1Name,
        team2Name: highestScoringMatchup.team2Name,
        team1Score: Math.round(highestScoringMatchup.team1Score * 100) / 100,
        team2Score: Math.round(highestScoringMatchup.team2Score * 100) / 100,
        margin: Math.round(highestScoringMatchup.margin * 100) / 100,
        winnerName: highestScoringMatchup.winnerName,
        description: `${highestScoringMatchup.team1Name} vs ${highestScoringMatchup.team2Name}`,
      },
      lowestScoringMatchup: {
        leagueName: lowestScoringMatchup.leagueName,
        team1Name: lowestScoringMatchup.team1Name,
        team2Name: lowestScoringMatchup.team2Name,
        team1Score: Math.round(lowestScoringMatchup.team1Score * 100) / 100,
        team2Score: Math.round(lowestScoringMatchup.team2Score * 100) / 100,
        margin: Math.round(lowestScoringMatchup.margin * 100) / 100,
        winnerName: lowestScoringMatchup.winnerName,
        description: `${lowestScoringMatchup.team1Name} vs ${lowestScoringMatchup.team2Name}`,
      },
    };
  },
};
