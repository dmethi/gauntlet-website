/**
 * Recap Report Runner - Executes weekly recap generation logic
 *
 * This file runs the complete report generation pipeline:
 * 1. Detects current NFL week
 * 2. Generates report using Gemini AI
 * 3. Saves to file system
 * 4. Returns structured result
 *
 * Architecture:
 * - Uses generateAndSave() from integration.ts
 * - Handles errors gracefully with structured logging
 * - Returns result object for HTTP response
 *
 * Requirements:
 * - GEMINI_API_KEY env var must be set in Vercel
 * - CRON_SECRET for authentication
 * - @gauntlet/lib package for getCurrentWeek()
 */

import { generateAndSave } from '@/lib/reports/recap/integration';
import { getCurrentWeek } from '@/lib/api-replacements';
import { debugLog } from '@/lib/debug-log';

interface RecapGenerationResult {
  week: number;
  season: number;
  status: 'success' | 'partial' | 'failed';
  saved: boolean;
  filePath?: string;
  backupCreated?: boolean;
  errors?: string[];
  duration: number;
  tokensUsed?: number;
}

/**
 * Run the weekly recap generation
 *
 * This is the main entry point called by the Vercel cron endpoint.
 * It detects the current week and generates the recap report.
 */
export const runRecapGeneration = async (): Promise<RecapGenerationResult> => {
  const jobStartTime = Date.now();

  try {
    // Get current NFL week
    const currentWeek = await getCurrentWeek();
    const currentSeason = new Date().getFullYear();

    debugLog(`📰 [RECAP] Generating report for Week ${currentWeek}, ${currentSeason} season`);

    // Check environment
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Generate and save the report
    // Note: We don't use forceRegenerate=true to avoid accidentally overwriting
    // existing reports. If a report already exists, this will fail gracefully.
    const result = await generateAndSave({
      week: currentWeek,
      season: currentSeason,
      forceRegenerate: false,
      saveToFile: true,
    });

    const duration = Date.now() - jobStartTime;

    if (result.success) {
      debugLog('✅ [RECAP] Report generated successfully:', {
        week: currentWeek,
        season: currentSeason,
        duration: `${duration}ms`,
        filePath: result.filePath,
        backupCreated: result.backupCreated,
      });

      return {
        week: currentWeek,
        season: currentSeason,
        status: 'success',
        saved: result.saved,
        filePath: result.filePath,
        backupCreated: result.backupCreated,
        duration,
        tokensUsed: result.tokensUsed,
      };
    }

    // Partial success or failure
    console.warn('⚠️ [RECAP] Report generation had issues:', {
      week: currentWeek,
      season: currentSeason,
      error: result.error,
      duration: `${duration}ms`,
    });

    return {
      week: currentWeek,
      season: currentSeason,
      status: 'failed',
      saved: false,
      errors: result.error ? [result.error] : undefined,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - jobStartTime;

    console.error('❌ [RECAP] Report generation failed with exception:', error);

    // Try to get week for error reporting
    let week = 0;
    try {
      week = await getCurrentWeek();
    } catch {
      week = 0;
    }

    return {
      week,
      season: new Date().getFullYear(),
      status: 'failed',
      saved: false,
      errors: [error instanceof Error ? error.message : String(error)],
      duration,
    };
  }
};
