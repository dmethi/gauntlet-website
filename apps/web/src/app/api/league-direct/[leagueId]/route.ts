import { NextRequest, NextResponse } from 'next/server';
import { sleeperClient } from '@/lib/sleeper/unified-client';

export const dynamic = 'force-dynamic';

/**
 * Example API route that bypasses database entirely
 * This replaces the expensive DB queries with direct Sleeper API calls
 */
export const GET = async (request: NextRequest, { params }: { params: { leagueId: string } }) => {
  console.log(`[API] Fetching league data for ${params.leagueId} WITHOUT database`);

  try {
    // Get current week from NFL state
    const nflState = await sleeperClient.fetchNFLState();
    const currentWeek = nflState.week || 1;

    // Fetch all data from Sleeper API (no DB!)
    const [league, rosters, matchups] = await Promise.all([
      sleeperClient.fetchLeague(params.leagueId),
      sleeperClient.fetchRostersWithOwners(params.leagueId),
      sleeperClient.fetchMatchups(params.leagueId, currentWeek),
    ]);

    // Group matchups by matchup_id
    const matchupPairs = new Map<number, any[]>();
    matchups.forEach((m: any) => {
      if (!matchupPairs.has(m.matchup_id)) {
        matchupPairs.set(m.matchup_id, []);
      }
      matchupPairs.get(m.matchup_id)!.push(m);
    });

    // Format response
    const response = {
      league: {
        id: league.league_id,
        name: league.name,
        season: league.season,
        settings: league.settings,
        scoringSettings: league.scoring_settings,
        rosterPositions: league.roster_positions,
      },
      rosters: rosters.map((r: any) => ({
        rosterId: r.roster_id,
        owner: r.owner?.display_name || 'Unknown',
        starters: r.starters,
        players: r.players,
        settings: r.settings,
      })),
      matchups: Array.from(matchupPairs.values()).map(pair => ({
        matchupId: pair[0]?.matchup_id,
        team1: {
          rosterId: pair[0]?.roster_id,
          points: pair[0]?.points,
          starters: pair[0]?.starters,
        },
        team2: {
          rosterId: pair[1]?.roster_id,
          points: pair[1]?.points,
          starters: pair[1]?.starters,
        },
      })),
      week: currentWeek,
      dataSource: 'sleeper-direct',
      dbQueries: 0, // ZERO database queries!
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching from Sleeper:', error);
    return NextResponse.json({ error: 'Failed to fetch league data' }, { status: 500 });
  }
};
