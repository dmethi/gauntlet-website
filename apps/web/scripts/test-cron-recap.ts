#!/usr/bin/env tsx

/**
 * Test script for the recap report cron job
 *
 * This script simulates the Vercel Cron trigger by calling the runner directly.
 * Useful for local testing and debugging before deploying to production.
 *
 * Usage:
 * ```bash
 * npm run test:cron-recap
 * ```
 */

import { runRecapGeneration } from '../src/app/api/cron/recap-report/runner';

const main = async (): Promise<void> => {
  console.log('🧪 Testing Weekly Recap Cron Job\n');
  console.log('='.repeat(80));

  const startTime = Date.now();

  try {
    const result = await runRecapGeneration();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test completed successfully\n');

    console.log('📊 Results:');
    console.log(`  Week: ${result.week}`);
    console.log(`  Season: ${result.season}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Saved: ${result.saved}`);
    console.log(`  Duration: ${duration}s`);

    if (result.filePath) {
      console.log(`  File Path: ${result.filePath}`);
    }

    if (result.backupCreated) {
      console.log(`  Backup Created: Yes`);
    }

    if (result.errors && result.errors.length > 0) {
      console.log(`\n⚠️  Errors (${result.errors.length}):`);
      result.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    console.log('\n' + '='.repeat(80));

    if (result.status === 'success') {
      console.log('\n✨ Cron job would succeed in production!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Cron job completed with errors\n');
      process.exit(1);
    }
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('❌ Test failed\n');
    console.error('Error:', error);
    console.log(`\nDuration: ${duration}s`);
    console.log('='.repeat(80));

    process.exit(1);
  }
};

main();
