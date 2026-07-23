import { NextResponse } from 'next/server';
import {
  getAllLeagues,
  getCurrentWeek,
  getLeagueById,
  getMatchupsByWeek,
  getRostersByLeague,
  getUsersByLeague,
} from '@/lib/api-replacements';
import { getCurrentLeagues } from '@/config/leagues';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');
  const leagueId = searchParams.get('leagueId');

  try {
    let selectedLeagueId = leagueId;

    if (!selectedLeagueId) {
      // Use first current league as default
      const currentLeagues = getCurrentLeagues();
      if (currentLeagues.length === 0) {
        return NextResponse.json({ error: 'No leagues configured' }, { status: 404 });
      }
      selectedLeagueId = currentLeagues[0].id;
    }

    // Fetch league data from Sleeper API (no database!)
    const league = await getLeagueById(selectedLeagueId);

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    // Fetch additional data
    const currentWeek = await getCurrentWeek();
    const [rosters, users, matchups] = await Promise.all([
      getRostersByLeague(selectedLeagueId),
      getUsersByLeague(selectedLeagueId),
      getMatchupsByWeek(selectedLeagueId, currentWeek),
    ]);

    // Map users to rosters and add matchup data
    const usersMap = new Map(users.map((u: any) => [u.id, u]));
    const matchupsByRoster = new Map<number, any[]>();

    matchups.forEach((m: any) => {
      if (!matchupsByRoster.has(m.rosterId)) {
        matchupsByRoster.set(m.rosterId, []);
      }
      matchupsByRoster.get(m.rosterId)!.push({
        week: m.week,
        points: m.points,
        matchupId: m.matchupId,
      });
    });

    const rostersWithDetails = rosters.map((roster: any) => ({
      ...roster,
      owner: usersMap.get(roster.ownerId),
      matchups: matchupsByRoster.get(roster.rosterId) || [],
      weeklyMetrics: [], // Can be calculated if needed
    }));

    const leagueWithDetails = {
      ...league,
      rosters: rostersWithDetails,
      dbQueries: 0, // ZERO database queries!
      dataSource: 'sleeper-api',
    };

    return NextResponse.json(leagueWithDetails);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('league:overview error', {
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    const body = debug
      ? {
          ok: false,
          error: {
            code: 'INTERNAL',
            message: 'Failed to fetch league overview',
            hasDbUrl: Boolean(process.env.DATABASE_URL),
            detail: (error as Error).message,
          },
        }
      : { error: 'Internal Server Error' };
    return NextResponse.json(body, { status: 500 });
  }
};
