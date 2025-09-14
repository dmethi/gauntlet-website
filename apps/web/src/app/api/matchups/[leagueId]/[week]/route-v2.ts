/**
 * Matchups API - Migrated to Sleeper API
 * Fetches matchup data directly from Sleeper
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMatchupsByWeek, getRostersByLeague, getUsersByLeague } from '@/lib/api-replacements';
import { getLeague, getProjections, getNFLState } from '@/lib/sleeper-direct';

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string; week: string } }
) {
  const { leagueId, week } = params;
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');

  try {
    const weekNumber = parseInt(week);

    if (!leagueId || Number.isNaN(weekNumber)) {
      return NextResponse.json({ error: 'Invalid leagueId or week parameter' }, { status: 400 });
    }

    // Fetch all data from Sleeper API (no database!)
    const [league, rosters, users, matchups, nflState] = await Promise.all([
      getLeague(leagueId),
      getRostersByLeague(leagueId),
      getUsersByLeague(leagueId),
      getMatchupsByWeek(leagueId, weekNumber),
      getNFLState(),
    ]);

    // Get projections for the week
    const projections = await getProjections(weekNumber, nflState?.season || '2025');

    // Map users to rosters
    const usersMap = new Map(users.map((u: any) => [u.id, u]));
    const rostersMap = new Map(rosters.map((r: any) => [r.rosterId, r]));

    // Group matchups by matchup_id
    const matchupPairs = new Map<number, any[]>();
    matchups.forEach((m: any) => {
      if (!matchupPairs.has(m.matchupId)) {
        matchupPairs.set(m.matchupId, []);
      }
      const roster = rostersMap.get(m.rosterId);
      const owner = roster ? usersMap.get(roster.ownerId) : null;
      
      matchupPairs.get(m.matchupId)!.push({
        ...m,
        roster,
        owner,
      });
    });

    // Format response
    const formattedMatchups = Array.from(matchupPairs.values()).map(pair => {
      const [team1, team2] = pair;
      return {
        matchupId: team1.matchupId,
        week: weekNumber,
        team1: {
          rosterId: team1.rosterId,
          points: team1.points || 0,
          starters: team1.starters || [],
          owner: team1.owner,
        },
        team2: team2 ? {
          rosterId: team2.rosterId,
          points: team2.points || 0,
          starters: team2.starters || [],
          owner: team2.owner,
        } : null,
      };
    });

    return NextResponse.json({
      league,
      matchups: formattedMatchups,
      projections: Object.keys(projections).length,
      week: weekNumber,
      dbQueries: 0, // ZERO database queries!
      dataSource: 'sleeper-api',
      debug: debug ? { rosters: rosters.length, users: users.length, matchups: matchups.length } : undefined,
    });
  } catch (error) {
    console.error('Matchups v2 API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matchups', detail: debug ? (error as Error).message : undefined },
      { status: 500 }
    );
  }
}