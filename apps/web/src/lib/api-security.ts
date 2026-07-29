import { createHash, timingSafeEqual } from 'node:crypto';

export type BearerAuthorization = 'authorized' | 'misconfigured' | 'unauthorized';

export const authorizeBearer = (
  authorizationHeader: string | null,
  configuredSecret: string | undefined,
): BearerAuthorization => {
  if (!configuredSecret) return 'misconfigured';

  const prefix = 'Bearer ';
  if (!authorizationHeader?.startsWith(prefix)) return 'unauthorized';

  const presentedSecret = authorizationHeader.slice(prefix.length);
  if (!presentedSecret) return 'unauthorized';

  const expectedDigest = createHash('sha256').update(configuredSecret).digest();
  const presentedDigest = createHash('sha256').update(presentedSecret).digest();

  return timingSafeEqual(expectedDigest, presentedDigest) ? 'authorized' : 'unauthorized';
};

interface FixedWindowGateOptions {
  readonly limit: number;
  readonly windowMs: number;
  readonly maxKeys?: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

export interface FixedWindowGate {
  readonly allow: (key: string, now?: number) => boolean;
}

export const createFixedWindowGate = ({
  limit,
  windowMs,
  maxKeys = 1_000,
}: FixedWindowGateOptions): FixedWindowGate => {
  const windows = new Map<string, WindowEntry>();

  return {
    allow: (key: string, now = Date.now()): boolean => {
      const current = windows.get(key);
      if (!current || current.resetAt <= now) {
        if (windows.size >= maxKeys) {
          for (const [existingKey, entry] of windows) {
            if (entry.resetAt <= now) windows.delete(existingKey);
          }
        }

        if (windows.size >= maxKeys) return false;
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }

      if (current.count >= limit) return false;
      current.count += 1;
      return true;
    },
  };
};
