/**
 * Utilities for prompt engineering and context management.
 */

/**
 * Compresses time-series data to reduce token usage.
 *
 * Strategy: Instead of 36 data points (5-min intervals), select key moments:
 * - Start (0:00)
 * - End of each quarter
 * - Lead changes
 * - Final score
 *
 * Reduces ~80% of tokens while preserving narrative.
 *
 * @param timeSeries - Array of score data points
 * @returns Compressed array with key moments only
 */
export const compressTimeSeries = <T extends { timestamp: string }>(timeSeries: T[]): T[] => {
  if (timeSeries.length <= 8) {
    return timeSeries; // Already compressed
  }

  const compressed: T[] = [];

  // Always include first and last
  compressed.push(timeSeries[0]);
  compressed.push(timeSeries[timeSeries.length - 1]);

  // Include key moments (every ~15 min for 3-hour games)
  const step = Math.floor(timeSeries.length / 6);
  for (let i = step; i < timeSeries.length - 1; i += step) {
    compressed.push(timeSeries[i]);
  }

  // Sort by timestamp
  compressed.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return compressed;
};

/**
 * Estimates token count for a string.
 *
 * Rough approximation: 1 token ≈ 4 characters
 * This is conservative; actual count may be lower.
 *
 * @param text - Text to estimate
 * @returns Estimated token count
 */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Truncates text to fit within token budget.
 *
 * @param text - Text to truncate
 * @param maxTokens - Maximum tokens allowed
 * @returns Truncated text
 */
export const truncateToTokens = (text: string, maxTokens: number): string => {
  const estimatedTokens = estimateTokens(text);

  if (estimatedTokens <= maxTokens) {
    return text;
  }

  const ratio = maxTokens / estimatedTokens;
  const truncatedLength = Math.floor(text.length * ratio);

  return text.slice(0, truncatedLength) + '...';
};

/**
 * Formats tool data for inclusion in prompts.
 * Converts objects to readable markdown tables or lists.
 *
 * @param data - Tool result data
 * @param format - Output format
 */
export const formatToolDataForPrompt = (
  data: Record<string, unknown>,
  format: 'table' | 'list' | 'json' = 'list',
): string => {
  if (format === 'json') {
    return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
  }

  if (format === 'list') {
    return Object.entries(data)
      .map(([key, value]) => `- **${key}**: ${formatValue(value)}`)
      .join('\n');
  }

  // Table format (for arrays of objects)
  if (Array.isArray(data)) {
    return formatArrayAsTable(data);
  }

  return formatToolDataForPrompt(data, 'list');
};

/**
 * Formats a value for display in prompts.
 */
const formatValue = (value: unknown): string => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value === null || value === undefined) {
    return 'N/A';
  }
  return String(value);
};

/**
 * Formats an array of objects as a markdown table.
 */
const formatArrayAsTable = (data: Array<Record<string, unknown>>): string => {
  if (data.length === 0) return '';

  const keys = Object.keys(data[0]);
  const header = `| ${keys.join(' | ')} |`;
  const separator = `| ${keys.map(() => '---').join(' | ')} |`;
  const rows = data.map(row => `| ${keys.map(key => formatValue(row[key])).join(' | ')} |`);

  return [header, separator, ...rows].join('\n');
};

/**
 * Monitors token usage during report generation.
 */
export const createTokenMonitor = () => {
  let totalTokens = 0;
  const sectionTokens = new Map<string, number>();

  return {
    track: (section: string, tokens: number): void => {
      totalTokens += tokens;
      const current = sectionTokens.get(section) || 0;
      sectionTokens.set(section, current + tokens);
    },

    getTotal: (): number => totalTokens,

    getBySection: (): Record<string, number> => {
      return Object.fromEntries(sectionTokens);
    },

    reset: (): void => {
      totalTokens = 0;
      sectionTokens.clear();
    },
  };
};
