import { NextRequest, NextResponse } from 'next/server';
import { getPlayerById } from '@/data/players-loader';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const playerId = params.id;

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const player = getPlayerById(playerId);

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({
      player,
      dbQueries: 0,
      dataSource: 'static-player-data',
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
