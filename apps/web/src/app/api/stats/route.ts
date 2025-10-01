import { NextResponse } from 'next/server';
import { buildStatsDataset, serializeStatsDataset } from '@/lib/stats/compose';
import { CURRENT_LEAGUES } from '@/config/leagues';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Fetch cached start/sit efficiency data (same logic as the API route)
async function getStartSitEfficiencyData() {
  try {
    const currentDir = process.cwd();
    const projectRoot = currentDir.endsWith('/apps/web') ? currentDir.slice(0, -9) : currentDir;

    // Read existing cached data (same 5-minute cache as the dedicated endpoint)
    const files = await import('fs').then(fs => fs.promises.readdir(projectRoot));
    const analysisFiles = files
      .filter(file => file.startsWith('start-sit-analysis-') && file.endsWith('.json'))
      .sort((a, b) => {
        const aTime = parseInt(a.match(/start-sit-analysis-(\d+)\.json/)?.[1] || '0');
        const bTime = parseInt(b.match(/start-sit-analysis-(\d+)\.json/)?.[1] || '0');
        return bTime - aTime;
      });

    const now = Date.now();
    const cacheValidDuration = 5 * 60 * 1000; // 5 minutes

    // Check if we have recent data
    if (analysisFiles.length > 0) {
      const latestFile = analysisFiles[0];
      const fileTime = parseInt(latestFile.match(/start-sit-analysis-(\d+)\.json/)?.[1] || '0');

      if (now - fileTime < cacheValidDuration) {
        console.log(`[Stats] Using cached start/sit data from ${latestFile}`);
        const data = JSON.parse(readFileSync(join(projectRoot, latestFile), 'utf8'));
        return data;
      }
    }

    // If no cached data available, return null (the tab will fetch it on demand)
    console.log('[Stats] No cached start/sit data available, will fetch on demand');
    return null;
  } catch (error) {
    console.warn('[Stats] Failed to load start/sit data:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Use existing league configuration
    const leagueIds = CURRENT_LEAGUES.map(l => l.id);
    const labels = CURRENT_LEAGUES.map(l => l.name);

    // Fetch stats dataset and start/sit efficiency data in parallel
    const [dataset, startSitData] = await Promise.all([
      buildStatsDataset({
        leagueIds,
        labels,
        weekRange: { from: 1, to: 18 }, // Get all available weeks
      }),
      getStartSitEfficiencyData(),
    ]);

    const serializedDataset = serializeStatsDataset(dataset);

    return NextResponse.json({
      ...serializedDataset,
      startSitEfficiency: startSitData,
    });
  } catch (error) {
    console.error('[API] /api/stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats data' }, { status: 500 });
  }
}
