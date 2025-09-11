/**
 * Client-side calculations for team statistics
 * Computes values directly from Sleeper API data without relying on database
 */

import { CACHE_DURATIONS, LEAGUE_IDS, REGULAR_SEASON_WEEKS } from './constants';

export interface TeamWeekResult {
  rosterId: number;
  week: number;
  points: number;
  opponentRosterId?: number;
  opponentPoints?: number;
  won: boolean;
  expectedWins: number;
  luck: number;
}

export interface TeamSeasonStats {
  rosterId: number;
  teamName: string;
  wins: number;
  losses: number;
  totalPoints: number;
  totalExpectedWins: number;
  totalLuck: number;
  weeklyResults: TeamWeekResult[];
}

export interface PositionalScoring {
  position: string;
  team: number;
  opponent: number;
  leagueAverage: number;
}

/**
 * Calculate expected wins for a single week
 * Expected wins = (# of teams you would beat) / (total teams - 1)
 */
function calculateExpectedWins(yourScore: number, allScores: number[]): number {
  const otherScores = allScores.filter(score => score !== yourScore);
  if (otherScores.length === 0) return 0;

  let beatenTeams = 0;
  let tiedTeams = 0;

  for (const score of otherScores) {
    if (yourScore > score) beatenTeams++;
    else if (yourScore === score) tiedTeams++;
  }

  // Give half credit for ties (excluding yourself from ties)
  const expectedWins = (beatenTeams + tiedTeams * 0.5) / otherScores.length;
  return expectedWins;
}

/**
 * Calculate luck rating for a single week
 * Luck = Actual Win (1 or 0) - Expected Wins
 */
function calculateLuck(won: boolean, expectedWins: number): number {
  return (won ? 1 : 0) - expectedWins;
}

/**
 * Process matchups data to calculate expected wins and luck for all teams
 */
export function calculateTeamStats(
  rosters: any[],
  matchupsByWeek: Map<number, any[]>,
  users: any[]
): TeamSeasonStats[] {
  const teamStats: Map<number, TeamSeasonStats> = new Map();
  const userMap = new Map(users.map(u => [u.user_id, u]));

  // Initialize team stats
  rosters.forEach(roster => {
    const user = userMap.get(roster.owner_id);
    const teamName =
      user?.metadata?.team_name ||
      user?.display_name ||
      user?.username ||
      `Team ${roster.roster_id}`;

    teamStats.set(roster.roster_id, {
      rosterId: roster.roster_id,
      teamName,
      wins: 0,
      losses: 0,
      totalPoints: 0,
      totalExpectedWins: 0,
      totalLuck: 0,
      weeklyResults: [],
    });
  });

  // Process each week
  for (let week = 1; week <= REGULAR_SEASON_WEEKS; week++) {
    const weekMatchups = matchupsByWeek.get(week);
    if (!weekMatchups || weekMatchups.length === 0) continue;

    // Group matchups by matchup_id to find opponents
    const matchupGroups = new Map<number, any[]>();
    weekMatchups.forEach(m => {
      if (!matchupGroups.has(m.matchup_id)) {
        matchupGroups.set(m.matchup_id, []);
      }
      matchupGroups.get(m.matchup_id)!.push(m);
    });

    // Get all scores for the week (for expected wins calculation)
    const allScores = weekMatchups.map(m => m.points || 0);

    // Process each team's result for the week
    weekMatchups.forEach(matchup => {
      const team = teamStats.get(matchup.roster_id);
      if (!team) return;

      const points = matchup.points || 0;
      team.totalPoints += points;

      // Find opponent
      const matchupGroup = matchupGroups.get(matchup.matchup_id) || [];
      const opponent = matchupGroup.find(m => m.roster_id !== matchup.roster_id);
      const opponentPoints = opponent?.points || 0;
      const won = points > opponentPoints;

      // Update wins/losses
      if (won) team.wins++;
      else team.losses++;

      // Calculate expected wins and luck
      const expectedWins = calculateExpectedWins(points, allScores);
      const luck = calculateLuck(won, expectedWins);

      team.totalExpectedWins += expectedWins;
      team.totalLuck += luck;

      // Store weekly result
      team.weeklyResults.push({
        rosterId: matchup.roster_id,
        week,
        points,
        opponentRosterId: opponent?.roster_id,
        opponentPoints,
        won,
        expectedWins,
        luck,
      });
    });
  }

  return Array.from(teamStats.values());
}

/**
 * Calculate positional scoring statistics
 */
export function calculatePositionalScoring(
  matchupsByWeek: Map<number, any[]>,
  playerStats: Map<string, any>,
  rosterId: number
): PositionalScoring[] {
  const positionTotals: Map<
    string,
    { team: number; opponent: number; leagueTotal: number; teamCount: number }
  > = new Map();
  const validPositions = ['QB', 'RB', 'WR', 'TE', 'DEF'];

  // Initialize position totals
  validPositions.forEach(pos => {
    positionTotals.set(pos, { team: 0, opponent: 0, leagueTotal: 0, teamCount: 0 });
  });

  // Process each week
  for (let week = 1; week <= REGULAR_SEASON_WEEKS; week++) {
    const weekMatchups = matchupsByWeek.get(week);
    if (!weekMatchups) continue;

    // Group by matchup_id
    const matchupGroups = new Map<number, any[]>();
    weekMatchups.forEach(m => {
      if (!matchupGroups.has(m.matchup_id)) {
        matchupGroups.set(m.matchup_id, []);
      }
      matchupGroups.get(m.matchup_id)!.push(m);
    });

    // Process all matchups for league totals and our team
    weekMatchups.forEach(matchup => {
      const isOurTeam = matchup.roster_id === rosterId;
      const matchupGroup = matchupGroups.get(matchup.matchup_id) || [];
      const isOpponent = matchupGroup.some(
        m => m.roster_id === rosterId && m.roster_id !== matchup.roster_id
      );

      // Process each starter's points by position
      if (matchup.starters_points) {
        matchup.starters.forEach((playerId: string, idx: number) => {
          const points = matchup.starters_points[idx] || 0;
          const player = playerStats.get(playerId);
          if (!player) return;

          const position = player.position;
          if (!validPositions.includes(position)) return;

          const posTotals = positionTotals.get(position)!;

          // Add to league total for all teams
          posTotals.leagueTotal += points;

          // Add to our team total if it's our team
          if (isOurTeam) {
            posTotals.team += points;
          }

          // Add to opponent total if it's our opponent
          if (isOpponent) {
            posTotals.opponent += points;
          }
        });
      }
    });
  }

  // Calculate averages and return
  const numTeams = new Set(
    Array.from(matchupsByWeek.values())
      .flat()
      .map(m => m.roster_id)
  ).size;

  return validPositions.map(position => {
    const totals = positionTotals.get(position)!;
    return {
      position,
      team: totals.team,
      opponent: totals.opponent,
      leagueAverage: numTeams > 0 ? totals.leagueTotal / numTeams : 0,
    };
  });
}

/**
 * Cache helper for client-side calculations
 */
class CalculationCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  get(key: string, maxAge: number = CACHE_DURATIONS.ONE_WEEK): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const calculationCache = new CalculationCache();
