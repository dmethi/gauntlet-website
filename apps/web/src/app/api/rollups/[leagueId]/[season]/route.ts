import { NextRequest, NextResponse } from 'next/server';
import { computeWeeklyRollups } from '@/lib/api-replacements';
import { sleeperClient } from '@/lib/sleeper/unified-client';
import { resolveCompletedWeeks } from '@/shared/utils/season-weeks';

export const dynamic = 'force-dynamic';

export const GET = async (
  request: NextRequest,
  { params }: { params: { leagueId: string; season: string } },
) => {
  try {
    const { leagueId, season } = params;
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week');

    if (!leagueId || !season) {
      return NextResponse.json({ error: 'League ID and season are required' }, { status: 400 });
    }

    // If week is specified, compute for that week only
    if (weekParam) {
      const week = parseInt(weekParam, 10);
      if (!Number.isFinite(week) || week < 1 || week > 18) {
        return NextResponse.json({ error: 'Invalid week parameter' }, { status: 400 });
      }

      const rollup = await computeWeeklyRollups(leagueId, week);

      return NextResponse.json({
        week,
        season,
        rollup,
        dbQueries: 0,
        dataSource: 'sleeper-api-computed',
      });
    }

    // Compute rollups for all weeks up to current week
    const [league, nflState] = await Promise.all([
      sleeperClient.fetchLeague(leagueId),
      sleeperClient.fetchNFLState(),
    ]);
    const currentWeek = resolveCompletedWeeks(league, nflState, { includeCurrentWeek: true });
    const weeks = Array.from({ length: Math.min(currentWeek, 18) }, (_, i) => i + 1);

    // Compute rollups for each week in parallel
    const rollups = await Promise.all(
      weeks.map(async week => {
        try {
          const rollup = await computeWeeklyRollups(leagueId, week);
          return { week, ...rollup };
        } catch (error) {
          console.warn(`Failed to compute rollup for week ${week}:`, error);
          return null;
        }
      }),
    );

    // Filter out failed computations
    const validRollups = rollups.filter(r => r !== null);

    // Aggregate season data
    const allRosterAggregates = validRollups.flatMap(r => r.rosterWeekAggregates);
    const allMatchupSummaries = validRollups.flatMap(r => r.matchupSummaries);
    const allLeagueWeekSummaries = validRollups.map(r => r.leagueWeekSummary);

    return NextResponse.json({
      ok: true,
      season,
      leagueId,
      currentWeek,
      data: {
        rosterWeekAggregates: allRosterAggregates,
        matchupSummaries: allMatchupSummaries,
        leagueWeekSummaries: allLeagueWeekSummaries,
      },
      weeksComputed: validRollups.length,
      dbQueries: 0,
      dataSource: 'sleeper-api-computed',
      meta: { weeksComputed: validRollups.length, dataSource: 'sleeper-api-computed' },
    });
  } catch (error) {
    console.error('Error computing rollups:', error);
    return NextResponse.json(
      {
        error: 'Failed to compute rollups',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
};
