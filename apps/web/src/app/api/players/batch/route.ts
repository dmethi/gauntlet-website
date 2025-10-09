import { NextRequest, NextResponse } from 'next/server';
import { getAllPlayers, getPlayersByIds, searchPlayersByName } from '@/data/players-loader';

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (ids) {
      // Batch fetch specific players by IDs
      const playerIds = ids.split(',').map(id => id.trim());
      const players = getPlayersByIds(playerIds);

      return NextResponse.json({
        players,
        count: Object.keys(players).length,
        dbQueries: 0,
        dataSource: 'static-player-data',
      });
    }

    if (search) {
      // Search players by name
      const players = searchPlayersByName(search).slice(0, limit);

      return NextResponse.json({
        players,
        count: players.length,
        searchTerm: search,
        dbQueries: 0,
        dataSource: 'static-player-data',
      });
    }

    // Return all players (use with caution - this is large!)
    const allPlayers = getAllPlayers();

    return NextResponse.json({
      players: Object.fromEntries(Object.entries(allPlayers).slice(0, limit)),
      count: Object.keys(allPlayers).length,
      showing: Math.min(limit, Object.keys(allPlayers).length),
      dbQueries: 0,
      dataSource: 'static-player-data',
    });
  } catch (error) {
    console.error('Error in batch players endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { playerIds } = body;

    if (!Array.isArray(playerIds)) {
      return NextResponse.json({ error: 'playerIds must be an array' }, { status: 400 });
    }

    const players = getPlayersByIds(playerIds);

    return NextResponse.json({
      players,
      count: Object.keys(players).length,
      dbQueries: 0,
      dataSource: 'static-player-data',
    });
  } catch (error) {
    console.error('Error in POST batch players endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
