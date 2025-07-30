import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string; week: string } }
) {
  try {
    const { leagueId, week } = params;

    // Read time-series data
    const timeSeriesFile = join(DATA_DIR, `timeseries-${leagueId}-week-${week}.json`);
    const winProbTimeSeriesFile = join(
      DATA_DIR,
      `winprob-timeseries-${leagueId}-week-${week}.json`
    );

    if (!existsSync(timeSeriesFile)) {
      return NextResponse.json({ error: 'No time-series data found' }, { status: 404 });
    }

    const scoreTimeSeries = JSON.parse(readFileSync(timeSeriesFile, 'utf8'));
    let winProbTimeSeries = [];

    if (existsSync(winProbTimeSeriesFile)) {
      winProbTimeSeries = JSON.parse(readFileSync(winProbTimeSeriesFile, 'utf8'));
    }

    // Transform data for charting
    const chartData = transformToChartData(scoreTimeSeries, winProbTimeSeries);

    return NextResponse.json({
      success: true,
      leagueId,
      week: parseInt(week),
      dataPoints: scoreTimeSeries.length,
      chartData,
      lastUpdated: scoreTimeSeries[scoreTimeSeries.length - 1]?.timestamp,
    });
  } catch (error) {
    console.error('Chart data error:', error);
    return NextResponse.json({ error: 'Failed to load chart data' }, { status: 500 });
  }
}

function transformToChartData(scoreTimeSeries: any[], winProbTimeSeries: any[]) {
  // Group data by matchup/roster
  const matchupData: Record<string, any> = {};

  // Process score data
  scoreTimeSeries.forEach(dataPoint => {
    dataPoint.matchups.forEach((matchup: any) => {
      const key = `${matchup.matchup_id}-${matchup.roster_id}`;

      if (!matchupData[key]) {
        matchupData[key] = {
          matchup_id: matchup.matchup_id,
          roster_id: matchup.roster_id,
          scores: [],
          winProbabilities: [],
        };
      }

      matchupData[key].scores.push({
        timestamp: dataPoint.timestamp,
        score: matchup.totalLivePoints || 0,
      });
    });
  });

  // Process win probability data
  winProbTimeSeries.forEach(dataPoint => {
    dataPoint.winProbabilities.forEach((wp: any) => {
      const key = Object.keys(matchupData).find(k => matchupData[k].roster_id === wp.roster_id);

      if (key && matchupData[key]) {
        matchupData[key].winProbabilities.push({
          timestamp: dataPoint.timestamp,
          winProbability: wp.winProbability,
        });
      }
    });
  });

  // Calculate excitement metrics for each matchup
  Object.values(matchupData).forEach((matchup: any) => {
    if (matchup.winProbabilities.length > 1) {
      const probs = matchup.winProbabilities.map((wp: any) => wp.winProbability);

      // Max swing
      let maxSwing = 0;
      for (let i = 1; i < probs.length; i++) {
        const swing = Math.abs(probs[i] - probs[i - 1]);
        maxSwing = Math.max(maxSwing, swing);
      }

      // Volatility
      const mean = probs.reduce((sum: number, p: number) => sum + p, 0) / probs.length;
      const variance =
        probs.reduce((sum: number, p: number) => sum + Math.pow(p - mean, 2), 0) / probs.length;
      const volatility = Math.sqrt(variance);

      matchup.excitementScore = Math.round((maxSwing * 0.6 + volatility * 0.4) * 100) / 100;
      matchup.maxSwing = Math.round(maxSwing * 100) / 100;
      matchup.volatility = Math.round(volatility * 100) / 100;
    } else {
      matchup.excitementScore = 0;
      matchup.maxSwing = 0;
      matchup.volatility = 0;
    }
  });

  return Object.values(matchupData).sort((a: any, b: any) => b.excitementScore - a.excitementScore);
}
