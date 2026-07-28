import { NextRequest, NextResponse } from 'next/server';
import { analyzeStartSitEfficiency } from '@/features/start-sit/utils';
import { getLeaguesForSeason } from '@/config/leagues';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest) => {
  try {
    const season = request.nextUrl.searchParams.get('season') || undefined;
    const leagues = season ? getLeaguesForSeason(season) : undefined;
    const data = await analyzeStartSitEfficiency({ season, leagues });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error running start/sit efficiency analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to run start/sit efficiency analysis',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};

// Force refresh the analysis (ignores cache)
export const POST = async (request: NextRequest) => {
  try {
    const season = request.nextUrl.searchParams.get('season') || undefined;
    const leagues = season ? getLeaguesForSeason(season) : undefined;
    console.log('🔄 Force refreshing start/sit efficiency analysis (server-computed)...');
    const data = await analyzeStartSitEfficiency({ season, leagues });
    return NextResponse.json({
      message: 'Analysis regeneration completed',
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.error('Error force refreshing analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to refresh analysis',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};
