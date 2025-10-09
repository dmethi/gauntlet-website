#!/usr/bin/env tsx

/**
 * Quick integration test for storage + generation
 *
 * Tests that the integration module properly combines
 * generation and storage operations.
 *
 * Usage:
 *   npx tsx scripts/test-storage-integration.ts
 */

import chalk from 'chalk';
import { generateAndSave, generateDryRun } from '../src/lib/reports/recap/integration';
import {
  loadReport,
  deleteReport,
  reportExists,
  getWeekMetadata,
} from '../src/lib/reports/recap/storage';

const TEST_WEEK = 98; // Use week 98 to avoid conflicts
const TEST_SEASON = 2025;

const main = async (): Promise<void> => {
  console.log(chalk.bold.cyan('\n🧪 Storage Integration Test\n'));

  try {
    // Test 1: Dry run (no save)
    console.log(chalk.blue('📝 Test 1: Dry run (generation only)'));
    const dryRunResult = await generateDryRun(TEST_WEEK, TEST_SEASON);

    if (!dryRunResult.success) {
      throw new Error(`Dry run failed: ${dryRunResult.error}`);
    }

    console.log(chalk.green('✅ Dry run successful'));
    console.log(chalk.dim(`   Duration: ${(dryRunResult.duration / 1000).toFixed(2)}s`));
    console.log(chalk.dim(`   Saved: ${dryRunResult.saved}`));

    // Verify no file was created
    const existsAfterDryRun = await reportExists(TEST_SEASON, TEST_WEEK);
    if (existsAfterDryRun) {
      throw new Error('File should not exist after dry run');
    }
    console.log(chalk.dim(`   ✓ No file created (as expected)`));

    // Test 2: Generate and save
    console.log(chalk.blue('\n📝 Test 2: Generate and save'));
    const saveResult = await generateAndSave({
      week: TEST_WEEK,
      season: TEST_SEASON,
      saveToFile: true,
    });

    if (!saveResult.success) {
      throw new Error(`Save failed: ${saveResult.error}`);
    }

    console.log(chalk.green('✅ Generation and save successful'));
    console.log(chalk.dim(`   File: ${saveResult.filePath}`));
    console.log(chalk.dim(`   Duration: ${(saveResult.duration / 1000).toFixed(2)}s`));

    // Test 3: Load the saved report
    console.log(chalk.blue('\n📝 Test 3: Load saved report'));
    const loadResult = await loadReport(TEST_SEASON, TEST_WEEK);

    if (!loadResult.success || !loadResult.report) {
      throw new Error(`Load failed: ${loadResult.error}`);
    }

    console.log(chalk.green('✅ Report loaded successfully'));
    console.log(chalk.dim(`   Week: ${loadResult.report.metadata?.week}`));
    console.log(chalk.dim(`   Season: ${loadResult.report.metadata?.season}`));
    console.log(chalk.dim(`   Status: ${loadResult.report.metadata?.status}`));

    // Test 4: Try to save again (should fail without force)
    console.log(chalk.blue('\n📝 Test 4: Duplicate save (should fail)'));
    const duplicateResult = await generateAndSave({
      week: TEST_WEEK,
      season: TEST_SEASON,
      saveToFile: true,
      forceRegenerate: false,
    });

    if (duplicateResult.success) {
      throw new Error('Duplicate save should have failed');
    }

    console.log(chalk.green('✅ Duplicate save prevented (as expected)'));
    console.log(chalk.dim(`   Error: ${duplicateResult.error}`));

    // Test 5: Force regeneration
    console.log(chalk.blue('\n📝 Test 5: Force regeneration (creates backup)'));
    const forceResult = await generateAndSave({
      week: TEST_WEEK,
      season: TEST_SEASON,
      saveToFile: true,
      forceRegenerate: true,
    });

    if (!forceResult.success) {
      throw new Error(`Force regeneration failed: ${forceResult.error}`);
    }

    console.log(chalk.green('✅ Force regeneration successful'));
    console.log(chalk.dim(`   Backup created: ${forceResult.backupCreated}`));

    // Test 6: Check metadata
    console.log(chalk.blue('\n📝 Test 6: Verify metadata tracking'));
    const metadata = await getWeekMetadata(TEST_SEASON, TEST_WEEK);

    if (!metadata) {
      throw new Error('Metadata should exist');
    }

    if (metadata.generated.length < 2) {
      throw new Error(`Expected at least 2 generations, got ${metadata.generated.length}`);
    }

    console.log(chalk.green('✅ Metadata tracking works'));
    console.log(chalk.dim(`   Generations: ${metadata.generated.length}`));
    console.log(chalk.dim(`   Last status: ${metadata.lastStatus}`));

    // Cleanup: Delete test report
    console.log(chalk.blue('\n📝 Cleanup: Deleting test report'));
    const deleted = await deleteReport(TEST_SEASON, TEST_WEEK);

    if (!deleted) {
      throw new Error('Cleanup failed');
    }

    console.log(chalk.green('✅ Cleanup successful'));

    // Final summary
    console.log(chalk.bold.green('\n✨ All integration tests passed!\n'));
    console.log(chalk.dim('Storage integration is working correctly.\n'));

    process.exit(0);
  } catch (error) {
    console.error(chalk.bold.red('\n❌ Integration test failed:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    console.error(chalk.dim('\nStack trace:'));
    console.error(error instanceof Error ? error.stack : 'No stack trace');

    // Cleanup on failure
    try {
      await deleteReport(TEST_SEASON, TEST_WEEK);
      console.log(chalk.dim('\nTest report cleaned up.'));
    } catch {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
};

main();
