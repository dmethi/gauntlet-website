/**
 * Integration Module: Report Generation + Storage
 *
 * Combines the report generation (generate.ts) with file system storage (storage/).
 * Provides a simple API for generating and saving reports in one step.
 */

import { generateWeeklyRecap as generateReport } from './generate';
import { saveReport, reportExists } from './storage';
import type { WeeklyRecapReport } from './types';

// Re-export the simpler report type from generate.ts
export type { WeeklyRecapReport as SimpleRecapReport } from './generate';

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

    // Generate the report
    console.log(`\n📰 Generating recap report for Week ${week}, ${season} season...\n`);
    const report = await generateReport(week, season);

    // Convert simple report to full WeeklyRecapReport format for storage
    // Note: The current generate.ts returns a simplified format
    // We'll store it as-is with metadata wrapper
    const fullReport: Partial<WeeklyRecapReport> = {
      metadata: {
        week,
        season,
        generatedAt: report.generatedAt,
        generationTime: Date.now() - startTime,
        tokensUsed: 0, // Not tracked in current generate.ts
        version: '1.0.0',
        status: report.errors.length === 0 ? 'success' : 'partial',
        errors: report.errors.length > 0 ? report.errors : undefined,
      },
      sections: {
        leagueOverview: {
          narrative: report.leagueOverview,
          stats: {
            totalGames: 12,
            totalPoints: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            blowouts: 0,
            closeGames: 0,
          },
          generatedAt: report.generatedAt,
        },
        matchupNarratives: report.matchupNarratives.map(m => ({
          matchupId: m.matchupId,
          narrative: m.narrative,
          boxScore: {
            team1: {
              teamName: '',
              rosterId: 0,
              leagueId: m.league,
              score: 0,
              record: '',
              topPerformers: [],
            },
            team2: {
              teamName: '',
              rosterId: 0,
              leagueId: m.league,
              score: 0,
              record: '',
              topPerformers: [],
            },
            finalScore: { team1: 0, team2: 0 },
            winner: 'team1',
            margin: 0,
          },
          generatedAt: report.generatedAt,
        })),
        hallOfFame: {
          narrative: report.hallOfFame,
          highlights: {
            topTeamScore: { teamName: '', score: 0, leagueId: '', rosterId: 0 },
            biggestBlowout: { winner: '', loser: '', margin: 0, matchupId: '' },
            topPerformers: {
              QB: [],
              RB: [],
              WR: [],
              TE: [],
              K: [],
              DEF: [],
            },
          },
          generatedAt: report.generatedAt,
        },
        hallOfShame: {
          narrative: report.hallOfShame,
          lowlights: {
            lowestTeamScore: { teamName: '', score: 0, leagueId: '', rosterId: 0 },
            biggestBusts: [],
            badBeatLosses: [],
          },
          generatedAt: report.generatedAt,
        },
        powerRankings: {
          narrative: report.powerRankings,
          rankings: [],
          generatedAt: report.generatedAt,
        },
        standings: {
          narrative: report.standings,
          standings: { afc: [], nfc: [] },
          playoffPicture: { clinched: [], inHunt: [], eliminated: [] },
          generatedAt: report.generatedAt,
        },
        upcoming: {
          narrative: '',
          matchups: [],
          generatedAt: report.generatedAt,
        },
        closing: {
          narrative: report.closing,
          generatedAt: report.generatedAt,
        },
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
          report,
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
      report,
      saved: saveToFile,
      filePath,
      backupCreated,
      duration,
      tokensUsed: 0, // Not tracked yet
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
