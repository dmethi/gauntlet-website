/**
 * Matchup Data Tools (RECAP-008)
 *
 * All 11 data fetching tools for matchup narratives:
 * - Box scores, projections, records
 * - Head-to-head history
 * - Position breakdowns
 * - Key player performances
 * - Game flow and playoff implications
 */

import { sleeperClient } from '@/lib/sleeper/unified-client';
import type { SleeperMatchup } from '@gauntlet/types';
import type { ReportTool } from './base';
import type {
  H2HHistory,
  KeyPlayerPerformance,
  MatchupBoxScore,
  PositionBreakdown,
  TeamRecord,
} from '../types';

// ============================================================================
// Tool 1: Box Score
// ============================================================================

export const fetchMatchupBoxScoreTool: ReportTool<
  { leagueId: string; week: number; matchupId: number },
  MatchupBoxScore
> = {
  name: 'fetch_matchup_box_score',
  description: 'Fetches final scores for a specific matchup',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string', description: 'League ID' },
      week: { type: 'number', description: 'Week number' },
      matchupId: { type: 'number', description: 'Matchup ID (1-6)' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: { leagueId: string; week: number; matchupId: number }) => {
    const matchups = await sleeperClient.fetchMatchups(args.leagueId, args.week);

    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);
    if (matchupTeams.length !== 2) {
      throw new Error(
        `Expected 2 teams for matchup ${args.matchupId}, found ${matchupTeams.length}`,
      );
    }

    const [team1, team2] = matchupTeams;
    const team1Score = team1.points || 0;
    const team2Score = team2.points || 0;

    const result: MatchupBoxScore = {
      leagueId: args.leagueId,
      week: args.week,
      matchupId: args.matchupId,
      team1: {
        rosterId: team1.roster_id,
        score: Math.round(team1Score * 100) / 100,
        projectedScore: Math.round((team1.custom_points || 0) * 100) / 100,
      },
      team2: {
        rosterId: team2.roster_id,
        score: Math.round(team2Score * 100) / 100,
        projectedScore: Math.round((team2.custom_points || 0) * 100) / 100,
      },
      winner: team1Score > team2Score ? 'team1' : team2Score > team1Score ? 'team2' : 'tie',
      margin: Math.round(Math.abs(team1Score - team2Score) * 100) / 100,
    };

    return result;
  },
};

// ============================================================================
// Tool 2: Team Rosters (names and owners)
// ============================================================================

export const fetchMatchupRostersTool: ReportTool<
  { leagueId: string; week: number; matchupId: number },
  {
    team1: { rosterId: number; teamName: string; owner: string };
    team2: { rosterId: number; teamName: string; owner: string };
  }
> = {
  name: 'fetch_matchup_rosters',
  description: 'Fetches team names and manager information for matchup teams',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string', description: 'League ID' },
      week: { type: 'number', description: 'Week number' },
      matchupId: { type: 'number', description: 'Matchup ID (1-6)' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: { leagueId: string; week: number; matchupId: number }) => {
    // Import username mapping utility
    const { getRealNameByRoster } = await import('@/lib/username-mapping');

    // First get matchup to find roster IDs
    const matchups = await sleeperClient.fetchMatchups(args.leagueId, args.week);
    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);

    if (matchupTeams.length !== 2) {
      throw new Error(
        `Expected 2 teams for matchup ${args.matchupId}, found ${matchupTeams.length}`,
      );
    }

    const rosterId1 = matchupTeams[0].roster_id;
    const rosterId2 = matchupTeams[1].roster_id;

    // Now fetch rosters with owners
    const rosters = await sleeperClient.fetchRostersWithOwners(args.leagueId);

    const roster1 = rosters.find(r => r.roster_id === rosterId1);
    const roster2 = rosters.find(r => r.roster_id === rosterId2);

    if (!roster1 || !roster2) {
      throw new Error('Could not find one or both rosters');
    }

    // Get real names from username mapping
    const owner1 =
      getRealNameByRoster(args.leagueId, rosterId1) ||
      roster1.metadata?.owner_name ||
      `Manager ${rosterId1}`;
    const owner2 =
      getRealNameByRoster(args.leagueId, rosterId2) ||
      roster2.metadata?.owner_name ||
      `Manager ${rosterId2}`;

    // Get team names from owner metadata (that's where Sleeper stores them)
    const team1Name =
      roster1.owner?.metadata?.team_name || roster1.metadata?.team_name || `${owner1}'s Team`;
    const team2Name =
      roster2.owner?.metadata?.team_name || roster2.metadata?.team_name || `${owner2}'s Team`;

    return {
      team1: {
        rosterId: roster1.roster_id,
        teamName: team1Name,
        owner: owner1,
      },
      team2: {
        rosterId: roster2.roster_id,
        teamName: team2Name,
        owner: owner2,
      },
    };
  },
};

