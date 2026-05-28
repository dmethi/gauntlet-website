import { NextResponse } from 'next/server';
import { fetchSeasonStats } from '@/lib/year-in-review/season-stats';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET() {
  try {
    const data = await fetchSeasonStats();
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    console.error('[season-stats]', e);
    return NextResponse.json({ ok: false, error: 'Failed to fetch season data' }, { status: 500 });
  }
}
