import { sleeperClient } from '@/lib/sleeper/unified-client';
import { getCurrentLeagues, getLeagueConfig } from '@/config/leagues';
import { getRealNameByRoster } from '@/lib/username-mapping';
import type { ReportTool } from './base';
import type { SleeperMatchup } from '@gauntlet/types';
import { calculateHallOfFameRecords } from '@/features/hall-of-fame/utils/calculations';
import { getAllCategories } from '@/features/hall-of-fame/utils/categories-expanded';
import type { HallOfFameRecord, ProcessedMatchup } from '@/features/hall-of-fame/types';

/**
 * Enhanced Hall of Fame Tools
 * Uses the complete Hall of Fame category system to check Week N performances
 * against ALL historical categories (50+ categories)
 */

interface PlayerOwnership {
  league: string;
  manager: string;
  teamName: string;
  status: 'started' | 'benched' | 'free_agent';
}

interface TopPerformer {
  rank: number;
  playerName: string;
  playerId: string;
  points: number;
  ownership: PlayerOwnership[];
}

interface TopPositionPerformersResult {
  [position: string]: TopPerformer[];
}

interface RecordBreakdownResult {
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  group: string; // 'weekly_team' or 'weekly_matchup'
  type: 'highest' | 'lowest' | 'both';
  weekRank: number; // Where this week's performance ranks all-time
  weekValue: number;
  isRecord: boolean; // #1 all-time
  isTopTen: boolean; // Top 10 all-time
  teamName: string; // Single team or "Team A vs Team B" for matchup records
  manager: string;
  league: string;
  topRecords: HallOfFameRecord[]; // Top 5 all-time for context
  isMatchupRecord?: boolean; // True if this is a matchup-level record (both teams)
}

/**
 * Helper: Convert Sleeper matchup to ProcessedMatchup format
 */
const convertToProcessedMatchup = async (
  matchup: SleeperMatchup,
  leagueId: string,
  week: number,
  allMatchups: SleeperMatchup[],
): Promise<ProcessedMatchup> => {
  const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);
  const roster = rosters.find(r => r.roster_id === matchup.roster_id);
  const players = await sleeperClient.fetchAllPlayers();

  // Find opponent
  const opponent = allMatchups.find(
    m => m.matchup_id === matchup.matchup_id && m.roster_id !== matchup.roster_id,
  );
  const opponentRoster = opponent
    ? rosters.find(r => r.roster_id === opponent.roster_id)
    : undefined;

  // Build player data map
  const playerDataMap = new Map();
  (matchup.players || []).forEach(playerId => {
    const player = players[playerId];
    if (player) {
      playerDataMap.set(playerId, player);
    }
  });

  const ownerName =
    getRealNameByRoster(leagueId, matchup.roster_id) || roster?.owner?.display_name || 'Unknown';
  const teamName = roster?.owner?.metadata?.team_name || ownerName;

  return {
    rosterId: matchup.roster_id,
    teamName,
    leagueId,
    leagueName: getLeagueConfig(leagueId)?.conference || 'AFC',
    week,
    season: '2025',
    points: matchup.points || 0,
    projectedPoints: undefined, // Would need to fetch from projections API
    opponentId: opponent?.roster_id,
    opponentName: opponentRoster?.owner?.metadata?.team_name || undefined,
    opponentPoints: opponent?.points,
    won: opponent ? (matchup.points || 0) > (opponent.points || 0) : undefined,
    starters: matchup.starters || [],
    starters_points: matchup.starters_points || [],
    players: matchup.players || [],
    players_points: matchup.players_points || {},
    playerData: playerDataMap,
    matchupId: matchup.matchup_id,
    isPlayoff: false,
  };
};

/**
 * Helper: Check player ownership status in a league FOR A SPECIFIC WEEK
 * Uses matchup data to determine ownership at that point in time
 */
