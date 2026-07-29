import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('pre-commit hook', () => {
  const hook = readFileSync(resolve(process.cwd(), '../../.husky/pre-commit'), 'utf8');

  it('formats and restages only paths that were already staged', () => {
    expect(hook).toContain('git diff --cached --name-only');
    expect(hook).toContain('[ "$#" -eq 0 ] && exit 0');
    expect(hook).toContain('git add -- "$@"');
    expect(hook).not.toContain('git add -A');
    expect(hook).not.toMatch(/pnpm format(?:\s|$)/);
  });
});
