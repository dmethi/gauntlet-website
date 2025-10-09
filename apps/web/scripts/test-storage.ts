#!/usr/bin/env tsx

/**
 * Test Script for File System Storage
 *
 * Tests all storage operations:
 * - Save report with atomic writes
 * - Load report
 * - Backup creation on regeneration
 * - Metadata tracking
 * - List reports and seasons
 * - Error handling
 *
 * Usage:
 *   npx tsx scripts/test-storage.ts
 */

import chalk from 'chalk';
import type { WeeklyRecapReport } from '../src/lib/reports/recap/types';
import {
  saveReport,
  loadReport,
  loadBackup,
  reportExists,
  deleteReport,
  getWeekMetadata,
  listReports,
  listSeasons,
} from '../src/lib/reports/recap/storage';

// ============================================================================
// TEST DATA
// ============================================================================

const createMockReport = (
  week: number,
  season: number,
  status: 'success' | 'partial' | 'failed' = 'success',
): WeeklyRecapReport => ({
  metadata: {
    week,
    season,
    generatedAt: new Date().toISOString(),
    generationTime: 45000 + Math.random() * 20000,
    tokensUsed: 35000 + Math.floor(Math.random() * 15000),
    version: '1.0.0',
    status,
  },
  sections: {
    leagueOverview: {
      narrative: `# Week ${week} League Overview\n\nThis is a test report for Week ${week} of the ${season} season.`,
      stats: {
        totalGames: 12,
        totalPoints: 2847.5,
        averageScore: 118.6,
        highestScore: 165.3,
        lowestScore: 82.1,
        blowouts: 2,
        closeGames: 4,
      },
      generatedAt: new Date().toISOString(),
    },
    matchupNarratives: [
      {
        matchupId: 'test-5-1',
        narrative: '# Test Matchup\n\nTest narrative.',
        boxScore: {
          team1: {
            teamName: 'Test Team 1',
            rosterId: 1,
            leagueId: 'test',
            score: 120,
            record: '3-2',
            topPerformers: [],
          },
          team2: {
            teamName: 'Test Team 2',
            rosterId: 2,
            leagueId: 'test',
            score: 110,
            record: '2-3',
            topPerformers: [],
          },
          finalScore: { team1: 120, team2: 110 },
          winner: 'team1',
          margin: 10,
        },
        generatedAt: new Date().toISOString(),
      },
    ],
    hallOfFame: {
      narrative: '# Hall of Fame\n\nTest content.',
      highlights: {
        topTeamScore: {
          teamName: 'Test Team',
          score: 165.3,
          leagueId: 'test',
          rosterId: 1,
        },
        biggestBlowout: {
          winner: 'Winner',
          loser: 'Loser',
          margin: 42,
          matchupId: 'test-5-1',
        },
        topPerformers: {
          QB: [],
          RB: [],
          WR: [],
          TE: [],
          K: [],
          DEF: [],
        },
      },
      generatedAt: new Date().toISOString(),
    },
    hallOfShame: {
      narrative: '# Hall of Shame\n\nTest content.',
      lowlights: {
        lowestTeamScore: {
          teamName: 'Test Team',
          score: 82.1,
          leagueId: 'test',
          rosterId: 2,
        },
        biggestBusts: [],
        badBeatLosses: [],
      },
      generatedAt: new Date().toISOString(),
    },
    powerRankings: {
      narrative: '# Power Rankings\n\nTest content.',
      rankings: [],
      generatedAt: new Date().toISOString(),
    },
    standings: {
      narrative: '# Standings\n\nTest content.',
      standings: { afc: [], nfc: [] },
      playoffPicture: { clinched: [], inHunt: [], eliminated: [] },
      generatedAt: new Date().toISOString(),
    },
    upcoming: {
      narrative: '# Upcoming Matchups\n\nTest content.',
      matchups: [],
      generatedAt: new Date().toISOString(),
    },
    closing: {
      narrative: '# Closing Commentary\n\nTest content.',
      generatedAt: new Date().toISOString(),
    },
  },
});

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

