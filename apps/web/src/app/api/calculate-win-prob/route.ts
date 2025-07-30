import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

// Your hardcoded league IDs
const LEAGUE_IDS = [
  '1049321550490456064', // Replace with your actual league ID
];

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.API_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentWeek = getCurrentWeek();
    const timestamp = new Date().toISOString();
    const results = [];

    for (const leagueId of LEAGUE_IDS) {
      try {
        // Read the latest live scores
        const scoresFile = join(DATA_DIR, `live-scores-${leagueId}-week-${currentWeek}.json`);

        if (!existsSync(scoresFile)) {
          throw new Error('No live scores data found');
        }

        const scoresData = JSON.parse(readFileSync(scoresFile, 'utf8'));

        // Calculate win probabilities for each matchup
        const winProbabilities = calculateWinProbabilities(scoresData.matchups, timestamp);

        // Store win probabilities as time-series
        const winProbTimeSeriesFile = join(
          DATA_DIR,
          `winprob-timeseries-${leagueId}-week-${currentWeek}.json`
        );

        let winProbTimeSeries = [];
        if (existsSync(winProbTimeSeriesFile)) {
          winProbTimeSeries = JSON.parse(readFileSync(winProbTimeSeriesFile, 'utf8'));
        }

        // Add new data point
        winProbTimeSeries.push({
          timestamp,
          week: currentWeek,
          winProbabilities,
        });

        writeFileSync(winProbTimeSeriesFile, JSON.stringify(winProbTimeSeries, null, 2));

        // Also keep latest snapshot
        const latestWinProbFile = join(DATA_DIR, `win-prob-${leagueId}-week-${currentWeek}.json`);
        const latestWinProbData = {
          leagueId,
          week: currentWeek,
          winProbabilities,
          lastUpdated: timestamp,
        };
        writeFileSync(latestWinProbFile, JSON.stringify(latestWinProbData, null, 2));

        // Calculate excitement metrics
        const excitementMetrics = calculateExcitementMetrics(winProbTimeSeries);

        results.push({
          leagueId,
          week: currentWeek,
          matchupsCalculated: winProbabilities.length,
          dataPoints: winProbTimeSeries.length,
          excitement: excitementMetrics,
          filename: `winprob-timeseries-${leagueId}-week-${currentWeek}.json`,
        });
      } catch (error) {
        console.error(`Failed to calculate win probabilities for ${leagueId}:`, error);
        results.push({ leagueId, error: 'Calculation failed' });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      updatedAt: timestamp,
    });
  } catch (error) {
    console.error('Win probability calculation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateWinProbabilities(matchups: any[], timestamp: string) {
  return matchups.map(matchup => {
    const { roster_id, points, totalLivePoints } = matchup;

    // Simple win probability calculation
    // This is where you'd integrate your sim-engine
    const currentScore = totalLivePoints || 0;
    const projectedTotal = currentScore + estimateRemainingPoints();

    // Placeholder logic - replace with your actual simulation
    const winProb = Math.min(Math.max(projectedTotal / 120, 0.1), 0.9);

    return {
      roster_id,
      currentScore,
      projectedTotal: Math.round(projectedTotal * 100) / 100,
      winProbability: Math.round(winProb * 100) / 100,
      timestamp,
    };
  });
}

function calculateExcitementMetrics(winProbTimeSeries: any[]) {
  const matchupExcitement: Record<string, any> = {};

  // Calculate win probability volatility for each matchup
  winProbTimeSeries.forEach(dataPoint => {
    dataPoint.winProbabilities.forEach((wp: any) => {
      if (!matchupExcitement[wp.roster_id]) {
        matchupExcitement[wp.roster_id] = {
          roster_id: wp.roster_id,
          probabilities: [],
          maxSwing: 0,
          volatility: 0,
        };
      }
      matchupExcitement[wp.roster_id].probabilities.push(wp.winProbability);
    });
  });

  // Calculate excitement scores
  Object.values(matchupExcitement).forEach((matchup: any) => {
    const probs = matchup.probabilities;
    if (probs.length > 1) {
      // Max swing: biggest single change in win probability
      let maxSwing = 0;
      for (let i = 1; i < probs.length; i++) {
        const swing = Math.abs(probs[i] - probs[i - 1]);
        maxSwing = Math.max(maxSwing, swing);
      }
      matchup.maxSwing = Math.round(maxSwing * 100) / 100;

      // Volatility: standard deviation of win probabilities
      const mean = probs.reduce((sum: number, p: number) => sum + p, 0) / probs.length;
      const variance =
        probs.reduce((sum: number, p: number) => sum + Math.pow(p - mean, 2), 0) / probs.length;
      matchup.volatility = Math.round(Math.sqrt(variance) * 100) / 100;

      // Excitement score: combination of max swing and volatility
      matchup.excitementScore =
        Math.round((matchup.maxSwing * 0.6 + matchup.volatility * 0.4) * 100) / 100;
    }
  });

  return Object.values(matchupExcitement).sort(
    (a: any, b: any) => b.excitementScore - a.excitementScore
  );
}

function estimateRemainingPoints(): number {
  // Rough estimate of remaining points based on time of day
  const now = new Date();
  const hour = now.getUTCHours();

  // This is very crude - you'd want better logic based on:
  // - Which players are still playing
  // - Time remaining in games
  // - Historical performance

  if (hour >= 17 && hour <= 19) {
    // Early in Sunday games
    return 40;
  } else if (hour >= 20 && hour <= 22) {
    // Later in Sunday games
    return 20;
  } else {
    // Night games or late in games
    return 10;
  }
}

function getCurrentWeek(): number {
  const seasonStart = new Date('2024-09-05');
  const now = new Date();
  const diffTime = now.getTime() - seasonStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.ceil(diffDays / 7), 1), 18);
}
