import { NextRequest, NextResponse } from 'next/server';
import { computeWeeklyRollups } from '@/lib/api-replacements';

export const GET = async (
  _request: NextRequest,
  { params }: { params: { leagueId: string; season: string; week: string } },
) => {
  try {
    const { leagueId, season, week } = params;
    const weekNumber = parseInt(week, 10);

    if (!leagueId || !season) {
      return NextResponse.json({ error: 'League ID and season are required' }, { status: 400 });
    }

    if (!Number.isFinite(weekNumber) || weekNumber < 1 || weekNumber > 18) {
      return NextResponse.json({ error: 'Invalid week parameter' }, { status: 400 });
    }

    const rollup = await computeWeeklyRollups(leagueId, weekNumber);

    return NextResponse.json({
      leagueId,
      season,
      week: weekNumber,
      ...rollup,
      dbQueries: 0,
      dataSource: 'sleeper-api-computed',
    });
  } catch (error) {
    console.error(`Error computing rollup for week ${params.week}:`, error);
    return NextResponse.json(
      {
        error: 'Failed to compute weekly rollup',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
};
