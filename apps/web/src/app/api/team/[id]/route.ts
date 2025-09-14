import { NextRequest, NextResponse } from 'next/server';
import { getCurrentLeagues } from '@/config/leagues';

interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar?: string;
  metadata?: {
    team_name?: string;
    [key: string]: any;
  };
}

interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  settings?: {
    division?: number;
    [key: string]: any;
  };
}

interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  playoff_week_start?: number;
  settings?: any;
  scoring_settings?: any;
}

interface SleeperMatchup {
  matchup_id: number;
  roster_id: number;
  points: number;
  starters_points?: number[];
}

async function fetchSleeperData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`https://api.sleeper.app/v1/${endpoint}`);
  if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return response.json();
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const teamId = params.id;

  try {
    // Parse team ID - format could be "leagueId-rosterId" or just "rosterId"
    let leagueId: string;
    let rosterId: number;

    if (teamId.includes('-')) {
      const parts = teamId.split('-');
      leagueId = parts[0];
      rosterId = parseInt(parts[1], 10);
    } else {
      // If no league ID provided, try to find the team across all leagues
      const currentLeagues = getCurrentLeagues();
      let foundTeam = false;

      for (const league of currentLeagues) {
        try {
          const rosters = await fetchSleeperData<SleeperRoster[]>(`league/${league.id}/rosters`);
          const targetRoster = rosters.find(r => r.roster_id === parseInt(teamId, 10));
          if (targetRoster) {
            leagueId = league.id;
            rosterId = parseInt(teamId, 10);
            foundTeam = true;
            break;
          }
        } catch (error) {
          continue; // Try next league
        }
      }

      if (!foundTeam) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
    }

    // Get current NFL week to determine how many weeks to fetch
    const nflState = await fetchSleeperData<{ week: number }>('state/nfl');
    const completedWeeks = Math.min(Math.max(nflState.week - 1, 1), 14);

    // Fetch all necessary data
    const [league, rosters, users] = await Promise.all([
      fetchSleeperData<SleeperLeague>(`league/${leagueId}`),
      fetchSleeperData<SleeperRoster[]>(`league/${leagueId}/rosters`),
      fetchSleeperData<SleeperUser[]>(`league/${leagueId}/users`),
    ]);

    // Find the specific roster
    const roster = rosters.find(r => r.roster_id === rosterId);
    if (!roster) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Find the owner
    const owner = users.find(u => u.user_id === roster.owner_id);

    // Fetch matchups for all completed weeks
    const matchupPromises = [];
    for (let week = 1; week <= completedWeeks; week++) {
      matchupPromises.push(
        fetchSleeperData<SleeperMatchup[]>(`league/${leagueId}/matchups/${week}`)
          .then(matchups => ({ week, matchups }))
          .catch(() => ({ week, matchups: [] }))
      );
    }

    const allMatchupData = await Promise.all(matchupPromises);

    // Process matchups for this specific roster
    const matchups = [];
    const weeklyMetrics = [];

    for (const { week, matchups: weekMatchups } of allMatchupData) {
      const teamMatchup = weekMatchups.find(m => m.roster_id === rosterId);
      if (teamMatchup) {
        // Find opponent
        const opponentMatchup = weekMatchups.find(
          m => m.matchup_id === teamMatchup.matchup_id && m.roster_id !== rosterId
        );

        const teamPoints = teamMatchup.points || 0;
        const opponentPoints = opponentMatchup?.points || 0;

        // Determine result
        let result: 'W' | 'L' | 'T' = 'L';
        if (teamPoints > opponentPoints) result = 'W';
        else if (teamPoints === opponentPoints) result = 'T';

        matchups.push({
          week,
          points: teamPoints,
          projected: teamPoints, // We don't have historical projections, use actual
          result,
          matchupId: teamMatchup.matchup_id,
        });

        // Calculate basic weekly metrics
        // For now, use simplified calculations since we don't have historical expected wins
        const expectedWins = teamPoints > 100 ? 0.6 : 0.4; // Simplified
        const luckRating = result === 'W' ? expectedWins - 0.5 : 0.5 - expectedWins;

        weeklyMetrics.push({
          week,
          totalPoints: teamPoints,
          expectedWins,
          luckRating,
          opponentPoints,
        });
      }
    }

    // Build the response in the expected format
    const teamData = {
      id: rosterId.toString(),
      name:
        owner?.metadata?.team_name || owner?.display_name || owner?.username || `Team ${rosterId}`,
      ownerId: roster.owner_id,
      roster: [], // We don't populate the full roster here as it's not used by the team page
      wins: matchups.filter(m => m.result === 'W').length,
      losses: matchups.filter(m => m.result === 'L').length,
      ties: matchups.filter(m => m.result === 'T').length,
      pointsFor: matchups.reduce((sum, m) => sum + m.points, 0),
      pointsAgainst: weeklyMetrics.reduce((sum, wm) => sum + wm.opponentPoints, 0),
      matchups,
      weeklyMetrics,
      league: {
        id: league.league_id,
        name: league.name,
        ownerId: '', // Not used
        teams: [], // Not used
        settings: league.settings || {},
        season: parseInt(league.season, 10),
        currentWeek: nflState.week,
        status: 'active' as const,
        playoff_week_start: league.playoff_week_start || 15,
      },
      settings: roster.settings,
      owner: {
        displayName: owner?.display_name || owner?.username || 'Unknown',
        username: owner?.username || 'Unknown',
        avatar: owner?.avatar,
        metadata: {
          team_name: owner?.metadata?.team_name || '',
          ...owner?.metadata,
        },
      },
      coOwnerDetails: [], // Not implemented yet
    };

    return NextResponse.json(teamData);
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
  }
}