// ============================================================================
// Tool 3: Scoring Breakdown (points by player)
// ============================================================================

export const fetchScoringBreakdownTool: ReportTool<
  { leagueId: string; week: number; matchupId: number },
  {
    team1: Array<{ playerId: string; playerName: string; position: string; points: number }>;
    team2: Array<{ playerId: string; playerName: string; position: string; points: number }>;
  }
> = {
  name: 'fetch_matchup_scoring_breakdown',
  description: 'Fetches detailed scoring breakdown by player for a matchup',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string', description: 'League ID' },
      week: { type: 'number', description: 'Week number' },
      matchupId: { type: 'number', description: 'Matchup ID (1-6)' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: { leagueId: string; week: number; matchupId: number }) => {
    const matchups = await sleeperClient.fetchMatchups(args.leagueId, args.week);
    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);

    const players = await sleeperClient.fetchAllPlayers();

    const buildPlayerScores = (matchup: SleeperMatchup) => {
      if (!matchup.starters || !matchup.players_points) return [];

      // Use starters array instead of all players to show only starting lineup
      return matchup.starters
        .map(playerId => {
          const player = players[playerId];
          return {
            playerId,
            playerName: player ? `${player.first_name} ${player.last_name}` : playerId,
            position: player?.position || 'UNKNOWN',
            points: matchup.players_points![playerId] || 0,
          };
        })
        .sort((a, b) => b.points - a.points);
    };

    return {
      team1: buildPlayerScores(matchupTeams[0]),
      team2: buildPlayerScores(matchupTeams[1]),
    };
  },
};

// ============================================================================
// Tool 4: Pre-game Projections
// ============================================================================

export const fetchPreGameProjectionsTool: ReportTool<
  { leagueId: string; week: number; matchupId: number },
  {
    team1: { projected: number; rosterId: number };
    team2: { projected: number; rosterId: number };
    projectedMargin: number;
  }
> = {
  name: 'fetch_pre_game_projections',
  description: 'Fetches projected scores computed with league-specific scoring settings',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string', description: 'League ID' },
      week: { type: 'number', description: 'Week number' },
      matchupId: { type: 'number', description: 'Matchup ID (1-6)' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: { leagueId: string; week: number; matchupId: number }) => {
    // Import league projection calculator
    const { calculateLeagueProjection } = await import('@/lib/calculate-league-projections');

    // Fetch matchups, league, and projections
    const [matchups, league] = await Promise.all([
      sleeperClient.fetchMatchups(args.leagueId, args.week),
      sleeperClient.fetchLeague(args.leagueId),
    ]);

    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);
    if (matchupTeams.length !== 2) {
      throw new Error(
        `Expected 2 teams for matchup ${args.matchupId}, found ${matchupTeams.length}`,
      );
    }

    // Fetch week projections from Sleeper
    const weekProjections = await sleeperClient.fetchWeeklyProjections(args.week);

    // Get league scoring settings
    const scoringSettings = league.scoring_settings || {};

    // Calculate projected points for each team using league scoring
    const calculateTeamProjection = (matchup: SleeperMatchup): number => {
      if (!matchup.starters || matchup.starters.length === 0) {
        // Fallback to custom_points if no starters data
        return matchup.custom_points || 0;
      }

      let totalProjected = 0;

      for (const playerId of matchup.starters) {
        const playerProjection = weekProjections[playerId];
        if (playerProjection) {
          // Apply league-specific scoring
          const leagueProjection = calculateLeagueProjection(playerProjection, scoringSettings);
          totalProjected += leagueProjection.points;
        } else {
          // Fallback: use 0 if no projection available
          totalProjected += 0;
        }
      }

      return Math.round(totalProjected * 100) / 100;
    };

    const team1Projected = calculateTeamProjection(matchupTeams[0]);
    const team2Projected = calculateTeamProjection(matchupTeams[1]);

    return {
      team1: { projected: team1Projected, rosterId: matchupTeams[0].roster_id },
      team2: { projected: team2Projected, rosterId: matchupTeams[1].roster_id },
      projectedMargin: Math.abs(team1Projected - team2Projected),
    };
  },
};

