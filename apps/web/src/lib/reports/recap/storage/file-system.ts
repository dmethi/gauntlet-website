/**
 * File System Storage for Weekly Recap Reports
 *
 * Handles saving, loading, and managing recap reports on the file system with:
 * - Atomic writes (temp file → rename)
 * - Backup/versioning on regeneration
 * - Generation history metadata tracking
 * - Proper error handling for disk failures
 *
 * Storage structure:
 * ```
 * apps/web/data/reports/recap/
 * ├── 2025/
 * │   ├── week-1.json
 * │   ├── week-1.backup.json (previous version)
 * │   ├── week-2.json
 * │   └── metadata.json (generation history)
 * ├── 2024/
 * │   └── ...
 * └── README.md
 * ```
 */

import fs from 'fs/promises';
import path from 'path';
import type { WeeklyRecapReport } from '../types';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const REPORTS_BASE_DIR = path.join(process.cwd(), 'data', 'reports', 'recap');

/**
 * Storage paths configuration.
 */
export interface StorageConfig {
  baseDir?: string;
  enableBackups?: boolean;
  enableMetadata?: boolean;
}

const DEFAULT_CONFIG: Required<StorageConfig> = {
  baseDir: REPORTS_BASE_DIR,
  enableBackups: true,
  enableMetadata: true,
};

// ============================================================================
// TYPES
// ============================================================================

/**
 * Generation history metadata structure.
 */
export interface GenerationMetadata {
  [season: string]: {
    [weekKey: string]: WeekMetadata;
  };
}

/**
 * Metadata for a specific week's report.
 */
export interface WeekMetadata {
  generated: string[]; // ISO timestamps of all generations
  lastStatus: 'success' | 'partial' | 'failed';
  lastDuration: number; // milliseconds
  lastTokens: number;
  lastGeneratedAt: string; // ISO timestamp
  fileSize?: number; // bytes
}

/**
 * Result of save operation.
 */
export interface SaveResult {
  success: boolean;
  filePath: string;
  backupPath?: string;
  error?: string;
  fileSize?: number;
  duration?: number;
}

/**
 * Result of load operation.
 */
export interface LoadResult {
  success: boolean;
  report?: WeeklyRecapReport;
  error?: string;
  filePath?: string;
}

// ============================================================================
// CORE STORAGE FUNCTIONS
// ============================================================================

/**
 * Save a report to the file system with atomic write.
 * Creates backup of existing file if present.
 */
export const saveReport = async (
  report: WeeklyRecapReport,
  config: StorageConfig = {},
): Promise<SaveResult> => {
  const startTime = Date.now();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const { week, season } = report.metadata;

    // Ensure directory structure exists
    await ensureDirectoryStructure(season, mergedConfig.baseDir);

    // Generate file paths
    const reportPath = getReportPath(season, week, mergedConfig.baseDir);
    const backupPath = getBackupPath(season, week, mergedConfig.baseDir);
    const tempPath = getTempPath(season, week, mergedConfig.baseDir);

    // Check if report already exists (for backup)
    let backupCreated = false;
    if (mergedConfig.enableBackups) {
      const exists = await fileExists(reportPath);
      if (exists) {
        await fs.copyFile(reportPath, backupPath);
        backupCreated = true;
      }
    }

    // Serialize report to JSON
    const jsonContent = JSON.stringify(report, null, 2);
    // eslint-disable-next-line no-undef
    const fileSize = Buffer.byteLength(jsonContent, 'utf8');

    // Write to temp file first (atomic write)
    await fs.writeFile(tempPath, jsonContent, 'utf8');

    // Rename temp to final (atomic operation)
    await fs.rename(tempPath, reportPath);

    // Update generation metadata
    if (mergedConfig.enableMetadata) {
      await updateMetadata(season, week, report, fileSize, mergedConfig.baseDir);
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      filePath: reportPath,
      backupPath: backupCreated ? backupPath : undefined,
      fileSize,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      filePath: getReportPath(report.metadata.season, report.metadata.week, mergedConfig.baseDir),
      error: error instanceof Error ? error.message : String(error),
      duration,
    };
  }
};

