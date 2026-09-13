import { type NextRequest, NextResponse } from 'next/server';
import { getDriveFFLiveOdds } from '@/lib/driveff-live-odds';

export const dynamic = 'force-dynamic';

/**
 * Serves the chart contract expected by Gauntlet while driveFF owns collection,
 * persistence, and probability calculation.
 */
export const GET = async (
  _req: NextRequest,
  props: { params: Promise<{ leagueId: string; week: string; matchupId: string }> },
): Promise<NextResponse> => {
  const { leagueId, week, matchupId } = await props.params;
  const weekNum = Number.parseInt(week, 10);
  const matchupIdNum = Number.parseInt(matchupId, 10);

  if (!leagueId || !Number.isFinite(weekNum) || !Number.isFinite(matchupIdNum)) {
    return NextResponse.json({ error: 'Invalid week or matchupId parameter' }, { status: 400 });
  }

  try {
    const feed = await getDriveFFLiveOdds(leagueId, weekNum, matchupIdNum);
    const firstSample = feed.samples[0];
    const series = feed.samples.map(sample => ({
      timestamp: sample.timestamp,
      team1Score: sample.currentScoreA,
      team2Score: sample.currentScoreB,
      team1WinProbability: sample.winProbA,
      gameProgress: sample.gameProgress,
      projectedFinalA: sample.projectedFinalA,
      projectedFinalB: sample.projectedFinalB,
      spread: sample.spread,
    }));

    return NextResponse.json({
      series,
      metadata: {
        leagueId,
        week: weekNum,
        matchupId: matchupIdNum,
        sampleCount: series.length,
        hasData: series.length > 0,
        rosterAId: firstSample?.rosterAId ?? null,
        rosterBId: firstSample?.rosterBId ?? null,
        source: 'driveff',
        schemaVersion: feed.schemaVersion,
      },
    });
  } catch (error) {
    console.error('[API] Failed to fetch driveFF matchup time series:', error);
    return NextResponse.json({ error: 'Failed to fetch time series data' }, { status: 502 });
  }
};