const runTest = async (name: string, fn: () => Promise<void>): Promise<boolean> => {
  try {
    console.log(chalk.blue(`\n📝 Test: ${name}`));
    await fn();
    console.log(chalk.green(`✅ PASS: ${name}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ FAIL: ${name}`));
    console.error(chalk.red(`   Error: ${error instanceof Error ? error.message : String(error)}`));
    return false;
  }
};

// ============================================================================
// TEST SUITE
// ============================================================================

const main = async (): Promise<void> => {
  console.log(chalk.bold.cyan('\n🧪 File System Storage Test Suite\n'));
  console.log(chalk.dim('Testing all storage operations...\n'));

  const results: { name: string; passed: boolean }[] = [];
  const testSeason = 2025;
  const testWeek = 99; // Use week 99 to avoid conflicts

  // Test 1: Save a new report
  results.push({
    name: 'Save new report',
    passed: await runTest('Save new report', async () => {
      const report = createMockReport(testWeek, testSeason);
      const result = await saveReport(report);

      if (!result.success) {
        throw new Error(`Save failed: ${result.error}`);
      }

      console.log(chalk.dim(`   File: ${result.filePath}`));
      console.log(chalk.dim(`   Size: ${result.fileSize} bytes`));
      console.log(chalk.dim(`   Duration: ${result.duration}ms`));
    }),
  });

  // Test 2: Check if report exists
  results.push({
    name: 'Check report exists',
    passed: await runTest('Check report exists', async () => {
      const exists = await reportExists(testSeason, testWeek);
      if (!exists) {
        throw new Error('Report should exist after save');
      }
      console.log(chalk.dim(`   Report exists: ${exists}`));
    }),
  });

  // Test 3: Load the report
  results.push({
    name: 'Load report',
    passed: await runTest('Load report', async () => {
      const result = await loadReport(testSeason, testWeek);

      if (!result.success || !result.report) {
        throw new Error(`Load failed: ${result.error}`);
      }

      if (result.report.metadata.week !== testWeek) {
        throw new Error(`Week mismatch: expected ${testWeek}, got ${result.report.metadata.week}`);
      }

      if (result.report.metadata.season !== testSeason) {
        throw new Error(
          `Season mismatch: expected ${testSeason}, got ${result.report.metadata.season}`,
        );
      }

      console.log(chalk.dim(`   Week: ${result.report.metadata.week}`));
      console.log(chalk.dim(`   Season: ${result.report.metadata.season}`));
      console.log(chalk.dim(`   Status: ${result.report.metadata.status}`));
    }),
  });

  // Test 4: Regenerate report (creates backup)
  results.push({
    name: 'Regenerate report (backup creation)',
    passed: await runTest('Regenerate report (backup creation)', async () => {
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));

      const report = createMockReport(testWeek, testSeason, 'partial');
      const result = await saveReport(report);

      if (!result.success) {
        throw new Error(`Regeneration save failed: ${result.error}`);
      }

      if (!result.backupPath) {
        throw new Error('Backup should be created on regeneration');
      }

      console.log(chalk.dim(`   Backup: ${result.backupPath}`));
    }),
  });

  // Test 5: Load backup
  results.push({
    name: 'Load backup',
    passed: await runTest('Load backup', async () => {
      const result = await loadBackup(testSeason, testWeek);

      if (!result.success || !result.report) {
        throw new Error(`Load backup failed: ${result.error}`);
      }

      // Original report had status 'success', backup should too
      if (result.report.metadata.status !== 'success') {
        throw new Error(`Expected backup status 'success', got '${result.report.metadata.status}'`);
      }

      console.log(chalk.dim(`   Backup status: ${result.report.metadata.status}`));
    }),
  });

  // Test 6: Get week metadata
  results.push({
    name: 'Get week metadata',
    passed: await runTest('Get week metadata', async () => {
      const metadata = await getWeekMetadata(testSeason, testWeek);

      if (!metadata) {
        throw new Error('Metadata should exist');
      }

      if (metadata.generated.length < 2) {
        throw new Error(`Expected at least 2 generations, got ${metadata.generated.length}`);
      }

      if (metadata.lastStatus !== 'partial') {
        throw new Error(`Expected last status 'partial', got '${metadata.lastStatus}'`);
      }

      console.log(chalk.dim(`   Generations: ${metadata.generated.length}`));
      console.log(chalk.dim(`   Last status: ${metadata.lastStatus}`));
      console.log(chalk.dim(`   Last duration: ${metadata.lastDuration}ms`));
      console.log(chalk.dim(`   Last tokens: ${metadata.lastTokens}`));
    }),
  });

  // Test 7: List reports for season
  results.push({
    name: 'List reports for season',
    passed: await runTest('List reports for season', async () => {
      const reports = await listReports(testSeason);

      if (reports.length === 0) {
        throw new Error('Should have at least 1 report');
      }

      const testReport = reports.find(r => r.week === testWeek);
      if (!testReport) {
        throw new Error(`Test report (week ${testWeek}) not found in list`);
      }

      console.log(chalk.dim(`   Total reports: ${reports.length}`));
      console.log(chalk.dim(`   Test report found: Week ${testReport.week}`));
    }),
  });

  // Test 8: List all seasons
  results.push({
    name: 'List all seasons',
    passed: await runTest('List all seasons', async () => {
      const seasons = await listSeasons();

      if (seasons.length === 0) {
        throw new Error('Should have at least 1 season');
      }

      if (!seasons.includes(testSeason)) {
        throw new Error(`Test season ${testSeason} not found in list`);
      }

      console.log(chalk.dim(`   Total seasons: ${seasons.length}`));
      console.log(chalk.dim(`   Seasons: ${seasons.join(', ')}`));
    }),
  });

  // Test 9: Delete report
  results.push({
    name: 'Delete report',
    passed: await runTest('Delete report', async () => {
      const deleted = await deleteReport(testSeason, testWeek);

      if (!deleted) {
        throw new Error('Delete should return true');
      }

      const exists = await reportExists(testSeason, testWeek);
      if (exists) {
        throw new Error('Report should not exist after delete');
      }

      console.log(chalk.dim(`   Report deleted successfully`));
    }),
  });

  // Test 10: Load non-existent report
  results.push({
    name: 'Load non-existent report (error handling)',
    passed: await runTest('Load non-existent report (error handling)', async () => {
      const result = await loadReport(testSeason, testWeek);

      if (result.success) {
        throw new Error('Load should fail for non-existent report');
      }

      if (!result.error) {
        throw new Error('Error message should be present');
      }

      console.log(chalk.dim(`   Error: ${result.error}`));
    }),
  });

  // ============================================================================
  // SUMMARY
  // ============================================================================

  console.log(chalk.bold.cyan('\n📊 Test Results\n'));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? chalk.green : chalk.red;
    console.log(`${icon} ${color(result.name)}`);
  });

  console.log(chalk.bold.cyan(`\n${'='.repeat(60)}`));
  console.log(chalk.bold(`Total: ${total} tests`));
  console.log(chalk.green(`Passed: ${passed}`));
  if (failed > 0) {
    console.log(chalk.red(`Failed: ${failed}`));
  }

  const percentage = Math.round((passed / total) * 100);
  console.log(chalk.bold(`Success Rate: ${percentage}%`));

  if (failed === 0) {
    console.log(chalk.bold.green('\n🎉 All tests passed! Storage system is working correctly.\n'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n❌ Some tests failed. Please review the errors above.\n'));
    process.exit(1);
  }
};

// Run tests
main().catch(error => {
  console.error(chalk.red('\n💥 Test suite crashed:'));
  console.error(error);
  process.exit(1);
});
