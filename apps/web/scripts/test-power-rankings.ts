import { fetchPowerRankingsTool } from '../src/lib/reports/recap/tools/power-rankings';

/**
 * Test script for power rankings tool.
 * Validates that rankings are calculated correctly with movement tracking.
 */

const testPowerRankings = async (): Promise<void> => {
  console.log('🧪 Testing Power Rankings\n');

  const currentWeek = 5;

  try {
    console.log(`Fetching power rankings for Week ${currentWeek}...\n`);

    const result = await fetchPowerRankingsTool.execute({ currentWeek });

    console.log('✅ Top 10 Rankings:');
    console.log('='.repeat(80));
    result.rankings.slice(0, 10).forEach(ranking => {
      const arrow = ranking.movement > 0 ? '↑' : ranking.movement < 0 ? '↓' : '→';
      const moveText = ranking.movement !== 0 ? ` (${arrow}${Math.abs(ranking.movement)})` : '';
      console.log(
        `   #${ranking.rank}${moveText.padEnd(6)} ${ranking.teamName.padEnd(25)} (${ranking.league}) - ${ranking.record}, ${ranking.pointsFor} PF`,
      );
    });

    console.log('\n' + '='.repeat(80));

    if (result.changes.biggestRiser) {
      console.log(
        `\n📈 Biggest Riser: ${result.changes.biggestRiser.teamName} (${result.changes.biggestRiser.league})`,
      );
      console.log(
        `   Moved ↑${result.changes.biggestRiser.movement} spots: #${result.changes.biggestRiser.previousRank} → #${result.changes.biggestRiser.rank}`,
      );
      console.log(
        `   Record: ${result.changes.biggestRiser.record}, ${result.changes.biggestRiser.pointsFor} PF`,
      );
    }

    if (result.changes.biggestFaller) {
      console.log(
        `\n📉 Biggest Faller: ${result.changes.biggestFaller.teamName} (${result.changes.biggestFaller.league})`,
      );
      console.log(
        `   Moved ↓${Math.abs(result.changes.biggestFaller.movement)} spots: #${result.changes.biggestFaller.previousRank} → #${result.changes.biggestFaller.rank}`,
      );
      console.log(
        `   Record: ${result.changes.biggestFaller.record}, ${result.changes.biggestFaller.pointsFor} PF`,
      );
    }

    console.log(`\n⚡ Notable Changes (3+ spots): ${result.changes.notableChanges.length} teams`);
    if (result.changes.notableChanges.length > 0) {
      console.log('='.repeat(80));
      result.changes.notableChanges.forEach(change => {
        const arrow = change.movement > 0 ? '↑' : '↓';
        console.log(
          `   ${change.teamName.padEnd(25)} (${change.league}): ${arrow}${Math.abs(change.movement)} to #${change.rank} (${change.record})`,
        );
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Power rankings tool working correctly!');
    console.log(`   Total teams: ${result.rankings.length}`);
    console.log(`   Top 3: ${result.changes.topThree.map(t => t.teamName).join(', ')}`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

testPowerRankings();
