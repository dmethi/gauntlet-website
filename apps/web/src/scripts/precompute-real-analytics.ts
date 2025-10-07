#!/usr/bin/env tsx

/**
 * Real Draft Analytics Precomputation Script
 *
 * Fetches real draft data from Sleeper API and precomputes all analytics
 * for instant page loading.
 */

/* eslint-disable no-console */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getRealDrafts } from '../lib/draft-data-fetcher';
import { generateMockAnalytics } from '../features/draft-analysis/utils/analytics';
import { generateManagerAnalytics } from '../lib/manager-analytics';

const OUTPUT_DIR = join(process.cwd(), 'src', 'data', 'precomputed');

async function main() {
  console.log('🚀 Starting real draft analytics precomputation...');
  const startTime = Date.now();

  try {
    // Ensure output directory exists
    mkdirSync(OUTPUT_DIR, { recursive: true });

    // 📊 Step 1: Fetch real draft data
    console.log('\n📊 Fetching real draft data from Sleeper API...');
    const { draft1, draft2 } = await getRealDrafts();

    console.log('✅ Real drafts loaded successfully');
    console.log(
      `   - Draft 1: ${draft1.name} (${draft1.teams.length} teams, ${draft1.totalPicks} picks)`,
    );
    console.log(
      `   - Draft 2: ${draft2.name} (${draft2.teams.length} teams, ${draft2.totalPicks} picks)`,
    );

    // 📈 Step 2: Generate league analytics
    console.log('\n📈 Computing league analytics...');
    const leagueAnalytics = generateMockAnalytics(draft1, draft2);
    console.log('✅ League analytics computed');
    console.log(`   - Position metrics: ${leagueAnalytics.position_inflation.length}`);
    console.log(`   - Rank correlation: ${leagueAnalytics.spearman_rank_correlation.toFixed(3)}`);

    // 👥 Step 3: Generate manager analytics
    console.log('\n👥 Computing manager behavior analytics...');
    const managerAnalytics = generateManagerAnalytics(draft1, draft2);
    console.log('✅ Manager analytics computed');
    console.log(`   - Manager profiles: ${managerAnalytics.profiles.length}`);
    console.log(`   - Build type clusters: ${managerAnalytics.cluster_summary.length}`);
    console.log(
      `   - High similarity pairs: ${managerAnalytics.player_overlap_analytics.copycat_pairs.length}`,
    );

    // 💾 Step 4: Save all precomputed data
    console.log('\n💾 Saving precomputed data...');

    // Main analytics file (complete dataset)
    const completeData = {
      drafts: { draft1, draft2 },
      leagueAnalytics,
      managerAnalytics,
      metadata: {
        timestamp: new Date().toISOString(),
        generationTime: Date.now() - startTime,
        playerCount: draft1.totalPicks + draft2.totalPicks,
        teamCount: draft1.teams.length + draft2.teams.length,
        draftIds: [draft1.id, draft2.id],
        dataSource: 'sleeper_api',
      },
    };

    const analyticsPath = join(OUTPUT_DIR, 'analytics.json');
    writeFileSync(analyticsPath, JSON.stringify(completeData, null, 2));
    console.log(`✅ Main data saved: ${analyticsPath}`);

    // Individual files for easier partial loading
    writeFileSync(join(OUTPUT_DIR, 'drafts.json'), JSON.stringify({ draft1, draft2 }, null, 2));
    writeFileSync(
      join(OUTPUT_DIR, 'league-analytics.json'),
      JSON.stringify(leagueAnalytics, null, 2),
    );
    writeFileSync(
      join(OUTPUT_DIR, 'manager-analytics.json'),
      JSON.stringify(managerAnalytics, null, 2),
    );
    writeFileSync(
      join(OUTPUT_DIR, 'metadata.json'),
      JSON.stringify(completeData.metadata, null, 2),
    );

    // 🎉 Success summary
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const dataSize = Math.round(JSON.stringify(completeData).length / 1024);

    console.log('\n🎉 Precomputation completed successfully!');
    console.log('━'.repeat(50));
    console.log(`⏱️  Total time: ${totalTime}ms`);
    console.log(`📦  Data size: ${dataSize}KB`);
    console.log(`🏈  Players analyzed: ${draft1.totalPicks + draft2.totalPicks}`);
    console.log(
      `💰  Total draft value: $${draft1.teams.reduce((sum, t) => sum + t.totalSpent, 0) + draft2.teams.reduce((sum, t) => sum + t.totalSpent, 0)}`,
    );
    console.log(`🏆  Build types identified: ${managerAnalytics.cluster_summary.length}`);
    console.log(
      `🔗  Manager similarities computed: ${(managerAnalytics.profiles.length * (managerAnalytics.profiles.length - 1)) / 2}`,
    );
    console.log('━'.repeat(50));

    console.log('\n📁 Files created:');
    console.log(`   📄 analytics.json (${dataSize}KB) - Complete dataset`);
    console.log(`   📄 drafts.json - Draft data only`);
    console.log(`   📄 league-analytics.json - League-level metrics`);
    console.log(`   📄 manager-analytics.json - Manager behavior data`);
    console.log(`   📄 metadata.json - Generation metadata`);

    console.log('\n✨ Ready to use! Page should now load instantly.');
  } catch (error) {
    console.error('\n❌ Precomputation failed:', error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

    console.log('\n💡 Troubleshooting:');
    console.log('   - Check your internet connection');
    console.log('   - Verify the Sleeper draft IDs are correct');
    console.log('   - Make sure Sleeper API is accessible');
    console.log('   - Try again in a few minutes if rate limited');

    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as precomputeRealAnalytics };
