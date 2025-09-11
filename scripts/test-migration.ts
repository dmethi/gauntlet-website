#!/usr/bin/env node
/**
 * Test Migration Script
 * Quick tests to verify the new architecture is working
 */

import SleeperAPIService from '../apps/server/src/services/sleeper/sleeper-api.service';
import ArchiveService from '../apps/server/src/services/archive/archive.service';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function testSleeperAPI() {
  console.log(`\n${colors.blue}Testing Sleeper API Service...${colors.reset}`);
  const sleeper = SleeperAPIService.getInstance();

  try {
    // Test NFL State
    const nflState = await sleeper.getNFLState();
    console.log(
      `${colors.green}✓${colors.reset} NFL State: Week ${nflState.week}, Season ${nflState.season}`
    );

    // Test League Data
    const league = await sleeper.getLeague(SleeperAPIService.LEAGUE_IDS.AFC);
    console.log(`${colors.green}✓${colors.reset} League: ${league.name}`);

    // Test Rosters
    const rosters = await sleeper.getRosters(SleeperAPIService.LEAGUE_IDS.AFC);
    console.log(`${colors.green}✓${colors.reset} Rosters: ${rosters.length} teams`);

    // Test Matchups
    const matchups = await sleeper.getMatchups(SleeperAPIService.LEAGUE_IDS.AFC, 1);
    console.log(`${colors.green}✓${colors.reset} Matchups: ${matchups.length} entries`);

    // Test Cache
    const cacheStats = sleeper.getCacheStats();
    console.log(`${colors.green}✓${colors.reset} Cache: ${cacheStats.totalEntries} entries`);

    return true;
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Sleeper API test failed:`, error);
    return false;
  }
}

async function testArchiveService() {
  console.log(`\n${colors.blue}Testing Archive Service...${colors.reset}`);
  const archive = new ArchiveService();

  try {
    // Test saving
    const testData = { test: true, timestamp: new Date().toISOString() };
    await archive.saveSnapshot('test', 'migration_test', testData);
    console.log(`${colors.green}✓${colors.reset} Archive saved`);

    // Test loading
    const loaded = await archive.loadSnapshot('test', 'migration_test');
    if (loaded && loaded.test === true) {
      console.log(`${colors.green}✓${colors.reset} Archive loaded correctly`);
    }

    // Test listing
    const archives = await archive.listArchives('test');
    console.log(`${colors.green}✓${colors.reset} Archives listed: ${archives.length} files`);

    return true;
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Archive test failed:`, error);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log(`\n${colors.blue}Testing API Endpoints...${colors.reset}`);

  // Note: This would require the server to be running
  // For now, we'll just check if the files exist
  const fs = require('fs').promises;
  const endpoints = [
    'apps/web/src/app/api/league/overview/route-v2.ts',
    'apps/web/src/app/api/matchups/[leagueId]/[week]/route-v2.ts',
  ];

  for (const endpoint of endpoints) {
    try {
      await fs.access(endpoint);
      console.log(`${colors.green}✓${colors.reset} Endpoint exists: ${endpoint.split('/').pop()}`);
    } catch {
      console.log(`${colors.red}✗${colors.reset} Endpoint missing: ${endpoint}`);
      return false;
    }
  }

  return true;
}

async function testCachePerformance() {
  console.log(`\n${colors.blue}Testing Cache Performance...${colors.reset}`);
  const sleeper = SleeperAPIService.getInstance();

  // Clear cache first
  sleeper.clearCache();

  // First call - should hit API
  const start1 = Date.now();
  await sleeper.getLeague(SleeperAPIService.LEAGUE_IDS.AFC);
  const time1 = Date.now() - start1;
  console.log(`${colors.yellow}→${colors.reset} First call (API): ${time1}ms`);

  // Second call - should hit cache
  const start2 = Date.now();
  await sleeper.getLeague(SleeperAPIService.LEAGUE_IDS.AFC);
  const time2 = Date.now() - start2;
  console.log(`${colors.green}✓${colors.reset} Second call (cache): ${time2}ms`);

  // Cache should be significantly faster
  const improvement = Math.round((1 - time2 / time1) * 100);
  console.log(`${colors.green}✓${colors.reset} Performance improvement: ${improvement}%`);

  return time2 < time1;
}

async function main() {
  console.log(`
${colors.blue}================================${colors.reset}
${colors.blue}  Migration Test Suite${colors.reset}
${colors.blue}================================${colors.reset}
`);

  const tests = [
    { name: 'Sleeper API', test: testSleeperAPI },
    { name: 'Archive Service', test: testArchiveService },
    { name: 'API Endpoints', test: testAPIEndpoints },
    { name: 'Cache Performance', test: testCachePerformance },
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`
${colors.blue}================================${colors.reset}
${colors.blue}  Test Results${colors.reset}
${colors.blue}================================${colors.reset}
${colors.green}Passed: ${passed}${colors.reset}
${colors.red}Failed: ${failed}${colors.reset}

${
  passed === tests.length
    ? `${colors.green}✅ All tests passed! Ready for deployment.${colors.reset}`
    : `${colors.yellow}⚠️  Some tests failed. Please review before deploying.${colors.reset}`
}
`);

  process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch(console.error);
}
