/**
 * Test script to validate game flow tool is properly registered.
 * Tests the tool through the registry to ensure it can be called by Gemini.
 */

import { toolRegistry } from '../src/lib/reports/recap/tools';
import { disconnect } from '@gauntlet/server';

const testToolRegistry = async (): Promise<void> => {
  console.log('🧪 Testing Game Flow Tool Registration\n');

  // Check if tool is registered
  const tool = toolRegistry.getTool('fetch_game_flow');

  if (!tool) {
    console.error('❌ FAILED: fetch_game_flow tool not found in registry');
    return;
  }

  console.log('✅ Tool found in registry');
  console.log(`   Name: ${tool.name}`);
  console.log(`   Description: ${tool.description.substring(0, 80)}...`);

  // Get all tools to show what's available
  const allTools = toolRegistry.getAllTools();
  console.log(`\n📋 Total tools registered: ${allTools.length}`);
  allTools.forEach(t => {
    console.log(`   - ${t.name}`);
  });

  // Test execution through registry
  console.log('\n🔄 Testing tool execution via registry...\n');

  const result = await toolRegistry.execute(
    'fetch_game_flow',
    {
      leagueId: '1263744209295245312', // AFC
      week: 5,
      matchupId: 4,
    },
    { week: 5, season: 2025, debug: false },
  );

  if (!result.success) {
    console.error(`❌ Tool execution failed: ${result.error}`);
    return;
  }

  console.log('✅ Tool execution successful');
  console.log(`   Execution time: ${result.executionTime}ms`);
  console.log(`   Timestamp: ${result.timestamp}`);

  if (result.data) {
    const data = result.data as {
      matchupId: string;
      keyMoments: unknown[];
      excitement: { leadChanges: number; maxSwing: number };
      compressionRatio: string;
    };
    console.log(`\n📊 Result data:`);
    console.log(`   Matchup ID: ${data.matchupId}`);
    console.log(`   Key moments: ${data.keyMoments.length}`);
    console.log(`   Lead changes: ${data.excitement.leadChanges}`);
    console.log(`   Max swing: ${data.excitement.maxSwing}%`);
    console.log(`   Compression: ${data.compressionRatio}`);
  }

  // Get registry stats
  const stats = toolRegistry.getStats();
  console.log(`\n📈 Registry stats:`);
  console.log(`   Total executions: ${stats.totalExecutions}`);
  console.log(`   Successful: ${stats.successfulExecutions}`);
  console.log(`   Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
  console.log(`   Avg execution time: ${stats.averageExecutionTime.toFixed(0)}ms`);

  console.log('\n' + '═'.repeat(80));
  console.log('✅ ALL TESTS PASSED - Tool is ready for Gemini integration');
  console.log('═'.repeat(80));
};

testToolRegistry()
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(() => {
    disconnect();
  });
