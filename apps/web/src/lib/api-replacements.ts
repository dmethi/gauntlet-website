/**
 * Drop-in replacements for all Prisma database calls
 * These use Sleeper API + static data instead of database
 */

import { sleeperClient } from './sleeper/unified-client';
import { ALL_LEAGUES, getCurrentLeagues, getLeagueConfig } from '@/config/leagues';
import { debugLog } from '@/lib/debug-log';

/**
 * Replace: prisma.league.findMany()
 */
export const getAllLeagues = async () => {
  const leagues = await Promise.all(
    getCurrentLeagues().map(async config => {
      const sleeperData = await sleeperClient.fetchLeague(config.id);
      return {
        id: config.id,
        ...sleeperData,
        name: config.name, // Override sleeper name with config name
        season: config.season, // Override sleeper season with config season
      };
    }),
  );
  return leagues;
};

/**
 * Replace: prisma.league.findUnique({ where: { id } })
 */
export const getLeagueById = async (leagueId: string) => {
  const config = getLeagueConfig(leagueId);
  if (!config) return null;

  const sleeperData = await sleeperClient.fetchLeague(leagueId);
  return {
    id: leagueId,
    ...sleeperData,
    name: config.name, // Override sleeper name with config name
    season: config.season, // Override sleeper season with config season
  };
};

/**
 * Replace: prisma.roster.findMany({ where: { leagueId } })
 */
export const getRostersByLeague = async (leagueId: string) => {
  debugLog(`[DEBUG] getRostersByLeague called with leagueId: ${leagueId}`);
  const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);

  debugLog(`[DEBUG] getRostersByLeague - rosters received:`, {
    type: typeof rosters,
    isArray: Array.isArray(rosters),
    length: Array.isArray(rosters) ? rosters.length : 'N/A',
  });

  if (!Array.isArray(rosters)) {
    console.error(`[ERROR] getRostersByLeague - rosters is not an array:`, rosters);
    return [];
  }

  return rosters.map((r: any) => ({
    id: `${leagueId}-${r.roster_id}`,
    rosterId: r.roster_id,
    leagueId,
    ownerId: r.owner_id,
    owner: r.owner,
    starters: r.starters,
    players: r.players,
    settings: r.settings,
    // Add computed fields
    wins: r.settings?.wins || 0,
    losses: r.settings?.losses || 0,
    ties: r.settings?.ties || 0,
    pointsFor: r.settings?.fpts || 0,
    pointsAgainst: r.settings?.fpts_against || 0,
  }));
};

/**
 * Replace: prisma.matchup.findMany({ where: { leagueId, week } })
 */
export const getMatchupsByWeek = async (leagueId: string, week: number) => {
  const matchups = await sleeperClient.fetchMatchups(leagueId, week);
  return matchups.map((m: any) => ({
    id: `${leagueId}-${week}-${m.roster_id}`,
    leagueId,
    week,
    rosterId: m.roster_id,
    matchupId: m.matchup_id,
    points: m.points,
    starters: m.starters,
    players: m.players,
    starterPoints: m.starters_points,
  }));
};

/**
 * Replace: prisma.user.findMany({ where: { leagues: { some: { id: leagueId } } } })
 */
export const getUsersByLeague = async (leagueId: string) => {
  const users = await sleeperClient.fetchUsers(leagueId);
  return users.map((u: any) => ({
    id: u.user_id,
    username: u.username,
    displayName: u.display_name,
    avatar: u.avatar,
    metadata: u.metadata,
  }));
};

/**
 * Replace: prisma.player.findUnique({ where: { id } })
 * For player data, we'll fetch from Sleeper's player endpoint or use static data
 */
export const getPlayerById = async (playerId: string) => {
  // For now, return basic player info
  // You could cache all players locally or fetch from Sleeper
  return {
    id: playerId,
    name: `Player ${playerId}`,
    position: 'Unknown',
    team: 'Unknown',
    // Add more fields as needed
  };
};

/**
 * Replace: prisma.transaction.findMany({ where: { leagueId, week } })
 */
export const getTransactionsByWeek = async (leagueId: string, week: number) => {
  // Fetch from Sleeper transactions endpoint
  const transactions = await sleeperClient.fetchTransactions(leagueId, week);

  // Import the player data loader for real player names
  const { getPlayerById } = await import('../data/players-loader');

  const getPlayerName = (playerId: string) => {
    const player = getPlayerById(playerId);
    return player?.full_name || `Player ${playerId}`;
  };

  return transactions.map((t: any) => {
    // Transform Sleeper's adds/drops format to UI expected format
    const transformAddsDrops = (playerMap: Record<string, number> | null) => {
      if (!playerMap || typeof playerMap !== 'object') return [];

      // Group players by roster ID
      const grouped = new Map<number, string[]>();
      Object.entries(playerMap).forEach(([playerId, rosterId]) => {
        if (!grouped.has(rosterId)) {
          grouped.set(rosterId, []);
        }
        grouped.get(rosterId)!.push(playerId);
      });

      // Convert to expected format
      return Array.from(grouped.entries()).map(([rosterId, playerIds]) => ({
        rosterId,
        players: playerIds.map(playerId => {
          const player = getPlayerById(playerId);
          return {
            id: playerId,
            fullName: getPlayerName(playerId),
            position: player?.position || 'UNKNOWN',
          };
        }),
      }));
    };

    return {
      id: t.transaction_id,
      leagueId,
      week,
      type: t.type,
      status: t.status,
      adds: transformAddsDrops(t.adds),
      drops: transformAddsDrops(t.drops),
      rosterIds: t.roster_ids,
      createdAt: new Date(t.created), // Sleeper timestamps are already in milliseconds
      metadata: t.metadata,
      settings: t.settings || {},
    };
  });
};

