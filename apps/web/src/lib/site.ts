/**
 * Site identity and indexing policy.
 *
 * Single source of truth for the canonical origin and the crawl policy so that
 * `app/layout.tsx`, `app/robots.ts`, and `app/sitemap.ts` cannot drift apart.
 * Changing what the site advertises to crawlers and agents should be a change
 * to this file only.
 *
 * Policy (resolved 2026-07-28, see
 * `.humanlayer/tasks/gauntlet-website-specification-audit/`): index durable
 * public editorial and historical content only. Campaign forms, query-driven
 * league views, preview paths, the playground, and API handlers are excluded.
 */

/**
 * Canonical production origin. No custom domain is configured; this is the
 * same origin the server package treats as production
 * (`apps/server/src/lib/gauntlet-api-client.ts`). Reversing the decision is a
 * change to this constant or to `NEXT_PUBLIC_SITE_URL`, nothing else.
 */
export const PRODUCTION_ORIGIN = 'https://gauntlet-website.vercel.app';

const DEVELOPMENT_ORIGIN = 'http://localhost:3000';

export const SITE_NAME = 'The Gauntlet';

/**
 * Contact address published on the privacy notice (`/privacy`) and, by hand,
 * in `public/.well-known/security.txt` — that file is static and cannot
 * import this module, so it is the one place this constant does not reach.
 * Keep the two in step if this changes.
 */
export const CONTACT_EMAIL = 'dmethi@gmail.com';

const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

/**
 * `NEXT_PUBLIC_SITE_URL` wins so a preview deployment can advertise itself
 * rather than production. Without it, a production deployment falls back to the
 * canonical origin (never the per-deployment `VERCEL_URL` hash, which would put
 * a throwaway hostname in canonical tags), and every other environment falls
 * back to its own `VERCEL_URL` or localhost.
 */
const resolveOrigin = (): string => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  if (process.env.VERCEL_ENV === 'production') return PRODUCTION_ORIGIN;

  const deploymentUrl = process.env.VERCEL_URL?.trim();
  if (deploymentUrl) return stripTrailingSlash(`https://${deploymentUrl}`);

  return DEVELOPMENT_ORIGIN;
};

export const SITE_ORIGIN = resolveOrigin();

/** Absolute URL for a root-relative path, on the configured origin. */
export const absoluteUrl = (path: string): string =>
  `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Path prefixes crawlers are asked to skip. Each entry blocks the path itself
 * and everything beneath it.
 *
 * - `/api` — machine endpoints, never a landing page.
 * - `/playground` — development-only surface, `notFound()` in production.
 * - `/year-in-review` — campaign forms that collect personal data.
 * - `/competition/preview` — a fixed preview path, not durable content.
 * - `/live` — a live-only view that is empty outside game windows.
 * - `/league/*` — query-driven views; the same page renders different leagues
 *   from `?leagueId=`, so the bare URL is not a stable document.
 */
export const DISALLOWED_PATHS: readonly string[] = [
  '/api',
  '/playground',
  '/year-in-review',
  '/competition/preview',
  '/live',
  '/league/overview',
  '/league/draft',
  '/league/transactions',
];

export const isIndexable = (pathname: string): boolean =>
  !DISALLOWED_PATHS.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));

/**
 * Durable canonical routes with no dynamic segments. `sitemap.ts` adds the
 * dynamic ones (manager profiles, published recap reports) on top of this.
 */
export const CANONICAL_STATIC_PATHS: readonly string[] = [
  '/competition',
  '/competition/reports',
  '/archive/2025',
  '/hall-of-fame-enhanced',
  '/managers',
  '/privacy',
];

/**
 * Only the production deployment advertises itself. Preview deployments serve
 * the same content on a different origin, so indexing them would compete with
 * production for it.
 */
export const isProductionDeployment = (): boolean => process.env.VERCEL_ENV === 'production';

/** Root `metadata.robots` directive; preview and local builds opt out entirely. */
export const siteRobotsDirective = (): { index: boolean; follow: boolean } =>
  isProductionDeployment() ? { index: true, follow: true } : { index: false, follow: false };
