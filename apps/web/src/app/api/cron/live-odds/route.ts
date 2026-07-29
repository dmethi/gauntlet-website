import { NextRequest, NextResponse } from 'next/server';
import { debugLog } from '@/lib/debug-log';
import { authorizeBearer, createFixedWindowGate } from '@/lib/api-security';

const replayGate = createFixedWindowGate({ limit: 1, windowMs: 60_000 });

/**
 * Vercel Cron endpoint for live odds snapshots
 *
 * Executes the live snapshot script directly in the API route
 * Called every 10 minutes during NFL game windows
 *
 * Vercel Cron is more reliable than GitHub Actions for scheduled tasks
 *
 * @see apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts
 */
export const POST = async (request: NextRequest) => {
  const authorization = authorizeBearer(
    request.headers.get('authorization'),
    process.env.CRON_SECRET,
  );
  if (authorization === 'misconfigured') {
    return NextResponse.json({ error: 'Cron authentication unavailable' }, { status: 503 });
  }
  if (authorization === 'unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!replayGate.allow('live-odds')) {
    return NextResponse.json(
      { error: 'Cron command recently accepted' },
      { status: 429, headers: { 'retry-after': '60' } },
    );
  }

  const startTime = Date.now();

  try {
    debugLog('🏈 [CRON] Starting live odds snapshot...');

    // Dynamic import to avoid bundling server code unnecessarily
    const { runLiveSnapshot } = await import('./snapshot-runner');

    const result = await runLiveSnapshot();

    debugLog('✅ [CRON] Live odds snapshot completed:', {
      duration: `${result.duration}ms`,
      saved: result.savedCount,
      skipped: result.skippedCount,
      failed: result.failedCount,
      totalProcessed: result.totalProcessed,
    });

    return NextResponse.json({
      success: true,
      ...result,
      triggeredAt: new Date().toISOString(),
    });
  } catch {
    const duration = Date.now() - startTime;
    console.error('❌ [CRON] Live odds snapshot failed');

    return NextResponse.json(
      {
        success: false,
        error: 'Live odds snapshot failed',
        duration,
        triggeredAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
};

// Set max duration for Vercel serverless function
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic'; // Don't cache this route
