import { type NextRequest, NextResponse } from 'next/server';
import { getMatchupWinProbTimeSeries } from '@gauntlet/server';

/**
 * GET /api/matchup-timeseries/[leagueId]/[week]/[matchupId]
 *
 * Fetches live win probability and score time-series data for a specific matchup.
 * Used to power win probability over time and score over time charts.
 *
 * @param leagueId - Sleeper league ID
 * @param week - NFL week number
 * @param matchupId - Matchup ID within the league (1-6)
 *
 * @returns JSON with time-series data array or error
 */
export const GET = async (
  _req: NextRequest,
  { params }: { params: { leagueId: string; week: string; matchupId: string } },
): Promise<NextResponse> => {
  try {
    const { leagueId, week, matchupId } = params;

    // Validate params
    const weekNum = parseInt(week);
    const matchupIdNum = parseInt(matchupId);

    if (isNaN(weekNum) || isNaN(matchupIdNum)) {
      return NextResponse.json(
        { error: 'Invalid week or matchupId parameter' },
        { status: 400 },
      );
    }

    // Fetch raw time series from database
    const rawData = await getMatchupWinProbTimeSeries(leagueId, weekNum, matchupIdNum);

    // Transform to expected format for charts
    const series = rawData.map(sample => ({
      timestamp: sample.timestamp.toISOString(),
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
      },
    });
  } catch (error) {
    console.error('[API] Failed to fetch matchup time series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time series data' },
      { status: 500 },
    );
  }
};

