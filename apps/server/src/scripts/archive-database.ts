#!/usr/bin/env node
/**
 * Archive Database Script
 * Archives all existing database data before migration
 */

import prisma from '../lib/prisma';
import ArchiveService from '../services/archive/archive.service';

async function archiveDatabase() {
  console.log('📦 Starting database archive...');
  const archive = new ArchiveService();
  const startTime = Date.now();

  try {
    // Get all data that needs to be archived
    console.log('Fetching data from database...');

    const [
      leagues,
      users,
      rosters,
      matchups,
      transactions,
      matchupSimulations,
      matchupOddsHistory,
    ] = await Promise.all([
      prisma.league.findMany(),
      prisma.user.findMany(),
      prisma.roster.findMany({ include: { owner: true } }),
      prisma.matchup.findMany({ take: 10000 }), // Limit for safety
      prisma.transaction.findMany({ take: 5000 }),
      prisma.matchupSimulation.findMany(),
      prisma.matchupOddsHistory.findMany({ take: 10000 }),
    ]);

    console.log('Data fetched:');
    console.log(`  - Leagues: ${leagues.length}`);
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Rosters: ${rosters.length}`);
    console.log(`  - Matchups: ${matchups.length}`);
    console.log(`  - Transactions: ${transactions.length}`);
    console.log(`  - Simulations: ${matchupSimulations.length}`);
    console.log(`  - Odds History: ${matchupOddsHistory.length}`);

    // Archive each data type
    const timestamp = new Date().toISOString().split('T')[0];

    if (leagues.length > 0) {
      await archive.saveSnapshot('league', `full_backup_${timestamp}`, leagues, {
        count: leagues.length,
        reason: 'pre_migration_backup',
      });
    }

    if (users.length > 0) {
      await archive.saveSnapshot('users', `full_backup_${timestamp}`, users, {
        count: users.length,
        reason: 'pre_migration_backup',
      });
    }

    if (rosters.length > 0) {
      await archive.saveSnapshot('rosters', `full_backup_${timestamp}`, rosters, {
        count: rosters.length,
        reason: 'pre_migration_backup',
      });
    }

    if (matchups.length > 0) {
      // Archive matchups by week for manageability
      const matchupsByWeek = matchups.reduce(
        (acc, m) => {
          const week = m.week;
          if (!acc[week]) acc[week] = [];
          acc[week].push(m);
          return acc;
        },
        {} as Record<number, any[]>
      );

      for (const [week, weekMatchups] of Object.entries(matchupsByWeek)) {
        await archive.saveSnapshot('matchups', `week_${week}_${timestamp}`, weekMatchups, {
          count: weekMatchups.length,
          week: parseInt(week),
          reason: 'pre_migration_backup',
        });
      }
    }

    if (transactions.length > 0) {
      await archive.saveSnapshot('transactions', `full_backup_${timestamp}`, transactions, {
        count: transactions.length,
        reason: 'pre_migration_backup',
      });
    }

    if (matchupSimulations.length > 0) {
      await archive.saveSnapshot('simulations', `full_backup_${timestamp}`, matchupSimulations, {
        count: matchupSimulations.length,
        reason: 'pre_migration_backup',
      });
    }

    if (matchupOddsHistory.length > 0) {
      await archive.saveSnapshot('odds', `history_${timestamp}`, matchupOddsHistory, {
        count: matchupOddsHistory.length,
        reason: 'pre_migration_backup',
      });
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Archive complete in ${duration}ms`);
    console.log(`📁 Archives saved to: data/archive/`);

    // List all created archives
    const archives = await archive.listArchives();
    console.log(`\nCreated ${archives.length} archive files`);
  } catch (error) {
    console.error('❌ Archive failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  archiveDatabase().catch(console.error);
}

export { archiveDatabase };
