import type { ReportTool } from '../base';

/**
 * Example tool: Fetch basic league statistics.
 * This is a template for how all data-fetching tools should be structured.
 */

interface LeagueStatsArgs {
  week: number;
  season: number;
}

interface LeagueStatsResult {
  totalGames: number;
  totalPoints: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export const leagueStatsTool: ReportTool<LeagueStatsArgs, LeagueStatsResult> = {
  name: 'fetch_league_stats',
  description: 'Fetches basic statistics about the league for a given week',

  parameters: {
    type: 'object',
    properties: {
      week: {
        type: 'number',
        description: 'NFL week number',
      },
      season: {
        type: 'number',
        description: 'NFL season year',
      },
    },
    required: ['week', 'season'],
  },

  execute: async (args: LeagueStatsArgs): Promise<LeagueStatsResult> => {
    // TODO: Replace with actual data fetching from Sleeper API
    // For now, return mock data for testing

    // eslint-disable-next-line no-console
    console.log(`[LEAGUE STATS] Fetching data for Week ${args.week}, ${args.season}`);

    // Simulate API delay
    await new Promise(resolve => {
      // eslint-disable-next-line no-undef
      setTimeout(resolve, 100);
    });

    // Mock data
    return {
      totalGames: 12,
      totalPoints: 1842.5,
      averageScore: 153.5,
      highestScore: 187.3,
      lowestScore: 98.2,
    };
  },
};
