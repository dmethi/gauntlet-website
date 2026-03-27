import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { debugLog } from '@/lib/debug-log';

/**
 * Configuration for Gemini API client.
 * Uses Gemini 2.0 Flash for speed and cost efficiency.
 */
const GEMINI_CONFIG = {
  model: 'gemini-2.0-flash',
  temperature: 0.7, // Creative but consistent
  maxOutputTokens: 8192, // Enough for long narratives
} as const;

/**
 * Creates a Gemini API client for report generation.
 *
 * Model choice rationale:
 * - Gemini 2.0 Flash: Fast, cost-effective, 2M token context window
 * - Temperature 0.7: Balanced creativity for narratives
 * - Function calling: Required for tool integration
 *
 * @throws Error if GEMINI_API_KEY is not set
 */
export const createGeminiClient = (): ChatGoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please add it to the root .env file.');
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: GEMINI_CONFIG.model,
    temperature: GEMINI_CONFIG.temperature,
    maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
  });
};

/**
 * Validates that the Gemini API is accessible and working.
 * Uses a simple prompt without function calling.
 *
 * @returns True if API is accessible, throws otherwise
 */
export const validateGeminiAPI = async (): Promise<boolean> => {
  const client = createGeminiClient();

  try {
    const response = await client.invoke('Respond with exactly: "API OK"');

    const content = response.content.toString().trim();

    if (!content.includes('API OK')) {
      throw new Error(`Unexpected response: ${content}`);
    }

    return true;
  } catch (error) {
    throw new Error(
      `Gemini API validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

/**
 * Rate limit configuration for Gemini API.
 *
 * Gemini 2.0 Flash limits (free tier):
 * - 15 RPM (requests per minute)
 * - 1M TPM (tokens per minute)
 * - 1,500 RPD (requests per day)
 *
 * For report generation:
 * - ~20 sections per report
 * - Need to handle gracefully if limits hit
 */
export const RATE_LIMITS = {
  requestsPerMinute: 15,
  tokensPerMinute: 1_000_000,
  requestsPerDay: 1_500,
} as const;

/**
 * Simple rate limiter to avoid hitting API limits.
 * Adds delay between requests if needed.
 */
export const rateLimitedDelay = async (requestCount: number): Promise<void> => {
  if (requestCount % 10 === 0) {
    // Every 10 requests, wait 5 seconds
    debugLog('[RATE LIMIT] Pausing for 5s to avoid limits...');
    await new Promise(resolve => {
      // eslint-disable-next-line no-undef
      setTimeout(resolve, 5000);
    });
  }
};
