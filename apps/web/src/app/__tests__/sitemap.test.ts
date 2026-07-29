import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DISALLOWED_PATHS, SITE_ORIGIN } from '@/lib/site';

const getAvailableReports = vi.fn();
const listManagers = vi.fn();

vi.mock('@/lib/reports/recap/utils/report-loader', () => ({
  getAvailableReports: () => getAvailableReports(),
}));

vi.mock('@/lib/leagues/manager-history', () => ({
  listManagers: () => listManagers(),
}));

const sitemap = async () => (await import('../sitemap')).default();

const report = {
  season: 2025,
  week: 5,
  title: 'Week 5 Report — 2025',
  href: '/competition/reports/2025/week-5',
  date: '2025-10-09T12:00:00.000Z',
  tags: [],
  status: 'success' as const,
};

const manager = {
  ownerId: '123456789',
  displayName: 'Test Manager',
  avatarUrl: null,
  seasonsPlayed: 1,
  firstSeason: '2025',
  lastSeason: '2025',
};

const pathnames = (entries: { url: string }[]): string[] =>
  entries.map(entry => new URL(entry.url).pathname);

beforeEach(() => {
  getAvailableReports.mockReset().mockResolvedValue([report]);
  listManagers.mockReset().mockResolvedValue([manager]);
});

describe('sitemap.xml', () => {
  it('emits absolute URLs on the configured origin', async () => {
    const entries = await sitemap();

    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.url.startsWith(`${SITE_ORIGIN}/`)).toBe(true);
    }
  });

  it('includes the durable content routes', async () => {
    const paths = pathnames(await sitemap());

    expect(paths).toContain('/competition');
    expect(paths).toContain('/competition/reports');
    expect(paths).toContain('/archive/2025');
    expect(paths).toContain('/hall-of-fame-enhanced');
    expect(paths).toContain('/managers');
    expect(paths).toContain('/privacy');
  });

  it('lists every published recap report', async () => {
    const entries = await sitemap();
    const entry = entries.find(e => new URL(e.url).pathname === report.href);

    expect(entry).toBeDefined();
    expect(entry?.lastModified).toEqual(new Date(report.date));
  });

  it('lists every manager profile', async () => {
    expect(pathnames(await sitemap())).toContain(`/managers/${manager.ownerId}`);
  });

  it('never advertises a path the indexing policy excludes', async () => {
    // A data source that hands the sitemap an excluded URL must not be able to
    // publish it — the policy in `@/lib/site` is the last word, not the loader.
    getAvailableReports.mockResolvedValue([
      report,
      { ...report, href: '/competition/preview/2025/week-3' },
    ]);

    const paths = pathnames(await sitemap());

    for (const path of paths) {
      for (const excluded of DISALLOWED_PATHS) {
        expect(path === excluded || path.startsWith(`${excluded}/`)).toBe(false);
      }
    }
  });

  it('degrades to the static routes when a data source fails', async () => {
    listManagers.mockRejectedValue(new Error('Sleeper unavailable'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const paths = pathnames(await sitemap());

    expect(paths).toContain('/competition');
    expect(paths).not.toContain(`/managers/${manager.ownerId}`);
  });
});
