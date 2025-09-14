import { NextRequest, NextResponse } from 'next/server';
import { calculateWinProbability, getCurrentWeek } from '@/lib/api-replacements';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team1Starters, team2Starters, week } = body;

    if (!Array.isArray(team1Starters) || !Array.isArray(team2Starters)) {
      return NextResponse.json(
        { error: 'team1Starters and team2Starters must be arrays of player IDs' },
        { status: 400 }
      );
    }

    // Use provided week or current week
    const targetWeek = week || (await getCurrentWeek());

    if (!Number.isFinite(targetWeek) || targetWeek < 1 || targetWeek > 18) {
      return NextResponse.json({ error: 'Invalid week parameter' }, { status: 400 });
    }

    const result = await calculateWinProbability(team1Starters, team2Starters, targetWeek);

    return NextResponse.json({
      ...result,
      week: targetWeek,
      dbQueries: 0,
      dataSource: 'real-time-calculation',
    });
  } catch (error) {
    console.error('Error calculating win probability:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate win probability',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'This endpoint requires POST with team1Starters and team2Starters arrays',
    usage: {
      method: 'POST',
      body: {
        team1Starters: ['player_id1', 'player_id2', '...'],
        team2Starters: ['player_id3', 'player_id4', '...'],
        week: 'optional - defaults to current week',
      },
    },
    dbQueries: 0,
    dataSource: 'real-time-calculation',
  });
}
