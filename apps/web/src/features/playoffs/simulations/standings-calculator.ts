/**
 * Standings Calculator
 *
 * Calculates playoff seedings based on division-based rules:
 * - Seeds 1-3: Division winners (sorted by record, then points)
 * - Seeds 4-6: Wild card teams (best remaining teams by record, then points)
 * - Seeds 7-12: Non-playoff teams (remaining teams sorted by record, then points)
 */

import { sleeperClient } from '@/lib/sleeper/unified-client';
import type { TeamStanding, Week14Matchup } from '../types';

/**
 * Fetch current standings for a league through a specific week
 */
export const fetchCurrentStandings = async (
  leagueId: string,
  throughWeek: number,
): Promise<TeamStanding[]> => {
  const [rosters, users, league] = await Promise.all([
    sleeperClient.fetchRosters(leagueId),
    sleeperClient.fetchUsers(leagueId),
    sleeperClient.fetchLeague(leagueId),
  ]);

  // Build user map for quick lookups
  const userMap = new Map(users.map(u => [u.user_id, u]));

  // Fetch all matchups to calculate records and points
  const matchupPromises = Array.from({ length: throughWeek }, (_, i) =>
    sleeperClient.fetchMatchups(leagueId, i + 1),
  );
  const allMatchups = await Promise.all(matchupPromises);

  // Calculate each team's record and points
  const standings: TeamStanding[] = rosters.map(roster => {
    let wins = 0;
    let losses = 0;
    let pointsFor = 0;

    // Process each week's matchups
    allMatchups.forEach(weekMatchups => {
      const teamMatchup = weekMatchups.find(m => m.roster_id === roster.roster_id);
      if (!teamMatchup) return;

      const points = teamMatchup.points || 0;
      pointsFor += points;

      // Find opponent
      const opponent = weekMatchups.find(
        m => m.matchup_id === teamMatchup.matchup_id && m.roster_id !== roster.roster_id,
      );
      if (!opponent) return;

      const opponentPoints = opponent.points || 0;

      if (points > opponentPoints) wins++;
      else if (points < opponentPoints) losses++;
      // Ties are rare but would be counted as 0.5 wins each
    });

    const owner = userMap.get(roster.owner_id);
    const teamName =
      owner?.metadata?.team_name ||
      owner?.display_name ||
      owner?.username ||
      `Team ${roster.roster_id}`;

    // Division is available in Sleeper API but not in our type definitions
    const rosterSettings = roster.settings as any;

    return {
      rosterId: roster.roster_id,
      teamName,
      ownerName: owner?.display_name || owner?.username || 'Unknown',
      division: rosterSettings?.division || 1,
      wins,
      losses,
      pointsFor: Math.round(pointsFor * 100) / 100,
      leagueId,
    };
  });

  return standings;
};

/**
 * Fetch Week 14 matchup pairings for a league
 */
export const fetchWeek14Matchups = async (leagueId: string): Promise<Week14Matchup[]> => {
  const [matchups, rosters, users] = await Promise.all([
    sleeperClient.fetchMatchups(leagueId, 14),
    sleeperClient.fetchRosters(leagueId),
    sleeperClient.fetchUsers(leagueId),
  ]);

  const userMap = new Map(users.map(u => [u.user_id, u]));

  // Group matchups by matchup_id
  const matchupGroups = new Map<number, typeof matchups>();
  matchups.forEach(m => {
    if (!matchupGroups.has(m.matchup_id)) {
      matchupGroups.set(m.matchup_id, []);
    }
    matchupGroups.get(m.matchup_id)!.push(m);
  });

  const week14Matchups: Week14Matchup[] = [];

  matchupGroups.forEach((teams, matchupId) => {
    if (teams.length !== 2) return;

    const [team1, team2] = teams;
    const roster1 = rosters.find(r => r.roster_id === team1.roster_id);
    const roster2 = rosters.find(r => r.roster_id === team2.roster_id);
    const owner1 = roster1 ? userMap.get(roster1.owner_id) : null;
    const owner2 = roster2 ? userMap.get(roster2.owner_id) : null;

    week14Matchups.push({
      matchupId,
      team1RosterId: team1.roster_id,
      team2RosterId: team2.roster_id,
      team1Name: owner1?.metadata?.team_name || owner1?.display_name || `Team ${team1.roster_id}`,
      team2Name: owner2?.metadata?.team_name || owner2?.display_name || `Team ${team2.roster_id}`,
    });
  });

  return week14Matchups;
};

