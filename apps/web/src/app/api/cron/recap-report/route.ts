import { NextRequest, NextResponse } from 'next/server';
import { debugLog } from '@/lib/debug-log';
import { authorizeBearer, createFixedWindowGate } from '@/lib/api-security';

const replayGate = createFixedWindowGate({ limit: 1, windowMs: 60_000 });

/**
 * Cron endpoint for weekly recap report generation
 *
 * Automatically generates a comprehensive weekly recap report every Tuesday morning.
 * Triggered by external cron service (cron-job.org) at 10am ET (2pm UTC) after MNF concludes.
 *
 * Schedule: "0 14 * * 2" (Every Tuesday at 2pm UTC / 10am ET)
 * Configure at: https://cron-job.org
 *
 * Setup:
 * 1. Create job at cron-job.org
 * 2. URL: https://your-domain.com/api/cron/recap-report
 * 3. Method: POST
 * 4. Headers: Authorization: Bearer YOUR_CRON_SECRET
 * 5. Schedule: "0 14 * * 2"
 *
 * Manual trigger:
 * ```bash
 * curl -X POST https://your-domain.com/api/cron/recap-report \
 *   -H "Authorization: Bearer $CRON_SECRET"
 * ```
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
  if (!replayGate.allow('recap-report')) {
    return NextResponse.json(
      { error: 'Cron command recently accepted' },
      { status: 429, headers: { 'retry-after': '60' } },
    );
  }

  const startTime = Date.now();

  try {
    debugLog('📰 [CRON] Starting weekly recap generation...');

    // Dynamic import to avoid bundling unnecessarily
    const { runRecapGeneration } = await import('./runner');

    const result = await runRecapGeneration();

    const duration = Date.now() - startTime;

    debugLog('✅ [CRON] Weekly recap generation completed:', {
      duration: `${duration}ms`,
      week: result.week,
      season: result.season,
      status: result.status,
      saved: result.saved,
      errors: result.errors?.length || 0,
    });

    return NextResponse.json({
      success: true,
      ...result,
      duration,
      triggeredAt: new Date().toISOString(),
    });
  } catch {
    const duration = Date.now() - startTime;
    console.error('❌ [CRON] Weekly recap generation failed');

    return NextResponse.json(
      {
        success: false,
        error: 'Recap generation failed',
        duration,
        triggeredAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
};

/**
 * Set max duration for AI generation (5 minutes)
 * Report generation can take 60-90 seconds depending on AI response times
 */
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic'; // Don't cache this route
