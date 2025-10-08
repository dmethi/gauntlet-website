import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import { getRealNameByRoster } from '@/lib/username-mapping';
import type { ReportTool } from './base';
import type { PowerRanking, RankingChange } from '../types';
import type { SleeperMatchup } from '@gauntlet/types';

/**
 * Power Rankings Tool
 * Fetches current and previous week rankings with movement tracking.
 */

interface PowerRankingsArgs {
  currentWeek: number;
}

interface PowerRankingsResult {
  currentWeek: number;
  rankings: PowerRanking[];
  changes: RankingChange;
}

/**
 * Calculates power rankings for a given week based on record and points.
 * In production, this would fetch from a dedicated power rankings system.
 * For now, we use a simple algorithm: sort by points for, which correlates with record.
 */
const calculateRankings = async (week: number): Promise<PowerRanking[]> => {
  // Fetch all matchups up to the given week for both leagues
  const [afcMatchups, nfcMatchups, afcRosters, nfcRosters] = await Promise.all([
    Promise.all(Array.from({ length: week }, (_, i) => sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, i + 1))),
    Promise.all(Array.from({ length: week }, (_, i) => sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, i + 1))),
    sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.AFC),
    sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.NFC),
  ]);

  /**
   * Calculate team stats across all weeks.
   */
  const calculateTeamStats = (rosterId: number, matchups: SleeperMatchup[][]) => {
    let wins = 0;
    let losses = 0;
    let pointsFor = 0;

    matchups.forEach(weekMatchups => {
      const team = weekMatchups.find(m => m.roster_id === rosterId);
      if (!team) return;

      const opponent = weekMatchups.find(
        m => m.matchup_id === team.matchup_id && m.roster_id !== rosterId
      );
      if (!opponent) return;

      const teamScore = team.points || 0;
      const oppScore = opponent.points || 0;

      pointsFor += teamScore;

      if (teamScore > oppScore) wins++;
      else if (oppScore > teamScore) losses++;
    });

    return { wins, losses, pointsFor, winPct: wins / (wins + losses || 1) };
  };

  const rankings: PowerRanking[] = [];

  // Process AFC teams
  afcRosters.forEach(roster => {
    const stats = calculateTeamStats(roster.roster_id, afcMatchups);
    const ownerName =
      getRealNameByRoster(LEAGUE_IDS.AFC, roster.roster_id) ||
      roster.metadata?.owner_name ||
      'Unknown';

    rankings.push({
      rank: 0, // Will be set after sorting
      previousRank: 0, // Will be set when comparing weeks
      movement: 0,
      rosterId: roster.roster_id,
      leagueId: LEAGUE_IDS.AFC,
      teamName: roster.metadata?.team_name || `Team ${roster.roster_id}`,
      ownerName,
      record: `${stats.wins}-${stats.losses}`,
      pointsFor: Math.round(stats.pointsFor * 100) / 100,
      league: 'AFC',
    });
  });

  // Process NFC teams
  nfcRosters.forEach(roster => {
    const stats = calculateTeamStats(roster.roster_id, nfcMatchups);
    const ownerName =
      getRealNameByRoster(LEAGUE_IDS.NFC, roster.roster_id) ||
      roster.metadata?.owner_name ||
      'Unknown';

    rankings.push({
      rank: 0,
      previousRank: 0,
      movement: 0,
      rosterId: roster.roster_id,
      leagueId: LEAGUE_IDS.NFC,
      teamName: roster.metadata?.team_name || `Team ${roster.roster_id}`,
      ownerName,
      record: `${stats.wins}-${stats.losses}`,
      pointsFor: Math.round(stats.pointsFor * 100) / 100,
      league: 'NFC',
    });
  });

  // Sort by points for (simple power ranking algorithm)
  rankings.sort((a, b) => b.pointsFor - a.pointsFor);

  // Assign ranks
  rankings.forEach((ranking, i) => {
    ranking.rank = i + 1;
  });

  return rankings;
};

/**
 * Tool: Fetches power rankings with movement tracking.
 */
export const fetchPowerRankingsTool: ReportTool<PowerRankingsArgs, PowerRankingsResult> = {
  name: 'fetch_power_rankings',
  description: 'Fetches current and previous week power rankings with movement tracking',

  parameters: {
    type: 'object',
    properties: {
      currentWeek: {
        type: 'number',
        description: 'Current NFL week (1-18)',
      },
    },
    required: ['currentWeek'],
  },

  execute: async (args: PowerRankingsArgs): Promise<PowerRankingsResult> => {
    // Calculate current and previous week rankings
    const [currentRankings, previousRankings] = await Promise.all([
      calculateRankings(args.currentWeek),
      args.currentWeek > 1 ? calculateRankings(args.currentWeek - 1) : Promise.resolve([]),
    ]);

    // Calculate movement
    if (previousRankings.length > 0) {
      currentRankings.forEach(current => {
        const previous = previousRankings.find(
          p => p.leagueId === current.leagueId && p.rosterId === current.rosterId
        );
        if (previous) {
          current.previousRank = previous.rank;
          current.movement = previous.rank - current.rank; // Positive = moved up
        } else {
          current.previousRank = current.rank;
          current.movement = 0;
        }
      });
    } else {
      // First week, no movement
      currentRankings.forEach(ranking => {
        ranking.previousRank = ranking.rank;
        ranking.movement = 0;
      });
    }

    // Identify notable changes
    const biggestRiser = currentRankings
      .filter(r => r.movement > 0)
      .sort((a, b) => b.movement - a.movement)[0] || null;

    const biggestFaller = currentRankings
      .filter(r => r.movement < 0)
      .sort((a, b) => a.movement - b.movement)[0] || null;

    const topThree = currentRankings.slice(0, 3);

    const notableChanges = currentRankings.filter(r => Math.abs(r.movement) >= 3);

    const changes: RankingChange = {
      biggestRiser,
      biggestFaller,
      topThree,
      notableChanges,
    };

    return {
      currentWeek: args.currentWeek,
      rankings: currentRankings,
      changes,
    };
  },
};

