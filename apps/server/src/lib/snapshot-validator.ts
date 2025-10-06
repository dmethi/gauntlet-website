/**
 * Snapshot Validation and Deduplication Utility
 *
 * Handles validation, deduplication, and saving of live matchup snapshots.
 * Prevents saving duplicate data when scores and projections haven't changed.
 */

import { logger } from './logger.js';
import { getLastWinProbSample, saveLiveWinProbSample } from './historical-data.js';
import type {
  CompleteSnapshot,
  Metrics,
  PreviousSnapshot,
  ValidationResult,
} from '@gauntlet/types';

/**
 * Check if snapshot data has changed significantly since the last snapshot
 *
 * @param previous - Previous snapshot data from database
 * @param current - Current snapshot data to validate
 * @param threshold - Minimum difference to consider as changed (default: 0.01)
 * @returns True if data has changed significantly, false otherwise
 *
 * @example
 * ```typescript
 * const changed = hasSignificantChange(lastSnapshot, currentSnapshot);
 * if (changed) {
 *   console.log('Data has changed, saving new snapshot');
 * }
 * ```
 */
export const hasSignificantChange = (
  previous: PreviousSnapshot,
  current: CompleteSnapshot,
  threshold = 0.01
): boolean => {
  // Compare scores
  const scoresMatch =
    Math.abs(previous.currentScoreA - current.team1.currentScore) < threshold &&
    Math.abs(previous.currentScoreB - current.team2.currentScore) < threshold;

  // Compare projections
  const projectionsMatch =
    Math.abs(previous.projectedFinalA - current.team1.simulatedMean) < threshold &&
    Math.abs(previous.projectedFinalB - current.team2.simulatedMean) < threshold;

  // Compare odds
  const oddsMatch =
    Math.abs(previous.spread - current.spread) < threshold &&
    Math.abs(previous.total - current.total) < threshold;

  // Return true if ANY have changed
  return !scoresMatch || !projectionsMatch || !oddsMatch;
};

/**
 * Print a formatted player table for debugging
 *
 * @param label - Label for the table (e.g., team name)
 * @param players - Array of player data to display
 *
 * @example
 * ```typescript
 * printPlayerTable('Team Alpha', snapshot.team1Players);
 * ```
 */
const printPlayerTable = (label: string, players?: CompleteSnapshot['team1Players']): void => {
  if (!players || players.length === 0) return;

  logger.debug(`   ── ${label}`);
  const header = ['Player', 'Pos', 'NFL', 'Curr', 'Remain', 'Full', 'State', 'Clock', 'MinRem'];
  const rows = players.map(p => [
    p.name,
    p.position,
    p.nflTeam || '-',
    p.currentScore.toFixed(1),
    p.remainingProjection.toFixed(1),
    p.fullProjection.toFixed(1),
    p.gameState?.state || '-',
    p.gameState?.gameDescription || '-',
    p.gameState?.minutesRemaining != null ? String(Math.round(p.gameState.minutesRemaining)) : '-',
  ]);

  const widths = header.map((h, i) =>
    Math.min(Math.max(h.length, ...rows.map(r => String(r[i]).length)), i === 0 ? 26 : 12)
  );
  const fmt = (v: string, i: number): string => v.padEnd(widths[i], ' ');

  logger.debug('     ' + header.map(fmt).join('  '));
  logger.debug('     ' + widths.map(w => ''.padEnd(w, '─')).join('  '));

  for (const r of rows) {
    logger.debug('     ' + r.map((v, i) => fmt(String(v), i)).join('  '));
  }

  const totals = players.reduce(
    (acc, p) => {
      acc.curr += p.currentScore;
      acc.rem += p.remainingProjection;
      acc.full += p.fullProjection;
      return acc;
    },
    { curr: 0, rem: 0, full: 0 }
  );

  logger.debug(
    `     Totals → Curr: ${totals.curr.toFixed(1)} | Remain: ${totals.rem.toFixed(1)} | Full: ${totals.full.toFixed(1)}`
  );
};

