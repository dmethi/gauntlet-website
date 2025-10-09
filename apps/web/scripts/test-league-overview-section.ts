/**
 * Test script for League Overview section tools.
 * Validates data fetching and formatting for the opening recap section.
 */

import {
  fetchLeagueDataTool,
  calculateWeekSummaryStatsTool,
} from '../src/lib/reports/recap/tools/league-overview';

const testLeagueOverview = async (): Promise<void> => {
  console.log('🧪 Testing League Overview Section\n');
  console.log('='.repeat(60));

  try {
    // Test with Week 5 data
    const week = 5;

    console.log('\n📊 Step 1: Testing fetch_league_data tool...');
    console.log('-'.repeat(60));
    const leagueData = await fetchLeagueDataTool.execute({ week });
    console.log('✅ League Data:');
    console.log(JSON.stringify(leagueData, null, 2));

    console.log('\n📊 Step 2: Testing calculate_week_summary_stats tool...');
    console.log('-'.repeat(60));
    const summaryStats = await calculateWeekSummaryStatsTool.execute({ week });
    console.log('✅ Summary Stats:');
    console.log(JSON.stringify(summaryStats, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ All League Overview tools working correctly!');
    console.log('='.repeat(60));

    console.log('\n📝 Sample Narrative Context:');
    console.log('-'.repeat(60));
    console.log(
      `Week ${week} is in the books with ${summaryStats.totalPoints.toLocaleString()} total points ` +
        `scored across ${summaryStats.totalMatchups} matchups in The Gauntlet.`,
    );
    console.log(
      `\nAverage score: ${summaryStats.averageScore} points ` +
        `(High: ${summaryStats.highestScore}, Low: ${summaryStats.lowestScore})`,
    );
    console.log(
      `\nGame Distribution: ${summaryStats.closeGames} close games (≤10 pts), ` +
        `${summaryStats.blowouts} blowouts (≥30 pts)`,
    );
    const competitiveRatio = Math.round(
      (summaryStats.closeGames / summaryStats.totalMatchups) * 100,
    );
    console.log(
      `Competitive ratio: ${competitiveRatio}% of games were decided by 10 points or less`,
    );

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Test completed successfully!\n');
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Test failed:');
    console.error('='.repeat(60));
    console.error(error);
    console.error('\n');
    process.exit(1);
  }
};

// Run the test
testLeagueOverview();
