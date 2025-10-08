import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import { getRealNameByRoster } from '@/lib/username-mapping';
import type { ReportTool } from './base';
import type { SleeperMatchup } from '@gauntlet/types';

/**
 * Hall of Shame Tools
 * Tools for identifying the week's worst performances and lowlights.
 */

interface LowestTeamScoreArgs {
  week: number;
}

interface LowestTeamScoreResult {
  score: number;
  rosterId: number;
  leagueId: string;
  league: string;
  teamName: string;
  ownerName: string;
  worstPerformers: Array<{
    name: string;
    position: string;
    points: number;
  }>;
}

interface BiggestBustsArgs {
  week: number;
}

interface BiggestBustsResult {
  playerName: string;
  position: string;
  projected: number;
  actual: number;
  difference: number;
  teamName: string;
  league: string;
}

interface BadBeatLossesArgs {
  week: number;
}

interface BadBeatLossesResult {
  avgScore: number;
  badBeats: Array<{
    teamName: string;
    ownerName: string;
    score: number;
    opponentScore: number;
    margin: number;
    league: string;
    aboveAvgBy: number;
  }>;
}

/**
 * Tool 1: Finds the lowest scoring team of the week across both leagues.
 */
export const calculateLowestTeamScoreTool: ReportTool<LowestTeamScoreArgs, LowestTeamScoreResult> =
  {
    name: 'calculate_lowest_team_score',
    description: 'Finds the lowest scoring team of the week across both leagues',

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

    execute: async (args: LowestTeamScoreArgs): Promise<LowestTeamScoreResult> => {
      // Fetch matchups from both leagues
      const [afcMatchups, nfcMatchups] = await Promise.all([
        sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
        sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
      ]);

      const allMatchups = [...afcMatchups, ...nfcMatchups];

      // Find the lowest score (excluding 0s from byes)
      let lowestScore = Infinity;
      let lowestTeam: SleeperMatchup | null = null;
      let lowestLeagueId = '';

      allMatchups.forEach(matchup => {
        const score = matchup.points || 0;
        if (score > 0 && score < lowestScore) {
          lowestScore = score;
          lowestTeam = matchup;
          lowestLeagueId = afcMatchups.includes(matchup) ? LEAGUE_IDS.AFC : LEAGUE_IDS.NFC;
        }
      });

      if (!lowestTeam) {
        throw new Error('No team scores found');
      }

      // Fetch roster info
      const rosters = await sleeperClient.fetchRostersWithOwners(lowestLeagueId);
      const roster = rosters.find(r => r.roster_id === lowestTeam.roster_id);

      // Fetch players for scoring breakdown
      const players = await sleeperClient.fetchAllPlayers();
      const worstPerformers = (lowestTeam.players || [])
        .map((playerId: string) => ({
          playerId,
          name: players[playerId]
            ? `${players[playerId].first_name} ${players[playerId].last_name}`
            : playerId,
          position: players[playerId]?.position || 'UNKNOWN',
          points: lowestTeam.players_points?.[playerId] || 0,
        }))
        .filter(p => p.points > 0) // Only active players
        .sort((a, b) => a.points - b.points)
        .slice(0, 3);

      // Get real name from mapping
      const ownerName =
        getRealNameByRoster(lowestLeagueId, lowestTeam.roster_id) ||
        roster?.metadata?.owner_name ||
        'Unknown';

      return {
        score: Math.round(lowestScore * 100) / 100,
        rosterId: lowestTeam.roster_id,
        leagueId: lowestLeagueId,
        league: lowestLeagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
        teamName: roster?.metadata?.team_name || `Team ${lowestTeam.roster_id}`,
        ownerName,
        worstPerformers: worstPerformers.map(p => ({
          name: p.name,
          position: p.position,
          points: Math.round(p.points * 100) / 100,
        })),
      };
    },
  };

/**
 * Tool 2: Finds the top 3 players who most underperformed their projections.
 * Note: Uses mock projections (actual * 1.2) as placeholder until real projection data is integrated.
 */
