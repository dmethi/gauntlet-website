/**
 * Shared constants and guidelines for prompt generation.
 */

/**
 * Token budget allocation for Gemini 1.5 Flash.
 *
 * Context window: 1M tokens
 * Max output: 8K tokens per request
 *
 * Strategy: Keep each section's context under 100K tokens to be safe.
 */
export const TOKEN_BUDGETS = {
  systemPrompt: 1000, // Base system prompt
  sectionPrompt: 500, // Section-specific instructions
  toolData: 50000, // Data from tool calls (largest allocation)
  conversationHistory: 10000, // Previous AI responses
  maxPerSection: 100000, // Total budget per section generation
} as const;

/**
 * Standard section prompt structure.
 * All section prompts should follow this template.
 */
export const SECTION_PROMPT_TEMPLATE = `## SECTION: {SECTION_NAME}

### Objective
{OBJECTIVE}

### Data Available
You have access to the following tools:
{TOOL_LIST}

### Output Requirements
{OUTPUT_REQUIREMENTS}

### Tone & Style
{TONE_GUIDELINES}

### Examples
{EXAMPLES}`;

/**
 * Common prompt guidelines to avoid repetition.
 */
export const COMMON_GUIDELINES = {
  accuracy: `⚠️ ACCURACY: Use ONLY data from tool calls. Never fabricate stats or player names.`,

  conciseness: `Keep it concise: Aim for 2-3 paragraphs unless more detail is warranted.`,

  engagement: `Make it engaging: Use vivid language and narrative structure.`,

  context: `Provide context: Compare to league averages, season trends, expectations.`,
} as const;

/**
 * Forbidden phrases (clichés to avoid).
 */
export const FORBIDDEN_PHRASES = [
  'leaving it all on the field',
  'gave 110%',
  'tale of two halves',
  'at the end of the day',
  'it is what it is',
  "the numbers don't lie",
] as const;
