import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, relative, sep } from 'path';
import { describe, expect, it } from 'vitest';

/**
 * Filesystem invariants for App Router failure boundaries.
 *
 * The regression these guard against: the recap report route called
 * `notFound()` from `competition/reports/[season]/[slug]`, while its
 * `not-found.tsx`, `error.tsx`, and `loading.tsx` sat under a sibling
 * `week-[week]` directory. `week-[week]` is not valid Next dynamic-segment
 * syntax and had no `page.tsx`, so Next never matched it and the active route
 * fell through to the framework's default error screens.
 *
 * These are filesystem assertions in the style of design-tokens.test.ts: they
 * catch the violation on any edit, not only on covered render paths.
 */

const APP_DIR = join(__dirname, '..', 'app');

const BOUNDARY_FILES = ['not-found.tsx', 'error.tsx', 'loading.tsx'] as const;

/**
 * Segments that deliberately rely on the root `not-found.tsx` instead of a
 * sibling one. `/playground` is a development-only surface that calls
 * `notFound()` in production, and it bypasses the app shell anyway
 * (client-layout.tsx), so a bespoke 404 there would render identically.
 */
const ROOT_BOUNDARY_ONLY = new Set(['playground']);

/** Directories Next never routes: colocated tests and private `_` folders. */
const isIgnoredSegment = (name: string): boolean =>
  name === 'node_modules' || name === '__tests__' || name.startsWith('_') || name.startsWith('.');

const listSegments = (dir: string): string[] => {
  const children = readdirSync(dir).filter(name => {
    if (isIgnoredSegment(name)) return false;
    return statSync(join(dir, name)).isDirectory();
  });
  return [dir, ...children.flatMap(name => listSegments(join(dir, name)))];
};

const SEGMENTS = listSegments(APP_DIR);

const toRelative = (dir: string): string => relative(APP_DIR, dir).split(sep).join('/') || '.';

const hasPage = (dir: string): boolean => existsSync(join(dir, 'page.tsx'));

const hasPageInSubtree = (dir: string): boolean =>
  SEGMENTS.filter(segment => segment === dir || segment.startsWith(dir + sep)).some(hasPage);

describe('App Router failure boundaries', () => {
  it('the app root owns a not-found and an error boundary', () => {
    expect(existsSync(join(APP_DIR, 'not-found.tsx'))).toBe(true);
    expect(existsSync(join(APP_DIR, 'error.tsx'))).toBe(true);
  });

  it('every page that calls notFound() has a sibling not-found.tsx', () => {
    const missing = SEGMENTS.filter(hasPage)
      .filter(dir => readFileSync(join(dir, 'page.tsx'), 'utf-8').includes('notFound()'))
      .filter(dir => !existsSync(join(dir, 'not-found.tsx')))
      .map(toRelative)
      .filter(segment => !ROOT_BOUNDARY_ONLY.has(segment));

    expect(missing, `segments calling notFound() without a sibling not-found.tsx`).toEqual([]);
  });

  it('every dynamic segment directory uses valid Next syntax', () => {
    const invalid = SEGMENTS.map(toRelative)
      .filter(segment => segment !== '.')
      .map(segment => segment.split('/').pop() as string)
      .filter(name => name.includes('[') || name.includes(']'))
      .filter(name => !/^(\[\w+\]|\[\.\.\.\w+\]|\[\[\.\.\.\w+\]\])$/.test(name));

    expect(invalid, 'directory names Next will treat as literal path segments').toEqual([]);
  });

  it('no boundary file sits in a segment Next cannot render', () => {
    const inert = SEGMENTS.filter(dir => BOUNDARY_FILES.some(file => existsSync(join(dir, file))))
      .filter(dir => !hasPageInSubtree(dir))
      .map(toRelative);

    expect(inert, 'boundary files in a segment with no page in its subtree').toEqual([]);
  });
});
