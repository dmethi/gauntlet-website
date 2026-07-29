import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requireCronAuth } from './cron-auth';

/**
 * The observable contract of the guard is which requests it lets through, so
 * every case here is stated as a status code rather than as an internal branch.
 *
 * The first test is the regression this guard exists for: the previous
 * `if (cronSecret && ...)` check let *any* caller execute the job when
 * CRON_SECRET was unset.
 */

const CRON_URL = 'https://example.test/api/cron/live-odds';

const requestWith = (authorization?: string): NextRequest =>
  new NextRequest(CRON_URL, {
    headers: authorization ? { authorization } : {},
  });

beforeEach(() => {
  // The 503 path logs the misconfiguration; keep it out of the test output.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('requireCronAuth', () => {
  it('refuses to run the job when CRON_SECRET is not configured', () => {
    vi.stubEnv('CRON_SECRET', undefined);

    expect(requireCronAuth(requestWith('Bearer anything'))?.status).toBe(503);
  });

  it('treats a blank CRON_SECRET as unconfigured', () => {
    vi.stubEnv('CRON_SECRET', '   ');

    expect(requireCronAuth(requestWith('Bearer    '))?.status).toBe(503);
  });

  it('rejects a wrong bearer token', () => {
    vi.stubEnv('CRON_SECRET', 'correct-secret');

    expect(requireCronAuth(requestWith('Bearer wrong-secret'))?.status).toBe(401);
  });

  it('rejects a request with no authorization header', () => {
    vi.stubEnv('CRON_SECRET', 'correct-secret');

    expect(requireCronAuth(requestWith())?.status).toBe(401);
  });

  it('authorizes a matching bearer token', () => {
    vi.stubEnv('CRON_SECRET', 'correct-secret');

    expect(requireCronAuth(requestWith('Bearer correct-secret'))).toBeNull();
  });

  it('does not leak the configured secret in the rejection body', async () => {
    vi.stubEnv('CRON_SECRET', 'correct-secret');

    const response = requireCronAuth(requestWith('Bearer wrong-secret'));

    expect(await response?.text()).not.toContain('correct-secret');
  });
});
