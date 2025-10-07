#!/usr/bin/env node
/**
 * Weekly Variance Model Update Job
 *
 * Fetches latest week's stats and projections from Sleeper API, calculates
 * projection errors, updates variance models with progressive seasonal weighting,
 * validates changes, and updates variance-data.json.
 *
 * Run after MNF each week (Tuesday 3am ET recommended).
 */

import { createMetrics, logger } from '@/lib';
import type { VarianceData } from '@gauntlet/types';
import {
  capVarianceChanges,
  getPlayerMetadata,
  updatePlayerVariance,
  updatePositionVariance,
  updateProjectionErrors,
  validateVarianceChanges,
} from '@gauntlet/sim-engine/data';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const metrics = createMetrics();

interface SleeperStats {
  pts_half_ppr: number;
  [key: string]: number | string | null | undefined;
}

/**
 * Fetch week's stats from Sleeper API with batching.
 *
 * @param season - NFL season year
 * @param week - NFL week number
 *
 * @returns Object with stats and projections from Sleeper API
 */
const fetchWeeklyStats = async (
  season: number,
  week: number
): Promise<{ stats: Record<string, SleeperStats>; projections: Record<string, SleeperStats> }> => {
  const startTime = Date.now();

  const [statsRes, projectionsRes] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`),
    fetch(`https://api.sleeper.app/v1/projections/nfl/${season}/${week}`),
  ]);

  if (!statsRes.ok || !projectionsRes.ok) {
    throw new Error('Failed to fetch weekly data from Sleeper API');
  }

  const stats = (await statsRes.json()) as Record<string, SleeperStats>;
  const projections = (await projectionsRes.json()) as Record<string, SleeperStats>;

  metrics.recordDuration('sleeper_api.fetch_weekly_data', Date.now() - startTime);
  metrics.increment('sleeper_api.players_fetched', Object.keys(stats).length);

  return { stats, projections };
};

/**
 * Main variance update job.
 *
 * Run after MNF each week (Tuesday 3am ET recommended).
 */
const updateVarianceModels = async (): Promise<void> => {
  const jobStart = Date.now();

  logger.info({ event: 'variance_update_job_started' }, 'Starting weekly variance model update');

  try {
    // 1. Get current season and week (TODO: Get from Sleeper NFL state API)
    const currentSeason = new Date().getFullYear();
    const currentWeek = 5; // TODO: Get dynamically from Sleeper NFL state API

    logger.info({ season: currentSeason, week: currentWeek }, 'Fetching data for week');

    // 2. Load existing variance data
    const varianceDataPath = path.resolve(
      __dirname,
      '../../../../sim-engine/src/data/variance-data.json'
    );
    const varianceDataContent = await fs.readFile(varianceDataPath, 'utf-8');
    const varianceData = JSON.parse(varianceDataContent) as VarianceData;

    // 3. Fetch player metadata (cached yearly)
    const playerMetadata = await getPlayerMetadata();
    metrics.increment('player_metadata.loaded', Object.keys(playerMetadata).length);

    // 4. Fetch week's stats and projections
    const { stats, projections } = await fetchWeeklyStats(currentSeason, currentWeek);

    // 5. Update projection errors
    const {
      updated: newProjectionErrors,
      newCount,
      outlierCount,
    } = updateProjectionErrors(varianceData.projectionErrors || [], {
      season: currentSeason,
      week: currentWeek,
      stats,
      projections,
    });

    logger.info(
      {
        event: 'projection_errors_updated',
        newErrorCount: newCount,
        outlierCount,
        totalErrors: newProjectionErrors.length,
      },
      `Updated projection errors: ${newCount} new, ${outlierCount} outliers removed`
    );

    metrics.increment('variance_update.new_errors', newCount);
    metrics.increment('variance_update.outliers_removed', outlierCount);

    // 6. Update position variance with progressive weighting
    const newPositionVariance = updatePositionVariance(newProjectionErrors, playerMetadata);

    logger.info(
      { positionCount: newPositionVariance.length },
      `Updated variance for ${newPositionVariance.length} positions`
    );

    // 7. Validate variance changes
    const validation = validateVarianceChanges(
      varianceData.positionVariance || [],
      newPositionVariance
    );

    if (!validation.valid) {
      logger.warn(
        { warningCount: validation.warnings.length, warnings: validation.warnings },
        'Variance validation warnings detected'
      );
    }

    // 8. Cap variance changes to 20%
    const cappedPositionVariance = capVarianceChanges(
      varianceData.positionVariance || [],
      newPositionVariance
    );

    // 9. Update player variance
    const newPlayerVariance = updatePlayerVariance(newProjectionErrors);

    logger.info(
      { playerCount: newPlayerVariance.length },
      `Updated variance for ${newPlayerVariance.length} players (≥4 games)`
    );

    // 10. Build updated variance data
    const updatedVarianceData = {
      version: '1.0.0',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      season: currentSeason,
      weeksCovered: [currentWeek],
      dataQuality: {
        totalPlayers: newPlayerVariance.length,
        playersWithVariance: newPlayerVariance.filter(
          (p: { sampleSize: number }) => p.sampleSize >= 4
        ).length,
        outlierRemovalCount: outlierCount,
        positionsWithVariance: Array.from(
          new Set(cappedPositionVariance.map((p: { position: string }) => p.position))
        ),
      },
      positionVariance: cappedPositionVariance,
      playerVariance: newPlayerVariance,
      projectionErrors: newProjectionErrors,
    };

    // 11. Write updated data to variance-data.json
    await fs.writeFile(varianceDataPath, JSON.stringify(updatedVarianceData, null, 2));

    logger.info(
      {
        event: 'variance_data_updated',
        path: varianceDataPath,
        fileSize: JSON.stringify(updatedVarianceData).length,
      },
      'Variance data file updated successfully'
    );

    // 12. Log metrics summary
    const metricsSummary = metrics.getSummary();
    logger.info(
      { event: 'variance_update_job_completed', metrics: metricsSummary },
      'Job completed successfully'
    );

    console.log('\n✅ Variance models updated successfully!');
    console.log(`   - ${newCount} new projection errors added`);
    console.log(`   - ${outlierCount} outliers removed`);
    console.log(`   - ${cappedPositionVariance.length} positions updated`);
    console.log(`   - ${newPlayerVariance.length} players updated`);
    console.log(`   - Validation warnings: ${validation.warnings.length}`);
    console.log(`\n📊 Next steps:`);
    console.log(`   1. Review changes: git diff apps/sim-engine/src/data/variance-data.json`);
    console.log(
      `   2. Commit changes: git add . && git commit -m "chore: update variance models (week ${currentWeek})"`
    );

    metrics.recordDuration('variance_update_job.duration', Date.now() - jobStart);
  } catch (error) {
    logger.error(
      {
        event: 'variance_update_job_failed',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Variance update job failed'
    );

    throw error;
  }
};

// Run job
updateVarianceModels()
  .then(() => {
    // Explicitly exit to prevent hanging (logger/connections may keep event loop alive)
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
