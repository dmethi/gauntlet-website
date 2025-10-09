/**
 * Test script for League Overview Section
 * Tests both the tools and the full node with Gemini integration.
 */

import {
  fetchLeagueDataTool,
  calculateWeekSummaryStatsTool,
} from '../src/lib/reports/recap/tools/league-overview';
import { leagueOverviewNode } from '../src/lib/reports/recap/nodes/league-overview-node';
import type { RecapReportState } from '../src/lib/reports/recap/state';

const testLeagueOverview = async (): Promise<void> => {
  console.log('🧪 Testing League Overview Section for Week 5\n');
  console.log('='.repeat(60));

  try {
    const week = 5;

    // ========================================
    // PART 1: Test Tools Independently
    // ========================================
    console.log('\n📦 PART 1: Testing Tools Independently');
    console.log('='.repeat(60));

    console.log('\n1️⃣  Testing fetch_league_data tool...');
    const leagueData = await fetchLeagueDataTool.execute({ week });
    console.log('✅ League Data:');
    console.log(JSON.stringify(leagueData, null, 2));

    console.log('\n2️⃣  Testing calculate_week_summary_stats tool...');
    const summaryStats = await calculateWeekSummaryStatsTool.execute({ week });
    console.log('✅ Summary Stats:');
    console.log(JSON.stringify(summaryStats, null, 2));

    // ========================================
    // PART 2: Test Full Node with Gemini
    // ========================================
    console.log('\n\n📝 PART 2: Testing Full Node with Gemini');
    console.log('='.repeat(60));

    const initialState: RecapReportState = {
      week,
      season: 2025,
      generatedAt: new Date().toISOString(),
      tokensUsed: 0,
      errors: [],
    };

    console.log('\n🤖 Invoking Gemini to generate league overview narrative...');
    const result = await leagueOverviewNode(initialState);

    console.log('\n✅ Node execution complete!');
    console.log('='.repeat(60));

    if (result.leagueOverview) {
      console.log('\n📄 Generated Narrative:');
      console.log('─'.repeat(60));
      console.log(result.leagueOverview);
      console.log('─'.repeat(60));

      // Analyze the output
      const wordCount = result.leagueOverview.split(/\s+/).length;
      console.log(`\n📊 Analysis:`);
      console.log(`   • Word count: ${wordCount} words`);
      console.log(`   • Target range: 100-150 words`);
      console.log(
        `   • Status: ${wordCount >= 100 && wordCount <= 150 ? '✅ Within range' : '⚠️  Outside target range'}`,
      );
    }

    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.forEach(err => console.log(`   • ${err}`));
    }

    // ========================================
    // PART 3: Data Validation
    // ========================================
    console.log('\n\n✔️  PART 3: Validation Summary');
    console.log('='.repeat(60));

    const checks = [
      {
        name: 'League data fetched',
        passed: leagueData.totalTeams === 24,
        details: `${leagueData.totalTeams} teams (expected 24)`,
      },
      {
        name: 'Summary stats calculated',
        passed: summaryStats.totalMatchups === 12,
        details: `${summaryStats.totalMatchups} matchups (expected 12)`,
      },
      {
        name: 'Average score reasonable',
        passed: summaryStats.averageScore > 50 && summaryStats.averageScore < 200,
        details: `${summaryStats.averageScore} pts/game`,
      },
      {
        name: 'Node executed successfully',
        passed: !!result.leagueOverview,
        details: result.leagueOverview ? 'Narrative generated' : 'No narrative',
      },
      {
        name: 'No errors reported',
        passed: !result.errors || result.errors.length === 0,
        details: result.errors?.length ? `${result.errors.length} errors` : 'Clean execution',
      },
    ];

    checks.forEach(check => {
      const icon = check.passed ? '✅' : '❌';
      console.log(`${icon} ${check.name}: ${check.details}`);
    });

    const allPassed = checks.every(c => c.passed);

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! League Overview section is working correctly.');
    } else {
      console.log('⚠️  SOME TESTS FAILED. Review the output above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('\nStack trace:', (error as Error).stack);
    process.exit(1);
  }
};

// Run the test
testLeagueOverview();
