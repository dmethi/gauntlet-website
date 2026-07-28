import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

/**
 * Guards the Stats Hub feature surfaces against raw Tailwind palette classes
 * (bg-blue-100, text-red-600, ...) reappearing. Those classes have no dark-mode
 * variant in this codebase and silently break in the "Modern War Room" dark theme.
 *
 * This is a backup enforcement layer independent of the ESLint `no-restricted-syntax`
 * rule in apps/web/eslint.config.mjs (same regex) - it catches regressions even if
 * lint is skipped locally. Use the helpers in src/lib/stat-colors.ts, or semantic
 * tokens directly (text-success, text-destructive, text-primary, text-secondary,
 * bg-muted, ...). See docs/solutions/patterns/critical-patterns.md.
 */

const SCOPED_DIRS = [
  'src/features/waiver-analysis',
  'src/features/transactions',
  'src/features/start-sit',
  'src/app/hall-of-fame-enhanced',
];

const SCOPED_FILES = [
  'src/components/stats/StartSitEfficiencyTab.tsx',
  'src/app/stats/components/ManagerRankings.tsx',
  'src/app/stats/components/ManagerDetailModal.tsx',
];

const RAW_COLOR_PATTERN =
  /(^|\s)(bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|accent|caret|shadow)-(red|blue|green|purple|orange|yellow|pink|indigo|cyan|teal|slate|gray|grey|zinc|neutral|stone|lime|emerald|sky|violet|fuchsia|rose|amber)-[0-9]{2,3}(\s|$)/;

const APPS_WEB_ROOT = join(__dirname, '..', '..');

const walk = (dir: string): string[] => {
  const entries = readdirSync(dir);
  return entries.flatMap(entry => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === '__tests__') return [];
      return walk(fullPath);
    }
    if (/\.(tsx?|jsx?)$/.test(entry) && !/\.test\.[jt]sx?$/.test(entry)) {
      return [fullPath];
    }
    return [];
  });
};

const findViolationsInFiles = (
  files: string[],
): Array<{ file: string; line: number; text: string }> => {
  const violations: Array<{ file: string; line: number; text: string }> = [];
  for (const file of files) {
    const lines = readFileSync(file, 'utf-8').split('\n');
    lines.forEach((line, index) => {
      if (RAW_COLOR_PATTERN.test(line)) {
        violations.push({
          file: file.replace(`${APPS_WEB_ROOT}/`, ''),
          line: index + 1,
          text: line.trim(),
        });
      }
    });
  }
  return violations;
};

const assertNoViolations = (
  label: string,
  violations: Array<{ file: string; line: number; text: string }>,
): void => {
  if (violations.length > 0) {
    const details = violations.map(v => `  ${v.file}:${v.line}\n    ${v.text}`).join('\n');
    throw new Error(
      `Found raw Tailwind palette classes in ${label}. ` +
        `Use src/lib/stat-colors.ts helpers or semantic tokens instead ` +
        `(see docs/solutions/patterns/critical-patterns.md):\n${details}`,
    );
  }

  expect(violations).toHaveLength(0);
};

describe('design tokens: no raw Tailwind palette colors in Stats Hub surfaces', () => {
  it.each(SCOPED_DIRS)('%s uses semantic tokens only', dirRelative => {
    const dir = join(APPS_WEB_ROOT, dirRelative);
    assertNoViolations(dirRelative, findViolationsInFiles(walk(dir)));
  });

  it.each(SCOPED_FILES)('%s uses semantic tokens only', fileRelative => {
    const file = join(APPS_WEB_ROOT, fileRelative);
    assertNoViolations(fileRelative, findViolationsInFiles([file]));
  });
});
