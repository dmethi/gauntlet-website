import { NextRequest, NextResponse } from 'next/server';
import { getPlayersByIds } from '@/data/players-loader';
import { sleeperClient } from '@/lib/sleeper/unified-client';

export const dynamic = 'force-dynamic';

// Helper function to get current week
const getCurrentWeek = async () => {
  const nflState = await sleeperClient.fetchNFLState();
  return nflState.week || 1;
};

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const weekParam = searchParams.get('week');
    const season = searchParams.get('season') || '2025';

    if (!ids) {
      return NextResponse.json(
        { error: 'Player IDs are required (comma-separated list)' },
        { status: 400 },
      );
    }

    // Parse player IDs
    const playerIds = ids.split(',').map(id => id.trim());

    // Get week (use provided or current week)
    const week = weekParam ? parseInt(weekParam, 10) : await getCurrentWeek();

    if (!Number.isFinite(week) || week < 1 || week > 18) {
      return NextResponse.json({ error: 'Invalid week parameter' }, { status: 400 });
    }

    // Fetch player info and projections
    const [players, projections, nflState] = await Promise.all([
      Promise.resolve(getPlayersByIds(playerIds)),
      sleeperClient.fetchWeeklyProjections(week, season),
      sleeperClient.fetchNFLState(),
    ]);

    // Combine player info with their projections/stats
    const playerStats = Object.entries(players).map(([playerId, player]) => {
      const projection = projections[playerId] || {};

      return {
        id: playerId,
        name: player.full_name || `${player.first_name} ${player.last_name}`,
        position: player.position,
        team: player.team,
        week,
        season,
        projections: {
          points: projection.pts_half_ppr || projection.pts_ppr || 0,
          passing: {
            yards: projection.pass_yd || 0,
            touchdowns: projection.pass_td || 0,
            interceptions: projection.pass_int || 0,
            completions: projection.pass_cmp || 0,
            attempts: projection.pass_att || 0,
          },
          rushing: {
            yards: projection.rush_yd || 0,
            touchdowns: projection.rush_td || 0,
            attempts: projection.rush_att || 0,
          },
          receiving: {
            yards: projection.rec_yd || 0,
            touchdowns: projection.rec_td || 0,
            receptions: projection.rec || 0,
            targets: projection.rec_tgt || 0,
          },
          kicking: {
            fieldGoals: projection.fgm || 0,
            extraPoints: projection.xpm || 0,
          },
          defense: {
            sacks: projection.def_sack || 0,
            interceptions: projection.def_int || 0,
            fumbleRecoveries: projection.def_fr || 0,
            touchdowns: projection.def_td || 0,
            pointsAllowed: projection.def_pa || 0,
          },
        },
        // Store raw projection data for reference
        rawProjection: projection,
      };
    });

    return NextResponse.json({
      playerStats,
      count: playerStats.length,
      week,
      season,
      currentWeek: nflState?.week || week,
      dbQueries: 0,
      dataSource: 'sleeper-api-projections',
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch player stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { playerIds, week, season = '2025' } = body;

    if (!Array.isArray(playerIds)) {
      return NextResponse.json({ error: 'playerIds must be an array' }, { status: 400 });
    }

    // Use provided week or current week
    const targetWeek = week || (await getCurrentWeek());

    if (!Number.isFinite(targetWeek) || targetWeek < 1 || targetWeek > 18) {
      return NextResponse.json({ error: 'Invalid week parameter' }, { status: 400 });
    }

    // Fetch player info and projections
    const [players, projections, nflState] = await Promise.all([
      Promise.resolve(getPlayersByIds(playerIds)),
      sleeperClient.fetchWeeklyProjections(targetWeek, season),
      sleeperClient.fetchNFLState(),
    ]);

    // Format the same way as GET endpoint
    const playerStats = Object.entries(players).map(([playerId, player]) => {
      const projection = projections[playerId] || {};

      return {
        id: playerId,
        name: player.full_name || `${player.first_name} ${player.last_name}`,
        position: player.position,
        team: player.team,
        week: targetWeek,
        season,
        projections: {
          points: projection.pts_half_ppr || projection.pts_ppr || 0,
          // Include all the same projection breakdowns as GET
          passing: {
            yards: projection.pass_yd || 0,
            touchdowns: projection.pass_td || 0,
            interceptions: projection.pass_int || 0,
            completions: projection.pass_cmp || 0,
            attempts: projection.pass_att || 0,
          },
          rushing: {
            yards: projection.rush_yd || 0,
            touchdowns: projection.rush_td || 0,
            attempts: projection.rush_att || 0,
          },
          receiving: {
            yards: projection.rec_yd || 0,
            touchdowns: projection.rec_td || 0,
            receptions: projection.rec || 0,
            targets: projection.rec_tgt || 0,
          },
          kicking: {
            fieldGoals: projection.fgm || 0,
            extraPoints: projection.xpm || 0,
          },
          defense: {
            sacks: projection.def_sack || 0,
            interceptions: projection.def_int || 0,
            fumbleRecoveries: projection.def_fr || 0,
            touchdowns: projection.def_td || 0,
            pointsAllowed: projection.def_pa || 0,
          },
        },
        rawProjection: projection,
      };
    });

    return NextResponse.json({
      playerStats,
      count: playerStats.length,
      week: targetWeek,
      season,
      currentWeek: nflState?.week || targetWeek,
      dbQueries: 0,
      dataSource: 'sleeper-api-projections',
    });
  } catch (error) {
    console.error('Error in POST player stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch player stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
};
