import { generateRecapReport } from '../src/lib/reports/recap/orchestrator';

/**
 * Test script for the recap report orchestrator.
 * Usage: tsx apps/web/scripts/test-recap-orchestrator.ts
 */
const testOrchestrator = async () => {
  console.log('🚀 Testing Recap Orchestrator\n');

  try {
    const result = await generateRecapReport(5, 2025);

    console.log('✅ Orchestrator executed successfully!\n');
    console.log('Result:', JSON.stringify(result, null, 2));

    // Validate structure
    if (!result.week || !result.season) {
      throw new Error('Missing required fields in result');
    }

    if (!result.leagueOverview) {
      throw new Error('Test node did not populate leagueOverview');
    }

    console.log('\n✅ All validations passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testOrchestrator();
