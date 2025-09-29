export const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';

export const DEFAULT_OPTIONS = {
  season: '2025', // Updated for current season
  weeks: Array.from({ length: 18 }, (_, i) => i + 1), // Weeks 1-18
  batchSize: 50,
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

export const TEST_LEAGUE_ID = '1263740549504962561'; // NFC league

export const API_RATE_LIMIT = {
  maxRequests: 1000,
  perMinute: 60 * 1000, // Convert to milliseconds
};

// Helper to convert any value to Prisma-compatible JSON
export function toPrismaJson(value: any): any {
  if (value === null || value === undefined) {
    return undefined;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => toPrismaJson(item));
  }

  // Handle objects
  if (typeof value === 'object') {
    const obj = JSON.parse(JSON.stringify(value));
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toPrismaJson(v)]));
  }

  // Handle primitives
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return undefined;
}
