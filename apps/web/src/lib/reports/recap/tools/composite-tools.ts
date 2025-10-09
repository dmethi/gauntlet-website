/**
 * Composite tools that combine multiple existing tools for simplified usage
 */

import type { ReportTool } from './base';
import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import { getRealNameByRoster } from '@/lib/username-mapping';

interface LeagueOverviewResult {
  totalPoints: number;
  averagePoints: number;
  highestScore: number;
  lowestScore: number;
  highestScorer: string;
  lowestScorer: string;
  highestScorerLeague: string;
  lowestScorerLeague: string;
  closeGames: number;
  blowouts: number;
  closestMatchup: {
    winner: string;
    loser: string;
    margin: number;
  };
  biggestBlowout: {
    winner: string;
    loser: string;
    margin: number;
  };
}

/**
 * Composite tool for league overview - combines multiple tools
 */
export const fetchLeagueOverviewTool: ReportTool<{ week: number }, LeagueOverviewResult> = {
  name: 'fetch_league_overview',
  description: 'Fetches complete league overview data including scores and matchups',

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

  execute: async (args: { week: number }): Promise<LeagueOverviewResult> => {
    // Fetch matchups from both leagues
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    // Fetch rosters for owner names
    const [afcRosters, nfcRosters] = await Promise.all([
      sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.AFC),
      sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.NFC),
    ]);

    // Calculate totals
    const allScores = [
      ...afcMatchups.map(m => m.points || 0),
      ...nfcMatchups.map(m => m.points || 0),
    ];

    const totalPoints = allScores.reduce((sum, p) => sum + p, 0);
    const averagePoints = totalPoints / allScores.length;

    // Find highest/lowest scores
    const highestScore = Math.max(...allScores);
    const lowestScore = Math.min(...allScores);

    const highestMatchup = [...afcMatchups, ...nfcMatchups].find(m => m.points === highestScore)!;
    const lowestMatchup = [...afcMatchups, ...nfcMatchups].find(m => m.points === lowestScore)!;

    const highestLeagueId = afcMatchups.includes(highestMatchup) ? LEAGUE_IDS.AFC : LEAGUE_IDS.NFC;
    const lowestLeagueId = afcMatchups.includes(lowestMatchup) ? LEAGUE_IDS.AFC : LEAGUE_IDS.NFC;

    const highestRoster = (highestLeagueId === LEAGUE_IDS.AFC ? afcRosters : nfcRosters).find(
      r => r.roster_id === highestMatchup.roster_id,
    )!;
    const lowestRoster = (lowestLeagueId === LEAGUE_IDS.AFC ? afcRosters : nfcRosters).find(
      r => r.roster_id === lowestMatchup.roster_id,
    )!;

    const highestScorer =
      getRealNameByRoster(highestLeagueId, highestMatchup.roster_id) ||
      highestRoster.owner?.display_name ||
      `Team ${highestMatchup.roster_id}`;
    const lowestScorer =
      getRealNameByRoster(lowestLeagueId, lowestMatchup.roster_id) ||
      lowestRoster.owner?.display_name ||
      `Team ${lowestMatchup.roster_id}`;

    // Find closest and biggest blowout
    const afcMatchupPairs = new Map<number, typeof afcMatchups>();
    afcMatchups.forEach(m => {
      const existing = afcMatchupPairs.get(m.matchup_id!) || [];
      afcMatchupPairs.set(m.matchup_id!, [...existing, m]);
    });

    const nfcMatchupPairs = new Map<number, typeof nfcMatchups>();
    nfcMatchups.forEach(m => {
      const existing = nfcMatchupPairs.get(m.matchup_id!) || [];
      nfcMatchupPairs.set(m.matchup_id!, [...existing, m]);
    });

    const allMatchupPairs = [
      ...Array.from(afcMatchupPairs.values()).map(pair => ({
        league: LEAGUE_IDS.AFC,
        pair,
      })),
      ...Array.from(nfcMatchupPairs.values()).map(pair => ({
        league: LEAGUE_IDS.NFC,
        pair,
      })),
    ];

    let closestMargin = Infinity;
    let closestMatchup = { winner: '', loser: '', margin: 0 };
    let biggestMargin = 0;
    let biggestBlowout = { winner: '', loser: '', margin: 0 };
    let closeGames = 0;
    let blowouts = 0;

    for (const { league, pair } of allMatchupPairs) {
      if (pair.length !== 2) continue;

      const [team1, team2] = pair;
      const margin = Math.abs((team1.points || 0) - (team2.points || 0));
      const winner = (team1.points || 0) > (team2.points || 0) ? team1 : team2;
      const loser = (team1.points || 0) > (team2.points || 0) ? team2 : team1;

      const rosters = league === LEAGUE_IDS.AFC ? afcRosters : nfcRosters;
      const winnerRoster = rosters.find(r => r.roster_id === winner.roster_id)!;
      const loserRoster = rosters.find(r => r.roster_id === loser.roster_id)!;

      const winnerName =
        getRealNameByRoster(league, winner.roster_id) ||
        winnerRoster.owner?.display_name ||
        `Team ${winner.roster_id}`;
      const loserName =
        getRealNameByRoster(league, loser.roster_id) ||
        loserRoster.owner?.display_name ||
        `Team ${loser.roster_id}`;

      if (margin <= 10) closeGames++;
      if (margin > 20) blowouts++;

      if (margin < closestMargin) {
        closestMargin = margin;
        closestMatchup = { winner: winnerName, loser: loserName, margin };
      }

      if (margin > biggestMargin) {
        biggestMargin = margin;
        biggestBlowout = { winner: winnerName, loser: loserName, margin };
      }
    }

    return {
      totalPoints,
      averagePoints,
      highestScore,
      lowestScore,
      highestScorer,
      lowestScorer,
      highestScorerLeague: highestLeagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
      lowestScorerLeague: lowestLeagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
      closeGames,
      blowouts,
      closestMatchup,
      biggestBlowout,
    };
  },
};

