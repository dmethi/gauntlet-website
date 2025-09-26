import { NextResponse } from 'next/server';
import { buildStatsDataset, serializeStatsDataset } from '@/lib/stats/compose';
import { CURRENT_LEAGUES } from '@/config/leagues';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use existing league configuration
    const leagueIds = CURRENT_LEAGUES.map(l => l.id);
    const labels = CURRENT_LEAGUES.map(l => l.name);

    const dataset = await buildStatsDataset({
      leagueIds,
      labels,
      weekRange: { from: 1, to: 18 }, // Get all available weeks
    });

    const serializedDataset = serializeStatsDataset(dataset);

    return NextResponse.json(serializedDataset);
  } catch (error) {
    console.error('[API] /api/stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats data' }, { status: 500 });
  }
}