/**
 * Get ALL transactions across all weeks for a league
 */
export const getAllTransactionsByLeague = async (leagueId: string) => {
  // Import the player data loader for real player names
  const { getPlayerById } = await import('../data/players-loader');

  const getPlayerName = (playerId: string) => {
    const player = getPlayerById(playerId);
    return player?.full_name || `Player ${playerId}`;
  };

  const allTransactions: any[] = [];

  // Fetch transactions for all weeks (1-18)
  for (let week = 1; week <= 18; week++) {
    try {
      const weekTransactions = await sleeperClient.fetchTransactions(leagueId, week);

      // Transform and add to the collection
      const transformedTransactions = weekTransactions.map((t: any) => {
        // Transform Sleeper's adds/drops format to UI expected format
        const transformAddsDrops = (playerMap: Record<string, number> | null) => {
          if (!playerMap || typeof playerMap !== 'object') return [];

          // Group players by roster ID
          const grouped = new Map<number, string[]>();
          Object.entries(playerMap).forEach(([playerId, rosterId]) => {
            if (!grouped.has(rosterId)) {
              grouped.set(rosterId, []);
            }
            grouped.get(rosterId)!.push(playerId);
          });

          // Convert to expected format
          return Array.from(grouped.entries()).map(([rosterId, playerIds]) => ({
            rosterId,
            players: playerIds.map(playerId => {
              const player = getPlayerById(playerId);
              return {
                id: playerId,
                fullName: getPlayerName(playerId),
                position: player?.position || 'UNKNOWN',
              };
            }),
          }));
        };

        return {
          id: t.transaction_id,
          leagueId,
          week,
          type: t.type,
          status: t.status,
          adds: transformAddsDrops(t.adds),
          drops: transformAddsDrops(t.drops),
          rosterIds: t.roster_ids,
          createdAt: new Date(t.created), // Sleeper timestamps are already in milliseconds
          metadata: t.metadata,
          settings: t.settings || {},
        };
      });

      allTransactions.push(...transformedTransactions);

      // Small delay to be nice to Sleeper API
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.warn(`Error fetching week ${week} transactions:`, error);
      // Continue with other weeks
    }
  }

  // Sort by created date (newest first)
  allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return allTransactions;
};

/**
 * Get current NFL week without database
 */
export const getCurrentWeek = async () => {
  const nflState = await sleeperClient.fetchNFLState();
  return nflState.week || 1;
};

/**
 * Replace: prisma.draft.findUnique({ where: { leagueId } })
 */
export const getDraftByLeague = async (leagueId: string) => {
  // First get league info to find draft ID
  const league = await sleeperClient.fetchLeague(leagueId);
  if (!league?.draft_id) {
    return null;
  }

  // Fetch draft info and picks
  const [draftInfo, draftPicks] = await Promise.all([
    sleeperClient.fetchDraft(league.draft_id),
    sleeperClient.fetchDraftPicks(league.draft_id),
  ]);

  return {
    id: league.draft_id,
    leagueId,
    status: draftInfo.status,
    type: draftInfo.type,
    settings: draftInfo.settings,
    startTime: draftInfo.start_time,
    picks: draftPicks.map((pick: any) => ({
      id: `${league.draft_id}-${pick.pick_no}`,
      draftId: league.draft_id,
      pickNo: pick.pick_no,
      round: pick.round,
      rosterId: pick.roster_id,
      playerId: pick.player_id,
      isKeeper: pick.is_keeper,
      metadata: pick.metadata,
    })),
    metadata: draftInfo.metadata,
    createdAt: new Date(draftInfo.created),
  };
};

/**
 * Calculate win probability without database
 * This runs the simulation in real-time
 */