// ============================================================================
// Tool 5: Projection vs Actual
// ============================================================================

export const fetchProjectionVsActualTool: ReportTool<
  { leagueId: string; week: number; matchupId: number },
  {
    team1: { actual: number; projected: number; overUnder: number; overUnderPct: number };
    team2: { actual: number; projected: number; overUnder: number; overUnderPct: number };
  }
> = {
  name: 'fetch_projection_vs_actual',
  description: 'Compares projected scores to actual results',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string', description: 'League ID' },
      week: { type: 'number', description: 'Week number' },
      matchupId: { type: 'number', description: 'Matchup ID (1-6)' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: { leagueId: string; week: number; matchupId: number }) => {
    // Get actual scores from matchups
    const matchups = await sleeperClient.fetchMatchups(args.leagueId, args.week);
    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);

    // Get proper league-specific projections
    const projections = await fetchPreGameProjectionsTool.execute(args);

    const team1Actual = matchupTeams[0].points || 0;
    const team2Actual = matchupTeams[1].points || 0;
    const team1Projected = projections.team1.projected;
    const team2Projected = projections.team2.projected;

    return {
      team1: {
        actual: Math.round(team1Actual * 100) / 100,
        projected: Math.round(team1Projected * 100) / 100,
        overUnder: Math.round((team1Actual - team1Projected) * 100) / 100,
        overUnderPct:
          team1Projected > 0
            ? Math.round(((team1Actual - team1Projected) / team1Projected) * 100)
            : 0,
      },
      team2: {
        actual: Math.round(team2Actual * 100) / 100,
        projected: Math.round(team2Projected * 100) / 100,
        overUnder: Math.round((team2Actual - team2Projected) * 100) / 100,
        overUnderPct:
          team2Projected > 0
            ? Math.round(((team2Actual - team2Projected) / team2Projected) * 100)
            : 0,
      },
    };
  },
};

// ============================================================================
// Tool 6: Team Records
// ============================================================================

export const fetchTeamRecordsTool: ReportTool<
  { leagueId: string; week: number; rosterId1: number; rosterId2: number },
  { team1: TeamRecord; team2: TeamRecord }
> = {
  name: 'fetch_team_records',
  description: 'Fetches win-loss records for teams entering the week',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string', description: 'League ID' },
      week: { type: 'number', description: 'Current week number' },
      rosterId1: { type: 'number', description: 'First team roster ID' },
      rosterId2: { type: 'number', description: 'Second team roster ID' },
    },
    required: ['leagueId', 'week', 'rosterId1', 'rosterId2'],
  },
  execute: async (args: {
    leagueId: string;
    week: number;
    rosterId1: number;
    rosterId2: number;
  }) => {
    // Calculate records through previous week
    const weeks = Array.from({ length: args.week - 1 }, (_, i) => i + 1);

    const calculateRecord = async (rosterId: number): Promise<TeamRecord> => {
      let wins = 0;
      let losses = 0;
      let ties = 0;
      let pointsFor = 0;
      let pointsAgainst = 0;

      for (const week of weeks) {
        const matchups = await sleeperClient.fetchMatchups(args.leagueId, week);
        const team = matchups.find(m => m.roster_id === rosterId);
        if (!team) continue;

        const opponent = matchups.find(
          m => m.matchup_id === team.matchup_id && m.roster_id !== rosterId,
        );
        if (!opponent) continue;

        const teamScore = team.points || 0;
        const oppScore = opponent.points || 0;

        pointsFor += teamScore;
        pointsAgainst += oppScore;

        if (teamScore > oppScore) wins++;
        else if (oppScore > teamScore) losses++;
        else ties++;
      }

      const totalGames = wins + losses + ties;
      const winPct = totalGames > 0 ? wins / totalGames : 0;

      return {
        rosterId,
        wins,
        losses,
        ties,
        winPct: Math.round(winPct * 1000) / 1000,
        pointsFor: Math.round(pointsFor * 100) / 100,
        pointsAgainst: Math.round(pointsAgainst * 100) / 100,
      };
    };

    const [record1, record2] = await Promise.all([
      calculateRecord(args.rosterId1),
      calculateRecord(args.rosterId2),
    ]);

    return { team1: record1, team2: record2 };
  },
};

