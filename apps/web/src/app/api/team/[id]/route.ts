import { NextRequest, NextResponse } from 'next/server';
import { getCurrentLeagues } from '@/config/leagues';
import { sleeperClient } from '@/lib/sleeper/unified-client';
import { resolveCompletedWeeks } from '@/shared/utils/season-weeks';
import { calculateTeamStats } from '@/shared/utils/calculations';

export const dynamic = 'force-dynamic';

export const GET = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const teamId = params.id;

  try {
    // Parse team ID - format could be "leagueId-rosterId" or just "rosterId"
    let leagueId!: string; // Will be assigned in both branches
    let rosterId!: number; // Will be assigned in both branches

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
          const rosters = await sleeperClient.fetchRosters(league.id);
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

    // Fetch all necessary data
    const [nflState, league, rosters, users] = await Promise.all([
      sleeperClient.fetchNFLState(),
      sleeperClient.fetchLeague(leagueId),
      sleeperClient.fetchRosters(leagueId),
      sleeperClient.fetchUsers(leagueId),
    ]);

    // Determine how many weeks to fetch
    const completedWeeks = resolveCompletedWeeks(league, nflState);

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
        sleeperClient
          .fetchMatchups(leagueId, week)
          .then(matchups => ({ week, matchups }))
          .catch(() => ({ week, matchups: [] })),
      );
    }

    const allMatchupData = await Promise.all(matchupPromises);

    // Expected wins/luck need every roster's score for the week, not just this
    // roster's — reuse the same computation the standings page uses.
    const matchupsByWeek = new Map(allMatchupData.map(({ week, matchups }) => [week, matchups]));
    const allTeamStats = calculateTeamStats(rosters, matchupsByWeek, users);
    const teamWeeklyResults = allTeamStats.find(t => t.rosterId === rosterId)?.weeklyResults ?? [];

    // Process matchups for this specific roster
    const matchups = [];
    const weeklyMetrics = [];

    for (const { week, matchups: weekMatchups } of allMatchupData) {
      const teamMatchup = weekMatchups.find(m => m.roster_id === rosterId);
      if (teamMatchup) {
        // Find opponent
        const opponentMatchup = weekMatchups.find(
          m => m.matchup_id === teamMatchup.matchup_id && m.roster_id !== rosterId,
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

        const weeklyResult = teamWeeklyResults.find(wr => wr.week === week);

        weeklyMetrics.push({
          week,
          totalPoints: teamPoints,
          expectedWins: weeklyResult?.expectedWins ?? 0,
          luckRating: weeklyResult?.luck ?? 0,
          opponentPoints,
        });
      }
    }

    const userMap = new Map(users.map(u => [u.user_id, u]));
    const rostersForResponse = rosters.map(r => {
      const rosterOwner = userMap.get(r.owner_id);
      return {
        id: r.roster_id,
        owner: {
          displayName: rosterOwner?.display_name || rosterOwner?.username || 'Unknown',
          username: rosterOwner?.username || 'Unknown',
          metadata: {
            team_name: rosterOwner?.metadata?.team_name || '',
            ...rosterOwner?.metadata,
          },
        },
      };
    });

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
        rosters: rostersForResponse,
        settings: league.settings || {},
        season: parseInt(league.season, 10),
        currentWeek: nflState.week,
        status: 'active' as const,
        playoff_week_start: league.settings?.playoff_week_start || 15,
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
};