const checkPlayerOwnership = async (
  playerId: string,
  leagueId: string,
  week: number,
): Promise<PlayerOwnership | null> => {
  try {
    const matchups = await sleeperClient.fetchMatchups(leagueId, week);
    const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);

    // Find which matchup (roster) had this player in Week N
    // Check both starters and bench (players array)
    const owningMatchup = matchups.find(
      m => m.starters?.includes(playerId) || m.players?.includes(playerId),
    );

    if (!owningMatchup) {
      return {
        league: getLeagueConfig(leagueId)?.conference || 'AFC',
        manager: 'Waiver',
        teamName: 'Free Agent',
        status: 'free_agent',
      };
    }

    // Get roster info for display names
    const roster = rosters.find(r => r.roster_id === owningMatchup.roster_id);
    const wasStarted = owningMatchup.starters?.includes(playerId) || false;

    const manager =
      getRealNameByRoster(leagueId, owningMatchup.roster_id) ||
      roster?.owner?.display_name ||
      'Unknown';

    return {
      league: getLeagueConfig(leagueId)?.conference || 'AFC',
      manager,
      teamName: roster?.owner?.metadata?.team_name || manager,
      status: wasStarted ? 'started' : 'benched',
    };
  } catch (error) {
    console.error(`Error checking ownership for ${playerId} in ${leagueId}:`, error);
    return null;
  }
};

/**
 * Helper: Get ownership in both leagues
 */
const getPlayerOwnershipBothLeagues = async (
  playerId: string,
  week: number,
): Promise<PlayerOwnership[]> => {
  const ownerships = await Promise.all(
    getCurrentLeagues().map(league => checkPlayerOwnership(playerId, league.id, week)),
  );

  return ownerships.filter((o): o is PlayerOwnership => o !== null);
};

/**
 * Tool: Check Historical Records (ALL Categories)
 * Runs Week N through the complete Hall of Fame system
 * Returns all categories where this week appears in top 10
 */
export const checkAllHistoricalRecordsTool: ReportTool<
  { week: number },
  {
    recordBreakdowns: RecordBreakdownResult[];
    totalCategories: number;
    categoriesWithWeekN: number;
  }
> = {
  name: 'check_all_historical_records',
  description: 'Runs week through complete Hall of Fame system to check against ALL 50+ categories',

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

  execute: async (args: { week: number }) => {
    const leagues = getCurrentLeagues();

    // Fetch Week N matchups for every registered league
    const matchupsByLeague = await Promise.all(
      leagues.map(league => sleeperClient.fetchMatchups(league.id, args.week)),
    );

    // Convert to ProcessedMatchup format
    const weekMatchups: ProcessedMatchup[] = [];

    for (const [i, league] of leagues.entries()) {
      const leagueMatchups = matchupsByLeague[i];
      for (const matchup of leagueMatchups) {
        const processed = await convertToProcessedMatchup(
          matchup,
          league.id,
          args.week,
          leagueMatchups,
        );
        weekMatchups.push(processed);
      }
    }

    // Get all categories (50+ categories)
    const allCategories = getAllCategories();

    // Calculate records for this week only
    const weekRecords = calculateHallOfFameRecords(weekMatchups, allCategories);

    // Fetch ALL historical matchups to get complete rankings
    // This is expensive but necessary for accurate ranking
    const { hallOfFameDataService } = await import(
      '@/features/hall-of-fame/hooks/useHallOfFameData'
    );
    const allHistoricalMatchups = await hallOfFameDataService.getAllHistoricalMatchups(true);

    // Calculate all-time records
    const allTimeRecords = calculateHallOfFameRecords(allHistoricalMatchups, allCategories);

    // Find categories where Week N appears in top 10
    const recordBreakdowns: RecordBreakdownResult[] = [];

    allCategories.forEach(category => {
      const allTimeRanking = allTimeRecords.get(category.id) || [];
      const weekPerformance = weekRecords.get(category.id) || [];

      // Check if any Week N performance is in top 10 all-time
      weekPerformance.forEach(weekRecord => {
        const rank = allTimeRanking.findIndex(
          r =>
            r.teamId === weekRecord.teamId &&
            r.leagueId === weekRecord.leagueId &&
            r.week === args.week,
        );

        if (rank !== -1 && rank < 10) {
          // This week's performance is in top 10!

          // For matchup-level records, we need to show both teams
          const isMatchupRecord = category.group === 'weekly_matchup';
          let displayName: string;

          if (isMatchupRecord && weekRecord.contextData?.bothTeams) {
            // Get both team names for matchup records
            const teamA = weekRecord.contextData.bothTeams.teamA;
            const teamB = weekRecord.contextData.bothTeams.teamB;

            const teamAName = getRealNameByRoster(weekRecord.leagueId, teamA.id) || teamA.name;
            const teamBName = getRealNameByRoster(weekRecord.leagueId, teamB.id) || teamB.name;

            displayName = `${teamAName} vs ${teamBName}`;
          } else {
            // Single team record - use manager name
            displayName =
              getRealNameByRoster(weekRecord.leagueId, weekRecord.teamId) || weekRecord.teamName;
          }

          recordBreakdowns.push({
            categoryId: category.id,
            categoryName: category.name,
            categoryDescription: category.description,
            group: category.group, // 'weekly_team' or 'weekly_matchup'
            type: category.type,
            weekRank: rank + 1, // Convert to 1-indexed
            weekValue: weekRecord.value,
            isRecord: rank === 0,
            isTopTen: rank < 10,
            teamName: displayName, // Team name or "Team A vs Team B" for matchups
            manager: displayName,
            league: weekRecord.leagueName,
            topRecords: allTimeRanking.slice(0, 5), // Top 5 for context
            isMatchupRecord, // Flag to help UI know it's a matchup record
          });
        }
      });
    });

    // Sort by rank (best first)
    recordBreakdowns.sort((a, b) => a.weekRank - b.weekRank);

    return {
      recordBreakdowns,
      totalCategories: allCategories.length,
      categoriesWithWeekN: recordBreakdowns.length,
    };
  },
};

