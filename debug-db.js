#!/usr/bin/env node

/**
 * Database debugging script for matchups
 * Run with: node debug-db.js
 *
 * This script will check what data exists in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugDatabase() {
  console.log('🗄️ Starting database debugging...\n');

  try {
    // Check leagues
    console.log('='.repeat(50));
    console.log('1. Checking leagues...');
    const leagues = await prisma.league.findMany({
      select: { id: true, name: true, season: true, status: true },
    });
    console.log(`📋 Found ${leagues.length} leagues:`);
    leagues.forEach(league => {
      console.log(`  - ${league.name} (${league.id}) - Season ${league.season} - ${league.status}`);
    });

    if (leagues.length === 0) {
      console.log('❌ No leagues found! This might be the problem.');
      return;
    }

    const targetLeague = leagues.find(l => l.id === '997670420490801152');
    if (!targetLeague) {
      console.log('❌ Target league 997670420490801152 not found!');
      console.log(
        'Available league IDs:',
        leagues.map(l => l.id)
      );
      return;
    }

    console.log(`✅ Found target league: ${targetLeague.name}`);

    // Check matchups for this league
    console.log('\n' + '='.repeat(50));
    console.log('2. Checking matchups for target league...');

    const matchupCounts = await prisma.matchup.groupBy({
      by: ['week'],
      where: { leagueId: '997670420490801152' },
      _count: { week: true },
    });

    console.log(`📊 Matchup counts by week:`);
    matchupCounts.forEach(count => {
      console.log(`  - Week ${count.week}: ${count._count.week} matchups`);
    });

    if (matchupCounts.length === 0) {
      console.log('❌ No matchups found for target league!');

      // Check if there are ANY matchups in the database
      const totalMatchups = await prisma.matchup.count();
      console.log(`Total matchups in database: ${totalMatchups}`);

      if (totalMatchups > 0) {
        const sampleMatchups = await prisma.matchup.findMany({
          take: 5,
          select: { leagueId: true, week: true, rosterId: true, matchupId: true },
        });
        console.log('Sample matchups:', sampleMatchups);
      }
      return;
    }

    // Check specific week data
    console.log('\n' + '='.repeat(50));
    console.log('3. Checking Week 1 matchups in detail...');

    const week1Matchups = await prisma.matchup.findMany({
      where: { leagueId: '997670420490801152', week: 1 },
      include: {
        roster: {
          include: {
            owner: {
              select: { id: true, username: true, displayName: true },
            },
          },
        },
      },
      take: 3, // Just first 3 for debugging
    });

    console.log(`📋 Found ${week1Matchups.length} matchups for Week 1`);
    week1Matchups.forEach(matchup => {
      console.log(
        `  - Matchup ${matchup.matchupId}: Roster ${matchup.rosterId} (${matchup.roster?.owner?.displayName || 'No owner'}) - ${matchup.points} pts`
      );
    });

    // Check matchup summaries
    console.log('\n' + '='.repeat(50));
    console.log('4. Checking matchup summaries...');

    const summaries = await prisma.matchupSummary.findMany({
      where: { leagueId: '997670420490801152', week: 1 },
      take: 3,
    });

    console.log(`📋 Found ${summaries.length} matchup summaries for Week 1`);
    summaries.forEach(summary => {
      console.log(
        `  - Matchup ${summary.matchupId}: ${summary.pointsA} vs ${summary.pointsB} (Winner: ${summary.winnerRosterId})`
      );
    });
  } catch (error) {
    console.error('💥 Database debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n🏁 Database debug complete!');
}

// Run the debug
debugDatabase().catch(console.error);
