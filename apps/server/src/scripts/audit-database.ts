#!/usr/bin/env node
/**
 * Database Audit Script
 *
 * Checks which Prisma models have data in production
 * Helps identify what's actually being used vs. what's empty
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from apps/server directory
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '../generated/prisma-historical/index.js';
const prisma = new PrismaClient();

interface ModelStats {
  name: string;
  count: number;
  hasData: boolean;
  latestRecord?: Date | null;
  oldestRecord?: Date | null;
}

async function auditModel(
  modelName: string,
  query: any,
  timestampField: string = 'createdAt'
): Promise<ModelStats> {
  try {
    const count = await query.count();

    if (count === 0) {
      return {
        name: modelName,
        count: 0,
        hasData: false,
      };
    }

    // Get date range if model has timestamp field
    let latest = null;
    let oldest = null;

    try {
      const latestRecord = await query.findFirst({
        orderBy: { [timestampField]: 'desc' },
        select: { [timestampField]: true },
      });
      const oldestRecord = await query.findFirst({
        orderBy: { [timestampField]: 'asc' },
        select: { [timestampField]: true },
      });

      latest = latestRecord?.[timestampField];
      oldest = oldestRecord?.[timestampField];
    } catch (e) {
      // Model might not have this timestamp field
    }

    return {
      name: modelName,
      count,
      hasData: true,
      latestRecord: latest,
      oldestRecord: oldest,
    };
  } catch (error) {
    console.error(`Error auditing ${modelName}:`, error);
    return {
      name: modelName,
      count: -1,
      hasData: false,
    };
  }
}

async function main() {
  console.log('🔍 Auditing Historical Database...\n');
  console.log('Checking the 3 historical tracking models.\n');

  const allStats: ModelStats[] = [];

  // Historical tracking models (only 3 remain after migration)
  console.log('⚡ Auditing Historical Tracking Models...');
  allStats.push(await auditModel('LiveWinProbSample', prisma.liveWinProbSample, 'timestamp'));
  allStats.push(await auditModel('MatchupOddsHistory', prisma.matchupOddsHistory));
  allStats.push(await auditModel('LeagueOddsHistory', prisma.leagueOddsHistory));

  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('📋 DATABASE AUDIT RESULTS');
  console.log('='.repeat(80) + '\n');

  const modelsWithData = allStats.filter(s => s.hasData && s.count > 0);
  const emptyModels = allStats.filter(s => !s.hasData || s.count === 0);
  const errorModels = allStats.filter(s => s.count === -1);

  // Summary
  console.log('📊 Summary:');
  console.log(`   Total models: ${allStats.length}`);
  console.log(`   ✅ Models with data: ${modelsWithData.length}`);
  console.log(`   ❌ Empty models: ${emptyModels.length}`);
  if (errorModels.length > 0) {
    console.log(`   ⚠️  Error checking: ${errorModels.length}`);
  }
  console.log('');

  // Models with data (detailed)
  if (modelsWithData.length > 0) {
    console.log('✅ MODELS WITH DATA:\n');

    // Sort by count (descending)
    modelsWithData.sort((a, b) => b.count - a.count);

    for (const stat of modelsWithData) {
      console.log(`   ${stat.name}`);
      console.log(`      Rows: ${stat.count.toLocaleString()}`);

      if (stat.oldestRecord && stat.latestRecord) {
        console.log(
          `      Date range: ${stat.oldestRecord.toISOString().split('T')[0]} → ${stat.latestRecord.toISOString().split('T')[0]}`
        );

        // Calculate age
        const ageMs = stat.latestRecord.getTime() - stat.oldestRecord.getTime();
        const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
        if (ageDays > 0) {
          console.log(`      Age: ${ageDays} days`);
        }
      }
      console.log('');
    }
  }

  // Empty models
  if (emptyModels.length > 0) {
    console.log('❌ EMPTY MODELS (can likely be removed):\n');
    for (const stat of emptyModels) {
      console.log(`   ${stat.name}`);
    }
    console.log('');
  }

  // Error models
  if (errorModels.length > 0) {
    console.log('⚠️  MODELS WITH ERRORS:\n');
    for (const stat of errorModels) {
      console.log(`   ${stat.name}`);
    }
    console.log('');
  }

  // Recommendations
  console.log('='.repeat(80));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(80) + '\n');

  // Check for historical tracking data
  const historicalModels = ['LiveWinProbSample', 'MatchupOddsHistory', 'LeagueOddsHistory'];
  const historicalWithData = modelsWithData.filter(s => historicalModels.includes(s.name));

  if (historicalWithData.length > 0) {
    console.log('✅ KEEP FOR HISTORICAL CHARTS:');
    for (const stat of historicalWithData) {
      console.log(`   - ${stat.name} (${stat.count.toLocaleString()} records)`);
    }
    console.log('');
  }

  // Check for Sleeper data that can be replaced
  const sleeperModels = [
    'League',
    'User',
    'Roster',
    'Matchup',
    'Transaction',
    'Player',
    'PlayerStats',
    'Draft',
    'DraftPick',
  ];
  const sleeperWithData = modelsWithData.filter(s => sleeperModels.includes(s.name));

  if (sleeperWithData.length > 0) {
    console.log('🔄 CAN BE REPLACED WITH SLEEPER API:');
    for (const stat of sleeperWithData) {
      console.log(`   - ${stat.name} (${stat.count.toLocaleString()} records)`);
    }
    console.log('   → Archive important records, then remove from schema');
    console.log('');
  }

  // Calculate potential space savings
  const totalRecords = allStats.reduce((sum, s) => sum + Math.max(0, s.count), 0);
  const historicalRecords = historicalWithData.reduce((sum, s) => sum + s.count, 0);
  const removableRecords = totalRecords - historicalRecords;

  if (removableRecords > 0) {
    const savingsPercent = ((removableRecords / totalRecords) * 100).toFixed(1);
    console.log(`💾 POTENTIAL DB SIZE REDUCTION:`);
    console.log(`   Current total: ${totalRecords.toLocaleString()} records`);
    console.log(`   After cleanup: ${historicalRecords.toLocaleString()} records`);
    console.log(`   Reduction: ${removableRecords.toLocaleString()} records (${savingsPercent}%)`);
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});
