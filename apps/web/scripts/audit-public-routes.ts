/**
 * Public Route Inventory (Website Specification Audit)
 *
 * Enumerates every App Router page and route handler under `src/app`,
 * classifies it, and prints a Markdown inventory table on stdout. The audit
 * artifact pastes that table rather than hand-transcribing the route tree, so
 * the inventory cannot silently drift from the source.
 *
 * Usage:
 *   pnpm --filter @gauntlet/web audit:public-routes
 *   pnpm --filter @gauntlet/web audit:public-routes -- --base-url=http://localhost:3000
 *
 * With `--base-url` the script also probes every concrete (non-dynamic,
 * non-internal) route and reports status, content type, and the cache and
 * security response headers. Phase 3 of the audit reuses that probe to capture
 * header evidence.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';
import { isIndexable } from '../src/lib/site';

type RouteKind = 'page' | 'api';
type Rendering = 'server' | 'client';
type Indexability = 'canonical' | 'noindex' | 'excluded';
type DataSensitivity = 'public-read' | 'accepts-personal-data' | 'internal';

type PublicRoute = {
  /** Router path, e.g. '/competition/reports/[season]/[slug]'. */
  path: string;
  kind: RouteKind;
  /** Repo-relative source path of the page or route handler. */
  file: string;
  rendering: Rendering;
  indexability: Indexability;
  dataSensitivity: DataSensitivity;
};

type ProbeResult =
  | {
      path: string;
      reached: true;
      status: number;
      contentType: string | null;
      headers: Record<string, string | null>;
    }
  | { path: string; reached: false; error: string };

/**
 * Routes that accept or return personal data. Evidence: the three Year in
 * Review form handlers persist name/email through `prisma/schema.prisma`, the
 * league-structure endpoint re-publishes submitter names, and the campaign page
 * hosts all three forms.
 */
const ACCEPTS_PERSONAL_DATA: readonly string[] = [
  '/year-in-review',
  '/api/year-in-review/return-confirmation',
  '/api/year-in-review/waitlist',
  '/api/year-in-review/proposals',
  '/api/year-in-review/league-structure',
];

/**
 * Routes that are publicly reachable but not intended for public use. These are
 * never probed: the cron handlers execute their jobs on GET.
 */
const INTERNAL: readonly string[] = [
  '/api/cron/live-odds',
  '/api/cron/recap-report',
  '/playground',
];

/** Response headers captured for the audit's caching concern. */
const CACHE_HEADERS: readonly string[] = ['cache-control', 'age', 'etag', 'x-vercel-cache'];

/** Response headers captured for the audit's security concern (Phase 3 evidence). */
const SECURITY_HEADERS: readonly string[] = [
  'x-content-type-options',
  'referrer-policy',
  'x-frame-options',
  'permissions-policy',
  'strict-transport-security',
  'content-security-policy',
];

const CAPTURED_HEADERS: readonly string[] = [...CACHE_HEADERS, ...SECURITY_HEADERS];

const PROBE_TIMEOUT_MS = 10_000;

const APPS_WEB_ROOT = join(__dirname, '..');
const APP_DIR = join(APPS_WEB_ROOT, 'src', 'app');

/** Directories Next never routes: colocated tests and private `_` folders. */
const isIgnoredSegment = (name: string): boolean =>
  name === 'node_modules' || name === '__tests__' || name.startsWith('_') || name.startsWith('.');

/** Route groups `(marketing)` and parallel slots `@modal` contribute no path segment. */
const contributesToPath = (name: string): boolean => !name.startsWith('(') && !name.startsWith('@');

const toRoutePath = (segments: string[]): string => {
  const kept = segments.filter(contributesToPath);
  return kept.length === 0 ? '/' : `/${kept.join('/')}`;
};

const findEntryFile = (dir: string, base: 'page' | 'route'): string | null => {
  for (const extension of ['.tsx', '.ts', '.jsx', '.js']) {
    const candidate = join(dir, `${base}${extension}`);
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      // Not present; try the next extension.
    }
  }
  return null;
};