// ============================================================================
// Tool 7: H2H History
// ============================================================================

export const fetchH2HHistoryTool: ReportTool<
  { leagueId: string; currentWeek: number; rosterId1: number; rosterId2: number },
  H2HHistory
> = {
  name: 'fetch_h2h_history',
  description: 'Fetches head-to-head history between two teams this season',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string', description: 'League ID' },
      currentWeek: { type: 'number', description: 'Current week number' },
      rosterId1: { type: 'number', description: 'First team roster ID' },
      rosterId2: { type: 'number', description: 'Second team roster ID' },
    },
    required: ['leagueId', 'currentWeek', 'rosterId1', 'rosterId2'],
  },
  execute: async (args: {
    leagueId: string;
    currentWeek: number;
    rosterId1: number;
    rosterId2: number;
  }) => {
    const weeks = Array.from({ length: args.currentWeek - 1 }, (_, i) => i + 1);
    const history: H2HHistory = {
      team1Wins: 0,
      team2Wins: 0,
      ties: 0,
      previousMatchups: [],
    };

    for (const week of weeks) {
      const matchups = await sleeperClient.fetchMatchups(args.leagueId, week);
      const team1 = matchups.find(m => m.roster_id === args.rosterId1);
      const team2 = matchups.find(m => m.roster_id === args.rosterId2);

      // Check if they played each other this week
      if (team1 && team2 && team1.matchup_id === team2.matchup_id) {
        const team1Score = team1.points || 0;
        const team2Score = team2.points || 0;

        let winner: 'team1' | 'team2' | 'tie';
        if (team1Score > team2Score) {
          history.team1Wins++;
          winner = 'team1';
        } else if (team2Score > team1Score) {
          history.team2Wins++;
          winner = 'team2';
        } else {
          history.ties++;
          winner = 'tie';
        }

        history.previousMatchups.push({
          week,
          team1Score: Math.round(team1Score * 100) / 100,
          team2Score: Math.round(team2Score * 100) / 100,
          winner,
        });
      }
    }

    return history;
  },
};

// ============================================================================
// Tool 8: Game Flow - Re-export from game-flow.ts
// ============================================================================
// Note: The game flow tool is already implemented in game-flow.ts
// It's registered separately in the tools/index.ts registry
// We don't re-export it here to avoid duplication

// ============================================================================
// Tool 9: Playoff Implications
// ============================================================================

export const fetchPlayoffImplicationsTool: ReportTool<
  { leagueId: string; week: number; rosterId1: number; rosterId2: number },
  {
    stakes: 'high' | 'medium' | 'low';
    description: string;
    team1Context: {
      record: string;
      rank: number;
      recentForm: string;
      avgPointsLast3: number;
    };
    team2Context: {
      record: string;
      rank: number;
      recentForm: string;
      avgPointsLast3: number;
    };
  }