/**
 * Tool: Top 5 Position Performers (Enhanced)
 * Returns top 5 players at each position with ownership in both leagues
 */
export const calculateTopPositionPerformersEnhanced: ReportTool<
  { week: number },
  TopPositionPerformersResult
> = {
  name: 'calculate_top_position_performers',
  description: 'Finds top 5 players at each position with ownership details in both leagues',

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

  execute: async (args: { week: number }): Promise<TopPositionPerformersResult> => {
    const matchupsByLeague = await Promise.all(
      getCurrentLeagues().map(league => sleeperClient.fetchMatchups(league.id, args.week)),
    );

    const allMatchups = matchupsByLeague.flat();
    const players = await sleeperClient.fetchAllPlayers();

    // Collect all unique player performances (deduplicate by player ID)
    const performanceMap = new Map<
      string,
      {
        playerId: string;
        name: string;
        position: string;
        points: number;
      }
    >();

    allMatchups.forEach(matchup => {
      (matchup.players || []).forEach((playerId: string) => {
        const player = players[playerId];
        if (!player) return;

        const points = matchup.players_points?.[playerId] || 0;
        const existing = performanceMap.get(playerId);

        // Keep the highest scoring instance if player appears multiple times
        if (!existing || points > existing.points) {
          performanceMap.set(playerId, {
            playerId,
            name: `${player.first_name} ${player.last_name}`,
            position: player.position,
            points,
          });
        }
      });
    });

    const performances = Array.from(performanceMap.values());

    // Get top 5 at each position
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    const result: TopPositionPerformersResult = {};

    for (const position of positions) {
      const positionPerformances = performances
        .filter(p => p.position === position)
        .sort((a, b) => b.points - a.points)
        .slice(0, 5); // Top 5

      if (positionPerformances.length === 0) {
        result[position] = [];
        continue;
      }

      // Get ownership for each player in both leagues
      const topPerformers: TopPerformer[] = [];

      for (let i = 0; i < positionPerformances.length; i++) {
        const perf = positionPerformances[i];
        const ownership = await getPlayerOwnershipBothLeagues(perf.playerId, args.week);

        topPerformers.push({
          rank: i + 1,
          playerName: perf.name,
          playerId: perf.playerId,
          points: Math.round(perf.points * 100) / 100,
          ownership,
        });
      }

      result[position] = topPerformers;
    }

    return result;
  },
};
