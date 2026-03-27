/**
 * Report Loader Utility
 *
 * Loads weekly recap reports from the file system.
 * Supports both new WeeklyRecapReport format and legacy formats.
 * Also normalizes known generation quirks (e.g., code-fenced JSON narratives).
 */

import { access, readFile } from 'fs/promises';
import path from 'path';
import type { WeeklyRecapReport } from '../types';
import { isLegacyReport, transformLegacyReport } from './legacy-transformer';
import { debugLog } from '@/lib/debug-log';

export interface ReportListItem {
  season: number;
  week: number;
  title: string;
  href: string;
  date: string;
  tags: string[];
  status: 'success' | 'partial' | 'failed';
}

/**
 * Try to parse a string wrapped in triple backtick code fences as JSON.
 * Returns `{ parsed, narrative }` where `narrative` is the best-effort text.
 */
const parseCodeFencedJson = (
  raw: string | undefined,
): { parsed: unknown | null; narrative: string } => {
  if (!raw || typeof raw !== 'string') return { parsed: null, narrative: '' };
  const fenceStart = raw.indexOf('```');
  const fenceEnd = raw.lastIndexOf('```');
  if (fenceStart !== -1 && fenceEnd !== -1 && fenceEnd > fenceStart) {
    const inner = raw.slice(fenceStart + 3, fenceEnd).replace(/^\w+\n/, ''); // drop language line if present
    try {
      const obj = JSON.parse(inner);
      if (
        obj &&
        typeof obj === 'object' &&
        'narrative' in obj &&
        typeof (obj as any).narrative === 'string'
      ) {
        return { parsed: obj, narrative: (obj as any).narrative as string };
      }
      // If JSON is a string itself
      if (typeof obj === 'string') {
        return { parsed: obj, narrative: obj };
      }
      // Unknown JSON shape; fall back to stripping fences only
      return { parsed: obj, narrative: inner };
    } catch {
      // Not valid JSON inside fences; fall back to original without fences
      return { parsed: null, narrative: raw.replace(/```/g, '') };
    }
  }
  return { parsed: null, narrative: raw };
};

/**
 * Normalize a report object in-place-safe manner.
 * - Strips code-fenced JSON narratives and extracts `narrative`
 * - Merges `metrics` found inside league overview JSON into stats
 */
const normalizeReport = (report: WeeklyRecapReport): WeeklyRecapReport => {
  const copy: WeeklyRecapReport = JSON.parse(JSON.stringify(report));

  // League Overview normalization
  if (copy.sections?.leagueOverview) {
    const lo = copy.sections.leagueOverview as any;
    const { parsed, narrative } = parseCodeFencedJson(lo.narrative);
    if (narrative) lo.narrative = narrative;
    if (parsed && typeof parsed === 'object' && (parsed as any).metrics) {
      const metrics = (parsed as any).metrics as Record<string, unknown>;
      // Merge select metrics if present
      if (!lo.stats) lo.stats = {};
      if (typeof metrics.totalPoints === 'number') lo.stats.totalPoints = metrics.totalPoints;
      if (typeof metrics.averageScore === 'number') lo.stats.averageScore = metrics.averageScore;
      if (typeof metrics.closeGames === 'number') lo.stats.closeGames = metrics.closeGames;
      if (typeof metrics.blowouts === 'number') lo.stats.blowouts = metrics.blowouts;
    }
  }

  // Matchup narratives: narrative may be code-fenced JSON; extract text
  let derivedHighestScore: number | null = null;
  if (Array.isArray(copy.sections?.matchupNarratives)) {
    copy.sections.matchupNarratives = copy.sections.matchupNarratives.map(m => {
      const next: typeof m & { narrative: string } = { ...m } as any;
      const { parsed, narrative } = parseCodeFencedJson(
        (m as unknown as { narrative?: string }).narrative,
      );
      if (narrative) next.narrative = narrative;

      // Try to derive highest single-team score from embedded JSON metadata
      try {
        const meta = (parsed as { metadata?: { finalScore?: string } } | null | undefined)
          ?.metadata;
        if (meta && typeof meta.finalScore === 'string') {
          const match = meta.finalScore.match(/([0-9]+(?:\.[0-9]+)?)\s*-\s*([0-9]+(?:\.[0-9]+)?)/);
          if (match) {
            const a = parseFloat(match[1]);
            const b = parseFloat(match[2]);
            const high = Math.max(a, b);
            if (!Number.isNaN(high)) {
              derivedHighestScore =
                derivedHighestScore == null ? high : Math.max(derivedHighestScore, high);
            }
          }
        }
      } catch {
        // ignore parse errors
      }

      // Fallback: parse from narrative sentence e.g., "Final score: 125.29 to 91.08"
      if (derivedHighestScore == null || derivedHighestScore === 0) {
        try {
          const text = typeof next.narrative === 'string' ? next.narrative : '';
          const m1 = text.match(
            /Final\s+score:\s*([0-9]+(?:\.[0-9]+)?)\s*(?:-|to)\s*([0-9]+(?:\.[0-9]+)?)/i,
          );
          if (m1) {
            const a = parseFloat(m1[1]);
            const b = parseFloat(m1[2]);
            const high = Math.max(a, b);
            if (!Number.isNaN(high)) {
              derivedHighestScore =
                derivedHighestScore == null ? high : Math.max(derivedHighestScore, high);
            }
          }
        } catch {
          // ignore
        }
      }
      return next;
    });
  }

  // If highestScore is missing or zero, fill from derived value
  if (copy.sections?.leagueOverview) {
    const lo = copy.sections.leagueOverview as any;
    if (!lo.stats) lo.stats = {};
    const current = typeof lo.stats.highestScore === 'number' ? lo.stats.highestScore : 0;
    if ((current == null || current === 0) && derivedHighestScore != null) {
      lo.stats.highestScore = derivedHighestScore;
    }
  }

  // Power rankings/standings/closing narratives may also be code-fenced JSON
  if (
    copy.sections?.powerRankings &&
    (copy.sections as unknown as { powerRankings?: { narrative?: string } }).powerRankings
      ?.narrative
  ) {
    const pr = (copy.sections as unknown as { powerRankings: { narrative?: string } })
      .powerRankings;
    const { narrative } = parseCodeFencedJson(pr.narrative);
    if (narrative) pr.narrative = narrative;
  }
  if (
    copy.sections?.standings &&
    (copy.sections as unknown as { standings?: { narrative?: string } }).standings?.narrative
  ) {
    const st = (copy.sections as unknown as { standings: { narrative?: string } }).standings;
    const { narrative } = parseCodeFencedJson(st.narrative);
    if (narrative) st.narrative = narrative;
  }
  if (
    copy.sections?.closing &&
    (copy.sections as unknown as { closing?: { narrative?: string } }).closing?.narrative
  ) {
    const cl = (copy.sections as unknown as { closing: { narrative?: string } }).closing;
    const { narrative } = parseCodeFencedJson(cl.narrative);
    if (narrative) cl.narrative = narrative;
  }

  return copy;
};

/**
 * Load a specific weekly recap report.
 * Checks new format first, then falls back to legacy format.
 * Returns null if report doesn't exist in either location.
 */
export const loadRecapReport = async (
  season: string | number,
  week: string | number,
): Promise<WeeklyRecapReport | null> => {
  try {
    // Try new format first (data/reports/recap/{season}/week-{week}.json)
    const reportsDir = path.join(process.cwd(), 'data/reports/recap');
    const reportPath = path.join(reportsDir, season.toString(), `week-${week}.json`);

    try {
      await access(reportPath);
      const fileContent = await readFile(reportPath, 'utf-8');
      const report = JSON.parse(fileContent) as WeeklyRecapReport;

      const normalized = normalizeReport(report);

      // Validate new format structure
      if (normalized.metadata && normalized.sections) {
        debugLog(`[Report Loader] Loaded new format report: ${season}/week-${week}`);
        return normalized;
      }
    } catch {
      // New format not found, try legacy
    }

    // Try legacy format (data/report-week{week}.json)
    const legacyPath = path.join(process.cwd(), 'data', `report-week${week}.json`);

    try {
      await access(legacyPath);
      const fileContent = await readFile(legacyPath, 'utf-8');
      const data = JSON.parse(fileContent);

      // Check if it's a legacy report and transform it
      if (isLegacyReport(data)) {
        debugLog(`[Report Loader] Loaded legacy report: week ${week} (transforming...)`);
        return normalizeReport(transformLegacyReport(data));
      }
    } catch {
      // Legacy format not found either
    }

    debugLog(`[Report Loader] Report not found: ${season}/week-${week}`);
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Report Loader] Error loading report:', error);
    return null;
  }
};

/**
 * Get all available reports from the file system.
 * Scans both new format (data/reports/recap) and legacy format (data/report-week*.json).
 */
export const getAvailableReports = async (): Promise<ReportListItem[]> => {
  try {
    const { readdir } = await import('fs/promises');
    const reports: ReportListItem[] = [];
    const newFormatWeeks = new Set<string>(); // Track which weeks have new format

    // Scan new format reports (data/reports/recap/{season}/week-{week}.json)
    const reportsDir = path.join(process.cwd(), 'data/reports/recap');
    try {
      await access(reportsDir);
      const entries = await readdir(reportsDir, { withFileTypes: true });
      const seasons = entries
        .filter(entry => entry.isDirectory() && /^\d{4}$/.test(entry.name))
        .map(entry => entry.name);

      for (const season of seasons) {
        const seasonPath = path.join(reportsDir, season);
        const files = await readdir(seasonPath);

        for (const file of files) {
          if (file.startsWith('week-') && file.endsWith('.json') && !file.includes('backup')) {
            const weekMatch = file.match(/week-(\d+)\.json/);
            if (weekMatch) {
              const week = parseInt(weekMatch[1], 10);
              const filePath = path.join(seasonPath, file);

              try {
                const fileContent = await readFile(filePath, 'utf-8');
                const report = normalizeReport(JSON.parse(fileContent) as WeeklyRecapReport);

                reports.push({
                  season: parseInt(season, 10),
                  week,
                  title: `Week ${week} Report — ${season}`,
                  href: `/competition/reports/${season}/week-${week}`,
                  date: report.metadata?.generatedAt || new Date().toISOString(),
                  tags: ['Week ' + week, 'AFC', 'NFC', 'Power Rankings'],
                  status: report.metadata?.status || 'success',
                });

                // Track this week as having new format
                newFormatWeeks.add(`${season}-${week}`);
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`[Report Loader] Error parsing ${season}/week-${week}:`, error);
              }
            }
          }
        }
      }
    } catch {
      debugLog('[Report Loader] New format reports directory does not exist yet');
    }

    // Scan legacy format reports (data/report-week*.json)
    // Only include if new format doesn't exist for that week
    const legacyDir = path.join(process.cwd(), 'data');
    try {
      const files = await readdir(legacyDir);
      const legacyReports = files.filter(f => f.startsWith('report-week') && f.endsWith('.json'));

      for (const file of legacyReports) {
        const weekMatch = file.match(/report-week(\d+)\.json/);
        if (weekMatch) {
          const week = parseInt(weekMatch[1], 10);
          const filePath = path.join(legacyDir, file);

          try {
            const fileContent = await readFile(filePath, 'utf-8');
            const data = JSON.parse(fileContent);

            if (isLegacyReport(data)) {
              // Assume 2025 season for legacy reports (or parse if present)
              const season = parseInt((data.season as string) || '2025', 10);

              // Skip if new format already exists for this week
              if (!newFormatWeeks.has(`${season}-${week}`)) {
                reports.push({
                  season,
                  week,
                  title: `Week ${week} Report — ${season}`,
                  href: `/competition/reports/${season}/week-${week}`,
                  date: (data.lastUpdated as string) || new Date().toISOString(),
                  tags: ['Week ' + week, 'AFC', 'NFC'],
                  status: 'success',
                });
              }
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`[Report Loader] Error parsing legacy report week ${week}:`, error);
          }
        }
      }
    } catch {
      debugLog('[Report Loader] No legacy reports found');
    }

    // Add Week 1 (hardcoded static page)
    reports.push({
      season: 2025,
      week: 1,
      title: `Week 1 Report — 2025`,
      href: `/competition/reports/2025/week-1`,
      date: '2025-09-13T13:35:44.370Z', // From the static page data
      tags: ['Week 1', 'AFC', 'NFC'],
      status: 'success',
    });

    // Sort by date descending (newest first)
    reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return reports;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Report Loader] Error scanning reports:', error);
    return [];
  }
};

/**
 * Get static params for Next.js generateStaticParams.
 * Returns all season/week combinations that have reports.
 */
export const getStaticReportParams = async (): Promise<{ season: string; week: string }[]> => {
  const reports = await getAvailableReports();
  return reports.map(r => ({
    season: r.season.toString(),
    week: r.week.toString(),
  }));
};