export const calculateBiggestBustsTool: ReportTool<BiggestBustsArgs, BiggestBustsResult[]> = {
  name: 'calculate_biggest_busts',
  description: 'Finds the top 3 players who most underperformed their projections',

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

  execute: async (args: BiggestBustsArgs): Promise<BiggestBustsResult[]> => {
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    const allMatchups = [...afcMatchups, ...nfcMatchups];
    const players = await sleeperClient.fetchAllPlayers();

    // NOTE: In production, this would fetch actual projections from Sleeper API
    // For now, we'll use a mock projection (actual * 1.2) as placeholder

    const busts: BiggestBustsResult[] = [];

    for (const matchup of allMatchups) {
      const leagueId = afcMatchups.includes(matchup) ? LEAGUE_IDS.AFC : LEAGUE_IDS.NFC;
      const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);
      const roster = rosters.find(r => r.roster_id === matchup.roster_id);

      (matchup.players || []).forEach((playerId: string) => {
        const player = players[playerId];
        if (!player) return;

        const actual = matchup.players_points?.[playerId] || 0;
        // Mock projection: assume they were projected to score 20% more than actual
        const projected = actual * 1.2;
        const difference = actual - projected;

        // Only include players who significantly underperformed (>10 pts below)
        if (difference < -10) {
          busts.push({
            playerName: `${player.first_name} ${player.last_name}`,
            position: player.position,
            projected: Math.round(projected * 100) / 100,
            actual: Math.round(actual * 100) / 100,
            difference: Math.round(difference * 100) / 100,
            teamName: roster?.metadata?.team_name || `Team ${matchup.roster_id}`,
            league: leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
          });
        }
      });
    }

    // Sort by biggest negative difference and take top 3
    return busts.sort((a, b) => a.difference - b.difference).slice(0, 3);
  },
};

/**
 * Tool 3: Finds teams that scored above league average but still lost.
 */
export const calculateBadBeatLossesTool: ReportTool<BadBeatLossesArgs, BadBeatLossesResult> = {
  name: 'calculate_bad_beat_losses',
  description: 'Finds teams that scored above league average but still lost',

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

  execute: async (args: BadBeatLossesArgs): Promise<BadBeatLossesResult> => {
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    const allMatchups = [...afcMatchups, ...nfcMatchups];

    // Calculate league average score
    const allScores = allMatchups.map(m => m.points || 0).filter(s => s > 0);
    const avgScore = allScores.reduce((sum, s) => sum + s, 0) / allScores.length;

    // Find bad beat losses (scored above average but lost)
    const badBeats: Array<{
      teamName: string;
      ownerName: string;
      score: number;
      opponentScore: number;
      margin: number;
      league: string;
      aboveAvgBy: number;
    }> = [];

    const processLeague = async (matchups: SleeperMatchup[], leagueId: string): Promise<void> => {
      const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);

      for (let i = 0; i < matchups.length; i++) {
        const team = matchups[i];
        const opponent = matchups.find((m, idx) => idx !== i && m.matchup_id === team.matchup_id);

        if (!opponent) continue;

        const teamScore = team.points || 0;
        const oppScore = opponent.points || 0;

        // Check if this team lost despite scoring above average
        if (teamScore > avgScore && teamScore < oppScore) {
          const roster = rosters.find(r => r.roster_id === team.roster_id);
          const ownerName =
            getRealNameByRoster(leagueId, team.roster_id) ||
            roster?.metadata?.owner_name ||
            'Unknown';

          badBeats.push({
            teamName: roster?.metadata?.team_name || `Team ${team.roster_id}`,
            ownerName,
            score: Math.round(teamScore * 100) / 100,
            opponentScore: Math.round(oppScore * 100) / 100,
            margin: Math.round((oppScore - teamScore) * 100) / 100,
            league: leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
            aboveAvgBy: Math.round((teamScore - avgScore) * 100) / 100,
          });
        }
      }
    };

    await Promise.all([
      processLeague(afcMatchups, LEAGUE_IDS.AFC),
      processLeague(nfcMatchups, LEAGUE_IDS.NFC),
    ]);

    // Sort by most above average
    const sortedBadBeats = badBeats.sort((a, b) => b.aboveAvgBy - a.aboveAvgBy);

    return {
      avgScore: Math.round(avgScore * 100) / 100,
      badBeats: sortedBadBeats,
    };
  },
};
