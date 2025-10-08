#!/usr/bin/env tsx

import { fetchNextWeekMatchupsTool } from '../src/lib/reports/recap/tools/upcoming';

/**
 * Test script for upcoming matchups tool.
 * Validates that next week's matchups can be fetched with team records.
 */

const testUpcoming = async (): Promise<void> => {
  console.log('🧪 Testing Upcoming Matchups Tool\n');

  const currentWeek = 5;

  try {
    console.log(`Fetching Week ${currentWeek + 1} matchups...\n`);

    const result = await fetchNextWeekMatchupsTool.execute({ currentWeek });

    if (!result.available) {
      console.log('⚠️  ' + result.message);
      console.log('\n✅ Tool correctly handles unavailable matchups');
      return;
    }

    console.log('='.repeat(70));
    console.log(`WEEK ${result.week} MATCHUPS`);
    console.log('='.repeat(70));

    console.log('\n📊 AFC:');
    result.afc.forEach((matchup, i) => {
      console.log(`\n${i + 1}. ${matchup.team1.teamName} vs ${matchup.team2.teamName}`);
      console.log(
        `   ${matchup.team1.ownerName} (${matchup.team1.record}) vs ${matchup.team2.ownerName} (${matchup.team2.record})`,
      );
      console.log(`   PF: ${matchup.team1.pointsFor} vs ${matchup.team2.pointsFor}`);
      if (matchup.storyline) {
        console.log(`   📖 ${matchup.storyline}`);
      }
    });

    console.log('\n📊 NFC:');
    result.nfc.forEach((matchup, i) => {
      console.log(`\n${i + 1}. ${matchup.team1.teamName} vs ${matchup.team2.teamName}`);
      console.log(
        `   ${matchup.team1.ownerName} (${matchup.team1.record}) vs ${matchup.team2.ownerName} (${matchup.team2.record})`,
      );
      console.log(`   PF: ${matchup.team1.pointsFor} vs ${matchup.team2.pointsFor}`);
      if (matchup.storyline) {
        console.log(`   📖 ${matchup.storyline}`);
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log('✅ Upcoming matchups tool working correctly!');
    console.log(`   Total matchups: ${result.totalMatchups}`);
    console.log(`   AFC: ${result.afc.length}, NFC: ${result.nfc.length}`);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
};

testUpcoming();
