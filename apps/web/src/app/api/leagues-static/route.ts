import { NextResponse } from 'next/server';
import { getCurrentLeagues } from '@/config/leagues';
import { getLeague } from '@/lib/sleeper-direct';

/**
 * Get all leagues WITHOUT database
 * This replaces the database-dependent /api/leagues route
 */
export async function GET() {
  console.log('[STATIC API] Fetching leagues without database');

  try {
    // Get league details from Sleeper for current leagues
    const leagueDetails = await Promise.all(
      getCurrentLeagues().map(async config => {
        const sleeperData = await getLeague(config.id);
        return {
          id: config.id,
          name: config.name,
          season: config.season,
          conference: config.conference,
          // Add Sleeper data
          totalRosters: sleeperData.total_rosters,
          settings: sleeperData.settings,
          scoringSettings: sleeperData.scoring_settings,
          rosterPositions: sleeperData.roster_positions,
          // Metadata
          dataSource: 'static-config',
          dbQueries: 0,
        };
      })
    );

    return NextResponse.json({
      leagues: leagueDetails,
      count: leagueDetails.length,
      dbQueries: 0,
      source: 'static-and-sleeper',
    });
  } catch (error) {
    console.error('[STATIC API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leagues' }, { status: 500 });
  }
}
