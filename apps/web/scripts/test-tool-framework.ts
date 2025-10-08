import { toolRegistry } from '../src/lib/reports/recap/tools/registry';
import { leagueStatsTool } from '../src/lib/reports/recap/tools/examples/league-stats-tool';

/**
 * Tests the tool integration framework.
 * Usage: tsx apps/web/scripts/test-tool-framework.ts
 */
const testToolFramework = async (): Promise<void> => {
  /* eslint-disable no-console */
  console.log('🚀 Testing Tool Integration Framework\n');

  try {
    // Test 1: Register tool
    console.log('Test 1: Registering example tool...');
    toolRegistry.register(leagueStatsTool);
    console.log('✅ Tool registered\n');

    // Test 2: Get tool
    console.log('Test 2: Retrieving tool...');
    const tool = toolRegistry.getTool('fetch_league_stats');
    if (!tool) {
      throw new Error('Tool not found in registry');
    }
    console.log('✅ Tool retrieved:', tool.name, '\n');

    // Test 3: Execute tool
    console.log('Test 3: Executing tool...');
    const result = await toolRegistry.execute(
      'fetch_league_stats',
      { week: 5, season: 2025 },
      { week: 5, season: 2025, debug: true },
    );

    if (!result.success) {
      throw new Error(`Tool execution failed: ${result.error}`);
    }

    console.log('✅ Tool executed successfully');
    console.log('Result:', JSON.stringify(result.data, null, 2));
    console.log(`Execution time: ${result.executionTime}ms\n`);

    // Test 4: Get stats
    console.log('Test 4: Getting execution stats...');
    const stats = toolRegistry.getStats();
    console.log('Stats:', stats);
    console.log('✅ Stats retrieved\n');

    // Test 5: Get tool definitions
    console.log('Test 5: Getting tool definitions for Gemini...');
    const definitions = toolRegistry.getToolDefinitions();
    console.log('Tool definitions:', JSON.stringify(definitions, null, 2));
    console.log('✅ Definitions formatted\n');

    console.log('🎉 All tool framework tests passed!');
  } catch (error) {
    console.error('❌ Tool framework test failed:', error);
    process.exit(1);
  }
  /* eslint-enable no-console */
};

testToolFramework();
