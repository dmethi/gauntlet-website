import { NextResponse } from 'next/server';

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:3001';

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; season: string } }
) {
  const { searchParams } = new URL(request.url);
  const { leagueId, season } = params;
  const category = searchParams.get('category') ?? '';
  const limit = searchParams.get('limit') ?? '';
  const offset = searchParams.get('offset') ?? '';
  try {
    const qs = new URLSearchParams();
    if (category) qs.set('category', category);
    if (limit) qs.set('limit', limit);
    if (offset) qs.set('offset', offset);
    const res = await fetch(
      `${SERVER_BASE_URL}/api/rollups/${encodeURIComponent(leagueId)}/${encodeURIComponent(
        season
      )}/superlatives?${qs.toString()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch superlatives' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
