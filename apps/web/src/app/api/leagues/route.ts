import { NextResponse } from 'next/server';
import { getAllLeagues, getRostersByLeague, getUsersByLeague } from '@/lib/api-replacements';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');

  try {
    // Fetch all leagues from Sleeper API (no database!)
    const leagues = await getAllLeagues();

    // Fetch rosters and users for each league
    const leaguesWithDetails = await Promise.all(
      leagues.map(async league => {
        const [rosters, users] = await Promise.all([
          getRostersByLeague(league.id),
          getUsersByLeague(league.id),
        ]);

        // Map users to rosters
        const usersMap = new Map(users.map((u: any) => [u.id, u]));
        const rostersWithOwners = rosters.map((roster: any) => ({
          ...roster,
          owner: usersMap.get(roster.ownerId),
          coOwnerDetails: [], // Co-owners can be added if needed
        }));

        return {
          ...league,
          rosters: rostersWithOwners,
          _count: {
            rosters: rosters.length,
            matchups: 0, // Can be calculated if needed
            transactions: 0, // Can be calculated if needed
          },
        };
      }),
    );

    return NextResponse.json({
      ok: true,
      data: leaguesWithDetails,
      count: leaguesWithDetails.length,
      dbQueries: 0, // ZERO database queries!
      dataSource: 'sleeper-api',
    });
  } catch (error) {
    // console.error('leagues API error:', {
    //   hasDbUrl: Boolean(process.env.DATABASE_URL),
    //   message: (error as Error).message,
    //   stack: (error as Error).stack,
    // });

    const body = debug
      ? {
          ok: false,
          error: {
            code: 'INTERNAL',
            message: 'Failed to fetch leagues',
            hasDbUrl: Boolean(process.env.DATABASE_URL),
            detail: (error as Error).message,
          },
        }
      : {
          ok: false,
          error: 'Internal Server Error',
        };

    return NextResponse.json(body, { status: 500 });
  }
}
