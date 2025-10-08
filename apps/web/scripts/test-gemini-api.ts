import { config } from 'dotenv';
import { join } from 'path';
import { validateGeminiAPI } from '../src/lib/reports/recap/gemini-client';
import { testFunctionCalling } from '../src/lib/reports/recap/test-function-calling';

// Clear any existing GEMINI_API_KEY to avoid shell environment conflicts
delete process.env.GEMINI_API_KEY;

// Load environment variables from root .env file
const rootEnvPath = join(process.cwd(), '../../.env');
config({ path: rootEnvPath, override: true });

/**
 * Validates Gemini API integration.
 * Usage: tsx apps/web/scripts/test-gemini-api.ts
 */
const testGeminiIntegration = async (): Promise<void> => {
  /* eslint-disable no-console */
  console.log('🚀 Testing Gemini API Integration\n');

  try {
    // Test 1: Basic API access
    console.log('Test 1: Validating API access...');
    await validateGeminiAPI();
    console.log('✅ API access validated\n');

    // Test 2: Function calling
    console.log('Test 2: Testing function calling...');
    await testFunctionCalling();
    console.log('✅ Function calling works\n');

    console.log('🎉 All Gemini API tests passed!');
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);

    if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
      console.error('\n💡 Make sure GEMINI_API_KEY is set in the root .env file');
    }

    process.exit(1);
  }
  /* eslint-enable no-console */
};

testGeminiIntegration();
