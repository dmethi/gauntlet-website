import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import { getRealNameByRoster } from '@/lib/username-mapping';
import type { ReportTool } from './base';
import type { Standings, StandingsEntry } from '../types';

/**
 * Standings Tool
 * Fetches current league standings with playoff seeding.
 */

interface StandingsArgs {
  week: number;
}

interface DivisionStandings {
  name: string;
  teams: StandingsEntry[];
}

interface LeagueStandingsWithDivisions {
  league: 'AFC' | 'NFC';
  divisions: DivisionStandings[];
  allTeams: StandingsEntry[]; // Flat list for backward compatibility
  playoffLine: number;
}

interface StandingsResult {
  afc: LeagueStandingsWithDivisions;
  nfc: LeagueStandingsWithDivisions;
}

/**
 * Division name mapping (1 = North, 2 = South, 3 = East).
 */
const getDivisionName = (divisionNum: number | null): string => {
  const divisionNames: Record<number, string> = {
    1: 'North',
    2: 'South',
    3: 'East',
  };
  return divisionNum ? divisionNames[divisionNum] || `Division ${divisionNum}` : 'Unknown';
};

/**
 * Calculate standings for a specific league.
 */
const calculateStandings = async (
  leagueId: string,
  leagueName: 'AFC' | 'NFC',
  week: number,
): Promise<LeagueStandingsWithDivisions> => {
  // Fetch all matchups up to current week
  const matchupsByWeek = await Promise.all(
    Array.from({ length: week }, (_, i) => sleeperClient.fetchMatchups(leagueId, i + 1)),
  );

  const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);

  // Calculate each team's record
  const standings: StandingsEntry[] = rosters.map(roster => {
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let pointsFor = 0;
    let pointsAgainst = 0;

    matchupsByWeek.forEach(weekMatchups => {
      const team = weekMatchups.find(m => m.roster_id === roster.roster_id);
      if (!team) return;

      const opponent = weekMatchups.find(
        m => m.matchup_id === team.matchup_id && m.roster_id !== roster.roster_id,
      );
      if (!opponent) return;

      const teamScore = team.points || 0;
      const oppScore = opponent.points || 0;

      pointsFor += teamScore;
      pointsAgainst += oppScore;

      if (teamScore > oppScore) wins++;
      else if (oppScore > teamScore) losses++;
      else ties++;
    });

    const totalGames = wins + losses + ties;
    const winPct = totalGames > 0 ? wins / totalGames : 0;

    const ownerName =
      getRealNameByRoster(leagueId, roster.roster_id) || roster.metadata?.owner_name || 'Unknown';

    // Get division from roster settings (1, 2, or 3)
    const division = (roster.settings as any)?.division || null;

    // Get team name from owner metadata (where Sleeper stores it)
    const teamName =
      roster.owner?.metadata?.team_name ||
      roster.metadata?.team_name ||
      roster.owner?.display_name ||
      `Team ${roster.roster_id}`;

    return {
      rank: 0, // Will be set after sorting
      rosterId: roster.roster_id,
      teamName,
      ownerName,
      wins,
      losses,
      ties,
      winPct: Math.round(winPct * 1000) / 1000,
      pointsFor: Math.round(pointsFor * 100) / 100,
      pointsAgainst: Math.round(pointsAgainst * 100) / 100,
      playoffSeed: null,
      division,
    };
  });

  // Sort by win percentage, then by points for (tiebreaker)
  standings.sort((a, b) => {
    if (b.winPct !== a.winPct) return b.winPct - a.winPct;
    return b.pointsFor - a.pointsFor;
  });

  // Assign overall ranks
  standings.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  // Calculate playoff seeds: 3 division winners + 3 wild cards
  const divisionWinners: StandingsEntry[] = [];
  const divisions = [1, 2, 3];

  // Find the best team in each division
  divisions.forEach(divNum => {
    const divisionTeams = standings.filter((s: any) => s.division === divNum);
    if (divisionTeams.length > 0) {
      divisionWinners.push(divisionTeams[0]); // First team in division (already sorted by record)
    }
  });

  // Sort division winners by record (they get seeds 1-3)
  divisionWinners.sort((a, b) => {
    if (b.winPct !== a.winPct) return b.winPct - a.winPct;
    return b.pointsFor - a.pointsFor;
  });

  // Assign seeds 1-3 to division winners
  divisionWinners.forEach((winner, i) => {
    winner.playoffSeed = i + 1;
  });

  // Find wild card teams (best remaining teams not already seeded)
  const wildCardCandidates = standings.filter(s => s.playoffSeed === null);
  const wildCards = wildCardCandidates.slice(0, 3); // Top 3 remaining teams

  // Assign seeds 4-6 to wild cards
  wildCards.forEach((wildCard, i) => {
    wildCard.playoffSeed = i + 4; // Seeds 4, 5, 6
  });

  // Group teams by division
  const divisionGroups: Record<number, StandingsEntry[]> = {
    1: [],
    2: [],
    3: [],
  };

  standings.forEach(team => {
    if (team.division && divisionGroups[team.division]) {
      divisionGroups[team.division].push(team);
    }
  });

  // Create division standings array with proper names
  const divisionStandings: DivisionStandings[] = divisions
    .map(divNum => ({
      name: getDivisionName(divNum),
      teams: divisionGroups[divNum] || [],
    }))
    .filter(div => div.teams.length > 0); // Only include divisions with teams

  return {
    league: leagueName,
    divisions: divisionStandings,
    allTeams: standings, // Keep flat list for backward compatibility
    playoffLine: 6,
  };
};

/**
 * Tool: Fetches standings for both leagues with playoff seeding.
 */
export const fetchStandingsTool: ReportTool<StandingsArgs, StandingsResult> = {
  name: 'fetch_standings',
  description: 'Fetches current league standings with playoff seeding for both AFC and NFC',

  parameters: {
    type: 'object',
    properties: {
      week: {
        type: 'number',
        description: 'Current NFL week (1-18)',
      },
    },
    required: ['week'],
  },

  execute: async (args: StandingsArgs): Promise<StandingsResult> => {
    // Calculate standings for both leagues in parallel
    const [afcStandings, nfcStandings] = await Promise.all([
      calculateStandings(LEAGUE_IDS.AFC, 'AFC', args.week),
      calculateStandings(LEAGUE_IDS.NFC, 'NFC', args.week),
    ]);

    return {
      afc: afcStandings,
      nfc: nfcStandings,
    };
  },
};
