import { NextResponse } from 'next/server';
import { getAllLeagues, getRostersByLeague, getUsersByLeague } from '@/lib/api-replacements';
import { getCurrentLeagues } from '@/config/leagues';

export const GET = async () => {
  try {
    // Get current leagues from config
    const currentLeagues = getCurrentLeagues();
    if (currentLeagues.length === 0) {
      return NextResponse.json({ teams: [] });
    }

    // Fetch teams from ALL leagues, not just the first one
    const allTeams = [];

    for (const league of currentLeagues) {
      // Fetch rosters and users from Sleeper API (no database!)
      const [rosters, users] = await Promise.all([
        getRostersByLeague(league.id),
        getUsersByLeague(league.id),
      ]);

      // Map users to rosters
      const usersMap = new Map(users.map((u: any) => [u.id, u]));

      const teams = rosters.map((r: any) => {
        const owner = usersMap.get(r.ownerId);
        const metadata = owner?.metadata || {};
        const teamName = metadata.team_name || metadata.teamName;

        return {
          id: r.rosterId,
          name: teamName || owner?.displayName || owner?.username || `Team ${r.rosterId}`,
          owner: owner?.displayName || owner?.username || 'Unknown',
          leagueId: league.id,
          leagueName: league.name,
        };
      });

      allTeams.push(...teams);
    }

    return NextResponse.json({
      teams: allTeams,
      dbQueries: 0, // ZERO database queries!
      dataSource: 'sleeper-api',
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