/**
 * Compare two teams by record (wins), then by points
 * Returns negative if a < b, positive if a > b, 0 if equal
 */
const compareTeams = (
  a: { wins: number; pointsFor: number },
  b: { wins: number; pointsFor: number },
): number => {
  // First by wins (descending)
  if (b.wins !== a.wins) return b.wins - a.wins;
  // Then by points (descending)
  return b.pointsFor - a.pointsFor;
};

/**
 * Calculate playoff seeds given standings
 *
 * Division-based seeding:
 * - Seeds 1-3: Division winners (best team in each division, sorted by record/points)
 * - Seeds 4-6: Wild card (best remaining teams, sorted by record/points)
 * - Seeds 7-12: Non-playoff teams (sorted by record/points)
 */
export const calculatePlayoffSeeds = (standings: TeamStanding[]): Map<number, number> => {
  const seeds = new Map<number, number>();

  // Group teams by division
  const divisions = new Map<number, TeamStanding[]>();
  standings.forEach(team => {
    if (!divisions.has(team.division)) {
      divisions.set(team.division, []);
    }
    divisions.get(team.division)!.push(team);
  });

  // Find division winners (best team in each division)
  const divisionWinners: TeamStanding[] = [];
  divisions.forEach(teams => {
    // Sort by record, then points
    teams.sort((a, b) => compareTeams(a, b));
    if (teams.length > 0) {
      divisionWinners.push(teams[0]);
    }
  });

  // Sort division winners by record/points
  divisionWinners.sort((a, b) => compareTeams(a, b));

  // Assign seeds 1-3 to division winners
  divisionWinners.forEach((team, index) => {
    seeds.set(team.rosterId, index + 1);
  });

  // Get remaining teams (not division winners)
  const remainingTeams = standings.filter(
    team => !divisionWinners.some(dw => dw.rosterId === team.rosterId),
  );

  // Sort remaining teams by record/points
  remainingTeams.sort((a, b) => compareTeams(a, b));

  // Assign seeds 4-6 to wild card teams
  const wildCardCount = Math.min(3, remainingTeams.length);
  for (let i = 0; i < wildCardCount; i++) {
    seeds.set(remainingTeams[i].rosterId, i + 4);
  }

  // Assign seeds 7-12 to non-playoff teams
  for (let i = wildCardCount; i < remainingTeams.length; i++) {
    seeds.set(remainingTeams[i].rosterId, i + 4);
  }

  return seeds;
};

/**
 * Apply simulated Week 14 results to standings
 */
export const applyWeek14Results = (
  standings: TeamStanding[],
  week14Matchups: Week14Matchup[],
  simulatedScores: Map<number, number>,
): TeamStanding[] => {
  // Create mutable copy of standings
  const updatedStandings = standings.map(team => ({ ...team }));

  // Apply Week 14 results
  week14Matchups.forEach(matchup => {
    const team1Score = simulatedScores.get(matchup.team1RosterId) || 0;
    const team2Score = simulatedScores.get(matchup.team2RosterId) || 0;

    const team1 = updatedStandings.find(t => t.rosterId === matchup.team1RosterId);
    const team2 = updatedStandings.find(t => t.rosterId === matchup.team2RosterId);

    if (team1 && team2) {
      // Update points
      (team1 as any).pointsFor += team1Score;
      (team2 as any).pointsFor += team2Score;

      // Update wins/losses
      if (team1Score > team2Score) {
        (team1 as any).wins += 1;
        (team2 as any).losses += 1;
      } else if (team2Score > team1Score) {
        (team2 as any).wins += 1;
        (team1 as any).losses += 1;
      }
      // Ties would add 0.5 to each, but are very rare
    }
  });

  return updatedStandings;
};

/**
 * Get teams sorted by seed (for cross-league matchups)
 */
export const getTeamsBySeed = (standings: TeamStanding[]): TeamStanding[] => {
  const seeds = calculatePlayoffSeeds(standings);

  // Sort by seed
  return [...standings].sort((a, b) => {
    const seedA = seeds.get(a.rosterId) || 99;
    const seedB = seeds.get(b.rosterId) || 99;
    return seedA - seedB;
  });
};