/**
 * Composite tool for matchup data - provides simple matchup pairs
 */
interface PlayerPerformance {
  playerName: string;
  position: string;
  points: number;
  gameWindow?: string; // e.g., "Sunday Night", "Monday Night", "Thursday Night"
}

export const fetchMatchupDataTool: ReportTool<
  { week: number },
  {
    matchups: Array<{
      league: string;
      matchupId: number;
      team1: {
        teamName: string;
        ownerName: string;
        score: number;
        record: string; // "W-L" or "W-L-T"
        topPerformers: PlayerPerformance[];
      };
      team2: {
        teamName: string;
        ownerName: string;
        score: number;
        record: string; // "W-L" or "W-L-T"
        topPerformers: PlayerPerformance[];
      };
      winner: string;
      margin: number;
    }>;
  }
> = {
  name: 'fetch_matchup_data',
  description: 'Fetches matchup data for narrative generation',

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
    // Import game schedule utilities
    const { fetchEspnScoreboard, buildGameWindowMap, getPlayerGameWindow } = await import(
      './game-schedule'
    );

    // Fetch all data including ESPN schedule
    const [afcMatchups, nfcMatchups, afcRosters, nfcRosters, players, espnData] = await Promise.all(
      [
        sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
        sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
        sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.AFC),
        sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.NFC),
        sleeperClient.fetchAllPlayers(),
        fetchEspnScoreboard().catch(() => null), // Graceful fallback if ESPN fails
      ],
    );

    // Build game window map from ESPN data (pass week for historical lookups)
    const gameWindowMap = espnData ? buildGameWindowMap(espnData, args.week) : new Map();

    // Helper to get top 3 performers from a team's starters
    const getTopPerformers = (matchup: (typeof afcMatchups)[0]): PlayerPerformance[] => {
      if (!matchup.starters || !matchup.players_points) return [];

      const performances = matchup.starters
        .filter(playerId => playerId) // Filter out null/undefined
        .map(playerId => {
          const player = players[playerId];
          const points = matchup.players_points![playerId] || 0;

          // Get game window for this player's NFL team
          const gameWindow = getPlayerGameWindow(player?.team, gameWindowMap);

          return {
            playerName: player ? `${player.first_name} ${player.last_name}` : playerId,
            position: player?.position || 'UNKNOWN',
            points: Math.round(points * 100) / 100,
            gameWindow: gameWindow?.label,
          };
        });

      return performances.sort((a, b) => b.points - a.points).slice(0, 3);
    };

    const processMatchups = (
      matchups: typeof afcMatchups,
      league: string,
      rosters: typeof afcRosters,
    ) => {
      const grouped = new Map<number, typeof matchups>();
      matchups.forEach(m => {
        const existing = grouped.get(m.matchup_id!) || [];
        grouped.set(m.matchup_id!, [...existing, m]);
      });

      return Array.from(grouped.values())
        .filter(pair => pair.length === 2)
        .map(([team1, team2]) => {
          const roster1 = rosters.find(r => r.roster_id === team1.roster_id)!;
          const roster2 = rosters.find(r => r.roster_id === team2.roster_id)!;

          const leagueId = league === 'AFC' ? LEAGUE_IDS.AFC : LEAGUE_IDS.NFC;

          const team1Name =
            getRealNameByRoster(leagueId, team1.roster_id) ||
            roster1.owner?.display_name ||
            `Team ${team1.roster_id}`;
          const team2Name =
            getRealNameByRoster(leagueId, team2.roster_id) ||
            roster2.owner?.display_name ||
            `Team ${team2.roster_id}`;

          const team1Won = (team1.points || 0) > (team2.points || 0);
          const team2Won = !team1Won;
          const winner = team1Won ? team1Name : team2Name;
          const margin = Math.abs((team1.points || 0) - (team2.points || 0));

          // Build record strings (BEFORE this week's game)
          // Subtract this week's result to get entering record
          const team1Wins = roster1.settings.wins - (team1Won ? 1 : 0);
          const team1Losses = roster1.settings.losses - (team2Won ? 1 : 0);
          const team1Ties = roster1.settings.ties || 0;

          const team2Wins = roster2.settings.wins - (team2Won ? 1 : 0);
          const team2Losses = roster2.settings.losses - (team1Won ? 1 : 0);
          const team2Ties = roster2.settings.ties || 0;

          const team1Record =
            team1Ties > 0
              ? `${team1Wins}-${team1Losses}-${team1Ties}`
              : `${team1Wins}-${team1Losses}`;

          const team2Record =
            team2Ties > 0
              ? `${team2Wins}-${team2Losses}-${team2Ties}`
              : `${team2Wins}-${team2Losses}`;

          return {
            league,
            matchupId: team1.matchup_id!,
            team1: {
              teamName: roster1.owner?.metadata?.team_name || team1Name,
              ownerName: team1Name,
              score: team1.points || 0,
              record: team1Record,
              topPerformers: getTopPerformers(team1),
            },
            team2: {
              teamName: roster2.owner?.metadata?.team_name || team2Name,
              ownerName: team2Name,
              score: team2.points || 0,
              record: team2Record,
              topPerformers: getTopPerformers(team2),
            },
            winner,
            margin,
          };
        });
    };

    return {
      matchups: [
        ...processMatchups(afcMatchups, 'AFC', afcRosters),
        ...processMatchups(nfcMatchups, 'NFC', nfcRosters),
      ],
    };
  },
};
