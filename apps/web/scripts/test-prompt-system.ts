import { createSystemPrompt } from '../src/lib/reports/recap/prompts/system';
import {
  estimateTokens,
  truncateToTokens,
  formatToolDataForPrompt,
  compressTimeSeries,
  createTokenMonitor,
} from '../src/lib/reports/recap/prompts/utils';

/**
 * Tests the prompt system.
 * Usage: tsx apps/web/scripts/test-prompt-system.ts
 */
const testPromptSystem = async () => {
  console.log('🚀 Testing Prompt System\n');

  try {
    // Test 1: System prompt generation
    console.log('Test 1: Generating system prompt...');
    const systemPrompt = createSystemPrompt(5, 2025);
    const tokens = estimateTokens(systemPrompt);
    console.log(`✅ System prompt generated (${tokens} tokens)\n`);

    // Test 2: Token estimation
    console.log('Test 2: Testing token estimation...');
    const testText = 'Hello world! '.repeat(100);
    const estimated = estimateTokens(testText);
    console.log(`✅ Estimated ${estimated} tokens for ${testText.length} chars\n`);

    // Test 3: Truncation
    console.log('Test 3: Testing token truncation...');
    const truncated = truncateToTokens(testText, 50);
    console.log(`✅ Truncated to ~50 tokens: ${truncated.slice(0, 50)}...\n`);

    // Test 4: Tool data formatting
    console.log('Test 4: Testing tool data formatting...');
    const mockData = {
      teamName: 'Test Team',
      score: 156.7,
      record: '4-1',
      rank: 3,
    };
    const formatted = formatToolDataForPrompt(mockData, 'list');
    console.log('✅ Formatted tool data:');
    console.log(formatted + '\n');

    // Test 5: Time-series compression
    console.log('Test 5: Testing time-series compression...');
    const mockTimeSeries = Array.from({ length: 36 }, (_, i) => ({
      timestamp: new Date(Date.now() + i * 5 * 60 * 1000).toISOString(),
      score: 100 + i * 2,
    }));
    const compressed = compressTimeSeries(mockTimeSeries);
    console.log(`✅ Compressed ${mockTimeSeries.length} points to ${compressed.length} points\n`);

    // Test 6: Token monitor
    console.log('Test 6: Testing token monitor...');
    const monitor = createTokenMonitor();
    monitor.track('league_overview', 500);
    monitor.track('matchup_1', 300);
    monitor.track('matchup_1', 200);
    const total = monitor.getTotal();
    const bySection = monitor.getBySection();
    console.log(`✅ Total tokens tracked: ${total}`);
    console.log('By section:', bySection, '\n');

    console.log('🎉 All prompt system tests passed!');
  } catch (error) {
    console.error('❌ Prompt system test failed:', error);
    process.exit(1);
  }
};

testPromptSystem();