const detectRendering = (file: string): Rendering =>
  /^\s*['"]use client['"]/m.test(readFileSync(file, 'utf-8')) ? 'client' : 'server';

const classifySensitivity = (path: string): DataSensitivity => {
  if (INTERNAL.includes(path)) return 'internal';
  if (ACCEPTS_PERSONAL_DATA.includes(path)) return 'accepts-personal-data';
  return 'public-read';
};

/**
 * Reads the shared indexing policy in `src/lib/site.ts`, so this column and
 * `robots.ts` cannot disagree. Route handlers are `excluded` regardless — they
 * serve no document to index — and a page the policy denies is `noindex`.
 */
const classifyIndexability = (kind: RouteKind, path: string): Indexability => {
  if (kind === 'api') return 'excluded';
  return isIndexable(path) ? 'canonical' : 'noindex';
};

export const enumerateRoutes = (appDir: string): PublicRoute[] => {
  const routes: PublicRoute[] = [];

  const walk = (dir: string, segments: string[]): void => {
    const page = findEntryFile(dir, 'page');
    const handler = findEntryFile(dir, 'route');
    const path = toRoutePath(segments);

    for (const [entry, kind] of [
      [page, 'page'],
      [handler, 'api'],
    ] as const) {
      if (!entry) continue;
      routes.push({
        path,
        kind,
        file: relative(APPS_WEB_ROOT, entry).split(sep).join('/'),
        rendering: detectRendering(entry),
        indexability: classifyIndexability(kind, path),
        dataSensitivity: classifySensitivity(path),
      });
    }

    for (const name of readdirSync(dir)) {
      if (isIgnoredSegment(name)) continue;
      const child = join(dir, name);
      if (!statSync(child).isDirectory()) continue;
      walk(child, [...segments, name]);
    }
  };

  walk(appDir, []);
  return routes.sort((a, b) => a.path.localeCompare(b.path) || a.kind.localeCompare(b.kind));
};

const isConcrete = (route: PublicRoute): boolean => !route.path.includes('[');

const isProbeable = (route: PublicRoute): boolean =>
  isConcrete(route) && route.dataSensitivity !== 'internal';

export const probe = async (baseUrl: string, routes: PublicRoute[]): Promise<ProbeResult[]> => {
  const results: ProbeResult[] = [];

  for (const route of routes.filter(isProbeable)) {
    const url = new URL(route.path, baseUrl).toString();
    try {
      const response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      });
      const headers: Record<string, string | null> = {};
      for (const name of CAPTURED_HEADERS) headers[name] = response.headers.get(name);
      results.push({
        path: route.path,
        reached: true,
        status: response.status,
        contentType: response.headers.get('content-type'),
        headers,
      });
    } catch (error) {
      results.push({
        path: route.path,
        reached: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
};

const parseBaseUrl = (argv: string[]): string | null => {
  const flag = argv.find(arg => arg.startsWith('--base-url='));
  return flag ? flag.slice('--base-url='.length) : null;
};

const printInventory = (routes: PublicRoute[]): void => {
  const pages = routes.filter(route => route.kind === 'page');
  const handlers = routes.filter(route => route.kind === 'api');

  console.log('## Public surface inventory\n');
  console.log(`Pages: ${pages.length} · Route handlers: ${handlers.length}\n`);
  console.log('| Route | Kind | Rendering | Indexability | Data sensitivity | Source |');
  console.log('| --- | --- | --- | --- | --- | --- |');
  for (const route of routes) {
    console.log(
      `| \`${route.path}\` | ${route.kind} | ${route.rendering} | ${route.indexability} | ` +
        `${route.dataSensitivity} | \`apps/web/${route.file}\` |`,
    );
  }
  console.log('');
};

const printProbeResults = (
  baseUrl: string,
  routes: PublicRoute[],
  results: ProbeResult[],
): void => {
  console.log(`## Response evidence (${baseUrl})\n`);
  console.log('| Route | Status | Content-Type | Cache-Control | Security headers |');
  console.log('| --- | --- | --- | --- | --- |');

  for (const result of results) {
    if (!result.reached) {
      console.log(`| \`${result.path}\` | unreachable | — | — | ${result.error} |`);
      continue;
    }
    const security = SECURITY_HEADERS.map(name =>
      result.headers[name] ? `${name}: ${result.headers[name]}` : null,
    ).filter((value): value is string => value !== null);

    console.log(
      `| \`${result.path}\` | ${result.status} | ${result.contentType ?? '—'} | ` +
        `${result.headers['cache-control'] ?? '—'} | ${security.length ? security.join('<br>') : 'none'} |`,
    );
  }

  const skipped = routes.filter(route => !isProbeable(route));
  console.log(`\nNot probed (${skipped.length}): dynamic segments and internal routes.\n`);
};

const main = async (): Promise<void> => {
  const routes = enumerateRoutes(APP_DIR);
  printInventory(routes);

  const baseUrl = parseBaseUrl(process.argv.slice(2));
  if (!baseUrl) {
    console.log('Pass --base-url=http://localhost:3000 against a running server to add');
    console.log('status codes and response headers to this report.');
    return;
  }

  const results = await probe(baseUrl, routes);
  printProbeResults(baseUrl, routes, results);
};

main().catch(error => {
  console.error('[audit:public-routes] failed:', error);
  process.exitCode = 1;
});
