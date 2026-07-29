import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

/**
 * Filesystem invariant for the global `prefers-reduced-motion` rule.
 *
 * Before this rule existed, only scattered `motion-reduce:` utilities honored
 * the OS preference, while the mobile drawer, Radix animations, and the
 * infinite `.hero-orb-*` animations in globals.css ignored it entirely.
 * Written in the style of design-tokens.test.ts and route-boundaries.test.ts:
 * a filesystem assertion that fails on any edit that removes the rule, since
 * globals.css itself has no render path to assert against.
 */

const GLOBALS_CSS = join(__dirname, '..', 'app', 'globals.css');
const CSS = readFileSync(GLOBALS_CSS, 'utf-8');

/** Extracts the brace-balanced body of the first `@media (prefers-reduced-motion: reduce)` block. */
const extractReducedMotionBlock = (css: string): string | null => {
  const marker = css.search(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  if (marker === -1) return null;

  const braceStart = css.indexOf('{', marker);
  if (braceStart === -1) return null;

  let depth = 0;
  for (let i = braceStart; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}') {
      depth--;
      if (depth === 0) return css.slice(braceStart, i + 1);
    }
  }
  return null;
};

describe('reduced motion: global prefers-reduced-motion rule', () => {
  it('globals.css declares a prefers-reduced-motion media block', () => {
    expect(CSS).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it('the block neutralises animation and transition durations globally', () => {
    const block = extractReducedMotionBlock(CSS);
    expect(block, 'prefers-reduced-motion block not found').not.toBeNull();
    expect(block).toMatch(/animation-duration/);
    expect(block).toMatch(/transition-duration/);
  });

  it('the block stops all three hero-orb drift animations', () => {
    const block = extractReducedMotionBlock(CSS);
    expect(block).not.toBeNull();
    for (const orbClass of ['.hero-orb-a', '.hero-orb-b', '.hero-orb-c']) {
      expect(block, `${orbClass} not covered by the reduced-motion block`).toContain(orbClass);
    }
  });
});
