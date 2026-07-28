import type { MetadataRoute } from 'next';
import { absoluteUrl, CANONICAL_STATIC_PATHS, isIndexable } from '@/lib/site';
import { listManagers } from '@/lib/leagues/manager-history';
import { getAvailableReports } from '@/lib/reports/recap/utils/report-loader';

/**
 * `/sitemap.xml`.
 *
 * Advertises only the durable content set from `@/lib/site`: the competition
 * landing page, the reports index, the fixed archive, Hall of Fame, the manager
 * browse index, every manager profile, and every published recap report.
 *
 * Both dynamic sources are the ones the pages themselves use — `listManagers`
 * backs `/managers`, `getAvailableReports` backs `generateStaticParams` on the
 * recap route — so the sitemap cannot advertise a URL the app will not serve.
 */
export const revalidate = 3600;

/**
 * Degrade to a smaller sitemap rather than failing the build. `listManagers`
 * reaches Sleeper over the network, and an outage during a deploy must not
 * take the whole site with it.
 */
const collect = async <T>(label: string, load: () => Promise<T[]>): Promise<T[]> => {
  try {
    return await load();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[sitemap] Skipping ${label}:`, error);
    return [];
  }
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = CANONICAL_STATIC_PATHS.map(path => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/competition' ? 1 : 0.8,
  }));

  const reports = await collect('recap reports', getAvailableReports);
  const reportEntries: MetadataRoute.Sitemap = reports.map(report => ({
    url: absoluteUrl(report.href),
    lastModified: new Date(report.date),
    changeFrequency: 'yearly',
    priority: 0.7,
  }));

  const managers = await collect('manager profiles', listManagers);
  const managerEntries: MetadataRoute.Sitemap = managers.map(manager => ({
    url: absoluteUrl(`/managers/${manager.ownerId}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...reportEntries, ...managerEntries].filter(entry =>
    isIndexable(new URL(entry.url).pathname),
  );
};

export default sitemap;
