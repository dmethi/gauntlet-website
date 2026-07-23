import { NextResponse } from 'next/server';
import { getCurrentLeagues } from '@/config/leagues';
import { sleeperClient } from '@/lib/sleeper/unified-client';

export const dynamic = 'force-dynamic';

/**
 * Get all leagues WITHOUT database
 * This replaces the database-dependent /api/leagues route
 */
export const GET = async () => {
  console.log('[STATIC API] Fetching leagues without database');

  try {
    // Get league details from Sleeper for current leagues
    const leagueDetails = await Promise.all(
      getCurrentLeagues().map(async config => {
        try {
          const sleeperData = await sleeperClient.fetchLeague(config.id);

          if (!sleeperData) {
            console.warn(`[STATIC API] No data returned for league ${config.id}`);
            // Return basic config data if Sleeper API fails
            return {
              id: config.id,
              name: config.name,
              season: config.season,
              conference: config.conference,
              // Fallback values
              totalRosters: 12,
              settings: {},
              scoringSettings: {},
              rosterPositions: [],
              // Metadata
              dataSource: 'config-only',
              dbQueries: 0,
            };
          }

          return {
            id: config.id,
            name: config.name,
            season: config.season,
            conference: config.conference,
            // Add Sleeper data
            totalRosters: sleeperData.total_rosters || 12,
            settings: sleeperData.settings || {},
            scoringSettings: sleeperData.scoring_settings || {},
            rosterPositions: sleeperData.roster_positions || [],
            // Metadata
            dataSource: 'static-config',
            dbQueries: 0,
          };
        } catch (error) {
          console.error(`[STATIC API] Failed to fetch league ${config.id}:`, error);
          // Return config-only data on error
          return {
            id: config.id,
            name: config.name,
            season: config.season,
            conference: config.conference,
            // Fallback values
            totalRosters: 12,
            settings: {},
            scoringSettings: {},
            rosterPositions: [],
            // Metadata
            dataSource: 'config-only-error',
            dbQueries: 0,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
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
};
