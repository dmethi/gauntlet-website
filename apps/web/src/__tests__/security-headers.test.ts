import { afterEach, describe, expect, it, vi } from 'vitest';
import nextConfig from '../../next.config.js';

/**
 * The baseline security posture is configuration, not code, so nothing in the
 * application would fail if `headers()` were deleted or an entry silently
 * dropped. These assertions are the only thing standing between that and a
 * quiet regression.
 *
 * `next.config.js` is CommonJS and is imported for its `headers()` function.
 * The function reads `process.env` when it is called rather than at module
 * load, which is what lets the HSTS branch be tested both ways.
 */

type HeaderEntry = { key: string; value: string };

const headersFor = async (): Promise<HeaderEntry[]> => {
  const rules = await nextConfig.headers();

  expect(rules, 'headers() should declare exactly one catch-all rule').toHaveLength(1);
  expect(rules[0].source).toBe('/:path*');

  return rules[0].headers;
};

const valueOf = (headers: HeaderEntry[], key: string): string | undefined =>
  headers.find(header => header.key.toLowerCase() === key.toLowerCase())?.value;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('baseline security headers', () => {
  it.each([
    ['X-Content-Type-Options', 'nosniff'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['X-Frame-Options', 'SAMEORIGIN'],
    ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
  ])('applies %s to every route', async (key, value) => {
    expect(valueOf(await headersFor(), key)).toBe(value);
  });

  it('does not ship a Content-Security-Policy', async () => {
    // Deliberate: CSP needs a report-only rollout measured against production
    // before it can be enforced. Asserted so it is a decision, not an omission.
    const headers = await headersFor();

    expect(valueOf(headers, 'Content-Security-Policy')).toBeUndefined();
    expect(valueOf(headers, 'Content-Security-Policy-Report-Only')).toBeUndefined();
  });
});

describe('framework disclosure', () => {
  it('suppresses the X-Powered-By header', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});

describe('Strict-Transport-Security', () => {
  it('is declared on a deployed environment', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');

    expect(valueOf(await headersFor(), 'Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains',
    );
  });

  it('is omitted locally so localhost is not pinned to HTTPS', async () => {
    vi.stubEnv('VERCEL_ENV', undefined);

    expect(valueOf(await headersFor(), 'Strict-Transport-Security')).toBeUndefined();
  });
});
