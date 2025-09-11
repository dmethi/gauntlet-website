/**
 * Audit script to debug Hall of Fame data
 * Run with: npx tsx src/scripts/audit-hall-of-fame.ts
 */

import { hallOfFameDataService } from '../lib/hall-of-fame-data-service';
import {
  calculateRollingWindows,
  calculateStreaks,
  calculateSeasonalData,
} from '../lib/hall-of-fame-aggregations';
import { calculateHallOfFameRecords } from '../lib/hall-of-fame-calculations';
import { getAllCategories } from '../lib/hall-of-fame-expanded-categories';

async function auditHallOfFameData() {
  console.log('🔍 Starting Hall of Fame Data Audit...\n');

  try {
    // Step 1: Fetch all matchups
    console.log('📊 Step 1: Fetching all historical matchups...');
    const allMatchups = await hallOfFameDataService.getAllHistoricalMatchups(true);
    console.log(`✅ Found ${allMatchups.length} total matchups`);

    // Analyze matchup data quality
    const matchupsWithTeamNames = allMatchups.filter(
      m => m.teamName && m.teamName !== `Team ${m.rosterId}`
    );
    const matchupsWithPlayerData = allMatchups.filter(m => m.playerData && m.playerData.size > 0);
    const matchupsWithWinProb = allMatchups.filter(
      m => m.winProbSamples && m.winProbSamples.length > 0
    );
    const matchupsWithPlayerStats = allMatchups.filter(
      m => m.playerStats && m.playerStats.size > 0
    );

    console.log(
      `  - With proper team names: ${matchupsWithTeamNames.length} (${((matchupsWithTeamNames.length / allMatchups.length) * 100).toFixed(1)}%)`
    );
    console.log(
      `  - With player data: ${matchupsWithPlayerData.length} (${((matchupsWithPlayerData.length / allMatchups.length) * 100).toFixed(1)}%)`
    );
    console.log(
      `  - With win probability: ${matchupsWithWinProb.length} (${((matchupsWithWinProb.length / allMatchups.length) * 100).toFixed(1)}%)`
    );
    console.log(
      `  - With player stats: ${matchupsWithPlayerStats.length} (${((matchupsWithPlayerStats.length / allMatchups.length) * 100).toFixed(1)}%)`
    );

    // Sample matchup to see structure
    if (allMatchups.length > 0) {
      console.log('\n📋 Sample matchup structure:');
      const sample = allMatchups[0];
      console.log(`  - rosterId: ${sample.rosterId}`);
      console.log(`  - teamName: ${sample.teamName}`);
      console.log(`  - leagueId: ${sample.leagueId}`);
      console.log(`  - leagueName: ${sample.leagueName}`);
      console.log(`  - week: ${sample.week}`);
      console.log(`  - season: ${sample.season}`);
      console.log(`  - points: ${sample.points}`);
      console.log(`  - starters: ${sample.starters?.length || 0} players`);
      console.log(`  - starters_points: ${sample.starters_points?.length || 0} scores`);
    }

    // Step 2: Test category calculations
    console.log('\n📊 Step 2: Testing category calculations...');
    const allCategories = getAllCategories();
    console.log(`✅ Found ${allCategories.length} total categories defined`);

    const weeklyRecords = calculateHallOfFameRecords(allMatchups, allCategories);
    console.log(`✅ Calculated records for ${weeklyRecords.size} categories`);

    // Analyze which categories have data
    const categoriesWithData: string[] = [];
    const categoriesEmpty: string[] = [];

    weeklyRecords.forEach((records, categoryId) => {
      if (records && records.length > 0) {
        categoriesWithData.push(categoryId);
        console.log(`  ✅ ${categoryId}: ${records.length} records`);
      } else {
        categoriesEmpty.push(categoryId);
      }
    });

    console.log(`\n📈 Category Summary:`);
    console.log(`  - Categories with data: ${categoriesWithData.length}`);
    console.log(`  - Empty categories: ${categoriesEmpty.length}`);

    if (categoriesEmpty.length > 0) {
      console.log('\n❌ Empty categories:');
      categoriesEmpty.forEach(id => console.log(`  - ${id}`));
    }

    // Step 3: Test rolling windows
    console.log('\n📊 Step 3: Testing rolling windows...');
    const threeWeekWindows = calculateRollingWindows(allMatchups, 3);
    const fiveWeekWindows = calculateRollingWindows(allMatchups, 5);
    console.log(`✅ 3-week windows: ${threeWeekWindows.length}`);
    console.log(`✅ 5-week windows: ${fiveWeekWindows.length}`);

    if (threeWeekWindows.length > 0) {
      const sample = threeWeekWindows[0];
      console.log('\n📋 Sample 3-week window:');
      console.log(`  - Team: ${sample.teamName} (${sample.rosterId})`);
      console.log(`  - Weeks: ${sample.startWeek}-${sample.endWeek}`);
      console.log(`  - Total points: ${sample.totalPoints}`);
      console.log(`  - Average: ${sample.averagePoints}`);
    }

    // Step 4: Test streaks
    console.log('\n📊 Step 4: Testing streaks...');
    const allStreaks = calculateStreaks(allMatchups);
    const winStreaks = allStreaks.filter(s => s.type === 'win');
    const lossStreaks = allStreaks.filter(s => s.type === 'loss');
    const hotStreaks = allStreaks.filter(s => s.type === 'above_median');
    const coldStreaks = allStreaks.filter(s => s.type === 'below_median');

    console.log(`✅ Win streaks: ${winStreaks.length}`);
    console.log(`✅ Loss streaks: ${lossStreaks.length}`);
    console.log(`✅ Hot streaks: ${hotStreaks.length}`);
    console.log(`✅ Cold streaks: ${coldStreaks.length}`);

    // Step 5: Test seasonal data
    console.log('\n📊 Step 5: Testing seasonal aggregations...');
    const seasonalData = calculateSeasonalData(allMatchups);
    console.log(`✅ Seasonal records: ${seasonalData.length} teams`);

    if (seasonalData.length > 0) {
      const sample = seasonalData[0];
      console.log('\n📋 Sample seasonal data:');
      console.log(`  - Team: ${sample.teamName} (${sample.rosterId})`);
      console.log(`  - Season: ${sample.season}`);
      console.log(`  - Wins: ${sample.wins}`);
      console.log(`  - Total points: ${sample.totalPoints}`);
      console.log(`  - Expected wins: ${sample.expectedWins}`);
      console.log(`  - Luck delta: ${sample.luckDelta}`);
    }

    // Step 6: Debug specific missing categories
    console.log('\n🔍 Step 6: Debugging specific categories...');

    // Check positional categories
    const positionalCategories = allCategories.filter(
      c =>
        c.id.includes('_qb_') ||
        c.id.includes('_rb_') ||
        c.id.includes('_wr_') ||
        c.id.includes('_te_') ||
        c.id.includes('_def_')
    );

    console.log(`\n📊 Positional categories (${positionalCategories.length} total):`);
    positionalCategories.forEach(cat => {
      const records = weeklyRecords.get(cat.id);
      if (!records || records.length === 0) {
        // Try to calculate manually to debug
        const testResult = allMatchups
          .map(m => ({
            value: cat.calculateValue(m),
            matchup: m,
          }))
          .filter(r => r.value !== null && r.value !== undefined);

        console.log(`  ❌ ${cat.id}: No records (${testResult.length} non-null values found)`);
        if (testResult.length > 0) {
          console.log(`     Sample value: ${testResult[0].value}`);
        }
      } else {
        console.log(`  ✅ ${cat.id}: ${records.length} records`);
      }
    });

    // Check player stats categories
    const playerStatsCategories = allCategories.filter(
      c => c.id.includes('passing') || c.id.includes('rushing') || c.id.includes('receiving')
    );

    console.log(`\n📊 Player stats categories (${playerStatsCategories.length} total):`);
    playerStatsCategories.forEach(cat => {
      const records = weeklyRecords.get(cat.id);
      console.log(`  ${records?.length ? '✅' : '❌'} ${cat.id}: ${records?.length || 0} records`);
    });

    // Summary
    console.log('\n📊 AUDIT SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total matchups: ${allMatchups.length}`);
    console.log(`Total categories: ${allCategories.length}`);
    console.log(`Categories with data: ${categoriesWithData.length}/${allCategories.length}`);
    console.log(`Rolling windows: ${threeWeekWindows.length + fiveWeekWindows.length}`);
    console.log(`Streaks: ${allStreaks.length}`);
    console.log(`Seasonal records: ${seasonalData.length}`);

    // Data quality issues
    console.log('\n⚠️  DATA QUALITY ISSUES:');
    if (matchupsWithTeamNames.length === 0) {
      console.log('  ❌ No matchups have proper team names');
    }
    if (matchupsWithPlayerData.length === 0) {
      console.log('  ❌ No matchups have player data');
    }
    if (matchupsWithPlayerStats.length === 0) {
      console.log('  ❌ No matchups have player stats');
    }
    if (matchupsWithWinProb.length === 0) {
      console.log('  ❌ No matchups have win probability data');
    }

    console.log('\n✅ Audit complete!');
  } catch (error) {
    console.error('❌ Error during audit:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run the audit
auditHallOfFameData()
  .then(() => {
    console.log('\nAudit finished. Exiting...');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
