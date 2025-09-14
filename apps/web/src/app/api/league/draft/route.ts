import { NextRequest, NextResponse } from 'next/server';
import { getDraftByLeague } from '@/lib/api-replacements';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    const draft = await getDraftByLeague(leagueId);

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found for this league' }, { status: 404 });
    }

    return NextResponse.json({
      draft,
      dbQueries: 0,
      dataSource: 'sleeper-api',
    });
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch draft',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
