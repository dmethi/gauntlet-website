import { NextRequest, NextResponse } from 'next/server';
import { getPlayerById } from '@/data/players-loader';
import {
  getPlayerOutcomes,
  getPositionDistribution,
} from '@gauntlet/sim-engine/src/data/variance-loader';

export async function GET(_request: NextRequest, { params }: { params: { playerId: string } }) {
  try {
    const playerId = params.playerId;

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // Get player info
    const player = getPlayerById(playerId);

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get player-specific outcomes and position distribution
    const [playerOutcomes, positionDistribution] = await Promise.all([
      getPlayerOutcomes(playerId),
      getPositionDistribution(player.position || 'RB'),
    ]);

    // Format response
    const distribution = {
      player: {
        id: playerId,
        name: player.full_name || player.first_name + ' ' + player.last_name,
        position: player.position,
        team: player.team,
      },
      playerOutcomes: {
        outcomes: playerOutcomes.outcomes,
        sampleSize: playerOutcomes.sampleSize,
        hasPlayerSpecificData: playerOutcomes.sampleSize > 0,
      },
      positionDistribution: {
        outcomes: positionDistribution.outcomes,
        sampleSize: positionDistribution.sampleSize,
        position: player.position,
      },
      dbQueries: 0,
      dataSource: 'static-variance-data',
    };

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Error fetching player distribution:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
