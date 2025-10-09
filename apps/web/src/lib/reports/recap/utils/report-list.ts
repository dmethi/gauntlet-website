/**
 * Report List Utilities
 *
 * Discovers and lists available weekly recap reports from the file system.
 * Used by the API route to provide report listings for the frontend.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface ReportListItem {
  title: string;
  href: string;
  date: string; // ISO timestamp
  week: number;
  season: number;
  tags: string[];
  status: 'success' | 'partial' | 'failed';
  generationTime?: number;
  tokensUsed?: number;
  description?: string;
}

export interface ReportMetadata {
  week: number;
  season: number;
  generatedAt: string;
  generationTime?: number;
  tokensUsed?: number;
  version?: string;
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

/**
 * Scans the file system for available recap reports
 *
 * @returns Array of report list items, sorted by date descending (newest first)
 */
export const getAvailableReports = async (): Promise<ReportListItem[]> => {
  const reportsDir = path.join(process.cwd(), 'data/reports/recap');
  const reports: ReportListItem[] = [];

  try {
    // Check if reports directory exists
    await fs.access(reportsDir);
  } catch {
    console.warn('Reports directory not found:', reportsDir);
    return [];
  }

  try {
    // Get all year directories
    const entries = await fs.readdir(reportsDir, { withFileTypes: true });
    const yearDirs = entries
      .filter(entry => entry.isDirectory() && /^\d{4}$/.test(entry.name))
      .map(entry => entry.name);

    // Scan each year directory for report files
    for (const year of yearDirs) {
      const yearPath = path.join(reportsDir, year);
      const files = await fs.readdir(yearPath);

      for (const file of files) {
        // Match week-N.json pattern (not backups or metadata)
        const match = file.match(/^week-(\d+)\.json$/);
        if (!match) continue;

        const weekNum = parseInt(match[1], 10);
        const filePath = path.join(yearPath, file);

        try {
          // Read and parse report metadata
          const data = await fs.readFile(filePath, 'utf-8');
          const report = JSON.parse(data);
          const metadata: ReportMetadata = report.metadata;

          // Extract description from league overview or first section
          let description = 'Weekly recap and analysis';
          if (report.sections?.leagueOverview?.narrative) {
            const narrative = report.sections.leagueOverview.narrative;
            // Extract first sentence or first 100 chars
            const firstSentence = narrative.match(/^[^.!?]+[.!?]/)?.[0];
            description = firstSentence
              ? firstSentence.trim().substring(0, 120) + (firstSentence.length > 120 ? '...' : '')
              : narrative.substring(0, 120) + '...';
          }

          // Build tags based on report content
          const tags: string[] = [`Week ${weekNum}`];

          // Add league tags
          if (report.sections?.leagueOverview) {
            tags.push('AFC', 'NFC');
          }

          // Add feature tags based on what sections exist
          if (report.sections?.powerRankings) {
            tags.push('Power Rankings');
          }
          if (report.sections?.standings) {
            tags.push('Standings');
          }
          if (weekNum === 1 && report.sections?.hallOfFame) {
            tags.push('Draft Analysis');
          }

          reports.push({
            title: `Week ${weekNum} Report — ${year}`,
            href: `/competition/reports/${year}/week-${weekNum}`,
            date: metadata.generatedAt,
            week: weekNum,
            season: parseInt(year, 10),
            tags,
            status: metadata.status,
            generationTime: metadata.generationTime,
            tokensUsed: metadata.tokensUsed,
            description,
          });
        } catch (error) {
          console.error(`Failed to parse report ${filePath}:`, error);
          // Skip malformed reports
          continue;
        }
      }
    }

    // Sort by date descending (newest first)
    reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return reports;
  } catch (error) {
    console.error('Error scanning reports directory:', error);
    return [];
  }
};

/**
 * Gets the latest N reports
 *
 * @param count - Number of reports to return (default: 5)
 * @returns Array of latest report list items
 */
export const getLatestReports = async (count: number = 5): Promise<ReportListItem[]> => {
  const allReports = await getAvailableReports();
  return allReports.slice(0, count);
};

/**
 * Gets reports for a specific season
 *
 * @param season - Season year (e.g., 2025)
 * @returns Array of report list items for that season
 */
export const getSeasonReports = async (season: number): Promise<ReportListItem[]> => {
  const allReports = await getAvailableReports();
  return allReports.filter(report => report.season === season);
};

/**
 * Checks if a report exists for a given week and season
 *
 * @param season - Season year
 * @param week - Week number
 * @returns True if report exists
 */
export const reportExists = async (season: number, week: number): Promise<boolean> => {
  const filePath = path.join(
    process.cwd(),
    'data/reports/recap',
    season.toString(),
    `week-${week}.json`,
  );

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
