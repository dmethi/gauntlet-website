import { NextResponse } from 'next/server';

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:3001';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const teamId = Number(params.id);
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/league/overview`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch league overview' },
        { status: res.status }
      );
    }
    const league = await res.json();
    const roster = Array.isArray(league?.rosters)
      ? league.rosters.find((r: { id: number }) => r.id === teamId)
      : null;

    if (!roster) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ ...roster, league });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching team data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
