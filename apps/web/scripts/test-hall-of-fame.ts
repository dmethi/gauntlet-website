#!/usr/bin/env tsx

/**
 * Test script for Hall of Fame section tools.
 * Validates that all 3 tools work correctly with real data.
 */

import {
  calculateTopTeamScoreTool,
  calculateBiggestBlowoutTool,
  calculateTopPositionPerformersTool,
} from '../src/lib/reports/recap/tools/hall-of-fame';

const testHallOfFame = async (): Promise<void> => {
  console.log('🧪 Testing Hall of Fame Section\n');

  const week = 5;

  try {
    console.log('1. Testing calculate_top_team_score...');
    const topScore = await calculateTopTeamScoreTool.execute({ week });
    console.log('✅ Top Team:', topScore.teamName, '-', topScore.score, 'pts');
    console.log(
      '   Top Performers:',
      topScore.topPerformers
        .slice(0, 3)
        .map(p => `${p.name} (${p.points})`)
        .join(', '),
    );

    console.log('\n2. Testing calculate_biggest_blowout...');
    const blowout = await calculateBiggestBlowoutTool.execute({ week });
    console.log(
      '✅ Biggest Blowout:',
      blowout.winner.teamName,
      blowout.winner.score,
      '-',
      blowout.loser.teamName,
      blowout.loser.score,
    );
    console.log('   Margin:', blowout.margin, 'points');

    console.log('\n3. Testing calculate_top_position_performers...');
    const topPerformers = await calculateTopPositionPerformersTool.execute({ week });
    console.log('✅ Position Stars:');
    Object.entries(topPerformers).forEach(([pos, data]) => {
      console.log(`   ${pos}: ${data.playerName} - ${data.points} pts (${data.teamName})`);
    });

    console.log('\n✅ All Hall of Fame tools working correctly!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testHallOfFame();