> = {
  name: 'fetch_playoff_implications',
  description: 'Determines playoff stakes with team records, trends, and positioning',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string', description: 'League ID' },
      week: { type: 'number', description: 'Current week number' },
      rosterId1: { type: 'number', description: 'First team roster ID' },
      rosterId2: { type: 'number', description: 'Second team roster ID' },
    },
    required: ['leagueId', 'week', 'rosterId1', 'rosterId2'],
  },
  execute: async (args: {
    leagueId: string;
    week: number;
    rosterId1: number;
    rosterId2: number;
  }) => {
    // Fetch records for both teams
    const records = await fetchTeamRecordsTool.execute({
      leagueId: args.leagueId,
      week: args.week,
      rosterId1: args.rosterId1,
      rosterId2: args.rosterId2,
    });

    // Fetch all rosters to calculate standings/rank
    const rosters = await sleeperClient.fetchRosters(args.leagueId);
    const sortedRosters = rosters
      .map(r => ({
        rosterId: r.roster_id,
        wins: r.settings.wins || 0,
        losses: r.settings.losses || 0,
        pointsFor: r.settings.fpts || 0,
      }))
      .sort((a, b) => {
        // Sort by wins first, then points for
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.pointsFor - a.pointsFor;
      });

    const team1Rank = sortedRosters.findIndex(r => r.rosterId === args.rosterId1) + 1;
    const team2Rank = sortedRosters.findIndex(r => r.rosterId === args.rosterId2) + 1;

    // Calculate recent form (last 3 weeks)
    const calculateRecentForm = async (
      rosterId: number,
    ): Promise<{ form: string; avgPts: number }> => {
      const recentWeeks = Math.max(1, args.week - 3);
      const weeks = Array.from({ length: args.week - recentWeeks }, (_, i) => recentWeeks + i);

      let wins = 0;
      let losses = 0;
      let totalPoints = 0;

      for (const week of weeks) {
        const weekMatchups = await sleeperClient.fetchMatchups(args.leagueId, week);
        const teamMatchup = weekMatchups.find(m => m.roster_id === rosterId);

        if (teamMatchup) {
          totalPoints += teamMatchup.points || 0;
          const opponentMatchup = weekMatchups.find(
            m => m.matchup_id === teamMatchup.matchup_id && m.roster_id !== rosterId,
          );
          if (opponentMatchup) {
            if ((teamMatchup.points || 0) > (opponentMatchup.points || 0)) {
              wins++;
            } else {
              losses++;
            }
          }
        }
      }

      const avgPts = weeks.length > 0 ? Math.round((totalPoints / weeks.length) * 100) / 100 : 0;
      const form = `${wins}-${losses} in last ${weeks.length}`;

      return { form, avgPts };
    };

    const [team1Recent, team2Recent] = await Promise.all([
      calculateRecentForm(args.rosterId1),
      calculateRecentForm(args.rosterId2),
    ]);

    // Determine stakes based on week, records, and positioning
    let stakes: 'high' | 'medium' | 'low';
    let description: string;

    // Helper to format record string
    const formatRecord = (team: typeof records.team1): string =>
      `${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`;

    const team1RecordStr = formatRecord(records.team1);
    const team2RecordStr = formatRecord(records.team2);

    if (args.week >= 13) {
      // Late season - playoff push
      stakes = 'high';
      description = `Critical playoff positioning in Week ${args.week}. Team 1 (${team1RecordStr}, rank #${team1Rank}) vs Team 2 (${team2RecordStr}, rank #${team2Rank}). Both teams fighting for playoff seeding.`;
    } else if (args.week >= 8) {
      // Mid season - playoff picture forming
      stakes = 'medium';
      description = `Playoff implications emerging in Week ${args.week}. Team 1 (${team1RecordStr}) ranked #${team1Rank}, Team 2 (${team2RecordStr}) ranked #${team2Rank}. Strong records building toward postseason.`;
    } else {
      // Early season
      if (team1Rank <= 4 || team2Rank <= 4) {
        stakes = 'medium';
        description = `Early-season matchup between top-tier teams. Team 1 ranked #${team1Rank}, Team 2 ranked #${team2Rank}. Setting the pace for playoff positioning.`;
      } else {
        stakes = 'low';
        description = `Regular season matchup in Week ${args.week}. Team 1 (${team1RecordStr}) vs Team 2 (${team2RecordStr}). Building momentum for the season ahead.`;
      }
    }

    return {
      stakes,
      description,
      team1Context: {
        record: team1RecordStr,
        rank: team1Rank,
        recentForm: team1Recent.form,
        avgPointsLast3: team1Recent.avgPts,
      },
      team2Context: {
        record: team2RecordStr,
        rank: team2Rank,
        recentForm: team2Recent.form,
        avgPointsLast3: team2Recent.avgPts,
      },
    };
  },
};