/**
 * Load a report from the file system.
 */
export const loadReport = async (
  season: number,
  week: number,
  config: StorageConfig = {},
): Promise<LoadResult> => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const reportPath = getReportPath(season, week, mergedConfig.baseDir);

  try {
    const exists = await fileExists(reportPath);
    if (!exists) {
      return {
        success: false,
        error: `Report not found: ${reportPath}`,
        filePath: reportPath,
      };
    }

    const content = await fs.readFile(reportPath, 'utf8');
    const report = JSON.parse(content) as WeeklyRecapReport;

    return {
      success: true,
      report,
      filePath: reportPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      filePath: reportPath,
    };
  }
};

/**
 * Load backup version of a report.
 */
export const loadBackup = async (
  season: number,
  week: number,
  config: StorageConfig = {},
): Promise<LoadResult> => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const backupPath = getBackupPath(season, week, mergedConfig.baseDir);

  try {
    const exists = await fileExists(backupPath);
    if (!exists) {
      return {
        success: false,
        error: `Backup not found: ${backupPath}`,
        filePath: backupPath,
      };
    }

    const content = await fs.readFile(backupPath, 'utf8');
    const report = JSON.parse(content) as WeeklyRecapReport;

    return {
      success: true,
      report,
      filePath: backupPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      filePath: backupPath,
    };
  }
};

/**
 * Check if a report exists.
 */
export const reportExists = async (
  season: number,
  week: number,
  config: StorageConfig = {},
): Promise<boolean> => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const reportPath = getReportPath(season, week, mergedConfig.baseDir);
  return fileExists(reportPath);
};

/**
 * Delete a report and its backup.
 */
export const deleteReport = async (
  season: number,
  week: number,
  config: StorageConfig = {},
): Promise<boolean> => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const reportPath = getReportPath(season, week, mergedConfig.baseDir);
    const backupPath = getBackupPath(season, week, mergedConfig.baseDir);

    // Delete main report
    if (await fileExists(reportPath)) {
      await fs.unlink(reportPath);
    }

    // Delete backup
    if (await fileExists(backupPath)) {
      await fs.unlink(backupPath);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete report:', error);
    return false;
  }
};

// ============================================================================
// METADATA FUNCTIONS
// ============================================================================

/**
 * Update generation metadata for a report.
 */
const updateMetadata = async (
  season: number,
  week: number,
  report: WeeklyRecapReport,
  fileSize: number,
  baseDir: string,
): Promise<void> => {
  const metadataPath = getMetadataPath(season, baseDir);

  try {
    // Load existing metadata
    const metadata = await loadMetadata(season, baseDir);

    // Ensure season exists
    if (!metadata[season]) {
      metadata[season] = {};
    }

    const weekKey = `week-${week}`;

    // Update or create week entry
    if (!metadata[season][weekKey]) {
      metadata[season][weekKey] = {
        generated: [],
        lastStatus: report.metadata.status,
        lastDuration: report.metadata.generationTime,
        lastTokens: report.metadata.tokensUsed,
        lastGeneratedAt: report.metadata.generatedAt,
        fileSize,
      };
    } else {
      // Update existing entry
      metadata[season][weekKey].generated.push(report.metadata.generatedAt);
      metadata[season][weekKey].lastStatus = report.metadata.status;
      metadata[season][weekKey].lastDuration = report.metadata.generationTime;
      metadata[season][weekKey].lastTokens = report.metadata.tokensUsed;
      metadata[season][weekKey].lastGeneratedAt = report.metadata.generatedAt;
      metadata[season][weekKey].fileSize = fileSize;
    }

    // Add current timestamp to generated array
    if (!metadata[season][weekKey].generated.includes(report.metadata.generatedAt)) {
      metadata[season][weekKey].generated.push(report.metadata.generatedAt);
    }

    // Save metadata
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to update metadata:', error);
    // Don't throw - metadata update failure shouldn't break save
  }
};

