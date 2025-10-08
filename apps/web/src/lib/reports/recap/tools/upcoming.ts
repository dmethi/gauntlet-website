import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import { getRealNameByRoster } from '@/lib/username-mapping';
import type { ReportTool } from './base';
import type { SleeperMatchup, SleeperRoster } from '@gauntlet/types';

/**
 * Upcoming Matchups Tool
 * Fetches next week's matchups with team records for preview.
 */

interface UpcomingMatchupsArgs {
  currentWeek: number;
}

interface UpcomingMatchup {
  matchupId: number;
  leagueId: string;
  league: 'AFC' | 'NFC';
  team1: {
    rosterId: number;
    teamName: string;
    ownerName: string;
    record: string;
    pointsFor: number;
  };
  team2: {
    rosterId: number;
    teamName: string;
    ownerName: string;
    record: string;
    pointsFor: number;
  };
  storyline: string;
}

interface UpcomingMatchupsResult {
  week: number;
  available: boolean;
  message?: string;
  afc: UpcomingMatchup[];
  nfc: UpcomingMatchup[];
  totalMatchups: number;
}

/**
 * Calculate team record through a specific week.
 */
const calculateRecord = async (
  rosterId: number,
  leagueId: string,
  throughWeek: number,
): Promise<{ wins: number; losses: number; pointsFor: number }> => {
  const matchupsByWeek = await Promise.all(
    Array.from({ length: throughWeek }, (_, i) => sleeperClient.fetchMatchups(leagueId, i + 1)),
  );

  let wins = 0;
  let losses = 0;
  let pointsFor = 0;

  matchupsByWeek.forEach(weekMatchups => {
    const team = weekMatchups.find(m => m.roster_id === rosterId);
    if (!team) return;

    const opponent = weekMatchups.find(
      m => m.matchup_id === team.matchup_id && m.roster_id !== rosterId,
    );
    if (!opponent) return;

    const teamScore = team.points || 0;
    const oppScore = opponent.points || 0;

    pointsFor += teamScore;

    if (teamScore > oppScore) wins++;
    else if (oppScore > teamScore) losses++;
  });

  return { wins, losses, pointsFor: Math.round(pointsFor * 100) / 100 };
};

/**
 * Generate storyline based on team records.
 */
const generateStoryline = (team1Wins: number, team2Wins: number): string => {
  if (team1Wins >= 4 && team2Wins >= 4) {
    return 'Battle of playoff contenders';
  } else if (team1Wins <= 1 && team2Wins <= 1) {
    return 'Elimination game territory';
  } else if (Math.abs(team1Wins - team2Wins) >= 3) {
    return 'David vs Goliath matchup';
  } else if (team1Wins === team2Wins) {
    return 'Even matchup';
  }
  return '';
};

/**
 * Build upcoming matchups for a league.
 */
const buildUpcomingMatchups = async (
  matchups: SleeperMatchup[],
  rosters: SleeperRoster[],
  leagueId: string,
  leagueName: 'AFC' | 'NFC',
  currentWeek: number,
): Promise<UpcomingMatchup[]> => {
  const upcoming: UpcomingMatchup[] = [];
  const processedMatchupIds = new Set<number>();

  for (const matchup of matchups) {
    if (processedMatchupIds.has(matchup.matchup_id)) continue;
    processedMatchupIds.add(matchup.matchup_id);

    const opponent = matchups.find(
      m => m.matchup_id === matchup.matchup_id && m.roster_id !== matchup.roster_id,
    );

    if (!opponent) continue;

    const team1Roster = rosters.find(r => r.roster_id === matchup.roster_id);
    const team2Roster = rosters.find(r => r.roster_id === opponent.roster_id);

    const [team1Record, team2Record] = await Promise.all([
      calculateRecord(matchup.roster_id, leagueId, currentWeek),
      calculateRecord(opponent.roster_id, leagueId, currentWeek),
    ]);

    const storyline = generateStoryline(team1Record.wins, team2Record.wins);

    upcoming.push({
      matchupId: matchup.matchup_id,
      leagueId,
      league: leagueName,
      team1: {
        rosterId: matchup.roster_id,
        teamName: team1Roster?.metadata?.team_name || `Team ${matchup.roster_id}`,
        ownerName: getRealNameByRoster(leagueId, matchup.roster_id) || 'Unknown',
        record: `${team1Record.wins}-${team1Record.losses}`,
        pointsFor: team1Record.pointsFor,
      },
      team2: {
        rosterId: opponent.roster_id,
        teamName: team2Roster?.metadata?.team_name || `Team ${opponent.roster_id}`,
        ownerName: getRealNameByRoster(leagueId, opponent.roster_id) || 'Unknown',
        record: `${team2Record.wins}-${team2Record.losses}`,
        pointsFor: team2Record.pointsFor,
      },
      storyline,
    });
  }

  return upcoming;
};

/**
 * Tool: Fetches next week's matchups with records for preview.
 */
export const fetchNextWeekMatchupsTool: ReportTool<UpcomingMatchupsArgs, UpcomingMatchupsResult> = {
  name: 'fetch_next_week_matchups',
  description: "Fetches next week's matchups with team records for preview",

  parameters: {
    type: 'object',
    properties: {
      currentWeek: {
        type: 'number',
        description: 'Current week number (1-18)',
      },
    },
    required: ['currentWeek'],
  },

  execute: async (args: UpcomingMatchupsArgs): Promise<UpcomingMatchupsResult> => {
    const nextWeek = args.currentWeek + 1;

    // Fetch next week's matchups (may not be set yet early in the week)
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, nextWeek).catch(() => []),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, nextWeek).catch(() => []),
    ]);

    // If next week's matchups aren't available, return empty
    if (afcMatchups.length === 0 && nfcMatchups.length === 0) {
      return {
        week: nextWeek,
        available: false,
        message: "Next week's matchups not yet available",
        afc: [],
        nfc: [],
        totalMatchups: 0,
      };
    }

    // Fetch rosters for both leagues
    const [afcRosters, nfcRosters] = await Promise.all([
      sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.AFC),
      sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.NFC),
    ]);

    // Build upcoming matchups for both leagues
    const [afcUpcoming, nfcUpcoming] = await Promise.all([
      buildUpcomingMatchups(afcMatchups, afcRosters, LEAGUE_IDS.AFC, 'AFC', args.currentWeek),
      buildUpcomingMatchups(nfcMatchups, nfcRosters, LEAGUE_IDS.NFC, 'NFC', args.currentWeek),
    ]);

    return {
      week: nextWeek,
      available: true,
      afc: afcUpcoming,
      nfc: nfcUpcoming,
      totalMatchups: afcUpcoming.length + nfcUpcoming.length,
    };
  },
};
