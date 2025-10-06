/**
 * Variance model validation
 * Validates variance changes to prevent dramatic shifts from single week
 */

import type { PositionVarianceRecord } from '@gauntlet/types';
import { logger } from '../lib/logger';

const MAX_WEEKLY_VARIANCE_CHANGE = 0.2; // 20% threshold

/**
 * Validate that variance changes are reasonable (not > 20% shift).
 *
 * Compares old and new position variance records and logs warnings for
 * any positions with >20% standard deviation change. Does not block updates,
 * just provides visibility.
 *
 * @param oldPositionVariance - Previous position variance records
 * @param newPositionVariance - Updated position variance records
 *
 * @returns Object with:
 *   - valid: true if no warnings (all changes <20%), false otherwise
 *   - warnings: Array of warning messages for dramatic changes
 *
 * @example
 * const validation = validateVarianceChanges(oldVariance, newVariance);
 * if (!validation.valid) {
 *   console.warn(`${validation.warnings.length} positions changed >20%:`);
 *   validation.warnings.forEach(w => console.warn(`  - ${w}`));
 * }
 */
export const validateVarianceChanges = (
  oldPositionVariance: PositionVarianceRecord[],
  newPositionVariance: PositionVarianceRecord[]
): { valid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  const oldMap = new Map(oldPositionVariance.map(r => [r.position, r]));
  const newMap = new Map(newPositionVariance.map(r => [r.position, r]));

  for (const [position, newRecord] of newMap) {
    const oldRecord = oldMap.get(position);
    if (!oldRecord) continue;

    const oldStdDev = oldRecord.stdDev;
    const newStdDev = newRecord.stdDev;
    const percentChange = Math.abs(newStdDev - oldStdDev) / oldStdDev;

    if (percentChange > MAX_WEEKLY_VARIANCE_CHANGE) {
      const warning = `${position} variance changed by ${(percentChange * 100).toFixed(1)}% (${oldStdDev.toFixed(3)} → ${newStdDev.toFixed(3)})`;
      warnings.push(warning);

      logger.warn(
        {
          event: 'variance_validation_warning',
          position,
          oldStdDev,
          newStdDev,
          percentChange: percentChange * 100,
          threshold: MAX_WEEKLY_VARIANCE_CHANGE * 100,
        },
        warning
      );
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
};

/**
 * Cap variance changes to maximum 20% per week.
 *
 * Prevents single week from having outsized impact on variance models.
 * If a position's standard deviation changed by more than 20%, caps it
 * at exactly 20% change (up or down).
 *
 * @param oldPositionVariance - Previous position variance records
 * @param newPositionVariance - Updated position variance records (may have >20% changes)
 *
 * @returns Capped position variance records (no change >20%)
 *
 * @example
 * const capped = capVarianceChanges(oldVariance, newVariance);
 * // If QB changed from 0.8 → 1.2 (50% increase), caps at 0.96 (20% increase)
 */
export const capVarianceChanges = (
  oldPositionVariance: PositionVarianceRecord[],
  newPositionVariance: PositionVarianceRecord[]
): PositionVarianceRecord[] => {
  const oldMap = new Map(oldPositionVariance.map(r => [r.position, r]));

  return newPositionVariance.map(newRecord => {
    const oldRecord = oldMap.get(newRecord.position);
    if (!oldRecord) return newRecord;

    const oldStdDev = oldRecord.stdDev;
    const newStdDev = newRecord.stdDev;
    const percentChange = (newStdDev - oldStdDev) / oldStdDev;

    // Cap at ±20%
    if (Math.abs(percentChange) > MAX_WEEKLY_VARIANCE_CHANGE) {
      const cappedStdDev =
        percentChange > 0
          ? oldStdDev * (1 + MAX_WEEKLY_VARIANCE_CHANGE)
          : oldStdDev * (1 - MAX_WEEKLY_VARIANCE_CHANGE);

      logger.info(
        {
          event: 'variance_change_capped',
          position: newRecord.position,
          oldStdDev,
          requestedStdDev: newStdDev,
          cappedStdDev,
        },
        `Capped ${newRecord.position} variance change to 20%`
      );

      return {
        ...newRecord,
        stdDev: cappedStdDev,
      };
    }

    return newRecord;
  });
};
