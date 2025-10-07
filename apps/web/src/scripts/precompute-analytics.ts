#!/usr/bin/env tsx

/**
 * Precompute Analytics Script
 *
 * This script generates all draft analytics and manager behavior analysis
 * and saves them to JSON files for instant loading in the UI.
 *
 * Run with: npx tsx src/scripts/precompute-analytics.ts
 */

/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getPreGeneratedDrafts } from '../lib/draft-generator';
import { generateMockAnalytics } from '../features/draft-analysis/utils/analytics';
import { generateManagerAnalytics } from '../lib/manager-analytics';

interface PrecomputedData {
  timestamp: string;
  version: string;
  drafts: {
    draft1: any;
    draft2: any;
  };
  analytics: any;
  managerAnalytics: any;
  metadata: {
    generationTime: number;
    playerCount: number;
    teamCount: number;
    totalSpend: {
      draft1: number;
      draft2: number;
    };
  };
}

async function precomputeAnalytics() {
  console.log('🚀 Starting analytics precomputation...\n');

  const startTime = Date.now();

  try {
    // Step 1: Generate draft data
    console.log('📊 Generating draft data...');
    const drafts = getPreGeneratedDrafts();
    const [draft1, draft2] = drafts;

    console.log(`✅ Generated drafts: ${draft1.name} vs ${draft2.name}`);
    console.log(`   - Teams per draft: ${draft1.teams.length}`);
    console.log(
      `   - Total players: ${draft1.teams.reduce((sum, team) => sum + team.picks.length, 0) + draft2.teams.reduce((sum, team) => sum + team.picks.length, 0)}`,
    );

    // Step 2: Generate league analytics
    console.log('\n📈 Computing league analytics...');
    const analytics = generateMockAnalytics(draft1, draft2);
    console.log('✅ League analytics computed');
    console.log(`   - Position metrics: ${analytics.position_inflation.length}`);
    console.log(
      `   - Player comparisons: ${analytics.consensus_players.length + analytics.divergent_players.length}`,
    );
    console.log(`   - Rank correlation: ${analytics.spearman_rank_correlation.toFixed(3)}`);

    // Step 3: Generate manager behavior analytics
    console.log('\n👥 Computing manager behavior analytics...');
    const managerAnalytics = generateManagerAnalytics(draft1, draft2);
    console.log('✅ Manager analytics computed');
    console.log(`   - Manager profiles: ${managerAnalytics.profiles.length}`);
    console.log(`   - Build type clusters: ${managerAnalytics.cluster_summary.length}`);
    console.log(
      `   - High similarity pairs: ${managerAnalytics.twins_summary.high_similarity_pairs}`,
    );
    console.log(
      `   - Avg cross-league similarity: ${managerAnalytics.twins_summary.avg_similarity.toFixed(3)}`,
    );

    // Step 4: Calculate metadata
    const totalSpendDraft1 = draft1.teams.reduce((sum, team) => sum + team.totalSpent, 0);
    const totalSpendDraft2 = draft2.teams.reduce((sum, team) => sum + team.totalSpent, 0);
    const totalPlayers =
      draft1.teams.reduce((sum, team) => sum + team.picks.length, 0) +
      draft2.teams.reduce((sum, team) => sum + team.picks.length, 0);

    const generationTime = Date.now() - startTime;

    // Step 5: Prepare data structure
    const precomputedData: PrecomputedData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      drafts: {
        draft1,
        draft2,
      },
      analytics,
      managerAnalytics,
      metadata: {
        generationTime,
        playerCount: totalPlayers,
        teamCount: draft1.teams.length + draft2.teams.length,
        totalSpend: {
          draft1: totalSpendDraft1,
          draft2: totalSpendDraft2,
        },
      },
    };

    // Step 6: Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'src', 'data', 'precomputed');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // Step 7: Save to files
    console.log('\n💾 Saving precomputed data...');

    // Save main data file
    const mainDataPath = join(dataDir, 'analytics.json');
    writeFileSync(mainDataPath, JSON.stringify(precomputedData, null, 2));
    console.log(`✅ Main data saved: ${mainDataPath}`);

    // Save individual components for faster loading
    writeFileSync(join(dataDir, 'drafts.json'), JSON.stringify(precomputedData.drafts, null, 2));

    writeFileSync(
      join(dataDir, 'league-analytics.json'),
      JSON.stringify(precomputedData.analytics, null, 2),
    );

    writeFileSync(
      join(dataDir, 'manager-analytics.json'),
      JSON.stringify(precomputedData.managerAnalytics, null, 2),
    );

    writeFileSync(
      join(dataDir, 'metadata.json'),
      JSON.stringify(precomputedData.metadata, null, 2),
    );

    // Step 8: Summary
    const fileSizeKB = Math.round(JSON.stringify(precomputedData).length / 1024);

    console.log('\n🎉 Precomputation completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Total time: ${generationTime.toLocaleString()}ms`);
    console.log(`📦  Data size: ${fileSizeKB.toLocaleString()}KB`);
    console.log(`🏈  Players analyzed: ${totalPlayers.toLocaleString()}`);
    console.log(
      `💰  Total draft value: $${(totalSpendDraft1 + totalSpendDraft2).toLocaleString()}`,
    );
    console.log(`🏆  Build types identified: ${managerAnalytics.cluster_summary.length}`);
    console.log(
      `🔗  Manager similarities computed: ${(managerAnalytics.profiles.length * (managerAnalytics.profiles.length - 1)) / 2}`,
    );
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📁 Files created:');
    console.log(`   📄 analytics.json (${fileSizeKB}KB) - Complete dataset`);
    console.log(`   📄 drafts.json - Draft data only`);
    console.log(`   📄 league-analytics.json - League-level metrics`);
    console.log(`   📄 manager-analytics.json - Manager behavior data`);
    console.log(`   📄 metadata.json - Generation metadata`);
    console.log('\n✨ Ready to use! Page should now load instantly.');
  } catch (error) {
    console.error('❌ Error during precomputation:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  precomputeAnalytics();
}

export { precomputeAnalytics };
