/**
 * Game Flow Tool
 *
 * Fetches and compresses live game flow data for a specific matchup.
 * Returns key narrative moments and excitement metrics.
 */

import { getMatchupWinProbTimeSeries } from '@gauntlet/server';
import type { ReportTool } from './base';
import type { CompressedGameFlow, LiveMatchupUpdate } from '../types';
import { compressGameFlow } from '../utils/compress-time-series';

interface GameFlowArgs {
  leagueId: string;
  week: number;
  matchupId: number;
}

/**
 * Fetch compressed game flow data for a matchup.
 *
 * Returns:
 * - 3-5 key narrative moments (game start, lead changes, scoring runs, swings, end)
 * - Excitement metrics (volatility, lead changes, clutch factor)
 * - Compression ratio showing data efficiency
 */
export const gameFlowTool: ReportTool<GameFlowArgs, CompressedGameFlow> = {
  name: 'fetch_game_flow',
  description:
    'Fetches compressed game flow data for a matchup, including key moments and excitement metrics. ' +
    'Use this to understand how a game unfolded over time (lead changes, scoring runs, drama). ' +
    'The data is pre-compressed to 3-5 key moments for narrative efficiency.',

  parameters: {
    type: 'object',
    properties: {
      leagueId: {
        type: 'string',
        description: 'Sleeper league ID (AFC: 1263744209295245312, NFC: 1263740549504962561)',
      },
      week: {
        type: 'number',
        description: 'NFL week number (1-18)',
      },
      matchupId: {
        type: 'number',
        description: 'Matchup ID within the league (1-6)',
      },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },

  execute: async (args: GameFlowArgs): Promise<CompressedGameFlow> => {
    const { leagueId, week, matchupId } = args;

    // Fetch raw time series from database
    const rawSamples = await getMatchupWinProbTimeSeries(leagueId, week, matchupId);

    // Handle no data case
    if (rawSamples.length === 0) {
      return {
        matchupId: `${leagueId}-${week}-${matchupId}`,
        leagueId,
        week,
        keyMoments: [],
        excitement: {
          leadChanges: 0,
          maxComeback: 0,
          volatility: 0,
          maxSwing: 0,
          clutchFactor: 0,
          totalSamples: 0,
        },
        compressionRatio: '0 → 0 points (no data)',
        finalScore: {
          teamA: 0,
          teamB: 0,
        },
      };
    }

    // Transform database samples to our interface
    const samples: LiveMatchupUpdate[] = rawSamples.map(s => ({
      timestamp: s.timestamp,
      week,
      matchupId,
      leagueId,
      rosterAId: 0, // Not in the fetched data, but not needed for compression
      rosterBId: 0,
      gameProgress: s.gameProgress,
      winProbA: s.winProbA,
      winProbB: s.winProbB,
      currentScoreA: s.currentScoreA,
      currentScoreB: s.currentScoreB,
      projectedFinalA: s.projectedFinalA,
      projectedFinalB: s.projectedFinalB,
      spread: s.spread,
      total: 0, // Not in the fetched data
    }));

    // Compress and return
    return compressGameFlow(samples, leagueId, week, matchupId);
  },
};