// ============================================================================
// Tool 10: Position Breakdown
// ============================================================================

export const fetchPositionBreakdownTool: ReportTool<
  { leagueId: string; week: number; matchupId: number },
  { team1: PositionBreakdown; team2: PositionBreakdown }
> = {
  name: 'fetch_position_breakdown',
  description: 'Breaks down scoring by position for each team',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string', description: 'League ID' },
      week: { type: 'number', description: 'Week number' },
      matchupId: { type: 'number', description: 'Matchup ID (1-6)' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: { leagueId: string; week: number; matchupId: number }) => {
    const matchups = await sleeperClient.fetchMatchups(args.leagueId, args.week);
    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);
    const players = await sleeperClient.fetchAllPlayers();

    const buildPositionBreakdown = (matchup: SleeperMatchup): PositionBreakdown => {
      const breakdown: PositionBreakdown = {
        rosterId: matchup.roster_id,
        positions: { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 },
      };

      if (!matchup.players || !matchup.players_points) return breakdown;

      matchup.players.forEach(playerId => {
        const player = players[playerId];
        const points = matchup.players_points![playerId] || 0;
        const position = player?.position || 'UNKNOWN';

        if (position in breakdown.positions) {
          breakdown.positions[position as keyof typeof breakdown.positions] += points;
        }
      });

      // Round to 2 decimals
      Object.keys(breakdown.positions).forEach(pos => {
        const key = pos as keyof typeof breakdown.positions;
        breakdown.positions[key] = Math.round(breakdown.positions[key] * 100) / 100;
      });

      return breakdown;
    };

    return {
      team1: buildPositionBreakdown(matchupTeams[0]),
      team2: buildPositionBreakdown(matchupTeams[1]),
    };
  },
};

// ============================================================================
// Tool 11: Key Player Performances
// ============================================================================

export const fetchKeyPlayerPerformancesTool: ReportTool<
  { leagueId: string; week: number; matchupId: number },
  { team1: KeyPlayerPerformance[]; team2: KeyPlayerPerformance[] }
> = {
  name: 'fetch_key_player_performances',
  description: 'Fetches top 3 performers from each team in the matchup',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string', description: 'League ID' },
      week: { type: 'number', description: 'Week number' },
      matchupId: { type: 'number', description: 'Matchup ID (1-6)' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: { leagueId: string; week: number; matchupId: number }) => {
    const matchups = await sleeperClient.fetchMatchups(args.leagueId, args.week);
    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);
    const players = await sleeperClient.fetchAllPlayers();

    const getTopPerformers = (matchup: SleeperMatchup): KeyPlayerPerformance[] => {
      // Use STARTERS only, not all roster players
      if (!matchup.starters || !matchup.players_points) return [];

      const performances = matchup.starters
        .filter(playerId => playerId) // Filter out null/undefined
        .map(playerId => {
          const player = players[playerId];
          const points = matchup.players_points![playerId] || 0;
          // Projection would come from projections API in production
          const projected = points * 0.9; // Mock: assume performed 10% better than projected

          return {
            playerId,
            playerName: player ? `${player.first_name} ${player.last_name}` : playerId,
            position: player?.position || 'UNKNOWN',
            points: Math.round(points * 100) / 100,
            projected: Math.round(projected * 100) / 100,
            overUnder: Math.round((points - projected) * 100) / 100,
          };
        });

      return performances.sort((a, b) => b.points - a.points).slice(0, 3);
    };

    return {
      team1: getTopPerformers(matchupTeams[0]),
      team2: getTopPerformers(matchupTeams[1]),
    };
  },
};
