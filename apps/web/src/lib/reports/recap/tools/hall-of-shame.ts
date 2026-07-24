import { sleeperClient } from '@/lib/sleeper/unified-client';
import { getCurrentLeagues } from '@/config/leagues';
import { getRealNameByRoster } from '@/lib/username-mapping';
import type { ReportTool } from './base';

/**
 * Hall of Shame Tool
 * Provides comprehensive data about the week's worst performances including:
 * - 3-5 worst scoring teams
 * - Biggest busts across the entire league (projection misses)
 * - Which teams were affected by those busts
 */

interface PlayerPerformance {
  playerId: string;
  playerName: string;
  position: string;
  projected: number;
  actual: number;
  diff: number;
  started: boolean;
  ownedBy: {
    manager: string;
    teamName: string;
    league: string;
    started: boolean;
  }[];
}

interface TeamPerformance {
  manager: string;
  teamName: string;
  totalScore: number;
  league: string;
  rank: number; // 1 = worst, 2 = 2nd worst, etc.
}

interface HallOfShameResult {
  worstTeams: TeamPerformance[]; // 3-5 worst scoring teams
  biggestBusts: PlayerPerformance[]; // 10-15 biggest projection misses
  totalTeamsAnalyzed: number;
  totalPlayersAnalyzed: number;
}

/**
 * Calculate fantasy points using Gauntlet league scoring
 */
const calculateFantasyPoints = (stats: any): number => {
  if (!stats) return 0;

  let points = 0;

  // Passing
  points += (stats.pass_yd || 0) * 0.04;
  points += (stats.pass_td || 0) * 4;
  points += (stats.pass_int || 0) * -1;
  points += (stats.pass_2pt || 0) * 2;

  // Rushing
  points += (stats.rush_yd || 0) * 0.1;
  points += (stats.rush_td || 0) * 6;
  points += (stats.rush_2pt || 0) * 2;

  // Receiving
  points += (stats.rec || 0) * 1; // PPR
  points += (stats.rec_yd || 0) * 0.1;
  points += (stats.rec_td || 0) * 6;
  points += (stats.rec_2pt || 0) * 2;

  // Fumbles
  points += (stats.fum_lost || 0) * -2;

  // Kicking
  points += (stats.fgm_0_19 || 0) * 3;
  points += (stats.fgm_20_29 || 0) * 3;
  points += (stats.fgm_30_39 || 0) * 3;
  points += (stats.fgm_40_49 || 0) * 4;
  points += (stats.fgm_50p || 0) * 5;
  points += (stats.xpm || 0) * 1;
  points += (stats.fgmiss || 0) * -1;

  // Defense
  points += (stats.def_td || 0) * 6;
  points += (stats.def_st_td || 0) * 6;
  points += (stats.def_int || 0) * 2;
  points += (stats.def_fr || 0) * 2;
  points += (stats.def_sack || 0) * 1;
  points += (stats.def_safety || 0) * 2;
  points += (stats.def_block_kick || 0) * 2;

  // Points allowed (for DST)
  if (stats.pts_allow !== undefined) {
    if (stats.pts_allow === 0) points += 10;
    else if (stats.pts_allow <= 6) points += 7;
    else if (stats.pts_allow <= 13) points += 4;
    else if (stats.pts_allow <= 20) points += 1;
    else if (stats.pts_allow <= 27) points += 0;
    else if (stats.pts_allow <= 34) points += -1;
    else points += -4;
  }

  return Math.round(points * 100) / 100;
};

/**
 * Fetch comprehensive Hall of Shame data for the week's worst performances
 */
export const fetchHallOfShameTool: ReportTool<{ week: number }, HallOfShameResult> = {
  name: 'fetch_hall_of_shame_data',
  description: 'Fetches comprehensive data about the weeks worst performances league-wide',

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

  execute: async (args: { week: number }): Promise<HallOfShameResult> => {
    const leagues = getCurrentLeagues();

    // Fetch all matchups and rosters from every registered league
    const [matchupsByLeague, rostersByLeague, players, projections] = await Promise.all([
      Promise.all(leagues.map(league => sleeperClient.fetchMatchups(league.id, args.week))),
      Promise.all(leagues.map(league => sleeperClient.fetchRostersWithOwners(league.id))),
      sleeperClient.fetchAllPlayers(),
      sleeperClient.fetchWeeklyProjections(args.week, '2025'),
    ]);

    // Build roster lookup maps
    const rosterMap = new Map();
    leagues.forEach((league, i) => {
      rostersByLeague[i].forEach(r => {
        const key = `${r.league_id || league.id}-${r.roster_id}`;
        rosterMap.set(key, r);
      });
    });

    // Find 3-5 worst scoring teams
    const allMatchups = leagues.flatMap((league, i) =>
      matchupsByLeague[i].map(m => ({
        ...m,
        leagueId: league.id,
        league: (league.conference || league.name) as string,
      })),
    );

    const sortedByScore = [...allMatchups].sort((a, b) => (a.points || 0) - (b.points || 0));
    const worstTeams: TeamPerformance[] = sortedByScore.slice(0, 5).map((m, idx) => {
      const rosterKey = `${m.leagueId}-${m.roster_id}`;
      const roster = rosterMap.get(rosterKey);
      const manager =
        getRealNameByRoster(m.leagueId, m.roster_id) ||
        roster?.owner?.display_name ||
        `Team ${m.roster_id}`;
      const teamName = roster?.owner?.metadata?.team_name || manager;

      return {
        manager,
        teamName,
        totalScore: m.points || 0,
        league: m.league,
        rank: idx + 1,
      };
    });

    // Build comprehensive bust list across ALL players
    const playerBusts = new Map<string, PlayerPerformance>();

    // Process each matchup to find busts
    for (const matchup of allMatchups) {
      const starterIds = new Set(matchup.starters || []);

      for (const playerId of matchup.starters || []) {
        if (!playerId) continue;

        const player = players[playerId];
        if (!player) continue;

        const projection = projections[playerId];
        if (!projection) continue;

        const projected = calculateFantasyPoints(projection);
        const actual = matchup.players_points?.[playerId] || 0;
        const diff = actual - projected;

        // Only track significant busts (projected 5+, missed by 5+)
        if (projected < 5 || diff >= -5) continue;

        // Add or update player bust record
        if (!playerBusts.has(playerId)) {
          playerBusts.set(playerId, {
            playerId,
            playerName: `${player.first_name} ${player.last_name}`,
            position: player.position,
            projected,
            actual,
            diff,
            started: starterIds.has(playerId),
            ownedBy: [],
          });
        }

        // Add ownership info
        const bustRecord = playerBusts.get(playerId)!;
        const rosterKey = `${matchup.leagueId}-${matchup.roster_id}`;
        const roster = rosterMap.get(rosterKey);
        const manager =
          getRealNameByRoster((matchup as any).leagueId, matchup.roster_id) ||
          roster?.owner?.display_name ||
          `Team ${matchup.roster_id}`;
        const teamName = roster?.owner?.metadata?.team_name || manager;

        bustRecord.ownedBy.push({
          manager,
          teamName,
          league: (matchup as any).league,
          started: starterIds.has(playerId),
        });
      }
    }

    // Sort busts by biggest miss and take top 10-15
    const biggestBusts = Array.from(playerBusts.values())
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 15);

    return {
      worstTeams,
      biggestBusts,
      totalTeamsAnalyzed: allMatchups.length,
      totalPlayersAnalyzed: playerBusts.size,
    };
  },
};
