import { afterEach, describe, expect, it, vi } from 'vitest';
import robots from '../robots';
import { DISALLOWED_PATHS } from '@/lib/site';

/**
 * The observable contract of `robots.ts` is the rule set it emits, not its
 * shape: every path the indexing policy excludes must be denied, durable
 * content must not be, and a non-production deployment must deny everything.
 */

const asArray = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const rulesOf = (result: ReturnType<typeof robots>) =>
  Array.isArray(result.rules) ? result.rules[0] : result.rules;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('robots.txt in production', () => {
  const production = () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    return robots();
  };

  it.each(DISALLOWED_PATHS)('disallows %s', path => {
    expect(asArray(rulesOf(production())?.disallow)).toContain(path);
  });

  it('does not disallow the durable content routes', () => {
    const disallow = asArray(rulesOf(production())?.disallow);

    expect(disallow).not.toContain('/competition');
    expect(disallow).not.toContain('/managers');
    expect(disallow).not.toContain('/competition/reports');
  });

  it('allows the site root and points at the sitemap', () => {
    const result = production();

    expect(asArray(rulesOf(result)?.allow)).toContain('/');
    expect(result.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});

describe('robots.txt outside production', () => {
  it('denies everything so a preview does not compete with production', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    const result = robots();

    expect(asArray(rulesOf(result)?.disallow)).toEqual(['/']);
    expect(asArray(rulesOf(result)?.allow)).toEqual([]);
    expect(result.sitemap).toBeUndefined();
  });
});
