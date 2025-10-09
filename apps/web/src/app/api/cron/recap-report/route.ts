import { NextRequest, NextResponse } from 'next/server';

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
export async function GET(request: NextRequest) {
  // Verify the request is from authorized cron service
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    console.log('📰 [CRON] Starting weekly recap generation...');

    // Dynamic import to avoid bundling unnecessarily
    const { runRecapGeneration } = await import('./runner');

    const result = await runRecapGeneration();

    const duration = Date.now() - startTime;

    console.log('✅ [CRON] Weekly recap generation completed:', {
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
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [CRON] Weekly recap generation failed:', error);

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
}

/**
 * Allow manual triggers via POST
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

/**
 * Set max duration for AI generation (5 minutes)
 * Report generation can take 60-90 seconds depending on AI response times
 */
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic'; // Don't cache this route