/**
 * Validate, deduplicate, and save a complete snapshot to the database
 *
 * This function:
 * 1. Retrieves the last snapshot for the matchup
 * 2. Compares current data with previous snapshot
 * 3. Skips saving if data hasn't changed (deduplication)
 * 4. Saves to database if data has changed
 * 5. Logs detailed information about the snapshot
 *
 * @param snapshot - Complete snapshot data to validate and save
 * @param metrics - Optional Metrics instance for tracking outcomes
 * @returns Promise resolving to validation result indicating if data was saved
 *
 * @example
 * ```typescript
 * const metrics = new Metrics();
 * const snapshot = await captureMatchup(leagueId, week, matchupId);
 * const result = await saveSnapshotIfChanged(snapshot, metrics);
 *
 * if (result.saved) {
 *   console.log('Snapshot saved successfully');
 * } else {
 *   console.log('Snapshot skipped:', result.reason);
 * }
 * ```
 */
export const saveSnapshotIfChanged = async (
  snapshot: CompleteSnapshot,
  metrics?: Metrics
): Promise<ValidationResult> => {
  const start = Date.now();
  try {
    // 1. Get last snapshot from database
    const lastSnapshot = await getLastWinProbSample(
      snapshot.leagueId,
      snapshot.week,
      snapshot.matchupId
    );

    // 2. Check if data has changed significantly
    if (lastSnapshot) {
      const hasChanged = hasSignificantChange(lastSnapshot, snapshot);

      if (!hasChanged) {
        const duration = Date.now() - start;
        metrics?.increment('snapshot.skipped');
        metrics?.recordDuration('snapshot.validation', duration);

        logger.debug({
          event: 'snapshot_skipped',
          matchupId: snapshot.matchupId,
          week: snapshot.week,
          team1Name: snapshot.team1Name,
          team2Name: snapshot.team2Name,
          duration,
          reason: 'unchanged',
        });
        return { saved: false, reason: 'unchanged' };
      }
    }

    // 3. Data has changed or is new, save it to database
    await saveLiveWinProbSample({
      leagueId: snapshot.leagueId,
      week: snapshot.week,
      matchupId: snapshot.matchupId,
      rosterAId: snapshot.team1.rosterId,
      rosterBId: snapshot.team2.rosterId,
      gameProgress: 0, // Using simulation data
      winProbA: snapshot.team1.winProbability,
      winProbB: snapshot.team2.winProbability,
      projectedFinalA: snapshot.team1.simulatedMean, // Use simulated mean (matches screenshot)
      projectedFinalB: snapshot.team2.simulatedMean, // Use simulated mean (matches screenshot)
      currentScoreA: snapshot.team1.currentScore,
      currentScoreB: snapshot.team2.currentScore,
      spread: snapshot.spread,
      total: snapshot.total,
    });

    const duration = Date.now() - start;
    metrics?.increment('snapshot.saved');
    metrics?.recordDuration('snapshot.save', duration);

    // 4. Log success with detailed information
    logger.info({
      event: 'snapshot_saved',
      matchupId: snapshot.matchupId,
      week: snapshot.week,
      team1Name: snapshot.team1Name,
      team2Name: snapshot.team2Name,
      team1SimMean: snapshot.team1.simulatedMean,
      team2SimMean: snapshot.team2.simulatedMean,
      team1WinProb: snapshot.team1.winProbability,
      team2WinProb: snapshot.team2.winProbability,
      team1CurrentScore: snapshot.team1.currentScore,
      team2CurrentScore: snapshot.team2.currentScore,
      spread: snapshot.spread,
      total: snapshot.total,
      duration,
    });

    // 5. Enhanced per-player debugging tables
    printPlayerTable(`${snapshot.team1Name}`, snapshot.team1Players);
    printPlayerTable(`${snapshot.team2Name}`, snapshot.team2Players);

    return { saved: true, reason: 'saved' };
  } catch (error) {
    const duration = Date.now() - start;
    metrics?.increment('snapshot.error');
    metrics?.recordDuration('snapshot.save', duration);

    // Fallback logging if database fails
    logger.error({
      event: 'snapshot_save_failed',
      matchupId: snapshot.matchupId,
      week: snapshot.week,
      team1Name: snapshot.team1Name,
      team2Name: snapshot.team2Name,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      team1SimMean: snapshot.team1.simulatedMean,
      team2SimMean: snapshot.team2.simulatedMean,
      team1CurrentScore: snapshot.team1.currentScore,
      team2CurrentScore: snapshot.team2.currentScore,
      duration,
    });
    return { saved: false, reason: 'error' };
  }
};
