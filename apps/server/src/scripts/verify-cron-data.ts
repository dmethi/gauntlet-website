/**
 * Verify Cron Job Data Collection
 *
 * Quick script to check if live odds cron job is successfully saving data.
 * Run after deploying Prisma fix to verify it's working.
 *
 * Usage:
 *   cd apps/server
 *   npx tsx src/scripts/verify-cron-data.ts
 *
 * Expected output:
 *   - 12 matchups with data for current week
 *   - Recent samples (within last 15 minutes)
 *   - No significant timestamp gaps
 */

import { PrismaClient } from '../../generated/prisma-historical/index.js';

const prisma = new PrismaClient();

const main = async () => {
  console.log('🔍 Verifying Live Odds Cron Job Data Collection\n');

  try {
    // Get current week (adjust manually if needed)
    const currentWeek = 6;

    // Count total samples for the week
    const totalSamples = await prisma.liveWinProbSample.count({
      where: { week: currentWeek },
    });

    console.log(`📊 Total samples for Week ${currentWeek}: ${totalSamples}`);

    if (totalSamples === 0) {
      console.log('\n❌ NO DATA FOUND!');
      console.log('Possible issues:');
      console.log('  - Cron job not running');
      console.log('  - Prisma client initialization failing');
      console.log('  - Games not started yet for this week');
      console.log('  - DATABASE_URL not set in Vercel environment');
      return;
    }

    // Get latest sample
    const latest = await prisma.liveWinProbSample.findFirst({
      where: { week: currentWeek },
      orderBy: { timestamp: 'desc' },
    });

    if (latest) {
      const ageMinutes = (Date.now() - latest.timestamp.getTime()) / (1000 * 60);
      const ageStatus = ageMinutes < 15 ? '✅' : ageMinutes < 30 ? '⚠️' : '❌';

      console.log(`\n${ageStatus} Latest sample: ${latest.timestamp.toLocaleString()}`);
      console.log(`   Age: ${ageMinutes.toFixed(1)} minutes ago`);

      if (ageMinutes > 15) {
        console.log('   ⚠️  Sample is older than expected (cron runs every 10 min)');
      }
    }

    // Count samples by matchup
    const matchupCounts = await prisma.liveWinProbSample.groupBy({
      by: ['leagueId', 'matchupId'],
      where: { week: currentWeek },
      _count: { id: true },
    });

    console.log(`\n📈 Data by matchup (${matchupCounts.length} matchups):`);

    for (const m of matchupCounts.sort((a, b) => a.matchupId - b.matchupId)) {
      const league = m.leagueId.includes('3245') ? 'AFC' : 'NFC';
      console.log(`   ${league} Matchup ${m.matchupId}: ${m._count.id} samples`);
    }

    if (matchupCounts.length < 12) {
      console.log(`\n⚠️  Expected 12 matchups, found ${matchupCounts.length}`);
      console.log('   Some matchups may not have started yet');
    } else {
      console.log('\n✅ All 12 matchups have data');
    }

    // Check for recent gaps (potential failures)
    const recentSamples = await prisma.liveWinProbSample.findMany({
      where: { week: currentWeek },
      orderBy: { timestamp: 'desc' },
      take: 30,
      select: { timestamp: true, matchupId: true, leagueId: true },
    });

    if (recentSamples.length > 1) {
      const gaps: Array<{ from: Date; to: Date; minutes: number }> = [];

      for (let i = 0; i < recentSamples.length - 1; i++) {
        const gapMs =
          recentSamples[i].timestamp.getTime() - recentSamples[i + 1].timestamp.getTime();
        const gapMinutes = gapMs / (1000 * 60);

        // Flag gaps > 12 minutes (expected: 10 min + 2 min buffer)
        if (gapMinutes > 12) {
          gaps.push({
            from: recentSamples[i + 1].timestamp,
            to: recentSamples[i].timestamp,
            minutes: gapMinutes,
          });
        }
      }

      if (gaps.length > 0) {
        console.log(`\n⚠️  Detected ${gaps.length} gaps in recent data (> 12 min):`);
        gaps.forEach((gap, i) => {
          if (i < 5) {
            // Show first 5 gaps
            console.log(
              `   ${gap.from.toLocaleString()} → ${gap.to.toLocaleString()} (${gap.minutes.toFixed(1)} min)`
            );
          }
        });
        if (gaps.length > 5) {
          console.log(`   ... and ${gaps.length - 5} more gaps`);
        }
        console.log('\n   Possible causes:');
        console.log('   - Cron job failures (check Vercel logs)');
        console.log('   - Cold start timeouts');
        console.log('   - Database connection issues');
      } else {
        console.log('\n✅ No significant gaps in recent data');
        console.log('   Cron job appears to be running consistently');
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    if (
      totalSamples > 0 &&
      matchupCounts.length >= 10 &&
      latest &&
      Date.now() - latest.timestamp.getTime() < 15 * 60 * 1000
    ) {
      console.log('✅ System is HEALTHY');
      console.log('   - Data is being collected');
      console.log('   - Recent samples exist');
      console.log('   - Most/all matchups have data');
    } else if (totalSamples > 0) {
      console.log('⚠️  System is PARTIALLY WORKING');
      console.log('   - Some data exists, but may be stale or incomplete');
      console.log('   - Check Vercel logs for errors');
    } else {
      console.log('❌ System is NOT WORKING');
      console.log('   - No data found for current week');
      console.log('   - Likely Prisma initialization or cron job issue');
    }
  } catch (error) {
    console.error('\n❌ Error verifying data:', error);
    console.log('\nPossible issues:');
    console.log('  - DATABASE_URL not set');
    console.log('  - Prisma client not generated');
    console.log('  - Database connection failed');
  } finally {
    await prisma.$disconnect();
  }
};

main();