/**
 * Load generation metadata for a season.
 */
export const loadMetadata = async (
  season: number,
  baseDir: string = REPORTS_BASE_DIR,
): Promise<GenerationMetadata> => {
  const metadataPath = getMetadataPath(season, baseDir);

  try {
    const exists = await fileExists(metadataPath);
    if (!exists) {
      return {};
    }

    const content = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(content) as GenerationMetadata;
  } catch (error) {
    console.error('Failed to load metadata:', error);
    return {};
  }
};

/**
 * Get metadata for a specific week.
 */
export const getWeekMetadata = async (
  season: number,
  week: number,
  baseDir: string = REPORTS_BASE_DIR,
): Promise<WeekMetadata | null> => {
  const metadata = await loadMetadata(season, baseDir);
  const weekKey = `week-${week}`;
  return metadata[season]?.[weekKey] || null;
};

// ============================================================================
// LISTING & DISCOVERY FUNCTIONS
// ============================================================================

/**
 * List all available reports for a season.
 */
export const listReports = async (
  season: number,
  config: StorageConfig = {},
): Promise<Array<{ week: number; filePath: string }>> => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const seasonDir = path.join(mergedConfig.baseDir, season.toString());

  try {
    const exists = await fileExists(seasonDir);
    if (!exists) {
      return [];
    }

    const files = await fs.readdir(seasonDir);
    const reports: Array<{ week: number; filePath: string }> = [];

    for (const file of files) {
      // Match week-N.json pattern
      const match = file.match(/^week-(\d+)\.json$/);
      if (match) {
        const week = parseInt(match[1], 10);
        reports.push({
          week,
          filePath: path.join(seasonDir, file),
        });
      }
    }

    // Sort by week ascending
    reports.sort((a, b) => a.week - b.week);

    return reports;
  } catch (error) {
    console.error('Failed to list reports:', error);
    return [];
  }
};

/**
 * List all available seasons.
 */
export const listSeasons = async (config: StorageConfig = {}): Promise<number[]> => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const exists = await fileExists(mergedConfig.baseDir);
    if (!exists) {
      return [];
    }

    const entries = await fs.readdir(mergedConfig.baseDir, { withFileTypes: true });
    const seasons: number[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const season = parseInt(entry.name, 10);
        if (!isNaN(season)) {
          seasons.push(season);
        }
      }
    }

    // Sort descending (newest first)
    seasons.sort((a, b) => b - a);

    return seasons;
  } catch (error) {
    console.error('Failed to list seasons:', error);
    return [];
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Ensure directory structure exists for a season.
 */
const ensureDirectoryStructure = async (season: number, baseDir: string): Promise<void> => {
  const seasonDir = path.join(baseDir, season.toString());
  await fs.mkdir(seasonDir, { recursive: true });
};

/**
 * Get report file path.
 */
const getReportPath = (season: number, week: number, baseDir: string): string => {
  return path.join(baseDir, season.toString(), `week-${week}.json`);
};

/**
 * Get backup file path.
 */
const getBackupPath = (season: number, week: number, baseDir: string): string => {
  return path.join(baseDir, season.toString(), `week-${week}.backup.json`);
};

/**
 * Get temporary file path for atomic writes.
 */
const getTempPath = (season: number, week: number, baseDir: string): string => {
  return path.join(baseDir, season.toString(), `week-${week}.tmp.json`);
};

/**
 * Get metadata file path for a season.
 */
const getMetadataPath = (season: number, baseDir: string): string => {
  return path.join(baseDir, season.toString(), 'metadata.json');
};

/**
 * Check if a file exists.
 */
const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
