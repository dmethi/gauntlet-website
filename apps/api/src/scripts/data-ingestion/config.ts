import { Prisma } from '../../generated/prisma';
import { IngestionOptions } from './types';

export const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';

export const DEFAULT_OPTIONS: Partial<IngestionOptions> = {
  season: '2023',
  weeks: Array.from({ length: 18 }, (_, i) => i + 1), // Weeks 1-18
  batchSize: 50,
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

export const TEST_LEAGUE_ID = '997670420490801152';

export const API_RATE_LIMIT = {
  maxRequests: 1000,
  perMinute: 60 * 1000, // Convert to milliseconds
};

// Helper to convert any value to Prisma-compatible JSON
export function toPrismaJson<T>(value: T | null): Prisma.InputJsonValue | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => toPrismaJson(item)) as Prisma.InputJsonValue;
  }

  // Handle objects
  if (typeof value === 'object') {
    const obj = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, toPrismaJson(v)])
    ) as Prisma.InputJsonValue;
  }

  // Handle primitives
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value as Prisma.InputJsonValue;
  }

  return undefined;
}
