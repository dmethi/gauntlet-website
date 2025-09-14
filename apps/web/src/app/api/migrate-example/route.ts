import { NextRequest, NextResponse } from 'next/server';
// OLD: import { prisma } from '@/lib/prisma';
// NEW: Use replacements instead
import {
  getLeagueById,
  getRostersByLeague,
  getMatchupsByWeek,
  getCurrentWeek,
} from '@/lib/api-replacements';

/**
 * Example of how to migrate an API route from database to Sleeper API
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leagueId = searchParams.get('leagueId') || '1263744209295245312';

  try {
    // ❌ OLD WAY (Database)
    // const league = await prisma.league.findUnique({
    //   where: { id: leagueId },
    //   include: {
    //     rosters: true,
    //     matchups: { where: { week: currentWeek } }
    //   }
    // });

    // ✅ NEW WAY (No Database!)
    const currentWeek = await getCurrentWeek();
    const [league, rosters, matchups] = await Promise.all([
      getLeagueById(leagueId),
      getRostersByLeague(leagueId),
      getMatchupsByWeek(leagueId, currentWeek),
    ]);

    // Group matchups by matchup_id for pairing
    const matchupPairs = new Map<number, any[]>();
    matchups.forEach((m: any) => {
      if (!matchupPairs.has(m.matchupId)) {
        matchupPairs.set(m.matchupId, []);
      }
      matchupPairs.get(m.matchupId)!.push(m);
    });

    return NextResponse.json({
      league,
      rosters,
      matchups: Array.from(matchupPairs.values()),
      week: currentWeek,
      dbQueries: 0, // ZERO database queries!
      dataSource: 'sleeper-api',
    });
  } catch (error) {
    console.error('[MIGRATION EXAMPLE] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
