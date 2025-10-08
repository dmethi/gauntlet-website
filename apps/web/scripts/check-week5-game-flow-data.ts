/**
 * Debug script to check what game flow data we have for Week 5
 *
 * Queries the database to understand:
 * - How many data points per matchup
 * - Time range covered
 * - Data density (intervals between samples)
 */

import { getWeekWinProbSamples, getMatchupExcitementMetrics, disconnect } from '@gauntlet/server';

const checkWeek5Data = async (): Promise<void> => {
  console.log('🔍 Checking Week 5 Game Flow Data\n');

  const leagueIds = ['1263744209295245312', '1263740549504962561']; // AFC, NFC
  const week = 5;

  for (const leagueId of leagueIds) {
    const leagueName = leagueId.includes('3245') ? 'AFC' : 'NFC';
    console.log(`\n📊 ${leagueName} League (${leagueId})`);
    console.log('='.repeat(80));

    const samples = await getWeekWinProbSamples(leagueId, week);

    if (samples.length === 0) {
      console.log('❌ No data found for this league in Week 5');
      continue;
    }

    console.log(`\n✅ Found ${samples.length} total samples across all matchups`);

    // Group by matchup
    const byMatchup = samples.reduce(
      (acc, sample) => {
        const id = sample.matchupId;
        if (!acc[id]) acc[id] = [];
        acc[id].push(sample);
        return acc;
      },
      {} as Record<number, typeof samples>,
    );

    // Analyze each matchup
    for (const matchupId of Object.keys(byMatchup).sort()) {
      const matchupSamples = byMatchup[Number(matchupId)];
      console.log(`\n  🏈 Matchup ${matchupId}:`);
      console.log(`     • Samples: ${matchupSamples.length}`);

      if (matchupSamples.length > 0) {
        const timestamps = matchupSamples.map(s => s.timestamp.getTime());
        const firstTime = new Date(Math.min(...timestamps));
        const lastTime = new Date(Math.max(...timestamps));
        const duration = (lastTime.getTime() - firstTime.getTime()) / (1000 * 60); // minutes

        console.log(`     • First sample: ${firstTime.toISOString()}`);
        console.log(`     • Last sample: ${lastTime.toISOString()}`);
        console.log(`     • Duration: ${Math.round(duration)} minutes`);

        if (matchupSamples.length > 1) {
          const intervals = [];
          for (let i = 1; i < matchupSamples.length; i++) {
            const interval =
              (matchupSamples[i].timestamp.getTime() - matchupSamples[i - 1].timestamp.getTime()) /
              (1000 * 60);
            intervals.push(interval);
          }
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          console.log(`     • Avg interval: ${avgInterval.toFixed(1)} minutes`);
        }

        // Get excitement metrics
        const excitement = await getMatchupExcitementMetrics(leagueId, week, Number(matchupId));
        if (excitement) {
          console.log(
            `     • Excitement: ${excitement.volatilityScore.toFixed(1)} volatility, ${excitement.leadChanges} lead changes`,
          );
          console.log(`     • Max swing: ${excitement.maxSwing.toFixed(1)}%`);
          console.log(`     • Data quality: ${excitement.dataQuality}`);
        }

        // Show score progression
        const firstSample = matchupSamples[0];
        const lastSample = matchupSamples[matchupSamples.length - 1];
        console.log(
          `     • Scores: ${firstSample.currentScoreA.toFixed(1)}-${firstSample.currentScoreB.toFixed(1)} → ${lastSample.currentScoreA.toFixed(1)}-${lastSample.currentScoreB.toFixed(1)}`,
        );
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Analysis complete');
};

// Run the check
checkWeek5Data()
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(() => {
    disconnect();
  });
