import { NextRequest, NextResponse } from 'next/server';
import { requireCronAuth } from '@/lib/cron-auth';
import { debugLog } from '@/lib/debug-log';

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
export const GET = async (request: NextRequest) => {
  // Verify the request is from Vercel Cron. Fails closed when CRON_SECRET is
  // unset - see src/lib/cron-auth.ts.
  const unauthorized = requireCronAuth(request);
  if (unauthorized) return unauthorized;

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
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [CRON] Live odds snapshot failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration,
        triggeredAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
};

// Optionally allow manual triggers
export const POST = async (request: NextRequest) => {
  return GET(request);
};

// Set max duration for Vercel serverless function
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic'; // Don't cache this route
