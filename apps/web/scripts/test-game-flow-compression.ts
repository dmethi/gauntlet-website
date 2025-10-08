/**
 * Test script for game flow compression.
 *
 * Uses real Week 5 data to validate compression algorithm:
 * - Filters to in-game samples
 * - Extracts 3-5 key moments
 * - Calculates excitement metrics
 * - Shows compression ratio
 */

import { getMatchupWinProbTimeSeries, disconnect } from '@gauntlet/server';
import { compressGameFlow } from '../src/lib/reports/recap/utils/compress-time-series';
import type { LiveMatchupUpdate } from '../src/lib/reports/recap/types';

const testCompression = async (): Promise<void> => {
  console.log('🧪 Testing Game Flow Compression with Real Week 5 Data\n');

  const leagueId = '1263744209295245312'; // AFC
  const week = 5;
  const matchupId = 4; // The exciting matchup with 99.7% swing!

  console.log(`📊 Fetching data for AFC Matchup ${matchupId}...\n`);

  // Fetch raw data
  const rawSamples = await getMatchupWinProbTimeSeries(leagueId, week, matchupId);

  if (rawSamples.length === 0) {
    console.error('❌ No data found for this matchup');
    return;
  }

  console.log(`✅ Found ${rawSamples.length} raw samples`);
  console.log(`   First: ${rawSamples[0].timestamp.toISOString()}`);
  console.log(`   Last: ${rawSamples[rawSamples.length - 1].timestamp.toISOString()}`);

  // Transform to our interface
  const samples: LiveMatchupUpdate[] = rawSamples.map(s => ({
    timestamp: s.timestamp,
    week,
    matchupId,
    leagueId,
    rosterAId: 0,
    rosterBId: 0,
    gameProgress: s.gameProgress,
    winProbA: s.winProbA,
    winProbB: s.winProbB,
    currentScoreA: s.currentScoreA,
    currentScoreB: s.currentScoreB,
    projectedFinalA: s.projectedFinalA,
    projectedFinalB: s.projectedFinalB,
    spread: s.spread,
    total: 0,
  }));

  // Show in-game vs pre-game samples
  const inGameSamples = samples.filter(
    s => s.currentScoreA > 0 || s.currentScoreB > 0 || (s.gameProgress > 0 && s.gameProgress < 1),
  );
  console.log(`   In-game samples: ${inGameSamples.length}`);
  console.log(`   Pre/post-game samples: ${samples.length - inGameSamples.length}\n`);

  // Compress
  console.log('🔄 Compressing time series...\n');
  const compressed = compressGameFlow(samples, leagueId, week, matchupId);

  // Display results
  console.log('✅ Compression Results:');
  console.log(`   ${compressed.compressionRatio}`);
  console.log(`   Key moments: ${compressed.keyMoments.length}`);
  console.log(
    `   Final score: ${compressed.finalScore.teamA.toFixed(1)} - ${compressed.finalScore.teamB.toFixed(1)}`,
  );

  console.log('\n📈 Excitement Metrics:');
  console.log(`   Lead changes: ${compressed.excitement.leadChanges}`);
  console.log(`   Max comeback: ${compressed.excitement.maxComeback} pts`);
  console.log(`   Volatility: ${compressed.excitement.volatility}/100`);
  console.log(`   Max swing: ${compressed.excitement.maxSwing}%`);
  console.log(`   Clutch factor: ${compressed.excitement.clutchFactor}/100`);
  console.log(`   Samples used: ${compressed.excitement.totalSamples}`);

  console.log('\n🔑 Key Moments:');
  compressed.keyMoments.forEach((moment, i) => {
    const time = new Date(moment.timestamp).toLocaleString();
    const score = `${moment.teamAScore.toFixed(1)}-${moment.teamBScore.toFixed(1)}`;
    const winProb = `${(moment.teamAWinProbability * 100).toFixed(1)}%`;
    console.log(`   ${i + 1}. [${moment.significance}]`);
    console.log(`      ${time}`);
    console.log(`      Score: ${score} | Win Prob A: ${winProb}`);
    console.log(`      ${moment.description}`);
    console.log('');
  });

  // Validation
  console.log('═'.repeat(80));
  if (compressed.keyMoments.length >= 2 && compressed.keyMoments.length <= 5) {
    console.log('✅ SUCCESS: Compression achieved target range (2-5 key moments)');
  } else if (compressed.keyMoments.length === 1) {
    console.log('⚠️  WARNING: Only 1 key moment (likely low-action game)');
  } else {
    console.log(`❌ FAILED: ${compressed.keyMoments.length} moments exceeds target of 5`);
  }

  if (compressed.excitement.totalSamples > 0) {
    console.log('✅ SUCCESS: Excitement metrics calculated');
  } else {
    console.log('❌ FAILED: No excitement metrics calculated');
  }

  console.log('═'.repeat(80));
};

// Run test
testCompression()
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(() => {
    disconnect();
  });