export const calculateWinProbability = async (
  team1Starters: string[],
  team2Starters: string[],
  week: number,
): Promise<{
  team1WinPct: number;
  team2WinPct: number;
  iterations: number;
  source: string;
}> => {
  const projections = await sleeperClient.fetchWeeklyProjections(week, '2025');

  // Simple simulation (can be expanded)
  let team1Wins = 0;
  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    let team1Score = 0;
    let team2Score = 0;

    // Add random variance to projections
    team1Starters.forEach(playerId => {
      const proj = projections[playerId];
      if (proj) {
        team1Score += proj.pts_half_ppr * (0.5 + Math.random());
      }
    });

    team2Starters.forEach(playerId => {
      const proj = projections[playerId];
      if (proj) {
        team2Score += proj.pts_half_ppr * (0.5 + Math.random());
      }
    });

    if (team1Score > team2Score) team1Wins++;
  }

  return {
    team1WinPct: team1Wins / iterations,
    team2WinPct: 1 - team1Wins / iterations,
    iterations,
    source: 'real-time-calculation',
  };
};

/**
 * Compute weekly rollups from Sleeper API data
 * Replaces the database-heavy compute-weekly-rollups.ts
 */
export const computeWeeklyRollups = async (leagueId: string, week: number) => {
  // Fetch all required data from Sleeper API
  const [matchups, league, rosters, users, projections] = await Promise.all([
    getMatchupsByWeek(leagueId, week),
    sleeperClient.fetchLeague(leagueId),
    getRostersByLeague(leagueId),
    getUsersByLeague(leagueId),
    sleeperClient.fetchWeeklyProjections(week, '2025').catch(() => ({})), // Gracefully handle projection failures
  ]);

  // Build lookup maps
  const rosterMap = new Map(rosters.map(r => [r.rosterId, r]));
  const userMap = new Map(users.map(u => [u.id, u]));

  // League Week Summary calculations
  const rosterPoints = matchups.map(m => m.points || 0);
  const sorted = [...rosterPoints].sort((a, b) => a - b);
  const n = rosterPoints.length;
  const median =
    n === 0 ? 0 : n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const avg = n === 0 ? 0 : rosterPoints.reduce((a, b) => a + b, 0) / (n || 1);
  const variance =
    n <= 1 ? 0 : rosterPoints.reduce((acc, p) => acc + Math.pow(p - avg, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  const maxPoints = n === 0 ? 0 : Math.max(...rosterPoints);
  const minPoints = n === 0 ? 0 : Math.min(...rosterPoints);

  const leagueWeekSummary = {
    leagueId,
    week,
    medianPoints: median,
    averagePoints: avg,
    maxPoints,
    minPoints,
    stdDev,
  };

  // Matchup Summaries
  const matchupGroups = new Map<number, any[]>();
  for (const m of matchups) {
    if (m.matchupId == null) continue;
    const g = matchupGroups.get(m.matchupId) || [];
    g.push(m);
    matchupGroups.set(m.matchupId, g);
  }

  const matchupSummaries = [];
  for (const [matchupId, group] of matchupGroups) {
    const [a, b] = group;
    if (!a || !b) continue;
    const pointsA = a.points || 0;
    const pointsB = b.points || 0;
    const winnerRosterId = pointsA === pointsB ? null : pointsA > pointsB ? a.rosterId : b.rosterId;
    const margin = Math.abs(pointsA - pointsB);

    matchupSummaries.push({
      leagueId,
      week,
      matchupId,
      rosterAId: a.rosterId,
      rosterBId: b.rosterId,
      pointsA,
      pointsB,
      winnerRosterId,
      margin,
    });
  }

  // Roster Week Aggregates (more complex calculations)
  const rosterWeekAggregates = [];
  for (const matchup of matchups) {
    const roster = rosterMap.get(matchup.rosterId);
    const owner = roster ? userMap.get(roster.ownerId) : null;

    // Find opponent in this matchup
    const opponent = matchups.find(
      m => m.matchupId === matchup.matchupId && m.rosterId !== matchup.rosterId,
    );

    // Calculate projected points for this roster's starters
    const starters = matchup.starters || roster?.starters || [];
    const projectedPoints = starters.reduce((total: number, playerId: string) => {
      const proj = (projections as any)[playerId];
      return total + (proj?.pts_half_ppr || 0);
    }, 0);

    // Calculate expected wins (simplified - could be more sophisticated)
    const expectedWins =
      matchups.filter(
        m => m.rosterId !== matchup.rosterId && (matchup.points || 0) > (m.points || 0),
      ).length / Math.max(1, matchups.length - 1);

    rosterWeekAggregates.push({
      leagueId,
      rosterId: matchup.rosterId,
      week,
      points: matchup.points || 0,
      projectedPoints,
      opponentRosterId: opponent?.rosterId || null,
      opponentPoints: opponent?.points || null,
      won: opponent ? (matchup.points || 0) > (opponent.points || 0) : null,
      expectedWins,
      luck: null, // Could calculate luck rating here
      // Add more fields as needed
    });
  }

  return {
    leagueWeekSummary,
    matchupSummaries,
    rosterWeekAggregates,
    meta: {
      week,
      leagueId,
      dbQueries: 0,
      dataSource: 'sleeper-api-computed',
      computedAt: new Date().toISOString(),
    },
  };
};
