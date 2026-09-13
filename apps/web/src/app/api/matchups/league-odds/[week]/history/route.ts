import { NextRequest, NextResponse } from 'next/server';
import { getLeagueOddsHistory } from '@gauntlet/server';
import { getCurrentLeagues } from '@/config/leagues';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ week: string }> },
) => {
  const { week: rawWeek } = await params;
  const week = Number(rawWeek);
  const season = Number(
    request.nextUrl.searchParams.get('season') ?? getCurrentLeagues()[0]?.season,
  );

  if (!Number.isInteger(season) || !Number.isInteger(week) || week < 1 || week > 18) {
    return NextResponse.json({ error: 'Invalid season or week' }, { status: 400 });
  }

  try {
    const snapshots = await getLeagueOddsHistory(season, week);
    return NextResponse.json({
      season,
      week,
      snapshots: snapshots.map(snapshot => ({
        ...snapshot,
        capturedAt: snapshot.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[LEAGUE ODDS HISTORY] Failed to load snapshots:', error);
    return NextResponse.json({ error: 'Failed to load league odds history' }, { status: 500 });
  }
};
