/**
 * Database Recovery Script
 * Rebuilds all data from Sleeper API after database reset
 * Runs ingestion + all rollup/analytics scripts in proper sequence
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface RecoveryStep {
  name: string;
  command: string;
  description: string;
  required: boolean;
}

const RECOVERY_STEPS: RecoveryStep[] = [
  {
    name: 'data-ingestion',
    command: 'npx tsx src/scripts/data-ingestion/index.ts',
    description:
      'Ingest all raw data from Sleeper API (league, users, rosters, matchups, transactions)',
    required: true,
  },
  {
    name: 'weekly-rollups',
    command:
      'ROLLUP_LEAGUE_ID=997670420490801152 ROLLUP_SEASON=2024 npx tsx src/scripts/analysis/compute-weekly-rollups.ts',
    description:
      'Compute weekly rollup tables (MatchupSummary, RosterWeekAggregate, LeagueWeekSummary)',
    required: true,
  },
  {
    name: 'hydrate-metrics',
    command:
      'LEAGUE_ID=997670420490801152 SEASON=2024 npx tsx src/scripts/hydrate-weekly-metrics.ts',
    description: 'Populate WeeklyMetrics table from rollups',
    required: true,
  },
  {
    name: 'variance-models',
    command: 'npx tsx src/scripts/calculate-metrics.ts',
    description: 'Calculate variance models and projection errors',
    required: false,
  },
  {
    name: 'season-superlatives',
    command: 'npx tsx src/scripts/analysis/compute-season-superlatives.ts',
    description: 'Compute season-level superlatives and records',
    required: false,
  },
  {
    name: 'hall-of-fame-categories',
    command: 'npx tsx src/scripts/seed-hall-of-fame-categories.ts',
    description: 'Seed Hall of Fame category definitions',
    required: true,
  },
  {
    name: 'hall-of-fame-records',
    command: 'npx tsx src/scripts/initialize-hall-of-fame.ts',
    description: 'Initialize Hall of Fame records from seeded data',
    required: true,
  },
];

export class DatabaseRecovery {
  private startTime = new Date();
  private completedSteps: string[] = [];
  private failedSteps: Array<{ name: string; error: string }> = [];

  async runRecovery(skipSteps: string[] = []) {
    console.log('🚨 DATABASE RECOVERY STARTING');
    console.log('='.repeat(50));
    console.log(`Start time: ${this.startTime.toISOString()}`);
    console.log(`Total steps: ${RECOVERY_STEPS.length}`);
    console.log(`Skipping steps: ${skipSteps.join(', ') || 'none'}`);
    console.log();

    for (const step of RECOVERY_STEPS) {
      if (skipSteps.includes(step.name)) {
        console.log(`⏭️  Skipping: ${step.name}`);
        continue;
      }

      await this.runStep(step);
    }

    await this.generateRecoveryReport();
  }

  private async runStep(step: RecoveryStep) {
    const stepStart = Date.now();

    console.log(`🔄 Running: ${step.name}`);
    console.log(`   Description: ${step.description}`);
    console.log(`   Command: ${step.command}`);

    try {
      const { stdout, stderr } = await execAsync(step.command, {
        cwd: process.cwd(),
        timeout: 300000, // 5 minute timeout
      });

      const duration = Date.now() - stepStart;
      console.log(`✅ Completed: ${step.name} (${duration}ms)`);

      if (stdout) {
        console.log('   Output:', stdout.slice(0, 200) + (stdout.length > 200 ? '...' : ''));
      }

      this.completedSteps.push(step.name);
    } catch (error: any) {
      const duration = Date.now() - stepStart;
      console.log(`❌ Failed: ${step.name} (${duration}ms)`);
      console.log(`   Error: ${error.message}`);

      if (error.stdout) {
        console.log('   Stdout:', error.stdout);
      }
      if (error.stderr) {
        console.log('   Stderr:', error.stderr);
      }

      this.failedSteps.push({
        name: step.name,
        error: error.message,
      });

      if (step.required) {
        console.log('⚠️  Required step failed - stopping recovery');
        throw new Error(`Required step ${step.name} failed: ${error.message}`);
      } else {
        console.log('ℹ️  Optional step failed - continuing recovery');
      }
    }

    console.log();
  }

  private async generateRecoveryReport() {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    console.log('📊 DATABASE RECOVERY COMPLETE');
    console.log('='.repeat(50));
    console.log(`Start time: ${this.startTime.toISOString()}`);
    console.log(`End time: ${endTime.toISOString()}`);
    console.log(`Total duration: ${Math.round(duration / 1000)}s`);
    console.log();

    console.log(`✅ Completed steps (${this.completedSteps.length}):`);
    this.completedSteps.forEach(step => console.log(`   - ${step}`));
    console.log();

    if (this.failedSteps.length > 0) {
      console.log(`❌ Failed steps (${this.failedSteps.length}):`);
      this.failedSteps.forEach(failure => {
        console.log(`   - ${failure.name}: ${failure.error}`);
      });
      console.log();
    }

    // Verify key data exists
    await this.verifyRecovery();
  }

  private async verifyRecovery() {
    console.log('🔍 Verifying recovery...');

    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const counts = await Promise.all([
        prisma.league.count(),
        prisma.user.count(),
        prisma.roster.count(),
        prisma.matchup.count(),
        prisma.transaction.count(),
        prisma.rosterWeekAggregate.count(),
        prisma.matchupSummary.count(),
        prisma.weeklyMetrics.count(),
        prisma.hallOfFameCategory.count(),
        prisma.hallOfFameRecord.count(),
      ]);

      const [
        leagues,
        users,
        rosters,
        matchups,
        transactions,
        rollups,
        summaries,
        metrics,
        hofCategories,
        hofRecords,
      ] = counts;

      console.log('Data verification:');
      console.log(`   Leagues: ${leagues}`);
      console.log(`   Users: ${users}`);
      console.log(`   Rosters: ${rosters}`);
      console.log(`   Matchups: ${matchups}`);
      console.log(`   Transactions: ${transactions}`);
      console.log(`   RosterWeekAggregates: ${rollups}`);
      console.log(`   MatchupSummaries: ${summaries}`);
      console.log(`   WeeklyMetrics: ${metrics}`);
      console.log(`   Hall of Fame Categories: ${hofCategories}`);
      console.log(`   Hall of Fame Records: ${hofRecords}`);

      await prisma.$disconnect();

      const hasBaseData = leagues > 0 && users > 0 && rosters > 0 && matchups > 0;
      const hasRollups = rollups > 0 && summaries > 0 && metrics > 0;
      const hasHallOfFame = hofCategories > 0;

      if (hasBaseData && hasRollups && hasHallOfFame) {
        console.log('✅ Recovery verification PASSED - all systems operational');
      } else {
        console.log('⚠️  Recovery verification PARTIAL - some data may be missing');
      }
    } catch (error) {
      console.log(`❌ Recovery verification FAILED: ${error}`);
    }
  }
}

async function main() {
  const recovery = new DatabaseRecovery();

  // Parse command line arguments for skipping steps
  const skipArgs = process.argv.slice(2).filter(arg => arg.startsWith('--skip='));
  const skipSteps = skipArgs.length > 0 ? skipArgs[0].replace('--skip=', '').split(',') : [];

  try {
    await recovery.runRecovery(skipSteps);
    console.log('🎉 Database recovery completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Database recovery failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
main();
