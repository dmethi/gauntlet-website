import { NextResponse } from 'next/server';

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:3001';

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; rosterId: string } }
) {
  const { leagueId, rosterId } = params;
  try {
    const res = await fetch(
      `${SERVER_BASE_URL}/api/league/${encodeURIComponent(leagueId)}/rosters/${encodeURIComponent(
        rosterId
      )}`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch roster details' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
