import type { MetadataRoute } from 'next';
import { absoluteUrl, DISALLOWED_PATHS, isProductionDeployment, SITE_ORIGIN } from '@/lib/site';

/**
 * `/robots.txt`.
 *
 * Generated rather than served from `public/robots.txt` so the deny list stays
 * the same list `sitemap.ts` and the audit script read from `@/lib/site`.
 *
 * Non-production deployments block everything: a preview serves the same
 * content on a different origin, and an indexed preview competes with
 * production for it.
 */
const robots = (): MetadataRoute.Robots => {
  if (!isProductionDeployment()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...DISALLOWED_PATHS],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_ORIGIN,
  };
};

export default robots;
