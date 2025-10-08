/**
 * Test Script: Hall of Shame Tools
 *
 * Validates that all Hall of Shame tools work correctly:
 * - calculate_lowest_team_score
 * - calculate_biggest_busts
 * - calculate_bad_beat_losses
 *
 * Usage: npx tsx apps/web/scripts/test-hall-of-shame.ts
 */

import {
  calculateLowestTeamScoreTool,
  calculateBiggestBustsTool,
  calculateBadBeatLossesTool,
} from '../src/lib/reports/recap/tools/hall-of-shame';

const testHallOfShame = async (): Promise<void> => {
  console.log('🧪 Testing Hall of Shame Section\n');
  console.log('=====================================\n');

  const week = 5;

  try {
    // Test 1: Lowest Team Score
    console.log('1️⃣  Testing calculate_lowest_team_score...');
    console.log('   Fetching lowest scoring team...');
    const lowestScore = await calculateLowestTeamScoreTool.execute({ week });
    console.log('   ✅ Lowest Team:');
    console.log(`      Team: ${lowestScore.teamName} (${lowestScore.ownerName})`);
    console.log(`      League: ${lowestScore.league}`);
    console.log(`      Score: ${lowestScore.score} pts`);
    console.log('      Worst Performers:');
    lowestScore.worstPerformers.slice(0, 3).forEach(p => {
      console.log(`        - ${p.name} (${p.position}): ${p.points} pts`);
    });

    // Test 2: Biggest Busts
    console.log('\n2️⃣  Testing calculate_biggest_busts...');
    console.log('   Finding players who underperformed projections...');
    const busts = await calculateBiggestBustsTool.execute({ week });
    console.log(`   ✅ Found ${busts.length} Biggest Busts:`);
    busts.forEach((bust, idx) => {
      console.log(`   ${idx + 1}. ${bust.playerName} (${bust.position})`);
      console.log(`      Team: ${bust.teamName} (${bust.league})`);
      console.log(
        `      Performance: ${bust.projected} proj → ${bust.actual} actual (${bust.difference})`,
      );
    });

    if (busts.length === 0) {
      console.log(
        '   ℹ️  Note: No significant busts found (may indicate need for real projections)',
      );
    }

    // Test 3: Bad Beat Losses
    console.log('\n3️⃣  Testing calculate_bad_beat_losses...');
    console.log('   Finding teams that scored well but lost...');
    const badBeats = await calculateBadBeatLossesTool.execute({ week });
    console.log(`   ✅ League Average: ${badBeats.avgScore} pts`);
    console.log(`   ✅ Bad Beat Losses: ${badBeats.badBeats.length}`);
    badBeats.badBeats.forEach((beat, idx) => {
      console.log(`   ${idx + 1}. ${beat.teamName} (${beat.ownerName})`);
      console.log(`      League: ${beat.league}`);
      console.log(
        `      Score: ${beat.score} pts (${beat.aboveAvgBy > 0 ? '+' : ''}${beat.aboveAvgBy} above avg)`,
      );
      console.log(`      Lost to: ${beat.opponentScore} pts (margin: ${beat.margin})`);
    });

    if (badBeats.badBeats.length === 0) {
      console.log('   ℹ️  Note: No bad beats found - all losses were below average scoring');
    }

    // Summary
    console.log('\n=====================================');
    console.log('✅ All Hall of Shame tools working correctly!\n');
    console.log('📊 Summary:');
    console.log(`   - Lowest Score: ${lowestScore.score} pts (${lowestScore.teamName})`);
    console.log(`   - Biggest Busts: ${busts.length} players`);
    console.log(`   - Bad Beats: ${badBeats.badBeats.length} teams`);
    console.log(`   - League Average: ${badBeats.avgScore} pts`);
    console.log('');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

// Run the test
testHallOfShame();
