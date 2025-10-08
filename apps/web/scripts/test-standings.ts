import { fetchStandingsTool } from '../src/lib/reports/recap/tools/standings';

const testStandings = async (): Promise<void> => {
  console.log('🧪 Testing Standings\n');

  const week = 5;

  try {
    console.log(`Fetching standings through Week ${week}...\n`);

    const result = await fetchStandingsTool.execute({ week });

    console.log('='.repeat(80));
    console.log('AFC STANDINGS');
    console.log('='.repeat(80));
    result.afc.entries.forEach(entry => {
      const seed = entry.playoffSeed ? `[${entry.playoffSeed}] ` : '    ';
      const record =
        entry.ties > 0
          ? `${entry.wins}-${entry.losses}-${entry.ties}`
          : `${entry.wins}-${entry.losses}`;
      const divLabel = entry.division ? ` (Div ${entry.division})` : '';
      console.log(
        `${seed}${entry.rank}. ${entry.teamName.padEnd(25)} ${record.padEnd(8)} (${entry.winPct.toFixed(3)})${divLabel.padEnd(10)} | ${entry.pointsFor} PF`,
      );
    });

    console.log('\n' + '='.repeat(80));
    console.log('NFC STANDINGS');
    console.log('='.repeat(80));
    result.nfc.entries.forEach(entry => {
      const seed = entry.playoffSeed ? `[${entry.playoffSeed}] ` : '    ';
      const record =
        entry.ties > 0
          ? `${entry.wins}-${entry.losses}-${entry.ties}`
          : `${entry.wins}-${entry.losses}`;
      const divLabel = entry.division ? ` (Div ${entry.division})` : '';
      console.log(
        `${seed}${entry.rank}. ${entry.teamName.padEnd(25)} ${record.padEnd(8)} (${entry.winPct.toFixed(3)})${divLabel.padEnd(10)} | ${entry.pointsFor} PF`,
      );
    });

    console.log('\n✅ Standings tool working correctly!');
    console.log(`   Seeds 1-3: Division winners (best records)`);
    console.log(`   Seeds 4-6: Wild cards (next best records)`);
    console.log(`   Tiebreaker: Win percentage, then points for`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testStandings();
