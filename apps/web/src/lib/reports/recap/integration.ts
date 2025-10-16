/**
 * Integration Module: Report Generation + Storage
 *
 * Combines the report generation (orchestrator.ts) with file system storage (storage/).
 * Provides a simple API for generating and saving reports in one step.
 */

import { generateRecapReport } from './orchestrator';
import { formatRecapReport } from './output/formatter';
import { reportExists, saveReport } from './storage';
import type { WeeklyRecapReport } from './types';

/**
 * Clean narrative content by removing JSON code block wrappers.
 * AI sometimes wraps responses in ```json blocks - this extracts the actual content.
 */
const cleanNarrative = (text: string): string => {
  if (!text) return text;

  // Check if wrapped in JSON code block
  const jsonBlockMatch = text.match(/^```json\s*\n?([\s\S]*?)\n?```$/);
  if (jsonBlockMatch) {
    try {
      // Extract and parse the JSON
      const jsonContent = JSON.parse(jsonBlockMatch[1]);
      // Return the narrative field if it exists
      return jsonContent.narrative || text;
    } catch {
      // If parsing fails, return original
      return text;
    }
  }

  return text;
};

/**
 * Options for generating and saving a recap report.
 */
export interface GenerateAndSaveOptions {
  week: number;
  season: number;
  forceRegenerate?: boolean; // Regenerate even if report exists
  saveToFile?: boolean; // Default: true
}

/**
 * Result of generate and save operation.
 */
export interface GenerateAndSaveResult {
  success: boolean;
  week: number;
  season: number;
  report?: any; // The simple report structure from generate.ts
  saved: boolean;
  filePath?: string;
  backupCreated?: boolean;
  error?: string;
  duration: number;
  tokensUsed?: number;
}

/**
 * Generate a weekly recap report and save it to the file system.
 *
 * This is the main entry point for report generation with automatic storage.
 *
 * @param options - Generation options
 * @returns Result with success status and file paths
 *
 * @example
 * ```typescript
 * const result = await generateAndSave({ week: 5, season: 2025 });
 * if (result.success) {
 *   console.log('Report saved to:', result.filePath);
 * }
 * ```
 */
export const generateAndSave = async (
  options: GenerateAndSaveOptions,
): Promise<GenerateAndSaveResult> => {
  const startTime = Date.now();
  const { week, season, forceRegenerate = false, saveToFile = true } = options;

  try {
    // Check if report already exists
    if (!forceRegenerate) {
      const exists = await reportExists(season, week);
      if (exists) {
        return {
          success: false,
          week,
          season,
          saved: false,
          error: `Report already exists for Week ${week}, ${season} season. Use forceRegenerate: true to overwrite.`,
          duration: Date.now() - startTime,
        };
      }
    }

    // Generate the report using orchestrator
    console.log(`\n📰 Generating recap report for Week ${week}, ${season} season...\n`);
    const reportState = await generateRecapReport(week, season);

    // Format the state into final WeeklyRecapReport structure with all data (now async to fetch full timeSeries)
    let fullReport = await formatRecapReport(reportState);

    // Clean narratives to remove JSON code block wrappers
    fullReport = {
      ...fullReport,
      sections: {
        ...fullReport.sections,
        leagueOverview: {
          ...fullReport.sections.leagueOverview,
          narrative: cleanNarrative(fullReport.sections.leagueOverview.narrative),
        },
        matchupNarratives: fullReport.sections.matchupNarratives.map(m => ({
          ...m,
          narrative: cleanNarrative(m.narrative),
        })),
        hallOfFame: fullReport.sections.hallOfFame
          ? {
              ...fullReport.sections.hallOfFame,
              narrative: cleanNarrative(fullReport.sections.hallOfFame.narrative),
            }
          : fullReport.sections.hallOfFame,
        hallOfShame: fullReport.sections.hallOfShame
          ? {
              ...fullReport.sections.hallOfShame,
              narrative: cleanNarrative(fullReport.sections.hallOfShame.narrative),
            }
          : fullReport.sections.hallOfShame,
        powerRankings: fullReport.sections.powerRankings
          ? {
              ...fullReport.sections.powerRankings,
              narrative: cleanNarrative(fullReport.sections.powerRankings.narrative),
            }
          : fullReport.sections.powerRankings,
        standings: fullReport.sections.standings
          ? {
              ...fullReport.sections.standings,
              narrative: cleanNarrative(fullReport.sections.standings.narrative),
            }
          : fullReport.sections.standings,
        upcoming: fullReport.sections.upcoming
          ? {
              ...fullReport.sections.upcoming,
              narrative: cleanNarrative(fullReport.sections.upcoming.narrative),
            }
          : fullReport.sections.upcoming,
        closing: fullReport.sections.closing
          ? {
              ...fullReport.sections.closing,
              narrative: cleanNarrative(fullReport.sections.closing.narrative),
            }
          : fullReport.sections.closing,
      },
    };

    // Save to file system
    let saveResult;
    let filePath: string | undefined;
    let backupCreated = false;

    if (saveToFile) {
      console.log(`\n💾 Saving report to file system...\n`);
      saveResult = await saveReport(fullReport as WeeklyRecapReport);

      if (!saveResult.success) {
        console.error(`❌ Failed to save report: ${saveResult.error}`);
        return {
          success: false,
          week,
          season,
          report: fullReport,
          saved: false,
          error: `Generation succeeded but save failed: ${saveResult.error}`,
          duration: Date.now() - startTime,
        };
      }

      filePath = saveResult.filePath;
      backupCreated = !!saveResult.backupPath;

      console.log(`✅ Report saved to: ${filePath}`);
      if (backupCreated) {
        console.log(`📦 Backup created: ${saveResult.backupPath}`);
      }
    }

    const duration = Date.now() - startTime;

    console.log(`\n✨ Report generation complete in ${(duration / 1000).toFixed(2)}s\n`);

    return {
      success: true,
      week,
      season,
      report: fullReport,
      saved: saveToFile,
      filePath,
      backupCreated,
      duration,
      tokensUsed: fullReport.metadata.tokensUsed,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ Report generation failed:`, error);

    return {
      success: false,
      week,
      season,
      saved: false,
      error: error instanceof Error ? error.message : String(error),
      duration,
    };
  }
};

/**
 * Generate a report without saving (dry run).
 * Useful for testing and validation.
 */
export const generateDryRun = async (
  week: number,
  season: number,
): Promise<GenerateAndSaveResult> => {
  return generateAndSave({
    week,
    season,
    saveToFile: false,
  });
};

/**
 * Check if a report needs regeneration.
 * Returns true if report doesn't exist or force regeneration is requested.
 */
export const needsRegeneration = async (
  week: number,
  season: number,
  force = false,
): Promise<boolean> => {
  if (force) {
    return true;
  }
  const exists = await reportExists(season, week);
  return !exists;
};
