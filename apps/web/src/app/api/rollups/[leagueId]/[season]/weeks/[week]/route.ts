import { NextResponse } from 'next/server';

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:3001';

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; season: string; week: string } }
) {
  const { leagueId, season, week } = params;
  try {
    const res = await fetch(
      `${SERVER_BASE_URL}/api/rollups/${encodeURIComponent(leagueId)}/${encodeURIComponent(
        season
      )}/weeks/${encodeURIComponent(week)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch week rollups' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
