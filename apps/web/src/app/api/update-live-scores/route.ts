import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SLEEPER_API = 'https://api.sleeper.app/v1';
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

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    const currentWeek = getCurrentWeek();
    const timestamp = new Date().toISOString();
    const results = [];

    for (const leagueId of LEAGUE_IDS) {
      try {
        // Get current week's matchups with live scoring
        const matchupsResponse = await fetch(
          `${SLEEPER_API}/league/${leagueId}/matchups/${currentWeek}`
        );
        const matchups = await matchupsResponse.json();

        // Get player stats for current week
        const season = new Date().getFullYear();
        const statsResponse = await fetch(
          `${SLEEPER_API}/stats/nfl/regular/${season}/${currentWeek}`
        );
        const stats = await statsResponse.json();

        // Calculate current fantasy scores for each matchup
        const liveScores = calculateLiveScores(matchups, stats, timestamp);

        // Store as time-series data (append, don't overwrite)
        const timeSeriesFile = join(DATA_DIR, `timeseries-${leagueId}-week-${currentWeek}.json`);

        let timeSeriesData = [];
        if (existsSync(timeSeriesFile)) {
          timeSeriesData = JSON.parse(readFileSync(timeSeriesFile, 'utf8'));
        }

        // Add new data point
        timeSeriesData.push({
          timestamp,
          week: currentWeek,
          season,
          matchups: liveScores,
        });

        writeFileSync(timeSeriesFile, JSON.stringify(timeSeriesData, null, 2));

        // Also keep latest snapshot for quick access
        const latestFile = join(DATA_DIR, `live-scores-${leagueId}-week-${currentWeek}.json`);
        const latestData = {
          leagueId,
          week: currentWeek,
          season,
          matchups: liveScores,
          lastUpdated: timestamp,
        };
        writeFileSync(latestFile, JSON.stringify(latestData, null, 2));

        results.push({
          leagueId,
          week: currentWeek,
          matchupsUpdated: liveScores.length,
          dataPoints: timeSeriesData.length,
          filename: `timeseries-${leagueId}-week-${currentWeek}.json`,
        });
      } catch (error) {
        console.error(`Failed to update live scores for ${leagueId}:`, error);
        results.push({ leagueId, error: 'Update failed' });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      updatedAt: timestamp,
    });
  } catch (error) {
    console.error('Live scores update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateLiveScores(matchups: any[], stats: Record<string, any>, timestamp: string) {
  return matchups.map(matchup => {
    const livePoints: Record<string, number> = {};

    // Calculate live fantasy points for each player in the matchup
    if (matchup.starters) {
      matchup.starters.forEach((playerId: string) => {
        const playerStats = stats[playerId];
        if (playerStats) {
          // Basic fantasy scoring - customize based on your league settings
          const points =
            (playerStats.rush_yd || 0) * 0.1 +
            (playerStats.pass_yd || 0) * 0.04 +
            (playerStats.rec_yd || 0) * 0.1 +
            (playerStats.rush_td || 0) * 6 +
            (playerStats.pass_td || 0) * 4 +
            (playerStats.rec_td || 0) * 6 +
            (playerStats.rec || 0) * 1;
          livePoints[playerId] = Math.round(points * 100) / 100;
        }
      });
    }

    const totalLivePoints = Object.values(livePoints).reduce(
      (sum: number, pts: number) => sum + pts,
      0
    );

    return {
      ...matchup,
      livePoints,
      totalLivePoints,
      timestamp,
    };
  });
}

function getCurrentWeek(): number {
  const seasonStart = new Date('2024-09-05');
  const now = new Date();
  const diffTime = now.getTime() - seasonStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.ceil(diffDays / 7), 1), 18);
}
