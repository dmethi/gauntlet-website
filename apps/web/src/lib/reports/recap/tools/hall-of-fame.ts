import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import type { ReportTool } from './base';
import type { SleeperMatchup } from '@gauntlet/types';

/**
 * Hall of Fame Tools
 * Tools for identifying the week's best performances.
 */

interface TopTeamScoreArgs {
  week: number;
}

interface TopTeamScoreResult {
  score: number;
  rosterId: number;
  leagueId: string;
  league: string;
  teamName: string;
  ownerName: string;
  topPerformers: Array<{
    name: string;
    position: string;
    points: number;
  }>;
}

interface BiggestBlowoutArgs {
  week: number;
}

interface BiggestBlowoutResult {
  margin: number;
  league: string;
  winner: {
    score: number;
    teamName: string;
    ownerName: string;
  };
  loser: {
    score: number;
    teamName: string;
    ownerName: string;
  };
}

interface TopPositionPerformersArgs {
  week: number;
}

interface TopPositionPerformersResult {
  [position: string]: {
    playerName: string;
    points: number;
    teamName: string;
    league: string;
  };
}

/**
 * Tool 1: Finds the highest scoring team of the week across both leagues.
 */
export const calculateTopTeamScoreTool: ReportTool<TopTeamScoreArgs, TopTeamScoreResult> = {
  name: 'calculate_top_team_score',
  description: 'Finds the highest scoring team of the week across both leagues',

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

  execute: async (args: TopTeamScoreArgs): Promise<TopTeamScoreResult> => {
    // Fetch matchups from both leagues
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    const allMatchups = [...afcMatchups, ...nfcMatchups];

    // Find the highest score
    let topScore = 0;
    let topTeam: SleeperMatchup | null = null;
    let topLeagueId = '';

    allMatchups.forEach(matchup => {
      const score = matchup.points || 0;
      if (score > topScore) {
        topScore = score;
        topTeam = matchup;
        topLeagueId = afcMatchups.includes(matchup) ? LEAGUE_IDS.AFC : LEAGUE_IDS.NFC;
      }
    });

    if (!topTeam) {
      throw new Error('No team scores found');
    }

    // Fetch roster info
    const rosters = await sleeperClient.fetchRostersWithOwners(topLeagueId);
    const roster = rosters.find(r => r.roster_id === topTeam.roster_id);

    // Fetch players for scoring breakdown
    const players = await sleeperClient.fetchAllPlayers();
    const topPerformers = (topTeam.players || [])
      .map((playerId: string) => ({
        playerId,
        name: players[playerId]
          ? `${players[playerId].first_name} ${players[playerId].last_name}`
          : playerId,
        position: players[playerId]?.position || 'UNKNOWN',
        points: topTeam.players_points?.[playerId] || 0,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);

    return {
      score: Math.round(topScore * 100) / 100,
      rosterId: topTeam.roster_id,
      leagueId: topLeagueId,
      league: topLeagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
      teamName: roster?.metadata?.team_name || `Team ${topTeam.roster_id}`,
      ownerName: roster?.metadata?.owner_name || 'Unknown',
      topPerformers: topPerformers.map(p => ({
        name: p.name,
        position: p.position,
        points: Math.round(p.points * 100) / 100,
      })),
    };
  },
};

/**
 * Tool 2: Finds the matchup with the largest victory margin.
 */
export const calculateBiggestBlowoutTool: ReportTool<BiggestBlowoutArgs, BiggestBlowoutResult> = {
  name: 'calculate_biggest_blowout',
  description: 'Finds the matchup with the largest victory margin',

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

  execute: async (args: BiggestBlowoutArgs): Promise<BiggestBlowoutResult> => {
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    // Process each league separately to avoid multi-league ID conflicts
    const findBlowoutInLeague = (
      matchups: SleeperMatchup[],
      leagueId: string,
    ): {
      winner: SleeperMatchup;
      loser: SleeperMatchup;
      margin: number;
      leagueId: string;
    } | null => {
      let biggestMargin = 0;
      let blowout: {
        winner: SleeperMatchup;
        loser: SleeperMatchup;
        margin: number;
        leagueId: string;
      } | null = null;

      for (let i = 0; i < matchups.length; i++) {
        const team1 = matchups[i];
        const team2 = matchups.find((m, idx) => idx !== i && m.matchup_id === team1.matchup_id);

        if (!team2) continue;

        const score1 = team1.points || 0;
        const score2 = team2.points || 0;
        const margin = Math.abs(score1 - score2);

        if (margin > biggestMargin) {
          biggestMargin = margin;
          blowout = {
            winner: score1 > score2 ? team1 : team2,
            loser: score1 > score2 ? team2 : team1,
            margin,
            leagueId,
          };
        }
      }

      return blowout;
    };

    const afcBlowout = findBlowoutInLeague(afcMatchups, LEAGUE_IDS.AFC);
    const nfcBlowout = findBlowoutInLeague(nfcMatchups, LEAGUE_IDS.NFC);

    const biggestBlowout =
      (afcBlowout?.margin || 0) > (nfcBlowout?.margin || 0) ? afcBlowout : nfcBlowout;

    if (!biggestBlowout) {
      throw new Error('No blowouts found');
    }

    // Fetch roster info
    const rosters = await sleeperClient.fetchRostersWithOwners(biggestBlowout.leagueId);
    const winnerRoster = rosters.find(r => r.roster_id === biggestBlowout.winner.roster_id);
    const loserRoster = rosters.find(r => r.roster_id === biggestBlowout.loser.roster_id);

    return {
      margin: Math.round(biggestBlowout.margin * 100) / 100,
      league: biggestBlowout.leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
      winner: {
        score: Math.round((biggestBlowout.winner.points || 0) * 100) / 100,
        teamName: winnerRoster?.metadata?.team_name || `Team ${biggestBlowout.winner.roster_id}`,
        ownerName: winnerRoster?.metadata?.owner_name || 'Unknown',
      },
      loser: {
        score: Math.round((biggestBlowout.loser.points || 0) * 100) / 100,
        teamName: loserRoster?.metadata?.team_name || `Team ${biggestBlowout.loser.roster_id}`,
        ownerName: loserRoster?.metadata?.owner_name || 'Unknown',
      },
    };
  },
};

/**
 * Tool 3: Finds the best player at each position for the week.
 */
export const calculateTopPositionPerformersTool: ReportTool<
  TopPositionPerformersArgs,
  TopPositionPerformersResult
> = {
  name: 'calculate_top_position_performers',
  description: 'Finds the best player at each position for the week',

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

  execute: async (args: TopPositionPerformersArgs): Promise<TopPositionPerformersResult> => {
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    const allMatchups = [...afcMatchups, ...nfcMatchups];
    const players = await sleeperClient.fetchAllPlayers();

    // Collect all player performances
    const performances: Array<{
      playerId: string;
      name: string;
      position: string;
      points: number;
      rosterId: number;
      leagueId: string;
    }> = [];

    allMatchups.forEach(matchup => {
      const leagueId = afcMatchups.includes(matchup) ? LEAGUE_IDS.AFC : LEAGUE_IDS.NFC;

      (matchup.players || []).forEach((playerId: string) => {
        const player = players[playerId];
        if (!player) return;

        performances.push({
          playerId,
          name: `${player.first_name} ${player.last_name}`,
          position: player.position,
          points: matchup.players_points?.[playerId] || 0,
          rosterId: matchup.roster_id,
          leagueId,
        });
      });
    });

    // Find top performer at each position
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    const topPerformers: Record<string, any> = {};

    for (const position of positions) {
      const positionPerformances = performances.filter(p => p.position === position);
      if (positionPerformances.length === 0) continue;

      const top = positionPerformances.reduce((best, curr) =>
        curr.points > best.points ? curr : best,
      );

      // Get team name
      const rosters = await sleeperClient.fetchRostersWithOwners(top.leagueId);
      const roster = rosters.find(r => r.roster_id === top.rosterId);

      topPerformers[position] = {
        playerName: top.name,
        points: Math.round(top.points * 100) / 100,
        teamName: roster?.metadata?.team_name || `Team ${top.rosterId}`,
        league: top.leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
      };
    }

    return topPerformers;
  },
};
